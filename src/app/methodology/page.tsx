import Link from "next/link";
import { ArrowUpRight, BookOpen, ExternalLink, Gavel, ShieldCheck } from "lucide-react";
import { instruments } from "@/data/instruments";
import { formatDate } from "@/lib/date";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "thesis", label: "The thesis" },
  { id: "engine", label: "Deterministic engine" },
  { id: "scheduling", label: "Scheduling model" },
  { id: "repairability", label: "Repairability model" },
  { id: "scope", label: "Scope corrections" },
  { id: "sources", label: "Sources" },
  { id: "limitations", label: "Limitations" },
  { id: "next", label: "What I'd build next" },
];

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 border-b border-zinc-200 py-6 first:pt-0 last:border-0">
      <h2 className="text-[16px] font-semibold tracking-tight text-zinc-950">{title}</h2>
      <div className="mt-3 space-y-3 text-[12px] leading-6 text-zinc-600">{children}</div>
    </section>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <pre className="overflow-x-auto rounded-md border border-zinc-200 bg-zinc-50 p-3 font-mono text-[10px] leading-5 text-zinc-700">
      {children}
    </pre>
  );
}

export default function MethodologyPage() {
  const sortedInstruments = [...instruments].sort((a, b) =>
    a.jurisdiction.localeCompare(b.jurisdiction) || a.shortId.localeCompare(b.shortId),
  );

  return (
    <div>
      <header className="mb-6 border-b border-zinc-200 pb-6">
        <p className="label">Methodology · EPM design rationale</p>
        <h1 className="mt-1.5 max-w-4xl text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
          Compliance is not a product attribute. It is a product × market × time ×
          evidence problem.
        </h1>
        <p className="mt-3 max-w-3xl text-[13px] leading-6 text-zinc-600">
          This workbench separates four things that compliance tools often collapse:
          what the law says, how we interpret it, whether we can prove it, and whether
          the program can still act on it. The separation is the design.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-[10px] text-zinc-500">
          <span className="rounded-full border border-zinc-200 bg-white px-2 py-1">
            Data as of 20 Nov 2026
          </span>
          <span className="rounded-full border border-zinc-200 bg-white px-2 py-1">
            Deterministic core · no LLM in the compliance path
          </span>
          <span className="rounded-full border border-zinc-200 bg-white px-2 py-1">
            Illustrative product data
          </span>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[180px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <nav className="sticky top-20 space-y-1">
            <p className="label px-2 pb-1">On this page</p>
            {SECTIONS.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="block rounded px-2 py-1 text-[11px] text-zinc-600 hover:bg-white hover:text-blue-700"
              >
                {section.label}
              </a>
            ))}
          </nav>
        </aside>

        <div className="min-w-0">
          <Section id="thesis" title="1. The thesis: four states, not one status">
            <p>
              A compliance tool that returns a single pass/fail pill is hiding the
              interesting work. This model keeps four states separate:
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  title: "Regulatory state",
                  body: "Instrument, article, application date, transition, source, version. This is the law, not our reading of it.",
                },
                {
                  title: "Interpretation",
                  body: "Settled, guidance, contested, or pending. The tool records confidence and legal-review status instead of pretending every clause is equally clear.",
                },
                {
                  title: "Evidence",
                  body: "Test report, declaration, certificate, label artwork, registry entry. A technical pass without an artifact is still a market-access risk.",
                },
                {
                  title: "Program execution",
                  body: "Owner, lock-in gate, qualification lead time, decision buffer, required-by date. This is where an EPM earns their keep.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-md border border-zinc-200 bg-white px-3 py-2.5"
                >
                  <p className="text-[11px] font-semibold text-zinc-900">{item.title}</p>
                  <p className="mt-1 text-[10px] leading-5 text-zinc-500">{item.body}</p>
                </div>
              ))}
            </div>
            <p>
              The portfolio view deliberately shows unknown and not-applicable states.
              Hiding them would make the dashboard look greener and the program less
              safe.
            </p>
          </Section>

          <Section id="engine" title="2. The deterministic engine">
            <p>
              Regulatory applicability is a typed predicate tree, not a string, a
              regex, or an LLM prompt. The engine evaluates it with three-valued logic:
              <span className="font-mono text-[11px] text-zinc-800"> true</span>,
              <span className="font-mono text-[11px] text-zinc-800"> false</span>, or
              <span className="font-mono text-[11px] text-zinc-800"> &quot;unknown&quot;</span>.
              Missing data never silently becomes “not applicable.”
            </p>
            <Code>{`type Predicate =
  | { op: "gte"; field: "product.battery.cyclesTo80Pct"; value: 800 }
  | { op: "in"; field: "product.category"; values: ["smartphone", "tablet"] }
  | { op: "and"; all: Predicate[] }
  | { op: "or";  any: Predicate[] }
  | { op: "not"; not: Predicate };`}</Code>
            <p>
              Every result carries a trace: the predicate branch, the actual product
              value, and the expected value. That trace is what makes the assessment
              auditable. It is also a test fixture: the tests assert the trace, not only
              the final color.
            </p>
            <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-700">
                Why no LLM in the compliance path
              </p>
              <p className="mt-1 text-[10px] leading-5 text-blue-900">
                A language model is useful for drafting narrative once the facts are
                structured. It is the wrong tool for a hard statutory date or a
                threshold. The deterministic core is a deliberate design choice, not a
                limitation.
              </p>
            </div>
          </Section>

          <Section id="scheduling" title="3. The scheduling model">
            <p>
              A statutory enforcement date is not an engineering deadline. The model
              works backward from the lock-in gate:
            </p>
            <Code>{`requiredBy = gateDate(lockInGate)
           − qualificationLeadWeeks
           − decisionBufferWeeks

late    = requiredBy < asOf
atRisk  = requiredBy − asOf < 90 days`}</Code>
            <p>
              The default gate model is illustrative (Concept −24 months, Proto −18,
              EVT −12, DVT −8, PVT −4, MP −1). Each product can override it. The bar in
              the Gantt is the decision window, not the full work duration; the dot is
              the required-by date and the bar ends at the gate.
            </p>
            <p>
              The model also asks whether the rule is relevant at all. If a product
              leaves the market before the application date, the clause may never bind.
              If the application date falls inside the sales window, it binds mid-life.
              This is why the product record includes an end-of-sale date, not only a
              launch date.
            </p>
          </Section>

          <Section id="repairability" title="4. The repairability model">
            <p>
              For smartphones and tablets, the engine implements the EU repairability
              index from Delegated Regulation (EU) 2023/1669:
            </p>
            <Code>{`R = 0.25·S_DD + 0.15·S_F + 0.15·S_T
  + 0.15·S_SP + 0.15·S_SU + 0.15·S_RI

A ≥ 4.00 · B ≥ 3.35 · C ≥ 2.55 · D ≥ 1.75 · E ≥ 1.00`}</Code>
            <p>
              The part-level weights, disassembly-depth bands, fastener scores, tool
              scores, spare-parts levels, update-duration score, and repair-information
              score are encoded in the scoring module and covered by golden tests.
            </p>
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                EU score ≠ French index
              </p>
              <p className="mt-1 text-[10px] leading-5 text-amber-900">
                Smartphones and tablets use the EU energy label repairability class.
                France’s national repairability index still applies to laptops and other
                categories. The laptop score shown in this prototype is an explicitly
                labelled illustrative five-criteria approximation; the official
                category-specific arrêté is not yet encoded.
              </p>
            </div>
          </Section>

          <Section id="scope" title="5. Scope corrections that shaped the data">
            <p>
              These are the corrections that changed the model after reading the primary
              sources. They are also the details most likely to be challenged in a
              compliance review.
            </p>
            <div className="overflow-hidden rounded-md border border-zinc-200">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50">
                    {["Topic", "Correction", "Why it matters"].map((header) => (
                      <th
                        key={header}
                        className="px-2.5 py-2 text-[9px] font-semibold uppercase tracking-wide text-zinc-500"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      topic: "Battery Passport",
                      correction:
                        "Article 77 covers LMT, EV and industrial batteries above 2 kWh. Portable batteries — phones, laptops, earbuds — are outside it.",
                      why: "A smartphone should not be shown as requiring a battery passport. The ESPR DPP is a separate, delegated-act-dependent instrument.",
                    },
                    {
                      topic: "Article 11 derogations",
                      correction:
                        "The wet-environment and wearable paths are narrow, evidence-based, and only where safety requires. An IP rating alone is not enough.",
                      why: "The flagship trade-off must not rest on a non-existent exemption. A handheld smartphone does not qualify as a wearable or a wet appliance.",
                    },
                    {
                      topic: "2023/1670 battery path",
                      correction:
                        "The 500-cycle/83% and 1,000-cycle/80% + IP67 conditions are a conjunction for the professional-only battery availability path. They are not alternatives to the 800-cycle design requirement.",
                      why: "The requirement structure changes the engineering trade-off and the evidence plan.",
                    },
                    {
                      topic: "EU vs France",
                      correction:
                        "The EU repairability class under 2023/1669 applies to smartphones and tablets. The French index is a separate national instrument and still applies to laptops.",
                      why: "Conflating them is a domain error. The tool keeps the labels, formulas, and legal bases separate.",
                    },
                    {
                      topic: "ESPR ICT timing",
                      correction:
                        "The DPP Registry became operational on 20 July 2026. The ICT delegated act is expected in 2029, with an approximately 18-month transition.",
                      why: "DPP is a readiness problem now, not a current smartphone obligation. The tool labels it provisional.",
                    },
                    {
                      topic: "2025/2052 dates",
                      correction:
                        "Early compliance from 14 Dec 2025; general application 14 Dec 2028; >100 W USB-PD efficiency transition to 14 Dec 2030; spare-part EPS to 14 Dec 2033.",
                      why: "Three different dates create three different program deadlines. The 140 W adapter also has a permanent interoperability exemption, separate from the efficiency transition.",
                    },
                  ].map((row) => (
                    <tr key={row.topic} className="border-b border-zinc-100 last:border-0">
                      <td className="px-2.5 py-2 align-top text-[10px] font-medium text-zinc-800">
                        {row.topic}
                      </td>
                      <td className="px-2.5 py-2 align-top text-[10px] leading-5 text-zinc-600">
                        {row.correction}
                      </td>
                      <td className="px-2.5 py-2 align-top text-[10px] leading-5 text-zinc-500">
                        {row.why}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section id="sources" title="6. Sources">
            <p>
              The dataset is a curated snapshot, not a live regulatory feed. Every
              instrument has an official source and a last-verified date. The prototype
              is designed to make provenance visible, not to replace legal review.
            </p>
            <div className="overflow-hidden rounded-md border border-zinc-200">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50">
                    {["Instrument", "Jurisdiction", "Applies from", "Confidence", "Source"].map(
                      (header) => (
                        <th
                          key={header}
                          className="px-2.5 py-2 text-[9px] font-semibold uppercase tracking-wide text-zinc-500"
                        >
                          {header}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {sortedInstruments.map((instrument) => (
                    <tr
                      key={instrument.id}
                      className="border-b border-zinc-100 last:border-0"
                    >
                      <td className="px-2.5 py-2 align-top">
                        <p className="text-[10px] font-medium text-zinc-800">
                          {instrument.shortId}
                        </p>
                        <p className="mt-0.5 max-w-[260px] text-[9px] leading-4 text-zinc-500">
                          {instrument.title}
                        </p>
                      </td>
                      <td className="px-2.5 py-2 align-top font-mono text-[9px] text-zinc-600">
                        {instrument.jurisdiction}
                      </td>
                      <td className="px-2.5 py-2 align-top font-mono text-[9px] text-zinc-600">
                        {formatDate(instrument.applicationDate)}
                      </td>
                      <td className="px-2.5 py-2 align-top">
                        <span
                          className={cn(
                            "inline-flex rounded-full border px-1.5 py-0.5 text-[8px] font-medium capitalize",
                            instrument.confidence === "high"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                              : instrument.confidence === "medium"
                                ? "border-amber-200 bg-amber-50 text-amber-800"
                                : "border-zinc-200 bg-zinc-50 text-zinc-600",
                          )}
                        >
                          {instrument.confidence}
                        </span>
                      </td>
                      <td className="px-2.5 py-2 align-top">
                        <a
                          href={instrument.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[9px] font-medium text-blue-700 hover:text-blue-800"
                        >
                          Official text
                          <ExternalLink size={9} />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-zinc-500">
              Last verified: {formatDate("2026-11-20")}. Sources include EUR-Lex,
              the European Commission, the French service-public portal, the California
              Legislature, the Oregon Legislature, the US eCFR, ENERGY STAR, and the CPCB.
            </p>
          </Section>

          <Section id="limitations" title="7. Limitations">
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                "Illustrative product and program data, not Apple data.",
                "Curated regulatory snapshot, not legal advice.",
                "Gate offsets are a generic model; real OEM gates vary by program.",
                "France laptop score is illustrative until the category arrêté is encoded.",
                "US and India data are lower-confidence and labelled accordingly.",
                "No live PLM/BOM, supplier, LCA, EPREL, SCIP, or DPP registry connection.",
                "No multi-user workflow, approvals, notifications, or audit log.",
                "Demo date is fixed at 20 Nov 2026 to prevent rot.",
              ].map((item) => (
                <div
                  key={item}
                  className="flex gap-2 rounded border border-zinc-200 bg-white px-2.5 py-2"
                >
                  <ShieldCheck size={12} className="mt-0.5 shrink-0 text-zinc-400" />
                  <p className="text-[10px] leading-4 text-zinc-600">{item}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section id="next" title="8. What I'd build next">
            <ol className="space-y-2">
              {[
                "Connect the clause library to a regulatory feed and a human review workflow, with a diff view for amendments and delegated acts.",
                "Integrate PLM/BOM, supplier portals, LCA models, EPREL/SCIP, and the DPP registry sandbox so evidence status is live rather than curated.",
                "Add role-based access, assignments, notifications, approvals, and an audit log for a real cross-functional program.",
                "Add resource and lab-capacity planning: the schedule collision is only actionable if the validation capacity exists.",
                "Add SKU segmentation and harmonisation analysis: design once globally or segment markets for the strictest requirement.",
                "Add an optional, grounded drafting assistant for narrative polish, with citations and a mandatory human review step. Keep it out of the compliance path.",
              ].map((item, index) => (
                <li key={item} className="flex gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white font-mono text-[9px] text-zinc-500">
                    {index + 1}
                  </span>
                  <span className="text-[11px] leading-5 text-zinc-600">{item}</span>
                </li>
              ))}
            </ol>
            <div className="mt-4 flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2">
              <Gavel size={14} className="shrink-0 text-zinc-400" />
              <p className="text-[9px] leading-4 text-zinc-500">
                The design rationale is deliberately explicit about what is not modeled.
                A compliance tool that hides its assumptions is more dangerous than one
                that shows them.
              </p>
            </div>
          </Section>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-3">
            <div className="flex items-center gap-2">
              <BookOpen size={15} className="text-zinc-500" />
              <p className="text-[10px] text-zinc-600">
                Want the short version? Follow the five-minute path on the portfolio
                page.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-700 hover:text-blue-800"
            >
              Back to portfolio
              <ArrowUpRight size={11} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
