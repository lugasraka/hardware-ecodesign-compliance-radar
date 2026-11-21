# Architecture notes

## What this is

A static-first Next.js workbench for product environmental compliance. It maps regulations to hardware specs, NPI gates, owners, evidence, and decisions. The app is built for electronics and hardware product teams at companies such as Apple, Amazon, Samsung, Siemens, and similar OEMs.

## Layers

| Layer | Responsibility |
|---|---|
| Data | Instruments, clauses, products, risks, decisions, milestones, and DPP fields |
| Domain | Types, typed predicates, tri-state evaluation, assessment engine, scheduling, repairability scoring, and brief generation |
| UI | App Router pages, server-rendered initial data, and client components for filters, tabs, the guided tour, and the what-if panel |
| Validation | A data script checks IDs, sources, owners, gates, evidence, references, and the hero scenarios |
| Hosting | Static export to `out/`, deployed on Vercel |

The domain layer has no React or Next.js imports. It can run in a server component during the build, in the browser for the what-if panel, or in a test without changes.

## Deterministic engine

Regulatory applicability is a typed predicate tree, not a string or a prompt. The engine evaluates it with three-valued logic:

```ts
type Tri = true | false | "unknown";

type Predicate =
  | { op: "gte"; field: "product.battery.cyclesTo80Pct"; value: 800 }
  | { op: "in"; field: "product.category"; values: ["smartphone", "tablet"] }
  | { op: "and"; all: Predicate[] }
  | { op: "or"; any: Predicate[] }
  | { op: "not"; not: Predicate };
```

Missing data returns `"unknown"`. It does not become `false`, and it does not become "not applicable". That distinction matters because a missing battery-cycle value and a battery that fails the threshold require different actions.

Each assessment keeps four fields separate:

- Applicability: does the clause apply to this product and market?
- Conformity: does the product meet the technical test?
- Evidence: is there a test report, declaration, certificate, or registry entry?
- Program status: is the decision on track, inside 90 days, or late?

Every result carries a trace with the predicate branch, the actual value, and the expected value. The tests assert the trace as well as the final color.

No LLM sits in the compliance path. A language model can draft narrative once the facts are structured. It cannot be trusted with a statutory date or a threshold.

## Scheduling

The model works backward from the lock-in gate:

```text
requiredBy = gateDate(lockInGate)
           − qualificationLeadWeeks
           − decisionBufferWeeks

late = requiredBy < asOf
atRisk = requiredBy − asOf < 90 days
```

The default gate offsets are illustrative: Concept 24 months before launch, Proto 18, EVT 12, DVT 8, PVT 4, MP 1. A product can override them. The model also checks whether the rule applies at all. If the product leaves the market before the application date, the clause may never bind. If the application date falls inside the sales window, it binds mid-life. The product record therefore includes an end-of-sale date as well as a launch date.

## Repairability

For smartphones and tablets, the engine implements the EU repairability index from Delegated Regulation (EU) 2023/1669:

```text
R = 0.25·S_DD + 0.15·S_F + 0.15·S_T
  + 0.15·S_SP + 0.15·S_SU + 0.15·S_RI

A ≥ 4.00 · B ≥ 3.35 · C ≥ 2.55 · D ≥ 1.75 · E ≥ 1.00
```

The scoring module encodes the part weights, disassembly bands, fastener scores, tool scores, spare-parts levels, update-duration score, and repair-information score. The France laptop score is a separate, illustrative five-criteria model until the category arrêté is encoded.

## Core entities

| Entity | Purpose |
|---|---|
| `Product` | Capabilities, specs, markets, launch date, end of sale, gate plan, repairability inputs |
| `Instrument` | Regulation, directive, delegated act, standard, or voluntary program, with source and status |
| `Clause` | Article, legal text, interpretation, predicate, exemptions, owner, gate, lead time, evidence |
| `Assessment` | Product, market, clause, as-of date, applicability, conformity, evidence, program status, trace |
| `Evidence` | Test report, declaration, certificate, label artwork, or registry entry |
| `Risk` / `Decision` | Program risk, mitigation, weighted options, recommendation, dissent |
| `RegulatoryMilestone` | Consultation, delegated act, standard, application date, advocacy action |
| `DPPField` | Provisional data field, access tier, source system, owner, readiness |

## Design choices

- Static export. No database, no API keys, no server runtime. The demo runs on any static host.
- Client-side what-if. The product workspace applies overrides, re-runs the pure engine, and updates the summary without a page reload.
- URL hash tabs. The product tabs and the guided tour use hashes so the views are linkable and the tour can open a tab or the customizer.
- Native `<details>` for the methodology. The page stays short until the reader asks for depth.
- Fixed demo date. The snapshot is pinned to 20 November 2026 so the example does not rot.

## Limits

The app is a prototype. It does not connect to a PLM, BOM, supplier portal, LCA model, EPREL, SCIP, or DPP registry. It has no auth, workflow, notifications, or audit log. Product and program data are illustrative. Regulatory data is a curated snapshot and is not legal advice.
