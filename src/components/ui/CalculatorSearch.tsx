"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { searchCalculators, type SearchableTool } from "@/lib/calculator-search";

interface CalculatorSearchProps {
  placeholder?: string;
  className?: string;
  onNavigate?: () => void;
}

export function CalculatorSearch({
  placeholder = "Search tax, mortgage, TFSA, interest…",
  className = "",
  onNavigate,
}: CalculatorSearchProps) {
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const results = searchCalculators(query);
  const trimmedQuery = query.trim();
  const listboxVisible = open && trimmedQuery.length > 0;
  const hasResults = results.length > 0;
  const activeOptionId = hasResults
    ? `${listId}-option-${activeIndex}`
    : undefined;
  const popupId = hasResults ? `${listId}-listbox` : `${listId}-status`;

  const close = useCallback(() => {
    setOpen(false);
    setActiveIndex(0);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        close();
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [close]);

  useEffect(() => {
    if (!listboxVisible || !hasResults || !activeOptionId) return;
    const option = document.getElementById(activeOptionId);
    option?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, activeOptionId, hasResults, listboxVisible]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      close();
      inputRef.current?.blur();
      return;
    }
    if (!listboxVisible) return;
    if (!hasResults) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Enter" && results[activeIndex]) {
      e.preventDefault();
      window.location.href = results[activeIndex].href;
      onNavigate?.();
      close();
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <label htmlFor={listId} className="sr-only">
        Search calculators
      </label>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--muted)]"
          aria-hidden
        />
        <input
          ref={inputRef}
          id={listId}
          type="search"
          role="combobox"
          aria-expanded={listboxVisible}
          aria-controls={listboxVisible ? popupId : undefined}
          aria-autocomplete="list"
          aria-activedescendant={
            listboxVisible && hasResults && activeOptionId
              ? activeOptionId
              : undefined
          }
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActiveIndex(0);
          }}
          onFocus={() => trimmedQuery && setOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full min-h-12 rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--surface)] py-3 pl-10 pr-4 text-base text-[var(--foreground)] shadow-sm transition-[border-color,box-shadow] duration-150 placeholder:text-[var(--muted)] focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20"
        />
      </div>
      {listboxVisible && !hasResults && (
        <div
          id={`${listId}-status`}
          role="status"
          aria-live="polite"
          className="absolute z-50 mt-2 w-full rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] py-1 shadow-[var(--shadow-elevated)]"
        >
          <p className="px-4 py-3 text-sm text-[var(--muted)]">
            No calculators match &ldquo;{trimmedQuery}&rdquo;
          </p>
        </div>
      )}
      {listboxVisible && hasResults && (
        <ul
          ref={listboxRef}
          id={`${listId}-listbox`}
          role="listbox"
          aria-label="Calculator search results"
          className="absolute z-50 mt-2 max-h-72 w-full overflow-auto rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] py-1 shadow-[var(--shadow-elevated)]"
        >
          {results.map((item, index) => (
            <SearchResultRow
              key={item.href}
              id={`${listId}-option-${index}`}
              item={item}
              active={index === activeIndex}
              onSelect={() => {
                onNavigate?.();
                close();
              }}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function SearchResultRow({
  id,
  item,
  active,
  onSelect,
}: {
  id: string;
  item: SearchableTool;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <li id={id} role="option" aria-selected={active}>
      <Link
        href={item.href}
        onClick={onSelect}
        className={`block px-4 py-3 transition-colors ${active ? "bg-[var(--brand-muted)]" : "hover:bg-[var(--surface-muted)]"}`}
      >
        <span className="block text-sm font-semibold text-[var(--foreground)]">
          {item.title}
        </span>
        <span className="mt-0.5 block text-xs text-[var(--muted)] line-clamp-1">
          {item.description}
        </span>
      </Link>
    </li>
  );
}
