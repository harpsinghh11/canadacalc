"use client";

import { ReactNode } from "react";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { Tooltip } from "@/components/ui/Tooltip";

interface CalculatorLayoutProps {
  title: string;
  description: string;
  badge?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

export function CalculatorLayout({
  title,
  description,
  badge,
  children,
  footer,
}: CalculatorLayoutProps) {
  const webAppJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: title,
    description,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "CAD",
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 pb-24 sm:px-6 lg:px-8 lg:pb-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }}
      />
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-[#0f172a] sm:text-3xl">
            {title}
          </h1>
          {badge}
        </div>
        <p className="mt-2 text-base text-slate-600">{description}</p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        {children}
        {footer}
      </div>
    </div>
  );
}

interface CalculatorGridProps {
  inputs: ReactNode;
  results: ReactNode;
  compare?: ReactNode;
  /** Renders below inputs in the left column (e.g. year-by-year table). */
  inputsFooter?: ReactNode;
}

export function CalculatorGrid({
  inputs,
  results,
  compare,
  inputsFooter,
}: CalculatorGridProps) {
  return (
    <div className="space-y-8">
      {compare}
      <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
        <section aria-label="Calculator inputs">
          <h2 className="mb-4 text-lg font-semibold text-[#0f172a]">Inputs</h2>
          {inputs}
          {inputsFooter && <div className="mt-8">{inputsFooter}</div>}
        </section>
        <section aria-label="Calculator results">
          <h2 className="mb-4 text-lg font-semibold text-[#0f172a]">Results</h2>
          {results}
        </section>
      </div>
    </div>
  );
}

interface FormFieldProps {
  label: string;
  htmlFor: string;
  children: ReactNode;
  hint?: string;
  tooltip?: string;
  error?: string;
}

export function FormField({
  label,
  htmlFor,
  children,
  hint,
  tooltip,
  error,
}: FormFieldProps) {
  return (
    <div className="mb-4">
      <label
        htmlFor={htmlFor}
        className="mb-1 flex items-center text-sm font-medium text-slate-700"
      >
        {label}
        {tooltip && <Tooltip text={tooltip} />}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="mt-1 text-xs text-slate-500">{hint}</p>
      )}
    </div>
  );
}

export const inputClassName =
  "w-full min-h-[44px] rounded-lg border border-slate-300 px-3 py-2.5 text-base text-slate-900 shadow-sm focus:border-[#16a34a] focus:outline-none focus:ring-1 focus:ring-[#16a34a] sm:text-sm";

export const inputErrorClassName =
  "w-full rounded-lg border border-red-400 px-3 py-2.5 text-base text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 sm:text-sm";

export const selectClassName = inputClassName;

interface ResultItemProps {
  label: string;
  value: string;
  numericValue?: number;
  formatFn?: (n: number) => string;
  highlight?: boolean;
}

export function ResultItem({
  label,
  value,
  numericValue,
  formatFn,
  highlight,
}: ResultItemProps) {
  const showAnimated =
    numericValue !== undefined && formatFn !== undefined;

  return (
    <div
      className={`flex items-center justify-between rounded-lg px-4 py-3 ${
        highlight ? "bg-[#16a34a]/10" : "bg-slate-50"
      }`}
    >
      <span className="text-sm text-slate-600">{label}</span>
      <span
        className={`font-semibold ${highlight ? "text-[#16a34a]" : "text-[#0f172a]"}`}
      >
        {showAnimated ? (
          <AnimatedNumber
            value={numericValue}
            format={formatFn}
          />
        ) : (
          value
        )}
      </span>
    </div>
  );
}
