import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { BriefData } from "@/domain/brief";
import { formatDate } from "@/lib/date";
import { cn, formatUsd } from "@/lib/utils";

type BriefSummaryVariant = "screen" | "print";

const SCREEN = {
  root: "mx-auto max-w-[920px] rounded-lg border border-zinc-200 bg-white px-6 py-7 shadow-sm sm:px-9 sm:py-9",
  header: "border-b-2 border-zinc-900 pb-4",
  eyebrow: "text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-700",
  headerNote: "text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-400",
  title: "mt-2 text-2xl font-semibold leading-tight tracking-tight text-zinc-950",
  question: "mt-1 text-[13px] leading-5 text-zinc-600",
  metaGrid: "mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5 text-[11px] sm:grid-cols-5",
  metaLabel: "text-[10px] uppercase tracking-[0.1em] text-zinc-400",
  metaValue: "mt-0.5 font-medium leading-4 text-zinc-800",
  section: "mt-5",
  sectionTitle: "text-[12px] font-semibold uppercase tracking-[0.12em] text-zinc-500",
  sectionNote: "text-[10px] text-zinc-400",
  twoCol: "grid gap-3 sm:grid-cols-2",
  ask: "rounded-md border border-blue-200 bg-blue-50 px-4 py-3",
  askLabel: "text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-700",
  askText: "mt-1 text-[13px] font-semibold leading-5 text-blue-950",
  rec: "rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3",
  recLabel: "text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-700",
  recText: "mt-1 text-[12px] leading-5 text-emerald-950",
  bullets: "mt-2 space-y-1.5",
  bullet: "flex gap-2 text-[12px] leading-5 text-zinc-700",
  bulletDot: "mt-2 h-1 w-1 shrink-0 rounded-full bg-zinc-400",
  kpiGrid: "grid grid-cols-2 gap-2 sm:grid-cols-4",
  kpi: "rounded border border-zinc-200 bg-zinc-50 px-3 py-2",
  kpiLabel: "text-[10px] uppercase tracking-[0.1em] text-zinc-500",
  kpiValue: "mt-0.5 text-lg font-semibold tabular",
  tableWrap: "mt-2 overflow-x-auto rounded border border-zinc-200",
  table: "w-full border-collapse text-left",
  th: "border-b border-zinc-200 bg-zinc-50 px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500",
  td: "border-b border-zinc-100 px-2 py-2 align-top text-[10px] leading-4 text-zinc-600 last:border-0",
  bodyText: "mt-1 text-[12px] leading-5 text-zinc-700",
  optionId: "font-mono text-[11px] font-semibold text-zinc-500",
  optionLabel: "mt-0.5 text-[12px] font-medium leading-4 text-zinc-900",
  optionMeta: "mt-0.5 font-mono text-[9px] text-zinc-500",
  recommended:
    "rounded-full bg-blue-700 px-1.5 py-0.5 text-[7px] font-semibold uppercase tracking-wide text-white",
  score: "text-center font-mono text-[13px] font-semibold text-zinc-900 tabular",
  footer: "mt-5 border-t border-zinc-200 pt-3",
  footerText: "text-[10px] leading-4 text-zinc-500",
  disclaimer: "mt-2 text-[7px] leading-3 text-zinc-400",
};

const PRINT = {
  root: "print-only break-inside-avoid text-[8.5pt] leading-[1.3] text-zinc-900",
  header: "border-b-2 border-zinc-900 pb-2",
  eyebrow: "text-[7.5pt] font-semibold uppercase tracking-[0.16em] text-blue-700",
  headerNote: "text-[6.5pt] font-medium uppercase tracking-[0.12em] text-zinc-400",
  title: "mt-1 text-[18pt] font-semibold leading-tight tracking-tight text-zinc-950",
  question: "mt-0.5 text-[8pt] leading-[1.25] text-zinc-600",
  metaGrid: "mt-1.5 grid grid-cols-5 gap-x-3 gap-y-1",
  metaLabel: "text-[6pt] uppercase tracking-[0.08em] text-zinc-400",
  metaValue: "mt-0.5 text-[7.5pt] font-medium leading-[1.2] text-zinc-800",
  section: "mt-2.5 break-inside-avoid",
  sectionTitle: "text-[7pt] font-semibold uppercase tracking-[0.1em] text-zinc-500",
  sectionNote: "text-[6pt] text-zinc-400",
  twoCol: "grid grid-cols-2 gap-2",
  ask: "rounded border border-blue-200 bg-blue-50 px-2 py-1.5",
  askLabel: "text-[6pt] font-semibold uppercase tracking-[0.1em] text-blue-700",
  askText: "mt-0.5 text-[8.5pt] font-semibold leading-[1.25] text-blue-950",
  rec: "rounded border border-emerald-200 bg-emerald-50 px-2 py-1.5",
  recLabel: "text-[6pt] font-semibold uppercase tracking-[0.1em] text-emerald-700",
  recText: "mt-0.5 text-[8pt] leading-[1.25] text-emerald-950",
  bullets: "mt-1 space-y-0.5",
  bullet: "flex gap-1.5 text-[8pt] leading-[1.25] text-zinc-700",
  bulletDot: "mt-[0.45em] h-0.5 w-0.5 shrink-0 rounded-full bg-zinc-400",
  kpiGrid: "grid grid-cols-4 gap-1.5",
  kpi: "rounded border border-zinc-200 bg-zinc-50 px-2 py-1",
  kpiLabel: "text-[6pt] uppercase tracking-[0.08em] text-zinc-500",
  kpiValue: "mt-0.5 text-[12pt] font-semibold tabular",
  tableWrap: "mt-1 rounded border border-zinc-200",
  table: "w-full border-collapse text-left",
  th: "border-b border-zinc-200 bg-zinc-50 px-1 py-0.5 text-[6pt] font-semibold uppercase tracking-wide text-zinc-500",
  td: "border-b border-zinc-100 px-1 py-1 align-top text-[7.5pt] leading-[1.2] text-zinc-600 last:border-0",
  bodyText: "mt-1 text-[7.5pt] leading-[1.25] text-zinc-700",
  optionId: "font-mono text-[7.5pt] font-semibold text-zinc-500",
  optionLabel: "mt-0.5 text-[8pt] font-medium leading-[1.2] text-zinc-900",
  optionMeta: "mt-0.5 font-mono text-[6.5pt] text-zinc-500",
  recommended:
    "rounded-full bg-blue-700 px-1 py-0.5 text-[5.5pt] font-semibold uppercase tracking-wide text-white",
  score: "text-center font-mono text-[8.5pt] font-semibold text-zinc-900 tabular",
  footer: "mt-2.5 border-t border-zinc-200 pt-1.5",
  footerText: "text-[6.5pt] leading-[1.25] text-zinc-500",
  disclaimer: "mt-1 text-[5.5pt] leading-[1.2] text-zinc-400",
};

export function BriefSummary({
  brief,
  variant = "screen",
}: {
  brief: BriefData;
  variant?: BriefSummaryVariant;
}) {
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
  const isPrint = variant === "print";
  const styles = isPrint ? PRINT : SCREEN;

  return (
    <article className={styles.root}>
      <header className={styles.header}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className={styles.eyebrow}>Executive decision brief</p>
          <p className={styles.headerNote}>
            Illustrative · internal working draft{isPrint ? " · one page" : " · summary"}
          </p>
        </div>
        <h1 className={styles.title}>{decision.title}</h1>
        <p className={styles.question}>{decision.question}</p>
        <div className={styles.metaGrid}>
          {[
            { label: "Product", value: product.name },
            { label: "Decision owner", value: decision.owner },
            { label: "Decision date", value: formatDate(decision.decisionDate) },
            { label: "Prepared", value: formatDate("2026-11-20") },
            { label: "Status", value: decision.status },
          ].map((item) => (
            <div key={item.label}>
              <p className={styles.metaLabel}>{item.label}</p>
              <p className={styles.metaValue}>{item.value}</p>
            </div>
          ))}
        </div>
      </header>

      <section className={cn(styles.section, styles.twoCol)}>
        <div className={styles.ask}>
          <p className={styles.askLabel}>The ask</p>
          <p className={styles.askText}>{ask}</p>
        </div>
        <div className={styles.rec}>
          <p className={styles.recLabel}>Recommendation</p>
          <p className={styles.recText}>{decision.recommendation}</p>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Why now</h2>
        <ul className={styles.bullets}>
          {whyNow.slice(0, 3).map((line) => (
            <li key={line} className={styles.bullet}>
              <span className={styles.bulletDot} />
              {line}
            </li>
          ))}
        </ul>
      </section>

      <section className={cn(styles.section, styles.kpiGrid)}>
        {[
          {
            label: "Market-access blockers",
            value: summary.blockers,
            tone: "text-red-700",
          },
          {
            label: "At-risk findings",
            value: summary.atRisk,
            tone: "text-amber-700",
          },
          {
            label: "Evidence gaps",
            value: summary.evidenceGaps,
            tone: "text-amber-700",
          },
          {
            label: "Revenue at risk",
            value: formatUsd(summary.exposureUsd.base),
            tone: "text-zinc-950",
          },
        ].map((item) => (
          <div key={item.label} className={styles.kpi}>
            <p className={styles.kpiLabel}>{item.label}</p>
            <p className={cn(styles.kpiValue, item.tone)}>{item.value}</p>
          </div>
        ))}
      </section>

      <section className={styles.section}>
        <div className="flex items-baseline justify-between gap-2">
          <h2 className={styles.sectionTitle}>Options at a glance</h2>
          <p className={styles.sectionNote}>Scores 1 to 5, 5 = best</p>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Option</th>
                <th className={cn(styles.th, "text-center")}>Weighted</th>
                <th className={styles.th}>Trade-off</th>
              </tr>
            </thead>
            <tbody>
              {scoredOptions.map((scored) => {
                const option = scored.option;
                const isRecommended = recommended?.option.id === option.id;
                return (
                  <tr
                    key={option.id}
                    className={isRecommended ? "bg-blue-50" : undefined}
                  >
                    <td className={styles.td}>
                      <div className="flex items-center gap-1.5">
                        <span className={styles.optionId}>
                          {option.id.toUpperCase()}
                        </span>
                        {isRecommended ? (
                          <span className={styles.recommended}>Recommended</span>
                        ) : null}
                      </div>
                      <p className={styles.optionLabel}>{option.label}</p>
                      <p className={styles.optionMeta}>
                        {criteria
                          .map((criterion) => option.scores[criterion.key])
                          .join(" / ")}
                      </p>
                    </td>
                    <td className={cn(styles.td, styles.score)}>
                      {scored.score.toFixed(1)}
                    </td>
                    <td className={styles.td}>{option.complianceEffect}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className={cn(styles.sectionNote, "mt-1")}>
          Scores follow:{" "}
          {criteria.map((criterion) => criterion.label).join(" / ")}.
        </p>
      </section>

      <section className={cn(styles.section, styles.twoCol)}>
        <div>
          <h2 className={styles.sectionTitle}>What would change the recommendation</h2>
          <p className={styles.bodyText}>{decision.whatWouldChange}</p>
        </div>
        <div>
          <h2 className={styles.sectionTitle}>Dissent and open questions</h2>
          <p className={styles.bodyText}>
            {decision.dissent ?? "No dissent recorded."}
          </p>
        </div>
      </section>

      {owners.length > 0 ? (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Owners and gates</h2>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  {[
                    "Workstream",
                    "Accountable owner",
                    "Lock-in gate",
                    "Required by",
                  ].map((header) => (
                    <th key={header} className={styles.th}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {owners.slice(0, 6).map((owner) => (
                  <tr key={owner.workstream}>
                    <td className={styles.td}>{owner.workstream}</td>
                    <td className={styles.td}>{owner.owner}</td>
                    <td className={cn(styles.td, "font-mono")}>{owner.gate}</td>
                    <td className={cn(styles.td, "font-mono")}>
                      {formatDate(owner.requiredBy)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {topRisks.length > 0 ? (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Top risks</h2>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  {["Risk", "Score", "Owner", "Due"].map((header) => (
                    <th key={header} className={styles.th}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topRisks.slice(0, 3).map((risk) => (
                  <tr key={risk.id}>
                    <td className={styles.td}>{risk.title}</td>
                    <td className={cn(styles.td, "font-mono")}>
                      {risk.likelihood * risk.impact}
                    </td>
                    <td className={styles.td}>{risk.owner}</td>
                    <td className={cn(styles.td, "font-mono")}>
                      {formatDate(risk.dueDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <footer className={styles.footer}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className={styles.footerText}>
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
          {isPrint ? (
            <span className="font-mono text-[5.5pt] text-zinc-400">1 / 1</span>
          ) : (
            <Link
              href={`/products/${product.id}/`}
              className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-700 hover:text-blue-800"
            >
              Requirement ledger
              <ArrowUpRight size={9} />
            </Link>
          )}
        </div>
        <p className={styles.disclaimer}>
          Illustrative product and program data. Regulatory data last verified 20 Nov
          2026. Not legal advice. Built for electronics and hardware product teams.
          Prepared with a deterministic rule engine; no LLM is used in the compliance
          path.
        </p>
      </footer>
    </article>
  );
}
