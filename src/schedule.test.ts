import { describe, expect, it } from 'vitest';
import { dueLabel, isDue, nextReviewAt } from './schedule';

describe('review schedule', () => {
  const start = new Date('2026-08-28T12:00:00.000Z');
  it('uses every advertised 1, 3, 7, 14 and 30 day interval', () => {
    expect(nextReviewAt(0, start)).toBe('2026-08-29T12:00:00.000Z');
    expect(nextReviewAt(1, start)).toBe('2026-08-31T12:00:00.000Z');
    expect(nextReviewAt(2, start)).toBe('2026-09-04T12:00:00.000Z');
    expect(nextReviewAt(3, start)).toBe('2026-09-11T12:00:00.000Z');
    expect(nextReviewAt(4, start)).toBe('2026-09-27T12:00:00.000Z');
    expect(nextReviewAt(99, start)).toBe('2026-09-27T12:00:00.000Z');
  });
  it('identifies due items and readable timing', () => {
    expect(isDue('2026-08-28T11:00:00.000Z', start)).toBe(true);
    expect(dueLabel('2026-08-29T12:00:00.000Z', start)).toBe('Tomorrow');
  });
});
