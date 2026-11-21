export interface DataRelease {
  version: string;
  date: string;
  title: string;
  summary: string;
  changes: string[];
  reviewedBy: string;
}

export const dataReleases: DataRelease[] = [
  {
    version: "2026.11.1",
    date: "2026-11-20",
    title: "Public demo snapshot",
    summary:
      "First public snapshot of the regulatory dataset and the product portfolio.",
    changes: [
      "Verified 13 instruments and 36 clauses against the official sources.",
      "Added the Article 11 battery decision and the 2025/2052 adapter scenario.",
      "Recorded the Battery Passport scope correction for portable batteries.",
      "Separated the EU repairability class from the French national index.",
    ],
    reviewedBy: "Raka Adrianto",
  },
  {
    version: "2026.11.0",
    date: "2026-11-18",
    title: "Pre-publication review",
    summary:
      "Internal review of the clause library, product data, and decision briefs.",
    changes: [
      "Corrected the 2023/1670 professional-only battery availability path.",
      "Updated the 2025/2052 transition dates and the >100 W interoperability exemption.",
      "Marked the ESPR ICT delegated act as provisional, expected in 2029.",
      "Added the evidence and program-timing fields to the assessment model.",
    ],
    reviewedBy: "Raka Adrianto",
  },
];
