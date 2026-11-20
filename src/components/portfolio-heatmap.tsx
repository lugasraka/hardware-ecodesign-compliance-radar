import Link from "next/link";
import type { Clause, Instrument, OverallStatus, ProductSummary } from "@/domain/types";
import { cn } from "@/lib/utils";
import { Legend, StatusPill } from "@/components/primitives";

const KEY_INSTRUMENTS = [
  { id: "eu-2023-1670", label: "EU phones / tablets" },
  { id: "eu-2023-1542", label: "EU batteries" },
  { id: "eu-2025-2052", label: "EU power supplies" },
  { id: "eu-2023-1669", label: "EU energy label" },
  { id: "eu-2024-1781", label: "ESPR / DPP" },
  { id: "fr-repairability", label: "France repair" },
  { id: "us-ca-right-to-repair", label: "US-CA repair" },
  { id: "us-doe-eps", label: "US DOE / CEC" },
];

const CELL_STYLES: Record<OverallStatus, string> = {
  non_compliant: "bg-red-100 text-red-800 border-red-200",
  at_risk: "bg-amber-100 text-amber-800 border-amber-200",
  unknown: "bg-violet-100 text-violet-800 border-violet-200",
  compliant: "bg-emerald-100 text-emerald-800 border-emerald-200",
  not_applicable: "bg-zinc-50 text-zinc-400 border-zinc-200",
};

function worstStatus(statuses: OverallStatus[]): OverallStatus {
  if (statuses.includes("non_compliant")) return "non_compliant";
  if (statuses.includes("at_risk")) return "at_risk";
  if (statuses.includes("unknown")) return "unknown";
  if (statuses.includes("compliant")) return "compliant";
  return "not_applicable";
}

export function PortfolioHeatmap({
  summaries,
  clauses,
  instruments,
}: {
  summaries: ProductSummary[];
  clauses: Clause[];
  instruments: Instrument[];
}) {
  const instrumentById = new Map(instruments.map((instrument) => [instrument.id, instrument]));
  const clauseIdsByInstrument = new Map<string, Set<string>>();
  for (const clause of clauses) {
    const set = clauseIdsByInstrument.get(clause.instrumentId) ?? new Set<string>();
    set.add(clause.id);
    clauseIdsByInstrument.set(clause.instrumentId, set);
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] border-collapse text-left">
          <thead>
            <tr className="border-b border-zinc-200">
              <th className="sticky left-0 z-10 bg-white px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-zinc-500">
                Product
              </th>
              {KEY_INSTRUMENTS.map((instrument) => (
                <th
                  key={instrument.id}
                  className="px-1.5 py-2 text-center text-[9px] font-semibold uppercase leading-3 tracking-[0.05em] text-zinc-500"
                  title={instrumentById.get(instrument.id)?.title}
                >
                  {instrument.label}
                </th>
              ))}
              <th className="px-2 py-2 text-center text-[9px] font-semibold uppercase tracking-[0.05em] text-zinc-500">
                Overall
              </th>
            </tr>
          </thead>
          <tbody>
            {summaries.map((summary) => {
              const product = summary.product;
              return (
                <tr
                  key={product.id}
                  className="group border-b border-zinc-100 last:border-0 hover:bg-zinc-50/70"
                >
                  <td className="sticky left-0 z-10 bg-white px-3 py-2.5 group-hover:bg-zinc-50">
                    <Link
                      href={`/products/${product.id}/`}
                      className="block text-[12px] font-medium text-zinc-900 hover:text-blue-700"
                    >
                      {product.shortName}
                    </Link>
                    <span className="mt-0.5 block text-[10px] capitalize text-zinc-500">
                      {product.category.replace("_", " ")} · {product.status.replace("_", " ")}
                    </span>
                  </td>
                  {KEY_INSTRUMENTS.map((instrument) => {
                    const clauseIds = clauseIdsByInstrument.get(instrument.id);
                    const matches = summary.assessments.filter((assessment) =>
                      clauseIds?.has(assessment.clauseId),
                    );
                    const applicable = matches.filter(
                      (assessment) => assessment.overall !== "not_applicable",
                    );
                    const status = worstStatus(matches.map((match) => match.overall));
                    const blockers = applicable.filter(
                      (assessment) => assessment.overall === "non_compliant",
                    ).length;
                    const atRisk = applicable.filter(
                      (assessment) => assessment.overall === "at_risk",
                    ).length;

                    if (applicable.length === 0) {
                      return (
                        <td key={instrument.id} className="px-1.5 py-2.5 text-center">
                          <span
                            className="inline-flex h-6 w-9 items-center justify-center rounded border border-zinc-100 bg-zinc-50 text-[10px] text-zinc-300"
                            title={`${instrumentById.get(instrument.id)?.shortId}: not applicable`}
                          >
                            —
                          </span>
                        </td>
                      );
                    }

                    return (
                      <td key={instrument.id} className="px-1.5 py-2.5 text-center">
                        <span
                          className={cn(
                            "inline-flex h-6 w-9 items-center justify-center rounded border text-[10px] font-semibold tabular",
                            CELL_STYLES[status],
                          )}
                          title={`${instrumentById.get(instrument.id)?.shortId}: ${applicable.length} applicable, ${blockers} non-compliant, ${atRisk} at risk`}
                        >
                          {blockers > 0 ? blockers : atRisk > 0 ? atRisk : applicable.length}
                        </span>
                      </td>
                    );
                  })}
                  <td className="px-2 py-2.5 text-center">
                    <StatusPill status={summary.overall} compact />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-zinc-100 pt-3">
        <Legend
          items={[
            { label: "Non-compliant", className: "bg-red-200" },
            { label: "At risk", className: "bg-amber-200" },
            { label: "Unknown", className: "bg-violet-200" },
            { label: "Compliant", className: "bg-emerald-200" },
            { label: "Not applicable", className: "bg-zinc-200" },
          ]}
        />
        <p className="text-[10px] text-zinc-500">
          Cell number = market-access blockers, or at-risk findings when there are no
          blockers.
        </p>
      </div>
    </div>
  );
}
