import Link from "next/link";
import type { Instrument, RegulatoryMilestone } from "@/domain/types";
import { formatDate } from "@/lib/date";
import { cn } from "@/lib/utils";

const STAGE_STYLES: Record<RegulatoryMilestone["stage"], string> = {
  proposal: "border-violet-200 bg-violet-50 text-violet-800",
  consultation: "border-violet-200 bg-violet-50 text-violet-800",
  committee: "border-blue-200 bg-blue-50 text-blue-800",
  adopted: "border-blue-200 bg-blue-50 text-blue-800",
  scrutiny: "border-amber-200 bg-amber-50 text-amber-800",
  published: "border-emerald-200 bg-emerald-50 text-emerald-800",
  application: "border-red-200 bg-red-50 text-red-800",
  standard: "border-blue-200 bg-blue-50 text-blue-800",
};

export function MilestoneList({
  milestones,
  instruments,
  limit = 4,
  asOf = "2026-11-20",
}: {
  milestones: RegulatoryMilestone[];
  instruments: Instrument[];
  limit?: number;
  asOf?: string;
}) {
  const instrumentById = new Map(instruments.map((instrument) => [instrument.id, instrument]));
  const upcoming = milestones
    .filter((milestone) => milestone.date >= asOf)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, limit);

  return (
    <div className="divide-y divide-zinc-100">
      {upcoming.map((milestone) => (
        <div key={milestone.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
          <div className="w-16 shrink-0">
            <p className="font-mono text-[12px] font-medium text-zinc-800 tabular">
              {formatDate(milestone.date)}
            </p>
            <span
              className={cn(
                "mt-1 inline-flex rounded-full border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                STAGE_STYLES[milestone.stage],
              )}
            >
              {milestone.stage}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-medium leading-5 text-zinc-900">
              {milestone.title}
            </p>
            <p className="mt-0.5 text-[12px] leading-4 text-zinc-500">
              {instrumentById.get(milestone.instrumentId)?.shortId ?? milestone.instrumentId} ·{" "}
              {milestone.impact}
            </p>
          </div>
          <Link
            href="/pipeline/"
            className="mt-0.5 shrink-0 text-[12px] font-medium text-blue-700 hover:text-blue-800"
          >
            Watch
          </Link>
        </div>
      ))}
    </div>
  );
}
