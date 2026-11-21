"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

export const TOUR_STEPS = [
  {
    title: "Start with the portfolio",
    body: "Red means a product cannot be sold as-is in at least one market. Start with the decisions that are due.",
    href: "/",
  },
  {
    title: "Open the hero product",
    body: "The 2028 flagship has one market-access blocker: Article 11 battery removability.",
    href: "/products/phone-orbit-2028/",
  },
  {
    title: "Read the clock",
    body: "The decision is due 17 February 2027. The EVT gate is 15 September 2027. The app computes this backward from qualification lead time.",
    href: "/products/phone-orbit-2028/#schedule",
  },
  {
    title: "Test the what-if",
    body: "Open Customize and switch the battery to user-removable. Article 11 flips live, while the evidence gap stays visible.",
    href: "/products/phone-orbit-2028/#customize",
  },
  {
    title: "Take the brief",
    body: "One page: the ask, the options, the recommendation, and what would change it.",
    href: "/brief/phone-orbit-2028/",
  },
] as const;

interface TourContextValue {
  active: boolean;
  step: number;
  steps: typeof TOUR_STEPS;
  start: () => void;
  next: () => void;
  back: () => void;
  skip: () => void;
  goTo: (index: number) => void;
}

const TourContext = createContext<TourContextValue | null>(null);

export function TourProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);

  const goTo = useCallback(
    (index: number) => {
      const nextIndex = Math.max(0, Math.min(TOUR_STEPS.length - 1, index));
      setStep(nextIndex);
      const href = TOUR_STEPS[nextIndex].href;

      if (typeof window !== "undefined") {
        const target = new URL(href, window.location.origin);
        if (target.pathname === window.location.pathname && target.hash) {
          window.location.hash = target.hash;
          return;
        }
      }

      router.push(href);
    },
    [router],
  );

  const start = useCallback(() => {
    setActive(true);
    setStep(0);
    router.push(TOUR_STEPS[0].href);
  }, [router]);

  const next = useCallback(() => {
    if (step >= TOUR_STEPS.length - 1) {
      setActive(false);
      return;
    }
    goTo(step + 1);
  }, [goTo, step]);

  const back = useCallback(() => {
    if (step === 0) return;
    goTo(step - 1);
  }, [goTo, step]);

  const skip = useCallback(() => setActive(false), []);

  const value = useMemo(
    () => ({ active, step, steps: TOUR_STEPS, start, next, back, skip, goTo }),
    [active, step, start, next, back, skip, goTo],
  );

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}

export function useTour(): TourContextValue {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error("useTour must be used inside TourProvider");
  }
  return context;
}

export function TourBar() {
  const tour = useTour();
  if (!tour.active) return null;

  const current = tour.steps[tour.step];
  const isLast = tour.step === tour.steps.length - 1;

  return (
    <div className="no-print fixed inset-x-0 bottom-0 z-50 p-3">
      <div
        role="region"
        aria-label="Guided tour"
        aria-live="polite"
        className="mx-auto max-w-3xl rounded-lg border border-blue-200 bg-white p-3 shadow-xl"
      >
        <div className="flex items-start gap-3">
          <span className="inline-flex h-6 shrink-0 items-center rounded-full bg-blue-700 px-2 font-mono text-[12px] font-semibold text-white">
            {tour.step + 1}/{tour.steps.length}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-zinc-950">{current.title}</p>
            <p className="mt-0.5 text-[13px] leading-4 text-zinc-600">{current.body}</p>
          </div>
          <button
            type="button"
            onClick={tour.skip}
            className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
            aria-label="Skip tour"
          >
            <X size={14} />
          </button>
        </div>
        <div className="mt-2 flex items-center justify-between gap-2 border-t border-zinc-100 pt-2">
          <button
            type="button"
            onClick={tour.back}
            disabled={tour.step === 0}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[13px] font-medium text-zinc-600 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowLeft size={12} />
            Back
          </button>
          <div className="flex items-center gap-1">
            {tour.steps.map((step, index) => (
              <button
                key={step.title}
                type="button"
                onClick={() => tour.goTo(index)}
                aria-label={`Go to tour step ${index + 1}`}
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  index === tour.step ? "bg-blue-700" : "bg-zinc-300 hover:bg-zinc-400",
                )}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={tour.next}
            className="inline-flex items-center gap-1 rounded-md bg-blue-700 px-3 py-1 text-[13px] font-medium text-white hover:bg-blue-800"
          >
            {isLast ? "Finish" : "Next"}
            <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
