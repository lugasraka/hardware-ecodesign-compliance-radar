import { describe, expect, it } from "vitest";
import { validateData } from "@/data/validate";

describe("regulatory data", () => {
  it("passes all structural validation rules", () => {
    const result = validateData();
    expect(result.errors).toEqual([]);
  });

  it("contains a meaningful v1 dataset", () => {
    const result = validateData();
    expect(result.stats.clauses).toBeGreaterThanOrEqual(30);
    expect(result.stats.products).toBe(8);
    expect(result.stats.assessments).toBeGreaterThan(200);
    expect(result.stats.instruments).toBeGreaterThanOrEqual(10);
    expect(result.stats.risks).toBeGreaterThanOrEqual(8);
    expect(result.stats.decisions).toBeGreaterThanOrEqual(4);
  });
});
