import { describe, expect, it } from 'vitest';
import { dueLabel, isDue, nextReviewAt } from './schedule';

describe('review schedule', () => {
  const start = new Date('2026-08-28T12:00:00.000Z');
  it('starts a transparent 1, 3, 7 day loop', () => {
    expect(nextReviewAt(0, start)).toBe('2026-08-29T12:00:00.000Z');
    expect(nextReviewAt(1, start)).toBe('2026-08-31T12:00:00.000Z');
    expect(nextReviewAt(2, start)).toBe('2026-09-04T12:00:00.000Z');
  });
  it('identifies due items and readable timing', () => {
    expect(isDue('2026-08-28T11:00:00.000Z', start)).toBe(true);
    expect(dueLabel('2026-08-29T12:00:00.000Z', start)).toBe('Tomorrow');
  });
});
