import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const base = "http://localhost:3000";
const outDir = "docs/screenshots";
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const desktop = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 1,
});

const pages = [
  ["portfolio", "/"],
  ["product-hero", "/products/phone-orbit-2028/"],
  ["brief", "/brief/phone-orbit-2028/"],
  ["risks", "/risks/"],
  ["pipeline", "/pipeline/"],
  ["methodology", "/methodology/"],
];

for (const [name, path] of pages) {
  await desktop.goto(`${base}${path}`, { waitUntil: "networkidle" });
  await desktop.screenshot({ path: `${outDir}/${name}.png` });
  console.log(`captured ${name}`);
}

await desktop.goto(`${base}/products/phone-orbit-2028/`, {
  waitUntil: "networkidle",
});
await desktop.getByText("Selected clause", { exact: true }).scrollIntoViewIfNeeded();
await desktop.screenshot({ path: `${outDir}/product-detail.png` });
await desktop.locator("#schedule").scrollIntoViewIfNeeded();
await desktop.screenshot({ path: `${outDir}/product-schedule.png` });
await desktop.locator("#repairability").scrollIntoViewIfNeeded();
await desktop.screenshot({ path: `${outDir}/product-repairability.png` });
console.log("captured product detail, schedule and repairability");

const mobile = await browser.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 1,
});
await mobile.goto(`${base}/`, { waitUntil: "networkidle" });
await mobile.screenshot({ path: `${outDir}/portfolio-mobile.png`, fullPage: true });
console.log("captured mobile");

const print = await browser.newPage({
  viewport: { width: 794, height: 1123 },
  deviceScaleFactor: 1,
});
await print.goto(`${base}/brief/phone-orbit-2028/`, { waitUntil: "networkidle" });
await print.emulateMedia({ media: "print" });
await print.screenshot({ path: `${outDir}/brief-print.png`, fullPage: true });
console.log("captured print brief");

await browser.close();
