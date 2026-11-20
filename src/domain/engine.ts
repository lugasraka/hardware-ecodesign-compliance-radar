import {
  evaluatePredicate,
  triAnd,
  type EvaluationContext,
} from "./predicates";
import type { TraceNode } from "./types";
import { computeRepairability } from "./scoring";
import {
  getCollision,
  getGateDate,
  getMarketRelevance,
  getProgramStatus,
  getRequiredBy,
} from "./schedule";
import type {
  Assessment,
  Clause,
  Decision,
  DecisionCriterion,
  DecisionOption,
  EvidenceStatus,
  ExposureRange,
  Instrument,
  MarketCode,
  OverallStatus,
  Product,
  ProductSummary,
  Tri,
} from "./types";

export const DEMO_AS_OF = "2026-11-20";

export interface DerivedValues extends Record<string, unknown> {
  euRepairabilityIndex?: number;
  euRepairabilityClass?: string;
  frIndex?: number;
  euEpsEfficiencyHeadroom?: number;
  dppDelegatedActInForce?: boolean;
}

export function computeDerived(
  product: Product,
  asOf: string = DEMO_AS_OF,
): DerivedValues {
  const derived: DerivedValues = { dppDelegatedActInForce: false };

  if (product.repairability) {
    const result = computeRepairability(product.repairability);
    derived.euRepairabilityIndex = result.index;
    derived.euRepairabilityClass = result.euClass;
    derived.frIndex = result.france.index;
  }

  if (product.specs.power) {
    const { maxOutputW, usbPd, averageActiveEfficiency } = product.specs.power;
    // Regulation (EU) 2025/2052 Art. 9(2): 2019/1782 Annex II point 1 continues
    // to apply to EPS with a USB-PD port above 100 W until 14 Dec 2030.
    const threshold =
      maxOutputW > 100 && usbPd && asOf < "2030-12-14" ? 0.88 : 0.89;
    derived.euEpsEfficiencyHeadroom =
      Math.round((averageActiveEfficiency - threshold) * 1000) / 1000;
  }

  return derived;
}

function resolveEvidence(product: Product, clause: Clause): EvidenceStatus {
  const override = product.evidenceOverrides?.[clause.id];
  if (override) return override;
  if (clause.evidence.length === 0) return "sufficient";
  if (product.status === "in_market") return "sufficient";
  if (product.status === "monitoring") return "partial";

  const defaults = clause.evidence.map((requirement) => requirement.defaultStatus);
  if (defaults.includes("missing")) return "missing";
  if (defaults.includes("expired")) return "expired";
  if (defaults.includes("partial")) return "partial";
  return "sufficient";
}

function computeExposure(
  product: Product,
  market: MarketCode,
  overall: OverallStatus,
  severity: Clause["severity"],
): ExposureRange {
  const units = product.annualUnits[market] ?? 0;
  const asp = product.aspUsd[market] ?? 0;

  const complianceFactor =
    overall === "non_compliant"
      ? 1
      : overall === "at_risk"
        ? 0.35
        : overall === "unknown"
          ? 0.15
          : 0;

  const severityFactor =
    severity === "market_access" ? 1 : severity === "labeling_penalty" ? 0.25 : 0.1;

  const base = Math.round(units * asp * complianceFactor * severityFactor);
  return {
    low: Math.round(base * 0.5),
    base,
    high: Math.round(base * 1.5),
  };
}

const STATUS_PRIORITY: Record<OverallStatus, number> = {
  non_compliant: 4,
  at_risk: 3,
  unknown: 2,
  compliant: 1,
  not_applicable: 0,
};

const SEVERITY_PRIORITY: Record<Clause["severity"], number> = {
  market_access: 3,
  labeling_penalty: 2,
  monitoring: 1,
};

function computeProductExposure(
  product: Product,
  assessments: Assessment[],
  clauseById: Map<string, Clause>,
): ExposureRange {
  const byMarket = new Map<MarketCode, Assessment[]>();
  for (const assessment of assessments) {
    const list = byMarket.get(assessment.market) ?? [];
    list.push(assessment);
    byMarket.set(assessment.market, list);
  }

  return Array.from(byMarket.entries()).reduce(
    (total, [market, marketAssessments]) => {
      const worstStatus = marketAssessments.reduce<OverallStatus>(
        (worst, assessment) =>
          STATUS_PRIORITY[assessment.overall] > STATUS_PRIORITY[worst]
            ? assessment.overall
            : worst,
        "compliant",
      );
      const worstSeverity = marketAssessments
        .filter((assessment) => assessment.overall === worstStatus)
        .reduce<Clause["severity"]>((worst, assessment) => {
          const clause = clauseById.get(assessment.clauseId);
          if (!clause) return worst;
          return SEVERITY_PRIORITY[clause.severity] > SEVERITY_PRIORITY[worst]
            ? clause.severity
            : worst;
        }, "monitoring");

      const exposure = computeExposure(product, market, worstStatus, worstSeverity);
      return {
        low: total.low + exposure.low,
        base: total.base + exposure.base,
        high: total.high + exposure.high,
      };
    },
    { low: 0, base: 0, high: 0 },
  );
}

function failedLabels(trace: TraceNode): string[] {
  const labels: string[] = [];
  const walk = (node: TraceNode) => {
    if (node.result === false && (!node.children || node.children.length === 0)) {
      labels.push(node.label);
    }
    node.children?.forEach(walk);
  };
  walk(trace);
  return labels;
}

function unknownLabels(trace: TraceNode): string[] {
  const labels: string[] = [];
  const walk = (node: TraceNode) => {
    if (node.result === "unknown" && (!node.children || node.children.length === 0)) {
      labels.push(node.label);
    }
    node.children?.forEach(walk);
  };
  walk(trace);
  return labels;
}

export function assessClause(
  product: Product,
  market: MarketCode,
  clause: Clause,
  instrument: Instrument | undefined,
  asOf: string,
  derived: DerivedValues,
): Assessment | null {
  const appliesToMarket =
    clause.markets.includes(market) || (clause.subMarket === "FR" && market === "EU");
  if (!appliesToMarket) return null;

  const context: EvaluationContext = {
    // Flatten specs into the product namespace so clause predicates can use
    // human-readable paths such as product.battery.cyclesTo80Pct.
    product: { ...product, ...product.specs },
    market,
    asOf,
    derived,
  };

  const applicabilityTrace = evaluatePredicate(clause.applicability, context);
  const gateDate = getGateDate(product, clause.lockInGate);
  const requiredBy = getRequiredBy(
    product,
    clause.lockInGate,
    clause.qualificationLeadWeeks,
    clause.decisionBufferWeeks,
  );
  const marketRelevance = instrument
    ? getMarketRelevance(product, instrument.applicationDate)
    : "unknown";

  if (applicabilityTrace.result === false) {
    return {
      productId: product.id,
      market,
      clauseId: clause.id,
      asOf,
      applicability: false,
      conformity: false,
      evidence: "sufficient",
      overall: "not_applicable",
      programStatus: "not_applicable",
      collision: "none",
      marketRelevance,
      gateDate,
      requiredBy,
      exposureUsd: { low: 0, base: 0, high: 0 },
      trace: {
        label: clause.title,
        result: false,
        children: [applicabilityTrace],
      },
      reasons: ["Not in scope for this product and market."],
    };
  }

  const exemptionTraces: TraceNode[] = [];
  let appliedExemption: Assessment["exemption"];

  for (const exemption of clause.exemptions ?? []) {
    const trace = evaluatePredicate(exemption.predicate, context);
    exemptionTraces.push(trace);
    if (trace.result === true && !appliedExemption) {
      appliedExemption = {
        id: exemption.id,
        label: exemption.label,
        applied: true,
        evidence: exemption.requiredEvidence,
      };
    }
  }

  const conformityTrace = clause.conformity
    ? evaluatePredicate(clause.conformity, context)
    : { label: "No technical conformity test (procedural clause)", result: true as Tri };

  const conformity: Tri = appliedExemption ? true : conformityTrace.result;
  const evidence = resolveEvidence(product, clause);

  let overall: OverallStatus;
  if (applicabilityTrace.result === "unknown") {
    overall = "unknown";
  } else if (appliedExemption) {
    overall = evidence === "sufficient" ? "compliant" : "at_risk";
  } else if (conformity === false) {
    overall = "non_compliant";
  } else if (conformity === "unknown") {
    overall = "unknown";
  } else if (evidence !== "sufficient") {
    overall = "at_risk";
  } else {
    overall = "compliant";
  }

  const programStatus = getProgramStatus(requiredBy, asOf);
  const collision = getCollision(programStatus);

  const reasons: string[] = [];

  if (appliedExemption) {
    reasons.push(`Derogation path claimed: ${appliedExemption.label}.`);
    if (evidence !== "sufficient") {
      reasons.push("Derogation evidence is not yet sufficient for market access.");
    }
  } else if (conformity === false) {
    const failed = failedLabels(conformityTrace);
    reasons.push(
      failed.length > 0
        ? `Does not meet: ${failed.slice(0, 3).join("; ")}.`
        : "Technical conformity test failed.",
    );
  } else if (conformity === "unknown") {
    const missing = unknownLabels(conformityTrace);
    reasons.push(
      missing.length > 0
        ? `Insufficient product data: ${missing.slice(0, 3).join("; ")}.`
        : "Insufficient product data to assess conformity.",
    );
  }

  if (evidence !== "sufficient") {
    const evidenceLabels = clause.evidence.map((requirement) => requirement.label);
    reasons.push(
      evidenceLabels.length > 0
        ? `Evidence ${evidence}: ${evidenceLabels.slice(0, 3).join("; ")}.`
        : `Evidence ${evidence}.`,
    );
  }

  if (programStatus === "late") {
    reasons.push(
      `Decision required by ${requiredBy}, before the ${clause.lockInGate} gate on ${gateDate}.`,
    );
  } else if (programStatus === "act_now") {
    reasons.push(
      `Decision window closes soon: required by ${requiredBy} for the ${clause.lockInGate} gate.`,
    );
  }

  if (marketRelevance === "mid_life") {
    reasons.push(
      `Applies mid-life: the product remains on sale until ${product.endOfSaleDate}.`,
    );
  } else if (marketRelevance === "never") {
    reasons.push("Rule applies after this product leaves the market.");
  }

  if (reasons.length === 0) {
    reasons.push("Meets the requirement and evidence is sufficient.");
  }

  return {
    productId: product.id,
    market,
    clauseId: clause.id,
    asOf,
    applicability: applicabilityTrace.result,
    conformity,
    evidence,
    overall,
    programStatus,
    collision,
    marketRelevance,
    gateDate,
    requiredBy,
    exemption: appliedExemption,
    exposureUsd: computeExposure(product, market, overall, clause.severity),
    trace: {
      label: clause.title,
      result: triAnd([applicabilityTrace.result, conformity]),
      children: [applicabilityTrace, conformityTrace, ...exemptionTraces],
    },
    reasons,
  };
}

export function assessProduct(
  product: Product,
  clauses: Clause[],
  instruments: Instrument[],
  asOf: string = DEMO_AS_OF,
): Assessment[] {
  const instrumentById = new Map(instruments.map((instrument) => [instrument.id, instrument]));
  const derived = computeDerived(product, asOf);
  const assessments: Assessment[] = [];

  for (const clause of clauses) {
    for (const market of product.markets) {
      const assessment = assessClause(
        product,
        market,
        clause,
        instrumentById.get(clause.instrumentId),
        asOf,
        derived,
      );
      if (assessment) assessments.push(assessment);
    }
  }

  return assessments.sort((a, b) => {
    const clauseA = clauses.find((clause) => clause.id === a.clauseId);
    const clauseB = clauses.find((clause) => clause.id === b.clauseId);
    const severityOrder = { market_access: 0, labeling_penalty: 1, monitoring: 2 };
    const statusOrder = {
      non_compliant: 0,
      at_risk: 1,
      unknown: 2,
      compliant: 3,
      not_applicable: 4,
    };
    const aSeverity = clauseA ? severityOrder[clauseA.severity] : 9;
    const bSeverity = clauseB ? severityOrder[clauseB.severity] : 9;
    if (aSeverity !== bSeverity) return aSeverity - bSeverity;
    if (statusOrder[a.overall] !== statusOrder[b.overall]) {
      return statusOrder[a.overall] - statusOrder[b.overall];
    }
    return a.clauseId.localeCompare(b.clauseId);
  });
}

export function getProductSummary(
  product: Product,
  clauses: Clause[],
  instruments: Instrument[],
  asOf: string = DEMO_AS_OF,
): ProductSummary {
  const assessments = assessProduct(product, clauses, instruments, asOf);
  const clauseById = new Map(clauses.map((clause) => [clause.id, clause]));

  const applicable = assessments.filter(
    (assessment) => assessment.overall !== "not_applicable",
  );

  const blockers = applicable.filter((assessment) => {
    const clause = clauseById.get(assessment.clauseId);
    return assessment.overall === "non_compliant" && clause?.severity === "market_access";
  }).length;

  const atRisk = applicable.filter(
    (assessment) => assessment.overall === "at_risk",
  ).length;

  const evidenceGaps = applicable.filter(
    (assessment) => assessment.evidence !== "sufficient",
  ).length;

  const late = applicable.filter(
    (assessment) => assessment.programStatus === "late",
  ).length;

  const exposureUsd = computeProductExposure(product, applicable, clauseById);

  const coverage =
    applicable.length === 0
      ? 1
      : applicable.filter((assessment) => assessment.conformity !== "unknown").length /
        applicable.length;

  const overall: OverallStatus =
    blockers > 0
      ? "non_compliant"
      : atRisk > 0
        ? "at_risk"
        : applicable.length === 0
          ? "not_applicable"
          : "compliant";

  return {
    product,
    assessments,
    blockers,
    atRisk,
    evidenceGaps,
    late,
    exposureUsd,
    overall,
    coverage,
  };
}

export function getPortfolioSummary(
  products: Product[],
  clauses: Clause[],
  instruments: Instrument[],
  asOf: string = DEMO_AS_OF,
): ProductSummary[] {
  return products
    .map((product) => getProductSummary(product, clauses, instruments, asOf))
    .sort((a, b) => b.blockers - a.blockers || b.exposureUsd.base - a.exposureUsd.base);
}

export interface ScoredOption {
  option: DecisionOption;
  score: number;
  weighted: Record<string, number>;
}

export function scoreDecision(
  decision: Decision,
  criteria: DecisionCriterion[],
): ScoredOption[] {
  const totalWeight = criteria.reduce((total, criterion) => total + criterion.weight, 0);
  return decision.options
    .map((option) => {
      const weighted = criteria.reduce(
        (scores, criterion) => {
          scores[criterion.key] = option.scores[criterion.key] * criterion.weight;
          return scores;
        },
        {} as Record<string, number>,
      );
      const score =
        totalWeight === 0
          ? 0
          : Object.values(weighted).reduce((total, value) => total + value, 0) /
            totalWeight;
      return { option, score: Math.round(score * 10) / 10, weighted };
    })
    .sort((a, b) => b.score - a.score);
}

export function getNextDecisionDate(decisions: Decision[], asOf: string): string | null {
  const upcoming = decisions
    .filter((decision) => decision.status === "pending" && decision.decisionDate >= asOf)
    .map((decision) => decision.decisionDate)
    .sort();
  return upcoming[0] ?? null;
}
