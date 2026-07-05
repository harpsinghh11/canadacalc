import {
  CALCULATOR_CATEGORIES,
  CALCULATORS,
} from "@/lib/constants";
import { TAX_YEAR } from "@/lib/tax";
import { FeaturedCalculatorCard } from "./FeaturedCalculatorCard";
import { MediumToolTile } from "./MediumToolTile";
import { CompactToolLink } from "./CompactToolLink";

const FEATURED_HREFS = [
  "/tax",
  "/mortgage",
  "/retirement",
  "/stocklookback",
] as const;

const FEATURED_META: Record<
  (typeof FEATURED_HREFS)[number],
  {
    categoryLabel: string;
    actionLabel: string;
    motif: "tax" | "mortgage" | "retirement" | "stocks";
  }
> = {
  "/tax": {
    categoryLabel: "Tax & Income",
    actionLabel: `Estimate ${TAX_YEAR} tax`,
    motif: "tax",
  },
  "/mortgage": {
    categoryLabel: "Home & Mortgage",
    actionLabel: "Estimate payments",
    motif: "mortgage",
  },
  "/retirement": {
    categoryLabel: "Retirement",
    actionLabel: "Plan your future",
    motif: "retirement",
  },
  "/stocklookback": {
    categoryLabel: "Stocks",
    actionLabel: "Look back",
    motif: "stocks",
  },
};

const HOMEPAGE_DISPLAY_COPY: Partial<
  Record<string, { title?: string; description?: string }>
> = {
  "/tax": { title: "Income Tax Calculator" },
  "/tfsa": {
    description: "Project tax-free savings growth and future contributions.",
  },
  "/fhsa": {
    description: "Plan tax-deductible savings toward your first home.",
  },
};

const MEDIUM_SAVINGS_HREFS = ["/tfsa", "/fhsa"] as const;
const COMPACT_SAVINGS_HREFS = [
  "/compound",
  "/simple-interest",
  "/find-interest-rate",
] as const;
const EVERYDAY_HREFS = ["/scientific-calculator", "/calculator"] as const;

function getCalculator(href: string) {
  return CALCULATORS.find((c) => c.href === href);
}

export function HomepageCalculatorDiscovery() {
  const savingsCategory = CALCULATOR_CATEGORIES.find((c) => c.id === "savings");
  const everydayCategory = CALCULATOR_CATEGORIES.find((c) => c.id === "everyday");

  return (
    <section
      className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8"
      aria-labelledby="calculator-discovery-heading"
    >
      <header className="max-w-2xl">
        <h2
          id="calculator-discovery-heading"
          className="text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl"
        >
          Choose a calculator
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--muted)] sm:text-base">
          Clear tools for Canadian money decisions and everyday math.
        </p>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
        {FEATURED_HREFS.map((href) => {
          const calc = getCalculator(href);
          const meta = FEATURED_META[href];
          if (!calc || !meta) return null;
          return (
            <FeaturedCalculatorCard
              key={href}
              href={calc.href}
              categoryLabel={meta.categoryLabel}
              title={HOMEPAGE_DISPLAY_COPY[href]?.title ?? calc.title}
              description={calc.description}
              actionLabel={meta.actionLabel}
              motif={meta.motif}
            />
          );
        })}
      </div>

      <div className="mt-6 grid gap-5 lg:mt-8 lg:grid-cols-12 lg:gap-6">
        <div className="rounded-[var(--radius-surface)] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6 lg:col-span-8">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-[var(--foreground)]">
              {savingsCategory?.title ?? "Saving & Investing"}
            </h3>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Grow, plan, and understand your money.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {MEDIUM_SAVINGS_HREFS.map((href) => {
              const calc = getCalculator(href);
              if (!calc) return null;
              return (
                <MediumToolTile
                  key={href}
                  href={calc.href}
                  title={calc.title}
                  description={
                    HOMEPAGE_DISPLAY_COPY[href]?.description ?? calc.description
                  }
                />
              );
            })}
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {COMPACT_SAVINGS_HREFS.map((href) => {
              const calc = getCalculator(href);
              if (!calc) return null;
              return (
                <CompactToolLink key={href} href={calc.href} title={calc.title} />
              );
            })}
          </div>
        </div>

        <div className="rounded-[var(--radius-surface)] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6 lg:col-span-4">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-[var(--foreground)]">
              {everydayCategory?.title ?? "Everyday Math"}
            </h3>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Quick tools. No signup required.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            {EVERYDAY_HREFS.map((href) => {
              const calc = getCalculator(href);
              if (!calc) return null;
              return (
                <CompactToolLink
                  key={href}
                  href={calc.href}
                  title={calc.title}
                  description={calc.description}
                />
              );
            })}
          </div>

          <p className="mt-4 text-xs text-[var(--muted)]">
            Calculations run in your browser.
          </p>
        </div>
      </div>
    </section>
  );
}
