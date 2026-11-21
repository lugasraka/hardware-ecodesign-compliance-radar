"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-1.5 rounded-md bg-blue-700 px-3 py-2 text-[13px] font-medium text-white hover:bg-blue-800"
    >
      <Printer size={13} />
      Print / Save one-page PDF
    </button>
  );
}
