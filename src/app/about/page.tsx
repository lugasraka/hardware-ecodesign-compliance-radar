import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ExternalLink,
  FileText,
  GitBranch,
  Layers,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { PageHeader, Panel } from "@/components/primitives";

const DEMO_STEPS = [
  {
    title: "Start with the portfolio",
    body: "See the product × regulation heatmap, the decisions due, the top risks, and the regulatory watch. The home view is a program review, not a landing page.",
    href: "/",
    label: "Open portfolio",
  },
  {
    title: "Follow the Article 11 decision",
    body: "Open the 2028 flagship. The battery is professional-serviceable and 1,000-cycle, but it is not user-removable. The Article 11 decision window is closing.",
    href: "/products/phone-orbit-2028/",
    label: "Open hero product",
  },
  {
    title: "Read the requirement ledger",
    body: "Select the Article 11 clause. The detail panel shows the legal text, the interpretation status, the predicate trace, the evidence requirements, and the required-by date.",
    href: "/products/phone-orbit-2028/#requirements",
    label: "Open requirements",
  },
  {
    title: "Inspect the schedule",
    body: "The Gantt works backward from the lock-in gate. It shows the decision window, the late items, the regulatory milestones, and the as-of date.",
    href: "/products/phone-orbit-2028/#schedule",
    label: "Open schedule",
  },
  {
    title: "Generate the brief",
    body: "The one-page brief has a one-line ask, exposure, a weighted options matrix, the recommendation, what would change it, owners, gates, and dissent.",
    href: "/brief/phone-orbit-2028/",
    label: "Open exec brief",
  },
  {
    title: "Read the methodology",
    body: "The methodology page explains the four-state model, the tri-state engine, the scheduling formula, the repairability formula, the scope corrections, and the limitations.",
    href: "/methodology/",
    label: "Open methodology",
  },
];

export default function AboutPage() {
  return (
    <div>
      <PageHeader
        eyebrow="About this demo"
        title="A working prototype for product environmental compliance strategy."
        description="Built to demonstrate the operating model of a Product Environmental Compliance Strategy EPM: interpret the law, translate it into engineering constraints, expose the program risk, and give leaders a real decision."
        actions={
          <Link
            href="/products/phone-orbit-2028/"
            className="inline-flex items-center gap-1.5 rounded-md bg-blue-700 px-3 py-2 text-[13px] font-medium text-white hover:bg-blue-800"
          >
            Start the demo
            <ArrowRight size={14} />
          </Link>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,1fr)]">
        <Panel
          title="The five-minute path"
          description="A recruiter or hiring manager should be able to see the signal without reading a manual."
        >
          <ol className="space-y-3">
            {DEMO_STEPS.map((step, index) => (
              <li key={step.title} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 font-mono text-[12px] font-medium text-zinc-600">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-zinc-900">{step.title}</p>
                  <p className="mt-0.5 text-[12px] leading-4 text-zinc-500">{step.body}</p>
                  <Link
                    href={step.href}
                    className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-blue-700 hover:text-blue-800"
                  >
                    {step.label}
                    <ArrowRight size={10} />
                  </Link>
                </div>
              </li>
            ))}
          </ol>
        </Panel>

        <div className="space-y-5">
          <Panel title="What this is" description="The honest scope.">
            <ul className="space-y-2">
              {[
                "A portfolio-level compliance workbench with a deterministic applicability engine.",
                "A program artifact: requirement ledger, NPI Gantt, risk register, decision log, and one-page brief.",
                "A repairability scorecard that implements the official EU smartphone/tablet formula.",
                "A demonstration of regulatory strategy, not only regulatory tracking.",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <CheckCircle2 size={12} className="mt-0.5 shrink-0 text-emerald-600" />
                  <span className="text-[12px] leading-4 text-zinc-600">{item}</span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="What this is not" description="The boundaries matter.">
            <ul className="space-y-2">
              {[
                "Not legal advice. Confirm every interpretation with Legal and the primary source.",
                "Not Apple data. Product names, units, costs, and program dates are illustrative.",
                "Not a production workflow tool. There is no auth, PLM/BOM integration, or audit log.",
                "Not a live regulatory feed. The data is a curated snapshot verified on 20 Nov 2026.",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <ShieldAlert size={12} className="mt-0.5 shrink-0 text-amber-600" />
                  <span className="text-[12px] leading-4 text-zinc-600">{item}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Panel
          title="Why this shape"
          description="A program workbench, not a sustainability dashboard."
          action={<Layers size={15} className="text-zinc-400" />}
        >
          <p className="text-[12px] leading-5 text-zinc-600">
            Hardware teams rarely fail compliance because the law is unknown. They fail
            because applicability is discovered after the enclosure, battery, or BOM is
            frozen. The workbench is organized around that failure mode: product ×
            market × time × evidence, pinned to NPI gates and owners.
          </p>
        </Panel>

        <Panel
          title="How it is built"
          description="Static-first, testable, and deliberately deterministic."
          action={<GitBranch size={15} className="text-zinc-400" />}
        >
          <p className="text-[12px] leading-5 text-zinc-600">
            Next.js App Router, TypeScript, Tailwind CSS, and a static export. The domain
            layer is pure TypeScript: typed predicates, tri-state evaluation, schedule
            math, repairability scoring, and brief generation. No database, no API keys,
            no LLM in the compliance path.
          </p>
          <p className="mt-2 text-[11px] text-zinc-500">
            Data validation fails the build if a clause lacks a source, owner, gate, or
            evidence requirement.
          </p>
        </Panel>

        <Panel
          title="Who built it"
          description="Product sustainability, LCA, and compliance strategy."
          action={<Sparkles size={15} className="text-zinc-400" />}
        >
          <p className="text-[12px] leading-5 text-zinc-600">
            Built by Raka Adrianto as a portfolio artifact for product environmental
            compliance strategy roles. The project draws on a PhD and LCA background and
            an interest in the program-management side of sustainability: the decisions,
            owners, gates, and evidence that turn a policy into a shipped product.
          </p>
          <a
            href="https://raka-adrianto.com"
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-blue-700 hover:text-blue-800"
          >
            raka-adrianto.com
            <ExternalLink size={9} />
          </a>
        </Panel>
      </div>

      <div className="mt-5 rounded-lg border border-zinc-200 bg-white px-4 py-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2">
            <FileText size={14} className="mt-0.5 shrink-0 text-zinc-500" />
            <p className="text-[12px] leading-5 text-zinc-600">
              The source code and README will be published on GitHub. The live demo is
              designed for a Vercel deployment; the app is a static export, so it can run
              locally or on any static host.
            </p>
          </div>
          <Link
            href="/methodology/#sources"
            className="inline-flex shrink-0 items-center gap-1 text-[12px] font-medium text-blue-700 hover:text-blue-800"
          >
            Data sources
            <ArrowUpRight size={11} />
          </Link>
        </div>
      </div>
    </div>
  );
}
