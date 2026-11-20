import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  FileText,
  ShieldAlert,
} from "lucide-react";
import { clauses } from "@/data/clauses";
import { decisions } from "@/data/decisions";
import { instruments } from "@/data/instruments";
import { milestones } from "@/data/milestones";
import { productById, products } from "@/data/products";
import { risks } from "@/data/risks";
import {
  DEMO_AS_OF,
  getProductSummary,
} from "@/domain/engine";
import {
  computeRepairability,
  computeRepairabilityLevers,
} from "@/domain/scoring";
import { getGateDates, getNextGate, getPhase } from "@/domain/schedule";
import { formatDate } from "@/lib/date";
import { formatUsd } from "@/lib/utils";
import { EvidenceSummary } from "@/components/evidence-summary";
import { GanttChart } from "@/components/gantt-chart";
import { ProductRisks } from "@/components/product-risks";
import {
  KpiCard,
  MarketBadge,
  PageHeader,
  Panel,
  StatusPill,
} from "@/components/primitives";
import { RepairabilityPanel } from "@/components/repairability-panel";
import { RequirementsTable } from "@/components/requirements-table";

export function generateStaticParams() {
  return products.map((product) => ({ id: product.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = productById.get(id);
  if (!product) return { title: "Product not found" };
  return {
    title: `${product.name} · compliance ledger`,
    description: product.description,
  };
}

const SECTION_LINKS = [
  { href: "#requirements", label: "Requirements" },
  { href: "#schedule", label: "Schedule" },
  { href: "#repairability", label: "Repairability" },
  { href: "#evidence", label: "Evidence" },
  { href: "#risks", label: "Risks & decisions" },
];

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = productById.get(id);
  if (!product) notFound();

  const summary = getProductSummary(product, clauses, instruments, DEMO_AS_OF);
  const productRisks = risks.filter((risk) => risk.productId === product.id);
  const productDecisions = decisions.filter(
    (decision) => decision.productId === product.id,
  );
  const gateDates = getGateDates(product);
  const nextGate = getNextGate(product, DEMO_AS_OF);
  const phase = getPhase(product, DEMO_AS_OF);

  const repairability = product.repairability
    ? computeRepairability(product.repairability)
    : null;
  const levers = product.repairability
    ? computeRepairabilityLevers(product.repairability)
    : [];

  const primaryConstraint = summary.assessments.find(
    (assessment) =>
      assessment.overall === "non_compliant" &&
      clauses.find((clause) => clause.id === assessment.clauseId)?.severity ===
        "market_access",
  );
  const primaryClause = primaryConstraint
    ? clauses.find((clause) => clause.id === primaryConstraint.clauseId)
    : null;

  return (
    <div>
      <PageHeader
        eyebrow={`${product.archetype} · ${product.businessUnit}`}
        title={product.name}
        description={product.description}
        actions={
          <>
            {productDecisions.length > 0 ? (
              <Link
                href={`/brief/${product.id}/`}
                className="inline-flex items-center gap-1.5 rounded-md bg-blue-700 px-3 py-2 text-[12px] font-medium text-white hover:bg-blue-800"
              >
                <FileText size={14} />
                Open decision brief
              </Link>
            ) : null}
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 bg-white px-3 py-2 text-[12px] font-medium text-zinc-700 hover:border-zinc-400"
            >
              <ArrowLeft size={14} />
              Portfolio
            </Link>
          </>
        }
      />

      <div className="mb-5 grid gap-px overflow-hidden rounded-lg border border-zinc-200 bg-zinc-200 sm:grid-cols-2 lg:grid-cols-6">
        {[
          {
            label: "Markets",
            value: (
              <div className="flex flex-wrap gap-1">
                {product.markets.map((market) => (
                  <MarketBadge key={market} market={market} />
                ))}
              </div>
            ),
          },
          { label: "Launch", value: formatDate(product.launchDate) },
          { label: "End of sale", value: formatDate(product.endOfSaleDate) },
          { label: "Program phase", value: phase },
          {
            label: "Next gate",
            value: nextGate
              ? `${nextGate.gate} · ${formatDate(nextGate.date)}`
              : "Post-MP",
          },
          { label: "Product ID", value: <span className="font-mono">{product.id}</span> },
        ].map((item) => (
          <div key={item.label} className="bg-white px-3 py-2.5">
            <p className="label">{item.label}</p>
            <div className="mt-1 text-[11px] font-medium text-zinc-800">
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {primaryConstraint && primaryClause ? (
        <div className="mb-5 flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white text-red-700">
              <ShieldAlert size={15} />
            </span>
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-red-700">
                Binding constraint
              </p>
              <p className="mt-0.5 text-[13px] font-semibold text-red-950">
                {primaryClause.title}
              </p>
              <p className="mt-0.5 text-[11px] leading-5 text-red-800">
                {primaryConstraint.reasons[0]}
              </p>
            </div>
          </div>
          <a
            href="#requirements"
            className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold text-red-800 hover:text-red-950"
          >
            Open requirement
            <ArrowRight size={13} />
          </a>
        </div>
      ) : null}

      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <KpiCard
          label="Market-access blockers"
          value={summary.blockers}
          detail="non-compliant, market-access severity"
          tone="danger"
        />
        <KpiCard
          label="At risk"
          value={summary.atRisk}
          detail="evidence gaps or derogation claims"
          tone="warning"
        />
        <KpiCard
          label="Evidence gaps"
          value={summary.evidenceGaps}
          detail="applicable clauses without sufficient evidence"
          tone="warning"
        />
        <KpiCard
          label="Late decisions"
          value={summary.late}
          detail="required-by date already passed"
          tone={summary.late > 0 ? "danger" : "success"}
        />
        <KpiCard
          label="Exposure (base)"
          value={formatUsd(summary.exposureUsd.base)}
          detail={`${formatUsd(summary.exposureUsd.low)} – ${formatUsd(summary.exposureUsd.high)}`}
          tone="danger"
        />
        <KpiCard
          label="Overall"
          value={<StatusPill status={summary.overall} />}
          detail={`${summary.assessments.filter((assessment) => assessment.overall !== "not_applicable").length} applicable assessments`}
          tone="info"
        />
      </div>

      <nav className="sticky top-0 z-10 -mx-4 mb-5 border-b border-zinc-200 bg-paper/95 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6 lg:top-[49px] lg:-mx-8 lg:px-8">
        <div className="flex gap-4 overflow-x-auto">
          {SECTION_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="whitespace-nowrap py-1 text-[11px] font-medium text-zinc-600 hover:text-blue-700"
            >
              {link.label}
            </a>
          ))}
          <span className="ml-auto hidden items-center gap-1 whitespace-nowrap font-mono text-[9px] text-zinc-400 sm:flex">
            <CalendarClock size={10} />
            As of {formatDate(DEMO_AS_OF)}
          </span>
        </div>
      </nav>

      <section id="requirements" className="scroll-mt-24">
        <Panel
          title="Requirement ledger"
          description="Every applicable clause, its status, evidence, owner, lock-in gate, and required-by date. Select a row to see the legal source and the exact predicate trace. Attributed exposure is per clause; the product roll-up de-duplicates across clauses."
          action={
            <span className="font-mono text-[10px] text-zinc-500">
              {summary.assessments.length} assessments
            </span>
          }
          bodyClassName="p-3"
        >
          <RequirementsTable
            assessments={summary.assessments}
            clauses={clauses}
            instruments={instruments}
            markets={product.markets}
          />
        </Panel>
      </section>

      <section id="schedule" className="mt-5 scroll-mt-24">
        <GanttChart
          product={product}
          assessments={summary.assessments}
          clauses={clauses}
          milestones={milestones}
        />
      </section>

      <section id="repairability" className="mt-5 scroll-mt-24">
        <RepairabilityPanel product={product} result={repairability} levers={levers} />
      </section>

      <section id="evidence" className="mt-5 scroll-mt-24">
        <EvidenceSummary assessments={summary.assessments} clauses={clauses} />
      </section>

      <section id="risks" className="mt-5 scroll-mt-24">
        <ProductRisks risks={productRisks} decisions={productDecisions} />
      </section>

      <div className="mt-5 rounded-lg border border-zinc-200 bg-white px-4 py-3">
        <p className="text-[10px] leading-5 text-zinc-500">
          Gate dates:{" "}
          {Object.entries(gateDates)
            .map(([gate, date]) => `${gate} ${formatDate(date)}`)
            .join(" · ")}
          . Default gate offsets are illustrative and overridable per product. The
          required-by date is the gate date minus qualification lead time and decision
          buffer.
        </p>
      </div>
    </div>
  );
}
