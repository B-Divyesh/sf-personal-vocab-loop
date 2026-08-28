import { describe, expect, it } from 'vitest';
import { trimmedPhraseErrors } from './validation';

describe('trimmedPhraseErrors', () => {
  it('rejects whitespace-only required phrase fields', () => {
    expect(trimmedPhraseErrors({ word: ' \n ', sentence: '\t  ' })).toEqual({
      word: 'Enter a phrase, not only spaces.',
      sentence: 'Enter a personal sentence, not only spaces.'
    });
  });

  it('accepts meaningful text around whitespace', () => {
    expect(trimmedPhraseErrors({ word: '  run into ', sentence: ' I ran into Mia.  ' })).toEqual({});
  });
});
