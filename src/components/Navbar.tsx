"use client";

import Link from "next/link";
import { useState } from "react";
import { CALCULATORS, SITE_NAME } from "@/lib/constants";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-[#0f172a] text-white shadow-md">
      <nav className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight transition-colors hover:text-[#16a34a]"
          >
            {SITE_NAME}
          </Link>
          <button
            type="button"
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-slate-300 hover:bg-white/10 hover:text-white md:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className="text-2xl leading-none">{menuOpen ? "×" : "☰"}</span>
          </button>
          <ul className="hidden flex-wrap gap-x-4 gap-y-2 text-sm md:flex">
            {CALCULATORS.map((calc) => (
              <li key={calc.href}>
                <Link
                  href={calc.href}
                  className="text-slate-300 transition-colors hover:text-[#16a34a]"
                >
                  {calc.title
                    .replace(" Calculator", "")
                    .replace(" Tool", "")}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        {menuOpen && (
          <ul className="mt-4 space-y-1 border-t border-white/10 pt-4 md:hidden">
            {CALCULATORS.map((calc) => (
              <li key={calc.href}>
                <Link
                  href={calc.href}
                  className="block min-h-[44px] rounded-lg px-2 py-3 text-sm text-slate-300 transition-colors hover:bg-white/10 hover:text-[#16a34a]"
                  onClick={() => setMenuOpen(false)}
                >
                  {calc.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </nav>
    </header>
  );
}
