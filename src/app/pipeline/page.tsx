import Link from "next/link";
import {
  ArrowUpRight,
  CalendarClock,
  Landmark,
  MessageSquareText,
  Radio,
} from "lucide-react";
import { instruments } from "@/data/instruments";
import { milestones } from "@/data/milestones";
import { formatDate } from "@/lib/date";
import { cn, groupBy } from "@/lib/utils";
import { KpiCard, PageHeader, Panel } from "@/components/primitives";

const STAGE_STYLES: Record<string, string> = {
  proposal: "border-violet-200 bg-violet-50 text-violet-800",
  consultation: "border-violet-200 bg-violet-50 text-violet-800",
  committee: "border-blue-200 bg-blue-50 text-blue-800",
  adopted: "border-blue-200 bg-blue-50 text-blue-800",
  scrutiny: "border-amber-200 bg-amber-50 text-amber-800",
  published: "border-emerald-200 bg-emerald-50 text-emerald-800",
  application: "border-red-200 bg-red-50 text-red-800",
  standard: "border-blue-200 bg-blue-50 text-blue-800",
};

const CONFIDENCE_STYLES: Record<string, string> = {
  high: "text-emerald-700",
  medium: "text-amber-700",
  low: "text-zinc-500",
};

const POSITIONS = [
  {
    title: "Article 11 derogations",
    instrument: "EU 2023/1542",
    position:
      "Support a narrow, safety-based derogation. Do not extend the wet-environment or wearable logic to handheld smartphones.",
    ask:
      "Clarify the evidence threshold for wearables and the no-redesign test; publish a decision tree.",
    owner: "Legal & Government Affairs",
    window: "Delegated act published 22 Oct 2026 · monitor guidance",
  },
  {
    title: "ESPR ICT delegated act",
    instrument: "EU 2024/1781",
    position:
      "Support a decentralised DPP with a central registry, access tiers, and reuse of JTC 24 standards. Avoid product-specific duplicate schemas.",
    ask:
      "Align ICT data fields with existing PLM/LCA sources; publish the delegated act with a realistic transition.",
    owner: "Environmental Affairs",
    window: "Expected 2029 · standards track open",
  },
  {
    title: "US state right-to-repair",
    instrument: "US-CA / US-OR",
    position:
      "Support a national baseline for parts, tools, documentation, software, and parts-pairing clarity. A state patchwork raises cost without improving outcomes.",
    ask:
      "Clarify parts-pairing safe harbours and the treatment of security features.",
    owner: "Legal & Government Affairs",
    window: "Ongoing · state legislative cycle",
  },
];

export default function PipelinePage() {
  const upcoming = milestones
    .filter((milestone) => milestone.date >= "2026-11-20")
    .sort((a, b) => a.date.localeCompare(b.date));
  const byYear = groupBy(upcoming, (milestone) => milestone.date.slice(0, 4));
  const years = Object.keys(byYear).sort();
  const openConsultations = upcoming.filter(
    (milestone) => milestone.stage === "consultation" || milestone.stage === "proposal",
  ).length;
  const standards = upcoming.filter((milestone) => milestone.stage === "standard").length;

  return (
    <div>
      <PageHeader
        eyebrow="Regulatory strategy · influence layer"
        title="Regulatory pipeline and advocacy"
        description="A compliance tracker stops at the enforcement date. This view starts earlier: consultations, delegated acts, standards, scrutiny periods, and the positions the program intends to take."
        actions={
          <Link
            href="/methodology/#sources"
            className="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 bg-white px-3 py-2 text-[13px] font-medium text-zinc-700 hover:border-zinc-400"
          >
            Sources
            <ArrowUpRight size={14} />
          </Link>
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Upcoming milestones"
          value={upcoming.length}
          detail="next 24–36 months"
          tone="info"
        />
        <KpiCard
          label="Open consultations"
          value={openConsultations}
          detail="proposals and consultation-stage items"
          tone="warning"
        />
        <KpiCard
          label="Standards track"
          value={standards}
          detail="CEN-CLC/JTC 24 and related work"
          tone="info"
        />
        <KpiCard
          label="Monitoring only"
          value={upcoming.filter((milestone) => milestone.confidence === "low").length}
          detail="lower-confidence jurisdictions"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(340px,1fr)]">
        <Panel
          title="Regulatory timeline"
          description="Milestones that can change a product decision, an evidence requirement, or a standards commitment."
          action={
            <span className="inline-flex items-center gap-1 text-[12px] text-zinc-500">
              <CalendarClock size={12} />
              As of 20 Nov 2026
            </span>
          }
        >
          <div className="space-y-6">
            {years.map((year) => (
              <div key={year}>
                <div className="mb-2 flex items-center gap-2">
                  <span className="font-mono text-[12px] font-semibold text-zinc-800">
                    {year}
                  </span>
                  <span className="h-px flex-1 bg-zinc-200" />
                </div>
                <div className="space-y-2">
                  {byYear[year].map((milestone) => {
                    const instrument = instruments.find(
                      (item) => item.id === milestone.instrumentId,
                    );
                    return (
                      <div
                        key={milestone.id}
                        className="grid gap-2 rounded-md border border-zinc-200 px-3 py-2.5 sm:grid-cols-[90px_minmax(0,1fr)]"
                      >
                        <div>
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
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                            <p className="text-[13px] font-medium leading-4 text-zinc-900">
                              {milestone.title}
                            </p>
                            <span className="font-mono text-[11px] text-zinc-400">
                              {instrument?.shortId ?? milestone.instrumentId}
                            </span>
                          </div>
                          <p className="mt-1 text-[12px] leading-4 text-zinc-600">
                            {milestone.impact}
                          </p>
                          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-500">
                            <span>
                              Owner: <span className="text-zinc-700">{milestone.owner}</span>
                            </span>
                            <span>
                              Confidence:{" "}
                              <span className={CONFIDENCE_STYLES[milestone.confidence]}>
                                {milestone.confidence}
                              </span>
                            </span>
                            {milestone.commentWindow ? (
                              <span>Window: {milestone.commentWindow}</span>
                            ) : null}
                          </div>
                          <p className="mt-1 text-[11px] leading-4 text-zinc-500">
                            Action: {milestone.action}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <div className="space-y-5">
          <Panel
            title="Advocacy positions"
            description="Where the program intends to shape the rule, not just react to it."
            action={<MessageSquareText size={15} className="text-zinc-400" />}
          >
            <div className="space-y-3">
              {POSITIONS.map((position) => (
                <div
                  key={position.title}
                  className="rounded-md border border-zinc-200 px-3 py-2.5"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-[13px] font-semibold text-zinc-900">
                      {position.title}
                    </p>
                    <span className="font-mono text-[11px] text-zinc-400">
                      {position.instrument}
                    </span>
                  </div>
                  <p className="mt-1 text-[12px] leading-4 text-zinc-600">
                    {position.position}
                  </p>
                  <p className="mt-1.5 text-[11px] leading-4 text-zinc-500">
                    <span className="font-medium text-zinc-700">Ask:</span> {position.ask}
                  </p>
                  <p className="mt-1 text-[11px] text-zinc-400">
                    {position.owner} · {position.window}
                  </p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel
            title="Why this matters"
            description="The EPM role is explicitly about influence, not passive tracking."
          >
            <div className="space-y-3">
              {[
                {
                  icon: Landmark,
                  title: "Delegated acts are written before they are enforced",
                  body: "The evidence threshold, exemptions, and data fields are often set years before the application date. That is where the design constraints become malleable.",
                },
                {
                  icon: Radio,
                  title: "Standards are a second rulebook",
                  body: "CEN-CLC/JTC 24 and IEC TC 111 decisions determine what 'conforming' looks like in practice. Tracking them is a program deliverable.",
                },
                {
                  icon: MessageSquareText,
                  title: "Positions need evidence and allies",
                  body: "A credible position pairs product data, legal analysis, and industry alignment. A generic comment letter is not a strategy.",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex gap-2.5">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-zinc-200 bg-zinc-50 text-zinc-500">
                      <Icon size={13} />
                    </span>
                    <div>
                      <p className="text-[12px] font-semibold text-zinc-900">
                        {item.title}
                      </p>
                      <p className="mt-0.5 text-[11px] leading-4 text-zinc-500">
                        {item.body}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
