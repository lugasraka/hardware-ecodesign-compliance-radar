export interface RegulatorySource {
  id: string;
  label: string;
  url: string;
  checkUrl?: string;
  instrumentId?: string;
  kind: "html" | "json";
  check: "http" | "manual";
  note?: string;
}

// EUR-Lex blocks automated clients with HTTP 202 and an empty body on its
// human-facing ELI pages. The four EUR-Lex instruments use the Publications
// Office Cellar representation of the same CELEX act for the weekly check;
// `url` remains the page reviewers should open.
export const regulatorySources: RegulatorySource[] = [
  {
    id: "eu-2023-1670",
    label: "EUR-Lex: EU 2023/1670 smartphones and tablets",
    url: "https://eur-lex.europa.eu/eli/reg/2023/1670/oj/eng",
    checkUrl: "https://publications.europa.eu/resource/celex/32023R1670",
    instrumentId: "eu-2023-1670",
    kind: "html",
    check: "http",
  },
  {
    id: "eu-2023-1542",
    label: "EUR-Lex: EU 2023/1542 Batteries Regulation",
    url: "https://eur-lex.europa.eu/eli/reg/2023/1542/oj/eng",
    checkUrl: "https://publications.europa.eu/resource/celex/32023R1542",
    instrumentId: "eu-2023-1542",
    kind: "html",
    check: "http",
  },
  {
    id: "eu-2025-2052",
    label: "EUR-Lex: EU 2025/2052 external power supplies",
    url: "https://eur-lex.europa.eu/eli/reg/2025/2052/oj/eng",
    checkUrl: "https://publications.europa.eu/resource/celex/32025R2052",
    instrumentId: "eu-2025-2052",
    kind: "html",
    check: "http",
  },
  {
    id: "eu-2024-1781",
    label: "EUR-Lex: EU 2024/1781 ESPR",
    url: "https://eur-lex.europa.eu/eli/reg/2024/1781/oj/eng",
    checkUrl: "https://publications.europa.eu/resource/celex/32024R1781",
    instrumentId: "eu-2024-1781",
    kind: "html",
    check: "http",
  },
  {
    id: "eu-dpp-registry",
    label: "European Commission: Digital Product Passport",
    url: "https://single-market-economy.ec.europa.eu/single-market/digital-product-passport_en",
    instrumentId: "eu-2024-1781",
    kind: "html",
    check: "http",
  },
  {
    id: "us-federal-register-eps",
    label: "Federal Register: Department of Energy external power supplies",
    url: "https://www.federalregister.gov/api/v1/documents.json?conditions%5Bagencies%5D%5B%5D=energy-department&conditions%5Bterm%5D=%22external%20power%20supplies%22&per_page=5&order=newest",
    instrumentId: "us-doe-eps",
    kind: "json",
    check: "http",
  },
  {
    id: "us-ca-sb244",
    label: "California: SB 244 right to repair",
    url: "https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202320240SB244",
    instrumentId: "us-ca-right-to-repair",
    kind: "html",
    check: "manual",
    note: "The legislature portal blocks automated requests. Check the bill text in a browser.",
  },
  {
    id: "india-cpcb-ewaste",
    label: "CPCB: e-waste rules",
    url: "https://cpcb.nic.in/e-waste/",
    instrumentId: "india-e-waste",
    kind: "html",
    check: "manual",
    note: "The CPCB site is not reliably reachable. Check the rules in a browser.",
  },
];
