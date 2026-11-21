import Link from "next/link";
import { FileText } from "lucide-react";
import { StartTourButton } from "@/components/start-tour-button";

export function TopBar() {
  return (
    <div className="no-print sticky top-0 z-20 hidden border-b border-zinc-200 bg-paper/90 px-6 py-3 backdrop-blur lg:flex lg:items-center lg:justify-between">
      <div className="flex items-center gap-3 text-[13px] text-zinc-500">
        <span className="font-medium text-zinc-900">Ecodesign compliance workbench</span>
        <span className="h-3 w-px bg-zinc-300" />
        <span>Demo as of 20 Nov 2026</span>
        <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[12px] font-medium text-amber-800">
          Illustrative data
        </span>
      </div>
      <div className="flex items-center gap-2">
        <StartTourButton />
        <Link
          href="/methodology/#sources"
          className="rounded-md px-2.5 py-1.5 text-[13px] font-medium text-zinc-600 hover:bg-white hover:text-zinc-950"
        >
          Sources
        </Link>
        <Link
          href="/brief/phone-orbit-2028/"
          className="inline-flex items-center gap-1.5 rounded-md bg-blue-700 px-3 py-1.5 text-[13px] font-medium text-white hover:bg-blue-800"
        >
          <FileText size={13} />
          Generate brief
        </Link>
      </div>
    </div>
  );
}
