import type { RegulatoryWatchItem, WatchStatus } from "@/data/regulatory-watch";
import { formatDate } from "@/lib/date";
import { cn, titleCase } from "@/lib/utils";
import { EmptyState } from "@/components/primitives";

const STATUS_STYLES: Record<WatchStatus, string> = {
  new: "border-amber-200 bg-amber-50 text-amber-800",
  triaged: "border-blue-200 bg-blue-50 text-blue-800",
  incorporated: "border-emerald-200 bg-emerald-50 text-emerald-800",
  dismissed: "border-zinc-200 bg-zinc-50 text-zinc-600",
};

export function WatchQueue({ items }: { items: RegulatoryWatchItem[] }) {
  if (items.length === 0) {
    return (
      <EmptyState
        title="No candidate changes"
        description="The next scheduled source check will add candidates here."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[860px] border-collapse text-left">
        <thead>
          <tr className="border-b border-zinc-200">
            {["Candidate", "Type", "Detected", "Status", "Owner", "Action"].map(
              (header) => (
                <th
                  key={header}
                  className="px-2.5 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500"
                >
                  {header}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-zinc-100 align-top last:border-0">
              <td className="max-w-[280px] px-2.5 py-2.5">
                <p className="text-[12px] font-medium leading-5 text-zinc-900">
                  {item.title}
                </p>
                <p className="mt-0.5 text-[11px] leading-4 text-zinc-500">
                  {item.summary}
                </p>
                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex text-[10px] font-medium text-blue-700 hover:text-blue-800"
                >
                  Official source
                </a>
              </td>
              <td className="px-2.5 py-2.5 text-[11px] text-zinc-600">
                {titleCase(item.changeType)}
              </td>
              <td className="px-2.5 py-2.5 font-mono text-[10px] text-zinc-500">
                {formatDate(item.detectedAt)}
              </td>
              <td className="px-2.5 py-2.5">
                <span
                  className={cn(
                    "inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize",
                    STATUS_STYLES[item.status],
                  )}
                >
                  {item.status}
                </span>
              </td>
              <td className="px-2.5 py-2.5 text-[10px] text-zinc-600">
                {item.owner}
              </td>
              <td className="max-w-[220px] px-2.5 py-2.5 text-[11px] leading-4 text-zinc-600">
                {item.action}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
