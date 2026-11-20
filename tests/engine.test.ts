import { describe, expect, it } from "vitest";
import { clauses } from "@/data/clauses";
import { instruments } from "@/data/instruments";
import { products } from "@/data/products";
import {
  DEMO_AS_OF,
  assessProduct,
  getPortfolioSummary,
  getProductSummary,
} from "@/domain/engine";
import type { Assessment, MarketCode, Product } from "@/domain/types";

function getProduct(id: string): Product {
  const product = products.find((item) => item.id === id);
  if (!product) throw new Error(`Missing product ${id}`);
  return product;
}

function assessmentsFor(id: string): Assessment[] {
  return assessProduct(getProduct(id), clauses, instruments, DEMO_AS_OF);
}

function findAssessment(
  assessments: Assessment[],
  clauseId: string,
  market: MarketCode = "EU",
): Assessment {
  const assessment = assessments.find(
    (item) => item.clauseId === clauseId && item.market === market,
  );
  if (!assessment) throw new Error(`Missing assessment ${clauseId} / ${market}`);
  return assessment;
}

describe("hero scenario: Article 11 battery removability", () => {
  const assessments = assessmentsFor("phone-orbit-2028");

  it("marks the 2028 flagship non-compliant on Article 11", () => {
    const assessment = findAssessment(assessments, "eu-batt-art11-removability");
    expect(assessment.applicability).toBe(true);
    expect(assessment.conformity).toBe(false);
    expect(assessment.overall).toBe("non_compliant");
  });

  it("passes the 2023/1670 professional-only battery availability path", () => {
    const assessment = findAssessment(assessments, "eu-1670-battery-availability");
    expect(assessment.applicability).toBe(true);
    expect(assessment.conformity).toBe(true);
    expect(assessment.overall).toBe("at_risk");
  });

  it("does not require a Battery Passport for a portable battery", () => {
    const assessment = findAssessment(assessments, "eu-batt-art77-passport-scope");
    expect(assessment.applicability).toBe(false);
    expect(assessment.overall).toBe("not_applicable");
  });

  it("shows the decision window as act now, not late", () => {
    const assessment = findAssessment(assessments, "eu-batt-art11-removability");
    expect(assessment.programStatus).toBe("act_now");
    expect(assessment.requiredBy).toBe("2027-02-17");
  });
});

describe("legacy flagship: late decision", () => {
  it("marks the 2027 Article 11 decision late", () => {
    const assessment = findAssessment(
      assessmentsFor("phone-orbit-2027"),
      "eu-batt-art11-removability",
    );
    expect(assessment.programStatus).toBe("late");
    expect(assessment.requiredBy).toBe("2026-02-17");
  });
});

describe("power adapter scenarios", () => {
  it("applies the permanent >100 W interoperability exemption to the 140 W adapter", () => {
    const assessment = findAssessment(
      assessmentsFor("adapter-volt-140w"),
      "eu-2052-interoperability",
    );
    expect(assessment.exemption?.applied).toBe(true);
    expect(assessment.overall).toBe("compliant");
  });

  it("uses the >100 W efficiency transition threshold for the 140 W adapter", () => {
    const assessment = findAssessment(
      assessmentsFor("adapter-volt-140w"),
      "eu-2052-active-efficiency",
    );
    expect(assessment.conformity).toBe(true);
  });

  it("fails the 96 W adapter on no-load power", () => {
    const assessment = findAssessment(
      assessmentsFor("adapter-volt-96w"),
      "eu-2052-no-load",
    );
    expect(assessment.overall).toBe("non_compliant");
  });

  it("fails the 96 W adapter on CEC certification", () => {
    const assessment = findAssessment(
      assessmentsFor("adapter-volt-96w"),
      "us-doe-eps-certification",
      "US-FED",
    );
    expect(assessment.overall).toBe("non_compliant");
  });
});

describe("derogation scenarios", () => {
  it("applies a wearable or wet-environment derogation to the watch but requires evidence", () => {
    const assessment = findAssessment(
      assessmentsFor("watch-pulse-2027"),
      "eu-batt-art11-removability",
    );
    expect(assessment.exemption?.applied).toBe(true);
    expect(assessment.overall).toBe("at_risk");
  });

  it("marks the laptop portable battery as non-compliant on Article 11", () => {
    const assessment = findAssessment(
      assessmentsFor("laptop-vertex-2028"),
      "eu-batt-art11-removability",
    );
    expect(assessment.conformity).toBe(false);
    expect(assessment.overall).toBe("non_compliant");
  });

  it("applies the France score clause to the laptop in the EU market", () => {
    const assessment = findAssessment(
      assessmentsFor("laptop-vertex-2028"),
      "fr-repairability-score",
    );
    expect(assessment.applicability).toBe(true);
    expect(assessment.overall).toBe("compliant");
  });
});

describe("portfolio roll-up", () => {
  it("returns all eight products", () => {
    const summary = getPortfolioSummary(products, clauses, instruments, DEMO_AS_OF);
    expect(summary).toHaveLength(8);
  });

  it("de-duplicates exposure at product × market level", () => {
    for (const product of products) {
      const summary = getProductSummary(product, clauses, instruments, DEMO_AS_OF);
      const revenue = product.markets.reduce(
        (total, market) =>
          total + (product.annualUnits[market] ?? 0) * (product.aspUsd[market] ?? 0),
        0,
      );
      expect(summary.exposureUsd.base).toBeLessThanOrEqual(revenue);
      expect(summary.exposureUsd.low).toBeLessThanOrEqual(summary.exposureUsd.high);
    }
  });
});
