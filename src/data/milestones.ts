import type { RegulatoryMilestone } from "@/domain/types";

export const milestones: RegulatoryMilestone[] = [
  {
    id: "ms-batt-derogation-act",
    instrumentId: "eu-2023-1542",
    title: "Article 11(2) derogation delegated act published",
    stage: "published",
    date: "2026-10-22",
    confidence: "high",
    impact:
      "Clarifies the wet-environment and wearable derogations. A handheld smartphone remains outside the listed paths.",
    owner: "Legal & Government Affairs",
    action:
      "Update the interpretation memo and the 2028 flagship decision brief.",
  },
  {
    id: "ms-batt-art11-app",
    instrumentId: "eu-2023-1542",
    title: "Article 11 removability and replaceability applies",
    stage: "application",
    date: "2027-02-18",
    confidence: "high",
    impact:
      "Portable batteries must be removable and replaceable by the end user unless a narrow derogation applies.",
    owner: "Mechanical Engineering",
    action:
      "Lock the battery architecture at EVT; complete the removal/replacement validation.",
  },
  {
    id: "ms-espr-standards",
    instrumentId: "eu-2024-1781",
    title: "Remaining CEN-CLC/JTC 24 DPP standards expected",
    stage: "standard",
    date: "2026-11-30",
    confidence: "medium",
    impact:
      "Access-rights management and data-authentication standards complete the DPP framework.",
    owner: "Environmental Affairs",
    action:
      "Track the implementing decision and map the access-tier model to the DPP readiness plan.",
  },
  {
    id: "ms-espr-ict",
    instrumentId: "eu-2024-1781",
    title: "ICT product DPP delegated act expected (indicative)",
    stage: "proposal",
    date: "2029-12-31",
    confidence: "medium",
    impact:
      "Triggers product-specific DPP data requirements for smartphones, laptops and displays, with an approximately 18-month transition.",
    owner: "Environmental Affairs",
    action:
      "Prepare the data lineage and registry sandbox now; do not claim current compliance.",
  },
  {
    id: "ms-eps-app",
    instrumentId: "eu-2025-2052",
    title: "EU 2025/2052 general application",
    stage: "application",
    date: "2028-12-14",
    confidence: "high",
    impact:
      "New efficiency, interoperability, Common Charger and information requirements apply to EPS, wireless chargers and USB-C cables.",
    owner: "Electrical Engineering",
    action:
      "Complete the efficiency test plan and Common Charger artwork for the 96 W adapter.",
  },
  {
    id: "ms-eps-transition",
    instrumentId: "eu-2025-2052",
    title: "USB-PD above 100 W efficiency transition ends",
    stage: "application",
    date: "2030-12-14",
    confidence: "high",
    impact:
      "The 2019/1782 efficiency requirements stop applying to USB-PD EPS above 100 W; the 2025/2052 thresholds apply.",
    owner: "Electrical Engineering",
    action:
      "Design the 140 W adapter with headroom for the 2030 threshold.",
  },
  {
    id: "ms-ca-rtr",
    instrumentId: "us-ca-right-to-repair",
    title: "California right-to-repair enforcement",
    stage: "application",
    date: "2024-07-01",
    confidence: "high",
    impact:
      "7-year parts, tools, documentation and software obligations for devices priced at $100 or more.",
    owner: "Service Operations",
    action:
      "Align the platform software-support policy and parts commitments before the 2027 launch.",
  },
  {
    id: "ms-fr-durability",
    instrumentId: "fr-repairability",
    title: "France durability index extension watch",
    stage: "consultation",
    date: "2027-01-01",
    confidence: "low",
    impact:
      "The durability index currently covers TVs and washing machines; further categories may follow. No current laptop obligation.",
    owner: "Environmental Affairs",
    action:
      "Monitor the category orders; do not present the durability index as applicable to laptops yet.",
  },
  {
    id: "ms-india-epr",
    instrumentId: "india-e-waste",
    title: "India e-waste EPR and resource-efficiency monitoring",
    stage: "consultation",
    date: "2027-01-01",
    confidence: "low",
    impact:
      "Producer responsibility and recycling obligations continue to evolve; product-level resource-efficiency rules are emerging.",
    owner: "Legal & Government Affairs",
    action:
      "Maintain a monitoring brief; do not treat India as a full compliance dataset in this prototype.",
  },
];
