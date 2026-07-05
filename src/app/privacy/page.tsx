import type { Metadata } from "next";
import Link from "next/link";
import { TrustPageLayout } from "@/components/TrustPageLayout";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Privacy",
  description:
    "How CanadaCalc handles your data — calculators run in your browser without signup.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <TrustPageLayout
      title="Privacy"
      description="Simple, privacy-friendly calculators with no account required."
    >
      <p>
        CanadaCalc is built to minimize data collection. You can use every
        calculator without creating an account or entering identifying
        information.
      </p>
      <h2 className="text-lg font-semibold text-[#0f172a]">What we store</h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          <strong>Calculator inputs</strong> may be saved in your browser&apos;s
          local storage so your numbers persist when you return. This never
          leaves your device unless you share results yourself.
        </li>
        <li>
          <strong>Analytics</strong> (production only): we use Google Analytics
          to understand aggregate traffic — not to profile individual users.
        </li>
        <li>
          <strong>Stock lookback</strong> sends ticker symbols and dates to our
          server to fetch public market data from Yahoo Finance. We do not log
          personal identifiers with those requests.
        </li>
      </ul>
      <h2 className="text-lg font-semibold text-[#0f172a]">What we do not do</h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>Require signup or collect names, SINs, or account numbers</li>
        <li>Sell your data to third parties</li>
        <li>Store your tax or income details on our servers</li>
      </ul>
      <p>
        For questions, contact us via the{" "}
        <Link href="/contact" className="text-[var(--brand)] underline">
          contact page
        </Link>
        .
      </p>
    </TrustPageLayout>
  );
}
