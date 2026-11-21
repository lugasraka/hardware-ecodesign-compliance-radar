"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  ChevronRight,
  FileText,
  Info,
  LayoutDashboard,
  Radar,
  ShieldAlert,
} from "lucide-react";
import { products } from "@/data/products";
import { cn } from "@/lib/utils";
import { StartTourButton } from "@/components/start-tour-button";

const primaryNav = [
  { href: "/", label: "Portfolio", icon: LayoutDashboard },
  { href: "/risks/", label: "Risk register", icon: ShieldAlert },
  { href: "/pipeline/", label: "Regulatory pipeline", icon: Radar },
  { href: "/brief/phone-orbit-2028/", label: "Executive brief", icon: FileText },
];

const referenceNav = [
  { href: "/methodology/", label: "Methodology", icon: BookOpen },
  { href: "/about/", label: "About this demo", icon: Info },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  const base = href.replace(/\/$/, "");
  return pathname === base || pathname.startsWith(`${base}/`);
}

function NavItem({
  href,
  label,
  icon: Icon,
  pathname,
}: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  pathname: string;
}) {
  const active = isActive(pathname, href);
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] transition-colors",
        active
          ? "bg-zinc-100 font-medium text-zinc-950"
          : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950",
      )}
    >
      <Icon
        size={15}
        strokeWidth={1.8}
        className={active ? "text-blue-700" : "text-zinc-400 group-hover:text-zinc-600"}
      />
      <span>{label}</span>
    </Link>
  );
}

export function SideNav() {
  const pathname = usePathname();

  return (
    <aside className="no-print sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-zinc-200 bg-white lg:flex">
      <div className="border-b border-zinc-200 px-4 py-5">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-700 text-white">
            <Radar size={17} strokeWidth={2} />
          </span>
          <span className="leading-tight">
            <span className="block text-[13px] font-semibold tracking-tight text-zinc-950">
              Ecodesign Radar
            </span>
            <span className="block text-[12px] uppercase tracking-[0.14em] text-zinc-500">
              Compliance workbench
            </span>
          </span>
        </Link>
        <p className="mt-3 text-[13px] leading-4 text-zinc-500">
          Translating global ecodesign law into NPI gate decisions.
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="label px-2 pb-1.5">Workspace</p>
        <div className="space-y-0.5">
          {primaryNav.map((item) => (
            <NavItem key={item.href} {...item} pathname={pathname} />
          ))}
        </div>

        <details className="group mt-5">
          <summary className="flex cursor-pointer list-none items-center justify-between rounded-md px-2 py-1.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800">
            <span>Products ({products.length})</span>
            <ChevronRight
              size={12}
              className="transition-transform group-open:rotate-90"
            />
          </summary>
          <div className="mt-1 space-y-0.5">
            {products.map((product) => {
              const href = `/products/${product.id}/`;
              const active = pathname.startsWith(`/products/${product.id}`);
              return (
                <Link
                  key={product.id}
                  href={href}
                  className={cn(
                    "flex items-center justify-between rounded-md px-2.5 py-1.5 text-[13px] transition-colors",
                    active
                      ? "bg-blue-50 font-medium text-blue-900"
                      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950",
                  )}
                >
                  <span className="truncate">{product.shortName}</span>
                  <span className="ml-2 font-mono text-[11px] uppercase tracking-wide text-zinc-400">
                    {product.category.replace("_", " ")}
                  </span>
                </Link>
              );
            })}
          </div>
        </details>

        <p className="label px-2 pb-1.5 pt-5">Reference</p>
        <div className="space-y-0.5">
          {referenceNav.map((item) => (
            <NavItem key={item.href} {...item} pathname={pathname} />
          ))}
        </div>
      </nav>

      <div className="border-t border-zinc-200 px-4 py-3">
        <div className="flex items-center gap-2 text-[12px] text-zinc-500">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span>Data as of 20 Nov 2026</span>
        </div>
        <p className="mt-1.5 text-[12px] leading-4 text-zinc-400">
          Illustrative product data. Not legal advice. Built for electronics and
          hardware product teams.
        </p>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="no-print border-b border-zinc-200 bg-white px-4 py-3 lg:hidden">
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-700 text-white">
            <Radar size={15} />
          </span>
          <span className="text-[13px] font-semibold tracking-tight">Ecodesign Radar</span>
        </Link>
        <span className="rounded-full border border-zinc-200 px-2 py-0.5 text-[12px] text-zinc-500">
          As of 20 Nov 2026
        </span>
      </div>
      <nav className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
        {primaryNav.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "whitespace-nowrap rounded-full border px-3 py-1 text-[13px] font-medium",
                active
                  ? "border-blue-200 bg-blue-50 text-blue-800"
                  : "border-zinc-200 bg-white text-zinc-600",
              )}
            >
              {item.label}
            </Link>
          );
        })}
        <Link
          href="/methodology/"
          className="whitespace-nowrap rounded-full border border-zinc-200 bg-white px-3 py-1 text-[13px] font-medium text-zinc-600"
        >
          Methodology
        </Link>
        <StartTourButton compact />
      </nav>
    </div>
  );
}
