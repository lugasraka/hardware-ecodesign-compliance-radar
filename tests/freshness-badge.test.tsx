import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FreshnessBadge } from "@/components/freshness-badge";
import { DATA_LAST_VERIFIED } from "@/domain/freshness";

function renderAt(date: string) {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(`${date}T12:00:00.000Z`));
  return render(<FreshnessBadge lastVerified={DATA_LAST_VERIFIED} />);
}

describe("FreshnessBadge", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows current before the review window", () => {
    renderAt("2026-11-21");
    expect(screen.getByText("Current")).toBeInTheDocument();
  });

  it("warns inside the 30-day review window", () => {
    renderAt("2027-02-01");
    expect(screen.getByText("Review due soon")).toBeInTheDocument();
  });

  it("flags an overdue review", () => {
    renderAt("2027-02-21");
    expect(screen.getByText("Review overdue")).toBeInTheDocument();
  });
});
