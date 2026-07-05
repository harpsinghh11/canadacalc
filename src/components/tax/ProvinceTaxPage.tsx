import Link from "next/link";
import TaxCalculator from "@/app/tax/TaxCalculator";
import {
  getProvinceIncomeExamples,
  type ProvinceTaxPageConfig,
} from "@/lib/tax-province-pages";
import { formatCurrency, formatPercent } from "@/lib/format";
import { TAX_YEAR } from "@/lib/tax";

interface ProvinceTaxPageProps {
  config: ProvinceTaxPageConfig;
}

export function ProvinceTaxPage({ config }: ProvinceTaxPageProps) {
  const examples = getProvinceIncomeExamples(config.provinceCode);

  const supplemental = (
    <div className="mb-8 space-y-8 border-b border-[var(--border)] pb-8">
      <section>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          {config.provinceName} tax calculator
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)]">{config.intro}</p>
        <p className="mt-3 text-sm">
          <Link href="/tax" className="font-medium text-[var(--brand)] hover:underline">
            Open the Canada tax calculator
          </Link>{" "}
          to compare provinces or add RRSP, dividends, and other income types.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          {config.provinceName} income examples ({TAX_YEAR})
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Employment income only, no deductions — illustrates how after-tax pay
          changes with income.
        </p>
        <div className="mt-4 overflow-x-auto rounded-[var(--radius-control)] border border-[var(--border)]">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface-muted)] text-left">
                <th className="px-4 py-3 font-semibold text-[var(--foreground)]">Gross income</th>
                <th className="px-4 py-3 font-semibold text-[var(--foreground)]">After-tax income</th>
                <th className="px-4 py-3 font-semibold text-[var(--foreground)]">Effective rate</th>
                <th className="px-4 py-3 font-semibold text-[var(--foreground)]">Marginal rate</th>
              </tr>
            </thead>
            <tbody>
              {examples.map((ex) => (
                <tr key={ex.income} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-4 py-3 tabular-nums">{formatCurrency(ex.income)}</td>
                  <td className="px-4 py-3 tabular-nums font-medium text-[var(--foreground)]">
                    {formatCurrency(ex.afterTax)}
                  </td>
                  <td className="px-4 py-3 tabular-nums">{formatPercent(ex.effectiveRate)}</td>
                  <td className="px-4 py-3 tabular-nums">{formatPercent(ex.marginalRate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            How {config.provinceName} income tax is calculated
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)]">{config.howCalculated}</p>
        </div>
        <div>
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            Federal vs {config.provinceName} provincial tax
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {config.federalVsProvincial}
          </p>
        </div>
        <div>
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            Marginal vs effective tax rate
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {config.marginalVsEffective}
          </p>
        </div>
        <div>
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            {config.provinceCode === "QC" ? "QPP" : "CPP"} and EI assumptions
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)]">{config.cppEiNotes}</p>
        </div>
      </section>

      {config.provinceNotes.length > 0 && (
        <section>
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            {config.provinceName}-specific notes
          </h2>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-[var(--muted)]">
            {config.provinceNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="text-base font-semibold text-[var(--foreground)]">
          Official sources
        </h2>
        <ul className="mt-2 space-y-1 text-sm">
          {config.officialSources.map((s) => (
            <li key={s.href}>
              <a
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--brand)] hover:underline"
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );

  return (
    <TaxCalculator
      defaultProvince={config.provinceCode}
      lockProvince
      title={config.h1}
      description={config.intro}
      storageKey={`tax-${config.slug}`}
      supplementalContent={supplemental}
      extraFaqs={config.faqs}
    />
  );
}
