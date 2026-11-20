import { describe, expect, it } from "vitest";
import { getBriefForProduct } from "@/domain/brief";

describe("executive brief", () => {
  const brief = getBriefForProduct("phone-orbit-2028");

  it("builds a brief for the hero decision", () => {
    expect(brief).not.toBeNull();
    expect(brief?.decision.id).toBe("dec-art11-2028");
    expect(brief?.product.id).toBe("phone-orbit-2028");
  });

  it("recommends the highest weighted option", () => {
    expect(brief?.scoredOptions[0].option.id).toBe("a");
    expect(brief?.ask).toContain("Option A");
  });

  it("contains the EPM decision blocks", () => {
    expect(brief?.whyNow.length).toBeGreaterThanOrEqual(3);
    expect(brief?.owners.length).toBeGreaterThan(0);
    expect(brief?.topRisks.length).toBeGreaterThan(0);
    expect(brief?.markdown).toContain("## The ask");
    expect(brief?.markdown).toContain("## Decision matrix");
    expect(brief?.markdown).toContain("## Recommendation");
    expect(brief?.markdown).toContain("## Owners and gates");
  });

  it("does not invent a decision for a product without one", () => {
    expect(getBriefForProduct("display-studio-2028")).toBeNull();
  });
});
