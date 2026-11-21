import type {
  Assessment,
  Clause,
  Gate,
  Product,
  RegulatoryMilestone,
} from "@/domain/types";
import { DEMO_AS_OF } from "@/domain/engine";
import { GATE_ORDER, getGateDates } from "@/domain/schedule";
import {
  addMonths,
  diffDays,
  formatDate,
  formatMonth,
  maxISO,
  minISO,
  parseISO,
  toISO,
} from "@/lib/date";
import { cn } from "@/lib/utils";
import { Legend, Panel } from "@/components/primitives";

function firstOfMonth(value: string): string {
  const date = parseISO(value);
  date.setUTCDate(1);
  return toISO(date);
}

function percentBetween(date: string, start: string, end: string): number {
  const total = diffDays(start, end);
  if (total <= 0) return 0;
  return Math.max(0, Math.min(100, (diffDays(start, date) / total) * 100));
}

const STATUS_BAR: Record<string, string> = {
  late: "bg-red-500",
  act_now: "bg-amber-500",
  monitor: "bg-blue-500",
  on_track: "bg-emerald-500",
  not_applicable: "bg-zinc-300",
};

const GATE_LABEL: Record<Gate, string> = {
  Concept: "Concept",
  Proto: "Proto",
  EVT: "EVT",
  DVT: "DVT",
  PVT: "PVT",
  MP: "MP / launch",
};

export function GanttChart({
  product,
  assessments,
  clauses,
  milestones,
}: {
  product: Product;
  assessments: Assessment[];
  clauses: Clause[];
  milestones: RegulatoryMilestone[];
}) {
  const clauseById = new Map(clauses.map((clause) => [clause.id, clause]));
  const gateDates = getGateDates(product);

  const workstreams = assessments
    .filter((assessment) => assessment.overall !== "not_applicable")
    .map((assessment) => {
      const clause = clauseById.get(assessment.clauseId);
      return clause ? { assessment, clause } : null;
    })
    .filter(
      (row): row is { assessment: Assessment; clause: Clause } =>
        row !== null &&
        (row.assessment.programStatus === "late" ||
          row.assessment.programStatus === "act_now" ||
          row.clause.severity === "market_access"),
    )
    .sort((a, b) => a.assessment.requiredBy.localeCompare(b.assessment.requiredBy))
    .slice(0, 10);

  const instrumentIds = new Set(
    assessments
      .map((assessment) => clauseById.get(assessment.clauseId)?.instrumentId)
      .filter((instrumentId): instrumentId is string => Boolean(instrumentId)),
  );

  const gateStart = gateDates.Concept;
  const gateEnd = gateDates.MP;
  const earliestRequired = workstreams[0]?.assessment.requiredBy ?? gateStart;
  const start = firstOfMonth(
    minISO(minISO(gateStart, earliestRequired), addMonths(DEMO_AS_OF, -3)),
  );
  const futureMilestone = milestones
    .filter(
      (milestone) =>
        instrumentIds.has(milestone.instrumentId) && milestone.date >= DEMO_AS_OF,
    )
    .sort((a, b) => a.date.localeCompare(b.date))[0];
  const maxDate = maxISO(
    maxISO(gateEnd, addMonths(DEMO_AS_OF, 18)),
    futureMilestone ? addMonths(futureMilestone.date, 3) : gateEnd,
  );
  const end = firstOfMonth(addMonths(maxDate, 1));

  const relevantMilestones = milestones
    .filter(
      (milestone) =>
        instrumentIds.has(milestone.instrumentId) &&
        milestone.date >= start &&
        milestone.date <= end,
    )
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4);

  const ticks: string[] = [];
  let cursor = firstOfMonth(start);
  while (cursor <= end) {
    ticks.push(cursor);
    cursor = addMonths(cursor, 6);
  }

  const asOfPercent = percentBetween(DEMO_AS_OF, start, end);
  const lateCount = workstreams.filter(
    (row) => row.assessment.programStatus === "late",
  ).length;
  const actNowCount = workstreams.filter(
    (row) => row.assessment.programStatus === "act_now",
  ).length;

  return (
    <Panel
      title="Backward-scheduled NPI decision windows"
      description={`${workstreams.length} critical workstreams · ${lateCount} late · ${actNowCount} act now. Bars run from the required-by date to the lock-in gate.`}
      action={
        <span className="font-mono text-[12px] text-zinc-500">
          {formatDate(start)} to {formatDate(end)}
        </span>
      }
      bodyClassName="p-0"
    >
      <div className="overflow-x-auto">
        <div className="min-w-[980px]">
          <div className="grid grid-cols-[230px_1fr] border-b border-zinc-200 bg-zinc-50/60">
            <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-zinc-500">
              Workstream
            </div>
            <div className="relative h-8">
              {ticks.map((tick) => (
                <div
                  key={tick}
                  className="absolute top-0 h-full border-l border-zinc-200 pl-1.5 pt-2 font-mono text-[11px] text-zinc-500"
                  style={{ left: `${percentBetween(tick, start, end)}%` }}
                >
                  {formatMonth(tick)}
                </div>
              ))}
              <div
                className="absolute top-0 z-10 h-full border-l-2 border-dashed border-blue-500"
                style={{ left: `${asOfPercent}%` }}
                title={`As of ${formatDate(DEMO_AS_OF)}`}
              />
            </div>
          </div>

          {GATE_ORDER.map((gate) => {
            const percent = percentBetween(gateDates[gate], start, end);
            return (
              <div
                key={gate}
                className="grid grid-cols-[230px_1fr] border-b border-zinc-100 bg-white"
              >
                <div className="flex items-center gap-2 px-3 py-1.5">
                  <span className="h-2 w-2 rotate-45 bg-zinc-700" />
                  <span className="text-[12px] font-medium text-zinc-700">
                    {GATE_LABEL[gate]}
                  </span>
                  <span className="ml-auto font-mono text-[11px] text-zinc-400">
                    {formatDate(gateDates[gate])}
                  </span>
                </div>
                <div className="relative h-8">
                  {ticks.map((tick) => (
                    <div
                      key={tick}
                      className="absolute top-0 h-full border-l border-zinc-100"
                      style={{ left: `${percentBetween(tick, start, end)}%` }}
                    />
                  ))}
                  <div
                    className="absolute top-1/2 z-10 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-white bg-zinc-700"
                    style={{ left: `${percent}%` }}
                    title={`${gate}: ${formatDate(gateDates[gate])}`}
                  />
                  <div
                    className="absolute top-0 h-full border-l border-dashed border-blue-400/70"
                    style={{ left: `${asOfPercent}%` }}
                  />
                </div>
              </div>
            );
          })}

          {workstreams.map((row) => {
            const startPercent = percentBetween(row.assessment.requiredBy, start, end);
            const endPercent = percentBetween(row.assessment.gateDate, start, end);
            const width = Math.max(0.5, endPercent - startPercent);
            return (
              <div
                key={`${row.clause.id}-${row.assessment.market}`}
                className="grid grid-cols-[230px_1fr] border-b border-zinc-100"
              >
                <div className="flex flex-col justify-center px-3 py-1.5">
                  <span className="truncate text-[12px] font-medium text-zinc-800">
                    {row.clause.title}
                  </span>
                  <span className="mt-0.5 font-mono text-[11px] text-zinc-400">
                    {row.assessment.market} · {row.clause.lockInGate} ·{" "}
                    {formatDate(row.assessment.requiredBy)}
                  </span>
                </div>
                <div className="relative h-10">
                  {ticks.map((tick) => (
                    <div
                      key={tick}
                      className="absolute top-0 h-full border-l border-zinc-100"
                      style={{ left: `${percentBetween(tick, start, end)}%` }}
                    />
                  ))}
                  <div
                    className="absolute top-1/2 h-2.5 -translate-y-1/2 rounded-full bg-zinc-100"
                    style={{ left: `${startPercent}%`, width: `${width}%` }}
                  />
                  <div
                    className={cn(
                      "absolute top-1/2 h-2 -translate-y-1/2 rounded-full",
                      STATUS_BAR[row.assessment.programStatus],
                    )}
                    style={{ left: `${startPercent}%`, width: `${width}%` }}
                    title={`${row.clause.title}: required by ${formatDate(row.assessment.requiredBy)}; ${row.clause.lockInGate} gate ${formatDate(row.assessment.gateDate)}`}
                  />
                  <div
                    className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-zinc-800"
                    style={{ left: `${startPercent}%` }}
                  />
                  <div
                    className="absolute top-1/2 h-3 w-px -translate-x-1/2 -translate-y-1/2 bg-zinc-500"
                    style={{ left: `${endPercent}%` }}
                  />
                  <div
                    className="absolute top-0 h-full border-l border-dashed border-blue-400/70"
                    style={{ left: `${asOfPercent}%` }}
                  />
                </div>
              </div>
            );
          })}

          {relevantMilestones.map((milestone) => {
            const percent = percentBetween(milestone.date, start, end);
            return (
              <div
                key={milestone.id}
                className="grid grid-cols-[230px_1fr] border-b border-zinc-100 bg-violet-50/30"
              >
                <div className="flex flex-col justify-center px-3 py-1.5">
                  <span className="truncate text-[12px] font-medium text-violet-900">
                    {milestone.title}
                  </span>
                  <span className="mt-0.5 font-mono text-[11px] text-violet-500">
                    {milestone.stage} · {formatDate(milestone.date)}
                  </span>
                </div>
                <div className="relative h-9">
                  {ticks.map((tick) => (
                    <div
                      key={tick}
                      className="absolute top-0 h-full border-l border-zinc-100"
                      style={{ left: `${percentBetween(tick, start, end)}%` }}
                    />
                  ))}
                  <div
                    className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-violet-500"
                    style={{ left: `${percent}%` }}
                    title={`${milestone.title}: ${formatDate(milestone.date)}`}
                  />
                  <div
                    className="absolute top-0 h-full border-l-2 border-dashed border-violet-400"
                    style={{ left: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-100 px-3 py-2.5">
        <Legend
          items={[
            { label: "Late", className: "bg-red-500" },
            { label: "Act now", className: "bg-amber-500" },
            { label: "Monitor", className: "bg-blue-500" },
            { label: "On track", className: "bg-emerald-500" },
            { label: "Regulatory milestone", className: "bg-violet-500" },
          ]}
        />
        <p className="text-[11px] text-zinc-500">
          The bar ends at the engineering lock-in gate. The dot is the required-by date
          after qualification lead time and decision buffer.
        </p>
      </div>
    </Panel>
  );
}
