import type { Metadata } from "next";
import Link from "next/link";
import { TrustPageLayout } from "@/components/TrustPageLayout";
import { OFFICIAL_SOURCES } from "@/lib/sources";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Sources",
  description:
    "Official Canadian sources referenced by CanadaCalc calculators.",
  path: "/sources",
});

export default function SourcesPage() {
  return (
    <TrustPageLayout
      title="Sources"
      description="Reference links for tax, savings, mortgage, and rate assumptions."
    >
      <p>
        We consult public guidance from Canadian authorities when setting
        brackets, limits, and educational context. Links below are for reference
        — not legal or tax advice.
      </p>
      <ul className="space-y-3">
        {Object.entries(OFFICIAL_SOURCES).map(([key, source]) => (
          <li key={key}>
            <a
              href={source.href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[var(--brand)] underline hover:text-[var(--brand-hover)]"
            >
              {source.label}
            </a>
          </li>
        ))}
      </ul>
      <p className="text-slate-600">
        Calculator-specific source links also appear in each tool&apos;s footer
        section. Read our{" "}
        <Link href="/methodology" className="text-[var(--brand)] underline">
          methodology
        </Link>{" "}
        for how we apply these references.
      </p>
    </TrustPageLayout>
  );
}
