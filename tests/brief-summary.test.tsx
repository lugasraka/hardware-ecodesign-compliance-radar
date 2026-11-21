import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BriefSummary } from "@/components/brief-summary";
import { getBriefForProduct } from "@/domain/brief";

const brief = getBriefForProduct("phone-orbit-2028");

if (!brief) {
  throw new Error("Expected the phone-orbit-2028 brief to exist");
}

describe("BriefSummary", () => {
  it("renders the executive decision essentials", () => {
    render(<BriefSummary brief={brief} />);

    expect(screen.getByText("The ask")).toBeInTheDocument();
    expect(screen.getByText("Recommendation")).toBeInTheDocument();
    expect(screen.getByText("Why now")).toBeInTheDocument();
    expect(screen.getByText("Options at a glance")).toBeInTheDocument();
    expect(screen.getByText("Owners and gates")).toBeInTheDocument();
    expect(screen.getByText("Top risks")).toBeInTheDocument();
  });

  it("marks the print variant as a single page", () => {
    render(<BriefSummary brief={brief} variant="print" />);

    expect(screen.getByText("1 / 1")).toBeInTheDocument();
    expect(screen.queryByText("Requirement ledger")).not.toBeInTheDocument();
  });
});
