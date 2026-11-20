import type { Market } from "@/domain/types";

export const markets: Market[] = [
  {
    code: "EU",
    name: "European Union",
    jurisdiction: "EU",
    authority: "European Commission and national market surveillance authorities",
    note: "France-specific requirements are modeled as a sub-market of the EU.",
  },
  {
    code: "US-FED",
    name: "United States (federal)",
    jurisdiction: "US-FED",
    authority: "US Department of Energy, FTC, EPA",
    note: "Federal energy and labelling requirements; state laws can be stricter.",
  },
  {
    code: "US-CA",
    name: "California",
    jurisdiction: "US-CA",
    authority: "California Energy Commission, Attorney General",
    note: "State right-to-repair and energy rules.",
  },
  {
    code: "US-OR",
    name: "Oregon",
    jurisdiction: "US-OR",
    authority: "Oregon Department of Justice, DCBS",
    note: "Right-to-repair and parts-pairing restrictions.",
  },
  {
    code: "UK",
    name: "United Kingdom",
    jurisdiction: "UK",
    authority: "Office for Product Safety and Standards, DESNZ",
    note: "Post-Brexit divergence; monitoring only in this prototype.",
  },
  {
    code: "IN",
    name: "India",
    jurisdiction: "IN",
    authority: "CPCB, MeitY",
    note: "E-waste EPR monitoring; lower data confidence in this prototype.",
  },
];

export const marketByCode = new Map(markets.map((market) => [market.code, market]));
