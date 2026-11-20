import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { decisions } from "@/data/decisions";
import { getBriefForProduct } from "@/domain/brief";
import { BriefView } from "@/components/brief-view";

export function generateStaticParams() {
  return Array.from(new Set(decisions.map((decision) => decision.productId))).map(
    (id) => ({ id }),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const brief = getBriefForProduct(id);
  return {
    title: brief ? `${brief.product.name} · executive brief` : "Executive brief",
  };
}

export default async function BriefPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const brief = getBriefForProduct(id);
  if (!brief) notFound();
  return <BriefView brief={brief} />;
}
