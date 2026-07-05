import type { Metadata } from "next";
import { TrustPageLayout } from "@/components/TrustPageLayout";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Updates",
  description: "Recent changes and improvements to CanadaCalc.",
  path: "/updates",
});

const UPDATES = [
  {
    date: "July 2026",
    items: [
      "Tax engine updated to 2026 CRA T4127 / T4032 rules — all 13 provinces and territories",
      "Added online calculator and scientific calculator under Everyday Math",
      "Curated province tax pages: Ontario, British Columbia, Alberta, and Quebec",
      "Homepage repositioned as Free Canadian Calculators & Financial Tools",
      "Navbar grouped All Tools menu; footer uses neutral trust messaging",
      "Quebec: QPP, reduced EI rate, and 16.5% federal abatement modeled",
    ],
  },
  {
    date: "June 2026",
    items: [
      "Added About, Contact, Privacy, Methodology, Sources, and Updates pages",
      "Improved calculator explanations, assumptions, and official source links",
      "SEO: canonical URLs, Open Graph, and structured metadata on all pages",
    ],
  },
  {
    date: "Earlier",
    items: [
      "Nine Canadian financial calculators launched",
      "Mobile-friendly layouts with sticky navigation",
      "Stock lookback with S&P 500 comparison chart",
    ],
  },
];

export default function UpdatesPage() {
  return (
    <TrustPageLayout
      title="Updates"
      description="What's new and improved on CanadaCalc."
    >
      {UPDATES.map((entry) => (
        <div key={entry.date}>
          <h2 className="text-lg font-semibold text-[#0f172a]">{entry.date}</h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            {entry.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </TrustPageLayout>
  );
}
