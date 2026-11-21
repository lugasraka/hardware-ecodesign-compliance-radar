import { addDays, diffDays } from "@/lib/date";
import type { Gate, MarketCode, Product } from "./types";

export interface ProductOverrides {
  markets?: MarketCode[];
  batteryCyclesTo80Pct?: number;
  batteryRemovableByUser?: boolean;
  maxOutputPowerW?: number;
  usbPd?: boolean;
  launchDate?: string;
}

export function hasProductOverrides(overrides: ProductOverrides): boolean {
  return Object.values(overrides).some((value) => value !== undefined);
}

export function applyProductOverrides(
  product: Product,
  overrides: ProductOverrides,
): Product {
  const specs = { ...product.specs };

  if (product.specs.battery) {
    const battery = { ...product.specs.battery };

    if (overrides.batteryCyclesTo80Pct !== undefined) {
      battery.cyclesTo80Pct = overrides.batteryCyclesTo80Pct;
    }

    if (overrides.batteryRemovableByUser !== undefined) {
      battery.removableByUser = overrides.batteryRemovableByUser;
      battery.serviceModel = overrides.batteryRemovableByUser ? "user" : "professional";
      battery.replaceableByIndependentProfessional = true;
    }

    specs.battery = battery;
  }

  if (product.specs.power) {
    const power = { ...product.specs.power };

    if (overrides.maxOutputPowerW !== undefined) {
      power.maxOutputW = overrides.maxOutputPowerW;
    }

    if (overrides.usbPd !== undefined) {
      power.usbPd = overrides.usbPd;
    }

    specs.power = power;
  }

  let launchDate = product.launchDate;
  let endOfSaleDate = product.endOfSaleDate;
  let gatePlan = product.gatePlan;

  if (overrides.launchDate && overrides.launchDate !== product.launchDate) {
    const delta = diffDays(product.launchDate, overrides.launchDate);
    launchDate = overrides.launchDate;
    endOfSaleDate = addDays(product.endOfSaleDate, delta);

    if (product.gatePlan) {
      gatePlan = Object.fromEntries(
        Object.entries(product.gatePlan).map(([gate, date]) => [
          gate,
          addDays(date, delta),
        ]),
      ) as Partial<Record<Gate, string>>;
    }
  }

  return {
    ...product,
    markets: overrides.markets ?? product.markets,
    launchDate,
    endOfSaleDate,
    specs,
    gatePlan,
  };
}
