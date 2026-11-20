import { getBriefForProduct } from "@/domain/brief";
import { BriefView } from "@/components/brief-view";

export default function BriefIndexPage() {
  const brief = getBriefForProduct("phone-orbit-2028");
  if (!brief) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white px-4 py-8 text-center">
        <p className="text-[12px] font-medium text-zinc-700">
          No decision brief is available for the default product.
        </p>
      </div>
    );
  }
  return <BriefView brief={brief} />;
}
