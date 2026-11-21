# Case-study notes

## One-liner

A portfolio-level compliance workbench that turns ecodesign law into NPI gate decisions, owner assignments, and executive trade-offs.

## Who it is for

Product environmental compliance teams at electronics and hardware companies, including Apple, Amazon, Samsung, Siemens, and similar OEMs. The product set covers consumer devices, accessories, and industrial hardware.

## The problem

Hardware teams often discover regulatory applicability after the enclosure, battery, or BOM is frozen. A battery removability rule found at DVT can force an enclosure redesign. A Digital Product Passport field can sit with no owner. A VP review can arrive without a costed option.

Most compliance tools reduce this to a pass/fail status. That hides the work. The workbench keeps four things separate:

- Applicability: does the clause apply to this product and market?
- Conformity: does the product meet the technical test?
- Evidence: is there a test report, declaration, certificate, or registry entry?
- Program status: is the decision on track, inside 90 days, or late?

The product page opens on a summary. The full 36-row ledger is one click away. The ledger defaults to blockers and at-risk items. Legal text and predicate traces are one click away. The reader can start with the decision and go deeper only when needed.

## The approach

- Portfolio-first. The home view shows which products have market-access blockers, which decisions are due, and where the revenue exposure sits.
- Deterministic core. Regulatory applicability is a typed predicate tree with three-valued logic. Missing data returns "unknown", not "false".
- Gate scheduling. Every clause is pinned to a lock-in gate. The required-by date is the gate date minus qualification lead time and decision buffer.
- Evidence as a first-class field. A product can meet the technical test and still be at risk because the test report is missing.
- Decision artifacts. The risk register, decision log, and one-page brief use the same findings, so the numbers agree.
- Guided layer. A three-minute tour and a live what-if panel let a first-time reader see the model work before opening the full ledger.

## The hero scenario

**Orbit 2028 flagship, EU launch, Battery Regulation Article 11.**

- Article 11 applies from 18 February 2027.
- The EVT gate is 15 September 2027.
- With 24 weeks of qualification lead time and a 6-week buffer, the decision is due 17 February 2027.
- The battery is 1,000-cycle, IP68, and professional-serviceable, but not user-removable.
- The wet-environment and wearable derogations do not fit a handheld smartphone.
- The app marks the decision "Act now" and generates the VP brief.

The brief compares four options: a user-removable battery, a professional-only derogation, a EU launch delay, and a legal challenge. It recommends the removable battery, states what would change that recommendation, and records the dissent.

## What the app demonstrates

| Area | Evidence in the project |
|---|---|
| Regulatory scope | 13 instruments and 36 clauses across EU, French, and US regimes, with sources and last-verified dates |
| Program management | NPI Gantt, risk register, decision log, required-by dates, owners, and gates |
| Repairability | EU 2023/1669 repairability class, part-level inputs, design levers, and a separate France laptop model |
| Engineering | Typed predicates, tri-state evaluation, traceable results, 70 tests, data validation, CI, and a static build |
| Executive communication | One-page print/PDF summary plus a full web brief with the ask, weighted options, recommendation, dissent, and owners |
| Influence | Regulatory pipeline with consultations, delegated acts, standards, and advocacy positions |
| Product design | Portfolio-first home, tabbed workspace, guided tour, and a live what-if panel |

## Design decisions

**Portfolio-first, not product-first.** The job is to manage a portfolio, so the home view rolls up blockers, decisions, and exposure. The product view is the drill-down.

**Deterministic core, no LLM.** A language model can draft narrative once the facts are structured. It cannot be trusted with a statutory date or a threshold. The deterministic core needs structured data, and that is the trade-off.

**Evidence separate from conformity.** A product can pass the technical test and still lack the artifact that proves it. The app shows both.

**Static export.** No database, no API keys, no server runtime. The what-if panel re-runs the pure engine in the browser. The demo runs on any static host.

**Generic gate model.** The offsets are illustrative and overridable. Real OEM gates vary by program. The model shows the method, not a claim about a specific company's process.

## What I chose not to model

- A live regulatory feed and a human review workflow.
- A PLM, BOM, supplier portal, LCA model, EPREL, SCIP, or DPP registry connection.
- Auth, roles, assignments, notifications, approvals, or an audit log.
- Lab capacity and resource planning.
- SKU segmentation and harmonisation analysis.

These are the next layer. The prototype shows the shape of the data and the decisions they would support.

## Limitations

- Product and program data are illustrative. They do not come from a specific company.
- Regulatory data is a curated snapshot. It is not legal advice.
- The France laptop score is illustrative until the category arrêté is encoded.
- US and India data are lower-confidence and labelled.
- The demo date is fixed at 20 November 2026 to keep the example stable.

## Reference

- [Architecture notes](ed-radar-architecture.md)
- [Regulatory sources](sources.md)
- [Original role research](reference/job-ad.md): kept for context. The app is vendor-neutral.
