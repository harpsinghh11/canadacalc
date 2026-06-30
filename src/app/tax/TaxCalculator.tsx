"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  CalculatorGrid,
  CalculatorLayout,
  FormField,
  ResultItem,
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
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { usePersistedState } from "@/hooks/usePersistedState";
import { TAX_PROVINCES } from "@/lib/constants";
import { calculateTax } from "@/lib/tax";
import { getTaxTips, getBracketAverageTaxRate } from "@/lib/insights";
import { formatCurrency, formatPercent } from "@/lib/format";

const DEFAULTS = {
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

export default function TaxCalculator() {
  const [inputs, setInputs, resetAll] = usePersistedState("tax", DEFAULTS);
  const debounced = useDebouncedValue(inputs);

  const result = useMemo(
    () => calculateTax(debounced),
    [debounced],
  );

  const tips = getTaxTips(debounced, result.marginalTaxRate);
  const bracketAvg = getBracketAverageTaxRate(result.taxableIncome);
  const totalCpp = result.cpp + result.cppSelfEmployed;

  const set = <K extends keyof typeof DEFAULTS>(key: K, val: (typeof DEFAULTS)[K]) =>
    setInputs((prev) => ({ ...prev, [key]: val }));

  return (
    <>
      <CalculatorLayout
        title="Canadian Income Tax Calculator"
        badge={<TaxYearBadge />}
        description="Estimate your 2025 federal and provincial income taxes, CPP, and EI deductions."
        footer={
          <>
            <HowWeCalculate>
              <p>
                We apply 2025 federal and provincial bracket tables to your taxable
                income (employment + other income − RRSP/FHSA − capital gains
                inclusion). CPP: 5.95% employee on employment; 11.9% self-employed
                on business income. EI: 1.66% on employment only.
              </p>
            </HowWeCalculate>
            <FAQ
              items={[
                { q: "How is taxable income calculated?", a: "Employment, self-employment, rental, interest, and other income, plus 50% of capital gains and grossed-up dividends, minus RRSP and FHSA contributions." },
                {
                  q: "How is interest income taxed?",
                  a: (
                    <>
                      Interest from savings accounts, GICs, and bonds is fully
                      taxable at your marginal rate. Most accounts earn{" "}
                      <Link
                        href="/compound"
                        className="font-medium text-[#16a34a] underline"
                      >
                        compound interest
                      </Link>
                      ; some loans use{" "}
                      <Link
                        href="/simple-interest"
                        className="font-medium text-[#16a34a] underline"
                      >
                        simple interest
                      </Link>
                      .
                    </>
                  ),
                  schemaText:
                    "Interest from savings accounts, GICs, and bonds is fully taxable at your marginal rate. Most accounts earn compound interest; some loans use simple interest.",
                },
                { q: "Do self-employed people pay EI?", a: "Generally no — EI is for employees. Self-employed CPP is 11.9% (both employer and employee portions)." },
                { q: "What is my marginal tax rate?", a: "The tax rate on your next dollar of income — federal plus provincial combined at your current bracket." },
              ]}
            />
          </>
        }
      >
        <ResetButton onReset={resetAll} />
        <CalculatorGrid
          inputs={
            <div>
              <FormField label="Province" htmlFor="province" tooltip="Tax rates depend on your province of residence on December 31.">
                <select id="province" value={inputs.province} onChange={(e) => set("province", e.target.value)} className={selectClassName}>
                  {TAX_PROVINCES.map((p) => <option key={p.code} value={p.code}>{p.name}</option>)}
                </select>
              </FormField>
              <FormField label="Employment Income" htmlFor="employmentIncome" tooltip="Salary, wages, and tips from your job (T4 income).">
                <input id="employmentIncome" type="number" value={inputs.employmentIncome} onChange={(e) => set("employmentIncome", Number(e.target.value))} className={inputClassName} />
              </FormField>
              <FormField label="Self-Employment Income" htmlFor="selfEmploymentIncome" tooltip="Net business or freelance income after expenses.">
                <input id="selfEmploymentIncome" type="number" value={inputs.selfEmploymentIncome} onChange={(e) => set("selfEmploymentIncome", Number(e.target.value))} className={inputClassName} />
              </FormField>
              <FormField label="Rental Income" htmlFor="rentalIncome" tooltip="Net rental income from properties you own.">
                <input id="rentalIncome" type="number" value={inputs.rentalIncome} onChange={(e) => set("rentalIncome", Number(e.target.value))} className={inputClassName} />
              </FormField>
              <FormField label="Interest Income" htmlFor="interestIncome" tooltip="Interest from savings accounts, GICs, or bonds — fully taxable.">
                <input id="interestIncome" type="number" value={inputs.interestIncome} onChange={(e) => set("interestIncome", Number(e.target.value))} className={inputClassName} />
              </FormField>
              <FormField label="Other Income Label" htmlFor="otherIncomeLabel">
                <input id="otherIncomeLabel" type="text" value={inputs.otherIncomeLabel} onChange={(e) => set("otherIncomeLabel", e.target.value)} className={inputClassName} />
              </FormField>
              <FormField label="Other Income" htmlFor="otherIncome" tooltip="Pension, EI benefits, side income, or anything else taxable.">
                <input id="otherIncome" type="number" value={inputs.otherIncome} onChange={(e) => set("otherIncome", Number(e.target.value))} className={inputClassName} />
              </FormField>
              <FormField label="RRSP Contribution" htmlFor="rrspContribution" tooltip="Reduces your taxable income — you get a tax refund now, pay tax on withdrawal later.">
                <input id="rrspContribution" type="number" value={inputs.rrspContribution} onChange={(e) => set("rrspContribution", Number(e.target.value))} className={inputClassName} />
              </FormField>
              <FormField label="FHSA Contribution" htmlFor="fhsaContribution" tooltip="Tax-deductible like RRSP, but for first-time home savings.">
                <input id="fhsaContribution" type="number" value={inputs.fhsaContribution} onChange={(e) => set("fhsaContribution", Number(e.target.value))} className={inputClassName} />
              </FormField>
              <FormField label="Capital Gains" htmlFor="capitalGains" tooltip="Only 50% of capital gains are included in taxable income.">
                <input id="capitalGains" type="number" value={inputs.capitalGains} onChange={(e) => set("capitalGains", Number(e.target.value))} className={inputClassName} />
              </FormField>
              <FormField label="Eligible Dividends" htmlFor="eligibleDividends" tooltip="Canadian dividends from public companies — taxed at a preferential rate.">
                <input id="eligibleDividends" type="number" value={inputs.eligibleDividends} onChange={(e) => set("eligibleDividends", Number(e.target.value))} className={inputClassName} />
              </FormField>
            </div>
          }
          results={
            <div className="space-y-3">
              <ResultItem label="Total Tax" value={formatCurrency(result.totalTax)} numericValue={result.totalTax} formatFn={formatCurrency} highlight />
              <ResultItem label="After-Tax Income" value={formatCurrency(result.afterTaxIncome)} numericValue={result.afterTaxIncome} formatFn={formatCurrency} highlight />
              <ResultItem label="Effective Rate" value={formatPercent(result.effectiveTaxRate)} />
              <ResultItem label="Marginal Rate" value={formatPercent(result.marginalTaxRate)} />
              <ResultItem label="CPP" value={formatCurrency(totalCpp)} numericValue={totalCpp} formatFn={formatCurrency} />
              <ResultItem label="EI" value={formatCurrency(result.ei)} numericValue={result.ei} formatFn={formatCurrency} />
              <p className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
                Fun fact: The average Canadian in your income bracket pays roughly{" "}
                {bracketAvg}% of their income in total tax.
              </p>
              <SmartTips tips={tips} />
              <ShareResultCard
                headline="My 2025 tax estimate"
                lines={[
                  `After-tax income: ${formatCurrency(result.afterTaxIncome)}`,
                  `Effective rate: ${formatPercent(result.effectiveTaxRate)}`,
                ]}
              />
              {result.breakdown.length > 0 && (
                <div className="mt-6 overflow-auto rounded-lg border border-slate-200">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="px-3 py-2">Source</th>
                        <th className="px-3 py-2 text-right">Amount</th>
                        <th className="px-3 py-2 text-right">Federal</th>
                        <th className="px-3 py-2 text-right">Provincial</th>
                        <th className="px-3 py-2 text-right">Net</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.breakdown.map((row) => (
                        <tr key={row.label} className="border-t border-slate-100">
                          <td className="px-3 py-2">{row.label}</td>
                          <td className="px-3 py-2 text-right">{formatCurrency(row.amount)}</td>
                          <td className="px-3 py-2 text-right">{formatCurrency(row.federalTax)}</td>
                          <td className="px-3 py-2 text-right">{formatCurrency(row.provincialTax)}</td>
                          <td className="px-3 py-2 text-right font-medium">{formatCurrency(row.netAfterTax)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          }
        />
      </CalculatorLayout>
      <MobileResultsBar label="After-tax income" value={formatCurrency(result.afterTaxIncome)} />
    </>
  );
}
