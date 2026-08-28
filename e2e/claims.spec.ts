import { expect, test } from 'playwright/test';

test('@claim:demo-isolation sample work is isolated and discarded', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('For language learners who want personal words to return when speaking.')).toBeVisible();
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page).toHaveURL('http://127.0.0.1:4173/demo');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.locator('.phrase-card')).toHaveCount(3);
  expect(await page.evaluate(async () => (await indexedDB.databases()).map(({ name }) => name).sort())).toEqual(['demo:personal-vocab-loop', 'personal-vocab-loop']);
  await page.evaluate(async () => {
    const request = indexedDB.open('personal-vocab-loop', 1);
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      request.onupgradeneeded = () => request.result.createObjectStore('phrases', { keyPath: 'id' });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const transaction = db.transaction('phrases', 'readwrite');
    transaction.objectStore('phrases').put({ id: 'real-sentinel', word: 'real phrase', sentence: 'This belongs to the real library.', tag: 'private', createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString(), reviewStage: 0, nextReview: new Date(0).toISOString() });
    await new Promise<void>((resolve, reject) => { transaction.oncomplete = () => resolve(); transaction.onerror = () => reject(transaction.error); });
  });
  page.once('dialog', (dialog) => dialog.accept());
  await page.locator('.phrase-card').first().getByRole('button', { name: 'Delete' }).click();
  await expect(page.locator('.phrase-card')).toHaveCount(2);
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.locator('.phrase-card')).toHaveCount(3);
  await page.getByRole('button', { name: 'Start for real' }).click();
  await expect(page).toHaveURL(/^http:\/\/127\.0\.0\.1:4173\/$/);
  await expect(page.getByText('real phrase')).toBeVisible();
  expect(await page.evaluate(async () => {
    const request = indexedDB.open('demo:personal-vocab-loop');
    const db = await new Promise<IDBDatabase>((resolve, reject) => { request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
    const count = db.transaction('phrases').objectStore('phrases').count();
    return new Promise<number>((resolve, reject) => { count.onsuccess = () => resolve(count.result); count.onerror = () => reject(count.error); });
  })).toBe(0);
});

test('@claim:offline-reload demo remains usable offline after the first visit', async ({ page, context }) => {
  await page.goto('/demo');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByText('llevarse bien')).toBeVisible();
  await page.getByRole('link', { name: /^Loop/ }).click();
  await expect(page.getByText('What was your personal sentence?')).toBeVisible();
});

test('@claim:local-only demo flow sends no phrase data off origin', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/demo#capture');
  await page.getByLabel(/word or phrase/i).fill('auf jeden Fall');
  await page.getByLabel(/your sentence/i).fill('Das mache ich auf jeden Fall morgen.');
  await page.getByRole('button', { name: /save to my loop/i }).click();
  await expect(page.getByRole('heading', { name: 'auf jeden Fall' })).toBeVisible();
  expect(requests.every((url) => new URL(url).origin === 'http://127.0.0.1:4173')).toBe(true);
  expect(requests.some((url) => url.includes('auf%20jeden') || url.includes('auf+jeden'))).toBe(false);
});

test('@claim:account-free core loop works without an account', async ({ page }) => {
  await page.goto('/demo#capture');
  await expect(page.getByRole('link', { name: /sign in|log in|create account/i })).toHaveCount(0);
  await page.getByLabel(/word or phrase/i).fill('por si acaso');
  await page.getByLabel(/your sentence/i).fill('Llevo un paraguas por si acaso.');
  await page.getByRole('button', { name: /save to my loop/i }).click();
  await expect(page.getByRole('heading', { name: 'por si acaso' })).toBeVisible();
  await page.getByRole('link', { name: /^Loop/ }).click();
  await page.getByRole('button', { name: /reveal my sentence/i }).click();
  await expect(page.getByText('Me llevo bien con la gente de mi nuevo equipo.')).toBeVisible();
  await page.getByRole('link', { name: 'Settings' }).click();
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON backup' }).click();
  expect((await downloadEvent).suggestedFilename()).toMatch(/^vocab-loop-.*\.json$/);
});

test('@claim:no-analytics demo loads no analytics or third-party runtime', async ({ page }) => {
  const origins = new Set<string>();
  page.on('request', (request) => origins.add(new URL(request.url()).origin));
  await page.goto('/demo');
  await page.getByRole('link', { name: 'Settings' }).click();
  expect([...origins]).toEqual(['http://127.0.0.1:4173']);
  await expect(page.locator('script[src*="analytics"], script[src^="http"]')).toHaveCount(0);
});

test('@claim:microphone-on-action microphone access waits for the Record action', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, '__microphoneRequests', { value: 0, writable: true });
    Object.defineProperty(navigator, 'mediaDevices', { value: { getUserMedia: async () => {
      (window as unknown as { __microphoneRequests: number }).__microphoneRequests += 1;
      throw new DOMException('denied', 'NotAllowedError');
    } } });
  });
  await page.goto('/demo#capture');
  expect(await page.evaluate(() => (window as unknown as { __microphoneRequests: number }).__microphoneRequests)).toBe(0);
  await page.getByRole('button', { name: 'Record voice' }).click();
  expect(await page.evaluate(() => (window as unknown as { __microphoneRequests: number }).__microphoneRequests)).toBe(1);
  await expect(page.getByRole('alert')).toContainText('Microphone access was not available');
});

test('@claim:license-restore an existing valid license restores private shuffle', async ({ page }) => {
  await page.route('https://api.sociobot.in/api/v1/products/personal-vocab-loop/verify?license=existing-token', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ valid: true, reason: 'ok' }) }));
  await page.goto('/#settings');
  await page.getByLabel('License token').fill('existing-token');
  await page.getByRole('button', { name: 'Restore license' }).click();
  await expect(page.getByText('License active.')).toBeVisible();
  await page.evaluate(async () => {
    const request = indexedDB.open('personal-vocab-loop', 1);
    const db = await new Promise<IDBDatabase>((resolve, reject) => { request.onupgradeneeded = () => request.result.createObjectStore('phrases', { keyPath: 'id' }); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
    const transaction = db.transaction('phrases', 'readwrite');
    transaction.objectStore('phrases').put({ id: 'licensed-recall', word: 'encore', sentence: 'Je voudrais encore un café.', tag: 'French', createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString(), reviewStage: 0, nextReview: new Date(0).toISOString() });
    await new Promise<void>((resolve, reject) => { transaction.oncomplete = () => resolve(); transaction.onerror = () => reject(transaction.error); });
  });
  await page.getByRole('link', { name: 'Loop', exact: true }).click();
  await expect(page.getByRole('button', { name: /shuffle remaining/i })).toBeVisible();
});

test('@claim:csv-export CSV contains one row for every sample phrase', async ({ page }) => {
  await page.goto('/demo#settings');
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export CSV' }).click();
  const download = await downloadEvent;
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  const csv = Buffer.concat(chunks).toString('utf8');
  expect(csv.split('\n')).toHaveLength(4);
  expect(csv).toContain('word,sentence,tag,created_at,next_review,review_stage,has_recording');
  expect(csv).toContain('llevarse bien');
  expect(csv).toContain('ça me dit');
  expect(csv).toContain('natsukashii');
});

test('@claim:encrypted-export encrypted backup hides sample phrase text', async ({ page }) => {
  await page.goto('/demo#settings');
  await page.getByRole('button', { name: 'Export encrypted backup' }).click();
  await page.getByLabel(/passphrase \(8\+ characters\)/i).fill('correct horse battery');
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download encrypted backup' }).click();
  const stream = await (await downloadEvent).createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  const encrypted = Buffer.concat(chunks).toString('utf8');
  expect(JSON.parse(encrypted).format).toBe('personal-vocab-loop-encrypted');
  expect(encrypted).not.toContain('llevarse bien');
  expect(encrypted).not.toContain('ça me dit');
});

test('@claim:backup-roundtrip JSON export can restore the sample library', async ({ page }) => {
  await page.goto('/demo#settings');
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON backup' }).click();
  const stream = await (await downloadEvent).createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  const backup = Buffer.concat(chunks);
  await page.goto('/demo#library');
  page.on('dialog', (dialog) => dialog.accept());
  for (let count = 3; count > 0; count -= 1) {
    await page.locator('.phrase-card').first().getByRole('button', { name: 'Delete' }).click();
    await expect(page.locator('.phrase-card')).toHaveCount(count - 1);
  }
  await page.goto('/demo#settings');
  await page.locator('#import-file').setInputFiles({ name: 'vocab-loop.json', mimeType: 'application/json', buffer: backup });
  await expect(page.getByRole('status')).toContainText('Imported 3 phrases');
  await page.goto('/demo#library');
  await expect(page.locator('.phrase-card')).toHaveCount(3);
});

test('@claim:recording-limit voice recording stops after 10 seconds', async ({ page }) => {
  await page.addInitScript(() => {
    const nativeSetTimeout = window.setTimeout.bind(window);
    let recordingTimeout: TimerHandler | undefined;
    Object.defineProperty(window, '__recordingDelay', { get: () => recordingTimeout ? 10_000 : 0 });
    Object.defineProperty(window, '__runRecordingTimeout', { value: () => typeof recordingTimeout === 'function' && recordingTimeout() });
    window.setTimeout = ((handler: TimerHandler, delay?: number, ...args: unknown[]) => {
      if (delay === 10_000) { recordingTimeout = handler; return 10_000; }
      return nativeSetTimeout(handler, delay, ...args);
    }) as typeof window.setTimeout;
    class FakeRecorder {
      state = 'inactive';
      mimeType = 'audio/webm';
      ondataavailable: ((event: { data: Blob }) => void) | null = null;
      onstop: (() => void) | null = null;
      constructor(_stream: MediaStream) {}
      start() { this.state = 'recording'; }
      stop() { this.state = 'inactive'; this.ondataavailable?.({ data: new Blob(['voice'], { type: this.mimeType }) }); this.onstop?.(); }
    }
    Object.defineProperty(navigator, 'mediaDevices', { value: { getUserMedia: async () => ({ getTracks: () => [{ stop() {} }] }) } });
    Object.defineProperty(window, 'MediaRecorder', { value: FakeRecorder });
  });
  await page.goto('/demo#capture');
  await page.getByRole('button', { name: 'Record voice' }).click();
  await expect(page.getByText('Recording… stops automatically in 10 seconds.')).toBeVisible();
  expect(await page.evaluate(() => (window as unknown as { __recordingDelay: number }).__recordingDelay)).toBe(10_000);
  await expect(page.getByRole('button', { name: 'Stop recording' })).toBeVisible();
  await page.evaluate(() => (window as unknown as { __runRecordingTimeout: () => void }).__runRecordingTimeout());
  await expect(page.getByText('Voice cue attached — you can re-record it.')).toBeVisible();
});

test('@claim:recall-schedule a successful sample recall moves to the stated interval', async ({ page }) => {
  await page.goto('/demo#review');
  await expect(page.getByText('interval 2 of 5')).toBeVisible();
  await page.getByRole('button', { name: /reveal my sentence/i }).click();
  await expect(page.getByRole('button', { name: /I recalled it \+7 days/i })).toBeVisible();
  const before = Date.now();
  await page.getByRole('button', { name: /I recalled it/i }).click();
  const nextReview = await page.evaluate(async () => {
    const request = indexedDB.open('demo:personal-vocab-loop');
    const db = await new Promise<IDBDatabase>((resolve, reject) => { request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
    const item = db.transaction('phrases').objectStore('phrases').get('demo-llevarse-bien');
    return new Promise<string>((resolve, reject) => { item.onsuccess = () => resolve(item.result.nextReview); item.onerror = () => reject(item.error); });
  });
  expect(new Date(nextReview).getTime() - before).toBeGreaterThanOrEqual(7 * 86_400_000 - 5_000);
});
