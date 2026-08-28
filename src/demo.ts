import { allPhrases, clearPhrases, replacePhrases, type Phrase } from './db';

// A short original two-note cue generated in code as 16-bit PCM. Keeping it in
// the seeded record makes the demo fully offline and exercises the same Blob /
// IndexedDB / backup path as a recording made in the app.
function sampleVoiceCue(): Blob {
  const rate = 8_000;
  const samples = Math.round(rate * 0.52);
  const bytes = new ArrayBuffer(44 + samples * 2);
  const view = new DataView(bytes);
  const write = (offset: number, value: string) => [...value].forEach((letter, index) => view.setUint8(offset + index, letter.charCodeAt(0)));
  write(0, 'RIFF'); view.setUint32(4, 36 + samples * 2, true); write(8, 'WAVE'); write(12, 'fmt ');
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
  view.setUint32(24, rate, true); view.setUint32(28, rate * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true);
  write(36, 'data'); view.setUint32(40, samples * 2, true);
  for (let sample = 0; sample < samples; sample += 1) {
    const time = sample / rate;
    const frequency = time < 0.26 ? 392 : 523.25;
    const envelope = Math.min(1, time * 24, (0.52 - time) * 18);
    view.setInt16(44 + sample * 2, Math.round(Math.sin(time * frequency * Math.PI * 2) * 0.22 * envelope * 32_767), true);
  }
  return new Blob([bytes], { type: 'audio/wav' });
}

const SAMPLE_VOICE_CUE = sampleVoiceCue();

export const SAMPLE_PHRASES: Phrase[] = [
  {
    id: 'demo-llevarse-bien',
    word: 'llevarse bien',
    sentence: 'Me llevo bien con la gente de mi nuevo equipo.',
    tag: 'Spanish · work',
    createdAt: '2026-08-18T09:00:00.000Z',
    updatedAt: '2026-08-18T09:00:00.000Z',
    reviewStage: 1,
    nextReview: '2026-08-21T09:00:00.000Z',
    audio: SAMPLE_VOICE_CUE
  },
  {
    id: 'demo-ca-me-dit',
    word: 'ça me dit',
    sentence: 'Un café après le cours, ça me dit bien.',
    tag: 'French · friends',
    createdAt: '2026-08-20T17:30:00.000Z',
    updatedAt: '2026-08-20T17:30:00.000Z',
    reviewStage: 0,
    nextReview: '2026-08-21T17:30:00.000Z'
  },
  {
    id: 'demo-natsukashii',
    word: '懐かしい · natsukashii',
    sentence: 'この歌を聞くと、学生時代が懐かしい。',
    tag: 'Japanese · music',
    createdAt: '2026-08-23T12:15:00.000Z',
    updatedAt: '2026-08-23T12:15:00.000Z',
    reviewStage: 2,
    nextReview: '2026-08-27T12:15:00.000Z'
  }
];

export async function seedDemoIfEmpty(): Promise<void> {
  if ((await allPhrases()).length === 0) await replacePhrases(SAMPLE_PHRASES);
}

export async function resetDemo(): Promise<void> {
  await clearPhrases();
  await replacePhrases(SAMPLE_PHRASES);
}

export async function discardDemo(): Promise<void> {
  await clearPhrases();
}
