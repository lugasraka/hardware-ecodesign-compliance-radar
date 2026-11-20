import { describe, expect, it } from "vitest";
import { products } from "@/data/products";
import {
  computeRepairability,
  computeRepairabilityLevers,
  euRepairabilityClass,
} from "@/domain/scoring";
import type { RepairabilityInputs } from "@/domain/types";

const phone = products.find((product) => product.id === "phone-orbit-2028")!;

const perfect: RepairabilityInputs = {
  parts: {
    battery: { disassemblySteps: 2, fastener: "reusable", tool: "none" },
    display: { disassemblySteps: 2, fastener: "reusable", tool: "none" },
    backCover: { disassemblySteps: 2, fastener: "reusable", tool: "none" },
    frontCamera: { disassemblySteps: 2, fastener: "reusable", tool: "none" },
    rearCamera: { disassemblySteps: 2, fastener: "reusable", tool: "none" },
    chargingPort: { disassemblySteps: 2, fastener: "reusable", tool: "none" },
    buttons: { disassemblySteps: 2, fastener: "reusable", tool: "none" },
    microphone: { disassemblySteps: 2, fastener: "reusable", tool: "none" },
    speaker: { disassemblySteps: 2, fastener: "reusable", tool: "none" },
  },
  sparePartsLevel: 5,
  sparePartsYears: 7,
  repairInfoLevel: 5,
  softwareUpdateYears: 7,
  isFoldable: false,
  partsPriceRatio: 0.1,
  publicRepairDocs: true,
};

describe("EU repairability class thresholds", () => {
  it("maps index values to the 2023/1669 classes", () => {
    expect(euRepairabilityClass(4)).toBe("A");
    expect(euRepairabilityClass(3.35)).toBe("B");
    expect(euRepairabilityClass(2.55)).toBe("C");
    expect(euRepairabilityClass(1.75)).toBe("D");
    expect(euRepairabilityClass(1)).toBe("E");
    expect(euRepairabilityClass(0.99)).toBe("Not classified");
  });
});

describe("repairability scoring", () => {
  it("scores a best-case device at 5.00 and class A", () => {
    const result = computeRepairability(perfect);
    expect(result.index).toBe(5);
    expect(result.euClass).toBe("A");
  });

  it("reproduces the hero phone class and index range", () => {
    const result = computeRepairability(phone.repairability!);
    expect(result.index).toBeCloseTo(3.8, 1);
    expect(result.euClass).toBe("B");
  });

  it("returns part scores and a France illustrative score", () => {
    const result = computeRepairability(phone.repairability!);
    expect(result.partScores.length).toBe(10);
    expect(result.france.index).toBeGreaterThan(0);
    expect(result.france.index).toBeLessThanOrEqual(10);
    expect(result.france.illustrative).toBe(true);
  });

  it("produces sorted, positive design levers", () => {
    const levers = computeRepairabilityLevers(phone.repairability!);
    expect(levers.length).toBeGreaterThan(0);
    for (let index = 1; index < levers.length; index += 1) {
      expect(levers[index - 1].delta).toBeGreaterThanOrEqual(levers[index].delta);
    }
    expect(levers[0].delta).toBeGreaterThan(0);
  });
});
