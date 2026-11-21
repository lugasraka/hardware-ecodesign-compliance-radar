import { addMonths, diffDays } from "@/lib/date";

export const DATA_LAST_VERIFIED = "2026-11-20";
export const DATA_REVIEW_INTERVAL_MONTHS = 3;

export type FreshnessStatus = "current" | "due_soon" | "overdue";

export function getNextReviewDue(
  lastVerified: string = DATA_LAST_VERIFIED,
  months: number = DATA_REVIEW_INTERVAL_MONTHS,
): string {
  return addMonths(lastVerified, months);
}

export function getFreshnessStatus(
  asOf: string,
  lastVerified: string = DATA_LAST_VERIFIED,
): {
  status: FreshnessStatus;
  nextReviewDue: string;
  daysUntilReview: number;
} {
  const nextReviewDue = getNextReviewDue(lastVerified);
  const daysUntilReview = diffDays(asOf, nextReviewDue);
  const status: FreshnessStatus =
    daysUntilReview < 0 ? "overdue" : daysUntilReview <= 30 ? "due_soon" : "current";

  return { status, nextReviewDue, daysUntilReview };
}
