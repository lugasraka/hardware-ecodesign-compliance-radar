import type { Team } from "@/domain/types";

export type WatchStatus = "new" | "triaged" | "incorporated" | "dismissed";

export type WatchChangeType =
  | "new_instrument"
  | "amendment"
  | "consultation"
  | "standard"
  | "guidance"
  | "source_changed";

export interface RegulatoryWatchItem {
  id: string;
  instrumentId?: string;
  title: string;
  sourceUrl: string;
  publishedAt?: string;
  detectedAt: string;
  changeType: WatchChangeType;
  status: WatchStatus;
  summary: string;
  owner: Team;
  action: string;
}

export const regulatoryWatch: RegulatoryWatchItem[] = [
  {
    id: "watch-jtc24-standards",
    instrumentId: "eu-2024-1781",
    title: "Remaining CEN-CLC/JTC 24 DPP standards",
    sourceUrl:
      "https://single-market-economy.ec.europa.eu/single-market/digital-product-passport_en",
    publishedAt: "2026-11-30",
    detectedAt: "2026-11-20",
    changeType: "standard",
    status: "triaged",
    summary:
      "The final two DPP standards cover access rights and data authentication. Check the Official Journal citation before changing the DPP fields.",
    owner: "Environmental Affairs",
    action: "Track the implementing decision and update the source list.",
  },
  {
    id: "watch-espr-ict",
    instrumentId: "eu-2024-1781",
    title: "ESPR ICT delegated act",
    sourceUrl: "https://eur-lex.europa.eu/eli/reg/2024/1781/oj/eng",
    publishedAt: "2029-12-31",
    detectedAt: "2026-11-20",
    changeType: "consultation",
    status: "triaged",
    summary:
      "The ICT delegated act is expected in 2029, with an approximately 18-month transition. No product-specific DPP obligation is in force yet.",
    owner: "Environmental Affairs",
    action: "Prepare the DPP data mapping and keep the clause provisional.",
  },
  {
    id: "watch-france-durability",
    instrumentId: "fr-repairability",
    title: "France durability index extension",
    sourceUrl: "https://entreprendre.service-public.gouv.fr/vosdroits/F38092",
    detectedAt: "2026-11-20",
    changeType: "consultation",
    status: "new",
    summary:
      "The durability index currently covers TVs and washing machines. Further categories may follow. There is no current laptop obligation.",
    owner: "Environmental Affairs",
    action: "Monitor the category orders before adding a clause.",
  },
  {
    id: "watch-us-state-rtr",
    instrumentId: "us-ca-right-to-repair",
    title: "US state right-to-repair expansion",
    sourceUrl:
      "https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202320240SB244",
    detectedAt: "2026-11-20",
    changeType: "amendment",
    status: "new",
    summary:
      "More states may follow California and Oregon. Requirements can differ on parts, tools, documentation, software, and parts pairing.",
    owner: "Legal & Government Affairs",
    action: "Add a state only after the bill text is verified.",
  },
  {
    id: "watch-india-epr",
    instrumentId: "india-e-waste",
    title: "India e-waste and resource-efficiency rules",
    sourceUrl: "https://cpcb.nic.in/e-waste/",
    detectedAt: "2026-11-20",
    changeType: "consultation",
    status: "triaged",
    summary:
      "The dataset treats India as monitoring only. Product-level resource-efficiency rules are not modeled yet.",
    owner: "Legal & Government Affairs",
    action: "Maintain a monitoring brief and do not claim clause-level coverage.",
  },
];
