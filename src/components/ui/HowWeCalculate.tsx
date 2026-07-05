"use client";

import { useState } from "react";

interface HowWeCalculateProps {
  children: React.ReactNode;
}

export function HowWeCalculate({ children }: HowWeCalculateProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-8 border-t border-[var(--border)] pt-6">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-left text-sm font-semibold text-[var(--foreground)] hover:text-[var(--brand)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)]"
        aria-expanded={open}
      >
        How this is calculated
        <span aria-hidden>{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="mt-3 space-y-2 text-sm leading-relaxed text-[var(--muted)]">
          {children}
        </div>
      )}
    </div>
  );
}
