export type PhraseFields = { word: string; sentence: string };

export function trimmedPhraseErrors(fields: PhraseFields): Partial<Record<keyof PhraseFields, string>> {
  const errors: Partial<Record<keyof PhraseFields, string>> = {};
  if (!fields.word.trim()) errors.word = 'Enter a word or phrase, not only spaces.';
  if (!fields.sentence.trim()) errors.sentence = 'Enter a personal sentence, not only spaces.';
  return errors;
}
