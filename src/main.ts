import './style.css';
import { allPhrases, DEMO_DATABASE, REAL_DATABASE, removePhrase, replacePhrases, savePhrase, useDatabase, type Phrase } from './db';
import { discardDemo, resetDemo, seedDemoIfEmpty } from './demo';
import { dueLabel, isDue, nextReviewAt, REVIEW_GAPS_DAYS } from './schedule';
import { csvFor, decryptBackup, encryptBackup, makeBackup, readBackup } from './transfer';
import { captureLicenseFromUrl, restoreLicense, storedLicense, verifyLicense } from './license';
import { trimmedPhraseErrors } from './validation';

type View = 'library' | 'capture' | 'review' | 'settings';
const VIEWS: View[] = ['library', 'capture', 'review', 'settings'];
const VIEW_PATHS: Record<View, string> = { library: '/', capture: '/capture', review: '/loop', settings: '/settings' };
const VIEW_TITLES: Record<View, string> = {
  library: 'Personal Vocab Loop — practice personal phrases',
  capture: 'Capture a phrase — Personal Vocab Loop',
  review: 'Recall phrases — Personal Vocab Loop',
  settings: 'Settings — Personal Vocab Loop'
};
const BUILD_ID = 'v1.0.1';
let view: View = 'library';
let phrases: Phrase[] = [];
let notice = '';
let error = '';
let reviewIndex = 0;
let reviewOrder: string[] = [];
let revealed = false;
let audioUrl = '';
let recorder: MediaRecorder | undefined;
let recordingTimer: number | undefined;
let chunks: Blob[] = [];
let draftAudio: Blob | undefined;
let filter = '';
let premium = false;
let licenseMessage = '';
let encryptedImportPending = false;
const app = document.querySelector<HTMLDivElement>('#app')!;
const demoMode = location.pathname === '/demo' || location.pathname.startsWith('/demo/') || new URLSearchParams(location.search).get('demo') === '1';
const themeKey = demoMode ? 'demo:vocab-loop-theme' : 'vocab-loop-theme';
useDatabase(demoMode ? DEMO_DATABASE : REAL_DATABASE);

const esc = (value: string) => value.replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[char]!));
const tag = (value: string) => value.trim() || 'general';
const download = (name: string, body: string, type = 'application/json') => {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([body], { type })); link.download = name; link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 500);
};

function viewPath(next: View): string {
  if (!demoMode) return VIEW_PATHS[next];
  return next === 'library' ? '/demo' : `/demo${VIEW_PATHS[next]}`;
}
function viewFromLocation(): View {
  const legacy = location.hash.slice(1) as View;
  if (VIEWS.includes(legacy)) return legacy;
  const path = location.pathname.replace(/\/$/, '') || '/';
  const relative = demoMode ? path.replace(/^\/demo/, '') || '/' : path;
  return (Object.entries(VIEW_PATHS).find(([, value]) => value === relative)?.[0] as View | undefined) || 'library';
}
function updateRouteMetadata() {
  const title = demoMode ? (view === 'library' ? 'Demo — Personal Vocab Loop' : `Demo ${view} — Personal Vocab Loop`) : VIEW_TITLES[view];
  const canonicalPath = viewPath(view);
  const description = view === 'capture' ? 'Save a personal phrase, sentence, context, and optional voice cue.' : view === 'review' ? 'Recall due personal phrases on a clear spaced schedule.' : view === 'settings' ? 'Export, import, and adjust your private phrase library.' : demoMode ? 'Try Personal Vocab Loop with isolated sample phrases that are never saved to your real library.' : 'Practice personal phrases with voice cues and a clear recall schedule. Your library stays in this browser.';
  document.title = title;
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute('href', `https://personal-vocab-loop.sociobot.in${canonicalPath}`);
  document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute('content', description);
  for (const selector of ['meta[property="og:title"]', 'meta[name="twitter:title"]']) document.querySelector<HTMLMetaElement>(selector)?.setAttribute('content', title);
  for (const selector of ['meta[property="og:description"]', 'meta[name="twitter:description"]']) document.querySelector<HTMLMetaElement>(selector)?.setAttribute('content', description);
}
function resetReviewState() { revealed = false; reviewIndex = 0; reviewOrder = []; }
async function goTo(next: View, replace = false) {
  if (replace) history.replaceState({ view: next }, '', viewPath(next));
  else history.pushState({ view: next }, '', viewPath(next));
  view = next;
  resetReviewState();
  await refresh(true);
}
async function refresh(routeChanged = false) {
  try { phrases = await allPhrases(); error = ''; } catch (caught) { error = caught instanceof Error ? caught.message : 'The local library could not be opened.'; }
  render(routeChanged);
}
function duePhrases() { const due = phrases.filter((phrase) => isDue(phrase.nextReview)); return reviewOrder.length ? due.sort((a, b) => reviewOrder.indexOf(a.id) - reviewOrder.indexOf(b.id)) : due; }
function showNotice(message: string, renderNow = true) { notice = message; if (renderNow) render(); window.setTimeout(() => { notice = ''; render(); }, 4000); }
function nav(active: View) {
  return `<header class="topbar"><a class="brand" href="${viewPath('library')}" data-view="library" aria-label="Personal Vocab Loop library"><span aria-hidden="true">◆</span> VOCAB LOOP</a><nav aria-label="Primary"><a href="${viewPath('library')}" data-view="library" ${active === 'library' ? 'aria-current="page"' : ''}>Library</a><a href="${viewPath('review')}" data-view="review" ${active === 'review' ? 'aria-current="page"' : ''}>Loop${duePhrases().length ? `<b>${duePhrases().length}</b>` : ''}</a><a href="${viewPath('settings')}" data-view="settings" ${active === 'settings' ? 'aria-current="page"' : ''}>Settings</a>${demoMode ? '' : '<a href="/demo">Demo</a>'}</nav></header>`;
}
function demoBanner() {
  return demoMode ? '<aside class="demo-banner" aria-label="Demo mode"><strong>Demo — sample data, nothing is saved</strong><span>Changes stay in a separate sample library.</span><div><button class="text-button" id="reset-demo">Reset demo</button><button class="button secondary" id="leave-demo">Start for real</button></div></aside>' : '';
}
function noticeArea() { return `${notice ? `<div class="toast" role="status">${esc(notice)}</div>` : ''}${error ? `<div class="error" role="alert">${esc(error)}</div>` : ''}`; }
function render(routeChanged = false) {
  view = viewFromLocation();
  const content = view === 'capture' ? captureView() : view === 'review' ? reviewView() : view === 'settings' ? settingsView() : libraryView();
  updateRouteMetadata();
  app.innerHTML = `${demoBanner()}${nav(view)}<main id="main" tabindex="-1">${noticeArea()}${content}</main><footer><span>Made for your own words · <span class="spark" aria-hidden="true">✦</span> original generated illustration · ${BUILD_ID}</span><span class="footer-links"><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a><span>Built by Param Factory</span></span></footer>`;
  bind();
  if (routeChanged) {
    const heading = document.querySelector<HTMLHeadingElement>('main h1');
    if (heading) { heading.tabIndex = -1; heading.focus(); }
    const announcer = document.querySelector<HTMLDivElement>('#route-status');
    if (announcer) announcer.textContent = `${heading?.textContent || 'Page'} loaded.`;
  }
}
function libraryView() {
  const shown = phrases.filter((phrase) => [phrase.word, phrase.sentence, phrase.tag].join(' ').toLowerCase().includes(filter.toLowerCase()));
  if (!phrases.length) return `<section class="empty hero"><div><p class="eyebrow">Your private language lab</p><h1>Practice the phrases you want to say.</h1><p class="lede">For language learners who want personal words to return when speaking.</p><div class="hero-actions"><a class="button primary" href="/demo">Try it with sample data</a><a class="button secondary" href="${viewPath('capture')}" data-view="capture">Capture your first phrase</a></div><ul class="hero-facts"><li>Works offline after the first visit</li><li>Your phrases stay on this device</li><li>Free core loop · no account</li></ul></div><img src="/voice-orbit.webp" width="640" height="640" alt="Pixel-art voice crystal with colourful orbital signals" fetchpriority="high" decoding="async" /></section><section class="how"><h2>How the recall loop works</h2><ol><li><b>1</b> Write the word in a sentence you would actually use.</li><li><b>2</b> Say it once; save a voice cue of up to 10 seconds.</li><li><b>3</b> Recall it after 1, 3, 7, 14 and 30 days.</li></ol></section>`;
  return `<section class="page-head"><div><p class="eyebrow">Personal phrase library</p><h1>Words that sound like you</h1><p class="lede">${duePhrases().length ? `${duePhrases().length} phrase${duePhrases().length === 1 ? '' : 's'} ready for a quick recall.` : 'Your next phrase will appear here when it is ready.'}</p></div><a class="button primary" href="${viewPath('capture')}" data-view="capture">+ Capture a phrase</a></section><section class="tools"><label class="search"><span class="sr-only">Search your phrases</span><input id="search" value="${esc(filter)}" placeholder="Search words, sentences, tags" type="search" /></label><span>${shown.length} saved · schedule: 1 / 3 / 7 / 14 / 30 days</span></section><section class="phrase-grid" aria-label="Saved phrases">${shown.length ? shown.map(phraseCard).join('') : `<p class="no-results">No phrases match “${esc(filter)}”.</p>`}</section>`;
}
function phraseCard(phrase: Phrase) {
  return `<article class="phrase-card"><div class="card-top"><span class="tag">${esc(phrase.tag)}</span><span class="due ${isDue(phrase.nextReview) ? 'ready' : ''}">${dueLabel(phrase.nextReview)}</span></div><h2>${esc(phrase.word)}</h2><p>“${esc(phrase.sentence)}”</p><div class="card-bottom">${phrase.audio ? `<button class="icon-button play" data-id="${phrase.id}" aria-label="Play your recording for ${esc(phrase.word)}">▶ Play voice</button>` : '<span class="muted">No voice cue</span>'}<button class="text-button delete" data-id="${phrase.id}">Delete</button></div></article>`;
}
function captureView() {
  return `<section class="capture-wrap"><a class="back" href="${viewPath('library')}" data-view="library">← Back to library</a><div class="capture-head"><p class="eyebrow">New signal</p><h1>Capture it in your own words.</h1><p class="lede">Use a sentence you could imagine saying aloud. That personal connection is the cue you’ll retrieve later.</p></div><form id="phrase-form" class="capture-form"><div class="field"><label for="word">Word or phrase <span aria-hidden="true">*</span></label><input id="word" name="word" required maxlength="90" autocomplete="off" placeholder="e.g. to run into" /></div><div class="field"><label for="sentence">Your sentence <span aria-hidden="true">*</span></label><textarea id="sentence" name="sentence" required maxlength="500" placeholder="I ran into my old neighbour at the market."></textarea><small>Make it specific to your life. You will be asked to recall this later.</small></div><div class="field"><label for="tag">Context tag</label><input id="tag" name="tag" maxlength="40" placeholder="work, travel, a person…" /><small>Optional, for finding this phrase later.</small></div><fieldset class="voice-field"><legend>Your voice cue <span class="optional">optional · max 10 seconds</span></legend><p>Record the phrase, your sentence, or the moment you want to remember. Microphone access is requested only when you press Record.</p><div class="record-controls"><button type="button" class="button secondary" id="record">● Record voice</button><span id="recording-status" aria-live="polite">No recording attached</span></div><audio id="draft-player" controls hidden></audio></fieldset><div class="form-actions"><a class="button ghost" href="${viewPath('library')}" data-view="library">Cancel</a><button class="button primary" type="submit">Save to my loop →</button></div><p class="privacy-note">${demoMode ? 'Saved only in the separate sample library until you leave the demo.' : 'Stored only in this browser’s IndexedDB. Export from Settings whenever you like.'}</p></form></section>`;
}
function reviewView() {
  const due = duePhrases();
  const phrase = due[reviewIndex % Math.max(due.length, 1)];
  if (!phrase) return `<section class="review-empty"><p class="eyebrow">Loop clear</p><h1>Nothing needs a return yet.</h1><p class="lede">The schedule is intentionally quiet. Add a phrase, or come back when one is due.</p><div><a class="button primary" href="${viewPath('capture')}" data-view="capture">Capture a phrase</a><a class="button secondary" href="${viewPath('library')}" data-view="library">Open library</a></div></section>`;
  return `<section class="review"><div class="review-meta"><a class="back" href="${viewPath('library')}" data-view="library">← Leave review</a><span>Phrase ${reviewIndex + 1} of ${due.length} · interval ${Math.min(phrase.reviewStage + 1, REVIEW_GAPS_DAYS.length)} of ${REVIEW_GAPS_DAYS.length}</span>${premium ? '<button class="text-button" id="shuffle">↯ Shuffle remaining</button>' : ''}</div><div class="review-card"><p class="eyebrow">Say it before you peek</p><h1>${esc(phrase.word)}</h1><p class="prompt">What was your personal sentence?</p>${revealed ? `<div class="answer"><p>“${esc(phrase.sentence)}”</p><span class="tag">${esc(phrase.tag)}</span>${phrase.audio ? `<button class="icon-button play review-play" data-id="${phrase.id}">▶ Replay your voice cue</button>` : ''}</div>` : `<button class="button primary reveal" id="reveal">Reveal my sentence <span aria-hidden="true">↓</span></button>`}</div>${revealed ? `<div class="review-actions"><button class="button danger" id="again">Need another pass <span>Tomorrow</span></button><button class="button primary" id="remembered">I recalled it <span>${phrase.reviewStage >= REVIEW_GAPS_DAYS.length - 1 ? '30 days' : `+${REVIEW_GAPS_DAYS[phrase.reviewStage + 1]} days`}</span></button></div><p class="review-help">Be honest, not harsh. “Need another pass” restarts a gentle one-day interval.</p>` : `<p class="review-help">Think or say the sentence aloud first. Press Space to reveal.</p>`}</section>`;
}
function settingsView() {
  const dataIntro = demoMode ? 'These sample phrases use a separate demo database. Exports contain sample data only.' : 'Your phrases and recordings stay in this browser. You can export them at any time.';
  const existingLicense = demoMode ? '' : `<section class="plus"><div><p class="eyebrow">Existing purchase</p><h2>Restore Vocab Loop Plus</h2><p>New purchases are paused. People who already have a Plus license can keep using private shuffle.</p>${premium ? '<p class="licensed">Plus is active on this device.</p>' : ''}</div><div><p>${premium ? 'Your license was verified on this device.' : 'Paste your existing license to restore Plus on this device.'}</p><form id="license-form" class="inline-form"><label for="license-token">License token</label><input id="license-token" required value="${storedLicense() || ''}" autocomplete="off" /><button class="button secondary">Restore license</button></form><p class="muted" aria-live="polite">${esc(licenseMessage)}</p><p class="muted"><a href="/privacy/">Privacy</a> · <a href="/terms/">Terms</a></p></div></section>`;
  return `<section class="settings"><p class="eyebrow">Your data, your device</p><h1>Keep your loop portable.</h1><p class="lede">${dataIntro}</p><div class="setting-grid"><section><h2>Export</h2><p>Take a plain JSON backup, a spreadsheet-friendly CSV, or an encrypted backup for safekeeping.</p><div class="stack"><button class="button secondary" id="export-json">Export JSON backup</button><button class="button secondary" id="export-csv">Export CSV</button><button class="button primary" id="encrypt-open">Export encrypted backup</button></div><form id="encrypt-form" class="inline-form" hidden><label for="export-password">Passphrase (8+ characters)</label><input id="export-password" type="password" minlength="8" required autocomplete="new-password" /><button class="button primary">Download encrypted backup</button></form></section><section><h2>Import</h2><p>Bring back a Vocab Loop JSON backup. Imported phrases merge by ID, keeping the newest version.</p><label class="file-button" for="import-file">Choose backup file<input id="import-file" type="file" accept="application/json,.json" /></label><form id="decrypt-form" class="inline-form" ${encryptedImportPending ? '' : 'hidden'}><label for="import-password">Passphrase for encrypted backup</label><input id="import-password" type="password" required autocomplete="current-password" /><button class="button primary">Unlock and import</button></form><p id="import-status" aria-live="polite" class="muted">${encryptedImportPending ? 'Encrypted backup selected. Enter its passphrase.' : ''}</p></section><section><h2>Appearance</h2><p>Choose the signal treatment that is easiest on your eyes.</p><div class="theme-toggle" role="group" aria-label="Colour theme"><button data-theme="system" class="theme">System</button><button data-theme="dark" class="theme">Night</button><button data-theme="light" class="theme">Light</button></div></section></div><section class="schedule"><h2>The return schedule</h2><p>After each successful recall, the next check moves out: <b>1 day → 3 days → 7 days → 14 days → 30 days</b>. “Need another pass” puts it back tomorrow. There are no streaks, scores, or notifications designed to pressure you.</p></section>${existingLicense}</section>`;
}
async function play(id: string) {
  const phrase = phrases.find((item) => item.id === id);
  if (!phrase?.audio) return;
  if (audioUrl) URL.revokeObjectURL(audioUrl);
  audioUrl = URL.createObjectURL(phrase.audio);
  const player = new Audio(audioUrl);
  try { await player.play(); } catch { showNotice('Your browser could not play that recording.'); }
}
function bind() {
  document.querySelectorAll<HTMLAnchorElement>('a[data-view]').forEach((link) => link.addEventListener('click', (event) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    void goTo(link.dataset.view as View);
  }));
  document.querySelector<HTMLButtonElement>('#reset-demo')?.addEventListener('click', async () => { await resetDemo(); filter = ''; showNotice('Sample phrases reset.', false); await goTo('library'); });
  document.querySelector<HTMLButtonElement>('#leave-demo')?.addEventListener('click', async () => { await discardDemo(); location.assign('/'); });
  document.querySelector<HTMLInputElement>('#search')?.addEventListener('input', (event) => { filter = (event.target as HTMLInputElement).value; render(); document.querySelector<HTMLInputElement>('#search')?.focus(); });
  document.querySelectorAll<HTMLButtonElement>('.play').forEach((button) => button.addEventListener('click', () => void play(button.dataset.id!)));
  document.querySelectorAll<HTMLButtonElement>('.delete').forEach((button) => button.addEventListener('click', async () => { const phrase = phrases.find((item) => item.id === button.dataset.id); if (phrase && confirm(`Delete “${phrase.word}”? This cannot be undone.`)) { await removePhrase(phrase.id); showNotice(`Deleted “${phrase.word}”.`); await refresh(); } }));
  document.querySelector<HTMLFormElement>('#phrase-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const wordInput = form.elements.namedItem('word') as HTMLInputElement;
    const sentenceInput = form.elements.namedItem('sentence') as HTMLTextAreaElement;
    const values = { word: wordInput.value, sentence: sentenceInput.value };
    const validationErrors = trimmedPhraseErrors(values);
    wordInput.setCustomValidity(validationErrors.word || '');
    sentenceInput.setCustomValidity(validationErrors.sentence || '');
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const now = new Date();
    const phrase: Phrase = { id: crypto.randomUUID(), word: values.word.trim(), sentence: values.sentence.trim(), tag: tag(String(data.get('tag'))), createdAt: now.toISOString(), updatedAt: now.toISOString(), reviewStage: 0, nextReview: nextReviewAt(0, now), audio: draftAudio };
    try { await savePhrase(phrase); draftAudio = undefined; showNotice(`Saved “${phrase.word}”. Your first recall is tomorrow.`, false); await goTo('library'); } catch (caught) { error = caught instanceof Error ? caught.message : 'The phrase could not be saved.'; render(); }
  });
  document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('#word, #sentence').forEach((field) => field.addEventListener('input', () => field.setCustomValidity('')));
  document.querySelector<HTMLButtonElement>('#record')?.addEventListener('click', () => void toggleRecording());
  document.querySelector<HTMLButtonElement>('#reveal')?.addEventListener('click', () => { revealed = true; render(); });
  document.querySelector<HTMLButtonElement>('#again')?.addEventListener('click', () => void grade(false));
  document.querySelector<HTMLButtonElement>('#remembered')?.addEventListener('click', () => void grade(true));
  document.querySelector<HTMLButtonElement>('#shuffle')?.addEventListener('click', () => { reviewOrder = duePhrases().map((phrase) => phrase.id).sort(() => Math.random() - 0.5); reviewIndex = 0; revealed = false; render(); });
  document.querySelector<HTMLButtonElement>('#export-json')?.addEventListener('click', () => void exportJson());
  document.querySelector<HTMLButtonElement>('#export-csv')?.addEventListener('click', () => download(`vocab-loop-${dateStamp()}.csv`, csvFor(phrases), 'text/csv'));
  document.querySelector<HTMLButtonElement>('#encrypt-open')?.addEventListener('click', () => { document.querySelector<HTMLFormElement>('#encrypt-form')!.hidden = false; document.querySelector<HTMLInputElement>('#export-password')!.focus(); });
  document.querySelector<HTMLFormElement>('#encrypt-form')?.addEventListener('submit', (event) => void exportEncrypted(event));
  document.querySelector<HTMLInputElement>('#import-file')?.addEventListener('change', (event) => void chooseImport(event));
  document.querySelector<HTMLFormElement>('#decrypt-form')?.addEventListener('submit', (event) => void importEncrypted(event));
  document.querySelectorAll<HTMLButtonElement>('.theme').forEach((button) => button.addEventListener('click', () => setTheme(button.dataset.theme || 'system')));
  document.querySelector<HTMLFormElement>('#license-form')?.addEventListener('submit', (event) => void submitLicense(event));
}
async function toggleRecording() {
  if (recorder?.state === 'recording') { recorder.stop(); return; }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    chunks = []; recorder = new MediaRecorder(stream);
    recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
    recorder.onstop = () => { stream.getTracks().forEach((track) => track.stop()); draftAudio = new Blob(chunks, { type: recorder?.mimeType || 'audio/webm' }); const player = document.querySelector<HTMLAudioElement>('#draft-player'); if (player) { player.src = URL.createObjectURL(draftAudio); player.hidden = false; } const status = document.querySelector('#recording-status'); if (status) status.textContent = 'Voice cue attached — you can re-record it.'; const button = document.querySelector<HTMLButtonElement>('#record'); if (button) button.textContent = '● Record again'; if (recordingTimer) clearTimeout(recordingTimer); };
    recorder.start(); const status = document.querySelector('#recording-status'); if (status) status.textContent = 'Recording… stops automatically in 10 seconds.'; const button = document.querySelector<HTMLButtonElement>('#record'); if (button) button.textContent = '■ Stop recording'; recordingTimer = window.setTimeout(() => recorder?.state === 'recording' && recorder.stop(), 10_000);
  } catch { error = 'Microphone access was not available. You can still save this phrase without a voice cue.'; render(); }
}
async function grade(remembered: boolean) {
  const phrase = duePhrases()[reviewIndex % Math.max(duePhrases().length, 1)]; if (!phrase) return;
  const stage = remembered ? Math.min(phrase.reviewStage + 1, REVIEW_GAPS_DAYS.length - 1) : 0;
  await savePhrase({ ...phrase, reviewStage: stage, nextReview: nextReviewAt(stage), lastReviewed: new Date().toISOString(), updatedAt: new Date().toISOString() });
  revealed = false; reviewIndex = 0; await refresh(); showNotice(remembered ? 'Nice retrieval. Its next return is scheduled.' : 'No problem. It will return tomorrow.');
}
async function exportJson() { download(`vocab-loop-${dateStamp()}.json`, JSON.stringify(await makeBackup(phrases), null, 2)); }
async function exportEncrypted(event: SubmitEvent) { event.preventDefault(); try { const password = document.querySelector<HTMLInputElement>('#export-password')!.value; download(`vocab-loop-encrypted-${dateStamp()}.json`, await encryptBackup(await makeBackup(phrases), password)); showNotice('Encrypted backup downloaded. Keep the passphrase separately.'); } catch (caught) { error = caught instanceof Error ? caught.message : 'The encrypted backup could not be made.'; render(); } }
let importText = '';
async function chooseImport(event: Event) { const file = (event.target as HTMLInputElement).files?.[0]; if (!file) return; importText = await file.text(); try { const raw = JSON.parse(importText) as { format?: string }; if (raw.format === 'personal-vocab-loop-encrypted') { encryptedImportPending = true; document.querySelector<HTMLFormElement>('#decrypt-form')!.hidden = false; document.querySelector('#import-status')!.textContent = 'Encrypted backup selected. Enter its passphrase.'; document.querySelector<HTMLInputElement>('#import-password')?.focus(); return; } encryptedImportPending = false; await finishImport(await readBackup(raw)); } catch { encryptedImportPending = false; error = 'This backup file is invalid. Choose a JSON backup exported by Personal Vocab Loop and try again.'; render(); } }
async function importEncrypted(event: SubmitEvent) { event.preventDefault(); try { await finishImport(await decryptBackup(importText, document.querySelector<HTMLInputElement>('#import-password')!.value)); encryptedImportPending = false; } catch (caught) { error = `${caught instanceof Error ? caught.message : 'This encrypted backup could not be unlocked.'} Re-enter the passphrase and try again, or choose the backup again.`; render(); document.querySelector<HTMLInputElement>('#import-password')?.focus(); } }
async function finishImport(incoming: Phrase[]) { const map = new Map(phrases.map((phrase) => [phrase.id, phrase])); incoming.forEach((phrase) => { const current = map.get(phrase.id); if (!current || phrase.updatedAt > current.updatedAt) map.set(phrase.id, phrase); }); await replacePhrases([...map.values()]); showNotice(`Imported ${incoming.length} phrase${incoming.length === 1 ? '' : 's'} into your library.`); await refresh(); }
function dateStamp() { return new Date().toISOString().slice(0, 10); }
function setTheme(theme: string) { localStorage.setItem(themeKey, theme); document.documentElement.dataset.theme = theme === 'system' ? '' : theme; showNotice(`Theme set to ${theme}.`); }
async function submitLicense(event: SubmitEvent) { event.preventDefault(); restoreLicense(document.querySelector<HTMLInputElement>('#license-token')!.value); const result = await verifyLicense(true); premium = result.valid; licenseMessage = result.valid ? 'License active.' : 'That license is not active. Check the token and try again.'; render(); }
async function setup() { const theme = localStorage.getItem(themeKey) || 'system'; document.documentElement.dataset.theme = theme === 'system' ? '' : theme; const cameFromCheckout = demoMode ? false : captureLicenseFromUrl(); const legacyView = location.hash.slice(1) as View; if (VIEWS.includes(legacyView)) history.replaceState({ view: legacyView }, '', viewPath(legacyView)); view = viewFromLocation(); window.addEventListener('popstate', () => { view = viewFromLocation(); resetReviewState(); void refresh(true); }); window.addEventListener('keydown', (event) => { if (event.code === 'Space' && view === 'review' && !revealed && !(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLButtonElement)) { event.preventDefault(); revealed = true; render(); } if (event.key.toLowerCase() === 'n' && view === 'library' && !(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement)) void goTo('capture'); }); if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').then((registration) => { registration.addEventListener('updatefound', () => { const worker = registration.installing; worker?.addEventListener('statechange', () => { if (worker.state === 'installed' && navigator.serviceWorker.controller) showNotice('Update ready — reload when convenient to use the newest offline shell.'); }); }); }).catch(() => undefined); if (demoMode) await seedDemoIfEmpty(); await refresh(); if (!demoMode) void verifyLicense().then((result) => { premium = result.valid; if (cameFromCheckout) licenseMessage = result.valid ? 'Thanks — Plus is active.' : 'Your license was saved and will be checked again when online.'; render(); }); }
void setup();
