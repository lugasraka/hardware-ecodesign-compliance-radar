import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  CircleAlert,
  FileText,
  Radar,
  ScanSearch,
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
import { StartTourButton } from "@/components/start-tour-button";

export default function PortfolioPage() {
  const summaries = getPortfolioSummary(products, clauses, instruments, DEMO_AS_OF);
  const allAssessments = summaries.flatMap((summary) => summary.assessments);
  const applicable = allAssessments.filter(
    (assessment) => assessment.overall !== "not_applicable",
  );

  const blockers = sum(summaries.map((summary) => summary.blockers));
  const productsWithBlockers = summaries.filter(
    (summary) => summary.blockers > 0,
  ).length;
  const late = sum(summaries.map((summary) => summary.late));
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
      : applicable.filter((assessment) => assessment.evidence === "sufficient")
          .length / applicable.length;

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
        title="What needs a decision."
        description={`${productsWithBlockers} products have market-access blockers. ${dueSoon.length} executive decisions are due in the next 90 days. Start with the battery decision, then scan the portfolio.`}
      />

      <section className="mb-5 overflow-hidden rounded-xl border border-blue-200 bg-blue-50">
        <div className="grid gap-5 p-5 lg:grid-cols-[1.35fr_1fr]">
          <div>
            <p className="label text-blue-700">Start here</p>
            <h2 className="mt-1 max-w-2xl text-xl font-semibold tracking-tight text-blue-950 sm:text-2xl">
              Follow one decision from regulation to recommendation.
            </h2>
            <p className="mt-2 max-w-xl text-[13px] leading-5 text-blue-900">
              A three-minute path through one product&apos;s blocker and the executive
              brief. The full ledger and methodology are here when you need them.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Link
                href="/products/phone-orbit-2028/"
                className="inline-flex items-center gap-1.5 rounded-md bg-blue-700 px-3 py-2 text-[13px] font-medium text-white hover:bg-blue-800"
              >
                Follow the battery decision
                <ArrowRight size={14} />
              </Link>
              <StartTourButton />
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
            <Link
              href="#portfolio-detail"
              className="group flex items-start gap-3 rounded-lg border border-blue-200 bg-white px-3 py-2.5 hover:border-blue-300"
            >
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-700">
                <ScanSearch size={14} />
              </span>
              <span>
                <span className="block text-[13px] font-medium text-zinc-900">
                  Scan the portfolio
                </span>
                <span className="mt-0.5 block text-[12px] leading-4 text-zinc-500">
                  Heatmap, top risks, regulatory watch, coverage
                </span>
              </span>
              <ChevronRight
                size={13}
                className="ml-auto mt-1 shrink-0 text-zinc-300 group-hover:text-blue-600"
              />
            </Link>
            <Link
              href="/methodology/"
              className="group flex items-start gap-3 rounded-lg border border-blue-200 bg-white px-3 py-2.5 hover:border-blue-300"
            >
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-700">
                <BookOpen size={14} />
              </span>
              <span>
                <span className="block text-[13px] font-medium text-zinc-900">
                  Read the methodology
                </span>
                <span className="mt-0.5 block text-[12px] leading-4 text-zinc-500">
                  Engine, scheduling model, sources, limits
                </span>
              </span>
              <ChevronRight
                size={13}
                className="ml-auto mt-1 shrink-0 text-zinc-300 group-hover:text-blue-600"
              />
            </Link>
          </div>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        <KpiCard
          label="Can’t sell as-is"
          value={productsWithBlockers}
          detail={`${blockers} market-access findings across ${products.length} products`}
          tone="danger"
          href="#portfolio-detail"
        />
        <KpiCard
          label="Decisions due"
          value={dueSoon.length}
          detail={
            dueSoon[0]
              ? `next: ${formatDate(dueSoon[0].decisionDate)}`
              : "no decisions in the next 90 days"
          }
          tone="info"
          href="/brief/phone-orbit-2028/"
        />
        <KpiCard
          label="Revenue exposed"
          value={formatUsd(exposure.base)}
          detail={`${formatUsd(exposure.low)} to ${formatUsd(exposure.high)} range`}
          tone="danger"
        />
      </div>

      <Panel
        className="mt-5"
        title="Decisions that need attention"
        description="The next executive calls, ordered by decision date. Open one to see the executive summary and one-page PDF."
        action={
          <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 font-mono text-[12px] text-zinc-600">
            {decisions.filter((decision) => decision.status === "pending").length} pending
          </span>
        }
      >
        <DecisionList decisions={decisions} summaries={summaries} />
      </Panel>

      <details
        id="portfolio-detail"
        className="group mt-5 scroll-mt-24 rounded-lg border border-zinc-200 bg-white"
      >
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="text-[13px] font-semibold tracking-tight text-zinc-900">
              Portfolio detail
            </p>
            <p className="mt-0.5 text-[13px] text-zinc-500">
              Heatmap, top risks, regulatory watch, and coverage. Open when you want the
              full picture.
            </p>
          </div>
          <span className="flex shrink-0 items-center gap-1 text-[13px] font-medium text-blue-700">
            <span className="group-open:hidden">Open</span>
            <span className="hidden group-open:inline">Close</span>
            <ChevronRight
              size={13}
              className="transition-transform group-open:rotate-90"
            />
          </span>
        </summary>

        <div className="space-y-5 border-t border-zinc-200 p-4">
          <Panel
            title="Portfolio heatmap"
            description="Worst status per product and regulatory instrument. Numbers show market-access blockers, or at-risk findings when there are no blockers."
            action={
              <span className="text-[12px] text-zinc-500">
                {products.length} products · {marketCount} markets · {clauses.length}{" "}
                clauses
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

          <div className="grid gap-4 lg:grid-cols-3">
            <Panel
              title="Top risks"
              description="Likelihood × impact, before mitigation."
              action={
                <Link
                  href="/risks/"
                  className="text-[12px] font-medium text-blue-700 hover:text-blue-800"
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
                        className={`mt-0.5 inline-flex h-6 w-7 shrink-0 items-center justify-center rounded border text-[12px] font-semibold tabular ${tone}`}
                      >
                        {score}
                      </span>
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium leading-4 text-zinc-900">
                          {risk.title}
                        </p>
                        <p className="mt-0.5 text-[12px] text-zinc-500">
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
                  className="text-[12px] font-medium text-blue-700 hover:text-blue-800"
                >
                  Pipeline
                </Link>
              }
            >
              <MilestoneList
                milestones={milestones}
                instruments={instruments}
                limit={4}
              />
            </Panel>

            <Panel
              title="Coverage"
              description="Unknown is not compliant."
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
                <p className="text-[12px] leading-4 text-amber-900">
                  {evidenceGaps} evidence gaps across the portfolio. A technical pass
                  without an artifact is still a market-access risk.
                </p>
              </div>
            </Panel>
          </div>
        </div>
      </details>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <Radar size={14} className="text-zinc-400" />
          <p className="text-[12px] text-zinc-500">
            {formatPct(coverage)} assessment coverage · {formatPct(evidenceCoverage)}{" "}
            evidence readiness · {late} late items
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/brief/phone-orbit-2028/"
            className="inline-flex items-center gap-1 text-[12px] font-medium text-blue-700 hover:text-blue-800"
          >
            <FileText size={11} />
            Open exec brief
          </Link>
          <Link
            href="/methodology/#sources"
            className="text-[12px] font-medium text-zinc-500 hover:text-blue-700"
          >
            Sources
          </Link>
        </div>
      </div>
    </div>
  );
}
