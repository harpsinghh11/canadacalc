import type { ReactNode } from "react";
import Link from "next/link";
import { HOMEPAGE_HEADLINE, HOMEPAGE_SUBHEADLINE } from "@/lib/constants";
import { FinancialHealthQuiz } from "@/components/FinancialHealthQuiz";
import { HomepageCalculatorDiscovery } from "@/components/homepage/HomepageCalculatorDiscovery";
import { CalculatorSearch } from "@/components/ui/CalculatorSearch";
import { createPageMetadata } from "@/lib/metadata";
import type { Metadata } from "next";
import { MapPin, MessageSquare, Shield, Smartphone } from "lucide-react";

export const metadata: Metadata = createPageMetadata({
  title: "Free Canadian Calculators & Financial Tools",
  description:
    "Simple calculators for Canadian money decisions, investing, tax, mortgages, and everyday math. Free tools with plain-English explanations — no signup.",
  path: "/",
});

const POPULAR_LINKS = [
  { href: "/tax", label: "Tax" },
  { href: "/mortgage", label: "Mortgage" },
  { href: "/tfsa", label: "TFSA" },
  { href: "/stocklookback", label: "Stock Lookback" },
];

export default function HomePage() {
  return (
    <>
      <section className="bg-[var(--navy)] px-4 py-14 text-white sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-white/70">
            Free · No signup · Built for Canada
          </p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
            {HOMEPAGE_HEADLINE}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
            {HOMEPAGE_SUBHEADLINE}
          </p>
          <div className="mx-auto mt-8 max-w-xl text-left">
            <CalculatorSearch />
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {POPULAR_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-white/40 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <HomepageCalculatorDiscovery />

      <FinancialHealthQuiz />

      <section className="border-t border-[var(--border)] bg-[var(--surface-muted)] px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-2xl font-bold text-[var(--foreground)]">
            Why CanadaCalc?
          </h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <TrustItem
              icon={<MapPin className="h-6 w-6 text-[var(--brand)]" />}
              title="Canadian-specific"
              description="CRA tax brackets, TFSA limits, and Canadian mortgage compounding — labeled clearly by tax year."
            />
            <TrustItem
              icon={<MessageSquare className="h-6 w-6 text-[var(--brand)]" />}
              title="Explains results"
              description="Plain-English summaries, assumptions, and tips — not just raw numbers."
            />
            <TrustItem
              icon={<Shield className="h-6 w-6 text-[var(--brand)]" />}
              title="No signup"
              description="Your inputs stay in your browser. No account required."
            />
            <TrustItem
              icon={<Smartphone className="h-6 w-6 text-[var(--brand)]" />}
              title="Mobile friendly"
              description="Works on phones, tablets, and desktops."
            />
          </div>
        </div>
      </section>
    </>
  );
}

function TrustItem({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div
        className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--surface)]"
        aria-hidden
      >
        {icon}
      </div>
      <h3 className="mt-3 font-semibold text-[var(--foreground)]">{title}</h3>
      <p className="mt-2 text-sm text-[var(--muted)]">{description}</p>
    </div>
  );
}
