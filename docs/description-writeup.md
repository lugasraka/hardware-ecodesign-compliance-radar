## 1. Portfolio Hero & Card Copy (Above the Fold)

**Project Title:** Hardware Ecodesign & DPP Compliance Radar

**Subtitle:** Translating global environmental legislation into NPI build-gate deadlines, cross-functional engineering ownership, and executive trade-off decisions.

**Tags:** `Product Environmental Compliance` · `Hardware NPI` · `EU ESPR & DPP` · `TypeScript / Next.js` · `Program Strategy`

**Overview:**

Hardware teams rarely fail compliance because they ignore the law—they fail because regulatory applicability is discovered *after* mechanical enclosures, battery architectures, or supplier BOMs are already frozen. The **Hardware Ecodesign & DPP Compliance Radar** is an interactive compliance program management prototype that maps global ecodesign and energy efficiency mandates directly to hardware specifications, NPI lock-in gates (Proto through PVT), and Digital Product Passport (DPP) data pipelines.

**Core Capabilities:**

* **Deterministic Applicability Engine:** Evaluates hardware specs (wattage, battery endurance, ingress protection, form factor, and target markets) against active and upcoming EU/US regulatory triggers without LLM hallucination risk.
* **NPI Backward-Scheduling Gantt:** Pins statutory clauses to their true engineering lock-in gates, surfacing schedule collisions months before hardware tooling freeze.
* **VP Decision Brief Generator:** Compiles regulatory exposure, engineering trade-offs, and external advocacy options into a standardized 1-page executive brief.

---

## 2. Executive Case Study (Main Project Page)

### The Programmatic Challenge

Consumer and industrial electronics face an unprecedented convergence of upstream hardware mandates—spanning the **EU Ecodesign for Sustainable Products Regulation (ESPR 2024/1781)** [cite: 1.1.3], **EU Battery Regulation (2023/1542)** [cite: 1.2.1], **EU External Power Supply Regulation (2025/2052)** [cite: 1.3.1], and US DOE/CEC energy efficiency standards.

In most organizations, compliance tracking lives in static legal memos and disconnected spreadsheets. Legal teams track enforcement dates, while Hardware Engineering, Supply Chain, and Firmware teams operate on compressed New Product Introduction (NPI) build gates. That disconnect creates three recurring failures:

1. **Late Architectural Churn:** Discovering a battery removability or efficiency threshold at DVT instead of Proto forces costly enclosure redesigns or launch delays.
2. **Fragmented Ownership:** Single clauses—such as battery endurance or Digital Product Passport readiness—span Mechanical, Battery, Firmware, Service Operations, and Tier-1 suppliers simultaneously.
3. **Unquantified Leadership Decisions:** Executives receive dense regulatory summaries rather than structured trade-off options weighing compliance cost, design impact, and market access risk.

### The Solution

Built as a lightweight, zero-latency web application, the Compliance Radar models regulatory strategy the way an Engineering Program Manager runs a hardware program:

* **Product-First Configuration:** Select a hardware archetype (flagship smartphone, laptop, wearable, or high-wattage USB-C power adapter) and adjust technical parameters to immediately isolate **Market Access Blockers** versus monitoring items.
* **Gate-Anchored Roadmapping:** Automatically calculates backward from a target launch date to map every applicable clause to its decision gate (`Concept`, `Proto`, `EVT`, `DVT`, `PVT`, `Ramp`).
* **DPP & LCA Data Lineage:** Audits required Digital Product Passport attributes across official role-based access tiers and traces each field to its enterprise system of record (`PLM BOM`, `LCA / ecoinvent`, `Supplier Portal`, or `Firmware`).

---

## 3. Methodology & EPM Design Rationale

*(Designed for a collapsible "Methodology" drawer or dedicated `/methodology` tab on `raka-adrianto.com`)*

### 1. Separating Legal State from Engineering Execution

The underlying data architecture decouples **regulatory instruments** (laws, delegated acts, transition windows) from **hardware metadata** and **program milestones**. Regulatory applicability is executed through deterministic TypeScript predicates rather than generative AI, ensuring auditability on hard statutory dates and technical thresholds. Optional AI synthesis is restricted strictly to executive summarization and "what-if" draft legislation stress testing.

### 2. Backward Scheduling Against NPI Lock-In Gates

A statutory enforcement date is rarely the true engineering deadline. For example, under **EU Battery Regulation (2023/1542)**, Article 11 portable battery removability and replaceability requirements apply from February 18, 2027—meaning mechanical enclosure geometry, adhesive strategies, or exemption qualification (such as wet-environment criteria) must lock at **Proto/EVT** well over a year prior. Similarly, **EU 2025/2052** expands ecodesign scope across external power supplies, wireless chargers, wireless charging pads, and USB Type-C cables, requiring early electrical architecture alignment across accessory roadmaps [cite: 1.3.1]. The Radar flags a **Schedule Collision Alert** whenever a statutory deadline outpaces a product's engineering lock-in window.

### 3. Interoperable Digital Product Passport (DPP) Architecture

Following the July 20, 2026 launch of the **EU Digital Product Passport Registry**, compliance is no longer just a hardware design problem—it is an enterprise data architecture problem. The Radar's DPP Readiness Matrix mirrors the hybrid framework established under **ESPR (EU 2024/1781)** and **CEN-CLC/JTC 24** standards: unique product identifiers are registered centrally with the European Commission Registry, while operational product and lifecycle data remain hosted by economic operators or third-party service providers. Each attribute is mapped across the three statutory access tiers—**Consumers**, **Repairers & Recyclers**, and **Public Authorities**—and linked to its internal LCA and BOM data owners [cite: 1.1.3].

### 4. Decision-Ready Executive Framing

Senior hardware leaders do not need a 40-page statutory brief; they need a clear decision framework. The Radar's **1-Click VP Decision Brief** structures every flagged risk into four EPM-standard blocks:

1. **Exposure & Market Access Impact:** Which SKUs, geographies, and revenue windows are at risk.
2. **Cross-Functional Ownership & Gate Lock:** Which engineering leads own the deliverable and by which build gate.
3. **Structured Trade-Off Options:** Explicit comparison of engineering redesign, exemption pathways, or SKU segmentation (cost, Z-height/mass, schedule impact).
4. **Recommended Path & External Engagement:** Proposed executive sign-off paired with targeted technical engagement in standards bodies (e.g., CEN-CLC/JTC 24 or IEC TC 111) where draft rules remain malleable [cite: 1.1.1].

---

## 4. Technical Stack & Positioning Metadata

| Dimension | Implementation Detail | Signal to Apple EPM Hiring Managers |
| --- | --- | --- |
| **Frontend & Hosting** | Next.js (App Router), TypeScript, Tailwind CSS, Recharts, Vercel | Demonstrates ability to independently architect and ship scalable internal compliance tools. |
| **Rule Engine** | Deterministic JSON schema + unit-tested TypeScript applicability predicates | Proves rigor, zero-hallucination precision, and maintainable systems thinking. |
| **Regulatory Scope** | EU ESPR (2024/1781) [cite: 1.1.3], EU Battery Reg (2023/1542) [cite: 1.2.1], EU EPS (2025/2052) [cite: 1.3.1], EU 2023/1670, US DOE/CEC | Shows immediate domain fluency in consumer electronics ecodesign and energy efficiency. |
| **Program Artifact** | Backward-scheduled NPI Gantt + 1-page VP Decision Brief export | Mirrors the exact daily deliverables of a Product Environmental Compliance Strategy EPM. |