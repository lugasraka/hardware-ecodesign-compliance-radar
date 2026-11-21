import { decisions } from "@/data/decisions";
import { products } from "@/data/products";
import { risks } from "@/data/risks";
import { RiskRegister } from "@/components/risk-register";
import { PageHeader } from "@/components/primitives";

export default function RisksPage() {
  const critical = risks.filter(
    (risk) => risk.status !== "closed" && risk.likelihood * risk.impact >= 20,
  ).length;
  const high = risks.filter((risk) => {
    const score = risk.likelihood * risk.impact;
    return risk.status !== "closed" && score >= 12 && score < 20;
  }).length;

  return (
    <div>
      <PageHeader
        eyebrow="Program risk"
        title="Risk register"
        description={`${risks.length} program risks across the portfolio, with ${critical} critical and ${high} high. Scores are likelihood × impact before mitigation. The decision log links each material risk to a brief.`}
      />
      <RiskRegister risks={risks} products={products} decisions={decisions} />
    </div>
  );
}
