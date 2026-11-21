"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { CopyButton } from "@/components/copy-button";
import { PrintButton } from "@/components/print-button";

type BriefViewMode = "summary" | "full";

const VIEWS: { id: BriefViewMode; label: string }[] = [
  { id: "summary", label: "Summary" },
  { id: "full", label: "Full brief" },
];

export function BriefShell({
  productId,
  productShortName,
  markdown,
  summary,
  full,
}: {
  productId: string;
  productShortName: string;
  markdown: string;
  summary: React.ReactNode;
  full: React.ReactNode;
}) {
  const [view, setView] = useState<BriefViewMode>("summary");

  useEffect(() => {
    const applyHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash === "summary" || hash === "full") {
        setView(hash);
      }
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  const selectView = (next: BriefViewMode) => {
    setView(next);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${next}`);
    }
  };

  return (
    <div>
      <div className="no-print mb-4 flex flex-col gap-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href={`/products/${productId}/`}
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-zinc-600 hover:text-blue-700"
          >
            <ArrowLeft size={13} />
            Back to {productShortName}
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-md border border-zinc-200 bg-white p-0.5">
              {VIEWS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={view === item.id}
                  onClick={() => selectView(item.id)}
                  className={cn(
                    "rounded px-2.5 py-1 text-[12px] font-medium transition-colors",
                    view === item.id
                      ? "bg-zinc-900 text-white"
                      : "text-zinc-600 hover:text-zinc-900",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <CopyButton text={markdown} />
            <PrintButton />
          </div>
        </div>
        <p className="text-[11px] text-zinc-500">
          The summary is the executive view. The PDF is always a one-page A4 summary.
        </p>
      </div>

      <div className="no-print">{view === "summary" ? summary : full}</div>
    </div>
  );
}
