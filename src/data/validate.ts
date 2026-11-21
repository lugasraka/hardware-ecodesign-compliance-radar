import { assessProduct, DEMO_AS_OF } from "@/domain/engine";
import type { MarketCode } from "@/domain/types";
import { clauses } from "./clauses";
import { dataReleases } from "./changelog";
import { decisions } from "./decisions";
import { dppFields } from "./dpp";
import { instruments } from "./instruments";
import { markets } from "./markets";
import { milestones } from "./milestones";
import { products } from "./products";
import { regulatoryWatch } from "./regulatory-watch";
import { risks } from "./risks";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export interface ValidationResult {
  errors: string[];
  warnings: string[];
  stats: {
    instruments: number;
    clauses: number;
    products: number;
    assessments: number;
    risks: number;
    decisions: number;
    milestones: number;
    dppFields: number;
    watchItems: number;
    dataReleases: number;
  };
}

function duplicates(values: string[]): string[] {
  const seen = new Set<string>();
  const duplicate = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) duplicate.add(value);
    seen.add(value);
  }
  return Array.from(duplicate);
}

export function validateData(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const marketCodes = new Set(markets.map((market) => market.code));
  const instrumentIds = new Set(instruments.map((instrument) => instrument.id));
  const clauseIds = new Set(clauses.map((clause) => clause.id));
  const productIds = new Set(products.map((product) => product.id));

  for (const duplicate of duplicates(instruments.map((instrument) => instrument.id))) {
    errors.push(`Duplicate instrument id: ${duplicate}`);
  }
  for (const duplicate of duplicates(clauses.map((clause) => clause.id))) {
    errors.push(`Duplicate clause id: ${duplicate}`);
  }
  for (const duplicate of duplicates(products.map((product) => product.id))) {
    errors.push(`Duplicate product id: ${duplicate}`);
  }
  for (const duplicate of duplicates(risks.map((risk) => risk.id))) {
    errors.push(`Duplicate risk id: ${duplicate}`);
  }
  for (const duplicate of duplicates(decisions.map((decision) => decision.id))) {
    errors.push(`Duplicate decision id: ${duplicate}`);
  }
  for (const duplicate of duplicates(regulatoryWatch.map((item) => item.id))) {
    errors.push(`Duplicate watch item id: ${duplicate}`);
  }
  for (const duplicate of duplicates(dataReleases.map((release) => release.version))) {
    errors.push(`Duplicate data release version: ${duplicate}`);
  }

  for (const instrument of instruments) {
    if (!instrument.sourceUrl.startsWith("http")) {
      errors.push(`Instrument ${instrument.id} has no valid source URL`);
    }
    if (!ISO_DATE.test(instrument.lastVerified)) {
      errors.push(`Instrument ${instrument.id} has an invalid lastVerified date`);
    }
    if (!ISO_DATE.test(instrument.applicationDate)) {
      errors.push(`Instrument ${instrument.id} has an invalid application date`);
    }
  }

  for (const clause of clauses) {
    if (!instrumentIds.has(clause.instrumentId)) {
      errors.push(`Clause ${clause.id} references missing instrument ${clause.instrumentId}`);
    }
    if (!clause.sourceUrl.startsWith("http")) {
      errors.push(`Clause ${clause.id} has no valid source URL`);
    }
    if (!ISO_DATE.test(clause.lastVerified)) {
      errors.push(`Clause ${clause.id} has an invalid lastVerified date`);
    }
    if (clause.owningTeams.length === 0) {
      errors.push(`Clause ${clause.id} has no owning team`);
    }
    if (!clause.owningTeams.includes(clause.accountableTeam)) {
      errors.push(`Clause ${clause.id} accountable team is not in owningTeams`);
    }
    if (clause.evidence.length === 0) {
      errors.push(`Clause ${clause.id} has no evidence requirement`);
    }
    if (clause.markets.length === 0) {
      errors.push(`Clause ${clause.id} has no market scope`);
    }
    for (const market of clause.markets) {
      if (!marketCodes.has(market)) {
        errors.push(`Clause ${clause.id} has invalid market ${market}`);
      }
    }
    if (clause.qualificationLeadWeeks < 0 || clause.decisionBufferWeeks < 0) {
      errors.push(`Clause ${clause.id} has a negative lead time or buffer`);
    }
  }

  for (const product of products) {
    if (product.markets.length === 0) {
      errors.push(`Product ${product.id} has no markets`);
    }
    for (const market of product.markets) {
      if (!marketCodes.has(market)) {
        errors.push(`Product ${product.id} has invalid market ${market}`);
      }
    }
    if (!ISO_DATE.test(product.launchDate) || !ISO_DATE.test(product.endOfSaleDate)) {
      errors.push(`Product ${product.id} has an invalid date`);
    }
    if (product.launchDate >= product.endOfSaleDate) {
      errors.push(`Product ${product.id} launch date is not before end of sale`);
    }
    for (const [market, units] of Object.entries(product.annualUnits)) {
      if (!marketCodes.has(market as MarketCode)) {
        errors.push(`Product ${product.id} has units for invalid market ${market}`);
      }
      if (!units || units <= 0) {
        errors.push(`Product ${product.id} has invalid units for ${market}`);
      }
    }
    for (const [market, asp] of Object.entries(product.aspUsd)) {
      if (!marketCodes.has(market as MarketCode)) {
        errors.push(`Product ${product.id} has ASP for invalid market ${market}`);
      }
      if (!asp || asp <= 0) {
        errors.push(`Product ${product.id} has invalid ASP for ${market}`);
      }
    }
    if (product.specs.battery) {
      const calculated = (product.specs.battery.capacityMah * product.specs.battery.voltageV) / 1000;
      if (Math.abs(calculated - product.specs.battery.energyWh) > 0.4) {
        errors.push(
          `Product ${product.id} battery energy ${product.specs.battery.energyWh} Wh does not match ${calculated.toFixed(1)} Wh`,
        );
      }
    }
  }

  for (const risk of risks) {
    if (risk.productId && !productIds.has(risk.productId)) {
      errors.push(`Risk ${risk.id} references missing product ${risk.productId}`);
    }
    if (risk.clauseId && !clauseIds.has(risk.clauseId)) {
      errors.push(`Risk ${risk.id} references missing clause ${risk.clauseId}`);
    }
    if (risk.likelihood < 1 || risk.likelihood > 5 || risk.impact < 1 || risk.impact > 5) {
      errors.push(`Risk ${risk.id} has an out-of-range likelihood or impact`);
    }
    if (!ISO_DATE.test(risk.dueDate)) {
      errors.push(`Risk ${risk.id} has an invalid due date`);
    }
  }

  for (const decision of decisions) {
    if (!productIds.has(decision.productId)) {
      errors.push(`Decision ${decision.id} references missing product ${decision.productId}`);
    }
    if (decision.clauseId && !clauseIds.has(decision.clauseId)) {
      errors.push(`Decision ${decision.id} references missing clause ${decision.clauseId}`);
    }
    if (decision.options.length < 2) {
      errors.push(`Decision ${decision.id} needs at least two options`);
    }
    for (const option of decision.options) {
      for (const key of ["marketAccess", "cost", "schedule", "design", "confidence"] as const) {
        if (
          typeof option.scores[key] !== "number" ||
          option.scores[key] < 1 ||
          option.scores[key] > 5
        ) {
          errors.push(`Decision ${decision.id} option ${option.id} has an invalid ${key} score`);
        }
      }
    }
  }

  for (const milestone of milestones) {
    if (!instrumentIds.has(milestone.instrumentId)) {
      errors.push(`Milestone ${milestone.id} references missing instrument ${milestone.instrumentId}`);
    }
    if (!ISO_DATE.test(milestone.date)) {
      errors.push(`Milestone ${milestone.id} has an invalid date`);
    }
  }

  for (const field of dppFields) {
    if (!field.sourceSystem || !field.owner || !field.notes) {
      errors.push(`DPP field ${field.id} is missing source, owner or notes`);
    }
  }

  for (const item of regulatoryWatch) {
    if (item.instrumentId && !instrumentIds.has(item.instrumentId)) {
      errors.push(`Watch item ${item.id} references missing instrument ${item.instrumentId}`);
    }
    if (!item.sourceUrl.startsWith("http")) {
      errors.push(`Watch item ${item.id} has no valid source URL`);
    }
    if (!ISO_DATE.test(item.detectedAt)) {
      errors.push(`Watch item ${item.id} has an invalid detected date`);
    }
    if (item.publishedAt && !ISO_DATE.test(item.publishedAt)) {
      errors.push(`Watch item ${item.id} has an invalid published date`);
    }
  }

  for (const release of dataReleases) {
    if (!ISO_DATE.test(release.date)) {
      errors.push(`Data release ${release.version} has an invalid date`);
    }
    if (!release.version || !release.title || !release.reviewedBy) {
      errors.push(`Data release ${release.version} is missing version, title or reviewer`);
    }
  }

  let assessmentCount = 0;
  for (const product of products) {
    try {
      const assessments = assessProduct(product, clauses, instruments, DEMO_AS_OF);
      assessmentCount += assessments.length;
      if (assessments.length === 0) {
        errors.push(`Product ${product.id} produced no assessments`);
      }
    } catch (error) {
      errors.push(
        `Product ${product.id} failed assessment: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  const hero = products.find((product) => product.id === "phone-orbit-2028");
  if (!hero) {
    errors.push("Hero product phone-orbit-2028 is missing");
  } else {
    const heroAssessments = assessProduct(hero, clauses, instruments, DEMO_AS_OF);
    const art11 = heroAssessments.find(
      (assessment) => assessment.clauseId === "eu-batt-art11-removability",
    );
    if (art11?.overall !== "non_compliant") {
      errors.push("Hero scenario check failed: Art. 11 should be non-compliant for the 2028 flagship");
    }
    const batteryPath = heroAssessments.find(
      (assessment) => assessment.clauseId === "eu-1670-battery-availability",
    );
    if (batteryPath?.conformity !== true) {
      errors.push(
        "Hero scenario check failed: the 2023/1670 professional-only battery path should pass",
      );
    }
    const passport = heroAssessments.find(
      (assessment) => assessment.clauseId === "eu-batt-art77-passport-scope",
    );
    if (passport?.overall !== "not_applicable") {
      errors.push("Scope check failed: portable batteries must not require a Battery Passport");
    }
  }

  const adapter = products.find((product) => product.id === "adapter-volt-140w");
  if (!adapter) {
    errors.push("Adapter product adapter-volt-140w is missing");
  } else {
    const adapterAssessments = assessProduct(adapter, clauses, instruments, DEMO_AS_OF);
    const interoperability = adapterAssessments.find(
      (assessment) => assessment.clauseId === "eu-2052-interoperability",
    );
    if (!interoperability?.exemption?.applied) {
      errors.push("Adapter check failed: the >100 W interoperability exemption should apply");
    }
  }

  if (clauses.length < 30) {
    warnings.push(`Only ${clauses.length} clauses loaded; the v1 target is ~40.`);
  }

  return {
    errors,
    warnings,
    stats: {
      instruments: instruments.length,
      clauses: clauses.length,
      products: products.length,
      assessments: assessmentCount,
      risks: risks.length,
      decisions: decisions.length,
      milestones: milestones.length,
      dppFields: dppFields.length,
      watchItems: regulatoryWatch.length,
      dataReleases: dataReleases.length,
    },
  };
}
