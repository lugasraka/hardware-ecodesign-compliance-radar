import type { FieldRef, Predicate, Product, TraceNode, Tri } from "./types";

export interface EvaluationContext {
  product: Product;
  market: string;
  asOf: string;
  derived: Record<string, unknown>;
}

const FIELD_LABELS: Record<string, string> = {
  "product.category": "Product category",
  "product.formFactor": "Form factor",
  "product.useEnvironment": "Use environment",
  "product.installation": "Installation",
  "product.powerSource": "Power source",
  "product.hasBattery": "Has battery",
  "product.markets": "Target markets",
  "product.launchDate": "Launch date",
  "product.endOfSaleDate": "End of sale",
  "product.battery.category": "Battery category",
  "product.battery.energyWh": "Battery energy (Wh)",
  "product.battery.cyclesTo80Pct": "Battery cycles to 80%",
  "product.battery.capacityRetentionAt500": "Capacity retention after 500 cycles",
  "product.battery.removableByUser": "User-removable battery",
  "product.battery.serviceModel": "Battery service model",
  "product.battery.replaceableByIndependentProfessional":
    "Independent professional replacement",
  "product.battery.qrCode": "Battery QR code ready",
  "product.battery.labelReady": "Battery label ready",
  "product.battery.chargeLimit80Option": "80% charge limit option",
  "product.battery.trickleStop": "Trickle-charge stop",
  "product.power.maxOutputW": "Max output power (W)",
  "product.power.usbPd": "USB-PD",
  "product.power.usbCPort": "USB-C port",
  "product.power.detachableCable": "Detachable cable",
  "product.power.wireless": "Wireless charging",
  "product.power.noLoadW": "No-load power (W)",
  "product.power.lowLoadEfficiency": "Low-load efficiency",
  "product.power.averageActiveEfficiency": "Average active efficiency",
  "product.power.commonChargerLogo": "Common Charger logo",
  "product.power.doeCertified": "DOE certified",
  "product.power.cecCertified": "CEC certified",
  "product.display.type": "Display type",
  "product.display.sizeIn": "Display size (in)",
  "product.ingress.solid": "IP solid protection",
  "product.ingress.water": "IP water protection",
  "product.software.osSupportYears": "OS support (years)",
  "product.software.securitySupportYears": "Security support (years)",
  "product.software.updatePolicyPublic": "Update policy public",
  "product.spareParts.years": "Spare parts availability (years)",
  "product.spareParts.deliveryDays": "Spare parts delivery (days)",
  "product.spareParts.professionalOnly": "Spare parts professional-only",
  "product.spareParts.publicList": "Public spare parts list",
  "product.spareParts.partsPairing": "Parts pairing present",
  "product.repairInfo.level": "Repair information level",
  "product.repairInfo.publicDocs": "Public repair docs",
  "product.materials.recycledAluminiumPct": "Recycled aluminium (%)",
  "product.materials.recycledContentPct": "Recycled content (%)",
  "product.energy.labelClass": "Energy label class",
  "product.energy.eprelRegistered": "EPREL registered",
  "product.energy.productInfoPublic": "Product information public",
  "product.energy.standbyW": "Standby power (W)",
  "product.energy.energyStar": "ENERGY STAR",
  "product.compliance.dropTestFalls": "Drop test falls",
  "product.compliance.scratchMohs": "Scratch resistance (Mohs)",
  "product.compliance.dppRegistryRegistered": "DPP registry registered",
  "product.compliance.dppDataCarrier": "DPP data carrier",
  "product.intendedWetUse": "Intended wet use",
  "product.isFoldable": "Foldable",
  "derived.euRepairabilityClass": "EU repairability class",
  "derived.frIndex": "France repairability index",
};

export function fieldLabel(field: FieldRef): string {
  return FIELD_LABELS[field] ?? field;
}

export function getField(context: EvaluationContext, field: FieldRef): unknown {
  if (field === "market") return context.market;
  if (field === "asOf") return context.asOf;

  const parts = field.split(".");
  let current: unknown;

  if (parts[0] === "derived") {
    current = context.derived;
    parts.shift();
  } else if (parts[0] === "product") {
    current = context.product;
    parts.shift();
  } else {
    return undefined;
  }

  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    if (typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }

  return current;
}

export function triAnd(values: Tri[]): Tri {
  if (values.some((value) => value === false)) return false;
  if (values.some((value) => value === "unknown")) return "unknown";
  return true;
}

export function triOr(values: Tri[]): Tri {
  if (values.some((value) => value === true)) return true;
  if (values.some((value) => value === "unknown")) return "unknown";
  return false;
}

export function triNot(value: Tri): Tri {
  if (value === "unknown") return "unknown";
  return !value;
}

function isNumeric(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function describeOperator(predicate: Predicate): string {
  switch (predicate.op) {
    case "eq":
      return "equals";
    case "neq":
      return "does not equal";
    case "gt":
      return ">";
    case "gte":
      return "≥";
    case "lt":
      return "<";
    case "lte":
      return "≤";
    case "in":
      return "is one of";
    case "contains":
      return "contains";
    case "between":
      return "is between";
    case "exists":
      return "is present";
    case "and":
      return "all of";
    case "or":
      return "any of";
    case "not":
      return "not";
  }
}

function defaultLabel(predicate: Predicate): string {
  if (predicate.op === "and") return "All conditions hold";
  if (predicate.op === "or") return "Any condition holds";
  if (predicate.op === "not") return "Condition is not met";
  if (predicate.op === "exists") return `${fieldLabel(predicate.field)} is present`;

  const field = fieldLabel(predicate.field);
  const operator = describeOperator(predicate);
  if (predicate.op === "in") {
    return `${field} ${operator} ${predicate.values.join(", ")}`;
  }
  if (predicate.op === "between") {
    return `${field} ${operator} ${predicate.min} and ${predicate.max}`;
  }
  return `${field} ${operator} ${String(predicate.value)}`;
}

function node(
  predicate: Predicate,
  result: Tri,
  options: {
    field?: string;
    actual?: unknown;
    expected?: unknown;
    children?: TraceNode[];
  } = {},
): TraceNode {
  return {
    label: predicate.label ?? defaultLabel(predicate),
    result,
    ...options,
  };
}

export function evaluatePredicate(
  predicate: Predicate,
  context: EvaluationContext,
): TraceNode {
  switch (predicate.op) {
    case "and": {
      const children = predicate.all.map((child) => evaluatePredicate(child, context));
      return node(predicate, triAnd(children.map((child) => child.result)), {
        children,
      });
    }
    case "or": {
      const children = predicate.any.map((child) => evaluatePredicate(child, context));
      return node(predicate, triOr(children.map((child) => child.result)), {
        children,
      });
    }
    case "not": {
      const child = evaluatePredicate(predicate.not, context);
      return node(predicate, triNot(child.result), { children: [child] });
    }
    case "exists": {
      const actual = getField(context, predicate.field);
      return node(predicate, actual !== undefined && actual !== null, {
        field: predicate.field,
        actual,
      });
    }
    case "in": {
      const actual = getField(context, predicate.field);
      if (actual === undefined || actual === null) {
        return node(predicate, "unknown", {
          field: predicate.field,
          actual,
          expected: predicate.values,
        });
      }
      if (Array.isArray(actual)) {
        const matches = actual.some((value) => predicate.values.includes(value as never));
        return node(predicate, matches, {
          field: predicate.field,
          actual,
          expected: predicate.values,
        });
      }
      return node(predicate, predicate.values.includes(actual as never), {
        field: predicate.field,
        actual,
        expected: predicate.values,
      });
    }
    case "contains": {
      const actual = getField(context, predicate.field);
      if (actual === undefined || actual === null) {
        return node(predicate, "unknown", {
          field: predicate.field,
          actual,
          expected: predicate.value,
        });
      }
      if (Array.isArray(actual)) {
        return node(predicate, actual.includes(predicate.value as never), {
          field: predicate.field,
          actual,
          expected: predicate.value,
        });
      }
      if (typeof actual === "string") {
        return node(predicate, actual.includes(String(predicate.value)), {
          field: predicate.field,
          actual,
          expected: predicate.value,
        });
      }
      return node(predicate, "unknown", {
        field: predicate.field,
        actual,
        expected: predicate.value,
      });
    }
    case "eq":
    case "neq": {
      const actual = getField(context, predicate.field);
      if (actual === undefined || actual === null) {
        return node(predicate, "unknown", {
          field: predicate.field,
          actual,
          expected: predicate.value,
        });
      }
      const equal = actual === predicate.value;
      return node(predicate, predicate.op === "eq" ? equal : !equal, {
        field: predicate.field,
        actual,
        expected: predicate.value,
      });
    }
    case "gt":
    case "gte":
    case "lt":
    case "lte": {
      const actual = getField(context, predicate.field);
      if (!isNumeric(actual)) {
        return node(predicate, "unknown", {
          field: predicate.field,
          actual,
          expected: predicate.value,
        });
      }
      const result =
        predicate.op === "gt"
          ? actual > predicate.value
          : predicate.op === "gte"
            ? actual >= predicate.value
            : predicate.op === "lt"
              ? actual < predicate.value
              : actual <= predicate.value;
      return node(predicate, result, {
        field: predicate.field,
        actual,
        expected: predicate.value,
      });
    }
    case "between": {
      const actual = getField(context, predicate.field);
      if (!isNumeric(actual)) {
        return node(predicate, "unknown", {
          field: predicate.field,
          actual,
          expected: [predicate.min, predicate.max],
        });
      }
      return node(
        predicate,
        actual >= predicate.min && actual <= predicate.max,
        {
          field: predicate.field,
          actual,
          expected: [predicate.min, predicate.max],
        },
      );
    }
  }
}

export function collectTraceFields(trace: TraceNode): string[] {
  const fields = new Set<string>();
  const walk = (node: TraceNode) => {
    if (node.field) fields.add(node.field);
    node.children?.forEach(walk);
  };
  walk(trace);
  return Array.from(fields);
}

export function traceToText(trace: TraceNode, indent = 0): string {
  const prefix = "  ".repeat(indent);
  const status =
    trace.result === true ? "[x]" : trace.result === false ? "[ ]" : "[?]";
  const actual =
    trace.actual === undefined ? "" : ` (actual: ${JSON.stringify(trace.actual)})`;
  const line = `${prefix}${status} ${trace.label}${actual}`;
  return [
    line,
    ...(trace.children ?? []).map((child) => traceToText(child, indent + 1)),
  ].join("\n");
}
