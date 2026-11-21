import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowUpRight,
  CheckCircle2,
  GitPullRequest,
  Search,
  ShieldCheck,
} from "lucide-react";
import { dataReleases } from "@/data/changelog";
import { regulatoryWatch } from "@/data/regulatory-watch";
import {
  DATA_LAST_VERIFIED,
  getNextReviewDue,
} from "@/domain/freshness";
import { formatDate } from "@/lib/date";
import { cn } from "@/lib/utils";
import {
  KpiCard,
  PageHeader,
  Panel,
} from "@/components/primitives";
import { FreshnessBadge } from "@/components/freshness-badge";
import { WatchQueue } from "@/components/watch-queue";

export const metadata: Metadata = {
  title: "Regulatory data changelog",
};

const RUNBOOK_URL =
  "https://github.com/lugasraka/hardware-ecodesign-compliance-radar/blob/main/docs/regulatory-update-runbook.md";

const UPDATE_STEPS = [
  {
    icon: Search,
    title: "1. Source check",
    body: "A weekly GitHub Action checks official pages and APIs, then hashes the normalized text.",
  },
  {
    icon: GitPullRequest,
    title: "2. Candidate queue",
    body: "A changed source creates a candidate in the watch queue. It does not change the clause library.",
  },
  {
    icon: ShieldCheck,
    title: "3. Human review",
    body: "An analyst opens the official text, updates the clause, and records the source and review date.",
  },
  {
    icon: CheckCircle2,
    title: "4. Release",
    body: "Tests and data validation run before merge. Vercel rebuilds the static app.",
  },
];

export default function ChangelogPage() {
  const latestRelease = dataReleases[0];
  const openWatchItems = regulatoryWatch.filter(
    (item) => item.status === "new" || item.status === "triaged",
  ).length;

  return (
    <div>
      <PageHeader
        eyebrow="Regulatory data"
        title="Changelog and review queue"
        description="The dataset is a curated snapshot. This page records reviewed releases and candidate changes that are still waiting for a decision."
        actions={
          <a
            href={RUNBOOK_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 bg-white px-3 py-2 text-[12px] font-medium text-zinc-700 hover:border-zinc-400"
          >
            Update runbook
            <ArrowUpRight size={14} />
          </a>
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Last verified"
          value={formatDate(DATA_LAST_VERIFIED)}
          detail="Official sources checked"
          tone="success"
        />
        <KpiCard
          label="Next review"
          value={formatDate(getNextReviewDue())}
          detail="Quarterly dataset review"
          tone="info"
        />
        <KpiCard
          label="Watch queue"
          value={openWatchItems}
          detail="Open candidates"
          tone={openWatchItems > 0 ? "warning" : "success"}
        />
        <KpiCard
          label="Data version"
          value={latestRelease?.version ?? "—"}
          detail={latestRelease?.title}
          tone="default"
        />
      </div>

      <Panel
        title="How updates work"
        description="Monitoring is automated. Legal interpretation and data changes are reviewed by a person."
        action={<FreshnessBadge lastVerified={DATA_LAST_VERIFIED} />}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {UPDATE_STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="rounded-md border border-zinc-200 bg-zinc-50/60 px-3 py-2.5"
              >
                <Icon size={14} className="text-zinc-500" />
                <p className="mt-1.5 text-[12px] font-semibold text-zinc-900">
                  {step.title}
                </p>
                <p className="mt-0.5 text-[11px] leading-4 text-zinc-500">
                  {step.body}
                </p>
              </div>
            );
          })}
        </div>
      </Panel>

      <div className="mt-5 space-y-5">
        <Panel
          title="Reviewed releases"
          description="What changed, when, and who signed it off."
        >
          <div className="space-y-4">
            {dataReleases.map((release, index) => (
              <div
                key={release.version}
                className={cn(
                  "rounded-md border px-3 py-3",
                  index === 0
                    ? "border-blue-200 bg-blue-50/40"
                    : "border-zinc-200 bg-white",
                )}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-semibold text-zinc-800">
                      {release.version}
                    </span>
                    <span className="text-[12px] font-medium text-zinc-900">
                      {release.title}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-zinc-500">
                    {formatDate(release.date)}
                  </span>
                </div>
                <p className="mt-1 text-[11px] leading-5 text-zinc-600">
                  {release.summary}
                </p>
                <ul className="mt-1.5 space-y-1">
                  {release.changes.map((change) => (
                    <li
                      key={change}
                      className="flex gap-1.5 text-[10px] leading-4 text-zinc-600"
                    >
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-zinc-400" />
                      {change}
                    </li>
                  ))}
                </ul>
                <p className="mt-1.5 text-[9px] text-zinc-400">
                  Reviewed by {release.reviewedBy}
                </p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel
          title="Watch queue"
          description="Candidate changes that need review before they enter the clause library."
          action={
            <Link
              href="/pipeline/"
              className="text-[10px] font-medium text-blue-700 hover:text-blue-800"
            >
              Open pipeline
            </Link>
          }
          bodyClassName="p-0"
        >
          <WatchQueue items={regulatoryWatch} />
        </Panel>
      </div>

      <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
        <p className="text-[11px] leading-5 text-amber-900">
          A changed web page is not a legal change. The watch queue is a triage aid.
          Confirm every date, threshold, and scope against the official text before
          updating a clause.
        </p>
      </div>
    </div>
  );
}
