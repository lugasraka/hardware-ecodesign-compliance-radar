import type { Clause, EvidenceRequirement, Team } from "@/domain/types";

const VERIFIED = "2026-11-20";

const S = {
  eu1670: "https://eur-lex.europa.eu/eli/reg/2023/1670/oj/eng",
  eu1542: "https://eur-lex.europa.eu/eli/reg/2023/1542/oj/eng",
  eu2052: "https://eur-lex.europa.eu/eli/reg/2025/2052/oj/eng",
  eu1669: "https://eur-lex.europa.eu/eli/reg_del/2023/1669/oj/eng",
  espr: "https://eur-lex.europa.eu/eli/reg/2024/1781/oj/eng",
  displays: "https://eur-lex.europa.eu/eli/reg/2019/2021/oj/eng",
  computers: "https://eur-lex.europa.eu/eli/reg/2013/617/oj/eng",
  france: "https://entreprendre.service-public.gouv.fr/vosdroits/F38092",
  ca: "https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202320240SB244",
  or: "https://olis.oregonlegislature.gov/liz/2024R1/Downloads/MeasureDocument/SB1596",
  doe: "https://www.ecfr.gov/current/title-10/chapter-II/subchapter-D/part-430",
  energyStar: "https://www.energystar.gov/products",
};

const ME: Team = "Mechanical Engineering";
const BE: Team = "Battery Engineering";
const EE: Team = "Electrical Engineering";
const FW: Team = "Firmware & Software";
const SC: Team = "Supply Chain";
const ID: Team = "Industrial Design";
const SO: Team = "Service Operations";
const LG: Team = "Legal & Government Affairs";
const EA: Team = "Environmental Affairs";
const PM: Team = "Program Management";

function evidence(
  id: string,
  label: string,
  type: EvidenceRequirement["type"],
  owner: Team,
  defaultStatus: EvidenceRequirement["defaultStatus"] = "partial",
): EvidenceRequirement {
  return { id, label, type, owner, defaultStatus };
}

const smartphoneTablet = {
  op: "in" as const,
  field: "product.category" as const,
  values: ["smartphone", "tablet"],
  label: "Product is a smartphone or slate tablet",
};

export const clauses: Clause[] = [
  // ---------------------------------------------------------------------------
  // EU 2023/1670 — smartphones and tablets
  // ---------------------------------------------------------------------------
  {
    id: "eu-1670-battery-endurance",
    instrumentId: "eu-2023-1670",
    articleRef: "Annex II, 1.2(4)",
    title: "Battery endurance: 800 cycles at 80%",
    summary:
      "The battery must retain at least 80% of rated capacity after 800 full charge/discharge cycles.",
    legalText:
      "Manufacturers, importers or authorised representatives shall ensure that the devices achieve at least 800 cycles at 80% remaining capacity, to be tested under charging conditions where the charging rate is limited by the battery management system and not by the power delivery capabilities of the power supply.",
    interpretation:
      "This is a design and validation requirement. The 500-cycle/83% and 1,000-cycle/80% figures in the same annex belong to the professional-repairer battery availability path, not to this endurance threshold.",
    interpretationStatus: "settled",
    requirementType: "legal",
    domain: "environmental",
    applicability: {
      op: "and",
      all: [
        smartphoneTablet,
        {
          op: "eq",
          field: "product.hasBattery",
          value: true,
          label: "Product contains a battery",
        },
      ],
    },
    conformity: {
      op: "gte",
      field: "product.battery.cyclesTo80Pct",
      value: 800,
      label: "Battery reaches at least 800 cycles to 80%",
    },
    markets: ["EU"],
    severity: "market_access",
    owningTeams: [BE, ME, EA],
    accountableTeam: BE,
    lockInGate: "EVT",
    qualificationLeadWeeks: 16,
    decisionBufferWeeks: 4,
    evidence: [
      evidence(
        "test-report-cycles",
        "Battery cycle-life test report",
        "test_report",
        BE,
        "missing",
      ),
    ],
    sourceUrl: S.eu1670,
    lastVerified: VERIFIED,
  },
  {
    id: "eu-1670-battery-management",
    instrumentId: "eu-2023-1670",
    articleRef: "Annex II, 1.2(5)",
    title: "Battery management features",
    summary:
      "Devices must offer an optional 80% charge limit and stop continuous charging once full.",
    legalText:
      "Manufacturers shall include an optional charging feature selectable by the user which terminates the charging process automatically when the battery is charged to 80% of its full capacity... and a power management feature which by default ensures that once the battery is fully charged there is no further charging power supplied to the battery unless the charge level drops below 95%.",
    interpretation:
      "Firmware and charging-IC behaviour, not just cell chemistry. Validate the user-facing setting and the default trickle-charge stop.",
    interpretationStatus: "settled",
    requirementType: "legal",
    domain: "environmental",
    applicability: {
      op: "and",
      all: [
        smartphoneTablet,
        { op: "eq", field: "product.hasBattery", value: true },
      ],
    },
    conformity: {
      op: "and",
      all: [
        {
          op: "eq",
          field: "product.battery.chargeLimit80Option",
          value: true,
          label: "80% charge limit is available",
        },
        {
          op: "eq",
          field: "product.battery.trickleStop",
          value: true,
          label: "Trickle charging stops after full charge",
        },
      ],
    },
    markets: ["EU"],
    severity: "market_access",
    owningTeams: [FW, EE, BE],
    accountableTeam: FW,
    lockInGate: "DVT",
    qualificationLeadWeeks: 8,
    decisionBufferWeeks: 2,
    evidence: [
      evidence(
        "test-report-charging",
        "Charging behaviour test report",
        "test_report",
        FW,
      ),
      evidence(
        "tech-file-ui",
        "User-interface and default-setting evidence",
        "technical_file",
        FW,
      ),
    ],
    sourceUrl: S.eu1670,
    lastVerified: VERIFIED,
  },
  {
    id: "eu-1670-drop-resistance",
    instrumentId: "eu-2023-1670",
    articleRef: "Annex II, 1.2(1)",
    title: "Drop resistance: 45 falls",
    summary:
      "The device must survive 45 falls without loss of functionality under the Annex III procedure.",
    legalText:
      "Manufacturers, importers or authorised representatives shall ensure that the devices pass 45 falls without any protective foil or separate protective cover... without loss of functionality.",
    interpretation:
      "Mechanical architecture and test validation. Foldables have a different fall count and protective-foil condition.",
    interpretationStatus: "settled",
    requirementType: "legal",
    domain: "environmental",
    applicability: smartphoneTablet,
    conformity: {
      op: "gte",
      field: "product.compliance.dropTestFalls",
      value: 45,
      label: "Passes at least 45 drops",
    },
    markets: ["EU"],
    severity: "market_access",
    owningTeams: [ME, ID],
    accountableTeam: ME,
    lockInGate: "DVT",
    qualificationLeadWeeks: 10,
    decisionBufferWeeks: 2,
    evidence: [
      evidence("test-report-drop", "Drop test report", "test_report", ME),
    ],
    sourceUrl: S.eu1670,
    lastVerified: VERIFIED,
  },
  {
    id: "eu-1670-scratch-resistance",
    instrumentId: "eu-2023-1670",
    articleRef: "Annex II, 1.2(2)",
    title: "Scratch resistance: Mohs level 4",
    summary: "The screen must pass hardness level 4 on the Mohs scale.",
    legalText:
      "Manufacturers, importers or authorised representatives shall ensure that the screen of the device passes the hardness level 4 on the Mohs hardness scale.",
    interpretation:
      "Cover-glass specification and validation. The requirement is a minimum, not a differentiator.",
    interpretationStatus: "settled",
    requirementType: "legal",
    domain: "environmental",
    applicability: smartphoneTablet,
    conformity: {
      op: "gte",
      field: "product.compliance.scratchMohs",
      value: 4,
      label: "Screen reaches Mohs level 4",
    },
    markets: ["EU"],
    severity: "market_access",
    owningTeams: [ME, ID, SC],
    accountableTeam: ME,
    lockInGate: "DVT",
    qualificationLeadWeeks: 6,
    decisionBufferWeeks: 2,
    evidence: [
      evidence("test-report-scratch", "Scratch test report", "test_report", ME),
    ],
    sourceUrl: S.eu1670,
    lastVerified: VERIFIED,
  },
  {
    id: "eu-1670-dust-water",
    instrumentId: "eu-2023-1670",
    articleRef: "Annex II, 1.2(3)",
    title: "Dust and water protection",
    summary:
      "The device must be protected against solid objects larger than 1 mm and splashing water (IP44-level).",
    legalText:
      "Manufacturers, importers or authorised representatives shall ensure that the devices are protected against the ingress of solid foreign objects of size bigger than 1 millimeter and splashing of water.",
    interpretation:
      "This is an IP44-level minimum, not IP68. The higher IP67 threshold appears in the combined-assembly reliability exception for spare parts; do not conflate the two.",
    interpretationStatus: "settled",
    requirementType: "legal",
    domain: "environmental",
    applicability: smartphoneTablet,
    conformity: {
      op: "and",
      all: [
        {
          op: "gte",
          field: "product.ingress.solid",
          value: 4,
          label: "IP4X or better solid protection",
        },
        {
          op: "gte",
          field: "product.ingress.water",
          value: 4,
          label: "IPX4 or better water protection",
        },
      ],
    },
    markets: ["EU"],
    severity: "market_access",
    owningTeams: [ME, ID],
    accountableTeam: ME,
    lockInGate: "DVT",
    qualificationLeadWeeks: 8,
    decisionBufferWeeks: 2,
    evidence: [
      evidence("test-report-ip", "Ingress-protection test report", "test_report", ME),
    ],
    sourceUrl: S.eu1670,
    lastVerified: VERIFIED,
  },
  {
    id: "eu-1670-spare-parts",
    instrumentId: "eu-2023-1670",
    articleRef: "Annex II, 1.1(1)",
    title: "Spare parts available for 7 years",
    summary:
      "Critical spare parts must be available to professional repairers and, for a defined list, to end users for at least 7 years after the last unit is placed on the market.",
    legalText:
      "Manufacturers, importers or authorised representatives shall make available to professional repairers at least the following spare parts... until at least 7 years after the date of end of placement on the market.",
    interpretation:
      "Service supply-chain commitment. The end-user list includes the battery, back cover, display assembly, charger and SIM/memory trays where present.",
    interpretationStatus: "settled",
    requirementType: "legal",
    domain: "environmental",
    applicability: smartphoneTablet,
    conformity: {
      op: "gte",
      field: "product.spareParts.years",
      value: 7,
      label: "Spare parts available for at least 7 years",
    },
    markets: ["EU"],
    severity: "market_access",
    owningTeams: [SO, SC, LG],
    accountableTeam: SO,
    lockInGate: "PVT",
    qualificationLeadWeeks: 12,
    decisionBufferWeeks: 4,
    evidence: [
      evidence(
        "service-plan",
        "Spare-parts availability and supplier commitment",
        "supplier_declaration",
        SO,
      ),
    ],
    sourceUrl: S.eu1670,
    lastVerified: VERIFIED,
  },
  {
    id: "eu-1670-spare-parts-delivery",
    instrumentId: "eu-2023-1670",
    articleRef: "Annex II, 1.1(3)",
    title: "Spare-parts delivery time",
    summary:
      "Spare parts must be delivered within 5 working days for the first five years and 10 working days for the remaining two.",
    legalText:
      "During the first 5 years of the period... spare parts are delivered within 5 working days after having received the order; during the remaining 2 years... within 10 working days.",
    interpretation:
      "Service-level commitment and logistics footprint. Test the order-to-delivery path, not just the parts list.",
    interpretationStatus: "settled",
    requirementType: "legal",
    domain: "environmental",
    applicability: smartphoneTablet,
    conformity: {
      op: "lte",
      field: "product.spareParts.deliveryDays",
      value: 5,
      label: "Delivery within 5 working days",
    },
    markets: ["EU"],
    severity: "labeling_penalty",
    owningTeams: [SO, SC],
    accountableTeam: SO,
    lockInGate: "PVT",
    qualificationLeadWeeks: 8,
    decisionBufferWeeks: 2,
    evidence: [
      evidence("sla-parts", "Service-level agreement for parts delivery", "supplier_declaration", SO),
    ],
    sourceUrl: S.eu1670,
    lastVerified: VERIFIED,
  },
  {
    id: "eu-1670-os-updates",
    instrumentId: "eu-2023-1670",
    articleRef: "Annex II, 1.2(6)",
    title: "Operating-system updates for 5 years",
    summary:
      "Security, corrective and functionality updates must be available for at least 5 years after the last unit is placed on the market.",
    legalText:
      "From the date of end of placement on the market to at least 5 years after that date, manufacturers... shall... make such updates available at no cost for all units of a product model with the same operating system.",
    interpretation:
      "Software support commitment. The clock starts at end of placement on the market, not at launch.",
    interpretationStatus: "settled",
    requirementType: "legal",
    domain: "environmental",
    applicability: smartphoneTablet,
    conformity: {
      op: "gte",
      field: "product.software.osSupportYears",
      value: 5,
      label: "OS updates supported for at least 5 years",
    },
    markets: ["EU"],
    severity: "market_access",
    owningTeams: [FW, LG],
    accountableTeam: FW,
    lockInGate: "DVT",
    qualificationLeadWeeks: 4,
    decisionBufferWeeks: 2,
    evidence: [
      evidence("software-policy", "Published software-support policy", "declaration", FW),
    ],
    sourceUrl: S.eu1670,
    lastVerified: VERIFIED,
  },
  {
    id: "eu-1670-repair-info",
    instrumentId: "eu-2023-1670",
    articleRef: "Annex II, 1.1(2)",
    title: "Repair and maintenance information",
    summary:
      "Professional repairers must have access to repair and maintenance information for 7 years.",
    legalText:
      "Manufacturers... shall... provide access to repair and maintenance information to professional repairers for parts covered by points 1(a) and (c)... until 7 years after the date of end of placement on the market.",
    interpretation:
      "Documentation and access model. Non-discriminatory access is also relevant to the EU repairability score.",
    interpretationStatus: "settled",
    requirementType: "legal",
    domain: "environmental",
    applicability: smartphoneTablet,
    conformity: {
      op: "and",
      all: [
        {
          op: "gte",
          field: "product.repairInfo.level",
          value: 3,
          label: "Repair information at professional level",
        },
        {
          op: "eq",
          field: "product.repairInfo.publicDocs",
          value: true,
          label: "Repair documentation is publicly accessible",
        },
      ],
    },
    markets: ["EU"],
    severity: "labeling_penalty",
    owningTeams: [SO, LG, FW],
    accountableTeam: SO,
    lockInGate: "PVT",
    qualificationLeadWeeks: 8,
    decisionBufferWeeks: 2,
    evidence: [
      evidence("repair-docs", "Repair information package", "technical_file", SO),
    ],
    sourceUrl: S.eu1670,
    lastVerified: VERIFIED,
  },
  {
    id: "eu-1670-battery-availability",
    instrumentId: "eu-2023-1670",
    articleRef: "Annex II, 1.1(1)(c)",
    title: "Battery availability: end-user or professional-only path",
    summary:
      "The battery must be available to end users, or the product must meet the higher professional-only conditions: 83% at 500 cycles, 1,000 cycles at 80%, and IP67.",
    legalText:
      "Manufacturers... may provide the battery... only to professional repairers if... after 500 full charge cycles the battery has... at least 83%... the battery endurance... achieves a minimum of 1 000 full charge cycles and after 1 000... at least 80%... and the device meets IP67.",
    interpretation:
      "This is a spare-parts availability path, not the Article 11 removability rule. It is a conjunction: professional-only service, 500-cycle retention, 1,000-cycle endurance, and IP67.",
    interpretationStatus: "settled",
    requirementType: "legal",
    domain: "environmental",
    applicability: smartphoneTablet,
    conformity: {
      op: "or",
      any: [
        {
          op: "eq",
          field: "product.battery.serviceModel",
          value: "user",
          label: "Battery available to end users",
        },
        {
          op: "and",
          all: [
            {
              op: "eq",
              field: "product.battery.serviceModel",
              value: "professional",
              label: "Battery available only to professional repairers",
            },
            {
              op: "gte",
              field: "product.battery.capacityRetentionAt500",
              value: 83,
              label: "At least 83% capacity after 500 cycles",
            },
            {
              op: "gte",
              field: "product.battery.cyclesTo80Pct",
              value: 1000,
              label: "At least 1,000 cycles to 80%",
            },
            {
              op: "gte",
              field: "product.ingress.solid",
              value: 6,
              label: "IP6X dust protection",
            },
            {
              op: "gte",
              field: "product.ingress.water",
              value: 7,
              label: "IPX7 water protection",
            },
          ],
        },
      ],
    },
    markets: ["EU"],
    severity: "market_access",
    owningTeams: [BE, ME, SO],
    accountableTeam: BE,
    lockInGate: "EVT",
    qualificationLeadWeeks: 16,
    decisionBufferWeeks: 4,
    evidence: [
      evidence("battery-service-path", "Battery service-model and test evidence", "technical_file", SO),
    ],
    sourceUrl: S.eu1670,
    lastVerified: VERIFIED,
  },

  // ---------------------------------------------------------------------------
  // EU 2023/1542 — Batteries Regulation
  // ---------------------------------------------------------------------------
  {
    id: "eu-batt-art11-removability",
    instrumentId: "eu-2023-1542",
    articleRef: "Article 11(1)–(2)",
    title: "Portable battery removable and replaceable by the end user",
    summary:
      "From 18 February 2027, portable batteries incorporated in products must be removable and replaceable by the end user, unless a narrow derogation applies.",
    legalText:
      "From 18 February 2027, portable batteries incorporated in appliances shall be removable and replaceable by the end user... By way of derogation... appliances, including wearable devices, specifically designed to operate primarily in an environment that is regularly subject to splashing water... and that are intended to be washable or rinseable... may be designed in such a way as to make the battery removable and replaceable only by independent professionals.",
    interpretation:
      "The default is end-user replacement with commercially available tools, without thermal energy or solvents. The derogations are narrow, evidence-based, and only where safety requires. An IP rating alone does not establish a derogation. A smartphone does not qualify as a wet appliance or a wearable; a watch or earbuds may.",
    interpretationStatus: "guidance",
    requirementType: "legal",
    domain: "environmental",
    applicability: {
      op: "and",
      all: [
        { op: "eq", field: "product.hasBattery", value: true },
        {
          op: "eq",
          field: "product.battery.category",
          value: "portable",
          label: "Battery is a portable battery",
        },
      ],
    },
    conformity: {
      op: "eq",
      field: "product.battery.removableByUser",
      value: true,
      label: "End user can remove and replace the battery",
    },
    exemptions: [
      {
        id: "wet-appliance",
        label: "Wet-environment appliance",
        predicate: {
          op: "and",
          all: [
            {
              op: "eq",
              field: "product.intendedWetUse",
              value: true,
              label: "Designed primarily for wet use",
            },
            {
              op: "eq",
              field: "product.useEnvironment",
              value: "wet",
              label: "Primary use environment is wet",
            },
          ],
        },
        requiredEvidence: [
          "Safety justification showing end-user replacement compromises safety",
          "Evidence that redesign cannot avoid the risk with current technology",
          "IP and washability test evidence",
        ],
        notes:
          "A wet-environment claim is not established by an IP rating alone. The product must be intended to be washable or rinseable and the derogation must be necessary for safety.",
      },
      {
        id: "wearable-miniaturisation",
        label: "Wearable miniaturisation / sealed enclosure",
        predicate: {
          op: "and",
          all: [
            {
              op: "eq",
              field: "product.formFactor",
              value: "wearable",
              label: "Product is a wearable",
            },
            {
              op: "eq",
              field: "product.battery.serviceModel",
              value: "professional",
              label: "Battery service is professional-only",
            },
          ],
        },
        requiredEvidence: [
          "Miniaturisation or sealed-enclosure justification",
          "Safety, durability or water-resistance evidence",
          "Independent-professional replacement procedure and tools",
        ],
        notes:
          "The 2026 delegated act on Article 11(2) derogations clarifies the wearable path. The product must still be replaceable by independent professionals.",
      },
    ],
    markets: ["EU"],
    severity: "market_access",
    owningTeams: [ME, BE, ID, SO],
    accountableTeam: ME,
    lockInGate: "EVT",
    qualificationLeadWeeks: 24,
    decisionBufferWeeks: 6,
    evidence: [
      evidence(
        "battery-removal-validation",
        "Battery removal/replacement validation and tooling",
        "test_report",
        ME,
        "missing",
      ),
      evidence(
        "derogation-file",
        "Derogation justification file (if claimed)",
        "technical_file",
        LG,
      ),
    ],
    sourceUrl: S.eu1542,
    lastVerified: VERIFIED,
    notes:
      "Commission guidelines 2026/C/5531 and the 2026 delegated act on Article 11(2) derogations inform the interpretation. The legal text remains the binding source.",
  },
  {
    id: "eu-batt-art11-professional",
    instrumentId: "eu-2023-1542",
    articleRef: "Article 11(2) and (5)",
    title: "Independent-professional replacement capability",
    summary:
      "Where a derogation is claimed, independent professionals must be able to remove and replace the battery with commercially available tools.",
    legalText:
      "Where a derogation applies, the product shall be designed in such a way as to make the battery removable and replaceable by independent professionals... with commercially available tools.",
    interpretation:
      "A derogation is not a free pass. It moves the service boundary from the end user to the independent professional, with tooling and information access obligations.",
    interpretationStatus: "guidance",
    requirementType: "legal",
    domain: "environmental",
    applicability: {
      op: "and",
      all: [
        {
          op: "eq",
          field: "product.hasBattery",
          value: true,
          label: "Product contains a battery",
        },
        {
          op: "eq",
          field: "product.battery.serviceModel",
          value: "professional",
          label: "Professional-only battery service model",
        },
      ],
    },
    conformity: {
      op: "eq",
      field: "product.battery.replaceableByIndependentProfessional",
      value: true,
      label: "Independent professional can replace the battery",
    },
    markets: ["EU"],
    severity: "market_access",
    owningTeams: [ME, SO, LG],
    accountableTeam: SO,
    lockInGate: "EVT",
    qualificationLeadWeeks: 12,
    decisionBufferWeeks: 4,
    evidence: [
      evidence("professional-repair-procedure", "Independent-professional repair procedure", "technical_file", SO),
    ],
    sourceUrl: S.eu1542,
    lastVerified: VERIFIED,
  },
  {
    id: "eu-batt-art13-qr",
    instrumentId: "eu-2023-1542",
    articleRef: "Article 13(6)",
    title: "Battery QR code and labelling",
    summary:
      "Batteries placed on the market from 18 February 2027 must carry the required labelling and QR code.",
    legalText:
      "The battery passport shall be accessible through the QR code referred to in Article 13(6)... Batteries shall be marked with the separate collection symbol and the required capacity and chemistry information.",
    interpretation:
      "Even batteries outside the battery-passport scope have labelling and QR obligations. This is a packaging and mark-readiness workstream, not a data-platform workstream.",
    interpretationStatus: "settled",
    requirementType: "legal",
    domain: "labeling",
    applicability: {
      op: "eq",
      field: "product.hasBattery",
      value: true,
      label: "Product contains a battery",
    },
    conformity: {
      op: "and",
      all: [
        {
          op: "eq",
          field: "product.battery.qrCode",
          value: true,
          label: "Battery QR code is implemented",
        },
        {
          op: "eq",
          field: "product.battery.labelReady",
          value: true,
          label: "Battery label artwork is ready",
        },
      ],
    },
    markets: ["EU"],
    severity: "labeling_penalty",
    owningTeams: [ME, EA, LG],
    accountableTeam: EA,
    lockInGate: "DVT",
    qualificationLeadWeeks: 8,
    decisionBufferWeeks: 2,
    evidence: [
      evidence("battery-label-artwork", "Battery label and QR artwork", "label_artwork", EA),
    ],
    sourceUrl: S.eu1542,
    lastVerified: VERIFIED,
  },
  {
    id: "eu-batt-art77-passport-scope",
    instrumentId: "eu-2023-1542",
    articleRef: "Article 77(1)",
    title: "Battery passport scope check",
    summary:
      "The battery passport applies to LMT batteries, EV batteries, and industrial batteries above 2 kWh — not to portable batteries.",
    legalText:
      "From 18 February 2027 each LMT battery, each industrial battery with a capacity greater than 2 kWh and each electric vehicle battery placed on the market or put into service shall have an electronic record ('battery passport').",
    interpretation:
      "A smartphone, tablet, laptop, watch or earbud battery is a portable battery and is outside Article 77. Do not present a phone as requiring a battery passport. The ESPR digital product passport is a separate, product-group-specific instrument.",
    interpretationStatus: "settled",
    requirementType: "legal",
    domain: "digital",
    applicability: {
      op: "and",
      all: [
        {
          op: "eq",
          field: "product.hasBattery",
          value: true,
          label: "Product contains a battery",
        },
        {
          op: "or",
          any: [
            {
              op: "in",
              field: "product.battery.category",
              values: ["LMT", "EV"],
              label: "Battery is an LMT or EV battery",
            },
            {
              op: "and",
              all: [
                {
                  op: "eq",
                  field: "product.battery.category",
                  value: "industrial",
                  label: "Battery is an industrial battery",
                },
                {
                  op: "gt",
                  field: "product.battery.energyWh",
                  value: 2000,
                  label: "Capacity is greater than 2 kWh",
                },
              ],
            },
          ],
        },
      ],
    },
    conformity: {
      op: "eq",
      field: "product.compliance.dppRegistryRegistered",
      value: true,
      label: "Battery passport registered",
    },
    markets: ["EU"],
    severity: "market_access",
    owningTeams: [EA, LG, FW],
    accountableTeam: EA,
    lockInGate: "DVT",
    qualificationLeadWeeks: 16,
    decisionBufferWeeks: 4,
    evidence: [
      evidence("battery-passport-registration", "Battery passport registration proof", "registry_entry", EA),
    ],
    sourceUrl: S.eu1542,
    lastVerified: VERIFIED,
    notes:
      "This clause exists to make the scope boundary explicit. For portable-battery products it should resolve to not applicable with a clear rationale.",
  },
  {
    id: "eu-batt-art7-carbon-scope",
    instrumentId: "eu-2023-1542",
    articleRef: "Article 7",
    title: "Battery carbon-footprint declaration scope",
    summary:
      "Carbon-footprint declarations apply to EV, LMT and industrial batteries above 2 kWh, not to portable batteries.",
    legalText:
      "The carbon footprint declaration requirements apply to electric vehicle batteries, light means of transport batteries, and industrial batteries with a capacity greater than 2 kWh.",
    interpretation:
      "A smartphone battery does not trigger a Battery Regulation carbon-footprint declaration. Product carbon footprint may become relevant under an ESPR delegated act or a customer requirement; label it as future/provisional.",
    interpretationStatus: "settled",
    requirementType: "legal",
    domain: "environmental",
    applicability: {
      op: "and",
      all: [
        {
          op: "eq",
          field: "product.hasBattery",
          value: true,
          label: "Product contains a battery",
        },
        {
          op: "or",
          any: [
            {
              op: "in",
              field: "product.battery.category",
              values: ["LMT", "EV"],
            },
            {
              op: "and",
              all: [
                { op: "eq", field: "product.battery.category", value: "industrial" },
                { op: "gt", field: "product.battery.energyWh", value: 2000 },
              ],
            },
          ],
        },
      ],
    },
    conformity: {
      op: "eq",
      field: "product.compliance.carbonFootprintDeclared",
      value: true,
      label: "Carbon-footprint declaration completed",
    },
    markets: ["EU"],
    severity: "market_access",
    owningTeams: [EA, SC, LG],
    accountableTeam: EA,
    lockInGate: "DVT",
    qualificationLeadWeeks: 20,
    decisionBufferWeeks: 4,
    evidence: [
      evidence("carbon-footprint-declaration", "Carbon-footprint declaration", "declaration", EA),
    ],
    sourceUrl: S.eu1542,
    lastVerified: VERIFIED,
  },

  // ---------------------------------------------------------------------------
  // EU 2025/2052 — external power supplies and charging equipment
  // ---------------------------------------------------------------------------
  {
    id: "eu-2052-active-efficiency",
    instrumentId: "eu-2025-2052",
    articleRef: "Annex II, point 1",
    title: "Average active efficiency (time-aware threshold)",
    summary:
      "EPS must meet the applicable average active efficiency threshold. For USB-PD EPS above 100 W, the 2019/1782 threshold continues to apply until 14 December 2030.",
    legalText:
      "The average active efficiency of EPS shall not be less than the values set out in Table 4... Point 1 of Annex II to Regulation (EU) 2019/1782 shall continue to apply to EPS with a USB-PD port with a nameplate output power higher than 100 W until 14 December 2030.",
    interpretation:
      "The engine computes a headroom value against the time-aware threshold. A 140 W USB-PD adapter is assessed against 0.88 until 14 December 2030 and 0.89 afterwards. This is separate from the permanent interoperability exemption for EPS above 100 W.",
    interpretationStatus: "settled",
    requirementType: "legal",
    domain: "environmental",
    applicability: {
      op: "eq",
      field: "product.category",
      value: "eps_charger",
      label: "Product is an external power supply",
    },
    conformity: {
      op: "gte",
      field: "derived.euEpsEfficiencyHeadroom",
      value: 0,
      label: "Average active efficiency meets the time-aware threshold",
    },
    markets: ["EU"],
    severity: "market_access",
    owningTeams: [EE, ME],
    accountableTeam: EE,
    lockInGate: "DVT",
    qualificationLeadWeeks: 12,
    decisionBufferWeeks: 4,
    evidence: [
      evidence("eps-efficiency-report", "EPS efficiency test report", "test_report", EE),
    ],
    sourceUrl: S.eu2052,
    lastVerified: VERIFIED,
  },
  {
    id: "eu-2052-no-load",
    instrumentId: "eu-2025-2052",
    articleRef: "Annex II, point 1(a)",
    title: "No-load power consumption",
    summary:
      "No-load power must not exceed 0.15 W for single-voltage AC-DC EPS in the 49–250 W range and above 250 W.",
    legalText:
      "The no-load condition power consumption of EPS shall not exceed the values set out in Table 1.",
    interpretation:
      "Test at the specified load conditions. A 0.16 W result fails the 0.15 W limit; this is a common late-stage finding because it depends on controller and snubber design.",
    interpretationStatus: "settled",
    requirementType: "legal",
    domain: "environmental",
    applicability: {
      op: "eq",
      field: "product.category",
      value: "eps_charger",
    },
    conformity: {
      op: "lte",
      field: "product.power.noLoadW",
      value: 0.15,
      label: "No-load power is at or below 0.15 W",
    },
    markets: ["EU"],
    severity: "market_access",
    owningTeams: [EE],
    accountableTeam: EE,
    lockInGate: "DVT",
    qualificationLeadWeeks: 10,
    decisionBufferWeeks: 2,
    evidence: [
      evidence("eps-no-load-report", "EPS no-load test report", "test_report", EE),
    ],
    sourceUrl: S.eu2052,
    lastVerified: VERIFIED,
  },
  {
    id: "eu-2052-low-load",
    instrumentId: "eu-2025-2052",
    articleRef: "Annex II, point 1(b)",
    title: "Low-load efficiency at 10%",
    summary:
      "For EPS above 49 W, low-load efficiency at 10% must be at least 0.83 for single-voltage AC-DC basic-voltage units.",
    legalText:
      "The low load efficiency shall not be less than the values set out in Table 2 for EPS with a nameplate output power exceeding 10 W... 49 W < Pout: 0.83.",
    interpretation:
      "Low-load efficiency is a separate test from average active efficiency. A design can pass full-load efficiency and fail at 10% load.",
    interpretationStatus: "settled",
    requirementType: "legal",
    domain: "environmental",
    applicability: {
      op: "and",
      all: [
        { op: "eq", field: "product.category", value: "eps_charger" },
        {
          op: "gt",
          field: "product.power.maxOutputW",
          value: 49,
          label: "Output power above 49 W",
        },
      ],
    },
    conformity: {
      op: "gte",
      field: "product.power.lowLoadEfficiency",
      value: 0.83,
      label: "Low-load efficiency is at least 0.83",
    },
    markets: ["EU"],
    severity: "market_access",
    owningTeams: [EE],
    accountableTeam: EE,
    lockInGate: "DVT",
    qualificationLeadWeeks: 10,
    decisionBufferWeeks: 2,
    evidence: [
      evidence("eps-low-load-report", "EPS low-load test report", "test_report", EE),
    ],
    sourceUrl: S.eu2052,
    lastVerified: VERIFIED,
  },
  {
    id: "eu-2052-interoperability",
    instrumentId: "eu-2025-2052",
    articleRef: "Annex II, point 3",
    title: "Common-charger interoperability",
    summary:
      "AC-DC EPS must be interoperable with at least one USB-C/USB-PD port and no hard-wired output cable, unless an exemption applies. EPS above 100 W are exempt.",
    legalText:
      "An AC-DC EPS shall be an interoperable EPS... unless... it has a nameplate output power greater than 100 W...",
    interpretation:
      "The >100 W interoperability exemption is permanent and separate from the >100 W USB-PD efficiency transition. A 140 W adapter is exempt from interoperability; a 96 W adapter is not.",
    interpretationStatus: "settled",
    requirementType: "legal",
    domain: "environmental",
    applicability: {
      op: "eq",
      field: "product.category",
      value: "eps_charger",
    },
    conformity: {
      op: "and",
      all: [
        {
          op: "eq",
          field: "product.power.usbCPort",
          value: true,
          label: "At least one USB-C/USB-PD port",
        },
        {
          op: "eq",
          field: "product.power.detachableCable",
          value: true,
          label: "No hard-wired output cable",
        },
      ],
    },
    exemptions: [
      {
        id: "high-power-exemption",
        label: "EPS above 100 W",
        predicate: {
          op: "gt",
          field: "product.power.maxOutputW",
          value: 100,
          label: "Nameplate output power above 100 W",
        },
        requiredEvidence: [
          "Nameplate output power declaration",
          "Product specification showing output power",
        ],
        notes:
          "This is a permanent interoperability exemption, not the temporary efficiency transition.",
      },
    ],
    markets: ["EU"],
    severity: "market_access",
    owningTeams: [EE, ME, LG],
    accountableTeam: EE,
    lockInGate: "DVT",
    qualificationLeadWeeks: 8,
    decisionBufferWeeks: 2,
    evidence: [
      evidence("interoperability-file", "Interoperability and port configuration evidence", "technical_file", EE),
    ],
    sourceUrl: S.eu2052,
    lastVerified: VERIFIED,
  },
  {
    id: "eu-2052-common-charger-logo",
    instrumentId: "eu-2025-2052",
    articleRef: "Annex III",
    title: "Common Charger logo and port marking",
    summary:
      "Interoperable EPS must carry the Common Charger logo and mark each USB-C/USB-PD port with its maximum output power.",
    legalText:
      "Interoperable EPS shall be affixed with the Common Charger logo... and marked at each USB Type-C and USB-PD port with that port's maximum output power.",
    interpretation:
      "A labelling and artwork workstream. EPS above 100 W are outside the interoperability requirement, so the logo requirement does not apply to the 140 W adapter.",
    interpretationStatus: "settled",
    requirementType: "legal",
    domain: "labeling",
    applicability: {
      op: "and",
      all: [
        { op: "eq", field: "product.category", value: "eps_charger" },
        {
          op: "lte",
          field: "product.power.maxOutputW",
          value: 100,
          label: "Output power at or below 100 W",
        },
      ],
    },
    conformity: {
      op: "eq",
      field: "product.power.commonChargerLogo",
      value: true,
      label: "Common Charger logo is applied",
    },
    markets: ["EU"],
    severity: "labeling_penalty",
    owningTeams: [ID, ME, EE],
    accountableTeam: ID,
    lockInGate: "DVT",
    qualificationLeadWeeks: 6,
    decisionBufferWeeks: 2,
    evidence: [
      evidence("common-charger-artwork", "Common Charger artwork and port marking", "label_artwork", ID),
    ],
    sourceUrl: S.eu2052,
    lastVerified: VERIFIED,
  },
  {
    id: "eu-2052-product-information",
    instrumentId: "eu-2025-2052",
    articleRef: "Annex II, point 2",
    title: "Product information and free-access website",
    summary:
      "Nameplate information and product documentation must be available on a free-access website for at least 10 years.",
    legalText:
      "Detailed product information must be made available in documentation and on a free-access website for at least 10 years.",
    interpretation:
      "Information architecture and lifecycle content. This is a program deliverable, not only a label.",
    interpretationStatus: "settled",
    requirementType: "legal",
    domain: "labeling",
    applicability: {
      op: "eq",
      field: "product.category",
      value: "eps_charger",
    },
    conformity: {
      op: "eq",
      field: "product.energy.productInfoPublic",
      value: true,
      label: "Product information is publicly available",
    },
    markets: ["EU"],
    severity: "labeling_penalty",
    owningTeams: [EA, LG, EE],
    accountableTeam: EA,
    lockInGate: "PVT",
    qualificationLeadWeeks: 6,
    decisionBufferWeeks: 2,
    evidence: [
      evidence("eps-product-info", "Public product-information page", "technical_file", EA),
    ],
    sourceUrl: S.eu2052,
    lastVerified: VERIFIED,
  },

  // ---------------------------------------------------------------------------
  // EU 2023/1669 — smartphone and tablet energy label
  // ---------------------------------------------------------------------------
  {
    id: "eu-1669-repairability-class",
    instrumentId: "eu-2023-1669",
    articleRef: "Annex II, point C and Annex IV, point 5",
    title: "Repairability class A–E on the energy label",
    summary:
      "The label must show the repairability class calculated from the six-parameter EU repairability index.",
    legalText:
      "The repairability class of a smartphone or a slate tablet shall be determined on the basis of the repairability index as set out in Table 4... R = (SDD*0,25)+(SF*0,15)+(ST*0,15)+(SSP*0,15)+(SSU*0,15)+(SRI*0,15).",
    interpretation:
      "The engine computes the official index and class from part-level inputs. This is the EU harmonised score; it is not the French national repairability index.",
    interpretationStatus: "settled",
    requirementType: "legal",
    domain: "labeling",
    applicability: smartphoneTablet,
    conformity: {
      op: "exists",
      field: "derived.euRepairabilityClass",
      label: "EU repairability class is calculated",
    },
    markets: ["EU"],
    severity: "market_access",
    owningTeams: [ME, SO, EA],
    accountableTeam: SO,
    lockInGate: "DVT",
    qualificationLeadWeeks: 8,
    decisionBufferWeeks: 2,
    evidence: [
      evidence("repairability-calculation", "Repairability index calculation file", "technical_file", SO),
      evidence("energy-label-artwork", "Energy-label artwork with class", "label_artwork", EA),
    ],
    sourceUrl: S.eu1669,
    lastVerified: VERIFIED,
  },
  {
    id: "eu-1669-energy-class",
    instrumentId: "eu-2023-1669",
    articleRef: "Annex II, point A",
    title: "Energy efficiency class",
    summary:
      "The label must show the energy efficiency class calculated from the Energy Efficiency Index.",
    legalText:
      "The energy efficiency class of a smartphone or a slate tablet shall be determined on the basis of its Energy Efficiency Index (EEI) as set out in Table 1 for smartphones and Table 2 for slate tablets.",
    interpretation:
      "The prototype treats the calculated label class as an input/readiness field; a production tool would connect to the energy model and test evidence.",
    interpretationStatus: "settled",
    requirementType: "legal",
    domain: "labeling",
    applicability: smartphoneTablet,
    conformity: {
      op: "exists",
      field: "product.energy.labelClass",
      label: "Energy efficiency class is available",
    },
    markets: ["EU"],
    severity: "labeling_penalty",
    owningTeams: [EE, EA],
    accountableTeam: EA,
    lockInGate: "DVT",
    qualificationLeadWeeks: 6,
    decisionBufferWeeks: 2,
    evidence: [
      evidence("energy-class-calculation", "Energy efficiency class calculation", "technical_file", EE),
    ],
    sourceUrl: S.eu1669,
    lastVerified: VERIFIED,
  },
  {
    id: "eu-1669-eprel",
    instrumentId: "eu-2023-1669",
    articleRef: "Article 4 and Annex V",
    title: "EPREL registration before placing on the market",
    summary:
      "The product must be registered in EPREL and the label must be available before market placement.",
    legalText:
      "Suppliers shall register the product in the European Product Registry for Energy Labelling (EPREL) before placing the product on the market.",
    interpretation:
      "A hard market-access gate. Registration depends on completed test data and label artwork, so it sits at PVT, not DVT.",
    interpretationStatus: "settled",
    requirementType: "legal",
    domain: "labeling",
    applicability: smartphoneTablet,
    conformity: {
      op: "eq",
      field: "product.energy.eprelRegistered",
      value: true,
      label: "Product is registered in EPREL",
    },
    markets: ["EU"],
    severity: "market_access",
    owningTeams: [EA, LG, EE],
    accountableTeam: EA,
    lockInGate: "PVT",
    qualificationLeadWeeks: 8,
    decisionBufferWeeks: 2,
    evidence: [
      evidence("eprel-registration", "EPREL registration proof", "registry_entry", EA),
    ],
    sourceUrl: S.eu1669,
    lastVerified: VERIFIED,
  },
  {
    id: "eu-1669-product-info",
    instrumentId: "eu-2023-1669",
    articleRef: "Article 6 and Annex V",
    title: "Product information sheet",
    summary:
      "A product information sheet must be publicly available and linked to the product.",
    legalText:
      "The product information sheet shall be made available in a publicly available part of the supplier's website.",
    interpretation:
      "Content and web operations. The data must match the label, test report and EPREL entry.",
    interpretationStatus: "settled",
    requirementType: "legal",
    domain: "labeling",
    applicability: smartphoneTablet,
    conformity: {
      op: "eq",
      field: "product.energy.productInfoPublic",
      value: true,
      label: "Product information sheet is public",
    },
    markets: ["EU"],
    severity: "labeling_penalty",
    owningTeams: [EA, LG],
    accountableTeam: EA,
    lockInGate: "PVT",
    qualificationLeadWeeks: 4,
    decisionBufferWeeks: 2,
    evidence: [
      evidence("product-info-sheet", "Published product information sheet", "technical_file", EA),
    ],
    sourceUrl: S.eu1669,
    lastVerified: VERIFIED,
  },

  // ---------------------------------------------------------------------------
  // France — repairability index
  // ---------------------------------------------------------------------------
  {
    id: "fr-repairability-score",
    instrumentId: "fr-repairability",
    articleRef: "Décret 2020-1757 and category order",
    title: "French repairability index calculated for laptops",
    summary:
      "Laptops sold in France must have a repairability index calculated from five criteria and expressed out of 10.",
    legalText:
      "L'indice de réparabilité est calculé à partir de la somme de cinq notes sur vingt... puis divisé par dix pour exprimer une note synthétique sur une échelle de 1 à 10.",
    interpretation:
      "The French index is a national instrument, not the EU harmonised repairability class. The prototype shows an illustrative score until the category-specific laptop order is encoded in full.",
    interpretationStatus: "guidance",
    requirementType: "legal",
    domain: "labeling",
    applicability: {
      op: "eq",
      field: "product.category",
      value: "laptop",
      label: "Product is a laptop",
    },
    conformity: {
      op: "exists",
      field: "derived.frIndex",
      label: "French repairability index is calculated",
    },
    markets: ["EU"],
    subMarket: "FR",
    severity: "labeling_penalty",
    owningTeams: [SO, EA, LG],
    accountableTeam: EA,
    lockInGate: "DVT",
    qualificationLeadWeeks: 8,
    decisionBufferWeeks: 2,
    evidence: [
      evidence("fr-index-calculation", "French repairability calculation", "technical_file", SO),
    ],
    sourceUrl: S.france,
    lastVerified: VERIFIED,
    notes:
      "The score in this prototype is illustrative. The official calculation depends on the category-specific arrêté for laptops.",
  },
  {
    id: "fr-repairability-display",
    instrumentId: "fr-repairability",
    articleRef: "Consumer Code R. 541-214",
    title: "French repairability index displayed at point of sale",
    summary:
      "The index and its calculation detail must be communicated to distributors and consumers.",
    legalText:
      "L'indice de réparabilité... doit être communiqué aux consommateurs au moment de la vente.",
    interpretation:
      "A commercial-readiness requirement: the score must be visible, consistent with the calculation file, and available to retail partners.",
    interpretationStatus: "settled",
    requirementType: "legal",
    domain: "labeling",
    applicability: {
      op: "eq",
      field: "product.category",
      value: "laptop",
    },
    conformity: {
      op: "eq",
      field: "product.compliance.frIndexDisplayed",
      value: true,
      label: "French index is displayed at point of sale",
    },
    markets: ["EU"],
    subMarket: "FR",
    severity: "labeling_penalty",
    owningTeams: [EA, LG, SO],
    accountableTeam: EA,
    lockInGate: "PVT",
    qualificationLeadWeeks: 4,
    decisionBufferWeeks: 2,
    evidence: [
      evidence("fr-index-display", "Retail display artwork and calculation detail", "label_artwork", EA),
    ],
    sourceUrl: S.france,
    lastVerified: VERIFIED,
  },

  // ---------------------------------------------------------------------------
  // United States — state right-to-repair and federal programs
  // ---------------------------------------------------------------------------
  {
    id: "us-ca-right-to-repair",
    instrumentId: "us-ca-right-to-repair",
    articleRef: "SB 244, Civil Code §1793.03",
    title: "California repair materials for 7 years",
    summary:
      "For covered devices priced at $100 or more, manufacturers must provide parts, tools, documentation and software for 7 years.",
    legalText:
      "A manufacturer shall make available... the documentation, tools, parts, and software required for the repair of the electronic or appliance product... for seven years after the last date the product is manufactured.",
    interpretation:
      "The 7-year software-support expectation is stricter than the EU 2023/1670 5-year OS-update requirement. This is a portfolio segmentation question, not just a phone-design question.",
    interpretationStatus: "settled",
    requirementType: "legal",
    domain: "environmental",
    applicability: {
      op: "in",
      field: "product.category",
      values: ["smartphone", "tablet", "laptop", "display"],
      label: "Covered consumer electronic device",
    },
    conformity: {
      op: "and",
      all: [
        {
          op: "gte",
          field: "product.spareParts.years",
          value: 7,
          label: "Parts available for at least 7 years",
        },
        {
          op: "gte",
          field: "product.software.securitySupportYears",
          value: 7,
          label: "Software support for at least 7 years",
        },
      ],
    },
    markets: ["US-CA"],
    severity: "market_access",
    owningTeams: [SO, FW, LG, SC],
    accountableTeam: SO,
    lockInGate: "PVT",
    qualificationLeadWeeks: 8,
    decisionBufferWeeks: 2,
    evidence: [
      evidence("ca-repair-materials", "California parts/tools/docs/software commitment", "declaration", SO),
    ],
    sourceUrl: S.ca,
    lastVerified: VERIFIED,
  },
  {
    id: "us-or-right-to-repair",
    instrumentId: "us-or-right-to-repair",
    articleRef: "SB 1596",
    title: "Oregon repair materials and parts-pairing restriction",
    summary:
      "Covered devices must have repair materials for at least 3 years and must not use parts pairing to block repair.",
    legalText:
      "A manufacturer shall... provide... documentation, tools, parts, and software... for at least three years... A manufacturer shall not... use parts pairing to prevent or impede the use of a replacement part.",
    interpretation:
      "Parts pairing is a design and firmware decision, not a documentation fix. It is a leading indicator of repairability risk across US states.",
    interpretationStatus: "settled",
    requirementType: "legal",
    domain: "environmental",
    applicability: {
      op: "in",
      field: "product.category",
      values: ["smartphone", "tablet", "laptop", "display"],
    },
    conformity: {
      op: "and",
      all: [
        {
          op: "gte",
          field: "product.spareParts.years",
          value: 3,
          label: "Parts available for at least 3 years",
        },
        {
          op: "eq",
          field: "product.spareParts.partsPairing",
          value: false,
          label: "No parts pairing restriction",
        },
      ],
    },
    markets: ["US-OR"],
    severity: "market_access",
    owningTeams: [FW, SO, LG],
    accountableTeam: FW,
    lockInGate: "DVT",
    qualificationLeadWeeks: 8,
    decisionBufferWeeks: 2,
    evidence: [
      evidence("or-parts-pairing", "Parts-pairing assessment and repair materials commitment", "technical_file", FW),
    ],
    sourceUrl: S.or,
    lastVerified: VERIFIED,
  },
  {
    id: "us-doe-eps-certification",
    instrumentId: "us-doe-eps",
    articleRef: "10 CFR 430 and CEC Title 20",
    title: "US DOE and CEC certification for EPS",
    summary:
      "External power supplies require DOE and California Energy Commission certification before US import and sale.",
    legalText:
      "Manufacturers must certify compliance with the applicable energy conservation standards to the US Department of Energy and the California Energy Commission before distributing the product in the United States.",
    interpretation:
      "Certification is a market-entry gate. It is often tracked separately from the EU conformity route, but shares the same efficiency test data.",
    interpretationStatus: "guidance",
    requirementType: "legal",
    domain: "environmental",
    applicability: {
      op: "eq",
      field: "product.category",
      value: "eps_charger",
    },
    conformity: {
      op: "and",
      all: [
        {
          op: "eq",
          field: "product.power.doeCertified",
          value: true,
          label: "DOE certification complete",
        },
        {
          op: "eq",
          field: "product.power.cecCertified",
          value: true,
          label: "CEC certification complete",
        },
      ],
    },
    markets: ["US-FED"],
    severity: "market_access",
    owningTeams: [EE, LG, PM],
    accountableTeam: LG,
    lockInGate: "DVT",
    qualificationLeadWeeks: 10,
    decisionBufferWeeks: 2,
    evidence: [
      evidence("doe-cec-certification", "DOE and CEC certification records", "certificate", LG),
    ],
    sourceUrl: S.doe,
    lastVerified: VERIFIED,
  },
  {
    id: "energy-star-certification",
    instrumentId: "energy-star",
    articleRef: "ENERGY STAR product specification",
    title: "ENERGY STAR certification",
    summary:
      "Voluntary ENERGY STAR certification for eligible displays and computers; often a customer or procurement requirement.",
    legalText:
      "ENERGY STAR certified products meet the program's energy-efficiency specifications and are listed in the ENERGY STAR product finder.",
    interpretation:
      "Not a legal market-access requirement, but a commercial requirement for many enterprise and public-sector channels. Model it as voluntary/customer, not as law.",
    interpretationStatus: "settled",
    requirementType: "voluntary",
    domain: "environmental",
    applicability: {
      op: "in",
      field: "product.category",
      values: ["display", "laptop"],
    },
    conformity: {
      op: "eq",
      field: "product.energy.energyStar",
      value: true,
      label: "ENERGY STAR certification achieved",
    },
    markets: ["US-FED"],
    severity: "monitoring",
    owningTeams: [EA, EE, PM],
    accountableTeam: EA,
    lockInGate: "PVT",
    qualificationLeadWeeks: 6,
    decisionBufferWeeks: 2,
    evidence: [
      evidence("energy-star-cert", "ENERGY STAR certification record", "certificate", EA),
    ],
    sourceUrl: S.energyStar,
    lastVerified: VERIFIED,
  },

  // ---------------------------------------------------------------------------
  // EU 2019/2021 — electronic displays (ErP Lot 5)
  // ---------------------------------------------------------------------------
  {
    id: "eu-2019-2021-standby",
    instrumentId: "eu-2019-2021",
    articleRef: "Annex II, point 3",
    title: "Display standby power",
    summary: "Electronic displays must meet the standby and networked-standby power limits.",
    legalText:
      "The standby power consumption of electronic displays shall not exceed 0.5 W.",
    interpretation:
      "A power-architecture requirement with firmware implications. Test at the wall, not at the internal rail.",
    interpretationStatus: "settled",
    requirementType: "legal",
    domain: "environmental",
    applicability: {
      op: "eq",
      field: "product.category",
      value: "display",
    },
    conformity: {
      op: "lte",
      field: "product.energy.standbyW",
      value: 0.5,
      label: "Standby power is at or below 0.5 W",
    },
    markets: ["EU"],
    severity: "market_access",
    owningTeams: [EE, FW],
    accountableTeam: EE,
    lockInGate: "DVT",
    qualificationLeadWeeks: 8,
    decisionBufferWeeks: 2,
    evidence: [
      evidence("display-standby-report", "Display standby power test report", "test_report", EE),
    ],
    sourceUrl: S.displays,
    lastVerified: VERIFIED,
  },
  {
    id: "eu-2019-2021-label",
    instrumentId: "eu-2019-2021",
    articleRef: "Article 3 and Annex V",
    title: "Display energy label and EPREL",
    summary:
      "Electronic displays require an energy label and EPREL registration before market placement.",
    legalText:
      "Suppliers shall register the product in EPREL and provide the label and product information sheet before placing the product on the market.",
    interpretation:
      "Label readiness and registry readiness are separate from the underlying efficiency test. Track both.",
    interpretationStatus: "settled",
    requirementType: "legal",
    domain: "labeling",
    applicability: {
      op: "eq",
      field: "product.category",
      value: "display",
    },
    conformity: {
      op: "and",
      all: [
        {
          op: "eq",
          field: "product.energy.eprelRegistered",
          value: true,
          label: "EPREL registration complete",
        },
        {
          op: "eq",
          field: "product.energy.productInfoPublic",
          value: true,
          label: "Product information is public",
        },
      ],
    },
    markets: ["EU"],
    severity: "labeling_penalty",
    owningTeams: [EA, EE, LG],
    accountableTeam: EA,
    lockInGate: "PVT",
    qualificationLeadWeeks: 6,
    decisionBufferWeeks: 2,
    evidence: [
      evidence("display-label", "Display label and product information sheet", "label_artwork", EA),
    ],
    sourceUrl: S.displays,
    lastVerified: VERIFIED,
  },

  // ---------------------------------------------------------------------------
  // EU 617/2013 — computers (ErP Lot 3)
  // ---------------------------------------------------------------------------
  {
    id: "eu-617-2013-info",
    instrumentId: "eu-617-2013",
    articleRef: "Annex II",
    title: "Computer product information",
    summary:
      "Computers must provide the required product information and standby behaviour documentation.",
    legalText:
      "Manufacturers shall provide the required information on energy consumption, standby behaviour, and test parameters in the technical documentation and public information.",
    interpretation:
      "Lot 3 is an existing measure and a candidate for an ESPR delegated act. Track the information pack even where the efficiency thresholds are inherited.",
    interpretationStatus: "guidance",
    requirementType: "legal",
    domain: "labeling",
    applicability: {
      op: "eq",
      field: "product.category",
      value: "laptop",
    },
    conformity: {
      op: "eq",
      field: "product.energy.productInfoPublic",
      value: true,
      label: "Computer product information is public",
    },
    markets: ["EU"],
    severity: "labeling_penalty",
    owningTeams: [EA, EE],
    accountableTeam: EA,
    lockInGate: "PVT",
    qualificationLeadWeeks: 4,
    decisionBufferWeeks: 2,
    evidence: [
      evidence("computer-product-info", "Computer product information pack", "technical_file", EA),
    ],
    sourceUrl: S.computers,
    lastVerified: VERIFIED,
  },

  // ---------------------------------------------------------------------------
  // ESPR / DPP — provisional readiness, not current obligations
  // ---------------------------------------------------------------------------
  {
    id: "eu-espr-dpp-registration",
    instrumentId: "eu-2024-1781",
    articleRef: "Articles 10–13",
    title: "ESPR DPP registration (provisional)",
    summary:
      "When a product-specific ESPR delegated act applies, the product DPP must be registered in the EU DPP Registry.",
    legalText:
      "Economic operators placing products covered by a delegated act on the market shall ensure that a digital product passport is created and registered in the registry.",
    interpretation:
      "No ICT delegated act is in force as of November 2026. The Commission's indicative timeline places ICT products in 2029, with an approximately 18-month transition after adoption. This clause is a readiness placeholder, not a current obligation.",
    interpretationStatus: "pending",
    requirementType: "legal",
    domain: "digital",
    applicability: {
      op: "and",
      all: [
        {
          op: "in",
          field: "product.category",
          values: ["smartphone", "tablet", "laptop", "display", "ereader"],
        },
        {
          op: "eq",
          field: "derived.dppDelegatedActInForce",
          value: true,
          label: "A product-specific DPP delegated act is in force",
        },
      ],
    },
    conformity: {
      op: "eq",
      field: "product.compliance.dppRegistryRegistered",
      value: true,
      label: "DPP is registered in the EU registry",
    },
    markets: ["EU"],
    severity: "market_access",
    owningTeams: [EA, FW, LG, SC],
    accountableTeam: EA,
    lockInGate: "PVT",
    qualificationLeadWeeks: 16,
    decisionBufferWeeks: 4,
    evidence: [
      evidence("dpp-registration", "DPP registry registration proof", "registry_entry", EA),
    ],
    sourceUrl: S.espr,
    lastVerified: VERIFIED,
    notes:
      "The DPP Registry became operational on 20 July 2026. Product-specific data requirements remain delegated-act dependent.",
  },
  {
    id: "eu-espr-dpp-data-carrier",
    instrumentId: "eu-2024-1781",
    articleRef: "Article 11 and Annex II",
    title: "DPP data carrier and unique identifier (provisional)",
    summary:
      "When a delegated act applies, the product must carry a data carrier linked to a unique product identifier.",
    legalText:
      "The digital product passport shall be accessible through a data carrier... and shall be based on open standards...",
    interpretation:
      "A design and tooling workstream: QR/NFC placement, identifier scheme, registry URI, and access-tier data. Not yet applicable to smartphones or laptops under a product-specific delegated act.",
    interpretationStatus: "pending",
    requirementType: "legal",
    domain: "digital",
    applicability: {
      op: "and",
      all: [
        {
          op: "in",
          field: "product.category",
          values: ["smartphone", "tablet", "laptop", "display", "ereader"],
        },
        {
          op: "eq",
          field: "derived.dppDelegatedActInForce",
          value: true,
        },
      ],
    },
    conformity: {
      op: "eq",
      field: "product.compliance.dppDataCarrier",
      value: true,
      label: "DPP data carrier and identifier are implemented",
    },
    markets: ["EU"],
    severity: "labeling_penalty",
    owningTeams: [ID, FW, EA],
    accountableTeam: ID,
    lockInGate: "DVT",
    qualificationLeadWeeks: 12,
    decisionBufferWeeks: 2,
    evidence: [
      evidence("dpp-data-carrier", "Data-carrier and identifier validation", "technical_file", ID),
    ],
    sourceUrl: S.espr,
    lastVerified: VERIFIED,
  },
];

export const clauseById = new Map(clauses.map((clause) => [clause.id, clause]));
