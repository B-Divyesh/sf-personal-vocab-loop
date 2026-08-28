export const REVIEW_GAPS_DAYS = [1, 3, 7, 14, 30] as const;

export function nextReviewAt(stage: number, from = new Date()): string {
  const safeStage = Math.max(0, Math.min(stage, REVIEW_GAPS_DAYS.length - 1));
  const date = new Date(from);
  date.setDate(date.getDate() + REVIEW_GAPS_DAYS[safeStage]);
  return date.toISOString();
}

export function isDue(nextReview: string, now = new Date()): boolean {
  return new Date(nextReview).getTime() <= now.getTime();
}

export function dueLabel(nextReview: string, now = new Date()): string {
  const difference = new Date(nextReview).getTime() - now.getTime();
  const days = Math.round(difference / 86_400_000);
  if (days <= 0) return 'Ready now';
  if (days === 1) return 'Tomorrow';
  return `In ${days} days`;
}
