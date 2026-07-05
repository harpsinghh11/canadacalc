"use client";

import { useMemo, useState } from "react";
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

  const scoreMessage =
    score >= 80
      ? "You're in great shape — keep it up!"
      : score >= 50
        ? "Solid foundation — a few gaps to close."
        : "Lots of room to grow — start with one calculator below.";

  const scoreColorClass =
    score >= 80
      ? "text-[var(--positive)]"
      : score >= 50
        ? "text-[var(--warning)]"
        : "text-[var(--negative)]";

  const suggestionLinks = useMemo(() => {
    if (!submitted) return [];
    const seen = new Set<string>();
    const links: { href: string; title: string }[] = [];
    QUESTIONS.forEach((item, i) => {
      if (answers[i]) return;
      item.links.forEach((href) => {
        if (seen.has(href)) return;
        seen.add(href);
        const calc = CALCULATORS.find((c) => c.href === href);
        if (calc) links.push({ href, title: calc.title });
      });
    });
    return links;
  }, [answers, submitted]);

  const toggle = (index: number) => {
    const next = [...answers];
    next[index] = !next[index];
    setAnswers(next);
    setSubmitted(false);
  };

  return (
    <section className="border-y border-[var(--border)] bg-[var(--surface-muted)] px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-center text-2xl font-bold text-[var(--foreground)]">
          Financial Health Score
        </h2>
        <p className="mt-2 text-center text-sm text-[var(--muted)]">
          A quick 2-minute check — how are you doing?
        </p>

        <div className="mt-8 space-y-3">
          {QUESTIONS.map((item, i) => (
            <label
              key={item.q}
              className="flex cursor-pointer items-start gap-3 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-4 transition-colors hover:border-[var(--brand)]/30"
            >
              <input
                type="checkbox"
                checked={answers[i]}
                onChange={() => toggle(i)}
                className="mt-1 h-4 w-4 rounded border-[var(--border-strong)] text-[var(--brand)] focus:ring-[var(--brand)]"
              />
              <span className="text-sm text-[var(--foreground)]">{item.q}</span>
            </label>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setSubmitted(true)}
          className="mt-6 w-full rounded-[var(--radius-control)] bg-[var(--brand)] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)]"
        >
          See my score
        </button>

        {submitted && (
          <div className="mt-6 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-6 text-center">
            <p className={`text-5xl font-bold tabular-nums ${scoreColorClass}`}>{score}</p>
            <p className="mt-1 text-sm text-[var(--muted)]">out of 100</p>
            <p className="mt-4 text-sm text-[var(--foreground)]">{scoreMessage}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {suggestionLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full bg-[var(--surface-muted)] px-3 py-1 text-xs font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--brand-muted)]"
                >
                  {link.title}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
