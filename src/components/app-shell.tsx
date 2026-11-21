import { MobileNav, SideNav } from "@/components/side-nav";
import { TopBar } from "@/components/top-bar";
import { TourBar, TourProvider } from "@/components/tour-provider";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <TourProvider>
      <div className="flex min-h-screen">
        <SideNav />
        <div className="flex min-w-0 flex-1 flex-col">
          <MobileNav />
          <TopBar />
          <main className="mx-auto w-full max-w-[1500px] flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </main>
          <footer className="no-print border-t border-zinc-200 px-4 py-4 sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-[1500px] flex-col gap-1 text-[12px] text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
              <p>
                Illustrative product data. Not legal advice. Not affiliated with Apple.
              </p>
              <p>
                Regulatory data last verified 20 Nov 2026 · Next.js + TypeScript
              </p>
            </div>
          </footer>
        </div>
      </div>
      <TourBar />
    </TourProvider>
  );
}
