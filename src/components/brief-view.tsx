import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import type { BriefData } from "@/domain/brief";
import { formatDate } from "@/lib/date";
import { cn, formatUsd } from "@/lib/utils";
import { CopyButton } from "@/components/copy-button";
import { PrintButton } from "@/components/print-button";

export function BriefView({ brief }: { brief: BriefData }) {
  const {
    product,
    summary,
    decision,
    criteria,
    scoredOptions,
    topRisks,
    ask,
    whyNow,
    owners,
    primaryClause,
    primaryInstrument,
  } = brief;

  const recommended = scoredOptions[0];

  return (
    <div>
      <div className="no-print mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href={`/products/${product.id}/`}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-zinc-600 hover:text-blue-700"
        >
          <ArrowLeft size={13} />
          Back to {product.shortName}
        </Link>
        <div className="flex items-center gap-2">
          <CopyButton text={brief.markdown} />
          <PrintButton />
        </div>
      </div>

      <article className="print-sheet mx-auto max-w-[920px] rounded-lg border border-zinc-200 bg-white px-6 py-7 shadow-sm sm:px-9 sm:py-9">
        <header className="border-b-2 border-zinc-900 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-700">
              Executive decision brief
            </p>
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-400">
              Illustrative · internal working draft
            </p>
          </div>
          <h1 className="mt-2 text-2xl font-semibold leading-tight tracking-tight text-zinc-950">
            {decision.title}
          </h1>
          <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5 text-[11px] sm:grid-cols-5">
            {[
              { label: "Product", value: product.name },
              { label: "Decision owner", value: decision.owner },
              { label: "Decision date", value: formatDate(decision.decisionDate) },
              { label: "Prepared", value: formatDate("2026-11-20") },
              { label: "Status", value: decision.status },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-[10px] uppercase tracking-[0.1em] text-zinc-400">
                  {item.label}
                </p>
                <p className="mt-0.5 font-medium leading-4 text-zinc-800">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </header>

        <section className="mt-5 rounded-md border border-blue-200 bg-blue-50 px-4 py-3 print-break">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-700">
            The ask
          </p>
          <p className="mt-1 text-[13px] font-semibold leading-5 text-blue-950">{ask}</p>
        </section>

        <section className="mt-5 print-break">
          <h2 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
            Why now
          </h2>
          <ul className="mt-2 space-y-1.5">
            {whyNow.map((line) => (
              <li key={line} className="flex gap-2 text-[12px] leading-5 text-zinc-700">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-zinc-400" />
                {line}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 print-break">
          {[
            {
              label: "Market-access blockers",
              value: summary.blockers,
              tone: "text-red-700",
            },
            { label: "At-risk findings", value: summary.atRisk, tone: "text-amber-700" },
            { label: "Evidence gaps", value: summary.evidenceGaps, tone: "text-amber-700" },
            {
              label: "Revenue at risk",
              value: formatUsd(summary.exposureUsd.base),
              tone: "text-zinc-950",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded border border-zinc-200 bg-zinc-50 px-3 py-2"
            >
              <p className="text-[10px] uppercase tracking-[0.1em] text-zinc-500">
                {item.label}
              </p>
              <p className={cn("mt-0.5 text-lg font-semibold tabular", item.tone)}>
                {item.value}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-5 print-break">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
              Decision matrix
            </h2>
            <p className="text-[10px] text-zinc-400">Scores 1–5, 5 = best</p>
          </div>
          <div className="mt-2 overflow-x-auto rounded border border-zinc-200">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50">
                  <th className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                    Option
                  </th>
                  {criteria.map((criterion) => (
                    <th
                      key={criterion.key}
                      className="px-1.5 py-1.5 text-center text-[10px] font-semibold uppercase tracking-wide text-zinc-500"
                      title={`Weight ${Math.round(criterion.weight * 100)}%`}
                    >
                      {criterion.label}
                    </th>
                  ))}
                  <th className="px-2 py-1.5 text-center text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                    Weighted
                  </th>
                </tr>
              </thead>
              <tbody>
                {scoredOptions.map((scored) => {
                  const option = scored.option;
                  const isRecommended = recommended?.option.id === option.id;
                  return (
                    <tr
                      key={option.id}
                      className={cn(
                        "border-b border-zinc-100 align-top last:border-0",
                        isRecommended ? "bg-blue-50/60" : "",
                      )}
                    >
                      <td className="max-w-[230px] px-2 py-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[11px] font-semibold text-zinc-500">
                            {option.id.toUpperCase()}
                          </span>
                          {isRecommended ? (
                            <span className="rounded-full bg-blue-700 px-1.5 py-0.5 text-[7px] font-semibold uppercase tracking-wide text-white">
                              Recommended
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-0.5 text-[12px] font-medium leading-4 text-zinc-900">
                          {option.label}
                        </p>
                        <p className="mt-0.5 text-[10px] leading-3 text-zinc-500">
                          {option.complianceEffect}
                        </p>
                      </td>
                      {criteria.map((criterion) => (
                        <td
                          key={criterion.key}
                          className="px-1.5 py-2 text-center font-mono text-[12px] text-zinc-700 tabular"
                        >
                          {option.scores[criterion.key]}
                        </td>
                      ))}
                      <td className="px-2 py-2 text-center font-mono text-[13px] font-semibold text-zinc-900 tabular">
                        {scored.score.toFixed(1)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-1.5 text-[10px] text-zinc-400">
            Weights:{" "}
            {criteria
              .map(
                (criterion) =>
                  `${criterion.label} ${Math.round(criterion.weight * 100)}%`,
              )
              .join(" · ")}
            . The weighted score is a decision aid, not a substitute for judgment.
          </p>
        </section>

        <section className="mt-5 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 print-break">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
            Recommendation
          </p>
          <p className="mt-1 text-[13px] leading-5 text-emerald-950">
            {decision.recommendation}
          </p>
        </section>

        <section className="mt-4 grid gap-4 sm:grid-cols-2 print-break">
          <div>
            <h2 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
              What would change the recommendation
            </h2>
            <p className="mt-1.5 text-[12px] leading-5 text-zinc-700">
              {decision.whatWouldChange}
            </p>
          </div>
          <div>
            <h2 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
              Dissent and open questions
            </h2>
            <p className="mt-1.5 text-[12px] leading-5 text-zinc-700">
              {decision.dissent ?? "No dissent recorded."}
            </p>
          </div>
        </section>

        <section className="mt-5 print-break">
          <h2 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
            Owners and gates
          </h2>
          <div className="mt-2 overflow-x-auto rounded border border-zinc-200">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50">
                  {["Workstream", "Accountable owner", "Lock-in gate", "Required by"].map(
                    (header) => (
                      <th
                        key={header}
                        className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500"
                      >
                        {header}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {owners.map((owner) => (
                  <tr key={owner.workstream} className="border-b border-zinc-100 last:border-0">
                    <td className="px-2 py-1.5 text-[11px] text-zinc-700">
                      {owner.workstream}
                    </td>
                    <td className="px-2 py-1.5 text-[11px] text-zinc-600">
                      {owner.owner}
                    </td>
                    <td className="px-2 py-1.5 font-mono text-[11px] text-zinc-600">
                      {owner.gate}
                    </td>
                    <td className="px-2 py-1.5 font-mono text-[11px] text-zinc-600">
                      {formatDate(owner.requiredBy)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {topRisks.length > 0 ? (
          <section className="mt-5 print-break">
            <h2 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
              Top risks
            </h2>
            <div className="mt-2 space-y-1.5">
              {topRisks.map((risk) => (
                <div
                  key={risk.id}
                  className="flex items-start justify-between gap-3 rounded border border-zinc-200 px-2.5 py-1.5"
                >
                  <div>
                    <p className="text-[11px] font-medium text-zinc-800">{risk.title}</p>
                    <p className="mt-0.5 text-[10px] text-zinc-500">
                      {risk.owner} · due {formatDate(risk.dueDate)}
                    </p>
                  </div>
                  <span className="font-mono text-[12px] font-semibold text-zinc-800">
                    {risk.likelihood * risk.impact}
                  </span>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section className="mt-5 border-t border-zinc-200 pt-3 print-break">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[10px] leading-4 text-zinc-500">
              {primaryClause && primaryInstrument ? (
                <>
                  Primary constraint: {primaryInstrument.shortId} ·{" "}
                  {primaryClause.articleRef}. Full clause library and predicate traces
                  are in the requirement ledger.
                </>
              ) : (
                <>Full clause library and predicate traces are in the requirement ledger.</>
              )}
            </p>
            <Link
              href={`/products/${product.id}/`}
              className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-700 hover:text-blue-800"
            >
              Requirement ledger
              <ArrowUpRight size={9} />
            </Link>
          </div>
          <p className="mt-2 text-[7px] leading-3 text-zinc-400">
            Illustrative product and program data. Regulatory data last verified 20 Nov
            2026. Not legal advice. Not affiliated with Apple. Prepared with a
            deterministic rule engine; no LLM is used in the compliance path.
          </p>
        </section>
      </article>
    </div>
  );
}
