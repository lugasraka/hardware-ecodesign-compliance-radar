import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import type { Decision, Risk } from "@/domain/types";
import { formatDate } from "@/lib/date";
import { cn } from "@/lib/utils";
import { EmptyState, Panel } from "@/components/primitives";

function riskTone(score: number): string {
  if (score >= 20) return "border-red-200 bg-red-50 text-red-800";
  if (score >= 12) return "border-amber-200 bg-amber-50 text-amber-800";
  if (score >= 6) return "border-blue-200 bg-blue-50 text-blue-800";
  return "border-zinc-200 bg-zinc-50 text-zinc-600";
}

export function ProductRisks({
  risks,
  decisions,
}: {
  risks: Risk[];
  decisions: Decision[];
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Panel
        title="Risk register"
        description="Program risks linked to this product. Scores are likelihood × impact before mitigation."
        action={
          <Link
            href="/risks/"
            className="text-[10px] font-medium text-blue-700 hover:text-blue-800"
          >
            Full register
          </Link>
        }
      >
        {risks.length === 0 ? (
          <EmptyState title="No linked risks" />
        ) : (
          <div className="space-y-2">
            {[...risks]
              .sort((a, b) => b.likelihood * b.impact - a.likelihood * a.impact)
              .map((risk) => {
                const score = risk.likelihood * risk.impact;
                return (
                  <div
                    key={risk.id}
                    className="flex items-start gap-2.5 rounded-md border border-zinc-200 px-2.5 py-2"
                  >
                    <span
                      className={cn(
                        "mt-0.5 inline-flex h-6 w-7 shrink-0 items-center justify-center rounded border text-[10px] font-semibold tabular",
                        riskTone(score),
                      )}
                    >
                      {score}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-medium leading-4 text-zinc-900">
                        {risk.title}
                      </p>
                      <p className="mt-0.5 text-[9px] leading-4 text-zinc-500">
                        {risk.owner} · due {formatDate(risk.dueDate)} ·{" "}
                        {risk.status.replace("_", " ")}
                      </p>
                      <p className="mt-1 text-[9px] leading-4 text-zinc-500">
                        Mitigation: {risk.mitigation}
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </Panel>

      <Panel
        title="Decision log"
        description="The executive calls that move this product through the gates."
      >
        {decisions.length === 0 ? (
          <EmptyState title="No open decisions" />
        ) : (
          <div className="space-y-2">
            {decisions.map((decision) => (
              <Link
                key={decision.id}
                href={`/brief/${decision.productId}/`}
                className="group block rounded-md border border-zinc-200 px-2.5 py-2 hover:border-blue-200 hover:bg-blue-50/40"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[11px] font-medium leading-4 text-zinc-900 group-hover:text-blue-800">
                      {decision.title}
                    </p>
                    <p className="mt-0.5 text-[9px] text-zinc-500">
                      {decision.owner} · needed by {formatDate(decision.decisionDate)} ·{" "}
                      {decision.status}
                    </p>
                  </div>
                  <FileText size={13} className="mt-0.5 shrink-0 text-zinc-400" />
                </div>
                <p className="mt-1 line-clamp-2 text-[9px] leading-4 text-zinc-500">
                  Recommendation: {decision.recommendation}
                </p>
                <span className="mt-1 inline-flex items-center gap-1 text-[9px] font-medium text-blue-700">
                  Open decision brief
                  <ArrowRight size={10} />
                </span>
              </Link>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
