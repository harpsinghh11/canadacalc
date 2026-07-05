interface ResultExplainerProps {
  children: React.ReactNode;
}

/** Plain-English summary of what the main result means. */
export function ResultExplainer({ children }: ResultExplainerProps) {
  return (
    <p className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-sm leading-relaxed text-[var(--muted)]">
      {children}
    </p>
  );
}
