interface LastUpdatedProps {
  children: React.ReactNode;
}

/** Visible freshness label for calculators using official rates or limits. */
export function LastUpdated({ children }: LastUpdatedProps) {
  return (
    <span className="inline-flex items-center rounded-full bg-[var(--brand-muted)] px-3 py-1 text-xs font-medium text-[var(--brand)]">
      {children}
    </span>
  );
}
