"use client";

import { useState } from "react";
import type { Assessment, Clause } from "@/domain/types";
import { formatDate } from "@/lib/date";
import { titleCase, unique } from "@/lib/utils";
import { EmptyState, EvidencePill, Panel } from "@/components/primitives";

export function EvidenceSummary({
  assessments,
  clauses,
}: {
  assessments: Assessment[];
  clauses: Clause[];
}) {
  const [showReady, setShowReady] = useState(false);
  const clauseById = new Map(clauses.map((clause) => [clause.id, clause]));
  const applicable = assessments.filter(
    (assessment) => assessment.overall !== "not_applicable",
  );

  const rows = applicable.flatMap((assessment) => {
    const clause = clauseById.get(assessment.clauseId);
    if (!clause) return [];
    return clause.evidence.map((requirement) => ({
      key: `${assessment.clauseId}-${assessment.market}-${requirement.id}`,
      assessment,
      clause,
      requirement,
    }));
  });

  const counts = {
    sufficient: rows.filter((row) => row.assessment.evidence === "sufficient").length,
    partial: rows.filter((row) => row.assessment.evidence === "partial").length,
    missing: rows.filter((row) => row.assessment.evidence === "missing").length,
    expired: rows.filter((row) => row.assessment.evidence === "expired").length,
  };

  const statusOrder = { missing: 0, expired: 1, partial: 2, sufficient: 3 };
  const sorted = [...rows].sort(
    (a, b) => statusOrder[a.assessment.evidence] - statusOrder[b.assessment.evidence],
  );
  const displayed = showReady
    ? sorted
    : sorted.filter((row) => row.assessment.evidence !== "sufficient");

  const owners = unique(rows.map((row) => row.requirement.owner));

  return (
    <Panel
      title="Evidence and certification readiness"
      description="A technical pass without an auditable artifact is still a market-access risk. This view rolls up the evidence requirements attached to each applicable clause."
      action={
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[12px] text-zinc-500">
            {owners.length} owning teams
          </span>
          <button
            type="button"
            onClick={() => setShowReady((current) => !current)}
            className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-[12px] font-medium text-zinc-600 hover:border-zinc-400"
          >
            {showReady ? "Show gaps only" : `Show ready (${counts.sufficient})`}
          </button>
        </div>
      }
      bodyClassName="p-0"
    >
      <div className="grid grid-cols-2 gap-px border-b border-zinc-200 bg-zinc-200 sm:grid-cols-4">
        {[
          { label: "Ready", value: counts.sufficient, tone: "text-emerald-700" },
          { label: "Partial", value: counts.partial, tone: "text-amber-700" },
          { label: "Missing", value: counts.missing, tone: "text-red-700" },
          { label: "Expired", value: counts.expired, tone: "text-red-700" },
        ].map((item) => (
          <div key={item.label} className="bg-white px-3 py-2.5">
            <p className="label">{item.label}</p>
            <p className={`mt-0.5 text-lg font-semibold tabular ${item.tone}`}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {displayed.length === 0 ? (
        <div className="p-4">
          <EmptyState
            title={showReady ? "No evidence requirements" : "No open evidence gaps"}
            description={
              showReady
                ? undefined
                : 'Every applicable clause has sufficient evidence on file. Use "Show ready" to see the full list.'
            }
          />
        </div>
      ) : (
        <div className="max-h-[520px] overflow-auto">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead className="sticky top-0 bg-zinc-50">
              <tr className="border-b border-zinc-200">
                {["Clause", "Artifact", "Type", "Owner", "Status", "Expiry"].map(
                  (header) => (
                    <th
                      key={header}
                      className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500"
                    >
                      {header}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {displayed.map((row) => (
                <tr key={row.key} className="border-b border-zinc-100 last:border-0">
                  <td className="max-w-[230px] px-3 py-2">
                    <p className="text-[12px] font-medium leading-4 text-zinc-800">
                      {row.clause.title}
                    </p>
                    <p className="mt-0.5 font-mono text-[11px] text-zinc-400">
                      {row.assessment.market} · {row.clause.articleRef}
                    </p>
                  </td>
                  <td className="px-3 py-2 text-[12px] text-zinc-600">
                    {row.requirement.label}
                  </td>
                  <td className="px-3 py-2 text-[11px] text-zinc-500">
                    {titleCase(row.requirement.type)}
                  </td>
                  <td className="px-3 py-2 text-[11px] text-zinc-600">
                    {row.requirement.owner}
                  </td>
                  <td className="px-3 py-2">
                    <EvidencePill status={row.assessment.evidence} />
                  </td>
                  <td className="px-3 py-2 font-mono text-[11px] text-zinc-500">
                    {row.requirement.expiresOn
                      ? formatDate(row.requirement.expiresOn)
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}
