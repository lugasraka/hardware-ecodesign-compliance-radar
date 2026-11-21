import { clauses } from "@/data/clauses";
import { decisions } from "@/data/decisions";
import { instruments } from "@/data/instruments";
import { productById } from "@/data/products";
import { decisionCriteria } from "@/data/risks";
import { risks } from "@/data/risks";
import {
  DEMO_AS_OF,
  getProductSummary,
  scoreDecision,
  type ScoredOption,
} from "@/domain/engine";
import type {
  Assessment,
  Clause,
  Decision,
  DecisionCriterion,
  Instrument,
  Product,
  ProductSummary,
  Risk,
} from "@/domain/types";
import { formatDate } from "@/lib/date";
import { formatUsd } from "@/lib/utils";

export interface BriefData {
  product: Product;
  summary: ProductSummary;
  decision: Decision;
  criteria: DecisionCriterion[];
  scoredOptions: ScoredOption[];
  topRisks: Risk[];
  primaryAssessments: Assessment[];
  primaryClause?: Clause;
  primaryInstrument?: Instrument;
  ask: string;
  whyNow: string[];
  owners: { workstream: string; owner: string; gate: string; requiredBy: string }[];
  markdown: string;
}

function buildMarkdown({
  product,
  decision,
  scoredOptions,
  criteria,
  whyNow,
  owners,
  topRisks,
  summary,
  ask,
}: {
  product: Product;
  decision: Decision;
  scoredOptions: ScoredOption[];
  criteria: DecisionCriterion[];
  whyNow: string[];
  owners: { workstream: string; owner: string; gate: string; requiredBy: string }[];
  topRisks: Risk[];
  summary: ProductSummary;
  ask: string;
}): string {
  const optionRows = scoredOptions
    .map((scored) => {
      const option = scored.option;
      return `| ${option.id.toUpperCase()} · ${option.label} | ${option.scores.marketAccess} | ${option.scores.cost} | ${option.scores.schedule} | ${option.scores.design} | ${option.scores.confidence} | ${scored.score.toFixed(1)} |`;
    })
    .join("\n");

  const ownerRows = owners
    .map(
      (owner) =>
        `| ${owner.workstream} | ${owner.owner} | ${owner.gate} | ${formatDate(owner.requiredBy)} |`,
    )
    .join("\n");

  const riskRows = topRisks
    .map(
      (risk) =>
        `| ${risk.title} | ${risk.likelihood * risk.impact} | ${risk.owner} | ${formatDate(risk.dueDate)} |`,
    )
    .join("\n");

  return `# Executive decision brief: ${product.name}

**Decision owner:** ${decision.owner}  
**Decision date:** ${formatDate(decision.decisionDate)}  
**Prepared:** ${formatDate(DEMO_AS_OF)}  
**Status:** Illustrative working draft. Not legal advice.

## The ask

${ask}

## Why now

${whyNow.map((line) => `- ${line}`).join("\n")}

## Exposure

- Market-access blockers: ${summary.blockers}
- At-risk findings: ${summary.atRisk}
- Evidence gaps: ${summary.evidenceGaps}
- Revenue at risk (base): ${formatUsd(summary.exposureUsd.base)} (${formatUsd(summary.exposureUsd.low)} to ${formatUsd(summary.exposureUsd.high)})
- Markets: ${product.markets.join(", ")}

## Decision matrix

Scores 1 to 5, where 5 is best. Weights: ${criteria
    .map((criterion) => `${criterion.label} ${Math.round(criterion.weight * 100)}%`)
    .join(" · ")}.

| Option | Market access | Cost | Schedule | Design | Confidence | Weighted |
|---|---|---|---|---|---|---|
${optionRows}

## Recommendation

${decision.recommendation}

## What would change the recommendation

${decision.whatWouldChange}

${decision.dissent ? `## Dissent and open questions\n\n${decision.dissent}\n` : ""}

## Owners and gates

| Workstream | Accountable owner | Lock-in gate | Required by |
|---|---|---|---|
${ownerRows}

## Top risks

| Risk | Score | Owner | Due |
|---|---|---|---|
${riskRows}

## Sources

- EU 2023/1670: https://eur-lex.europa.eu/eli/reg/2023/1670/oj/eng
- EU 2023/1542: https://eur-lex.europa.eu/eli/reg/2023/1542/oj/eng
- EU 2023/1669: https://eur-lex.europa.eu/eli/reg_del/2023/1669/oj/eng
- EU 2024/1781: https://eur-lex.europa.eu/eli/reg/2024/1781/oj/eng
- EU 2025/2052: https://eur-lex.europa.eu/eli/reg/2025/2052/oj/eng

---

Illustrative product and program data. Regulatory data last verified ${formatDate(
    DEMO_AS_OF,
  )}. Not legal advice. Built for electronics and hardware product teams.
`;
}

export function buildBrief(
  product: Product,
  summary: ProductSummary,
  decision: Decision,
  productRisks: Risk[],
  criteria: DecisionCriterion[] = decisionCriteria,
): BriefData {
  const scoredOptions = scoreDecision(decision, criteria);
  const top = scoredOptions[0];
  const primaryAssessments = summary.assessments
    .filter(
      (assessment) =>
        assessment.overall === "non_compliant" || assessment.overall === "at_risk",
    )
    .slice(0, 5);

  const primaryAssessment = primaryAssessments[0];
  const primaryClause = primaryAssessment
    ? clauses.find((clause) => clause.id === primaryAssessment.clauseId)
    : undefined;
  const primaryInstrument = primaryClause
    ? instruments.find((instrument) => instrument.id === primaryClause.instrumentId)
    : undefined;

  const ask = top
    ? `Approve Option ${top.option.id.toUpperCase()}: ${top.option.label}, by ${formatDate(
        decision.decisionDate,
      )}.`
    : "Confirm the compliance position and assign owners to the top findings.";

  const whyNow: string[] = [];
  if (primaryClause && primaryAssessment) {
    whyNow.push(
      `${primaryClause.articleRef} applies from ${formatDate(
        primaryInstrument?.applicationDate,
      )}; the product remains on sale until ${formatDate(product.endOfSaleDate)}.`,
    );
    whyNow.push(
      `The ${primaryClause.lockInGate} gate is ${formatDate(
        primaryAssessment.gateDate,
      )}. With ${primaryClause.qualificationLeadWeeks} weeks of qualification and ${
        primaryClause.decisionBufferWeeks
      } weeks of buffer, the decision is due ${formatDate(primaryAssessment.requiredBy)}.`,
    );
  }
  whyNow.push(
    `Current position: ${summary.blockers} market-access blockers, ${summary.atRisk} at-risk findings, ${summary.evidenceGaps} evidence gaps.`,
  );
  if (primaryAssessment?.programStatus === "late") {
    whyNow.push(
      "The required-by date has passed. This is now an escalation, not a planned decision.",
    );
  } else if (primaryAssessment?.programStatus === "act_now") {
    whyNow.push(
      "The decision window is inside 90 days. The next gate cannot absorb another review cycle.",
    );
  }

  const owners = primaryAssessments
    .map((assessment) => {
      const clause = clauses.find((item) => item.id === assessment.clauseId);
      if (!clause) return null;
      return {
        workstream: clause.title,
        owner: clause.accountableTeam,
        gate: clause.lockInGate,
        requiredBy: assessment.requiredBy,
      };
    })
    .filter(
      (owner): owner is NonNullable<typeof owner> => owner !== null,
    );

  const uniqueOwners = Array.from(
    new Map(owners.map((owner) => [owner.workstream, owner])).values(),
  ).slice(0, 6);

  const topRisks = [...productRisks]
    .sort((a, b) => b.likelihood * b.impact - a.likelihood * a.impact)
    .slice(0, 3);

  const markdown = buildMarkdown({
    product,
    decision,
    scoredOptions,
    criteria,
    whyNow,
    owners: uniqueOwners,
    topRisks,
    summary,
    ask,
  });

  return {
    product,
    summary,
    decision,
    criteria,
    scoredOptions,
    topRisks,
    primaryAssessments,
    primaryClause,
    primaryInstrument,
    ask,
    whyNow,
    owners: uniqueOwners,
    markdown,
  };
}

export function getBriefForProduct(
  id: string,
  asOf: string = DEMO_AS_OF,
): BriefData | null {
  const product = productById.get(id);
  if (!product) return null;
  const summary = getProductSummary(product, clauses, instruments, asOf);
  const decision =
    decisions.find(
      (item) => item.productId === id && item.status === "pending",
    ) ?? decisions.find((item) => item.productId === id);
  if (!decision) return null;
  const productRisks = risks.filter((risk) => risk.productId === id);
  return buildBrief(product, summary, decision, productRisks);
}
