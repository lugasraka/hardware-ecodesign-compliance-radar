import { describe, expect, it } from "vitest";
import {
  evaluatePredicate,
  getField,
  triAnd,
  triNot,
  triOr,
  type EvaluationContext,
} from "@/domain/predicates";
import { products } from "@/data/products";

const product = products.find((item) => item.id === "phone-orbit-2028")!;

const context: EvaluationContext = {
  product: { ...product, ...product.specs },
  market: "EU",
  asOf: "2026-11-20",
  derived: {
    euRepairabilityClass: "B",
    euEpsEfficiencyHeadroom: 0.02,
  },
};

describe("tri-state logic", () => {
  it("combines AND with Kleene semantics", () => {
    expect(triAnd([true, true])).toBe(true);
    expect(triAnd([true, false])).toBe(false);
    expect(triAnd([true, "unknown"])).toBe("unknown");
    expect(triAnd([false, "unknown"])).toBe(false);
  });

  it("combines OR with Kleene semantics", () => {
    expect(triOr([false, true])).toBe(true);
    expect(triOr([false, "unknown"])).toBe("unknown");
    expect(triOr([false, false])).toBe(false);
  });

  it("keeps unknown through negation", () => {
    expect(triNot("unknown")).toBe("unknown");
    expect(triNot(true)).toBe(false);
  });
});

describe("field access", () => {
  it("reads top-level product fields", () => {
    expect(getField(context, "product.category")).toBe("smartphone");
  });

  it("reads flattened spec fields", () => {
    expect(getField(context, "product.battery.cyclesTo80Pct")).toBe(1000);
    expect(getField(context, "product.ingress.water")).toBe(8);
    expect(getField(context, "product.power.maxOutputW")).toBeUndefined();
  });

  it("returns undefined for missing fields", () => {
    expect(getField(context, "product.battery.unknownField")).toBeUndefined();
  });
});

describe("predicate evaluation", () => {
  it("evaluates numeric thresholds", () => {
    const trace = evaluatePredicate(
      {
        op: "gte",
        field: "product.battery.cyclesTo80Pct",
        value: 800,
        label: "Battery endurance",
      },
      context,
    );
    expect(trace.result).toBe(true);
    expect(trace.actual).toBe(1000);
  });

  it("returns unknown when the field is missing", () => {
    const trace = evaluatePredicate(
      { op: "gte", field: "product.power.maxOutputW", value: 100 },
      context,
    );
    expect(trace.result).toBe("unknown");
  });

  it("evaluates array membership", () => {
    expect(
      evaluatePredicate(
        { op: "contains", field: "product.markets", value: "EU" },
        context,
      ).result,
    ).toBe(true);
    expect(
      evaluatePredicate(
        { op: "contains", field: "product.markets", value: "UK" },
        context,
      ).result,
    ).toBe(false);
  });

  it("evaluates IP thresholds as a conjunction", () => {
    const trace = evaluatePredicate(
      {
        op: "and",
        all: [
          { op: "gte", field: "product.ingress.solid", value: 4 },
          { op: "gte", field: "product.ingress.water", value: 4 },
        ],
      },
      context,
    );
    expect(trace.result).toBe(true);
  });

  it("propagates unknown through AND", () => {
    const trace = evaluatePredicate(
      {
        op: "and",
        all: [
          { op: "gte", field: "product.battery.cyclesTo80Pct", value: 800 },
          { op: "gte", field: "product.power.maxOutputW", value: 100 },
        ],
      },
      context,
    );
    expect(trace.result).toBe("unknown");
  });
});
