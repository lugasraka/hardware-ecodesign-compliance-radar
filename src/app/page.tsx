import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarClock,
  CircleAlert,
  FileText,
  Radar,
} from "lucide-react";
import { clauses } from "@/data/clauses";
import { decisions } from "@/data/decisions";
import { instruments } from "@/data/instruments";
import { milestones } from "@/data/milestones";
import { products } from "@/data/products";
import { risks } from "@/data/risks";
import { DEMO_AS_OF, getPortfolioSummary } from "@/domain/engine";
import { addDays, formatDate } from "@/lib/date";
import { formatPct, formatUsd, sum } from "@/lib/utils";
import { DecisionList } from "@/components/decision-list";
import { MilestoneList } from "@/components/milestone-list";
import { PortfolioHeatmap } from "@/components/portfolio-heatmap";
import {
  CoverageBar,
  KpiCard,
  Panel,
  PageHeader,
} from "@/components/primitives";

export default function PortfolioPage() {
  const summaries = getPortfolioSummary(products, clauses, instruments, DEMO_AS_OF);
  const allAssessments = summaries.flatMap((summary) => summary.assessments);
  const applicable = allAssessments.filter(
    (assessment) => assessment.overall !== "not_applicable",
  );

  const blockers = sum(summaries.map((summary) => summary.blockers));
  const atRisk = sum(summaries.map((summary) => summary.atRisk));
  const late = sum(summaries.map((summary) => summary.late));
  const productsWithLate = summaries.filter((summary) => summary.late > 0).length;
  const evidenceGaps = sum(summaries.map((summary) => summary.evidenceGaps));
  const exposure = summaries.reduce(
    (total, summary) => ({
      low: total.low + summary.exposureUsd.low,
      base: total.base + summary.exposureUsd.base,
      high: total.high + summary.exposureUsd.high,
    }),
    { low: 0, base: 0, high: 0 },
  );

  const coverage =
    summaries.reduce((total, summary) => total + summary.coverage, 0) /
    Math.max(1, summaries.length);
  const evidenceCoverage =
    applicable.length === 0
      ? 1
      : applicable.filter((assessment) => assessment.evidence === "sufficient").length /
        applicable.length;

  const dueSoon = decisions.filter(
    (decision) =>
      decision.status === "pending" &&
      decision.decisionDate >= DEMO_AS_OF &&
      decision.decisionDate <= addDays(DEMO_AS_OF, 90),
  );

  const topRisks = [...risks]
    .filter((risk) => risk.status !== "closed")
    .sort((a, b) => b.likelihood * b.impact - a.likelihood * a.impact)
    .slice(0, 5);

  const marketCount = new Set(products.flatMap((product) => product.markets)).size;

  return (
    <div>
      <PageHeader
        eyebrow="Portfolio review · Q4 2026"
        title="Where the portfolio is exposed — and what needs a decision."
        description={`${products.length} products, ${marketCount} markets, ${clauses.length} regulatory clauses. This view rolls up market-access blockers, schedule collisions, and the decisions due before the next NPI gate.`}
        actions={
          <>
            <Link
              href="/brief/phone-orbit-2028/"
              className="inline-flex items-center gap-1.5 rounded-md bg-blue-700 px-3 py-2 text-[12px] font-medium text-white hover:bg-blue-800"
            >
              <FileText size={14} />
              Open exec brief
            </Link>
            <Link
              href="/methodology/"
              className="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 bg-white px-3 py-2 text-[12px] font-medium text-zinc-700 hover:border-zinc-400"
            >
              Methodology
              <ArrowUpRight size={14} />
            </Link>
          </>
        }
      />

      <div className="mb-6 flex flex-col gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white text-blue-700">
            <Radar size={15} />
          </span>
          <div>
            <p className="text-[12px] font-medium text-blue-950">
              Suggested 5-minute path: follow the Article 11 battery decision.
            </p>
            <p className="mt-0.5 text-[11px] leading-5 text-blue-800">
              Open the 2028 flagship, inspect the schedule collision and derogation
              analysis, then generate the one-page VP brief.
            </p>
          </div>
        </div>
        <Link
          href="/products/phone-orbit-2028/"
          className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold text-blue-800 hover:text-blue-950"
        >
          Open hero scenario
          <ArrowRight size={13} />
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <KpiCard
          label="Products"
          value={products.length}
          detail={`${clauses.length} clauses · ${marketCount} markets`}
          href="/"
        />
        <KpiCard
          label="Market-access blockers"
          value={blockers}
          detail={`${atRisk} additional at-risk findings`}
          tone="danger"
          href="/risks/"
        />
        <KpiCard
          label="Schedule collisions"
          value={productsWithLate}
          detail={`${late} clause-level late items across ${productsWithLate} products`}
          tone={productsWithLate > 0 ? "warning" : "success"}
          href="/products/phone-orbit-2027/#schedule"
        />
        <KpiCard
          label="Decisions due 90 days"
          value={dueSoon.length}
          detail={dueSoon[0] ? `next: ${formatDate(dueSoon[0].decisionDate)}` : "no decisions due"}
          tone="info"
          href="/brief/phone-orbit-2028/"
        />
        <KpiCard
          label="Exposure (base)"
          value={formatUsd(exposure.base)}
          detail={`${formatUsd(exposure.low)} – ${formatUsd(exposure.high)} range`}
          tone="danger"
        />
        <KpiCard
          label="Evidence coverage"
          value={formatPct(evidenceCoverage)}
          detail={`${evidenceGaps} evidence gaps`}
          tone={evidenceCoverage > 0.8 ? "success" : "warning"}
        />
      </div>

      <Panel
        className="mt-5"
        title="Portfolio heatmap"
        description="Worst status per product and regulatory instrument. Numbers show market-access blockers, or at-risk findings when there are no blockers."
        action={
          <span className="text-[10px] text-zinc-500">
            Click a product to open the requirement ledger
          </span>
        }
        bodyClassName="p-0"
      >
        <PortfolioHeatmap
          summaries={summaries}
          clauses={clauses}
          instruments={instruments}
        />
      </Panel>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Panel
          title="Decisions due"
          description="The next executive calls, ordered by decision date."
          action={
            <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 font-mono text-[10px] text-zinc-600">
              {decisions.filter((decision) => decision.status === "pending").length} pending
            </span>
          }
        >
          <DecisionList decisions={decisions} summaries={summaries} />
        </Panel>

        <Panel
          title="Top risks"
          description="Likelihood × impact, before mitigation."
          action={
            <Link
              href="/risks/"
              className="text-[10px] font-medium text-blue-700 hover:text-blue-800"
            >
              Full register
            </Link>
          }
        >
          <div className="space-y-2.5">
            {topRisks.map((risk) => {
              const score = risk.likelihood * risk.impact;
              const tone =
                score >= 20
                  ? "border-red-200 bg-red-50 text-red-800"
                  : score >= 12
                    ? "border-amber-200 bg-amber-50 text-amber-800"
                    : "border-zinc-200 bg-zinc-50 text-zinc-600";
              return (
                <div key={risk.id} className="flex items-start gap-2.5">
                  <span
                    className={`mt-0.5 inline-flex h-6 w-7 shrink-0 items-center justify-center rounded border text-[10px] font-semibold tabular ${tone}`}
                  >
                    {score}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium leading-4 text-zinc-900">
                      {risk.title}
                    </p>
                    <p className="mt-0.5 text-[10px] text-zinc-500">
                      {risk.owner} · due {formatDate(risk.dueDate)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel
          title="Regulatory watch"
          description="The next milestones that can change a program decision."
          action={
            <Link
              href="/pipeline/"
              className="text-[10px] font-medium text-blue-700 hover:text-blue-800"
            >
              Open pipeline
            </Link>
          }
        >
          <MilestoneList milestones={milestones} instruments={instruments} limit={4} />
        </Panel>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Panel
          title="Coverage"
          description="Coverage is a risk in itself: unknown is not compliant."
        >
          <div className="space-y-4">
            <CoverageBar
              value={coverage}
              label="Assessment coverage"
              detail="Applicable clauses with a technical conformity test completed."
            />
            <CoverageBar
              value={evidenceCoverage}
              label="Evidence readiness"
              detail="Applicable clauses with sufficient evidence on file."
            />
            <CoverageBar
              value={1 - late / Math.max(1, applicable.length)}
              label="Schedule readiness"
              detail="Applicable clauses with a decision window still open."
            />
          </div>
          <div className="mt-4 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2">
            <CircleAlert size={14} className="mt-0.5 shrink-0 text-amber-700" />
            <p className="text-[10px] leading-4 text-amber-900">
              A green technical result without evidence is still a market-access risk.
              The engine keeps applicability, conformity, evidence, and program timing
              separate.
            </p>
          </div>
        </Panel>

        <Panel
          title="How to read this workbench"
          description="Three loops, one operating model."
          action={<CalendarClock size={15} className="text-zinc-400" />}
        >
          <ol className="space-y-3">
            {[
              {
                title: "1 · Portfolio",
                body: "See which products carry blockers, evidence gaps, and decisions due before the next gate.",
              },
              {
                title: "2 · Requirement",
                body: "Open a clause to see the legal text, interpretation, predicate trace, owner, gate, and required-by date.",
              },
              {
                title: "3 · Decision",
                body: "Turn the finding into a weighted options matrix and a one-page decision brief.",
              },
            ].map((step) => (
              <li key={step.title} className="flex gap-2.5">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                <div>
                  <p className="text-[11px] font-semibold text-zinc-900">{step.title}</p>
                  <p className="mt-0.5 text-[10px] leading-4 text-zinc-500">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <Link
            href="/methodology/"
            className="mt-4 inline-flex items-center gap-1 text-[10px] font-medium text-blue-700 hover:text-blue-800"
          >
            Read the design rationale
            <ArrowRight size={12} />
          </Link>
        </Panel>
      </div>
    </div>
  );
}
