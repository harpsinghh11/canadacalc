"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import {
  CALCULATOR_CATEGORIES,
  SITE_NAME,
  getCalculatorsByCategory,
  type CalculatorCategoryId,
} from "@/lib/constants";
import { CalculatorIcon } from "@/lib/calculator-icons";
import { CalculatorSearch } from "@/components/ui/CalculatorSearch";

const QUICK_LINKS = [
  { href: "/tax", label: "Tax" },
  { href: "/mortgage", label: "Mortgage" },
  { href: "/tfsa", label: "TFSA" },
  { href: "/stocklookback", label: "Stock Lookback" },
];

/** Wide desktop: 3 independent vertical stacks — natural category heights. */
const MEGA_MENU_COLUMNS_XL: CalculatorCategoryId[][] = [
  ["tax", "mortgage", "retirement"],
  ["savings"],
  ["everyday", "stocks"],
];

/** Laptop / medium desktop: 2 independent vertical stacks. */
const MEGA_MENU_COLUMNS_MD: CalculatorCategoryId[][] = [
  ["tax", "mortgage", "retirement", "stocks"],
  ["savings", "everyday"],
];

/** Mobile grouped nav — matches homepage category priority. */
const MOBILE_NAV_CATEGORY_ORDER: CalculatorCategoryId[] = [
  "tax",
  "mortgage",
  "retirement",
  "stocks",
  "savings",
  "everyday",
];

const navLinkClass =
  "rounded-[var(--radius-control)] px-3 py-2 text-sm text-white/70 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

const navIconButtonClass =
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-[var(--radius-control)] text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

export function Navbar() {
  const toolsPanelId = useId();
  const searchPanelId = useId();
  const mobileMenuId = useId();
  const [menuOpen, setMenuOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setToolsOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setToolsOpen(false);
        setSearchOpen(false);
        setMenuOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 bg-[var(--navy)] text-white transition-[box-shadow,border-color] duration-200 ${
        scrolled
          ? "border-b border-white/10 shadow-md"
          : "border-b border-transparent"
      }`}
    >
      <nav
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        aria-label="Main"
      >
        <div className="flex h-14 items-center justify-between gap-4">
          <Link
            href="/"
            className="shrink-0 text-xl font-bold tracking-tight transition-colors hover:text-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {SITE_NAME}
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                id={`${toolsPanelId}-trigger`}
                className="inline-flex min-h-11 items-center gap-1 rounded-[var(--radius-control)] px-3 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                aria-expanded={toolsOpen}
                aria-controls={toolsPanelId}
                onClick={() => {
                  setToolsOpen((o) => !o);
                  setSearchOpen(false);
                }}
              >
                All Tools
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${toolsOpen ? "rotate-180" : ""}`}
                  aria-hidden
                />
              </button>
              {toolsOpen && (
                <div
                  id={toolsPanelId}
                  role="region"
                  aria-labelledby={`${toolsPanelId}-trigger`}
                  className="absolute right-0 top-full z-50 mt-2 w-[min(92vw,42rem)] rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-5 text-[var(--foreground)] shadow-[var(--shadow-elevated)] xl:w-[min(92vw,52rem)]"
                >
                  <ToolsMegaMenu onNavigate={() => setToolsOpen(false)} />
                </div>
              )}
            </div>

            {QUICK_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className={navLinkClass}>
                {link.label}
              </Link>
            ))}

            <button
              type="button"
              aria-label="Search calculators"
              aria-expanded={searchOpen}
              aria-controls={searchPanelId}
              className={navIconButtonClass}
              onClick={() => {
                setSearchOpen((o) => !o);
                setToolsOpen(false);
              }}
            >
              <Search className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center gap-1 md:hidden">
            <button
              type="button"
              aria-label="Search calculators"
              aria-expanded={searchOpen}
              aria-controls={searchPanelId}
              className={navIconButtonClass}
              onClick={() => setSearchOpen((o) => !o)}
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              type="button"
              className={navIconButtonClass}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls={mobileMenuId}
              onClick={() => setMenuOpen((o) => !o)}
            >
              {menuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <span className="text-2xl leading-none" aria-hidden>
                  ☰
                </span>
              )}
            </button>
          </div>
        </div>

        {searchOpen && (
          <div
            id={searchPanelId}
            ref={searchRef}
            className="border-t border-white/10 py-3 md:py-4"
          >
            <CalculatorSearch
              onNavigate={() => {
                setSearchOpen(false);
                setMenuOpen(false);
              }}
            />
          </div>
        )}

        {menuOpen && (
          <div
            id={mobileMenuId}
            className="max-h-[calc(100vh-3.5rem)] overflow-y-auto border-t border-white/10 pb-4 pt-2 md:hidden"
          >
            {MOBILE_NAV_CATEGORY_ORDER.map((categoryId) => {
              const cat = CALCULATOR_CATEGORIES.find((c) => c.id === categoryId);
              const items = getCalculatorsByCategory(categoryId);
              if (!cat || items.length === 0) return null;
              return (
                <div key={cat.id} className="mb-3">
                  <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-white/50">
                    {cat.title}
                  </p>
                  <ul className="space-y-0.5">
                    {items.map((calc) => (
                      <li key={calc.href}>
                        <Link
                          href={calc.href}
                          className="block min-h-11 rounded-lg px-2 py-3 text-sm text-white/70 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                          onClick={() => setMenuOpen(false)}
                        >
                          {calc.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </nav>
    </header>
  );
}

function ToolsMegaMenu({ onNavigate }: { onNavigate: () => void }) {
  return (
    <>
      <div className="flex gap-8 md:gap-10 xl:hidden">
        {MEGA_MENU_COLUMNS_MD.map((column, index) => (
          <MegaMenuColumn
            key={`md-${index}`}
            categoryIds={column}
            onNavigate={onNavigate}
          />
        ))}
      </div>
      <div className="hidden gap-8 xl:flex xl:gap-10">
        {MEGA_MENU_COLUMNS_XL.map((column, index) => (
          <MegaMenuColumn
            key={`xl-${index}`}
            categoryIds={column}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </>
  );
}

function MegaMenuColumn({
  categoryIds,
  onNavigate,
}: {
  categoryIds: CalculatorCategoryId[];
  onNavigate: () => void;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-9">
      {categoryIds.map((categoryId) => (
        <MegaMenuCategory
          key={categoryId}
          categoryId={categoryId}
          onNavigate={onNavigate}
        />
      ))}
    </div>
  );
}

function MegaMenuCategory({
  categoryId,
  onNavigate,
}: {
  categoryId: CalculatorCategoryId;
  onNavigate: () => void;
}) {
  const category = CALCULATOR_CATEGORIES.find((c) => c.id === categoryId);
  if (!category) return null;

  const links = getCalculatorsByCategory(categoryId).map((calc) => ({
    href: calc.href,
    label: calc.title,
  }));

  if (links.length === 0) return null;

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
        {category.title}
      </p>
      <ul className="mt-4 flex flex-col gap-3">
        {links.map((link) => (
          <MegaLink
            key={link.href}
            href={link.href}
            label={link.label}
            onClick={onNavigate}
          />
        ))}
      </ul>
    </div>
  );
}

function MegaLink({
  href,
  label,
  onClick,
}: {
  href: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <li>
      <Link
        href={href}
        onClick={onClick}
        className="flex min-h-10 items-start gap-2 rounded-[var(--radius-control)] px-2 py-2 text-sm leading-snug transition-colors hover:bg-[var(--surface-muted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)]"
      >
        <CalculatorIcon
          href={href}
          className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand)]"
        />
        <span className="min-w-0">{label}</span>
      </Link>
    </li>
  );
}
