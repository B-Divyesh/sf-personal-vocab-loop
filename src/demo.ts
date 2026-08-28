import { allPhrases, clearPhrases, replacePhrases, type Phrase } from './db';

const SAMPLE_CUE_URL = '/sample-spanish-cue.wav';
const SAMPLE_VERSION = '2026-08-28T20:00:00.000Z';

async function sampleVoiceCue(): Promise<Blob> {
  const response = await fetch(SAMPLE_CUE_URL);
  if (!response.ok) throw new Error('The sample voice cue could not be loaded. Reload while online and try again.');
  return response.blob();
}

async function samplePhrases(): Promise<Phrase[]> {
  return [
  {
    id: 'demo-llevarse-bien',
    word: 'llevarse bien',
    sentence: 'Me llevo bien con la gente de mi nuevo equipo.',
    tag: 'Spanish · work',
    createdAt: '2026-08-18T09:00:00.000Z',
    updatedAt: SAMPLE_VERSION,
    reviewStage: 1,
    nextReview: '2026-08-21T09:00:00.000Z',
    audio: await sampleVoiceCue()
  },
  {
    id: 'demo-ca-me-dit',
    word: 'ça me dit',
    sentence: 'Un café après le cours, ça me dit bien.',
    tag: 'French · friends',
    createdAt: '2026-08-20T17:30:00.000Z',
    updatedAt: SAMPLE_VERSION,
    reviewStage: 0,
    nextReview: '2026-08-21T17:30:00.000Z'
  },
  {
    id: 'demo-natsukashii',
    word: '懐かしい · natsukashii',
    sentence: 'この歌を聞くと、学生時代が懐かしい。',
    tag: 'Japanese · music',
    createdAt: '2026-08-23T12:15:00.000Z',
    updatedAt: SAMPLE_VERSION,
    reviewStage: 2,
    nextReview: '2026-08-27T12:15:00.000Z'
  }
  ];
}

export async function seedDemoIfEmpty(): Promise<void> {
  const current = await allPhrases();
  const seededCue = current.find(({ id }) => id === 'demo-llevarse-bien');
  if (current.length === 0 || (seededCue && seededCue.updatedAt < SAMPLE_VERSION)) await replacePhrases(await samplePhrases());
}

export async function resetDemo(): Promise<void> {
  await clearPhrases();
  await replacePhrases(await samplePhrases());
}

export async function discardDemo(): Promise<void> {
  await clearPhrases();
}
