import { expect, test } from 'playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

test('captures a personal phrase and runs a blind recall', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Practice the phrases you want to say.' })).toBeVisible();
  await page.getByRole('link', { name: /capture your first phrase/i }).click();
  await page.getByLabel(/word or phrase/i).fill('run into');
  await page.getByLabel(/your sentence/i).fill('I ran into my neighbour at the market.');
  await page.getByLabel(/context tag/i).fill('neighbours');
  await page.getByRole('button', { name: /save to my loop/i }).click();
  await expect(page.getByRole('heading', { name: 'Words that sound like you' })).toBeVisible();
  expect((await page.getByRole('button', { name: 'Delete' }).boundingBox())!.height).toBeGreaterThanOrEqual(44);
  await page.evaluate(async () => {
    const request = indexedDB.open('personal-vocab-loop');
    await new Promise<void>((resolve, reject) => { request.onsuccess = () => resolve(); request.onerror = () => reject(request.error); });
    const db = request.result; const tx = db.transaction('phrases', 'readwrite'); const store = tx.objectStore('phrases');
    const all = store.getAll(); await new Promise<void>((resolve) => { all.onsuccess = () => resolve(); });
    all.result.forEach((item: { nextReview: string }) => { item.nextReview = new Date(0).toISOString(); store.put(item); });
    await new Promise<void>((resolve, reject) => { tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); });
  });
  await page.getByRole('link', { name: 'Loop', exact: true }).click();
  await expect(page.getByText('What was your personal sentence?')).toBeVisible();
  await page.getByRole('button', { name: /reveal my sentence/i }).click();
  await expect(page.getByText('I ran into my neighbour at the market.')).toBeVisible();
});

test('app shell remains available offline after initial visit', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Practice the phrases you want to say.' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  const shellIsCached = await page.evaluate(async () => {
    const script = document.querySelector<HTMLScriptElement>('script[type="module"]')?.src;
    return Boolean(script && await caches.match(script));
  });
  expect(shellIsCached).toBe(true);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Practice the phrases you want to say.' })).toBeVisible();
});

test('empty state has no serious accessibility violations', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact || ''))).toEqual([]);
});

test('rejects whitespace-only required phrase values after trimming', async ({ page }) => {
  await page.goto('/capture');
  await page.getByLabel(/word or phrase/i).fill('   ');
  await page.getByLabel(/your sentence/i).fill(' \n  ');
  await page.getByRole('button', { name: /save to my loop/i }).click();

  await expect(page).toHaveURL(/\/capture$/);
  await expect(page.getByLabel(/word or phrase/i)).toBeFocused();
  expect(await page.getByLabel(/word or phrase/i).evaluate((input: HTMLInputElement) => input.validationMessage)).toBe('Enter a word or phrase, not only spaces.');
  expect(await page.evaluate(async () => {
    const request = indexedDB.open('personal-vocab-loop');
    const db = await new Promise<IDBDatabase>((resolve, reject) => { request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
    const count = db.transaction('phrases').objectStore('phrases').count();
    return new Promise<number>((resolve, reject) => { count.onsuccess = () => resolve(count.result); count.onerror = () => reject(count.error); });
  })).toBe(0);
});

test('settings reveal encrypted forms only after their triggering action', async ({ page }) => {
  await page.goto('/settings');
  await expect(page.locator('#encrypt-form')).toBeHidden();
  await expect(page.locator('#decrypt-form')).toBeHidden();
  await page.getByRole('button', { name: 'Export encrypted backup' }).click();
  await expect(page.locator('#encrypt-form')).toBeVisible();
  await expect(page.getByLabel(/passphrase \(8\+ characters\)/i)).toBeFocused();
  await page.locator('#import-file').setInputFiles({
    name: 'encrypted.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{"format":"personal-vocab-loop-encrypted","version":1,"salt":"AA==","iv":"AA==","data":"AA=="}')
  });
  await expect(page.locator('#decrypt-form')).toBeVisible();
});

test('390px layout keeps the job and action visible with square artwork and accessible targets', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const hero = await page.locator('.hero img').boundingBox();
  const heading = await page.getByRole('heading', { name: 'Practice the phrases you want to say.' }).boundingBox();
  const action = await page.getByRole('link', { name: /try it with sample data/i }).boundingBox();
  expect(hero).not.toBeNull();
  expect(Math.abs(hero!.width - hero!.height)).toBeLessThanOrEqual(1);
  expect(heading!.y + heading!.height).toBeLessThan(844);
  expect(action!.y + action!.height).toBeLessThan(844);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);

  const targetSelectors = ['.brand', 'nav a', 'footer a'];
  for (const selector of targetSelectors) {
    const boxes = await page.locator(selector).evaluateAll((nodes) => nodes.map((node) => {
      const box = node.getBoundingClientRect();
      return { width: box.width, height: box.height };
    }));
    for (const box of boxes) {
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  }
  const gaps = await page.locator('nav a').evaluateAll((nodes) => nodes.slice(1).map((node, index) => node.getBoundingClientRect().left - nodes[index].getBoundingClientRect().right));
  gaps.forEach((gap) => expect(gap).toBeGreaterThanOrEqual(8));

  await page.getByRole('link', { name: 'Settings' }).click();
  for (const box of await page.locator('.theme').evaluateAll((nodes) => nodes.map((node) => ({ height: node.getBoundingClientRect().height })))) {
    expect(box.height).toBeGreaterThanOrEqual(44);
  }
});

test('static host policy hardens responses and separates mutable from immutable files', () => {
  const config = JSON.parse(readFileSync('public/staticwebapp.config.json', 'utf8')) as {
    mimeTypes: Record<string, string>;
    globalHeaders: Record<string, string>;
    routes: Array<{ route: string; headers: Record<string, string> }>;
    responseOverrides: Record<string, { rewrite: string }>;
  };
  expect(config.mimeTypes['.webmanifest']).toBe('application/manifest+json');
  expect(config.globalHeaders['Content-Security-Policy']).toContain("frame-ancestors 'none'");
  expect(config.globalHeaders['Permissions-Policy']).toContain('microphone=(self)');
  expect(config.globalHeaders['Cross-Origin-Opener-Policy']).toBe('same-origin');
  expect(config.globalHeaders['Cross-Origin-Resource-Policy']).toBe('same-origin');
  expect(config.globalHeaders['X-Frame-Options']).toBe('DENY');
  expect(config.routes.find(({ route }) => route === '/assets/*')?.headers['Cache-Control']).toContain('immutable');
  expect(config.routes.find(({ route }) => route === '/sw.js')?.headers['Cache-Control']).toContain('no-store');
  expect(config.responseOverrides['404'].rewrite).toBe('/404/index.html');
});

test('malformed imports explain the problem and the recovery step', async ({ page }) => {
  await page.goto('/settings');
  await page.locator('#import-file').setInputFiles({ name: 'broken.json', mimeType: 'application/json', buffer: Buffer.from('{not json') });
  await expect(page.getByRole('alert')).toHaveText('This backup file is invalid. Choose a JSON backup exported by Personal Vocab Loop and try again.');
});

test('unknown paths return the styled 404 document', async ({ page }) => {
  const response = await page.goto('/not-a-real-route');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'This phrase has left the loop.' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open your library' })).toBeVisible();
});

test('view navigation uses real URLs, restores focus, updates metadata, and announces the page', async ({ page }) => {
  await page.goto('/');
  const settings = page.getByRole('link', { name: 'Settings' });
  await settings.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/settings$/);
  await expect(page).toHaveTitle('Settings — Personal Vocab Loop');
  await expect(page.getByRole('heading', { name: 'Keep your loop portable.' })).toBeFocused();
  await expect(page.locator('#route-status')).toHaveText('Keep your loop portable. loaded.');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://personal-vocab-loop.sociobot.in/settings');
  await page.goBack();
  await expect(page).toHaveURL('http://127.0.0.1:4173/');
  await expect(page).toHaveTitle('Personal Vocab Loop — practice personal phrases');
  await expect(page.getByRole('heading', { name: 'Practice the phrases you want to say.' })).toBeFocused();
});

test('clearing a demo notice does not replace the focused route heading', async ({ page }) => {
  await page.goto('/demo/settings');
  await page.getByRole('button', { name: 'Reset demo' }).click();
  const heading = page.getByRole('heading', { name: 'Words that sound like you' });
  await expect(heading).toBeFocused();
  await expect(page.locator('#notice-status')).toHaveText('Sample phrases reset.');
  await page.waitForTimeout(4_300);
  await expect(heading).toBeFocused();
  await expect(page.locator('#notice-status')).toHaveText('');
});

test('wrong encrypted-backup passphrase keeps an operable retry in place', async ({ page }) => {
  await page.goto('/demo/settings');
  await page.getByRole('button', { name: 'Export encrypted backup' }).click();
  await page.getByLabel(/passphrase \(8\+ characters\)/i).fill('correct horse battery');
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download encrypted backup' }).click();
  const stream = await (await downloadEvent).createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  await page.locator('#import-file').setInputFiles({ name: 'encrypted.json', mimeType: 'application/json', buffer: Buffer.concat(chunks) });
  await page.getByLabel('Passphrase for encrypted backup').fill('wrong passphrase');
  await page.getByRole('button', { name: 'Unlock and import' }).click();
  await expect(page.getByRole('alert')).toContainText('Re-enter the passphrase and try again');
  await expect(page.locator('#decrypt-form')).toBeVisible();
  await expect(page.getByLabel('Passphrase for encrypted backup')).toBeFocused();
  await page.getByLabel('Passphrase for encrypted backup').fill('correct horse battery');
  await page.getByRole('button', { name: 'Unlock and import' }).click();
  await expect(page.getByRole('status')).toContainText('Imported 3 phrases');
});

test('legal, not-found, and demo routes carry the standard skeleton and metadata', async ({ page }) => {
  for (const route of ['/privacy/', '/terms/', '/not-a-real-route']) {
    await page.goto(route);
    await expect(page.getByRole('link', { name: 'Skip to main content' })).toHaveCount(1);
    await expect(page.locator('header nav')).toHaveCount(1);
    await expect(page.locator('main h1')).toHaveCount(1);
    await expect(page.locator('footer')).toContainText('Built by Param Factory');
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.+/);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /Personal Vocab Loop/);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute('href', '/apple-touch-icon.png');
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
  }
  await page.goto('/demo');
  await expect(page).toHaveTitle('Demo — Personal Vocab Loop');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://personal-vocab-loop.sociobot.in/demo');
  await expect(page.locator('footer')).toContainText('v1.0.1');
  await expect(page.locator('footer')).toContainText('Built by Param Factory');
});

test('production shell stays well below static budgets and avoids first-load legal precaching', () => {
  const assets = readdirSync('dist/assets');
  const script = readFileSync(`dist/assets/${assets.find((name) => name.endsWith('.js'))}`);
  const stylesheet = readFileSync(`dist/assets/${assets.find((name) => name.endsWith('.css'))}`);
  expect(gzipSync(script).byteLength).toBeLessThanOrEqual(50 * 1024);
  expect(gzipSync(stylesheet).byteLength).toBeLessThanOrEqual(50 * 1024);
  expect(statSync('dist/voice-orbit.webp').size).toBeLessThanOrEqual(300 * 1024);
  const worker = readFileSync('dist/sw.js', 'utf8');
  expect(worker).not.toContain('"/privacy/"');
  expect(worker).not.toContain('"/terms/"');
  expect((worker.match(/"\/assets\//g) || []).length).toBeLessThanOrEqual(2);
});

test('keyboard, reduced motion, privacy, semantics, and both themes pass release smoke checks', async ({ page }) => {
  const outbound = new Set<string>();
  const errors: string[] = [];
  page.on('request', (request) => outbound.add(new URL(request.url()).origin));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (caught) => errors.push(caught.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');

  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('main')).toHaveCount(1);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('img:not([alt])')).toHaveCount(0);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  expect(['', 'none']).toContain(await page.locator('.hero img').evaluate((image) => getComputedStyle(image).animationName));

  await page.keyboard.press('n');
  await expect(page).toHaveURL(/\/capture$/);
  await page.getByRole('link', { name: /back to library/i }).click();
  expect([...outbound]).toEqual(['http://127.0.0.1:4173']);
  expect(errors).toEqual([]);
});

for (const theme of ['dark', 'light']) {
  test(`settings has no serious accessibility violations in ${theme} theme`, async ({ page }) => {
    await page.addInitScript((value) => localStorage.setItem('vocab-loop-theme', value), theme);
    await page.goto('/settings');
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact || ''))).toEqual([]);
  });
}
