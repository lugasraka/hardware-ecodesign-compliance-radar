import type { BriefData } from "@/domain/brief";
import { BriefFull } from "@/components/brief-full";
import { BriefShell } from "@/components/brief-shell";
import { BriefSummary } from "@/components/brief-summary";

export function BriefView({ brief }: { brief: BriefData }) {
  return (
    <div>
      <BriefShell
        productId={brief.product.id}
        productShortName={brief.product.shortName}
        markdown={brief.markdown}
        summary={<BriefSummary brief={brief} />}
        full={<BriefFull brief={brief} />}
      />
      <BriefSummary brief={brief} variant="print" />
    </div>
  );
}
