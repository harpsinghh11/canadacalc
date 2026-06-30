export const SITE_NAME = "CanadaCalc";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://canadacalc.net";

export const NAVY = "#0f172a";
export const GREEN = "#16a34a";

export const CALCULATORS = [
  {
    href: "/tfsa",
    title: "TFSA Calculator",
    description:
      "Project your Tax-Free Savings Account growth to retirement with 2025 contribution limits.",
    icon: "🏦",
  },
  {
    href: "/fhsa",
    title: "FHSA Calculator",
    description:
      "Plan your First Home Savings Account with tax-deductible contributions and tax-free growth.",
    icon: "🏡",
  },
  {
    href: "/compound",
    title: "Compound Interest",
    description:
      "See how your savings grow over time with customizable compounding frequency.",
    icon: "📈",
  },
  {
    href: "/simple-interest",
    title: "Simple Interest",
    description:
      "Calculate simple interest on savings or loans with a clean, straightforward formula.",
    icon: "➕",
  },
  {
    href: "/mortgage",
    title: "Mortgage Calculator",
    description:
      "Calculate Canadian mortgage payments with semi-annual compounding rules.",
    icon: "🏠",
  },
  {
    href: "/retirement",
    title: "Retirement Calculator",
    description:
      "Plan your retirement savings and estimate how long your nest egg will last.",
    icon: "🌅",
  },
  {
    href: "/tax",
    title: "Income Tax Calculator",
    description:
      "Estimate federal and provincial income tax with 2025 Canadian tax brackets.",
    icon: "🧾",
  },
  {
    href: "/stocklookback",
    title: "Stock Lookback",
    description:
      "See what your stock investment would be worth today if you bought years ago.",
    icon: "🚀",
  },
  {
    href: "/find-interest-rate",
    title: "Find Interest Rate",
    description:
      "Work backwards from your savings goal to find the annual return you need.",
    icon: "🎯",
  },
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

/** 10 provinces used for tax calculator dropdown */
export const TAX_PROVINCES = PROVINCES.filter(
  (p) => !["NT", "NU", "YT"].includes(p.code),
);
