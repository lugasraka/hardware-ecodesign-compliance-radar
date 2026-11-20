import { CheckCircle2, CircleHelp, XCircle } from "lucide-react";
import type { TraceNode } from "@/domain/types";
import { cn } from "@/lib/utils";

function formatValue(value: unknown): string {
  if (value === undefined) return "—";
  if (value === null) return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
}

export function TraceTree({ trace }: { trace: TraceNode }) {
  return (
    <div className="space-y-1">
      <TraceRow node={trace} depth={0} />
    </div>
  );
}

function TraceRow({ node, depth }: { node: TraceNode; depth: number }) {
  const Icon =
    node.result === true ? CheckCircle2 : node.result === false ? XCircle : CircleHelp;
  const iconClass =
    node.result === true
      ? "text-emerald-600"
      : node.result === false
        ? "text-red-600"
        : "text-violet-600";

  return (
    <div className={cn(depth > 0 && "ml-3 border-l border-zinc-200 pl-3")}>
      <div className="flex items-start gap-1.5 py-0.5">
        <Icon size={12} className={cn("mt-0.5 shrink-0", iconClass)} />
        <div className="min-w-0">
          <p className="text-[11px] leading-4 text-zinc-700">{node.label}</p>
          {node.actual !== undefined ? (
            <p className="text-[9px] leading-3 text-zinc-400">
              actual: <span className="font-mono">{formatValue(node.actual)}</span>
              {node.expected !== undefined ? (
                <>
                  {" "}
                  · expected: <span className="font-mono">{formatValue(node.expected)}</span>
                </>
              ) : null}
            </p>
          ) : null}
        </div>
      </div>
      {node.children?.map((child, index) => (
        <TraceRow key={`${child.label}-${index}`} node={child} depth={depth + 1} />
      ))}
    </div>
  );
}
