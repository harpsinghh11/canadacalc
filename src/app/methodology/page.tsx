import type { Metadata } from "next";
import Link from "next/link";
import { TrustPageLayout } from "@/components/TrustPageLayout";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Methodology",
  description:
    "How CanadaCalc builds formulas, chooses assumptions, and updates calculators.",
  path: "/methodology",
});

export default function MethodologyPage() {
  return (
    <TrustPageLayout
      title="Methodology"
      description="How we calculate, what we assume, and what we leave out."
    >
      <p>
        Each calculator uses published formulas appropriate to its topic — for
        example, Canadian semi-annual mortgage compounding, marginal tax
        brackets, or compound interest with configurable frequency.
      </p>
      <h2 className="text-lg font-semibold text-[#0f172a]">Assumptions</h2>
      <p>
        We state key assumptions near results and in each calculator&apos;s
        &ldquo;How this is calculated&rdquo; section. Common simplifications
        include: steady contribution rates, flat investment returns, no
        inflation adjustment (unless noted), and exclusion of credits you have
        not entered.
      </p>
      <h2 className="text-lg font-semibold text-[#0f172a]">Official rates</h2>
      <p>
        Where calculators rely on CRA limits, tax brackets, CPP/EI rates, or
        OSFI mortgage guidance, we label the tax year or revision date clearly.
        &ldquo;2025 tax year&rdquo; means rules for the 2025 taxation year even
        when viewed in 2026.
      </p>
      <h2 className="text-lg font-semibold text-[#0f172a]">Limitations</h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>Estimates only — not professional advice</li>
        <li>May not include every credit, deduction, or provincial nuance</li>
        <li>Stock tools use price history, not total return with dividends</li>
        <li>Tax calculator covers all 13 provinces and territories</li>
      </ul>
      <p>
        See our{" "}
        <Link href="/sources" className="text-[var(--brand)] underline">
          sources
        </Link>{" "}
        page for reference links and the{" "}
        <Link href="/updates" className="text-[var(--brand)] underline">
          updates
        </Link>{" "}
        log for recent changes.
      </p>
    </TrustPageLayout>
  );
}
