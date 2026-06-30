"use client";

import { useState } from "react";
import Link from "next/link";
import { CALCULATORS } from "@/lib/constants";

const QUESTIONS = [
  {
    q: "Do you have a TFSA and contribute regularly?",
    links: ["/tfsa"],
    points: 20,
  },
  {
    q: "Do you contribute to an RRSP or workplace pension?",
    links: ["/retirement", "/tax"],
    points: 20,
  },
  {
    q: "Do you have 3–6 months of expenses in an emergency fund?",
    links: ["/compound", "/simple-interest"],
    points: 20,
  },
  {
    q: "Do you have a mortgage or are you planning to buy a home?",
    links: ["/mortgage", "/fhsa"],
    points: 20,
  },
  {
    q: "Do you invest monthly (stocks, ETFs, or savings)?",
    links: ["/compound", "/simple-interest", "/tfsa"],
    points: 20,
  },
] as const;

export function FinancialHealthQuiz() {
  const [answers, setAnswers] = useState<boolean[]>(
    Array(QUESTIONS.length).fill(false),
  );
  const [submitted, setSubmitted] = useState(false);

  const score = answers.reduce(
    (sum, yes, i) => sum + (yes ? QUESTIONS[i].points : 0),
    0,
  );

  const toggle = (index: number) => {
    const next = [...answers];
    next[index] = !next[index];
    setAnswers(next);
    setSubmitted(false);
  };

  return (
    <section className="border-y border-slate-200 bg-gradient-to-b from-green-50/50 to-white px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-center text-2xl font-bold text-[#0f172a]">
          Financial Health Score 🍁
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          A quick 2-minute check — how are you doing?
        </p>

        <div className="mt-8 space-y-3">
          {QUESTIONS.map((item, i) => (
            <label
              key={item.q}
              className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-[#16a34a]/40"
            >
              <input
                type="checkbox"
                checked={answers[i]}
                onChange={() => toggle(i)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-[#16a34a] focus:ring-[#16a34a]"
              />
              <span className="text-sm text-slate-700">{item.q}</span>
            </label>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setSubmitted(true)}
          className="mt-6 w-full rounded-lg bg-[#16a34a] px-4 py-3 text-sm font-medium text-white hover:bg-[#15803d]"
        >
          See my score
        </button>

        {submitted && (
          <div className="mt-6 rounded-xl border-2 border-[#16a34a] bg-white p-6 text-center">
            <p className="text-5xl font-bold text-[#16a34a]">{score}</p>
            <p className="mt-1 text-sm text-slate-600">out of 100</p>
            <p className="mt-4 text-sm text-slate-700">
              {score >= 80
                ? "You're in great shape — keep it up!"
                : score >= 50
                  ? "Solid foundation — a few gaps to close."
                  : "Lots of room to grow — start with one calculator below."}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {QUESTIONS.map((item, i) =>
                !answers[i]
                  ? item.links.map((href) => {
                      const calc = CALCULATORS.find((c) => c.href === href);
                      return calc ? (
                        <Link
                          key={`${i}-${href}`}
                          href={href}
                          className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-[#0f172a] hover:bg-[#16a34a]/10"
                        >
                          {calc.title}
                        </Link>
                      ) : null;
                    })
                  : null,
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
