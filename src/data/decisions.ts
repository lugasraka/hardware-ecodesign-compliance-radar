import type { Decision } from "@/domain/types";

export const decisions: Decision[] = [
  {
    id: "dec-art11-2028",
    title: "Battery architecture for the 2028 flagship",
    productId: "phone-orbit-2028",
    clauseId: "eu-batt-art11-removability",
    question:
      "Which battery architecture should the 2028 flagship carry into EVT, given the 18 February 2027 Article 11 application date?",
    owner: "VP, Mobile Hardware",
    decisionDate: "2027-02-17",
    options: [
      {
        id: "a",
        label: "Removable battery with pull-tab adhesive",
        description:
          "User-removable battery with a pull-tab adhesive, captive screws, and a serviceable back cover. Keeps IP68 with a gasket redesign.",
        scores: { marketAccess: 5, cost: 3, schedule: 3, design: 2, confidence: 4 },
        costUsd: 4.2,
        scheduleWeeks: 2,
        massGrams: 12,
        complianceEffect:
          "Meets the Article 11 default and improves the EU repairability class. Requires battery, mechanical, and service validation.",
      },
      {
        id: "b",
        label: "Professional-only wearable derogation",
        description:
          "Pursue a professional-only replacement path under the wearable/miniaturisation derogation.",
        scores: { marketAccess: 1, cost: 5, schedule: 5, design: 5, confidence: 2 },
        costUsd: 0,
        scheduleWeeks: 0,
        massGrams: 0,
        complianceEffect:
          "Not available to a handheld smartphone. Legal review considers this position weak; it would not survive a market-surveillance challenge.",
      },
      {
        id: "c",
        label: "Delay the EU launch to 2029",
        description:
          "Ship the US first and delay the EU launch until the next enclosure cycle.",
        scores: { marketAccess: 3, cost: 1, schedule: 1, design: 5, confidence: 3 },
        costUsd: 0,
        scheduleWeeks: 26,
        massGrams: 0,
        complianceEffect:
          "Avoids the redesign now but shifts EU revenue and creates a competitive gap. It does not solve the next product's Article 11 issue.",
      },
      {
        id: "d",
        label: "Sealed design with a legal challenge",
        description:
          "Keep the sealed design and challenge the interpretation of 'portable battery' or the derogation scope.",
        scores: { marketAccess: 1, cost: 4, schedule: 4, design: 5, confidence: 1 },
        costUsd: 0.5,
        scheduleWeeks: 4,
        massGrams: 0,
        complianceEffect:
          "High legal uncertainty. Market surveillance does not suspend the obligation while a challenge is pending.",
      },
    ],
    recommendation:
      "Option A. Lock the removable-battery architecture at EVT and fund the pull-tab and gasket validation now. The derogation path is not credible for a handheld device, and a launch delay does not remove the underlying design requirement.",
    status: "pending",
    whatWouldChange:
      "If pull-tab reliability fails at 1,000 cycles or the IP68 gasket adds more than 0.8 mm, switch to Option C. If Legal obtains a written interpretation that the device is outside the portable-battery definition, revisit Option D.",
    dissent:
      "Industrial Design prefers a sealed design and argues for a narrower reading of Article 11. Legal considers that position weak for a handheld smartphone. The decision needs an explicit risk acceptance if Option B or D is chosen.",
  },
  {
    id: "dec-phone-2027-launch",
    title: "2027 flagship EU launch sequencing",
    productId: "phone-orbit-2027",
    clauseId: "eu-batt-art11-removability",
    question:
      "The 2027 flagship is already outside the Article 11 decision window. Do we attempt a late redesign, delay the EU launch, or launch with a derogation claim?",
    owner: "VP, Mobile Hardware",
    decisionDate: "2027-01-15",
    options: [
      {
        id: "a",
        label: "Late redesign before launch",
        description:
          "Force a removable-battery change into the existing enclosure and absorb the tooling and yield impact.",
        scores: { marketAccess: 5, cost: 1, schedule: 1, design: 2, confidence: 2 },
        costUsd: 18,
        scheduleWeeks: 10,
        massGrams: 18,
        complianceEffect:
          "Meets Article 11 but carries a high risk of launch slip and yield loss.",
      },
      {
        id: "b",
        label: "Delay the EU launch",
        description:
          "Launch the US configuration on time and delay the EU configuration until the removable design is qualified.",
        scores: { marketAccess: 3, cost: 2, schedule: 4, design: 4, confidence: 4 },
        costUsd: 0,
        scheduleWeeks: 8,
        massGrams: 0,
        complianceEffect:
          "Preserves the US launch and avoids a non-compliant EU shipment. Creates an EU revenue gap.",
      },
      {
        id: "c",
        label: "Launch with a derogation claim",
        description:
          "Ship the sealed EU configuration and rely on a wet-environment or wearable derogation.",
        scores: { marketAccess: 1, cost: 4, schedule: 4, design: 4, confidence: 1 },
        costUsd: 0,
        scheduleWeeks: 0,
        massGrams: 0,
        complianceEffect:
          "Not defensible for a handheld smartphone. A market-surveillance challenge could force withdrawal.",
      },
    ],
    recommendation:
      "Option B. The decision window has passed; a late redesign is more likely to create a second failure than to recover the EU launch. Delay the EU configuration and use the 2028 platform to fix the architecture.",
    status: "pending",
    whatWouldChange:
      "A validated late-change path with a credible 10-week tooling plan and no yield impact would reopen Option A.",
    dissent:
      "Commercial teams prefer Option C to protect the EU launch. Legal and Environmental Affairs consider the derogation claim unsupportable.",
  },
  {
    id: "dec-eps-96w",
    title: "96 W adapter efficiency and certification path",
    productId: "adapter-volt-96w",
    clauseId: "eu-2052-no-load",
    question:
      "The 96 W adapter fails no-load and low-load efficiency and lacks CEC certification. Redesign, derate, or split the launch?",
    owner: "VP, Accessories",
    decisionDate: "2027-06-01",
    options: [
      {
        id: "a",
        label: "Controller and snubber redesign",
        description:
          "Redesign the controller and snubber, re-test at 10% load, and complete the Common Charger artwork.",
        scores: { marketAccess: 5, cost: 3, schedule: 3, design: 4, confidence: 4 },
        costUsd: 1.8,
        scheduleWeeks: 8,
        massGrams: 4,
        complianceEffect:
          "Meets the EU efficiency and interoperability requirements and preserves the 96 W position.",
      },
      {
        id: "b",
        label: "Derate to 90 W",
        description:
          "Derate the adapter to 90 W, reuse the existing controller, and re-test.",
        scores: { marketAccess: 4, cost: 4, schedule: 4, design: 3, confidence: 4 },
        costUsd: 0.4,
        scheduleWeeks: 3,
        massGrams: 0,
        complianceEffect:
          "Meets the requirements with less schedule risk, but gives up 6 W of headroom and some marketing differentiation.",
      },
      {
        id: "c",
        label: "EU-only launch, US later",
        description:
          "Launch the EU configuration on time and delay the US configuration until CEC certification is complete.",
        scores: { marketAccess: 2, cost: 2, schedule: 4, design: 5, confidence: 3 },
        costUsd: 0,
        scheduleWeeks: 12,
        massGrams: 0,
        complianceEffect:
          "Protects the EU date but creates a US revenue gap and a second certification critical path.",
      },
    ],
    recommendation:
      "Option B. Derating to 90 W is the fastest defensible path; it preserves the product tier and avoids a controller redesign that competes with the 140 W program for lab capacity.",
    status: "pending",
    whatWouldChange:
      "If the controller redesign can reuse the 140 W validation and hit the 8-week path, Option A becomes preferable.",
    dissent:
      "Product Marketing prefers Option A to keep the 96 W tier. Engineering notes that the 140 W program has priority on the same lab.",
  },
  {
    id: "dec-laptop-art11",
    title: "Laptop portable-battery strategy for the EU",
    productId: "laptop-vertex-2028",
    clauseId: "eu-batt-art11-removability",
    question:
      "The laptop battery is portable under the Batteries Regulation and is not user-removable. Do we redesign, segment the SKUs, or pursue a professional-service interpretation?",
    owner: "VP, Personal Computing",
    decisionDate: "2027-09-01",
    options: [
      {
        id: "a",
        label: "User-removable battery door",
        description:
          "Add a captive battery door and a user-serviceable battery across all SKUs.",
        scores: { marketAccess: 5, cost: 3, schedule: 3, design: 3, confidence: 4 },
        costUsd: 6.5,
        scheduleWeeks: 6,
        massGrams: 22,
        complianceEffect:
          "Meets Article 11 across the portfolio and simplifies the service model.",
      },
      {
        id: "b",
        label: "Professional-only service and advocacy",
        description:
          "Keep the sealed design, rely on professional service, and engage in the Article 11 implementation dialogue.",
        scores: { marketAccess: 2, cost: 4, schedule: 4, design: 4, confidence: 2 },
        costUsd: 0.8,
        scheduleWeeks: 2,
        massGrams: 0,
        complianceEffect:
          "Does not meet the current Article 11 default. Advocacy may influence future guidance but not the 2027 obligation.",
      },
      {
        id: "c",
        label: "EU removable SKU, US sealed SKU",
        description:
          "Segment the EU and US configurations; the EU SKU gets the removable battery door.",
        scores: { marketAccess: 4, cost: 2, schedule: 2, design: 3, confidence: 3 },
        costUsd: 4.0,
        scheduleWeeks: 8,
        massGrams: 18,
        complianceEffect:
          "Meets the EU requirement while preserving the US design. Adds SKU complexity and a second service model.",
      },
    ],
    recommendation:
      "Option C. Segment the EU SKU first, then carry the removable architecture into the next global platform. This protects the US date while avoiding a non-compliant EU shipment.",
    status: "pending",
    whatWouldChange:
      "If the removable door can be carried globally without a mass penalty above 25 g, Option A becomes the cleaner long-term choice.",
    dissent:
      "Operations prefers Option A to avoid two service models. Finance prefers Option B because it defers cost.",
  },
];

export const decisionById = new Map(
  decisions.map((decision) => [decision.id, decision]),
);
