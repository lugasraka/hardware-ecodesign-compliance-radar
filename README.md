# Hardware Ecodesign Compliance Radar

A portfolio-level compliance workbench for hardware NPI. It turns ecodesign, battery, energy-efficiency, and repairability requirements into product-level assessments, NPI gate deadlines, owners, and executive decisions.

**Live demo:** https://hardware-ecodesign-compliance-radar.vercel.app/

![Portfolio review](docs/screenshots/portfolio.png)

## Who it is for

Built for product environmental compliance teams at electronics and hardware companies, including Apple, Amazon, Samsung, Siemens, and similar OEMs. The product set covers consumer devices, accessories, and industrial hardware.

## What it does

- Evaluates hardware specs against 36 clauses across EU, French, and US regimes, with India and the UK tracked as monitoring items.
- Pins each requirement to an NPI lock-in gate and computes the required-by date from qualification lead time and decision buffer.
- Separates applicability, technical conformity, evidence, and program timing, so "unknown" and "evidence missing" stay visible.
- Computes the EU smartphone and tablet repairability class from the official 2023/1669 formula.
- Generates a print-ready one-page executive decision brief with a weighted options matrix.
- Includes a three-minute guided tour and a live what-if panel for product changes.

## Hero scenario

The 2028 flagship is professional-serviceable, 1,000-cycle, and IP68, but not user-removable. EU Battery Regulation Article 11 applies from 18 February 2027. The EVT gate is 15 September 2027, and the decision is due 17 February 2027. The app flags the collision, evaluates the derogation paths, and generates the VP brief.

## Stack

Next.js (App Router), TypeScript, Tailwind CSS, static export. No database, no API keys, no LLM in the compliance path.

## Run locally

```powershell
npm install
npm run dev
```

Open http://localhost:3000.

## Quality checks

```powershell
npm run check
```

Runs typecheck, lint, tests, regulatory data validation, and a production build.

## Keeping data current

Regulatory data is a curated snapshot. A weekly source check watches the official pages. When a source changes, it opens a pull request with a candidate. A human reviews the official text, updates the clause, and records the change. The app shows the last verified date and the review queue.

- [Update runbook](docs/regulatory-update-runbook.md)
- [Data changelog](https://hardware-ecodesign-compliance-radar.vercel.app/changelog/)

## Deploy

The app is live at https://hardware-ecodesign-compliance-radar.vercel.app/. The repo is connected to Vercel. For a new environment, import the repo into Vercel. Use the Next.js preset, build with `npm run build`, and output `out`. No environment variables are required.

## Documentation

- [Detailed project overview](docs/project-overview.md)
- [Regulatory sources and scope corrections](docs/sources.md)
- [Regulatory update runbook](docs/regulatory-update-runbook.md)
- [Original architecture notes](docs/ed-radar-architecture.md)
- [Case-study draft](docs/description-writeup.md)

## Disclaimer

Product and program data are illustrative. Regulatory data is a curated snapshot last verified on 20 November 2026. Not legal advice. Not affiliated with any hardware manufacturer.

## License

MIT. See [LICENSE](LICENSE).
