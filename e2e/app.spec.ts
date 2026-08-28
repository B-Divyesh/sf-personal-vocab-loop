import { expect, test } from 'playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('captures a personal phrase and runs a blind recall', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Make the words you want to say come back.' })).toBeVisible();
  await page.getByRole('link', { name: /capture your first phrase/i }).click();
  await page.getByLabel(/word or phrase/i).fill('run into');
  await page.getByLabel(/your sentence/i).fill('I ran into my neighbour at the market.');
  await page.getByLabel(/context tag/i).fill('neighbours');
  await page.getByRole('button', { name: /save to my loop/i }).click();
  await expect(page.getByRole('heading', { name: 'Words that sound like you' })).toBeVisible();
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
  await expect(page.getByRole('heading', { name: 'Make the words you want to say come back.' })).toBeVisible();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Make the words you want to say come back.' })).toBeVisible();
});

test('empty state has no serious accessibility violations', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact || ''))).toEqual([]);
});
