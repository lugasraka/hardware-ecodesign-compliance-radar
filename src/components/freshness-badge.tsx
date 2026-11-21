"use client";

import { useSyncExternalStore } from "react";
import {
  getFreshnessStatus,
  type FreshnessStatus,
} from "@/domain/freshness";
import { cn } from "@/lib/utils";

const STYLES: Record<FreshnessStatus, string> = {
  current: "border-emerald-200 bg-emerald-50 text-emerald-800",
  due_soon: "border-amber-200 bg-amber-50 text-amber-800",
  overdue: "border-red-200 bg-red-50 text-red-800",
};

const LABELS: Record<FreshnessStatus, string> = {
  current: "Current",
  due_soon: "Review due soon",
  overdue: "Review overdue",
};

const subscribe = () => () => {};
const getToday = () => new Date().toISOString().slice(0, 10);
const getServerToday = () => null;

export function FreshnessBadge({
  lastVerified,
  className,
}: {
  lastVerified: string;
  className?: string;
}) {
  const today = useSyncExternalStore(subscribe, getToday, getServerToday);

  if (!today) {
    return null;
  }

  const status = getFreshnessStatus(today, lastVerified).status;

  return (
    <span
      title="Review status relative to today"
      className={cn(
        "inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium",
        STYLES[status],
        className,
      )}
    >
      {LABELS[status]}
    </span>
  );
}
