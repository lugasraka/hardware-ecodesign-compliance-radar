import { ArrowUpRight, Wrench } from "lucide-react";
import type { Product, RepairabilityResult } from "@/domain/types";
import type { RepairabilityLever } from "@/domain/scoring";
import { cn, titleCase } from "@/lib/utils";
import { EmptyState, Panel } from "@/components/primitives";

const CLASS_TONE: Record<RepairabilityResult["euClass"], string> = {
  A: "bg-emerald-600",
  B: "bg-emerald-500",
  C: "bg-blue-600",
  D: "bg-amber-500",
  E: "bg-red-500",
  "Not classified": "bg-zinc-400",
};

const BREAKDOWN_LABELS: { key: keyof RepairabilityResult["breakdown"]; label: string }[] = [
  { key: "disassembly", label: "Disassembly depth" },
  { key: "fasteners", label: "Fasteners" },
  { key: "tools", label: "Tools" },
  { key: "spareParts", label: "Spare parts" },
  { key: "softwareUpdates", label: "Software updates" },
  { key: "repairInfo", label: "Repair information" },
];

function ScoreBar({ value, max = 5 }: { value: number; max?: number }) {
  const percent = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100">
      <div
        className={cn(
          "h-full rounded-full",
          percent >= 80
            ? "bg-emerald-500"
            : percent >= 60
              ? "bg-blue-500"
              : percent >= 40
                ? "bg-amber-500"
                : "bg-red-500",
        )}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

export function RepairabilityPanel({
  product,
  result,
  levers,
}: {
  product: Product;
  result: RepairabilityResult | null;
  levers: RepairabilityLever[];
}) {
  if (!result) {
    return (
      <Panel
        title="Repairability scorecard"
        description="The EU repairability class applies to smartphones and slate tablets; the French index applies to laptops. Other categories are not scored in this prototype."
      >
        <EmptyState
          title={`No repairability score model for ${product.category.replace("_", " ")}`}
          description="This is a deliberate scope boundary, not missing data. The engine can score a smartphone/tablet with the official EU formula and a laptop with the illustrative French five-criteria model."
        />
      </Panel>
    );
  }

  const isPhoneOrTablet = product.category === "smartphone" || product.category === "tablet";
  const bestLever = levers[0];

  return (
    <Panel
      title="Repairability scorecard"
      description={
        isPhoneOrTablet
          ? "Official EU repairability index and class from Delegated Regulation (EU) 2023/1669. The calculation is deterministic from part-level inputs."
          : "Illustrative French five-criteria score. The official category-specific arrêté is not yet encoded; use this as a design-sensitivity tool, not a label value."
      }
      action={
        <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[11px] font-medium text-zinc-600">
          <Wrench size={10} />
          {isPhoneOrTablet ? "EU 2023/1669" : "France index · illustrative"}
        </span>
      }
    >
      <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
        <div className="flex flex-col items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-5 text-center">
          <span
            className={cn(
              "flex h-16 w-16 items-center justify-center rounded-full text-3xl font-semibold text-white",
              CLASS_TONE[result.euClass],
            )}
          >
            {result.euClass === "Not classified" ? "—" : result.euClass}
          </span>
          <p className="mt-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
            {isPhoneOrTablet ? "EU repairability class" : "Illustrative class"}
          </p>
          <p className="mt-1 font-mono text-2xl font-semibold tabular text-zinc-950">
            {result.index.toFixed(2)}
          </p>
          <p className="text-[11px] text-zinc-500">index / 5.00</p>
          <div className="mt-3 w-full border-t border-zinc-200 pt-2">
            {isPhoneOrTablet ? (
              <p className="text-[10px] leading-3 text-zinc-500">
                France’s national repairability index does not apply to smartphones or
                tablets. The EU energy-label class governs.
              </p>
            ) : (
              <>
                <div className="flex items-baseline justify-between">
                  <span className="text-[11px] uppercase tracking-wide text-zinc-500">
                    France / 10
                  </span>
                  <span className="font-mono text-[13px] font-semibold text-zinc-800">
                    {result.france.index.toFixed(1)}
                  </span>
                </div>
                <p className="mt-1 text-[10px] leading-3 text-zinc-400">
                  Illustrative five-criteria score, not an official label.
                </p>
              </>
            )}
          </div>
        </div>

        <div className="min-w-0">
          <div className="grid gap-x-5 gap-y-2 sm:grid-cols-2">
            {BREAKDOWN_LABELS.map((item) => {
              const value = result.breakdown[item.key];
              return (
                <div key={item.key}>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[12px] text-zinc-600">{item.label}</span>
                    <span className="font-mono text-[12px] font-medium text-zinc-800 tabular">
                      {value.toFixed(2)}
                    </span>
                  </div>
                  <div className="mt-1">
                    <ScoreBar value={value} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 overflow-hidden rounded-md border border-zinc-200">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50">
                  {["Priority part", "Steps", "Fastener", "Tool", "Weight", "DD", "F", "T"].map(
                    (header) => (
                      <th
                        key={header}
                        className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500"
                      >
                        {header}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {result.partScores.map((part) => {
                  const input = product.repairability?.parts[part.key];
                  return (
                    <tr key={part.key} className="border-b border-zinc-100 last:border-0">
                      <td className="px-2 py-1.5 text-[12px] text-zinc-700">{part.label}</td>
                      <td className="px-2 py-1.5 font-mono text-[12px] text-zinc-600 tabular">
                        {input?.disassemblySteps ?? "—"}
                      </td>
                      <td className="px-2 py-1.5 text-[11px] text-zinc-600">
                        {input ? titleCase(input.fastener) : "Not present"}
                      </td>
                      <td className="px-2 py-1.5 text-[11px] text-zinc-600">
                        {input ? titleCase(input.tool) : "Not present"}
                      </td>
                      <td className="px-2 py-1.5 font-mono text-[11px] text-zinc-500 tabular">
                        {part.weight.toFixed(2)}
                      </td>
                      <td className="px-2 py-1.5 font-mono text-[12px] text-zinc-700 tabular">
                        {part.dd}
                      </td>
                      <td className="px-2 py-1.5 font-mono text-[12px] text-zinc-700 tabular">
                        {part.f}
                      </td>
                      <td className="px-2 py-1.5 font-mono text-[12px] text-zinc-700 tabular">
                        {part.t}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div>
          <div className="flex items-center justify-between">
            <p className="label">Design levers</p>
            {bestLever ? (
              <span className="text-[11px] text-zinc-500">
                Best: +{bestLever.delta.toFixed(2)} index points
              </span>
            ) : null}
          </div>
          <div className="mt-1.5 space-y-1.5">
            {levers.length === 0 ? (
              <p className="text-[12px] text-zinc-500">
                No modeled lever improves the score further.
              </p>
            ) : (
              levers.map((lever) => (
                <div
                  key={lever.id}
                  className="flex items-center justify-between gap-3 rounded border border-zinc-200 px-2.5 py-1.5"
                >
                  <div>
                    <p className="text-[12px] font-medium text-zinc-800">{lever.label}</p>
                    <p className="text-[11px] text-zinc-500">{lever.detail}</p>
                  </div>
                  <span
                    className={cn(
                      "font-mono text-[13px] font-semibold tabular",
                      lever.delta > 0 ? "text-emerald-700" : "text-zinc-500",
                    )}
                  >
                    {lever.delta > 0 ? "+" : ""}
                    {lever.delta.toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          {isPhoneOrTablet ? (
            <>
              <p className="label">Why the EU class, not the French index</p>
              <p className="mt-1.5 text-[12px] leading-5 text-zinc-600">
                The EU energy-label repairability class is the harmonised score for
                smartphones and tablets. France’s national index applies to laptops and
                other categories; it is not an EU score.
              </p>
              <p className="mt-2 text-[11px] leading-4 text-zinc-500">
                The panel still computes a France-style score internally for comparison,
                but it is not presented as a label value for this product.
              </p>
            </>
          ) : (
            <>
              <p className="label">France repairability criteria (illustrative)</p>
              <div className="mt-1.5 space-y-1.5">
                {result.france.criteria.map((criterion) => (
                  <div key={criterion.label}>
                    <div className="flex items-baseline justify-between">
                      <span className="text-[12px] text-zinc-600">{criterion.label}</span>
                      <span className="font-mono text-[12px] text-zinc-700 tabular">
                        {criterion.score.toFixed(1)} / 20
                      </span>
                    </div>
                    <div className="mt-1">
                      <ScoreBar value={criterion.score} max={20} />
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-[11px] leading-4 text-zinc-500">
                The French index is a national instrument. For smartphones and tablets,
                the EU energy label repairability class is the harmonised score. Do not
                present the French score as an EU score.
              </p>
            </>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2">
        <Wrench size={13} className="mt-0.5 shrink-0 text-zinc-500" />
        <p className="text-[11px] leading-4 text-zinc-500">
          Formula: R = 0.25·S<sub>DD</sub> + 0.15·S<sub>F</sub> + 0.15·S<sub>T</sub> +
          0.15·S<sub>SP</sub> + 0.15·S<sub>SU</sub> + 0.15·S<sub>RI</sub>. Part-level
          inputs are illustrative. A production score requires audited repair
          information and test evidence.
          <a
            href="https://eur-lex.europa.eu/eli/reg_del/2023/1669/oj/eng"
            target="_blank"
            rel="noreferrer"
            className="ml-1 inline-flex items-center gap-0.5 font-medium text-blue-700 hover:text-blue-800"
          >
            Source
            <ArrowUpRight size={9} />
          </a>
        </p>
      </div>
    </Panel>
  );
}
