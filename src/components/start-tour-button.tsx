"use client";

import { Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTour } from "@/components/tour-provider";

export function StartTourButton({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  const tour = useTour();
  return (
    <button
      type="button"
      onClick={tour.start}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-blue-300 bg-white font-medium text-blue-800 hover:border-blue-400 hover:bg-blue-50",
        compact ? "px-2 py-1 text-[12px]" : "px-3 py-2 text-[13px]",
        className,
      )}
    >
      <Play size={compact ? 10 : 12} />
      {compact ? "Tour" : "Start tour"}
    </button>
  );
}
