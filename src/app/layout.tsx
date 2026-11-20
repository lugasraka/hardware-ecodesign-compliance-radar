import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppShell } from "@/components/app-shell";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Ecodesign Compliance Radar",
    template: "%s · Ecodesign Compliance Radar",
  },
  description:
    "A portfolio-level NPI compliance workbench that turns ecodesign law into gate decisions, owner assignments, and executive trade-offs.",
  applicationName: "Ecodesign Compliance Radar",
  authors: [{ name: "Raka Adrianto" }],
  keywords: [
    "ecodesign",
    "ESPR",
    "digital product passport",
    "battery regulation",
    "repairability",
    "hardware NPI",
    "product environmental compliance",
  ],
  openGraph: {
    title: "Ecodesign Compliance Radar",
    description:
      "A portfolio-level NPI compliance workbench for ecodesign, batteries, repairability, and DPP readiness.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-paper text-ink">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
