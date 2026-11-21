"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  ShieldAlert,
  SlidersHorizontal,
  TriangleAlert,
} from "lucide-react";
import { products } from "@/data/products";
import { DEMO_AS_OF, getProductSummary } from "@/domain/engine";
import {
  applyProductOverrides,
  hasProductOverrides,
  type ProductOverrides,
} from "@/domain/overrides";
import { computeRepairability, computeRepairabilityLevers } from "@/domain/scoring";
import { getNextGate, getPhase } from "@/domain/schedule";
import type {
  Clause,
  Decision,
  Instrument,
  Product,
  RegulatoryMilestone,
  Risk,
} from "@/domain/types";
import { formatDate } from "@/lib/date";
import { cn, formatUsd } from "@/lib/utils";
import { EvidenceSummary } from "@/components/evidence-summary";
import { GanttChart } from "@/components/gantt-chart";
import { ProductConfigurator } from "@/components/product-configurator";
import { ProductRisks } from "@/components/product-risks";
import { RepairabilityPanel } from "@/components/repairability-panel";
import { RequirementsTable } from "@/components/requirements-table";
import {
  KpiCard,
  MarketBadge,
  PageHeader,
  Panel,
  SeverityPill,
  StatusPill,
} from "@/components/primitives";

type TabId =
  | "summary"
  | "requirements"
  | "schedule"
  | "repairability"
  | "evidence"
  | "risks";

const TABS: { id: TabId; label: string }[] = [
  { id: "summary", label: "Summary" },
  { id: "requirements", label: "Requirements" },
  { id: "schedule", label: "Schedule" },
  { id: "repairability", label: "Repairability" },
  { id: "evidence", label: "Evidence" },
  { id: "risks", label: "Risks & decisions" },
];

export function ProductWorkspace({
  product,
  clauses,
  instruments,
  risks,
  decisions,
  milestones,
}: {
  product: Product;
  clauses: Clause[];
  instruments: Instrument[];
  risks: Risk[];
  decisions: Decision[];
  milestones: RegulatoryMilestone[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<TabId>("summary");
  const [overrides, setOverrides] = useState<ProductOverrides>({});
  const [configOpen, setConfigOpen] = useState(false);
  const [focusClauseId, setFocusClauseId] = useState<string | undefined>(undefined);

  const customizedProduct = useMemo(
    () => applyProductOverrides(product, overrides),
    [product, overrides],
  );
  const summary = useMemo(
    () => getProductSummary(customizedProduct, clauses, instruments, DEMO_AS_OF),
    [customizedProduct, clauses, instruments],
  );

  const repairability = product.repairability
    ? computeRepairability(product.repairability)
    : null;
  const levers = product.repairability
    ? computeRepairabilityLevers(product.repairability)
    : [];
  const productRisks = risks.filter((risk) => risk.productId === product.id);
  const productDecisions = decisions.filter(
    (decision) => decision.productId === product.id,
  );
  const nextDecision = productDecisions.find(
    (decision) => decision.status === "pending",
  );
  const nextGate = getNextGate(customizedProduct, DEMO_AS_OF);
  const phase = getPhase(customizedProduct, DEMO_AS_OF);

  const primaryConstraint = summary.assessments.find((assessment) => {
    const clause = clauses.find((item) => item.id === assessment.clauseId);
    return assessment.overall === "non_compliant" && clause?.severity === "market_access";
  });
  const primaryClause = primaryConstraint
    ? clauses.find((clause) => clause.id === primaryConstraint.clauseId)
    : undefined;

  const topFindings = summary.assessments
    .filter(
      (assessment) =>
        assessment.overall === "non_compliant" || assessment.overall === "at_risk",
    )
    .slice(0, 3);

  const modified = hasProductOverrides(overrides);

  useEffect(() => {
    const applyHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash === "customize") {
        setTab("summary");
        setConfigOpen(true);
        return;
      }
      if (TABS.some((item) => item.id === hash)) {
        setTab(hash as TabId);
      }
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  const selectTab = (next: TabId) => {
    setTab(next);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${next}`);
    }
  };

  const openClause = (clauseId: string) => {
    setFocusClauseId(clauseId);
    selectTab("requirements");
  };

  const plainSummary =
    summary.blockers > 0
      ? `${summary.blockers} market-access ${
          summary.blockers === 1 ? "finding needs" : "findings need"
        } attention. The binding issue is "${
          primaryClause?.title ?? "an unresolved requirement"
        }".`
      : summary.atRisk > 0
        ? `No market-access blockers. ${summary.atRisk} findings still need evidence or a decision.`
        : "No open blockers. Keep monitoring the regulatory pipeline.";

  return (
    <div>
      <PageHeader
        eyebrow={`${product.archetype} · ${product.businessUnit}`}
        title={product.name}
        description={product.description}
        actions={
          <>
            <select
              value={product.id}
              onChange={(event) => router.push(`/products/${event.target.value}/`)}
              aria-label="Switch product"
              className="h-9 max-w-[220px] rounded-md border border-zinc-300 bg-white px-2 text-[13px] font-medium text-zinc-700 outline-none focus:border-blue-500"
            >
              {products.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            {productDecisions.length > 0 && nextDecision ? (
              <Link
                href={`/brief/${product.id}/`}
                className="inline-flex h-9 items-center gap-1.5 rounded-md bg-blue-700 px-3 text-[13px] font-medium text-white hover:bg-blue-800"
              >
                <FileText size={14} />
                Open brief
              </Link>
            ) : null}
            <Link
              href="/"
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-zinc-300 bg-white px-3 text-[13px] font-medium text-zinc-700 hover:border-zinc-400"
            >
              <ArrowLeft size={14} />
              Portfolio
            </Link>
          </>
        }
      />

      {modified ? (
        <div className="mb-4 flex flex-col gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] text-blue-950">
            <span className="font-semibold">Custom scenario.</span> The assessment is
            live. The executive brief still uses the curated product.
          </p>
          <button
            type="button"
            onClick={() => setOverrides({})}
            className="text-left text-[13px] font-semibold text-blue-800 hover:text-blue-950"
          >
            Reset to curated product
          </button>
        </div>
      ) : null}

      <div className="mb-4 grid gap-px overflow-hidden rounded-lg border border-zinc-200 bg-zinc-200 sm:grid-cols-2 lg:grid-cols-6">
        {[
          {
            label: "Markets",
            value: (
              <div className="flex flex-wrap gap-1">
                {customizedProduct.markets.map((market) => (
                  <MarketBadge key={market} market={market} />
                ))}
              </div>
            ),
          },
          { label: "Launch", value: formatDate(customizedProduct.launchDate) },
          { label: "End of sale", value: formatDate(customizedProduct.endOfSaleDate) },
          { label: "Program phase", value: phase },
          {
            label: "Next gate",
            value: nextGate ? `${nextGate.gate} · ${formatDate(nextGate.date)}` : "Post-MP",
          },
          {
            label: "Status",
            value: <StatusPill status={summary.overall} />,
          },
        ].map((item) => (
          <div key={item.label} className="bg-white px-3 py-2.5">
            <p className="label">{item.label}</p>
            <div className="mt-1 text-[13px] font-medium text-zinc-800">
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {primaryConstraint && primaryClause ? (
        <div className="mb-4 flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white text-red-700">
              <ShieldAlert size={15} />
            </span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-red-700">
                Can’t sell as-is
              </p>
              <p className="mt-0.5 text-[13px] font-semibold text-red-950">
                {primaryClause.title}
              </p>
              <p className="mt-0.5 text-[13px] leading-5 text-red-800">
                {primaryConstraint.reasons[0]}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => openClause(primaryClause.id)}
            className="inline-flex shrink-0 items-center gap-1 text-[13px] font-semibold text-red-800 hover:text-red-950"
          >
            Open requirement
            <ArrowRight size={13} />
          </button>
        </div>
      ) : null}

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Can’t sell as-is"
          value={summary.blockers}
          detail="market-access findings"
          tone="danger"
        />
        <KpiCard
          label="Needs evidence or a decision"
          value={summary.atRisk}
          detail={`${summary.evidenceGaps} evidence gaps`}
          tone="warning"
        />
        <KpiCard
          label="Late decisions"
          value={summary.late}
          detail="required-by date already passed"
          tone={summary.late > 0 ? "danger" : "success"}
        />
        <KpiCard
          label="Revenue exposed"
          value={formatUsd(summary.exposureUsd.base)}
          detail={`${formatUsd(summary.exposureUsd.low)} to ${formatUsd(summary.exposureUsd.high)}`}
          tone="danger"
        />
      </div>

      <nav className="sticky top-0 z-10 -mx-4 mb-5 border-b border-zinc-200 bg-paper/95 px-4 backdrop-blur sm:-mx-6 sm:px-6 lg:top-[49px] lg:-mx-8 lg:px-8">
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => selectTab(item.id)}
              className={cn(
                "whitespace-nowrap border-b-2 px-3 py-2.5 text-[13px] font-medium transition-colors",
                tab === item.id
                  ? "border-blue-700 text-blue-800"
                  : "border-transparent text-zinc-500 hover:text-zinc-900",
              )}
            >
              {item.label}
            </button>
          ))}
          <span className="ml-auto hidden items-center whitespace-nowrap font-mono text-[12px] text-zinc-400 sm:flex">
            As of {formatDate(DEMO_AS_OF)}
          </span>
        </div>
      </nav>

      {tab === "summary" ? (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,1fr)]">
          <div className="flex flex-col gap-5">
            <Panel
              title="What this means"
              action={<StatusPill status={summary.overall} />}
            >
              <p className="text-[15px] font-medium leading-7 text-zinc-900">
                {plainSummary}
              </p>
              {primaryConstraint ? (
                <p className="mt-2 text-[13px] leading-5 text-zinc-600">
                  {primaryConstraint.reasons[0]}
                </p>
              ) : null}
              <p className="mt-3 text-[13px] leading-5 text-zinc-500">
                The assessment keeps four things separate: applicability, conformity,
                evidence, and timing. Open a finding to see the reason and the legal
                source.
              </p>
            </Panel>

            <Panel
              className="order-2"
              title="Top findings"
              description="The three items that most need attention."
              action={
                <button
                  type="button"
                  onClick={() => selectTab("requirements")}
                  className="text-[13px] font-medium text-blue-700 hover:text-blue-800"
                >
                  See all requirements
                </button>
              }
            >
              {topFindings.length === 0 ? (
                <div className="flex items-start gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2.5">
                  <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-600" />
                  <p className="text-[13px] leading-5 text-emerald-900">
                    No open blockers or at-risk findings in the current assessment.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {topFindings.map((finding) => {
                    const clause = clauses.find((item) => item.id === finding.clauseId);
                    if (!clause) return null;
                    return (
                      <button
                        key={`${finding.clauseId}-${finding.market}`}
                        type="button"
                        onClick={() => openClause(finding.clauseId)}
                        className="w-full rounded-md border border-zinc-200 px-3 py-2.5 text-left transition-colors hover:border-blue-200 hover:bg-blue-50/40"
                      >
                        <div className="flex flex-wrap items-center gap-1.5">
                          <StatusPill status={finding.overall} />
                          <SeverityPill severity={clause.severity} />
                          <MarketBadge market={finding.market} />
                        </div>
                        <p className="mt-1.5 text-[13px] font-medium leading-5 text-zinc-900">
                          {clause.title}
                        </p>
                        <p className="mt-0.5 text-[13px] leading-4 text-zinc-500">
                          {finding.reasons[0]}
                        </p>
                        <p className="mt-1 text-[12px] text-zinc-400">
                          {clause.accountableTeam} · decide by{" "}
                          {formatDate(finding.requiredBy)}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </Panel>

            <Panel
              className="order-1"
              title="Next decision"
              description="The executive call that moves this product forward."
              action={
                nextDecision ? (
                  <Link
                    href={`/brief/${product.id}/`}
                    className="text-[13px] font-medium text-blue-700 hover:text-blue-800"
                  >
                    Open brief
                  </Link>
                ) : null
              }
            >
              {nextDecision ? (
                <div>
                  <p className="text-[13px] font-semibold leading-5 text-zinc-900">
                    {nextDecision.title}
                  </p>
                  <p className="mt-1 text-[13px] leading-5 text-zinc-600">
                    {nextDecision.question}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-zinc-500">
                    <span>Owner: {nextDecision.owner}</span>
                    <span>Decision date: {formatDate(nextDecision.decisionDate)}</span>
                  </div>
                  <div className="mt-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                      Recommendation
                    </p>
                    <p className="mt-0.5 text-[13px] leading-5 text-emerald-950">
                      {nextDecision.recommendation}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-[13px] text-zinc-500">
                  No open executive decision for this product. Monitor the requirements
                  and evidence.
                </p>
              )}
            </Panel>
          </div>

          <div className="space-y-5">
            <Panel title="At a glance">
              <div className="space-y-2.5">
                {[
                  { label: "Applicable clauses", value: summary.assessments.filter((a) => a.overall !== "not_applicable").length },
                  { label: "Evidence gaps", value: summary.evidenceGaps },
                  { label: "Late decisions", value: summary.late },
                  { label: "Next gate", value: nextGate ? `${nextGate.gate} · ${formatDate(nextGate.date)}` : "Post-MP" },
                  { label: "Program phase", value: phase },
                ].map((item) => (
                  <div key={item.label} className="flex items-baseline justify-between gap-2">
                    <span className="text-[13px] text-zinc-500">{item.label}</span>
                    <span className="font-mono text-[13px] font-medium text-zinc-800 tabular">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel
              title="Customize this product"
              description="Change one input and watch the assessment update."
            >
              <p className="text-[13px] leading-5 text-zinc-600">
                Test battery removability, cycle life, adapter wattage, USB-PD, markets,
                or the launch date.
              </p>
              <button
                type="button"
                onClick={() => setConfigOpen(true)}
                className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-zinc-900 px-3 py-2 text-[13px] font-medium text-white hover:bg-zinc-800"
              >
                <SlidersHorizontal size={13} />
                Open customizer
              </button>
              {modified ? (
                <p className="mt-2 text-center text-[12px] text-blue-700">
                  Custom scenario active
                </p>
              ) : null}
            </Panel>

            <Panel title="What changes the answer">
              <div className="space-y-2.5">
                <div className="flex gap-2">
                  <TriangleAlert size={13} className="mt-0.5 shrink-0 text-amber-600" />
                  <p className="text-[13px] leading-4 text-zinc-600">
                    A user-removable battery clears the Article 11 blocker. It does not
                    automatically clear the evidence gap.
                  </p>
                </div>
                <div className="flex gap-2">
                  <TriangleAlert size={13} className="mt-0.5 shrink-0 text-amber-600" />
                  <p className="text-[13px] leading-4 text-zinc-600">
                    Moving the launch date moves the gate and the required-by date. It
                    does not change the legal requirement.
                  </p>
                </div>
              </div>
            </Panel>
          </div>
        </div>
      ) : null}

      {tab === "requirements" ? (
        <Panel
          title="Requirement ledger"
          description="Default view shows blockers and at-risk items. Open a row for the legal source and predicate trace. Attributed revenue is per clause; the product roll-up de-duplicates across clauses."
          action={
            <span className="font-mono text-[12px] text-zinc-500">
              {summary.assessments.length} assessments
            </span>
          }
          bodyClassName="p-3"
        >
          <RequirementsTable
            key={`${product.id}-${JSON.stringify(overrides)}`}
            assessments={summary.assessments}
            clauses={clauses}
            instruments={instruments}
            markets={customizedProduct.markets}
            defaultStatus="actionable"
            initialClauseId={focusClauseId}
          />
        </Panel>
      ) : null}

      {tab === "schedule" ? (
        <div className="space-y-4">
          <div className="rounded-lg border border-zinc-200 bg-white px-4 py-3">
            <p className="text-[13px] leading-5 text-zinc-700">
              The bar runs from the <strong>required-by date</strong> to the{" "}
              <strong>design freeze</strong>. The dot is the date you need a decision.
              Red means the decision is already late.
            </p>
          </div>
          <GanttChart
            product={customizedProduct}
            assessments={summary.assessments}
            clauses={clauses}
            milestones={milestones}
          />
        </div>
      ) : null}

      {tab === "repairability" ? (
        <RepairabilityPanel
          product={customizedProduct}
          result={repairability}
          levers={levers}
        />
      ) : null}

      {tab === "evidence" ? (
        <EvidenceSummary assessments={summary.assessments} clauses={clauses} />
      ) : null}

      {tab === "risks" ? (
        <ProductRisks risks={productRisks} decisions={productDecisions} />
      ) : null}

      <ProductConfigurator
        product={product}
        overrides={overrides}
        onChange={setOverrides}
        onReset={() => setOverrides({})}
        open={configOpen}
        onClose={() => setConfigOpen(false)}
      />
    </div>
  );
}
