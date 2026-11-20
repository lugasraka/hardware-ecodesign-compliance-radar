import { describe, expect, it } from "vitest";
import { products } from "@/data/products";
import {
  getGateDate,
  getMarketRelevance,
  getNextGate,
  getPhase,
  getProgramStatus,
  getRequiredBy,
} from "@/domain/schedule";

const hero = products.find((product) => product.id === "phone-orbit-2028")!;

describe("NPI gate scheduling", () => {
  it("computes the default EVT gate as 12 months before launch", () => {
    expect(getGateDate(hero, "EVT")).toBe("2027-09-15");
  });

  it("computes required-by from gate minus lead time and buffer", () => {
    expect(getRequiredBy(hero, "EVT", 24, 6)).toBe("2027-02-17");
  });

  it("flags a required-by date inside 90 days as act now", () => {
    expect(getProgramStatus("2027-02-17", "2026-11-20")).toBe("act_now");
  });

  it("flags a past required-by date as late", () => {
    expect(getProgramStatus("2026-02-17", "2026-11-20")).toBe("late");
  });

  it("flags a far-future required-by date as on track", () => {
    expect(getProgramStatus("2029-01-01", "2026-11-20")).toBe("on_track");
  });

  it("finds the next gate", () => {
    const next = getNextGate(hero, "2026-11-20");
    expect(next?.gate).toBe("Proto");
    expect(next?.date).toBe("2027-03-15");
  });

  it("reports the current phase", () => {
    expect(getPhase(hero, "2026-11-20")).toBe("Concept");
  });
});

describe("market relevance", () => {
  it("applies at launch when the rule is in force before launch", () => {
    expect(getMarketRelevance(hero, "2027-02-18")).toBe("at_launch");
  });

  it("applies mid-life when the rule starts during the sales window", () => {
    expect(getMarketRelevance(hero, "2030-01-01")).toBe("mid_life");
  });

  it("never applies when the product leaves the market before the rule", () => {
    const shortLife = { ...hero, endOfSaleDate: "2027-01-01" };
    expect(getMarketRelevance(shortLife, "2029-01-01")).toBe("never");
  });
});
