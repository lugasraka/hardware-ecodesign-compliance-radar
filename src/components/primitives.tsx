import Link from "next/link";
import type { ReactNode } from "react";
import {
  CheckCircle2,
  CircleDashed,
  Clock3,
  FileWarning,
  MinusCircle,
  ShieldAlert,
  TriangleAlert,
} from "lucide-react";
import type {
  EvidenceStatus,
  MarketCode,
  OverallStatus,
  ProgramStatus,
  Severity,
} from "@/domain/types";
import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-col gap-4 border-b border-zinc-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        {eyebrow ? <p className="label">{eyebrow}</p> : null}
        <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-3xl text-[13px] leading-6 text-zinc-600">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </header>
  );
}

export function Panel({
  title,
  description,
  action,
  children,
  className,
  bodyClassName,
}: {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn("card overflow-hidden", className)}>
      {title || action ? (
        <div className="flex flex-col gap-2 border-b border-zinc-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {title ? (
              <h2 className="text-[13px] font-semibold tracking-tight text-zinc-900">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="mt-0.5 text-[13px] leading-4 text-zinc-500">{description}</p>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      ) : null}
      <div className={cn("p-4", bodyClassName)}>{children}</div>
    </section>
  );
}

export function KpiCard({
  label,
  value,
  detail,
  tone = "default",
  href,
}: {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  tone?: "default" | "danger" | "warning" | "success" | "info";
  href?: string;
}) {
  const toneClass = {
    default: "text-zinc-950",
    danger: "text-red-700",
    warning: "text-amber-700",
    success: "text-emerald-700",
    info: "text-blue-700",
  }[tone];

  const content = (
    <div className="card h-full px-4 py-3 transition-colors hover:border-zinc-300">
      <p className="label">{label}</p>
      <p className={cn("mt-1 text-xl font-semibold tracking-tight tabular", toneClass)}>
        {value}
      </p>
      {detail ? (
        <p className="mt-1 text-[13px] leading-4 text-zinc-500">{detail}</p>
      ) : null}
    </div>
  );

  return href ? (
    <Link href={href} className="block h-full">
      {content}
    </Link>
  ) : (
    content
  );
}

const statusStyles: Record<
  OverallStatus,
  { label: string; className: string; icon: typeof CheckCircle2 }
> = {
  non_compliant: {
    label: "Non-compliant",
    className: "border-red-200 bg-red-50 text-red-800",
    icon: ShieldAlert,
  },
  at_risk: {
    label: "At risk",
    className: "border-amber-200 bg-amber-50 text-amber-800",
    icon: TriangleAlert,
  },
  compliant: {
    label: "Compliant",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
    icon: CheckCircle2,
  },
  not_applicable: {
    label: "Not applicable",
    className: "border-zinc-200 bg-zinc-50 text-zinc-600",
    icon: MinusCircle,
  },
  unknown: {
    label: "Unknown",
    className: "border-violet-200 bg-violet-50 text-violet-800",
    icon: CircleDashed,
  },
};

const statusShortLabel: Record<OverallStatus, string> = {
  non_compliant: "Fail",
  at_risk: "Risk",
  compliant: "Pass",
  not_applicable: "N/A",
  unknown: "?",
};

export function StatusPill({
  status,
  compact = false,
}: {
  status: OverallStatus;
  compact?: boolean;
}) {
  const config = statusStyles[status];
  const Icon = config.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[12px] font-medium whitespace-nowrap",
        config.className,
      )}
    >
      <Icon size={11} strokeWidth={2} />
      {compact ? statusShortLabel[status] : config.label}
    </span>
  );
}

const programStyles: Record<
  ProgramStatus,
  { label: string; className: string; icon: typeof CheckCircle2 }
> = {
  on_track: {
    label: "On track",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
    icon: CheckCircle2,
  },
  monitor: {
    label: "Monitor",
    className: "border-blue-200 bg-blue-50 text-blue-800",
    icon: Clock3,
  },
  act_now: {
    label: "Act now",
    className: "border-amber-200 bg-amber-50 text-amber-800",
    icon: TriangleAlert,
  },
  late: {
    label: "Late",
    className: "border-red-200 bg-red-50 text-red-800",
    icon: ShieldAlert,
  },
  not_applicable: {
    label: "—",
    className: "border-zinc-200 bg-zinc-50 text-zinc-500",
    icon: MinusCircle,
  },
};

export function ProgramPill({ status }: { status: ProgramStatus }) {
  const config = programStyles[status];
  const Icon = config.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[12px] font-medium whitespace-nowrap",
        config.className,
      )}
    >
      <Icon size={11} strokeWidth={2} />
      {config.label}
    </span>
  );
}

const evidenceStyles: Record<EvidenceStatus, { label: string; className: string }> = {
  sufficient: {
    label: "Evidence ready",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  partial: {
    label: "Evidence partial",
    className: "border-amber-200 bg-amber-50 text-amber-800",
  },
  missing: {
    label: "Evidence missing",
    className: "border-red-200 bg-red-50 text-red-800",
  },
  expired: {
    label: "Evidence expired",
    className: "border-red-200 bg-red-50 text-red-800",
  },
};

export function EvidencePill({ status }: { status: EvidenceStatus }) {
  const config = evidenceStyles[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[12px] font-medium whitespace-nowrap",
        config.className,
      )}
    >
      <FileWarning size={11} strokeWidth={2} />
      {config.label}
    </span>
  );
}

const severityStyles: Record<Severity, { label: string; className: string }> = {
  market_access: {
    label: "Market access",
    className: "border-red-200 bg-red-50 text-red-800",
  },
  labeling_penalty: {
    label: "Labeling",
    className: "border-amber-200 bg-amber-50 text-amber-800",
  },
  monitoring: {
    label: "Monitoring",
    className: "border-zinc-200 bg-zinc-50 text-zinc-600",
  },
};

export function SeverityPill({ severity }: { severity: Severity }) {
  const config = severityStyles[severity];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[12px] font-medium",
        config.className,
      )}
    >
      {config.label}
    </span>
  );
}

export function MarketBadge({ market }: { market: MarketCode }) {
  return (
    <span className="inline-flex rounded border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 font-mono text-[11px] font-medium uppercase tracking-wide text-zinc-600">
      {market}
    </span>
  );
}

export function CoverageBar({
  value,
  label,
  detail,
}: {
  value: number;
  label: string;
  detail?: string;
}) {
  const percent = Math.round(Math.max(0, Math.min(1, value)) * 100);
  const tone =
    percent >= 90
      ? "bg-emerald-500"
      : percent >= 70
        ? "bg-blue-600"
        : percent >= 50
          ? "bg-amber-500"
          : "bg-red-500";

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[13px] font-medium text-zinc-700">{label}</span>
        <span className="font-mono text-[12px] text-zinc-500 tabular">{percent}%</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-zinc-100">
        <div className={cn("h-full rounded-full", tone)} style={{ width: `${percent}%` }} />
      </div>
      {detail ? <p className="mt-1 text-[12px] text-zinc-500">{detail}</p> : null}
    </div>
  );
}

export function Legend({
  items,
}: {
  items: { label: string; className: string }[];
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-[12px] text-zinc-500">
      {items.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-1.5">
          <span className={cn("h-2 w-2 rounded-sm", item.className)} />
          {item.label}
        </span>
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-4 py-8 text-center">
      <p className="text-[13px] font-medium text-zinc-700">{title}</p>
      {description ? (
        <p className="mx-auto mt-1 max-w-md text-[13px] leading-5 text-zinc-500">
          {description}
        </p>
      ) : null}
    </div>
  );
}
