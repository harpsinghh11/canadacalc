"use client";

import { useState } from "react";

interface CalculatorAssumptionsProps {
  items: string[];
}

export function CalculatorAssumptions({ items }: CalculatorAssumptionsProps) {
  const [open, setOpen] = useState(false);

  if (items.length === 0) return null;

  return (
    <div className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface)]">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-[var(--foreground)] hover:text-[var(--brand)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)]"
        aria-expanded={open}
      >
        Assumptions used in this estimate
        <span aria-hidden>{open ? "−" : "+"}</span>
      </button>
      {open && (
        <ul className="list-disc space-y-1.5 border-t border-[var(--border)] px-4 py-3 pl-8 text-sm text-[var(--muted)]">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
