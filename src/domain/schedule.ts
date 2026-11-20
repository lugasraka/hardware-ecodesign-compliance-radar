import { addMonths, addWeeks, diffDays } from "@/lib/date";
import type { Collision, Gate, Product, ProgramStatus } from "./types";

export const GATE_ORDER: Gate[] = [
  "Concept",
  "Proto",
  "EVT",
  "DVT",
  "PVT",
  "MP",
];

const GATE_OFFSET_MONTHS: Record<Gate, number> = {
  Concept: -24,
  Proto: -18,
  EVT: -12,
  DVT: -8,
  PVT: -4,
  MP: -1,
};

export function getGateDate(product: Product, gate: Gate): string {
  return product.gatePlan?.[gate] ?? addMonths(product.launchDate, GATE_OFFSET_MONTHS[gate]);
}

export function getGateDates(product: Product): Record<Gate, string> {
  return GATE_ORDER.reduce(
    (dates, gate) => {
      dates[gate] = getGateDate(product, gate);
      return dates;
    },
    {} as Record<Gate, string>,
  );
}

export function getRequiredBy(
  product: Product,
  gate: Gate,
  qualificationLeadWeeks: number,
  decisionBufferWeeks: number,
): string {
  const gateDate = getGateDate(product, gate);
  return addWeeks(gateDate, -(qualificationLeadWeeks + decisionBufferWeeks));
}

export function getProgramStatus(requiredBy: string, asOf: string): ProgramStatus {
  const days = diffDays(asOf, requiredBy);
  if (days < 0) return "late";
  if (days <= 90) return "act_now";
  if (days <= 365) return "monitor";
  return "on_track";
}

export function getCollision(programStatus: ProgramStatus): Collision {
  if (programStatus === "late") return "late";
  if (programStatus === "act_now") return "at_risk";
  return "none";
}

export function getMarketRelevance(
  product: Product,
  enforcementDate: string,
): "at_launch" | "mid_life" | "never" | "unknown" {
  if (!enforcementDate) return "unknown";
  if (product.endOfSaleDate < enforcementDate) return "never";
  if (product.launchDate >= enforcementDate) return "at_launch";
  if (product.launchDate < enforcementDate) return "mid_life";
  return "unknown";
}

export function getNextGate(
  product: Product,
  asOf: string,
): { gate: Gate; date: string; days: number } | null {
  const dates = getGateDates(product);
  for (const gate of GATE_ORDER) {
    const days = diffDays(asOf, dates[gate]);
    if (days >= 0) return { gate, date: dates[gate], days };
  }
  return null;
}

export function getPhase(product: Product, asOf: string): Gate | "Post-MP" {
  const dates = getGateDates(product);
  let phase: Gate = "Concept";
  for (const gate of GATE_ORDER) {
    if (dates[gate] <= asOf) phase = gate;
  }
  return product.endOfSaleDate < asOf ? "Post-MP" : phase;
}
