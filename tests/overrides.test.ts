import { describe, expect, it } from "vitest";
import { clauses } from "@/data/clauses";
import { instruments } from "@/data/instruments";
import { products } from "@/data/products";
import { DEMO_AS_OF, assessProduct, getProductSummary } from "@/domain/engine";
import { applyProductOverrides } from "@/domain/overrides";
import type { Assessment, MarketCode } from "@/domain/types";

function findAssessment(
  assessments: Assessment[],
  clauseId: string,
  market: MarketCode = "EU",
): Assessment {
  const assessment = assessments.find(
    (item) => item.clauseId === clauseId && item.market === market,
  );
  if (!assessment) throw new Error(`Missing ${clauseId} / ${market}`);
  return assessment;
}

const phone = products.find((product) => product.id === "phone-orbit-2028")!;
const tablet = products.find((product) => product.id === "tablet-slate-2027")!;
const largeAdapter = products.find((product) => product.id === "adapter-volt-140w")!;
const smallAdapter = products.find((product) => product.id === "adapter-volt-96w")!;

describe("product what-if overrides", () => {
  it("flips Article 11 conformity when the battery becomes user-removable", () => {
    const before = assessProduct(phone, clauses, instruments, DEMO_AS_OF);
    expect(findAssessment(before, "eu-batt-art11-removability").conformity).toBe(false);

    const customized = applyProductOverrides(phone, {
      batteryRemovableByUser: true,
    });
    const after = assessProduct(customized, clauses, instruments, DEMO_AS_OF);
    expect(findAssessment(after, "eu-batt-art11-removability").conformity).toBe(true);
  });

  it("removes the >100 W interoperability exemption when wattage drops below 100", () => {
    const before = assessProduct(largeAdapter, clauses, instruments, DEMO_AS_OF);
    expect(
      findAssessment(before, "eu-2052-interoperability").exemption?.applied,
    ).toBe(true);

    const customized = applyProductOverrides(largeAdapter, {
      maxOutputPowerW: 96,
    });
    const after = assessProduct(customized, clauses, instruments, DEMO_AS_OF);
    expect(
      findAssessment(after, "eu-2052-interoperability").exemption?.applied,
    ).toBeFalsy();
  });

  it("adds the >100 W exemption when a 96 W adapter is raised above 100 W", () => {
    const customized = applyProductOverrides(smallAdapter, {
      maxOutputPowerW: 140,
    });
    const after = assessProduct(customized, clauses, instruments, DEMO_AS_OF);
    expect(
      findAssessment(after, "eu-2052-interoperability").exemption?.applied,
    ).toBe(true);
  });

  it("moves the required-by date and end of sale with the launch date", () => {
    const before = getProductSummary(phone, clauses, instruments, DEMO_AS_OF);
    const customized = applyProductOverrides(phone, {
      launchDate: "2029-09-15",
    });
    const after = getProductSummary(customized, clauses, instruments, DEMO_AS_OF);

    expect(
      findAssessment(after.assessments, "eu-batt-art11-removability").requiredBy >
        findAssessment(before.assessments, "eu-batt-art11-removability").requiredBy,
    ).toBe(true);
    expect(customized.endOfSaleDate).toBe("2034-09-15");
  });

  it("adds market-specific assessments when a market is added", () => {
    const customized = applyProductOverrides(tablet, {
      markets: [...tablet.markets, "US-OR"],
    });
    const assessments = assessProduct(customized, clauses, instruments, DEMO_AS_OF);
    const oregon = findAssessment(assessments, "us-or-right-to-repair", "US-OR");
    expect(oregon.overall).not.toBe("not_applicable");
  });

  it("does not mutate the base product", () => {
    const cycles = phone.specs.battery?.cyclesTo80Pct;
    applyProductOverrides(phone, { batteryCyclesTo80Pct: 1200 });
    expect(phone.specs.battery?.cyclesTo80Pct).toBe(cycles);
  });
});
