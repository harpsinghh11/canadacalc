export const SITE_NAME = "CanadaCalc";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://canadacalc.net";

export const SITE_TAGLINE =
  "Canadian calculators that explain what the numbers mean.";

export const HOMEPAGE_HEADLINE = "Calculate smarter. Built for Canada.";

export const HOMEPAGE_SUBHEADLINE =
  "Free Canadian calculators for tax, mortgages, saving, investing, and everyday math — with clear results and simple explanations.";

export const NAVY = "#0f172a";
/** @deprecated Use CSS var(--positive) for positive financial semantics, var(--brand) for accents. */
export const GREEN = "#15803d";

export type CalculatorCategoryId =
  | "everyday"
  | "tax"
  | "savings"
  | "mortgage"
  | "retirement"
  | "stocks";

export const CALCULATOR_CATEGORIES: {
  id: CalculatorCategoryId;
  title: string;
  description: string;
}[] = [
  {
    id: "everyday",
    title: "Everyday Math",
    description: "Quick online and scientific calculators — no signup.",
  },
  {
    id: "tax",
    title: "Tax & Income",
    description: "Estimate income tax, deductions, and take-home pay.",
  },
  {
    id: "savings",
    title: "Saving & Investing",
    description: "TFSA, FHSA, compound interest, and rate math.",
  },
  {
    id: "mortgage",
    title: "Home & Mortgage",
    description: "Canadian mortgage payments and amortization.",
  },
  {
    id: "retirement",
    title: "Retirement",
    description: "Plan savings and withdrawal timelines.",
  },
  {
    id: "stocks",
    title: "Stocks",
    description: "Look back at stock performance vs benchmarks.",
  },
];

/** Primary calculator products — homepage discovery and All Tools navigation. */
export const CALCULATORS = [
  {
    href: "/calculator",
    title: "Online Calculator",
    description:
      "A fast everyday calculator for addition, subtraction, percentages, and more.",
    icon: "🔢",
    category: "everyday" as const,
    navLabel: "Calculator",
  },
  {
    href: "/scientific-calculator",
    title: "Scientific Calculator",
    description:
      "Trigonometry, logarithms, powers, and constants with DEG/RAD modes.",
    icon: "🧮",
    category: "everyday" as const,
    navLabel: "Scientific",
  },
  {
    href: "/tax",
    title: "Canadian Income Tax Calculator",
    description:
      "Estimate federal and provincial income tax with annual Canadian tax brackets.",
    icon: "🧾",
    category: "tax" as const,
    navLabel: "Tax",
  },
  {
    href: "/tfsa",
    title: "TFSA Calculator",
    description:
      "Project your Tax-Free Savings Account growth to retirement with contribution limits explained in plain language.",
    icon: "🏦",
    category: "savings" as const,
    navLabel: "TFSA",
  },
  {
    href: "/fhsa",
    title: "FHSA Calculator",
    description:
      "Plan your First Home Savings Account with tax-deductible contributions and tax-free growth.",
    icon: "🏡",
    category: "savings" as const,
    navLabel: "FHSA",
  },
  {
    href: "/compound",
    title: "Compound Interest",
    description:
      "See how your savings grow over time with customizable compounding frequency.",
    icon: "📈",
    category: "savings" as const,
    navLabel: "Compound",
  },
  {
    href: "/simple-interest",
    title: "Simple Interest",
    description:
      "Calculate simple interest on savings or loans with a clean, straightforward formula.",
    icon: "➕",
    category: "savings" as const,
    navLabel: "Simple Interest",
  },
  {
    href: "/find-interest-rate",
    title: "Find Interest Rate",
    description:
      "Work backwards from your savings goal to find the annual return you need.",
    icon: "🎯",
    category: "savings" as const,
    navLabel: "Find Rate",
  },
  {
    href: "/mortgage",
    title: "Mortgage Calculator",
    description:
      "Calculate Canadian mortgage payments with semi-annual compounding rules.",
    icon: "🏠",
    category: "mortgage" as const,
    navLabel: "Mortgage",
  },
  {
    href: "/retirement",
    title: "Retirement Calculator",
    description:
      "Plan your retirement savings and estimate how long your nest egg will last.",
    icon: "🌅",
    category: "retirement" as const,
    navLabel: "Retirement",
  },
  {
    href: "/stocklookback",
    title: "Stock Lookback",
    description:
      "See what your stock investment would be worth today if you bought years ago.",
    icon: "🚀",
    category: "stocks" as const,
    navLabel: "Stock Lookback",
  },
] as const;

/**
 * Curated province tax landing pages — searchable via CalculatorSearch,
 * linked from /tax, included in sitemap. Not shown in primary product navigation.
 */
export const CURATED_TAX_PAGES = [
  { href: "/tax/ontario", label: "Ontario Tax Calculator" },
  { href: "/tax/british-columbia", label: "BC Tax Calculator" },
  { href: "/tax/alberta", label: "Alberta Tax Calculator" },
  { href: "/tax/quebec", label: "Quebec Tax Calculator" },
] as const;

export const TRUST_PAGES = [
  { href: "/about", label: "About" },
  { href: "/methodology", label: "Methodology" },
  { href: "/sources", label: "Sources" },
  { href: "/updates", label: "Updates" },
  { href: "/privacy", label: "Privacy" },
  { href: "/contact", label: "Contact" },
] as const;

export const PROVINCES = [
  { code: "AB", name: "Alberta" },
  { code: "BC", name: "British Columbia" },
  { code: "MB", name: "Manitoba" },
  { code: "NB", name: "New Brunswick" },
  { code: "NL", name: "Newfoundland and Labrador" },
  { code: "NS", name: "Nova Scotia" },
  { code: "NT", name: "Northwest Territories" },
  { code: "NU", name: "Nunavut" },
  { code: "ON", name: "Ontario" },
  { code: "PE", name: "Prince Edward Island" },
  { code: "QC", name: "Quebec" },
  { code: "SK", name: "Saskatchewan" },
  { code: "YT", name: "Yukon" },
] as const;

/** @deprecated Use PROVINCES — all 13 jurisdictions supported in tax engine. */
export const TAX_PROVINCES = PROVINCES;

export const TERRITORY_CODES = ["NT", "NU", "YT"] as const;

export function getCalculatorsByCategory(category: CalculatorCategoryId) {
  return CALCULATORS.filter((c) => c.category === category);
}

/** Finance calculators shown on the homepage (flat grid, no categories). */
export const HOMEPAGE_CALCULATOR_HREFS = [
  "/tfsa",
  "/fhsa",
  "/compound",
  "/simple-interest",
  "/mortgage",
  "/retirement",
  "/tax",
  "/stocklookback",
  "/find-interest-rate",
] as const;

export function getHomepageCalculators() {
  return HOMEPAGE_CALCULATOR_HREFS.map((href) =>
    CALCULATORS.find((c) => c.href === href),
  ).filter((c): c is (typeof CALCULATORS)[number] => c !== undefined);
}
