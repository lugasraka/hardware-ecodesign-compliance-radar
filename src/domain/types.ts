export type MarketCode = "EU" | "US-FED" | "US-CA" | "US-OR" | "UK" | "IN";

export type Jurisdiction =
  | "EU"
  | "FR"
  | "US-FED"
  | "US-CA"
  | "US-OR"
  | "UK"
  | "IN"
  | "GLOBAL";

export type RegulatoryDomain = "environmental" | "safety" | "emc" | "digital" | "labeling";

export type ProductCategory =
  | "smartphone"
  | "tablet"
  | "laptop"
  | "wearable"
  | "earbuds"
  | "display"
  | "eps_charger"
  | "wireless_charger"
  | "cable"
  | "ereader"
  | "hmi_panel"
  | "thermostat";

export type FormFactor =
  | "handheld"
  | "wearable"
  | "clamshell"
  | "panel"
  | "wall_mounted"
  | "accessory";

export type UseEnvironment = "consumer" | "professional" | "industrial" | "wet";

export type Installation = "portable" | "fixed" | "wall" | "din_rail";

export type PowerSource = "battery" | "mains" | "both";

export type BatteryCategory = "portable" | "LMT" | "industrial" | "EV" | "none";

export type BatteryServiceModel = "user" | "professional" | "sealed";

export type Gate = "Concept" | "Proto" | "EVT" | "DVT" | "PVT" | "MP";

export type Team =
  | "Mechanical Engineering"
  | "Battery Engineering"
  | "Electrical Engineering"
  | "Firmware & Software"
  | "Supply Chain"
  | "Industrial Design"
  | "Service Operations"
  | "Legal & Government Affairs"
  | "Environmental Affairs"
  | "Program Management";

export type Severity = "market_access" | "labeling_penalty" | "monitoring";

export type RequirementType = "legal" | "voluntary" | "customer" | "internal";

export type InstrumentType =
  | "regulation"
  | "directive"
  | "delegated_act"
  | "implementing_act"
  | "standard"
  | "voluntary_program"
  | "national_law";

export type InstrumentStatus =
  | "in_force"
  | "transition"
  | "adopted_not_applied"
  | "draft"
  | "repealed"
  | "monitoring";

export type InterpretationStatus = "settled" | "guidance" | "contested" | "pending";

export type Confidence = "high" | "medium" | "low";

export type EvidenceType =
  | "test_report"
  | "declaration"
  | "certificate"
  | "supplier_declaration"
  | "label_artwork"
  | "registry_entry"
  | "technical_file";

export type EvidenceStatus = "sufficient" | "partial" | "missing" | "expired";

export type OverallStatus =
  | "compliant"
  | "at_risk"
  | "non_compliant"
  | "not_applicable"
  | "unknown";

export type ProgramStatus = "on_track" | "monitor" | "act_now" | "late" | "not_applicable";

export type Collision = "none" | "at_risk" | "late";

export type Tri = true | false | "unknown";

export type Primitive = string | number | boolean;

export type FieldRef = `product.${string}` | `derived.${string}` | "market" | "asOf";

export type Predicate =
  | { op: "eq"; field: FieldRef; value: Primitive; label?: string }
  | { op: "neq"; field: FieldRef; value: Primitive; label?: string }
  | { op: "gt"; field: FieldRef; value: number; label?: string }
  | { op: "gte"; field: FieldRef; value: number; label?: string }
  | { op: "lt"; field: FieldRef; value: number; label?: string }
  | { op: "lte"; field: FieldRef; value: number; label?: string }
  | { op: "in"; field: FieldRef; values: Primitive[]; label?: string }
  | { op: "contains"; field: FieldRef; value: Primitive; label?: string }
  | { op: "between"; field: FieldRef; min: number; max: number; label?: string }
  | { op: "exists"; field: FieldRef; label?: string }
  | { op: "and"; all: Predicate[]; label?: string }
  | { op: "or"; any: Predicate[]; label?: string }
  | { op: "not"; not: Predicate; label?: string };

export interface BatterySpec {
  category: BatteryCategory;
  chemistry: string;
  capacityMah: number;
  voltageV: number;
  energyWh: number;
  cyclesTo80Pct: number;
  capacityRetentionAt500: number;
  removableByUser: boolean;
  serviceModel: BatteryServiceModel;
  replaceableByIndependentProfessional: boolean;
  qrCode: boolean;
  labelReady: boolean;
  chargeLimit80Option: boolean;
  trickleStop: boolean;
}

export interface PowerSpec {
  maxOutputW: number;
  usbPd: boolean;
  usbCPort: boolean;
  detachableCable: boolean;
  wireless: boolean;
  noLoadW: number;
  lowLoadEfficiency: number;
  averageActiveEfficiency: number;
  commonChargerLogo: boolean;
  doeCertified: boolean;
  cecCertified: boolean;
}

export interface DisplaySpec {
  type: "LCD" | "OLED" | "EInk" | "none";
  sizeIn: number;
  touch: boolean;
}

export interface IngressSpec {
  solid: number;
  water: number;
}

export interface SoftwareSpec {
  osSupportYears: number;
  securitySupportYears: number;
  updatePolicyPublic: boolean;
}

export interface SparePartsSpec {
  years: number;
  deliveryDays: number;
  professionalOnly: boolean;
  publicList: boolean;
  partsPairing: boolean;
}

export interface RepairInfoSpec {
  level: 1 | 3 | 5;
  publicDocs: boolean;
}

export interface MaterialsSpec {
  recycledAluminiumPct: number;
  recycledContentPct: number;
}

export interface EnergySpec {
  labelClass: string;
  eprelRegistered: boolean;
  productInfoPublic: boolean;
  standbyW: number;
  energyStar: boolean;
}

export interface ComplianceSpec {
  dropTestFalls: number;
  scratchMohs: number;
  dppRegistryRegistered: boolean;
  dppDataCarrier: boolean;
  carbonFootprintDeclared: boolean;
  frIndexDisplayed: boolean;
}

export interface ProductSpecs {
  powerSource: PowerSource;
  hasBattery: boolean;
  battery?: BatterySpec;
  power?: PowerSpec;
  display?: DisplaySpec;
  ingress: IngressSpec;
  formFactor: FormFactor;
  useEnvironment: UseEnvironment;
  installation: Installation;
  software: SoftwareSpec;
  spareParts: SparePartsSpec;
  repairInfo: RepairInfoSpec;
  materials: MaterialsSpec;
  energy: EnergySpec;
  compliance: ComplianceSpec;
  intendedWetUse: boolean;
  isFoldable: boolean;
}

export type PartKey =
  | "battery"
  | "display"
  | "backCover"
  | "frontCamera"
  | "rearCamera"
  | "chargingPort"
  | "buttons"
  | "microphone"
  | "speaker"
  | "hinge";

export interface PartRepairInput {
  disassemblySteps: number;
  fastener: "reusable" | "resupplied" | "removable";
  tool:
    | "none"
    | "basic"
    | "supplied_with_spare"
    | "supplied_with_product"
    | "commercial";
}

export interface RepairabilityInputs {
  parts: Partial<Record<PartKey, PartRepairInput>>;
  sparePartsLevel: 1 | 2 | 3 | 4 | 5;
  sparePartsYears: number;
  repairInfoLevel: 1 | 3 | 5;
  softwareUpdateYears: number;
  isFoldable: boolean;
  partsPriceRatio: number;
  publicRepairDocs: boolean;
}

export interface Product {
  id: string;
  name: string;
  shortName: string;
  category: ProductCategory;
  archetype: string;
  description: string;
  markets: MarketCode[];
  launchDate: string;
  endOfSaleDate: string;
  businessUnit: string;
  annualUnits: Partial<Record<MarketCode, number>>;
  aspUsd: Partial<Record<MarketCode, number>>;
  specs: ProductSpecs;
  gatePlan?: Partial<Record<Gate, string>>;
  repairability?: RepairabilityInputs;
  evidenceOverrides?: Record<string, EvidenceStatus>;
  status: "in_development" | "in_market" | "monitoring";
}

export interface Instrument {
  id: string;
  shortId: string;
  title: string;
  jurisdiction: Jurisdiction;
  domain: RegulatoryDomain;
  type: InstrumentType;
  status: InstrumentStatus;
  publishedDate?: string;
  applicationDate: string;
  transitionEndDate?: string;
  summary: string;
  sourceUrl: string;
  celex?: string;
  lastVerified: string;
  confidence: Confidence;
  productGroups: ProductCategory[];
}

export interface EvidenceRequirement {
  id: string;
  label: string;
  type: EvidenceType;
  owner: Team;
  defaultStatus: EvidenceStatus;
  expiresOn?: string;
  notes?: string;
}

export interface Exemption {
  id: string;
  label: string;
  predicate: Predicate;
  requiredEvidence: string[];
  notes: string;
}

export interface Clause {
  id: string;
  instrumentId: string;
  articleRef: string;
  title: string;
  summary: string;
  legalText: string;
  interpretation: string;
  interpretationStatus: InterpretationStatus;
  requirementType: RequirementType;
  domain: RegulatoryDomain;
  applicability: Predicate;
  conformity?: Predicate;
  exemptions?: Exemption[];
  markets: MarketCode[];
  subMarket?: "FR";
  severity: Severity;
  owningTeams: Team[];
  accountableTeam: Team;
  lockInGate: Gate;
  qualificationLeadWeeks: number;
  decisionBufferWeeks: number;
  evidence: EvidenceRequirement[];
  sourceUrl: string;
  lastVerified: string;
  notes?: string;
}

export interface TraceNode {
  label: string;
  result: Tri;
  field?: string;
  actual?: unknown;
  expected?: unknown;
  children?: TraceNode[];
}

export interface ExposureRange {
  low: number;
  base: number;
  high: number;
}

export interface Assessment {
  productId: string;
  market: MarketCode;
  clauseId: string;
  asOf: string;
  applicability: Tri;
  conformity: Tri;
  evidence: EvidenceStatus;
  overall: OverallStatus;
  programStatus: ProgramStatus;
  collision: Collision;
  marketRelevance: "at_launch" | "mid_life" | "never" | "unknown";
  gateDate: string;
  requiredBy: string;
  exemption?: {
    id: string;
    label: string;
    applied: boolean;
    evidence: string[];
  };
  exposureUsd: ExposureRange;
  trace: TraceNode;
  reasons: string[];
}

export interface Risk {
  id: string;
  title: string;
  description: string;
  productId?: string;
  clauseId?: string;
  market?: MarketCode;
  likelihood: 1 | 2 | 3 | 4 | 5;
  impact: 1 | 2 | 3 | 4 | 5;
  owner: string;
  mitigation: string;
  contingency: string;
  dueDate: string;
  status: "open" | "mitigating" | "closed" | "accepted";
  decisionNeededBy?: string;
}

export type DecisionCriterionKey = "marketAccess" | "cost" | "schedule" | "design" | "confidence";

export interface DecisionCriterion {
  key: DecisionCriterionKey;
  label: string;
  weight: number;
}

export interface DecisionOption {
  id: string;
  label: string;
  description: string;
  scores: Record<DecisionCriterionKey, number>;
  costUsd?: number;
  scheduleWeeks?: number;
  massGrams?: number;
  complianceEffect: string;
}

export interface Decision {
  id: string;
  title: string;
  productId: string;
  clauseId?: string;
  question: string;
  owner: string;
  decisionDate: string;
  options: DecisionOption[];
  recommendation: string;
  status: "pending" | "decided" | "deferred";
  whatWouldChange: string;
  dissent?: string;
}

export interface RegulatoryMilestone {
  id: string;
  instrumentId: string;
  title: string;
  stage:
    | "proposal"
    | "consultation"
    | "committee"
    | "adopted"
    | "scrutiny"
    | "published"
    | "application"
    | "standard";
  date: string;
  confidence: Confidence;
  impact: string;
  owner: Team;
  action: string;
  commentWindow?: string;
}

export interface DPPField {
  id: string;
  label: string;
  productGroup: string;
  legalBasis: string;
  accessTier: "public" | "repairer_recycler" | "authority";
  sourceSystem: string;
  owner: Team;
  status: "ready" | "supplier_gap" | "methodology_pending" | "not_yet_in_scope";
  mandatoryDate?: string;
  notes: string;
}

export interface Market {
  code: MarketCode;
  name: string;
  jurisdiction: Jurisdiction;
  authority: string;
  note: string;
}

export interface RepairabilityBreakdown {
  disassembly: number;
  fasteners: number;
  tools: number;
  spareParts: number;
  softwareUpdates: number;
  repairInfo: number;
}

export interface RepairabilityResult {
  index: number;
  euClass: "A" | "B" | "C" | "D" | "E" | "Not classified";
  breakdown: RepairabilityBreakdown;
  partScores: {
    key: PartKey;
    label: string;
    dd: number;
    f: number;
    t: number;
    weight: number;
  }[];
  france: {
    index: number;
    criteria: { label: string; score: number }[];
    illustrative: true;
  };
}

export interface ProductSummary {
  product: Product;
  assessments: Assessment[];
  blockers: number;
  atRisk: number;
  evidenceGaps: number;
  late: number;
  exposureUsd: ExposureRange;
  overall: OverallStatus;
  coverage: number;
}
