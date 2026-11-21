import Link from "next/link";
import { ArrowRight, CalendarClock } from "lucide-react";
import type { Decision, ProductSummary } from "@/domain/types";
import { formatDate } from "@/lib/date";
import { formatUsd } from "@/lib/utils";

export function DecisionList({
  decisions,
  summaries,
  limit = 4,
}: {
  decisions: Decision[];
  summaries: ProductSummary[];
  limit?: number;
}) {
  const summaryByProduct = new Map(
    summaries.map((summary) => [summary.product.id, summary]),
  );
  const pending = decisions
    .filter((decision) => decision.status === "pending")
    .sort((a, b) => a.decisionDate.localeCompare(b.decisionDate))
    .slice(0, limit);

  return (
    <div className="divide-y divide-zinc-100">
      {pending.map((decision) => {
        const summary = summaryByProduct.get(decision.productId);
        return (
          <Link
            key={decision.id}
            href={`/brief/${decision.productId}/`}
            className="group flex items-start gap-3 px-1 py-3 first:pt-0 last:pb-0"
          >
            <div className="mt-0.5 flex h-8 w-8 shrink-0 flex-col items-center justify-center rounded-md border border-zinc-200 bg-zinc-50">
              <CalendarClock size={14} className="text-zinc-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium leading-5 text-zinc-900 group-hover:text-blue-700">
                {decision.title}
              </p>
              <p className="mt-0.5 text-[12px] text-zinc-500">
                {summary?.product.shortName ?? decision.productId} ·{" "}
                {decision.owner} · needed by {formatDate(decision.decisionDate)}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-mono text-[13px] font-medium text-zinc-800 tabular">
                {summary ? formatUsd(summary.exposureUsd.base) : "—"}
              </p>
              <p className="mt-0.5 text-[11px] uppercase tracking-wide text-zinc-400">
                exposure
              </p>
            </div>
            <ArrowRight
              size={14}
              className="mt-2 shrink-0 text-zinc-300 group-hover:text-blue-600"
            />
          </Link>
        );
      })}
    </div>
  );
}
