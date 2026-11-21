import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { clauses } from "@/data/clauses";
import { decisions } from "@/data/decisions";
import { instruments } from "@/data/instruments";
import { milestones } from "@/data/milestones";
import { productById, products } from "@/data/products";
import { risks } from "@/data/risks";
import { ProductWorkspace } from "@/components/product-workspace";

export function generateStaticParams() {
  return products.map((product) => ({ id: product.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = productById.get(id);
  if (!product) return { title: "Product not found" };
  return {
    title: `${product.name} · compliance ledger`,
    description: product.description,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = productById.get(id);
  if (!product) notFound();

  return (
    <ProductWorkspace
      product={product}
      clauses={clauses}
      instruments={instruments}
      risks={risks}
      decisions={decisions}
      milestones={milestones}
    />
  );
}