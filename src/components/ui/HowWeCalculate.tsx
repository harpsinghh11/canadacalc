"use client";

import { useState } from "react";

interface HowWeCalculateProps {
  children: React.ReactNode;
}

export function HowWeCalculate({ children }: HowWeCalculateProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-8 border-t border-slate-200 pt-6">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-left text-sm font-semibold text-[#0f172a] hover:text-[#16a34a]"
        aria-expanded={open}
      >
        How we calculate this
        <span className="text-lg">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="mt-3 space-y-2 text-sm leading-relaxed text-slate-600">
          {children}
        </div>
      )}
    </div>
  );
}
