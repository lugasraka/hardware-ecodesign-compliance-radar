To stand out for Apple’s **Product Environmental Compliance Strategy EPM** role, the prototype should look and behave less like a generic sustainability dashboard and more like an **internal Hardware Compliance Program Management tool**. Its core job: translate shifting global regulations into **NPI build-gate deadlines**, **engineering team ownership**, and **VP-ready trade-off decisions**.

---

## 1. System Architecture

Because `raka-adrianto.com` is hosted on Vercel, a **static-first Next.js (App Router) + TypeScript** architecture with a deterministic rule engine is the cleanest choice—zero cold-start latency, instant interactive filtering for recruiters, and minimal hosting overhead.

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js + Tailwind + Recharts)             │
│  [1. Product Configurator]  [2. NPI Gate Gantt]  [3. DPP Schema Audit]  │
│  [4. Risk Register Matrix]  [5. Executive Brief Exporter (MD/PDF)]      │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────────────┐
│                DETERMINISTIC APPLICABILITY ENGINE (TypeScript)          │
│  Evaluates Hardware Specs (wattage, battery Wh, form factor, markets)   │
│  against Regulatory Rule Triggers → Outputs Clauses, Dates & Gaps       │
└───────────────┬───────────────────────────────────┬─────────────────────┘
                │                                   │
┌───────────────▼──────────────────┐  ┌─────────────▼─────────────────────┐
│   REGULATORY KNOWLEDGE BASE      │  │   AI POLICY ANALYST (Optional)    │
│   Versioned JSON / SQLite:       │  │   Serverless API Route (/api/sim) │
│   • Regulations & Effective Dates│  │   • Draft-clause impact summary   │
│   • Clause-to-Team Mappings      │  │   • Generates 1-page VP Decision  │
│   • CEN-CENELEC JTC 24 DPP Fields│  │     Brief (Trade-offs & Options)  │
└──────────────────────────────────┘  └───────────────────────────────────┘

```

* **Deterministic Core, AI Edge:** Keep regulatory applicability 100% deterministic (rule-based JSON/TypeScript logic) so there are zero hallucinations on legal dates or thresholds. Use an optional LLM API route *only* for synthesizing executive briefs or running "what-if" draft legislation stress tests.
* **Why This Architecture Wins with Apple EPMs:** It demonstrates systems thinking—separating *regulatory state* (laws and delegated acts) from *product metadata* (BOM/specs) and *program execution* (Proto → EVT → DVT → PVT milestones).

---

## 2. Core Data Model

Design the schema around five normalized entities. This structure mirrors how enterprise compliance PLM systems (like Arena, Agile, or custom internal tools) connect legal clauses to hardware engineering deliverables.

```typescript
// 1. Hardware Product Archetype (User selects or customizes)
interface ProductArchetype {
  id: string;                        // e.g., "laptop-14-pro", "power-adapter-140w"
  name: string;
  category: "smartphone" | "tablet" | "laptop" | "wearable" | "eps_charger";
  targetMarkets: ("EU" | "US_FED" | "US_CA" | "UK" | "CN")[];
  specs: {
    hasBattery: boolean;
    batteryRemovableByUser: boolean;
    batteryCyclesAt80Pct: number;    // e.g., 1000 cycles
    ipRating: string;                // e.g., "IP68"
    maxOutputPowerW?: number;        // Critical for EU 2025/2052 EPS scope
    usbPdAbove100W?: boolean;        // Triggers specific transition relief
    recycledAluminumPct: number;
    osSupportYears: number;
  };
  plannedLaunchDate: string;         // ISO date; drives NPI backward scheduling
}

// 2. Regulatory Instrument
interface Regulation {
  id: string;                        // e.g., "EU-2025-2052"
  jurisdiction: "EU" | "US_FED" | "US_CA";
  title: string;
  status: "Enforced" | "Adopted_Transition" | "Draft_Delegated_Act";
  enforcementDate: string;           // Hard EU market-placement date
  transitionNotes?: string;          // e.g., "USB-PD >100W relief until Dec 2030"
  standardsBodyRef?: string;         // e.g., "CEN-CENELEC JTC 24", "IEC TC 111"
  sourceUrl: string;
}

// 3. Atomic Requirement Clause (The core EPM tracking unit)
interface RequirementClause {
  id: string;
  regulationId: string;
  articleRef: string;                // e.g., "Art. 11" or "Annex II, Pt 1"
  summary: string;
  applicabilityRule: string;         // Declarative predicate on ProductArchetype
  owningTeams: (
    | "Mechanical_Eng"
    | "Battery_Eng"
    | "Electrical_Eng"
    | "Firmware_SW"
    | "Supply_Chain"
    | "Industrial_Design"
    | "Service_Ops"
    | "Legal_GovAffairs"
  )[];
  lockInGate: "Concept" | "Proto" | "EVT" | "DVT" | "PVT" | "Ramp";
  complianceStatusFn: (p: ProductArchetype) => "Pass" | "At_Risk" | "Fail";
  engineeringTradeoff: string;       // e.g., "Z-height +0.8mm or adhesive pull-tab redesign"
  severity: "Market_Access_Blocker" | "Labeling_Penalty" | "Monitoring";
}

// 4. Digital Product Passport (DPP) Readiness Field
interface DPPDataField {
  fieldId: string;                   // Aligned with ESPR / JTC 24 schema
  label: string;                     // e.g., "Carbon Footprint (kg CO2e/kWh)"
  accessTier: "Public_Consumer" | "Repairer_Recycler" | "Market_Surveillance";
  sourceSystem: "PLM_BOM" | "LCA_Model" | "ERP_Supplier" | "Firmware_Telemetry";
  mandatoryDate: string;
  dataAvailability: "Ready" | "Supplier_Gap" | "Methodology_Pending";
}

```

---

## 3. Key Features (Mapped to Apple EPM Competencies)

Build **four high-signal interactive views** on a single clean workspace rather than a sprawling multi-page site.

### Feature 1: Hardware Archetype & Regulatory Applicability Radar

* **What it does:** Users pick a realistic consumer hardware profile (e.g., *Flagship Smartphone*, *14-inch Laptop*, *140W USB-C Power Adapter*, *Smartwatch*) and toggle specs with live sliders (battery cycle life, IP rating, user-replaceability, output wattage, launch year).
* **What it outputs:** Instant pass/fail/at-risk pills across active and upcoming EU/US regulations, highlighting **Market Access Blockers** first.
* **Why it matters:** Shows you can turn ambiguous legal applicability rules (like the removal of the 250 W ceiling or USB-PD greater than 100 W exceptions under the new EU EPS rule) into exact engineering requirements.

### Feature 2: Backward-Scheduled NPI Build-Gate Timeline

* **What it does:** Takes the product’s `plannedLaunchDate` and plots a Gantt-style timeline working backward through **Mass Production ← PVT ← DVT ← EVT ← Proto ← Concept** alongside hard regulatory enforcement dates.
* **The killer detail:** Each compliance clause pins to its **engineering lock-in gate**. For example, if a product launches in Q4 2027, an Article 11 battery removability change locks at **Proto/EVT** (12–15 months before launch), whereas DPP QR-code laser etching and registry URI submission lock at **DVT/PVT**. If a regulatory deadline falls *before* the required lock-in gate, the timeline flags a **Schedule Collision Alert**.

### Feature 3: Digital Product Passport (DPP) & LCA Data Readiness Matrix

* **What it does:** Maps the required ESPR / Battery Passport attributes across the three official EU role-based access tiers (**Consumers**, **Repairers & Recyclers**, **Public Authorities**) and traces each field back to its internal enterprise source system (`PLM BOM`, `LCA / ecoinvent`, `Tier-1 Supplier Portal`, `Firmware`).
* **Why it matters:** Directly leverages your PhD and Siemens LCA background. It highlights real operational bottlenecks—such as distinguishing hard-date passport fields (due February 2027 for covered batteries) from conditional carbon footprint fields where implementing acts determine the exact start date.

### Feature 4: 1-Click "VP Decision Brief" Generator

* **What it does:** Takes the currently selected product’s **Fail / At-Risk** clauses and compiles a crisp, copy-ready **1-Page Executive Brief** structured into four sections:
1. *Regulatory Exposure & Market Access Risk*
2. *Affected Engineering Teams & NPI Lock-In Gates*
3. *Design / Cost / Schedule Trade-Off Options* (e.g., "Option A: Redesign battery adhesive for user replaceability vs. Option B: Qualify for high-endurance / IP68 exemption path")
4. *Recommended Executive Decision & External Advocacy Position* (e.g., technical input to CEN-CENELEC JTC 24 or trade associations)



---

## 4. Pre-Loaded Seed Dataset (Current as of Late 2026)

Pre-loading accurate, up-to-date 2026–2030 regulatory data is what separates a toy demo from an executive-grade prototype. Include these five core instruments:

| Regulation | Scope in Radar | Key Deadlines & Triggers (as of Nov 2026) | Key Engineering & Program Hooks |
| --- | --- | --- | --- |
| **EU 2023/1670** (Smartphones & Tablets Ecodesign) | Smartphones, Tablets | **Enforced** (since June 2025) | Battery endurance (800+ cycles at 80% capacity), IP rating, 7-year spare parts, 5+ years OS updates, repairability index. |
| **EU Battery Regulation (2023/1542)** | All battery-powered hardware | **Feb 18, 2027:** Art. 11 portable battery removability/replaceability & Art. 77 Battery Passport (EV/LMT/industrial greater than 2 kWh). **Conditional:** Art. 7 carbon footprint declarations follow delegated/implementing act timing. | Mechanical enclosure & adhesive design (Art. 11 exemptions for waterproof/high-endurance devices), primary supplier LCA data pipelines. |
| **EU EPS Regulation (2025/2052)** *(Replaces ErP Lot 7 / 2019/1782)* | External Power Supplies, Wireless Chargers, USB-C Cables | **Dec 14, 2028:** General application (early compliance open since Dec 2025). **Dec 14, 2030:** Relief window for USB-PD greater than 100 W efficiency rules. | **No 250 W ceiling**—high-wattage laptop bricks are now in scope; wireless chargers & USB-C cables require separate assessments. |
| **EU ESPR (2024/1781) & DPP Registry** | Laptops, Displays, Intermediate Materials (Aluminum/Steel) | **July 20, 2026:** EU DPP Registry operational. **July & Nov 2026:** CEN-CENELEC JTC 24 harmonised DPP standards decisions. **2027–2029:** Delegated acts for Aluminum (2027) and ICT/Electronics (2028–2029). | Decentralized URI registration, role-based access control, QR/NFC data carrier integration, recycled aluminum tracking. |
| **US DOE EPS & CEC Title 20 / ENERGY STAR** | Chargers, Laptops, Displays | **Active / Ongoing revisions** | Active-mode efficiency, no-load power draw, test-lab conformity certification before US customs import. |

---

## 5. Fast-Track Build Plan (2 Weekends)

1. **Weekend 1 — Data & Rule Engine:** Write the TypeScript interfaces and populate `regulations.json` with the five instruments above and four hardware archetypes. Unit-test the applicability predicates (e.g., verify that toggling a charger from 96 W to 140 W triggers the EU 2025/2052 USB-PD greater than 100 W transition clause).
2. **Weekend 2 — UI, NPI Gantt & Executive Brief:** Build the responsive dashboard in Next.js + Tailwind + Recharts/custom SVG Gantt, add the 1-click Markdown/PDF Executive Brief export, and deploy to `[raka-adrianto.com/compliance-radar](https://raka-adrianto.com/compliance-radar)` (or a dedicated subdomain) with a short **"Methodology & EPM Design Rationale"** modal explaining *why* you structured compliance around NPI lock-in gates.