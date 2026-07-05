import { calculateEmploymentTaxExample, TAX_YEAR } from "@/lib/tax";
import { formatCurrency, formatPercent } from "@/lib/format";

export interface ProvinceTaxPageConfig {
  slug: string;
  provinceCode: string;
  provinceName: string;
  seoTitle: string;
  h1: string;
  metaDescription: string;
  intro: string;
  howCalculated: string;
  federalVsProvincial: string;
  marginalVsEffective: string;
  cppEiNotes: string;
  provinceNotes: string[];
  faqs: { q: string; a: string }[];
  officialSources: Array<{ label: string; href: string }>;
}

const EXAMPLE_INCOMES = [50_000, 75_000, 100_000, 150_000] as const;

export function getProvinceIncomeExamples(provinceCode: string) {
  return EXAMPLE_INCOMES.map((income) => {
    const result = calculateEmploymentTaxExample(provinceCode, income);
    const payroll =
      result.cpp + result.cpp2 + result.ei + result.qpip;
    return {
      income,
      afterTax: result.afterTaxIncome,
      totalTax: result.federalTax + result.provincialTax + payroll,
      effectiveRate: result.effectiveTaxRate,
      marginalRate: result.marginalTaxRate,
    };
  });
}

export const PROVINCE_TAX_PAGES: Record<string, ProvinceTaxPageConfig> = {
  ontario: {
    slug: "ontario",
    provinceCode: "ON",
    provinceName: "Ontario",
    seoTitle: "Ontario Tax Calculator 2026",
    h1: "Ontario Income Tax Calculator 2026",
    metaDescription:
      "Estimate Ontario income tax, federal tax, CPP, and EI on employment income. See after-tax pay examples and how Ontario brackets work.",
    intro:
      "Use this Ontario tax calculator to estimate federal and provincial income tax on your salary or wages. Ontario uses progressive brackets on top of federal tax — results include CPP and EI for a typical employee.",
    howCalculated:
      "We apply 2026 annual federal brackets plus Ontario brackets starting at 5.05%. Provincial basic personal credit, surtax, Ontario Health Premium, and low-income tax reduction are included. CPP2 applies on earnings between $74,600 and $85,000. This is an annual estimate — not payroll withholding.",
    federalVsProvincial:
      "Federal tax is the same across Canada (with standard credits). Ontario adds its own brackets on the same taxable income base. At $75,000 employment income with no deductions, you pay both layers before CPP and EI.",
    marginalVsEffective:
      "Your marginal rate in Ontario is the combined federal + Ontario rate on your next dollar of income. Your effective rate is total tax divided by gross income — usually lower because the first dollars are taxed at lower brackets.",
    cppEiNotes:
      "CPP is 5.95% on pensionable employment earnings between $3,500 and $74,600 (2026 YMPE), plus 4% CPP2 on earnings from $74,600 to $85,000. EI is 1.63% on insurable earnings up to $68,900.",
    provinceNotes: [
      "Ontario surtax and Ontario Health Premium are included in provincial tax for this annual estimate.",
      "Ontario’s lowest provincial bracket is 5.05% on the first $53,891 of taxable income (2026).",
      "Dependant-based Ontario tax reduction (Y factor) is not modeled — default single filer assumed.",
    ],
    faqs: [
      {
        q: "What is the Ontario tax rate for $75,000?",
        a: "On $75,000 employment income with no deductions, expect combined federal and Ontario income tax plus CPP and EI. Use the calculator above for your exact inputs — marginal rates rise as income crosses bracket thresholds.",
      },
      {
        q: "Does this include the Ontario Health Premium?",
        a: "Yes. OHP is included in the provincial tax estimate based on taxable income bands for 2026.",
      },
      {
        q: "How is Ontario different from other provinces?",
        a: "Ontario’s provincial rates are moderate compared with Atlantic provinces but the surtax and OHP can increase total tax at higher incomes.",
      },
      {
        q: "Can I compare Ontario with another province?",
        a: "Yes — use the main Canada tax calculator and change the province dropdown to compare Ontario with any province or territory.",
      },
    ],
    officialSources: [
      {
        label: "CRA T4127 — Payroll formulas (2026)",
        href: "https://www.canada.ca/en/revenue-agency/services/forms-publications/payroll/t4127-payroll-deductions-formulas/t4127-jan/t4127-jan-payroll-deductions-formulas-computer-programs.html",
      },
      {
        label: "CRA T4032 — Ontario payroll tables",
        href: "https://www.canada.ca/en/revenue-agency/services/forms-publications/payroll/t4032-payroll-deductions-tables/t4032on-jan/t4032on-january-general-information.html",
      },
    ],
  },
  "british-columbia": {
    slug: "british-columbia",
    provinceCode: "BC",
    provinceName: "British Columbia",
    seoTitle: "British Columbia Tax Calculator 2026",
    h1: "British Columbia Income Tax Calculator 2026",
    metaDescription:
      "Estimate BC income tax, federal tax, CPP, and EI on employment income. British Columbia bracket examples and after-tax pay explained.",
    intro:
      "British Columbia stacks provincial brackets on federal tax. This BC tax calculator estimates take-home pay on employment income using 2026 CRA and provincial rates.",
    howCalculated:
      "Federal tax uses 2026 annual brackets. BC provincial tax uses the annual 5.6% lowest rate (not the 6.14% July payroll catch-up rate). Provincial basic personal credit and BC low-income tax reduction are included.",
    federalVsProvincial:
      "BC’s provincial rates are among the lower starts in Canada, but additional brackets reach 20.5% on income over $265,545. Federal tax applies equally before the provincial layer.",
    marginalVsEffective:
      "A Vancouver salary of $100,000 does not mean all income is taxed at the top BC rate — only income above each threshold is. Effective rate reflects the blend across brackets.",
    cppEiNotes:
      "BC employees pay CPP (5.95% employee share), CPP2 (4% on $74,600–$85,000), and EI (1.63%) on employment income using 2026 maximums.",
    provinceNotes: [
      "BC uses the annual 5.6% lowest rate — not the 6.14% mid-year payroll proration rate.",
      "BC low-income tax reduction (up to $690) is included for qualifying incomes.",
      "MSP premiums were eliminated; health care is funded through general revenue.",
      "BC speculation and vacancy taxes on property are separate from income tax.",
    ],
    faqs: [
      {
        q: "What are BC’s 2026 tax brackets?",
        a: "BC has seven brackets in 2026, from 5.6% (annual rate) up to 20.5% on income over $265,545. See the calculator results for your income level.",
      },
      {
        q: "Is BC tax higher than Alberta?",
        a: "Generally yes at most income levels — Alberta has no provincial sales tax and lower provincial income tax rates. Use both province pages or the main calculator to compare your situation.",
      },
      {
        q: "Does this calculator include the BC climate action tax credit?",
        a: "No. Refundable credits like the climate action tax credit are not modeled.",
      },
    ],
    officialSources: [
      {
        label: "CRA T4127 — Payroll formulas (2026)",
        href: "https://www.canada.ca/en/revenue-agency/services/forms-publications/payroll/t4127-payroll-deductions-formulas/t4127-jan/t4127-jan-payroll-deductions-formulas-computer-programs.html",
      },
      {
        label: "CRA T4032 — BC payroll tables",
        href: "https://www.canada.ca/en/revenue-agency/services/forms-publications/payroll/t4032-payroll-deductions-tables/t4032bc-jan/t4032bc-january-general-information.html",
      },
    ],
  },
  alberta: {
    slug: "alberta",
    provinceCode: "AB",
    provinceName: "Alberta",
    seoTitle: "Alberta Tax Calculator 2026",
    h1: "Alberta Income Tax Calculator 2026",
    metaDescription:
      "Estimate Alberta income tax, federal tax, CPP, and EI on employment income. Alberta has no provincial sales tax — see how provincial brackets affect take-home pay.",
    intro:
      "Alberta’s provincial income tax uses a flat-ish progressive structure with a low starting rate of 8%. This calculator estimates federal + Alberta tax plus CPP and EI for 2026.",
    howCalculated:
      "Alberta restructured brackets in recent years — 2026 rates run from 8% to 15% across six brackets. Federal tax uses the 14% lowest bracket introduced for 2026.",
    federalVsProvincial:
      "Alberta provincial tax is typically lower than BC or Ontario at the same income. Combined marginal rates still include federal tax on every dollar.",
    marginalVsEffective:
      "Alberta’s first $61,200 of taxable income is taxed at 8% provincially. Effective rate on a $100,000 salary is well below the top marginal rate because lower brackets apply first.",
    cppEiNotes:
      "Alberta uses standard CPP (5.95%) and EI (1.63%) rates for 2026. No provincial pension plan replaces CPP.",
    provinceNotes: [
      "Alberta has no PST — that affects spending, not this income tax estimate.",
      "Alberta’s 2026 basic personal amount ($22,769) is credited against provincial tax.",
      "CPP2 applies on pensionable earnings between $74,600 and $85,000.",
    ],
    faqs: [
      {
        q: "Why is Alberta tax often lower?",
        a: "Alberta’s provincial rates start at 8% and top out at 15%, lower than most provinces. Federal tax is the same nationwide.",
      },
      {
        q: "What is Alberta’s top tax rate in 2026?",
        a: "15% provincial on taxable income over $370,220, plus federal tax up to 33% at the highest federal bracket.",
      },
      {
        q: "Does Alberta have health premiums?",
        a: "No provincial health premium is charged on income tax in Alberta.",
      },
    ],
    officialSources: [
      {
        label: "CRA T4127 — Payroll formulas (2026)",
        href: "https://www.canada.ca/en/revenue-agency/services/forms-publications/payroll/t4127-payroll-deductions-formulas/t4127-jan/t4127-jan-payroll-deductions-formulas-computer-programs.html",
      },
      {
        label: "CRA T4032 — Alberta payroll tables",
        href: "https://www.canada.ca/en/revenue-agency/services/forms-publications/payroll/t4032-payroll-deductions-tables/t4032ab-jan/t4032ab-january-general-information.html",
      },
    ],
  },
  quebec: {
    slug: "quebec",
    provinceCode: "QC",
    provinceName: "Quebec",
    seoTitle: "Quebec Tax Calculator 2026",
    h1: "Quebec Income Tax Calculator 2026",
    metaDescription:
      "Estimate Quebec income tax, federal tax after abatement, QPP, and EI on employment income. Quebec-specific brackets and assumptions explained.",
    intro:
      "Quebec administers its own provincial tax system. This Quebec tax calculator applies Revenu Québec 2026 brackets, the federal Quebec abatement, QPP instead of CPP, and the reduced Quebec EI rate.",
    howCalculated:
      "Provincial tax uses Revenu Québec 2026 annual brackets (14% to 25.75%). Federal tax is calculated then reduced by the 16.5% Quebec abatement. QPP (6.3% tier 1), QPP2 (4% tier 2), QPIP, and reduced Quebec EI are included.",
    federalVsProvincial:
      "Quebec residents pay provincial tax to Revenu Québec and federal tax after the abatement — you do not pay the full federal amount plus Quebec as if they were independent stacks without adjustment.",
    marginalVsEffective:
      "Quebec’s combined marginal rates are often among the highest in Canada at upper incomes. Effective rate on a typical salary is lower than the top marginal rate shown.",
    cppEiNotes:
      "Quebec uses QPP (6.3% employee tier 1) instead of CPP, plus QPP2 (4% on $74,600–$85,000). EI uses the Quebec rate of 1.30% on insurable earnings up to $68,900. QPIP employee premium is 0.43% up to $103,000.",
    provinceNotes: [
      "Quebec’s 2026 basic personal amount ($18,952) is credited against provincial tax.",
      "QPIP employee premiums are included for employment income.",
      "Revenu Québec administers provincial tax separately from CRA for most individuals.",
    ],
    faqs: [
      {
        q: "Why does Quebec use QPP instead of CPP?",
        a: "Quebec operates the Quebec Pension Plan (QPP) parallel to CPP. Employee contributions use a slightly higher rate than CPP in 2026.",
      },
      {
        q: "What is the Quebec abatement?",
        a: "Quebec residents receive a 16.5% reduction on federal income tax, reflecting historical tax arrangements. This calculator applies it automatically for QC.",
      },
      {
        q: "Are Quebec tax brackets different from other provinces?",
        a: "Yes. Revenu Québec sets its own brackets and rates. 2026 thresholds are indexed 2.05% from 2025.",
      },
      {
        q: "Is EI lower in Quebec?",
        a: "Yes — the 2026 employee EI rate in Quebec is 1.30% vs 1.63% elsewhere, because Quebec has QPIP for parental benefits.",
      },
    ],
    officialSources: [
      {
        label: "Revenu Québec — Income tax rates (2026)",
        href: "https://www.revenuquebec.ca/en/citizens/income-tax-return/completing-your-income-tax-return/income-tax-rates/",
      },
      {
        label: "CRA T4127 — QPP and Quebec EI (2026)",
        href: "https://www.canada.ca/en/revenue-agency/services/forms-publications/payroll/t4127-payroll-deductions-formulas/t4127-jan/t4127-jan-payroll-deductions-formulas-computer-programs.html",
      },
    ],
  },
};

export function formatExampleTableRow(
  income: number,
  afterTax: number,
  effectiveRate: number,
) {
  return {
    incomeLabel: formatCurrency(income),
    afterTaxLabel: formatCurrency(afterTax),
    effectiveLabel: formatPercent(effectiveRate),
  };
}

export { TAX_YEAR };
