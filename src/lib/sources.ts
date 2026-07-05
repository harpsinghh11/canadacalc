/** Official reference links — use in methodology footers, not as legal disclaimers. */
export const OFFICIAL_SOURCES = {
  cra: {
    label: "Canada Revenue Agency (CRA)",
    href: "https://www.canada.ca/en/revenue-agency.html",
  },
  craTfsa: {
    label: "CRA — Tax-Free Savings Account (TFSA)",
    href: "https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/tax-free-savings-account.html",
  },
  craFhsa: {
    label: "CRA — First Home Savings Account (FHSA)",
    href: "https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/first-home-savings-account.html",
  },
  craRrsp: {
    label: "CRA — RRSP",
    href: "https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/rrsps-related-plans.html",
  },
  craTax: {
    label: "CRA — Income tax rates",
    href: "https://www.canada.ca/en/revenue-agency/services/tax/individuals/frequently-asked-questions-individuals/canadian-income-tax-rates-individuals-current-previous-years.html",
  },
  craT4127: {
    label: "CRA T4127 — Payroll deduction formulas (2026)",
    href: "https://www.canada.ca/en/revenue-agency/services/forms-publications/payroll/t4127-payroll-deductions-formulas/t4127-jan/t4127-jan-payroll-deductions-formulas-computer-programs.html",
  },
  craT4032: {
    label: "CRA T4032 — Payroll deduction tables",
    href: "https://www.canada.ca/en/revenue-agency/services/forms-publications/payroll/t4032-payroll-deductions-tables.html",
  },
  revenuQuebec: {
    label: "Revenu Québec — Income tax rates",
    href: "https://www.revenuquebec.ca/en/citizens/income-tax-return/completing-your-income-tax-return/income-tax-rates/",
  },
  osfi: {
    label: "OSFI — Mortgage stress test",
    href: "https://www.osfi-bsif.gc.ca/en/guidance/guidance-library/guideline-b-20",
  },
  fcac: {
    label: "FCAC — Mortgages & loans",
    href: "https://www.canada.ca/en/financial-consumer-agency/services/mortgages.html",
  },
  bankOfCanada: {
    label: "Bank of Canada",
    href: "https://www.bankofcanada.ca/",
  },
} as const;

export type OfficialSourceKey = keyof typeof OFFICIAL_SOURCES;
