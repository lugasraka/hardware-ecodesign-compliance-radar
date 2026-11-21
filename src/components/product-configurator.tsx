"use client";

import { useEffect } from "react";
import { RotateCcw, SlidersHorizontal, X } from "lucide-react";
import { markets } from "@/data/markets";
import {
  hasProductOverrides,
  type ProductOverrides,
} from "@/domain/overrides";
import type { MarketCode, Product } from "@/domain/types";
import { cn } from "@/lib/utils";

const MARKET_ORDER: MarketCode[] = ["EU", "US-FED", "US-CA", "US-OR", "IN", "UK"];

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description: string;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-3 rounded-md border border-zinc-200 px-3 py-2.5">
      <span>
        <span className="block text-[13px] font-medium text-zinc-800">{label}</span>
        <span className="mt-0.5 block text-[13px] leading-4 text-zinc-500">
          {description}
        </span>
      </span>
      <span className="relative mt-0.5 inline-flex h-5 w-9 shrink-0 items-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="peer sr-only"
        />
        <span className="h-5 w-9 rounded-full bg-zinc-200 transition-colors peer-checked:bg-blue-600" />
        <span className="absolute left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
      </span>
    </label>
  );
}

export function ProductConfigurator({
  product,
  overrides,
  onChange,
  onReset,
  open,
  onClose,
}: {
  product: Product;
  overrides: ProductOverrides;
  onChange: (overrides: ProductOverrides) => void;
  onReset: () => void;
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const battery = product.specs.battery;
  const power = product.specs.power;
  const currentMarkets = overrides.markets ?? product.markets;
  const cycles = overrides.batteryCyclesTo80Pct ?? battery?.cyclesTo80Pct ?? 800;
  const removable = overrides.batteryRemovableByUser ?? battery?.removableByUser ?? false;
  const maxOutput = overrides.maxOutputPowerW ?? power?.maxOutputW ?? 100;
  const usbPd = overrides.usbPd ?? power?.usbPd ?? false;
  const launchDate = overrides.launchDate ?? product.launchDate;
  const modified = hasProductOverrides(overrides);

  const toggleMarket = (code: MarketCode) => {
    const next = currentMarkets.includes(code)
      ? currentMarkets.filter((market) => market !== code)
      : [...currentMarkets, code];
    if (next.length === 0) return;
    onChange({ ...overrides, markets: next });
  };

  return (
    <div className="fixed inset-0 z-50 no-print">
      <button
        type="button"
        aria-label="Close customizer"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-zinc-950/30"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="configurator-title"
        className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-zinc-200 bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-zinc-200 px-4 py-3">
          <div>
            <p className="label">What-if</p>
            <h2
              id="configurator-title"
              className="mt-0.5 text-[15px] font-semibold tracking-tight text-zinc-950"
            >
              Customize this product
            </h2>
            <p className="mt-0.5 text-[13px] leading-4 text-zinc-500">
              Changes re-run the assessment live. Nothing is saved.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4">
          <section>
            <div className="flex items-center justify-between">
              <p className="label">Markets</p>
              <span className="font-mono text-[12px] text-zinc-500">
                {currentMarkets.length} selected
              </span>
            </div>
            <div className="mt-1.5 grid grid-cols-3 gap-1.5">
              {MARKET_ORDER.map((code) => {
                const market = markets.find((item) => item.code === code);
                const selected = currentMarkets.includes(code);
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => toggleMarket(code)}
                    className={cn(
                      "rounded-md border px-2 py-1.5 text-left text-[13px] font-medium transition-colors",
                      selected
                        ? "border-blue-300 bg-blue-50 text-blue-900"
                        : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300",
                    )}
                    title={market?.name}
                  >
                    {code}
                  </button>
                );
              })}
            </div>
            <p className="mt-1.5 text-[12px] leading-4 text-zinc-500">
              India and the UK are monitoring only in this prototype; they do not add
              clause-level assessments yet.
            </p>
          </section>

          {battery ? (
            <section className="space-y-3">
              <p className="label">Battery</p>
              <div>
                <div className="flex items-baseline justify-between">
                  <span className="text-[13px] font-medium text-zinc-800">
                    Cycles to 80%
                  </span>
                  <span className="font-mono text-[13px] text-zinc-800 tabular">
                    {cycles}
                  </span>
                </div>
                <input
                  type="range"
                  min={500}
                  max={1200}
                  step={50}
                  value={cycles}
                  onChange={(event) =>
                    onChange({
                      ...overrides,
                      batteryCyclesTo80Pct: Number(event.target.value),
                    })
                  }
                  className="mt-1.5 w-full accent-blue-700"
                />
                <div className="flex justify-between text-[11px] text-zinc-400">
                  <span>500</span>
                  <span>800 · EU minimum</span>
                  <span>1,200</span>
                </div>
              </div>

              <Toggle
                checked={removable}
                onChange={(checked) =>
                  onChange({ ...overrides, batteryRemovableByUser: checked })
                }
                label="User-removable battery"
                description="On: Article 11 default path. Off: professional-only service."
              />
            </section>
          ) : null}

          {power ? (
            <section className="space-y-3">
              <p className="label">Power supply</p>
              <div>
                <div className="flex items-baseline justify-between">
                  <span className="text-[13px] font-medium text-zinc-800">
                    Max output power
                  </span>
                  <span className="font-mono text-[13px] text-zinc-800 tabular">
                    {maxOutput} W
                  </span>
                </div>
                <input
                  type="range"
                  min={45}
                  max={240}
                  step={1}
                  value={maxOutput}
                  onChange={(event) =>
                    onChange({
                      ...overrides,
                      maxOutputPowerW: Number(event.target.value),
                    })
                  }
                  className="mt-1.5 w-full accent-blue-700"
                />
                <div className="flex justify-between text-[11px] text-zinc-400">
                  <span>45 W</span>
                  <span>100 W · interoperability line</span>
                  <span>240 W</span>
                </div>
              </div>

              <Toggle
                checked={usbPd}
                onChange={(checked) => onChange({ ...overrides, usbPd: checked })}
                label="USB-PD"
                description="Above 100 W, USB-PD changes the efficiency transition and the interoperability exemption."
              />
            </section>
          ) : null}

          <section>
            <p className="label">Launch date</p>
            <input
              type="date"
              value={launchDate}
              onChange={(event) =>
                onChange({ ...overrides, launchDate: event.target.value })
              }
              className="mt-1.5 w-full rounded-md border border-zinc-300 bg-white px-2.5 py-2 text-[13px] text-zinc-800 outline-none focus:border-blue-500"
            />
            <p className="mt-1.5 text-[12px] leading-4 text-zinc-500">
              Gate dates and required-by dates move with the launch date.
            </p>
          </section>

          <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2">
            <p className="text-[12px] leading-4 text-amber-900">
              The one-page executive brief uses the curated product, not this what-if
              scenario. Use the brief for the final recommendation.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-zinc-200 px-4 py-3">
          <button
            type="button"
            onClick={onReset}
            disabled={!modified}
            className="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-[13px] font-medium text-zinc-700 hover:border-zinc-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RotateCcw size={12} />
            Reset
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 rounded-md bg-blue-700 px-3 py-1.5 text-[13px] font-medium text-white hover:bg-blue-800"
          >
            <SlidersHorizontal size={12} />
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
