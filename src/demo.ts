import { allPhrases, clearPhrases, replacePhrases, type Phrase } from './db';

export const SAMPLE_PHRASES: Phrase[] = [
  {
    id: 'demo-llevarse-bien',
    word: 'llevarse bien',
    sentence: 'Me llevo bien con la gente de mi nuevo equipo.',
    tag: 'Spanish · work',
    createdAt: '2026-08-18T09:00:00.000Z',
    updatedAt: '2026-08-18T09:00:00.000Z',
    reviewStage: 1,
    nextReview: '2026-08-21T09:00:00.000Z'
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
