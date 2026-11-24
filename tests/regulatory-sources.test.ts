import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { regulatorySources } from "@/data/regulatory-sources";

describe("regulatory source list", () => {
  it("has unique source ids", () => {
    const ids = regulatorySources.map((source) => source.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("uses secure official URLs", () => {
    for (const source of regulatorySources) {
      expect(source.url.startsWith("https://")).toBe(true);
    }
  });

  it("marks manual sources with a review note", () => {
    for (const source of regulatorySources.filter(
      (item) => item.check === "manual",
    )) {
      expect(source.note?.length).toBeGreaterThan(0);
    }
  });

  it("keeps at least one automated source", () => {
    expect(
      regulatorySources.filter((source) => source.check === "http").length,
    ).toBeGreaterThan(0);
  });

  it("uses secure check URLs", () => {
    for (const source of regulatorySources) {
      if (source.checkUrl) {
        expect(source.checkUrl.startsWith("https://")).toBe(true);
      }
    }
  });

  it("checks automated EUR-Lex sources through Cellar", () => {
    const eurLexSources = regulatorySources.filter(
      (source) =>
        source.check === "http" && source.url.includes("eur-lex.europa.eu"),
    );

    expect(eurLexSources.length).toBeGreaterThan(0);
    for (const source of eurLexSources) {
      expect(source.checkUrl).toMatch(
        /^https:\/\/publications\.europa\.eu\/resource\/celex\//,
      );
    }
  });

  it("has no hash of an empty source response", () => {
    const state = JSON.parse(
      readFileSync(resolve(process.cwd(), "data/source-state.json"), "utf8"),
    ) as { sources: Record<string, { hash: string }> };
    const emptyHash = createHash("sha256").update("").digest("hex");
    const emptySources = Object.entries(state.sources)
      .filter(([, source]) => source.hash === emptyHash)
      .map(([id]) => id);

    expect(emptySources).toEqual([]);
  });
});
