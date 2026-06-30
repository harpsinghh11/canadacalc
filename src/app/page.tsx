import type { Metadata } from "next";
import Link from "next/link";
import { CALCULATORS } from "@/lib/constants";
import { FinancialHealthQuiz } from "@/components/FinancialHealthQuiz";

export const metadata: Metadata = {
  title: "Canadian Financial Calculators — Free, Fast, Accurate",
  description:
    "Free Canadian personal finance calculators for TFSA, FHSA, mortgage, income tax, retirement planning, compound and simple interest, and stock lookback. No signup required.",
};

export default function HomePage() {
  return (
    <>
      <section className="bg-[#0f172a] px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Canadian Financial Calculators
          </h1>
          <p className="mt-4 text-xl text-slate-300">
            Free, Fast, Accurate — built for Canadians, eh?
          </p>
          <p className="mx-auto mt-6 max-w-2xl text-slate-400">
            Plan your finances with tools built specifically for Canadians —
            using real 2025 tax brackets, TFSA limits, and mortgage rules.
          </p>
        </div>
      </section>

      <FinancialHealthQuiz />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-center text-2xl font-bold text-[#0f172a]">
          Our Calculators
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CALCULATORS.map((calc) => (
            <article
              key={calc.href}
              className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <span className="text-3xl" aria-hidden="true">
                {calc.icon}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-[#0f172a]">
                {calc.title}
              </h3>
              <p className="mt-2 flex-1 text-sm text-slate-600">
                {calc.description}
              </p>
              <Link
                href={calc.href}
                className="mt-6 inline-flex items-center justify-center rounded-lg bg-[#16a34a] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#15803d]"
              >
                Calculate
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-2xl font-bold text-[#0f172a]">
            Why CanadaCalc?
          </h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="text-3xl" aria-hidden="true">
                🇨🇦
              </div>
              <h3 className="mt-3 font-semibold text-[#0f172a]">
                Canadian-Specific
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Built with 2025 CRA tax brackets, TFSA limits, and Canadian
                mortgage compounding rules.
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl" aria-hidden="true">
                🔓
              </div>
              <h3 className="mt-3 font-semibold text-[#0f172a]">No Signup</h3>
              <p className="mt-2 text-sm text-slate-600">
                Jump straight in — your inputs stay in your browser only.
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl" aria-hidden="true">
                💚
              </div>
              <h3 className="mt-3 font-semibold text-[#0f172a]">Always Free</h3>
              <p className="mt-2 text-sm text-slate-600">
                Every calculator is completely free to use, now and always.
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl" aria-hidden="true">
                📱
              </div>
              <h3 className="mt-3 font-semibold text-[#0f172a]">
                Mobile Friendly
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Responsive design that works great on phones, tablets, and
                desktops.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
