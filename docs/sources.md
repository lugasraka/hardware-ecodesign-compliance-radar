# Regulatory sources

**Last verified:** 20 November 2026

This is a curated snapshot for a portfolio prototype, not a live regulatory feed and not legal advice. Each instrument below has an official source; each clause in `src/data/clauses.ts` carries a source URL and a last-verified date.

## Core instruments

| Instrument | Jurisdiction | Applies from | Source | Confidence |
|---|---|---|---|---|
| Regulation (EU) 2023/1670 — smartphones, mobile phones, cordless phones, slate tablets | EU | 20 Jun 2025 | [EUR-Lex](https://eur-lex.europa.eu/eli/reg/2023/1670/oj/eng) | High |
| Regulation (EU) 2023/1542 — Batteries Regulation | EU | 18 Feb 2027 (Art. 11, Art. 77) | [EUR-Lex](https://eur-lex.europa.eu/eli/reg/2023/1542/oj/eng) | High |
| Regulation (EU) 2025/2052 — external power supplies, wireless chargers, USB-C cables | EU | 14 Dec 2028; transitions to 2030 and 2033 | [EUR-Lex](https://eur-lex.europa.eu/eli/reg/2025/2052/oj/eng) | High |
| Delegated Regulation (EU) 2023/1669 — smartphone/tablet energy labelling | EU | 20 Jun 2025 | [EUR-Lex](https://eur-lex.europa.eu/eli/reg_del/2023/1669/oj/eng) | High |
| Regulation (EU) 2024/1781 — ESPR and Digital Product Passport | EU | Registry operational 20 Jul 2026; product acts delegated | [EUR-Lex](https://eur-lex.europa.eu/eli/reg/2024/1781/oj/eng) | High |
| Regulation (EU) 2019/2021 — electronic displays | EU | 1 Mar 2021 | [EUR-Lex](https://eur-lex.europa.eu/eli/reg/2019/2021/oj/eng) | High |
| Regulation (EU) 617/2013 — computers and computer servers | EU | 1 Jul 2013 | [EUR-Lex](https://eur-lex.europa.eu/eli/reg/2013/617/oj/eng) | High |
| French repairability index | France | 1 Jan 2021 | [Service-Public Entreprendre](https://entreprendre.service-public.gouv.fr/vosdroits/F38092) | High |
| California Right to Repair Act (SB 244) | US-CA | 1 Jul 2024 | [California Legislature](https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202320240SB244) | High |
| Oregon right-to-repair law (SB 1596) | US-OR | 1 Jan 2025 | [Oregon Legislature](https://olis.oregonlegislature.gov/liz/2024R1/Downloads/MeasureDocument/SB1596) | Medium |
| US DOE / CEC external power supply standards | US-FED | In force | [eCFR 10 CFR 430](https://www.ecfr.gov/current/title-10/chapter-II/subchapter-D/part-430) | Medium |
| ENERGY STAR | US-FED | In force (voluntary) | [ENERGY STAR](https://www.energystar.gov/products) | High |
| India E-Waste (Management) Rules / EPR | India | 1 Apr 2023 | [CPCB](https://cpcb.nic.in/e-waste/) | Low (monitoring only) |

## Scope corrections

### Battery Passport

Article 77(1) of Regulation (EU) 2023/1542 requires a battery passport for each LMT battery, each industrial battery above 2 kWh, and each EV battery placed on the market or put into service from 18 February 2027. Portable batteries — phones, laptops, earbuds — are outside Article 77. A smartphone should not be modeled as requiring a battery passport.

Supporting sources:

- [European Commission — Guidance to support preparations for the Digital Batteries Passport](https://single-market-economy.ec.europa.eu/news/guidance-support-preparations-digital-batteries-passport-2026-08-21_en)
- [European Commission — Digital Product Passport FAQ for Batteries](https://single-market-economy.ec.europa.eu/single-market/digital-product-passport/eu-digital-product-passport-faq-batteries_en)

### Article 11 derogations

Article 11(1) applies from 18 February 2027. The Article 11(2) derogations are narrow, evidence-based, and only where necessary for safety. The 2026 delegated act on derogations (C(2026) 5031; OJ 2026/1770) updated the list. The Commission guidelines (2026/C/5531) clarify that an IP rating alone is not sufficient to establish a wet-environment derogation.

Supporting sources:

- [Commission guidelines on Article 11 removability and replaceability](https://eur-lex.europa.eu/eli/C/2026/5531/oj/eng)
- [Commission delegated regulation on Article 11(2) derogations](https://environment.ec.europa.eu/document/download/0e738cbb-581d-42c3-bbad-83e91c066a55_en)

### EU repairability class vs French index

Delegated Regulation (EU) 2023/1669 establishes the repairability class A–E for smartphones and slate tablets. The French national repairability index remains a separate instrument and still applies to laptops and other categories. For smartphones, the EU energy label has replaced the French index. Directive (EU) 2024/825 requires a “reparability score” where applicable from 27 September 2026, but only the EU harmonised score qualifies.

Supporting sources:

- [Delegated Regulation (EU) 2023/1669](https://eur-lex.europa.eu/eli/reg_del/2023/1669/oj/eng)
- [French Service-Public — indices de durabilité et de réparabilité](https://entreprendre.service-public.gouv.fr/vosdroits/F38092)

### ESPR DPP timeline

The DPP Registry became operational on 20 July 2026. Six DPP standards were cited in July 2026; the remaining two were expected in November 2026. The Commission’s indicative timeline places the ICT product delegated act in 2029, with an approximately 18-month transition after adoption.

Supporting sources:

- [European Commission — Digital Product Passport](https://single-market-economy.ec.europa.eu/single-market/digital-product-passport_en)
- [European Commission — DPP Registry is now live](https://single-market-economy.ec.europa.eu/news/digital-product-passport-registry-now-live-2026-07-20_en)
- [Commission Implementing Regulation (EU) 2026/1778](https://eur-lex.europa.eu/eli/reg_impl/2026/1778/oj/eng)

### EU 2025/2052 dates

- Early compliance: 14 December 2025
- General application: 14 December 2028
- USB-PD above 100 W efficiency transition: until 14 December 2030
- Spare-part EPS: until 14 December 2033
- Regulation (EU) 2019/1782 repealed from 14 December 2028

The >100 W interoperability exemption is permanent and separate from the efficiency transition. The new regulation has no 250 W ceiling.

### 2023/1670 battery availability path

The 500-cycle/83% retention, 1,000-cycle/80% endurance, and IP67 conditions form a conjunction for the professional-repairer-only battery availability path. They are not alternatives to the 800-cycle/80% design requirement. The design requirement for dust/water is IP44-level, not IP68.

## Verification status

The dataset was checked against the official sources above on 20 November 2026. Before using any of this in a real compliance decision:

1. Read the consolidated legal text and any implementing/delegated acts.
2. Confirm the product’s market-placement date and sales window.
3. Confirm the applicable harmonised standards and test methods.
4. Have Legal review the interpretation and evidence sufficiency.
5. Do not treat the illustrative product data or exposure model as a financial forecast.
