import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const base = process.env.PREVIEW_URL ?? "http://localhost:3001";
const outDir = "docs/screenshots";
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const desktop = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 1,
});

await desktop.goto(`${base}/`, { waitUntil: "networkidle" });
await desktop.screenshot({ path: `${outDir}/portfolio.png` });
console.log("portfolio");

await desktop.goto(`${base}/products/phone-orbit-2028/`, {
  waitUntil: "networkidle",
});
await desktop.screenshot({ path: `${outDir}/product-hero.png` });
console.log("product summary");

await desktop.getByRole("button", { name: "Requirements", exact: true }).click();
await desktop.waitForTimeout(250);
await desktop.screenshot({ path: `${outDir}/product-requirements.png` });
await desktop.getByText("Selected clause", { exact: true }).scrollIntoViewIfNeeded();
await desktop.screenshot({ path: `${outDir}/product-detail.png` });
console.log("requirements + detail");

await desktop.getByRole("button", { name: "Schedule", exact: true }).click();
await desktop.evaluate(() => window.scrollTo(0, 0));
await desktop.waitForTimeout(250);
await desktop.screenshot({ path: `${outDir}/product-schedule.png` });
console.log("schedule");

await desktop.getByRole("button", { name: "Repairability", exact: true }).click();
await desktop.evaluate(() => window.scrollTo(0, 0));
await desktop.waitForTimeout(250);
await desktop.screenshot({ path: `${outDir}/product-repairability.png` });
console.log("repairability");

await desktop.getByRole("button", { name: "Summary", exact: true }).click();
await desktop.getByRole("button", { name: "Open customizer", exact: true }).click();
await desktop.waitForTimeout(250);
await desktop.screenshot({ path: `${outDir}/product-configurator.png` });
await desktop.keyboard.press("Escape");
console.log("configurator");

await desktop.goto(`${base}/`, { waitUntil: "networkidle" });
await desktop.getByRole("button", { name: "Start tour" }).first().click();
await desktop.waitForTimeout(300);
await desktop.screenshot({ path: `${outDir}/tour.png` });
await desktop.getByRole("button", { name: "Skip tour" }).click();
console.log("tour");

for (const [name, path] of [
  ["brief", "/brief/phone-orbit-2028/"],
  ["risks", "/risks/"],
  ["pipeline", "/pipeline/"],
  ["changelog", "/changelog/"],
  ["methodology", "/methodology/"],
]) {
  if (name === "changelog") {
    await desktop.setViewportSize({ width: 1440, height: 1900 });
  }
  await desktop.goto(`${base}${path}`, { waitUntil: "networkidle" });
  await desktop.screenshot({ path: `${outDir}/${name}.png` });
  if (name === "changelog") {
    await desktop.setViewportSize({ width: 1440, height: 1000 });
  }
  console.log(name);
}

const print = await browser.newPage({
  viewport: { width: 794, height: 1123 },
  deviceScaleFactor: 1,
});
await print.goto(`${base}/brief/phone-orbit-2028/`, { waitUntil: "networkidle" });
await print.emulateMedia({ media: "print" });
await print.screenshot({ path: `${outDir}/brief-print.png`, fullPage: true });
console.log("print brief");

const mobile = await browser.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 1,
});
await mobile.goto(`${base}/`, { waitUntil: "networkidle" });
await mobile.screenshot({ path: `${outDir}/portfolio-mobile.png`, fullPage: true });
console.log("mobile");

await browser.close();
