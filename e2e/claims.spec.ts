import { expect, test } from 'playwright/test';

test('@claim:demo-isolation sample work is isolated and discarded', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('For language learners who want their own phrases to return when speaking.')).toBeVisible();
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page).toHaveURL('http://127.0.0.1:4173/?demo=1');
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
  await page.goto('/privacy/');
  await expect(page.getByRole('heading', { name: 'Privacy' })).toBeVisible();
  await page.goto('/terms/');
  await expect(page.getByRole('heading', { name: 'Terms of use' })).toBeVisible();
  await context.setOffline(true);
  await page.goto('/demo');
  await expect(page).toHaveTitle('Demo — Personal Vocab Loop');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.getByText('llevarse bien')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Play voice cue for llevarse bien' })).toBeVisible();
  await page.getByRole('link', { name: /^Loop/ }).click();
  await expect(page.getByText('What was your personal sentence?')).toBeVisible();
});

test('@claim:local-only demo phrase and recording stay in its browser namespace', async ({ page }) => {
  await page.addInitScript(() => {
    class FakeRecorder {
      state: 'inactive' | 'recording' = 'inactive';
      mimeType = 'audio/webm';
      ondataavailable: ((event: { data: Blob }) => void) | null = null;
      onstop: (() => void) | null = null;
      constructor(_stream: MediaStream) {}
      start() { this.state = 'recording'; }
      stop() { this.state = 'inactive'; this.ondataavailable?.({ data: new Blob(['voice-secret-marker'], { type: this.mimeType }) }); this.onstop?.(); }
    }
    Object.defineProperty(navigator, 'mediaDevices', { value: { getUserMedia: async () => ({ getTracks: () => [{ stop() {} }] }) } });
    Object.defineProperty(window, 'MediaRecorder', { value: FakeRecorder });
  });
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/?demo=1');
  await page.getByRole('link', { name: 'Capture a phrase' }).click();
  await page.getByLabel(/word or phrase/i).fill('auf jeden Fall');
  await page.getByLabel(/your sentence/i).fill('Das mache ich auf jeden Fall morgen.');
  await page.getByRole('button', { name: 'Record voice' }).click();
  await page.getByRole('button', { name: 'Stop recording' }).click();
  await expect(page.getByText('Voice cue attached — you can re-record it.')).toBeVisible();
  await page.getByRole('button', { name: /save to my loop/i }).click();
  await expect(page.getByRole('heading', { name: 'auf jeden Fall' })).toBeVisible();
  expect(requests.every((url) => new URL(url).origin === 'http://127.0.0.1:4173')).toBe(true);
  expect(requests.some((url) => url.includes('auf%20jeden') || url.includes('auf+jeden'))).toBe(false);
  expect(await page.evaluate(async () => {
    const record = async (database: string) => {
      const request = indexedDB.open(database);
      const db = await new Promise<IDBDatabase>((resolve, reject) => { request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
      if (!db.objectStoreNames.contains('phrases')) return [];
      const entry = db.transaction('phrases').objectStore('phrases').getAll();
      const phrases = await new Promise<Array<{ word: string; audio?: Blob }>>((resolve, reject) => { entry.onsuccess = () => resolve(entry.result); entry.onerror = () => reject(entry.error); });
      return Promise.all(phrases.map(async (phrase) => ({ word: phrase.word, audio: phrase.audio ? new TextDecoder().decode(await phrase.audio.arrayBuffer()) : '' })));
    };
    return { demo: await record('demo:personal-vocab-loop'), real: await record('personal-vocab-loop') };
  })).toEqual({ demo: expect.arrayContaining([expect.objectContaining({ word: 'auf jeden Fall', audio: 'voice-secret-marker' })]), real: [] });
});

test('@claim:account-free core loop works without an account', async ({ page }) => {
  await page.goto('/demo/capture');
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
  await page.goto('/demo/capture');
  expect(await page.evaluate(() => (window as unknown as { __microphoneRequests: number }).__microphoneRequests)).toBe(0);
  await page.getByRole('button', { name: 'Record voice' }).click();
  expect(await page.evaluate(() => (window as unknown as { __microphoneRequests: number }).__microphoneRequests)).toBe(1);
  await expect(page.getByRole('alert')).toContainText('Microphone access was not available');
});

test('@claim:license-restore an existing valid license restores private shuffle', async ({ page }) => {
  await page.route('https://api.sociobot.in/api/v1/products/personal-vocab-loop/verify?license=existing-token', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ valid: true, reason: 'ok' }) }));
  await page.goto('/settings');
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
  await page.goto('/demo/settings');
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

test('@claim:encrypted-export encrypted backup hides text and decrypts with its passphrase', async ({ page }) => {
  await page.goto('/demo/settings');
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
  await page.goto('/demo');
  page.on('dialog', (dialog) => dialog.accept());
  for (let count = 3; count > 0; count -= 1) {
    await page.locator('.phrase-card').first().getByRole('button', { name: 'Delete' }).click();
    await expect(page.locator('.phrase-card')).toHaveCount(count - 1);
  }
  await page.goto('/demo/settings');
  await page.locator('#import-file').setInputFiles({ name: 'encrypted.json', mimeType: 'application/json', buffer: Buffer.from(encrypted) });
  await page.getByLabel('Passphrase for encrypted backup').fill('correct horse battery');
  await page.getByRole('button', { name: 'Unlock and import' }).click();
  await expect(page.getByRole('status')).toContainText('Imported 3 phrases');
  await page.goto('/demo');
  await expect(page.locator('.phrase-card')).toHaveCount(3);
});

test('@claim:backup-roundtrip JSON export can restore the sample library', async ({ page }) => {
  await page.goto('/demo/settings');
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON backup' }).click();
  const stream = await (await downloadEvent).createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  const backup = Buffer.concat(chunks);
  await page.goto('/demo');
  page.on('dialog', (dialog) => dialog.accept());
  for (let count = 3; count > 0; count -= 1) {
    await page.locator('.phrase-card').first().getByRole('button', { name: 'Delete' }).click();
    await expect(page.locator('.phrase-card')).toHaveCount(count - 1);
  }
  await page.goto('/demo/settings');
  await page.locator('#import-file').setInputFiles({ name: 'vocab-loop.json', mimeType: 'application/json', buffer: backup });
  await expect(page.getByRole('status')).toContainText('Imported 3 phrases');
  await page.goto('/demo');
  await expect(page.locator('.phrase-card')).toHaveCount(3);
});

test('@claim:backup-merge-newest imported IDs keep only the newest phrase version', async ({ page }) => {
  const phrase = (updatedAt: string, word: string) => ({
    id: 'demo-llevarse-bien', word, sentence: 'This sentence identifies the imported version.', tag: 'merge check',
    createdAt: '2026-08-18T09:00:00.000Z', updatedAt, reviewStage: 1, nextReview: '2026-08-21T09:00:00.000Z'
  });
  const backup = (item: ReturnType<typeof phrase>) => Buffer.from(JSON.stringify({ version: 1, exportedAt: '2026-08-28T00:00:00.000Z', phrases: [item] }));
  await page.goto('/demo/settings');
  await page.locator('#import-file').setInputFiles({ name: 'older.json', mimeType: 'application/json', buffer: backup(phrase('2026-08-17T00:00:00.000Z', 'older import')) });
  await page.goto('/demo');
  await expect(page.getByRole('heading', { name: 'llevarse bien' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'older import' })).toHaveCount(0);
  await page.goto('/demo/settings');
  await page.locator('#import-file').setInputFiles({ name: 'newer.json', mimeType: 'application/json', buffer: backup(phrase('2026-08-29T00:00:00.000Z', 'newest import')) });
  await page.goto('/demo');
  await expect(page.getByRole('heading', { name: 'newest import' })).toBeVisible();
  await expect(page.locator('.phrase-card')).toHaveCount(3);
});

test('@claim:recording-limit voice recording stops after 10 seconds', async ({ page }) => {
  await page.addInitScript(() => {
    const nativeSetTimeout = window.setTimeout.bind(window);
    const nativeClearTimeout = window.clearTimeout.bind(window);
    let now = 0;
    let timerId = 0;
    const timers = new Map<number, { due: number; handler: TimerHandler; args: unknown[] }>();
    Object.defineProperty(window, '__advanceRecordingClock', { value: (milliseconds: number) => {
      now += milliseconds;
      for (const [id, timer] of [...timers]) {
        if (timer.due <= now) { timers.delete(id); typeof timer.handler === 'function' && timer.handler(...timer.args); }
      }
    } });
    window.setTimeout = ((handler: TimerHandler, delay = 0, ...args: unknown[]) => {
      if (delay === 10_000) { timerId += 1; timers.set(timerId, { due: now + delay, handler, args }); return timerId; }
      return nativeSetTimeout(handler, delay, ...args);
    }) as typeof window.setTimeout;
    window.clearTimeout = ((id?: number) => { if (id && timers.delete(id)) return; nativeClearTimeout(id); }) as typeof window.clearTimeout;
    class FakeRecorder {
      state = 'inactive';
      mimeType = 'audio/webm';
      ondataavailable: ((event: { data: Blob }) => void) | null = null;
      onstop: (() => void) | null = null;
      constructor(_stream: MediaStream) {}
      start() { this.state = 'recording'; (window as unknown as { __recorderState: string }).__recorderState = this.state; }
      stop() { this.state = 'inactive'; (window as unknown as { __recorderState: string }).__recorderState = this.state; this.ondataavailable?.({ data: new Blob(['voice'], { type: this.mimeType }) }); this.onstop?.(); }
    }
    Object.defineProperty(navigator, 'mediaDevices', { value: { getUserMedia: async () => ({ getTracks: () => [{ stop() {} }] }) } });
    Object.defineProperty(window, 'MediaRecorder', { value: FakeRecorder });
  });
  await page.goto('/demo/capture');
  await page.getByRole('button', { name: 'Record voice' }).click();
  await expect(page.getByText('Recording… stops automatically in 10 seconds.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Stop recording' })).toBeVisible();
  await page.evaluate(() => (window as unknown as { __advanceRecordingClock: (milliseconds: number) => void }).__advanceRecordingClock(9_999));
  expect(await page.evaluate(() => (window as unknown as { __recorderState: string }).__recorderState)).toBe('recording');
  await expect(page.getByRole('button', { name: 'Stop recording' })).toBeVisible();
  await page.evaluate(() => (window as unknown as { __advanceRecordingClock: (milliseconds: number) => void }).__advanceRecordingClock(1));
  expect(await page.evaluate(() => (window as unknown as { __recorderState: string }).__recorderState)).toBe('inactive');
  await expect(page.getByText('Voice cue attached — you can re-record it.')).toBeVisible();
});

test('@claim:demo-voice-cue sample cue plays, resets, and survives a backup round trip', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, '__sampleCuePlays', { value: 0, writable: true });
    class FakeAudio {
      constructor(_url: string) {}
      play() { (window as unknown as { __sampleCuePlays: number }).__sampleCuePlays += 1; return Promise.resolve(); }
    }
    Object.defineProperty(window, 'Audio', { value: FakeAudio });
  });
  await page.goto('/?demo=1');
  const sampleCue = page.getByRole('button', { name: 'Play voice cue for llevarse bien' });
  await expect(sampleCue).toBeVisible();
  await sampleCue.click();
  expect(await page.evaluate(() => (window as unknown as { __sampleCuePlays: number }).__sampleCuePlays)).toBe(1);
  await page.getByRole('link', { name: 'Settings' }).click();
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON backup' }).click();
  const stream = await (await downloadEvent).createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  const backup = Buffer.concat(chunks);
  expect(JSON.parse(backup.toString('utf8')).phrases.find((phrase: { id: string }) => phrase.id === 'demo-llevarse-bien').audio.type).toBe('audio/wav');
  await page.goto('/demo');
  page.on('dialog', (dialog) => dialog.accept());
  await page.locator('.phrase-card').first().getByRole('button', { name: 'Delete' }).click();
  await page.goto('/demo/settings');
  await page.locator('#import-file').setInputFiles({ name: 'sample.json', mimeType: 'application/json', buffer: backup });
  await page.goto('/demo');
  await expect(page.getByRole('button', { name: 'Play voice cue for llevarse bien' })).toBeVisible();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.getByRole('button', { name: 'Play voice cue for llevarse bien' })).toBeVisible();
});

test('@claim:recall-schedule the stored schedule proves every 1, 3, 7, 14 and 30-day interval', async ({ page }) => {
  await page.goto('/demo/loop');
  const prepareStage = async (stage: number) => page.evaluate(async (nextStage) => {
    const request = indexedDB.open('demo:personal-vocab-loop');
    const db = await new Promise<IDBDatabase>((resolve, reject) => { request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
    const transaction = db.transaction('phrases', 'readwrite');
    const store = transaction.objectStore('phrases');
    store.clear();
    store.put({ id: 'schedule-proof', word: 'schedule proof', sentence: 'I remember this sentence.', tag: 'test', createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString(), reviewStage: nextStage, nextReview: new Date(0).toISOString() });
    await new Promise<void>((resolve, reject) => { transaction.oncomplete = () => resolve(); transaction.onerror = () => reject(transaction.error); });
  }, stage);
  const storedDelayDays = async () => page.evaluate(async () => {
    const request = indexedDB.open('demo:personal-vocab-loop');
    const db = await new Promise<IDBDatabase>((resolve, reject) => { request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
    const item = db.transaction('phrases').objectStore('phrases').get('schedule-proof');
    const value = await new Promise<{ nextReview: string; lastReviewed: string }>((resolve, reject) => { item.onsuccess = () => resolve(item.result); item.onerror = () => reject(item.error); });
    return (new Date(value.nextReview).getTime() - new Date(value.lastReviewed).getTime()) / 86_400_000;
  });

  await prepareStage(4);
  await page.reload();
  await page.getByRole('button', { name: /reveal my sentence/i }).click();
  await page.getByRole('button', { name: /Need another pass/i }).click();
  expect(await storedDelayDays()).toBe(1);

  for (const [stage, days] of [[0, 3], [1, 7], [2, 14], [3, 30], [4, 30]] as const) {
    await prepareStage(stage);
    await page.reload();
    await page.getByRole('button', { name: /reveal my sentence/i }).click();
    await expect(page.getByRole('button', { name: new RegExp(`I recalled it.*${days} days`) })).toBeVisible();
    await page.getByRole('button', { name: /I recalled it/i }).click();
    expect(await storedDelayDays()).toBe(days);
  }
});
