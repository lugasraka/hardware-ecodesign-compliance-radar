import type {
  PartKey,
  PartRepairInput,
  RepairabilityInputs,
  RepairabilityResult,
} from "./types";

const PART_LABELS: Record<PartKey, string> = {
  battery: "Battery",
  display: "Display assembly",
  backCover: "Back cover",
  frontCamera: "Front camera",
  rearCamera: "Rear camera",
  chargingPort: "Charging port",
  buttons: "Buttons",
  microphone: "Microphone",
  speaker: "Speaker",
  hinge: "Hinge / fold mechanism",
};

const NON_FOLDABLE_WEIGHTS: Record<PartKey, number> = {
  battery: 0.3,
  display: 0.3,
  backCover: 0.1,
  frontCamera: 0.05,
  rearCamera: 0.05,
  chargingPort: 0.05,
  buttons: 0.05,
  microphone: 0.05,
  speaker: 0.05,
  hinge: 0,
};

const FOLDABLE_WEIGHTS: Record<PartKey, number> = {
  battery: 0.25,
  display: 0.25,
  backCover: 0.09,
  frontCamera: 0.04,
  rearCamera: 0.04,
  chargingPort: 0.04,
  buttons: 0.04,
  microphone: 0.04,
  speaker: 0.04,
  hinge: 0.17,
};

const PART_KEYS: PartKey[] = [
  "battery",
  "display",
  "backCover",
  "frontCamera",
  "rearCamera",
  "chargingPort",
  "buttons",
  "microphone",
  "speaker",
  "hinge",
];

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function round(value: number, digits = 2): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function disassemblyScore(steps: number): number {
  if (steps <= 2) return 5;
  if (steps <= 5) return 4;
  if (steps <= 10) return 3;
  if (steps <= 15) return 2;
  return 1;
}

function fastenerScore(fastener: PartRepairInput["fastener"]): number {
  if (fastener === "reusable") return 5;
  if (fastener === "resupplied") return 3;
  return 1;
}

function toolScore(tool: PartRepairInput["tool"]): number {
  switch (tool) {
    case "none":
      return 5;
    case "basic":
      return 4;
    case "supplied_with_spare":
      return 3;
    case "supplied_with_product":
      return 2;
    case "commercial":
      return 1;
  }
}

function softwareScore(years: number): number {
  if (years >= 7) return 5;
  if (years >= 6) return 3;
  if (years >= 5) return 1;
  return 0;
}

function repairInfoScore(level: number): number {
  if (level >= 5) return 5;
  if (level >= 3) return 3;
  return 1;
}

export function euRepairabilityClass(index: number): RepairabilityResult["euClass"] {
  if (index >= 4) return "A";
  if (index >= 3.35) return "B";
  if (index >= 2.55) return "C";
  if (index >= 1.75) return "D";
  if (index >= 1) return "E";
  return "Not classified";
}

export function computeRepairability(
  inputs: RepairabilityInputs,
): RepairabilityResult {
  const weights = inputs.isFoldable ? FOLDABLE_WEIGHTS : NON_FOLDABLE_WEIGHTS;

  const partScores = PART_KEYS.map((key) => {
    const part = inputs.parts[key];
    // 2023/1669 Annex IV: if a priority part is not present, use the highest
    // point level for that part.
    const dd = part ? disassemblyScore(part.disassemblySteps) : 5;
    const f = part ? fastenerScore(part.fastener) : 5;
    const t = part ? toolScore(part.tool) : 5;
    return {
      key,
      label: PART_LABELS[key],
      dd,
      f,
      t,
      weight: weights[key],
    };
  });

  const disassembly = partScores.reduce((total, part) => total + part.dd * part.weight, 0);
  const fasteners = partScores.reduce((total, part) => total + part.f * part.weight, 0);
  const tools = partScores.reduce((total, part) => total + part.t * part.weight, 0);
  const spareParts = inputs.sparePartsLevel;
  const softwareUpdates = softwareScore(inputs.softwareUpdateYears);
  const repairInfo = repairInfoScore(inputs.repairInfoLevel);

  const index = round(
    disassembly * 0.25 +
      fasteners * 0.15 +
      tools * 0.15 +
      spareParts * 0.15 +
      softwareUpdates * 0.15 +
      repairInfo * 0.15,
    2,
  );

  const avgDisassembly =
    partScores.reduce((total, part) => total + part.dd, 0) / partScores.length;

  const franceCriteria = [
    {
      label: "Documentation",
      score: clamp(inputs.repairInfoLevel * 3 + (inputs.publicRepairDocs ? 5 : 0), 0, 20),
    },
    {
      label: "Disassembly",
      score: clamp((avgDisassembly / 5) * 20, 0, 20),
    },
    {
      label: "Spare parts availability",
      score: clamp((inputs.sparePartsYears / 7) * 20, 0, 20),
    },
    {
      label: "Spare parts price",
      score: clamp((1 - inputs.partsPriceRatio) * 20, 0, 20),
    },
    {
      label: "Category-specific",
      score: clamp((inputs.softwareUpdateYears / 7) * 20, 0, 20),
    },
  ];

  const franceIndex = round(
    franceCriteria.reduce((total, criterion) => total + criterion.score, 0) / 10,
    1,
  );

  return {
    index,
    euClass: euRepairabilityClass(index),
    breakdown: {
      disassembly: round(disassembly, 2),
      fasteners: round(fasteners, 2),
      tools: round(tools, 2),
      spareParts,
      softwareUpdates,
      repairInfo,
    },
    partScores,
    france: {
      index: franceIndex,
      criteria: franceCriteria.map((criterion) => ({
        label: criterion.label,
        score: round(criterion.score, 1),
      })),
      illustrative: true,
    },
  };
}

export interface RepairabilityLever {
  id: string;
  label: string;
  detail: string;
  delta: number;
  inputs: RepairabilityInputs;
}

export function computeRepairabilityLevers(
  inputs: RepairabilityInputs,
): RepairabilityLever[] {
  const baseline = computeRepairability(inputs).index;
  const levers: RepairabilityLever[] = [];

  const battery = inputs.parts.battery;
  if (battery && battery.disassemblySteps > 2) {
    const nextSteps = Math.max(2, battery.disassemblySteps - 3);
    const next = {
      ...inputs,
      parts: {
        ...inputs.parts,
        battery: { ...battery, disassemblySteps: nextSteps },
      },
    };
    levers.push({
      id: "battery-steps",
      label: "Reduce battery disassembly steps",
      detail: `${battery.disassemblySteps} → ${nextSteps} steps`,
      delta: round(computeRepairability(next).index - baseline, 2),
      inputs: next,
    });
  }

  if (battery && battery.fastener !== "reusable") {
    const next = {
      ...inputs,
      parts: {
        ...inputs.parts,
        battery: { ...battery, fastener: "reusable" as const },
      },
    };
    levers.push({
      id: "battery-fastener",
      label: "Use reusable battery fasteners",
      detail: `${battery.fastener} → reusable`,
      delta: round(computeRepairability(next).index - baseline, 2),
      inputs: next,
    });
  }

  if (inputs.softwareUpdateYears < 7) {
    const next = { ...inputs, softwareUpdateYears: 7 };
    levers.push({
      id: "software",
      label: "Extend software updates to 7 years",
      detail: `${inputs.softwareUpdateYears} → 7 years`,
      delta: round(computeRepairability(next).index - baseline, 2),
      inputs: next,
    });
  }

  if (inputs.sparePartsLevel < 5) {
    const next = {
      ...inputs,
      sparePartsLevel: Math.min(5, inputs.sparePartsLevel + 1) as 1 | 2 | 3 | 4 | 5,
    };
    levers.push({
      id: "spare-parts",
      label: "Expand end-user spare parts access",
      detail: `Level ${inputs.sparePartsLevel} → ${next.sparePartsLevel}`,
      delta: round(computeRepairability(next).index - baseline, 2),
      inputs: next,
    });
  }

  return levers.sort((a, b) => b.delta - a.delta);
}
