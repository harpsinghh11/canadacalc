"use client";

import Link from "next/link";
import { useMemo, type ReactNode } from "react";
import {
  CalculatorGrid,
  CalculatorLayout,
  FormField,
  inputClassName,
  selectClassName,
} from "@/components/CalculatorLayout";
import { TaxYearBadge } from "@/components/ui/TaxYearBadge";
import { ResetButton } from "@/components/ui/ResetButton";
import { HowWeCalculate } from "@/components/ui/HowWeCalculate";
import { FAQ } from "@/components/ui/FAQ";
import { SmartTips } from "@/components/ui/SmartTips";
import { ShareResultCard } from "@/components/ui/ShareResultCard";
import { MobileResultsBar } from "@/components/ui/MobileResultsBar";
import { ScrollTable } from "@/components/ui/ScrollTable";
import { TaxResultPanel } from "@/components/tax/TaxResultPanel";
import { CalculatorAssumptions } from "@/components/ui/CalculatorAssumptions";
import { OfficialSourceLinks } from "@/components/ui/OfficialSourceLinks";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { usePersistedState } from "@/hooks/usePersistedState";
import { PROVINCES } from "@/lib/constants";
import { calculateTax, TAX_YEAR } from "@/lib/tax";
import { getTaxTips, getBracketAverageTaxRate } from "@/lib/insights";
import { formatCurrency, formatPercent } from "@/lib/format";

const BASE_DEFAULTS = {
  province: "ON",
  employmentIncome: 75000,
  selfEmploymentIncome: 0,
  rentalIncome: 0,
  interestIncome: 0,
  otherIncome: 0,
  otherIncomeLabel: "Side income",
  rrspContribution: 5000,
  fhsaContribution: 0,
  capitalGains: 0,
  eligibleDividends: 0,
};

export interface TaxCalculatorProps {
  defaultProvince?: string;
  lockProvince?: boolean;
  title?: string;
  description?: string;
  storageKey?: string;
  supplementalContent?: ReactNode;
  extraFaqs?: { q: string; a: ReactNode; schemaText?: string }[];
}

export default function TaxCalculator({
  defaultProvince = "ON",
  lockProvince = false,
  title = "Canadian Income Tax Calculator",
  description = "Estimate Canadian income tax, provincial tax, CPP, EI, and after-tax income with plain-English explanations.",
  storageKey = "tax",
  supplementalContent,
  extraFaqs = [],
}: TaxCalculatorProps) {
  const defaults = { ...BASE_DEFAULTS, province: defaultProvince };
  const [inputs, setInputs, resetAll] = usePersistedState(storageKey, defaults);
  const debounced = useDebouncedValue(inputs);

  const result = useMemo(
    () => calculateTax(debounced),
    [debounced],
  );

  const grossIncome =
    debounced.employmentIncome +
    debounced.selfEmploymentIncome +
    debounced.rentalIncome +
    debounced.interestIncome +
    debounced.otherIncome +
    debounced.capitalGains +
    debounced.eligibleDividends;
  const tips = getTaxTips(debounced, result.marginalTaxRate);
  const bracketAvg = getBracketAverageTaxRate(result.taxableIncome);
  const pensionLabel = debounced.province === "QC" ? "QPP" : "CPP";
  const isQuebec = debounced.province === "QC";

  const set = <K extends keyof typeof BASE_DEFAULTS>(
    key: K,
    val: (typeof BASE_DEFAULTS)[K],
  ) => setInputs((prev) => ({ ...prev, [key]: val }));

  const genericFaqs = [
    {
      q: "How is taxable income calculated?",
      a: "Employment, self-employment, rental, interest, and other income, plus 50% of capital gains and grossed-up dividends, minus RRSP and FHSA contributions.",
    },
    {
      q: "How is interest income taxed?",
      a: (
        <>
          Interest from savings accounts, GICs, and bonds is fully taxable at
          your marginal rate. See our{" "}
          <Link href="/compound" className="font-medium text-[var(--brand)] underline">
            compound interest
          </Link>{" "}
          calculator for growth projections.
        </>
      ),
      schemaText:
        "Interest from savings accounts, GICs, and bonds is fully taxable at your marginal rate.",
    },
    {
      q: "What is my marginal tax rate?",
      a: "The tax rate on your next dollar of income — federal plus provincial (or territorial) combined at your current bracket.",
    },
  ];

  return (
    <>
      <CalculatorLayout
        title={title}
        badge={<TaxYearBadge />}
        description={description}
        footer={
          <>
            <section className="mt-8 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-muted)] p-5">
              <h2 className="text-base font-semibold text-[var(--foreground)]">
                Annual tax estimator — sources &amp; assumptions
              </h2>
              <p className="mt-2 text-sm text-[var(--muted)]">
                This is an <strong>annual {TAX_YEAR} income tax estimate</strong>,
                not payroll withholding. Brackets and credits use full-year annual
                rules (CRA T4127 Jan 2026 / T4032). BC uses the 5.6% annual
                lowest rate — not the 6.14% July payroll catch-up rate.
              </p>
              <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-[var(--muted)]">
                <li>Federal BPA phase-out above $181,440</li>
                <li>Provincial basic personal credits for all 13 jurisdictions</li>
                <li>Ontario surtax, Ontario Health Premium, and tax reduction</li>
                <li>Quebec: federal K2Q credits for base QPP, EI, and QPIP; provincial premiums reflected in Quebec basic personal amount</li>
                <li>Enhanced CPP/QPP (first additional + CPP2) deducted from taxable income</li>
                <li>Canada Employment Amount on eligible employment income</li>
                <li>Capital gains: 50% inclusion (2026 enacted rate)</li>
                <li>Eligible dividends: 38% gross-up with federal + provincial DTCs</li>
                <li>
                  Not modeled: most other credits, Top-Up Tax Credit (large
                  medical/tuition claims), non-eligible dividends
                </li>
              </ul>
              <p className="mt-3 text-sm text-[var(--warning)]">
                Results are estimates only — not a substitute for a filed T1
                return or professional advice.
              </p>
              <OfficialSourceLinks
                sources={["cra", "craTax", "craT4127", "craT4032", "craRrsp", "craFhsa", "revenuQuebec"]}
              />
            </section>
            <HowWeCalculate>
              <p>
                We estimate <strong>annual {TAX_YEAR} income tax</strong> on your
                taxable income using federal and provincial/territorial bracket
                tables, basic personal credits, CPP/QPP and EI/QPIP credits,
                enhanced pension deductions, and eligible dividend credits.
                {isQuebec
                  ? " Quebec includes the federal abatement, QPP (with second additional tier), QPIP, and reduced EI."
                  : " CPP includes the second additional tier (CPP2) on income above YMPE. EI uses 2026 maximum insurable earnings."}
              </p>
              <p>
                <strong>Limitations:</strong> Does not include every federal or
                provincial credit (medical, tuition, donations, etc.). Self-employed
                tax may differ; dividend types other than eligible Canadian dividends
                are not modeled.
              </p>
            </HowWeCalculate>
            <FAQ items={[...extraFaqs, ...genericFaqs]} />
          </>
        }
      >
        {supplementalContent}
        <ResetButton onReset={resetAll} />
        <CalculatorGrid
          inputs={
            <div>
              <FormField
                label="Province or territory"
                htmlFor="province"
                tooltip="Tax rates for your province or territory of residence on December 31."
                hint="All 13 provinces and territories supported using 2026 CRA / Revenu Québec tables."
              >
                <select
                  id="province"
                  value={inputs.province}
                  onChange={(e) => set("province", e.target.value)}
                  className={selectClassName}
                  disabled={lockProvince}
                >
                  {PROVINCES.map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField
                label="Employment Income"
                htmlFor="employmentIncome"
                tooltip="Salary, wages, and tips from your job (T4 income)."
              >
                <input
                  id="employmentIncome"
                  type="number"
                  value={inputs.employmentIncome}
                  onChange={(e) =>
                    set("employmentIncome", Number(e.target.value))
                  }
                  className={inputClassName}
                />
              </FormField>
              <FormField
                label="Self-Employment Income"
                htmlFor="selfEmploymentIncome"
              >
                <input
                  id="selfEmploymentIncome"
                  type="number"
                  value={inputs.selfEmploymentIncome}
                  onChange={(e) =>
                    set("selfEmploymentIncome", Number(e.target.value))
                  }
                  className={inputClassName}
                />
              </FormField>
              <FormField label="Rental Income" htmlFor="rentalIncome">
                <input
                  id="rentalIncome"
                  type="number"
                  value={inputs.rentalIncome}
                  onChange={(e) => set("rentalIncome", Number(e.target.value))}
                  className={inputClassName}
                />
              </FormField>
              <FormField label="Interest Income" htmlFor="interestIncome">
                <input
                  id="interestIncome"
                  type="number"
                  value={inputs.interestIncome}
                  onChange={(e) =>
                    set("interestIncome", Number(e.target.value))
                  }
                  className={inputClassName}
                />
              </FormField>
              <FormField label="Other Income Label" htmlFor="otherIncomeLabel">
                <input
                  id="otherIncomeLabel"
                  type="text"
                  value={inputs.otherIncomeLabel}
                  onChange={(e) => set("otherIncomeLabel", e.target.value)}
                  className={inputClassName}
                />
              </FormField>
              <FormField label="Other Income" htmlFor="otherIncome">
                <input
                  id="otherIncome"
                  type="number"
                  value={inputs.otherIncome}
                  onChange={(e) => set("otherIncome", Number(e.target.value))}
                  className={inputClassName}
                />
              </FormField>
              <FormField label="RRSP Contribution" htmlFor="rrspContribution">
                <input
                  id="rrspContribution"
                  type="number"
                  value={inputs.rrspContribution}
                  onChange={(e) =>
                    set("rrspContribution", Number(e.target.value))
                  }
                  className={inputClassName}
                />
              </FormField>
              <FormField label="FHSA Contribution" htmlFor="fhsaContribution">
                <input
                  id="fhsaContribution"
                  type="number"
                  value={inputs.fhsaContribution}
                  onChange={(e) =>
                    set("fhsaContribution", Number(e.target.value))
                  }
                  className={inputClassName}
                />
              </FormField>
              <FormField label="Capital Gains" htmlFor="capitalGains">
                <input
                  id="capitalGains"
                  type="number"
                  value={inputs.capitalGains}
                  onChange={(e) => set("capitalGains", Number(e.target.value))}
                  className={inputClassName}
                />
              </FormField>
              <FormField label="Eligible Dividends" htmlFor="eligibleDividends">
                <input
                  id="eligibleDividends"
                  type="number"
                  value={inputs.eligibleDividends}
                  onChange={(e) =>
                    set("eligibleDividends", Number(e.target.value))
                  }
                  className={inputClassName}
                />
              </FormField>
            </div>
          }
          results={
            <div className="min-w-0 max-w-full space-y-4">
              <TaxResultPanel
                result={result}
                pensionLabel={pensionLabel}
                isQuebec={isQuebec}
                grossIncome={grossIncome}
              />
              <CalculatorAssumptions
                items={[
                  `Annual ${TAX_YEAR} federal and provincial/territorial brackets`,
                  `Federal and provincial basic personal credits`,
                  debounced.province === "ON"
                    ? "Ontario surtax, Health Premium, and low-income reduction"
                    : debounced.province === "BC"
                      ? "BC annual 5.6% lowest rate and low-income reduction"
                      : `${debounced.province} provincial rules`,
                  `Base ${pensionLabel} credit; enhanced ${pensionLabel} deducted from taxable income`,
                  "EI and QPIP (Quebec) non-refundable tax credits",
                  "50% capital gains inclusion; eligible dividend gross-up/DTC",
                  "Estimate only — not a full T1 tax return",
                ]}
              />
              <details className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--muted)]">
                <summary className="cursor-pointer font-medium text-[var(--foreground)]">
                  Calculation details
                </summary>
                <dl className="mt-3 space-y-2">
                  <div className="flex justify-between gap-4">
                    <dt>Taxable income (before enhanced pension deduction)</dt>
                    <dd className="tabular-nums">
                      {formatCurrency(result.calculationDetail.taxableIncomeBeforeEnhancedDeduction)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>Enhanced {pensionLabel} deduction (line 22215)</dt>
                    <dd className="tabular-nums">
                      −{formatCurrency(result.calculationDetail.enhancedPensionDeduction)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 font-medium">
                    <dt>Taxable income</dt>
                    <dd className="tabular-nums">
                      {formatCurrency(result.calculationDetail.taxableIncome)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>Federal tax before credits</dt>
                    <dd className="tabular-nums">
                      {formatCurrency(result.calculationDetail.federalTaxBeforeCredits)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>Federal non-refundable credits</dt>
                    <dd className="tabular-nums">
                      −{formatCurrency(result.calculationDetail.federalNonRefundableCredits)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>Provincial tax before credits</dt>
                    <dd className="tabular-nums">
                      {formatCurrency(result.calculationDetail.provincialTaxBeforeCredits)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>Provincial non-refundable credits</dt>
                    <dd className="tabular-nums">
                      −{formatCurrency(result.calculationDetail.provincialNonRefundableCredits)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>Base {pensionLabel} (credit portion)</dt>
                    <dd className="tabular-nums">
                      {formatCurrency(result.pensionDetail.base)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>{pensionLabel} first additional (deduction)</dt>
                    <dd className="tabular-nums">
                      {formatCurrency(result.pensionDetail.firstAdditional)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>{pensionLabel}2 (deduction)</dt>
                    <dd className="tabular-nums">
                      {formatCurrency(result.pensionDetail.secondAdditional)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>EI premium</dt>
                    <dd className="tabular-nums">{formatCurrency(result.ei)}</dd>
                  </div>
                  {isQuebec && (
                    <div className="flex justify-between gap-4">
                      <dt>QPIP premium</dt>
                      <dd className="tabular-nums">{formatCurrency(result.qpip)}</dd>
                    </div>
                  )}
                </dl>
              </details>
              <p className="break-words rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
                Fun fact: The average Canadian in your income bracket pays
                roughly {bracketAvg}% of their income in total tax.
              </p>
              <SmartTips tips={tips} />
              <ShareResultCard
                headline="My income tax estimate"
                lines={[
                  `After-tax income: ${formatCurrency(result.afterTaxIncome)}`,
                  `Effective rate: ${formatPercent(result.effectiveTaxRate)}`,
                ]}
              />
              {result.breakdown.length > 0 && (
                <div className="mt-6 min-w-0 max-w-full">
                  <ScrollTable caption="Tax breakdown by income source" compact>
                    <thead className="bg-[var(--surface-muted)]">
                      <tr>
                        <th className="px-2 py-2">Source</th>
                        <th className="px-2 py-2 text-right">Amount</th>
                        <th className="px-2 py-2 text-right">Federal</th>
                        <th className="px-2 py-2 text-right">Provincial</th>
                        <th className="px-2 py-2 text-right">Net</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.breakdown.map((row) => (
                        <tr
                          key={row.label}
                          className="border-t border-[var(--border)]"
                        >
                          <td className="break-words px-2 py-2">{row.label}</td>
                          <td className="whitespace-nowrap px-2 py-2 text-right tabular-nums">
                            {formatCurrency(row.amount)}
                          </td>
                          <td className="whitespace-nowrap px-2 py-2 text-right tabular-nums">
                            {formatCurrency(row.federalTax)}
                          </td>
                          <td className="whitespace-nowrap px-2 py-2 text-right tabular-nums">
                            {formatCurrency(row.provincialTax)}
                          </td>
                          <td className="whitespace-nowrap px-2 py-2 text-right font-medium tabular-nums">
                            {formatCurrency(row.netAfterTax)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </ScrollTable>
                </div>
              )}
            </div>
          }
        />
      </CalculatorLayout>
      <MobileResultsBar
        label="After-tax income"
        value={formatCurrency(result.afterTaxIncome)}
      />
    </>
  );
}
