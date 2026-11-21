"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FilterX, Search, ShieldAlert } from "lucide-react";
import type { Decision, Product, Risk } from "@/domain/types";
import { formatDate } from "@/lib/date";
import { cn, unique } from "@/lib/utils";
import { EmptyState, Panel } from "@/components/primitives";

const LIKELIHOOD = [1, 2, 3, 4, 5];
const IMPACT = [5, 4, 3, 2, 1];

function tier(score: number): "Critical" | "High" | "Medium" | "Low" {
  if (score >= 20) return "Critical";
  if (score >= 12) return "High";
  if (score >= 6) return "Medium";
  return "Low";
}

function tierStyle(tierName: string): string {
  switch (tierName) {
    case "Critical":
      return "border-red-200 bg-red-50 text-red-800";
    case "High":
      return "border-amber-200 bg-amber-50 text-amber-800";
    case "Medium":
      return "border-blue-200 bg-blue-50 text-blue-800";
    default:
      return "border-zinc-200 bg-zinc-50 text-zinc-600";
  }
}

function cellTone(score: number, count: number): string {
  if (count === 0) return "bg-zinc-50 text-zinc-300 border-zinc-100";
  if (score >= 20) return "bg-red-200 text-red-900 border-red-300";
  if (score >= 12) return "bg-amber-200 text-amber-900 border-amber-300";
  if (score >= 6) return "bg-blue-100 text-blue-900 border-blue-200";
  return "bg-emerald-100 text-emerald-900 border-emerald-200";
}

export function RiskRegister({
  risks,
  products,
  decisions,
}: {
  risks: Risk[];
  products: Product[];
  decisions: Decision[];
}) {
  const [selectedCell, setSelectedCell] = useState<{ likelihood: number; impact: number } | null>(
    null,
  );
  const [status, setStatus] = useState("all");
  const [owner, setOwner] = useState("all");
  const [query, setQuery] = useState("");
  const [selectedRiskId, setSelectedRiskId] = useState<string | null>(
    risks[0]?.id ?? null,
  );

  const productById = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );
  const decisionByRisk = useMemo(() => {
    const map = new Map<string, Decision>();
    for (const decision of decisions) {
      for (const risk of risks) {
        if (decision.clauseId && risk.clauseId === decision.clauseId) {
          map.set(risk.id, decision);
        }
      }
    }
    return map;
  }, [decisions, risks]);

  const owners = useMemo(() => unique(risks.map((risk) => risk.owner)).sort(), [risks]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return risks.filter((risk) => {
      if (status !== "all" && risk.status !== status) return false;
      if (owner !== "all" && risk.owner !== owner) return false;
      if (selectedCell) {
        if (
          risk.likelihood !== selectedCell.likelihood ||
          risk.impact !== selectedCell.impact
        ) {
          return false;
        }
      }
      if (normalized) {
        const haystack = [risk.title, risk.description, risk.owner, risk.mitigation]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(normalized)) return false;
      }
      return true;
    });
  }, [risks, status, owner, selectedCell, query]);

  const selectedRisk =
    filtered.find((risk) => risk.id === selectedRiskId) ??
    risks.find((risk) => risk.id === selectedRiskId) ??
    filtered[0] ??
    null;

  const openRisks = risks.filter((risk) => risk.status !== "closed");
  const critical = openRisks.filter((risk) => risk.likelihood * risk.impact >= 20).length;
  const high = openRisks.filter((risk) => {
    const score = risk.likelihood * risk.impact;
    return score >= 12 && score < 20;
  }).length;

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.65fr)]">
        <Panel
          title="5 × 5 risk heatmap"
          description="Click a cell to filter the register. Scores are likelihood × impact before mitigation."
          action={
            selectedCell ? (
              <button
                type="button"
                onClick={() => setSelectedCell(null)}
                className="inline-flex items-center gap-1 rounded-md border border-zinc-300 bg-white px-2 py-1 text-[12px] font-medium text-zinc-600 hover:border-zinc-400"
              >
                <FilterX size={11} />
                Clear cell
              </button>
            ) : (
              <span className="font-mono text-[12px] text-zinc-500">
                {openRisks.length} open
              </span>
            )
          }
        >
          <div className="grid grid-cols-[54px_1fr] gap-1">
            <div />
            <div className="grid grid-cols-5 gap-1 pb-1">
              {LIKELIHOOD.map((likelihood) => (
                <div
                  key={likelihood}
                  className="text-center font-mono text-[11px] text-zinc-500"
                >
                  L{likelihood}
                </div>
              ))}
            </div>
            {IMPACT.map((impact) => (
              <div key={impact} className="contents">
                <div className="flex items-center justify-end pr-1 font-mono text-[11px] text-zinc-500">
                  I{impact}
                </div>
                <div className="grid grid-cols-5 gap-1">
                  {LIKELIHOOD.map((likelihood) => {
                    const score = likelihood * impact;
                    const count = openRisks.filter(
                      (risk) =>
                        risk.likelihood === likelihood && risk.impact === impact,
                    ).length;
                    const active =
                      selectedCell?.likelihood === likelihood &&
                      selectedCell?.impact === impact;
                    return (
                      <button
                        key={likelihood}
                        type="button"
                        onClick={() =>
                          setSelectedCell(
                            active ? null : { likelihood, impact },
                          )
                        }
                        className={cn(
                          "flex h-10 items-center justify-center rounded border text-[13px] font-semibold transition-all",
                          cellTone(score, count),
                          active
                            ? "ring-2 ring-zinc-900 ring-offset-1"
                            : "hover:brightness-95",
                        )}
                        title={`${count} risk(s) · score ${score}`}
                      >
                        {count || ""}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-zinc-500">
            Impact rows run from 5 (highest) to 1. Likelihood columns run from 1 to 5.
          </p>
        </Panel>

        <Panel
          title="Register summary"
          description="The register is a live program artifact, not a static slide."
        >
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Open risks", value: openRisks.length, tone: "text-zinc-950" },
              { label: "Critical", value: critical, tone: "text-red-700" },
              { label: "High", value: high, tone: "text-amber-700" },
              {
                label: "Decisions needed",
                value: openRisks.filter((risk) => risk.decisionNeededBy).length,
                tone: "text-blue-700",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2.5"
              >
                <p className="label">{item.label}</p>
                <p className={cn("mt-1 text-xl font-semibold tabular", item.tone)}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2">
            <ShieldAlert size={14} className="mt-0.5 shrink-0 text-amber-700" />
            <p className="text-[12px] leading-4 text-amber-900">
              Market-access risks are never accepted above medium without a VP decision.
              The decision log links each risk to its brief.
            </p>
          </div>
        </Panel>
      </div>

      <Panel
        title="Risk register"
        description={
          selectedCell
            ? `Filtered to likelihood ${selectedCell.likelihood} × impact ${selectedCell.impact}.`
            : "All program risks, sorted by score."
        }
        action={
          <div className="flex flex-wrap items-center gap-1.5">
            <div className="relative">
              <Search
                size={12}
                className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-zinc-400"
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search risks…"
                className="h-7 w-40 rounded-md border border-zinc-300 bg-white pl-6 pr-2 text-[12px] outline-none placeholder:text-zinc-400 focus:border-blue-500"
              />
            </div>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="h-7 rounded-md border border-zinc-300 bg-white px-1.5 text-[12px] text-zinc-700 outline-none focus:border-blue-500"
            >
              <option value="all">All statuses</option>
              <option value="open">Open</option>
              <option value="mitigating">Mitigating</option>
              <option value="accepted">Accepted</option>
              <option value="closed">Closed</option>
            </select>
            <select
              value={owner}
              onChange={(event) => setOwner(event.target.value)}
              className="h-7 max-w-[170px] rounded-md border border-zinc-300 bg-white px-1.5 text-[12px] text-zinc-700 outline-none focus:border-blue-500"
            >
              <option value="all">All owners</option>
              {owners.map((ownerName) => (
                <option key={ownerName} value={ownerName}>
                  {ownerName}
                </option>
              ))}
            </select>
          </div>
        }
        bodyClassName="p-0"
      >
        {filtered.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title="No risks match the filters"
              description="Clear the heatmap cell or broaden the search."
            />
          </div>
        ) : (
          <div className="max-h-[520px] overflow-auto">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead className="sticky top-0 bg-zinc-50">
                <tr className="border-b border-zinc-200">
                  {[
                    "Risk",
                    "Product",
                    "L",
                    "I",
                    "Score",
                    "Tier",
                    "Owner",
                    "Due",
                    "Status",
                    "Decision",
                  ].map((header) => (
                    <th
                      key={header}
                      className="px-2.5 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...filtered]
                  .sort((a, b) => b.likelihood * b.impact - a.likelihood * a.impact)
                  .map((risk) => {
                    const score = risk.likelihood * risk.impact;
                    const riskTier = tier(score);
                    const decision = decisionByRisk.get(risk.id);
                    const active = selectedRisk?.id === risk.id;
                    return (
                      <tr
                        key={risk.id}
                        onClick={() => setSelectedRiskId(risk.id)}
                        className={cn(
                          "cursor-pointer border-b border-zinc-100 align-top last:border-0",
                          active ? "bg-blue-50/60" : "hover:bg-zinc-50",
                        )}
                      >
                        <td className="max-w-[300px] px-2.5 py-2">
                          <p className="text-[12px] font-medium leading-4 text-zinc-900">
                            {risk.title}
                          </p>
                          <p className="mt-0.5 line-clamp-1 text-[11px] text-zinc-500">
                            {risk.description}
                          </p>
                        </td>
                        <td className="px-2.5 py-2 text-[11px] text-zinc-600">
                          {risk.productId
                            ? productById.get(risk.productId)?.shortName ?? risk.productId
                            : "—"}
                        </td>
                        <td className="px-2.5 py-2 font-mono text-[12px] text-zinc-600 tabular">
                          {risk.likelihood}
                        </td>
                        <td className="px-2.5 py-2 font-mono text-[12px] text-zinc-600 tabular">
                          {risk.impact}
                        </td>
                        <td className="px-2.5 py-2 font-mono text-[12px] font-semibold text-zinc-800 tabular">
                          {score}
                        </td>
                        <td className="px-2.5 py-2">
                          <span
                            className={cn(
                              "inline-flex rounded-full border px-1.5 py-0.5 text-[11px] font-medium",
                              tierStyle(riskTier),
                            )}
                          >
                            {riskTier}
                          </span>
                        </td>
                        <td className="px-2.5 py-2 text-[11px] text-zinc-600">
                          {risk.owner}
                        </td>
                        <td className="px-2.5 py-2 font-mono text-[11px] text-zinc-500">
                          {formatDate(risk.dueDate)}
                        </td>
                        <td className="px-2.5 py-2 text-[11px] capitalize text-zinc-600">
                          {risk.status}
                        </td>
                        <td className="px-2.5 py-2">
                          {decision ? (
                            <Link
                              href={`/brief/${decision.productId}/`}
                              className="text-[11px] font-medium text-blue-700 hover:text-blue-800"
                            >
                              Brief
                            </Link>
                          ) : (
                            <span className="text-[11px] text-zinc-400">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {selectedRisk ? (
        <Panel
          title={selectedRisk.title}
          description={`${selectedRisk.owner} · ${tier(
            selectedRisk.likelihood * selectedRisk.impact,
          )} · ${selectedRisk.status}`}
          action={
            decisionByRisk.get(selectedRisk.id) ? (
              <Link
                href={`/brief/${decisionByRisk.get(selectedRisk.id)?.productId}/`}
                className="text-[12px] font-medium text-blue-700 hover:text-blue-800"
              >
                Open decision brief
              </Link>
            ) : null
          }
        >
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <p className="label">Description</p>
              <p className="mt-1 text-[13px] leading-5 text-zinc-600">
                {selectedRisk.description}
              </p>
              <p className="label mt-3">Mitigation</p>
              <p className="mt-1 text-[13px] leading-5 text-zinc-600">
                {selectedRisk.mitigation}
              </p>
              <p className="label mt-3">Contingency</p>
              <p className="mt-1 text-[13px] leading-5 text-zinc-600">
                {selectedRisk.contingency}
              </p>
            </div>
            <div className="space-y-2 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2.5">
              {[
                { label: "Likelihood", value: selectedRisk.likelihood },
                { label: "Impact", value: selectedRisk.impact },
                {
                  label: "Score",
                  value: selectedRisk.likelihood * selectedRisk.impact,
                },
                { label: "Due", value: formatDate(selectedRisk.dueDate) },
                {
                  label: "Decision needed by",
                  value: selectedRisk.decisionNeededBy
                    ? formatDate(selectedRisk.decisionNeededBy)
                    : "—",
                },
              ].map((item) => (
                <div key={item.label} className="flex items-baseline justify-between">
                  <span className="text-[11px] text-zinc-500">{item.label}</span>
                  <span className="font-mono text-[12px] font-medium text-zinc-800 tabular">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      ) : null}
    </div>
  );
}
