"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  ExternalLink,
  FilterX,
  Gavel,
  Search,
} from "lucide-react";
import type {
  Assessment,
  Clause,
  Instrument,
  MarketCode,
  OverallStatus,
  Severity,
} from "@/domain/types";
import { formatDate } from "@/lib/date";
import { cn, formatUsd, titleCase, unique } from "@/lib/utils";
import {
  EmptyState,
  EvidencePill,
  MarketBadge,
  ProgramPill,
  SeverityPill,
  StatusPill,
} from "@/components/primitives";
import { TraceTree } from "@/components/trace-tree";

interface Row {
  assessment: Assessment;
  clause: Clause;
  instrument: Instrument;
}

type StatusFilter = OverallStatus | "all" | "actionable";

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "actionable", label: "Actionable only" },
  { value: "all", label: "All statuses" },
  { value: "non_compliant", label: "Non-compliant" },
  { value: "at_risk", label: "At risk" },
  { value: "unknown", label: "Unknown" },
  { value: "compliant", label: "Compliant" },
  { value: "not_applicable", label: "Not applicable" },
];

const SEVERITY_OPTIONS: { value: Severity | "all"; label: string }[] = [
  { value: "all", label: "All severities" },
  { value: "market_access", label: "Market access" },
  { value: "labeling_penalty", label: "Labeling" },
  { value: "monitoring", label: "Monitoring" },
];

function rowKey(row: Row): string {
  return `${row.clause.id}:${row.assessment.market}`;
}

export function RequirementsTable({
  assessments,
  clauses,
  instruments,
  markets,
  defaultStatus = "all",
  initialClauseId,
}: {
  assessments: Assessment[];
  clauses: Clause[];
  instruments: Instrument[];
  markets: MarketCode[];
  defaultStatus?: "actionable" | "all";
  initialClauseId?: string;
}) {
  const clauseById = useMemo(
    () => new Map(clauses.map((clause) => [clause.id, clause])),
    [clauses],
  );
  const instrumentById = useMemo(
    () => new Map(instruments.map((instrument) => [instrument.id, instrument])),
    [instruments],
  );

  const rows = useMemo<Row[]>(
    () =>
      assessments
        .map((assessment) => {
          const clause = clauseById.get(assessment.clauseId);
          const instrument = clause ? instrumentById.get(clause.instrumentId) : undefined;
          return clause && instrument ? { assessment, clause, instrument } : null;
        })
        .filter((row): row is Row => row !== null),
    [assessments, clauseById, instrumentById],
  );

  const initial =
    (initialClauseId
      ? rows.find(
          (row) =>
            row.clause.id === initialClauseId &&
            row.assessment.overall !== "not_applicable",
        )
      : undefined) ??
    rows.find((row) => row.assessment.overall === "non_compliant") ??
    rows.find((row) => row.assessment.overall === "at_risk") ??
    rows[0];

  const [status, setStatus] = useState<StatusFilter>(defaultStatus);
  const [severity, setSeverity] = useState<Severity | "all">("all");
  const [market, setMarket] = useState<MarketCode | "all">("all");
  const [team, setTeam] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [selectedKey, setSelectedKey] = useState<string | null>(
    initial ? rowKey(initial) : null,
  );

  const teams = useMemo(
    () => unique(rows.flatMap((row) => row.clause.owningTeams)).sort(),
    [rows],
  );

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (status === "actionable") {
        if (
          row.assessment.overall !== "non_compliant" &&
          row.assessment.overall !== "at_risk"
        ) {
          return false;
        }
      } else if (status !== "all" && row.assessment.overall !== status) {
        return false;
      }
      if (severity !== "all" && row.clause.severity !== severity) return false;
      if (market !== "all" && row.assessment.market !== market) return false;
      if (team !== "all" && !row.clause.owningTeams.includes(team as never)) return false;
      if (normalizedQuery) {
        const haystack = [
          row.clause.title,
          row.clause.summary,
          row.clause.articleRef,
          row.instrument.shortId,
          row.instrument.title,
          row.clause.owningTeams.join(" "),
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(normalizedQuery)) return false;
      }
      return true;
    });
  }, [rows, status, severity, market, team, query]);

  const selectedRow = useMemo(
    () => rows.find((row) => rowKey(row) === selectedKey) ?? null,
    [rows, selectedKey],
  );

  const hasFilters =
    status !== "all" ||
    severity !== "all" ||
    market !== "all" ||
    team !== "all" ||
    query.length > 0;

  return (
    <div>
      <div className="flex flex-col gap-2 border-b border-zinc-200 pb-3 lg:flex-row lg:flex-wrap lg:items-center">
        <div className="relative min-w-[180px] flex-1">
          <Search
            size={13}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search clause, article, owner…"
            className="h-8 w-full rounded-md border border-zinc-300 bg-white pl-7 pr-2 text-[13px] text-zinc-800 outline-none placeholder:text-zinc-400 focus:border-blue-500"
          />
        </div>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as StatusFilter)}
          className="h-8 rounded-md border border-zinc-300 bg-white px-2 text-[13px] text-zinc-700 outline-none focus:border-blue-500"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          value={severity}
          onChange={(event) => setSeverity(event.target.value as Severity | "all")}
          className="h-8 rounded-md border border-zinc-300 bg-white px-2 text-[13px] text-zinc-700 outline-none focus:border-blue-500"
        >
          {SEVERITY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          value={market}
          onChange={(event) => setMarket(event.target.value as MarketCode | "all")}
          className="h-8 rounded-md border border-zinc-300 bg-white px-2 text-[13px] text-zinc-700 outline-none focus:border-blue-500"
        >
          <option value="all">All markets</option>
          {markets.map((marketCode) => (
            <option key={marketCode} value={marketCode}>
              {marketCode}
            </option>
          ))}
        </select>
        <select
          value={team}
          onChange={(event) => setTeam(event.target.value)}
          className="h-8 max-w-[210px] rounded-md border border-zinc-300 bg-white px-2 text-[13px] text-zinc-700 outline-none focus:border-blue-500"
        >
          <option value="all">All owners</option>
          {teams.map((teamName) => (
            <option key={teamName} value={teamName}>
              {teamName}
            </option>
          ))}
        </select>
        {hasFilters ? (
          <button
            type="button"
            onClick={() => {
              setStatus("all");
              setSeverity("all");
              setMarket("all");
              setTeam("all");
              setQuery("");
            }}
            className="inline-flex h-8 items-center gap-1 rounded-md border border-zinc-300 bg-white px-2 text-[12px] font-medium text-zinc-600 hover:border-zinc-400"
          >
            <FilterX size={12} />
            Reset
          </button>
        ) : null}
        {status !== "all" ? (
          <button
            type="button"
            onClick={() => setStatus("all")}
            className="h-8 rounded-md px-2 text-[12px] font-medium text-blue-700 hover:bg-blue-50 hover:text-blue-800"
          >
            Show all {rows.length}
          </button>
        ) : null}
        <span className="font-mono text-[12px] text-zinc-500 tabular">
          {filtered.length}/{rows.length}
        </span>
      </div>

      <div className="mt-3 min-w-0 overflow-x-auto">
          {filtered.length === 0 ? (
            <EmptyState
              title="No clauses match the filters"
              description="Reset the filters or broaden the search. Unknown data is deliberately kept visible rather than hidden."
            />
          ) : (
            <table className="w-full min-w-[980px] border-collapse text-left">
              <thead>
                <tr className="border-b border-zinc-200">
                  {[
                    "Clause",
                    "Instrument",
                    "Market",
                    "Status",
                    "Program",
                    "Evidence",
                    "Owner",
                    "Gate",
                    "Required by",
                    "Attributed",
                  ].map((header) => (
                    <th
                      key={header}
                      className="px-2 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => {
                  const key = rowKey(row);
                  const active = key === selectedKey;
                  const late = row.assessment.programStatus === "late";
                  return (
                    <tr
                      key={key}
                      onClick={() => setSelectedKey(key)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setSelectedKey(key);
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-pressed={active}
                      className={cn(
                        "cursor-pointer border-b border-zinc-100 align-top outline-none transition-colors last:border-0",
                        active
                          ? "bg-blue-50/70"
                          : "hover:bg-zinc-50 focus:bg-zinc-50",
                      )}
                    >
                      <td className="max-w-[260px] px-2 py-2.5">
                        <p className="text-[13px] font-medium leading-4 text-zinc-900">
                          {row.clause.title}
                        </p>
                        <p className="mt-0.5 font-mono text-[11px] text-zinc-400">
                          {row.clause.articleRef}
                        </p>
                      </td>
                      <td className="px-2 py-2.5 text-[12px] text-zinc-600">
                        {row.instrument.shortId}
                      </td>
                      <td className="px-2 py-2.5">
                        <MarketBadge market={row.assessment.market} />
                      </td>
                      <td className="px-2 py-2.5">
                        <StatusPill status={row.assessment.overall} />
                      </td>
                      <td className="px-2 py-2.5">
                        <ProgramPill status={row.assessment.programStatus} />
                      </td>
                      <td className="px-2 py-2.5">
                        <EvidencePill status={row.assessment.evidence} />
                      </td>
                      <td className="max-w-[130px] px-2 py-2.5 text-[12px] leading-4 text-zinc-600">
                        {row.clause.accountableTeam}
                      </td>
                      <td className="px-2 py-2.5 font-mono text-[12px] text-zinc-600">
                        {row.clause.lockInGate}
                      </td>
                      <td className="px-2 py-2.5">
                        <span
                          className={cn(
                            "font-mono text-[12px] tabular",
                            late ? "font-semibold text-red-700" : "text-zinc-600",
                          )}
                        >
                          {formatDate(row.assessment.requiredBy)}
                        </span>
                      </td>
                      <td className="px-2 py-2.5 text-right font-mono text-[12px] text-zinc-700 tabular">
                        {row.assessment.exposureUsd.base > 0
                          ? formatUsd(row.assessment.exposureUsd.base)
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="label">Selected clause</p>
          <p className="text-[12px] text-zinc-500">Click any row to inspect it</p>
        </div>
        {selectedRow ? (
          <ClauseDetail row={selectedRow} />
        ) : (
          <EmptyState
            title="Select a clause"
            description="The detail panel explains the legal source, interpretation, predicate trace, evidence, owner, and required-by date."
          />
        )}
      </div>
    </div>
  );
}

function ClauseDetail({ row }: { row: Row }) {
  const { assessment, clause, instrument } = row;
  const requiredByTone =
    assessment.programStatus === "late"
      ? "text-red-700"
      : assessment.programStatus === "act_now"
        ? "text-amber-700"
        : "text-zinc-800";

  return (
    <div className="card overflow-hidden">
      <div className="border-b border-zinc-100 px-4 py-3">
        <div className="flex items-center gap-1.5">
          <MarketBadge market={assessment.market} />
          <span className="font-mono text-[11px] uppercase tracking-wide text-zinc-400">
            {instrument.shortId} · {clause.articleRef}
          </span>
        </div>
        <h3 className="mt-1.5 text-[14px] font-semibold leading-5 tracking-tight text-zinc-950">
          {clause.title}
        </h3>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <StatusPill status={assessment.overall} />
          <ProgramPill status={assessment.programStatus} />
          <EvidencePill status={assessment.evidence} />
          <SeverityPill severity={clause.severity} />
        </div>
      </div>

      <div className="grid gap-5 px-4 py-4 lg:grid-cols-2">
        <div className="space-y-4">
        <p className="text-[13px] leading-5 text-zinc-600">{clause.summary}</p>

        <div>
          <p className="label">Why this result</p>
          <ul className="mt-1.5 space-y-1">
            {assessment.reasons.map((reason) => (
              <li key={reason} className="flex gap-1.5 text-[12px] leading-4 text-zinc-600">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-zinc-400" />
                {reason}
              </li>
            ))}
          </ul>
        </div>

        <details className="group">
          <summary className="flex cursor-pointer list-none items-center gap-1 text-[12px] font-semibold uppercase tracking-[0.12em] text-zinc-500 hover:text-zinc-800">
            Predicate trace
            <span className="text-[11px] text-zinc-400 group-open:hidden">▸</span>
            <span className="hidden text-[11px] text-zinc-400 group-open:inline">▾</span>
          </summary>
          <div className="mt-1.5 rounded-md border border-zinc-200 bg-zinc-50/60 px-2.5 py-2">
            <TraceTree trace={assessment.trace} />
          </div>
        </details>
        </div>

        <div className="space-y-4">
        {assessment.exemption ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5">
            <p className="text-[12px] font-semibold uppercase tracking-wide text-amber-800">
              Derogation path claimed
            </p>
            <p className="mt-1 text-[13px] font-medium text-amber-950">
              {assessment.exemption.label}
            </p>
            <ul className="mt-1.5 space-y-1">
              {assessment.exemption.evidence.map((item) => (
                <li key={item} className="text-[12px] leading-4 text-amber-900">
                  • {item}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <details className="group">
          <summary className="flex cursor-pointer list-none items-center gap-1 text-[12px] font-semibold uppercase tracking-[0.12em] text-zinc-500 hover:text-zinc-800">
            Legal source
            <span className="text-[11px] text-zinc-400 group-open:hidden">▸</span>
            <span className="hidden text-[11px] text-zinc-400 group-open:inline">▾</span>
          </summary>
          <blockquote className="mt-1.5 border-l-2 border-zinc-300 pl-2.5 text-[12px] leading-5 text-zinc-600">
            “{clause.legalText}”
          </blockquote>
        </details>

        <div>
          <p className="label">Program interpretation</p>
          <p className="mt-1.5 text-[12px] leading-5 text-zinc-600">
            {clause.interpretation}
          </p>
          <p className="mt-1.5 inline-flex items-center gap-1 rounded border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 text-[11px] text-zinc-500">
            <Gavel size={10} />
            Interpretation: {titleCase(clause.interpretationStatus)}
          </p>
        </div>

        <div>
          <p className="label">Evidence requirements</p>
          <div className="mt-1.5 space-y-1.5">
            {clause.evidence.map((requirement) => (
              <div
                key={requirement.id}
                className="flex items-start justify-between gap-2 rounded border border-zinc-200 px-2 py-1.5"
              >
                <div>
                  <p className="text-[12px] font-medium leading-4 text-zinc-800">
                    {requirement.label}
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    {titleCase(requirement.type)} · {requirement.owner}
                  </p>
                </div>
                <EvidencePill status={assessment.evidence} />
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 border-t border-zinc-100 pt-3">
          <div>
            <p className="label">Accountable owner</p>
            <p className="mt-1 text-[12px] leading-4 text-zinc-700">
              {clause.accountableTeam}
            </p>
          </div>
          <div>
            <p className="label">Lock-in gate</p>
            <p className="mt-1 font-mono text-[12px] text-zinc-700">
              {clause.lockInGate} · {formatDate(assessment.gateDate)}
            </p>
          </div>
          <div>
            <p className="label">Required by</p>
            <p className={cn("mt-1 font-mono text-[12px] tabular", requiredByTone)}>
              {formatDate(assessment.requiredBy)}
            </p>
          </div>
          <div>
            <p className="label">Lead time</p>
            <p className="mt-1 text-[12px] text-zinc-700">
              {clause.qualificationLeadWeeks} wk + {clause.decisionBufferWeeks} wk buffer
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-zinc-100 pt-3">
          <a
            href={clause.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[12px] font-medium text-blue-700 hover:text-blue-800"
          >
            Primary source
            <ExternalLink size={11} />
          </a>
          <span className="text-[11px] text-zinc-400">
            Verified {formatDate(clause.lastVerified)}
          </span>
        </div>

        <div className="rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-2">
          <p className="text-[11px] leading-4 text-zinc-500">
            {clause.notes ??
              "Illustrative assessment. Confirm the legal interpretation and evidence sufficiency with Legal and Environmental Affairs before a market-access decision."}
          </p>
          <a
            href={instrument.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-zinc-600 hover:text-blue-700"
          >
            {instrument.shortId} official text
            <ArrowUpRight size={10} />
          </a>
        </div>
        </div>
      </div>
    </div>
  );
}
