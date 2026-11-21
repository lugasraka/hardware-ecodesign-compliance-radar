import { describe, expect, it } from "vitest";
import {
  DATA_LAST_VERIFIED,
  getFreshnessStatus,
  getNextReviewDue,
} from "@/domain/freshness";

describe("regulatory data freshness", () => {
  it("schedules the next review three months after verification", () => {
    expect(getNextReviewDue(DATA_LAST_VERIFIED)).toBe("2027-02-20");
  });

  it("is current outside the 30-day review window", () => {
    expect(getFreshnessStatus("2026-11-20")).toMatchObject({
      status: "current",
      nextReviewDue: "2027-02-20",
    });
  });

  it("is due soon inside the 30-day review window", () => {
    expect(getFreshnessStatus("2027-02-01").status).toBe("due_soon");
  });

  it("is overdue after the review date", () => {
    expect(getFreshnessStatus("2027-02-21").status).toBe("overdue");
  });
});
