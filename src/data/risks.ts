import type { DecisionCriterion, Risk } from "@/domain/types";

export const risks: Risk[] = [
  {
    id: "risk-art11-phone-2028",
    title: "Article 11 battery redesign slips past EVT",
    description:
      "The 2028 flagship still uses a professional-only battery service model. If the removable-battery architecture is not locked by EVT, the EU launch is exposed.",
    productId: "phone-orbit-2028",
    clauseId: "eu-batt-art11-removability",
    market: "EU",
    likelihood: 4,
    impact: 5,
    owner: "Mechanical Engineering / Battery Engineering",
    mitigation:
      "Lock the removable-battery architecture at EVT; run the pull-tab and tooling trade study now; reserve validation lab capacity.",
    contingency:
      "Delay the EU launch or segment the EU SKU with a serviceable back cover.",
    dueDate: "2027-02-17",
    status: "mitigating",
    decisionNeededBy: "2027-02-17",
  },
  {
    id: "risk-phone-2027-late",
    title: "2027 flagship is already outside the Article 11 decision window",
    description:
      "The 2027 flagship launches after 18 February 2027 with a sealed battery. The required-by date has passed, so any change is a late change with tooling and yield consequences.",
    productId: "phone-orbit-2027",
    clauseId: "eu-batt-art11-removability",
    market: "EU",
    likelihood: 5,
    impact: 5,
    owner: "Program Management",
    mitigation:
      "Escalate to the VP review; evaluate late change, EU launch sequencing, and a serviceability-only variant.",
    contingency:
      "Launch the EU SKU later than the US, or accept a market-access gap for the affected configuration.",
    dueDate: "2027-02-17",
    status: "open",
    decisionNeededBy: "2027-01-15",
  },
  {
    id: "risk-battery-evidence",
    title: "Battery cycle-life evidence is missing for the hero product",
    description:
      "The 1,000-cycle battery claim is not yet supported by a complete test report. The technical path may pass, but the evidence gap still blocks a defensible market-access position.",
    productId: "phone-orbit-2028",
    clauseId: "eu-1670-battery-endurance",
    market: "EU",
    likelihood: 3,
    impact: 4,
    owner: "Battery Engineering",
    mitigation:
      "Book external lab capacity; freeze the cell lot; run the 500-cycle intermediate readout.",
    contingency:
      "Use the lower 800-cycle claim and adjust the product positioning.",
    dueDate: "2027-04-01",
    status: "open",
  },
  {
    id: "risk-us-ca-software",
    title: "Seven-year software support conflicts with the platform policy",
    description:
      "California requires 7 years of repair software for devices priced at $100 or more. The current platform policy is 5 years, which is sufficient for the EU but not for California.",
    productId: "phone-orbit-2027",
    clauseId: "us-ca-right-to-repair",
    market: "US-CA",
    likelihood: 4,
    impact: 4,
    owner: "Firmware & Software",
    mitigation:
      "Define a platform support policy and cost model; separate security-only support from feature updates.",
    contingency:
      "Segment the California SKU or accept a compliance gap on the older platform.",
    dueDate: "2027-08-01",
    status: "open",
    decisionNeededBy: "2027-05-01",
  },
  {
    id: "risk-parts-pairing",
    title: "Parts pairing blocks Oregon repair compliance",
    description:
      "Oregon restricts parts pairing that impedes replacement parts. The current repair flow pairs several components to the logic board.",
    productId: "phone-orbit-2027",
    clauseId: "us-or-right-to-repair",
    market: "US-OR",
    likelihood: 4,
    impact: 3,
    owner: "Firmware & Software",
    mitigation:
      "Audit pairing flows; design an open repair path for priority parts; validate with independent repairers.",
    contingency:
      "Restrict the affected configurations or provide an authorised repair exception.",
    dueDate: "2027-06-01",
    status: "mitigating",
  },
  {
    id: "risk-eps-96w",
    title: "96 W adapter fails no-load and low-load efficiency",
    description:
      "The 96 W adapter is above the 0.15 W no-load limit and below the 0.83 low-load efficiency threshold. The design also lacks the Common Charger logo.",
    productId: "adapter-volt-96w",
    clauseId: "eu-2052-no-load",
    market: "EU",
    likelihood: 5,
    impact: 4,
    owner: "Electrical Engineering",
    mitigation:
      "Controller and snubber redesign; re-test at 10% load; update the label artwork after the final power configuration.",
    contingency:
      "Derate the adapter or launch the 140 W variant as the primary EU SKU.",
    dueDate: "2027-10-01",
    status: "open",
    decisionNeededBy: "2027-06-01",
  },
  {
    id: "risk-eps-cec",
    title: "CEC certification is not started for the 96 W adapter",
    description:
      "The US federal DOE certification is complete, but the California Energy Commission certification is not. This blocks California sale.",
    productId: "adapter-volt-96w",
    clauseId: "us-doe-eps-certification",
    market: "US-FED",
    likelihood: 4,
    impact: 4,
    owner: "Legal & Government Affairs",
    mitigation:
      "Schedule the CEC lab and certification; reuse the DOE test data where allowed.",
    contingency:
      "Launch the 96 W adapter in EU only and keep the 140 W adapter for the US.",
    dueDate: "2027-10-01",
    status: "open",
  },
  {
    id: "risk-espr-data",
    title: "DPP data model is not ready for the 2029 ICT delegated act",
    description:
      "A product-specific ESPR delegated act is not yet in force, but the data lineage and access-tier model will take longer than the 18-month transition to build.",
    productId: "phone-orbit-2028",
    clauseId: "eu-espr-dpp-registration",
    market: "EU",
    likelihood: 3,
    impact: 3,
    owner: "Environmental Affairs",
    mitigation:
      "Map likely DPP fields to PLM, LCA, supplier and firmware systems; run a tabletop with the registry sandbox.",
    contingency:
      "Use a third-party DPP service provider for the first product group.",
    dueDate: "2028-06-01",
    status: "open",
  },
  {
    id: "risk-france-score",
    title: "France laptop score is illustrative, not audited",
    description:
      "The laptop repairability score is a transparent prototype calculation, not the official category-specific arrêté. It should not be used for a real label.",
    productId: "laptop-vertex-2028",
    clauseId: "fr-repairability-score",
    market: "EU",
    likelihood: 3,
    impact: 2,
    owner: "Environmental Affairs",
    mitigation:
      "Encode the category arrêté; validate with legal and the French authority guidance.",
    contingency:
      "Display the official score only after the calculation is audited.",
    dueDate: "2027-09-01",
    status: "open",
  },
  {
    id: "risk-watch-derogation",
    title: "Wearable Article 11 derogation evidence is incomplete",
    description:
      "The watch is a plausible wet-environment / wearable case, but the safety and no-redesign justification is not yet documented.",
    productId: "watch-pulse-2027",
    clauseId: "eu-batt-art11-removability",
    market: "EU",
    likelihood: 3,
    impact: 4,
    owner: "Legal & Government Affairs",
    mitigation:
      "Prepare the safety and no-redesign justification; validate the independent-professional replacement procedure.",
    contingency:
      "Redesign for end-user replacement or limit the EU configuration.",
    dueDate: "2027-03-01",
    status: "open",
  },
];

export const decisionCriteria: DecisionCriterion[] = [
  { key: "marketAccess", label: "Market access", weight: 0.35 },
  { key: "cost", label: "Cost / BOM", weight: 0.15 },
  { key: "schedule", label: "Schedule", weight: 0.15 },
  { key: "design", label: "Design & UX", weight: 0.15 },
  { key: "confidence", label: "Evidence confidence", weight: 0.2 },
];
