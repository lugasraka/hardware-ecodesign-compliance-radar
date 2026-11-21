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
});
