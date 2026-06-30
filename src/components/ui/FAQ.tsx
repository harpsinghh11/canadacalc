"use client";

import { useState, type ReactNode } from "react";

interface FAQItem {
  q: string;
  a: ReactNode;
  /** Plain-text answer for FAQ JSON-LD when `a` contains JSX links */
  schemaText?: string;
}

interface FAQProps {
  items: FAQItem[];
}

function answerToSchemaText(item: FAQItem): string {
  if (item.schemaText) return item.schemaText;
  if (typeof item.a === "string") return item.a;
  return item.q;
}

export function FAQ({ items }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: answerToSchemaText(item),
      },
    })),
  };

  return (
    <div className="mt-8 border-t border-slate-200 pt-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h3 className="mb-4 text-lg font-semibold text-[#0f172a]">
        Frequently Asked Questions
      </h3>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div
            key={item.q}
            className="overflow-hidden rounded-lg border border-slate-200"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="flex min-h-[44px] w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-[#0f172a] hover:bg-slate-50"
              aria-expanded={openIndex === i}
            >
              {item.q}
              <span>{openIndex === i ? "−" : "+"}</span>
            </button>
            {openIndex === i && (
              <div className="border-t border-slate-100 px-4 py-3 text-sm text-slate-600">
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
