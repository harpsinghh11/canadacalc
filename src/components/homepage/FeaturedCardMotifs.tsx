import type { ReactNode } from "react";

export function TaxCardMotif({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect x="18" y="12" width="44" height="56" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M26 24h28M26 32h28M26 40h20M26 48h24M26 56h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M52 40l6 6 10-12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MortgageCardMotif({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect x="14" y="52" width="10" height="16" rx="1" fill="currentColor" opacity="0.35" />
      <rect x="28" y="44" width="10" height="24" rx="1" fill="currentColor" opacity="0.5" />
      <rect x="42" y="36" width="10" height="32" rx="1" fill="currentColor" opacity="0.65" />
      <rect x="56" y="28" width="10" height="40" rx="1" fill="currentColor" opacity="0.8" />
      <path d="M12 68h56" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function RetirementCardMotif({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M12 58 C24 58, 28 42, 38 42 C48 42, 52 28, 68 22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="68" cy="22" r="3" fill="currentColor" />
      <path d="M12 68h56" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

export function StockCardMotif({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M10 52 L22 46 L34 50 L46 38 L58 42 L70 28"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M10 68h60" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

const MOTIF_MAP: Record<string, (props: { className?: string }) => ReactNode> = {
  tax: TaxCardMotif,
  mortgage: MortgageCardMotif,
  retirement: RetirementCardMotif,
  stocks: StockCardMotif,
};

export function FeaturedCardMotif({
  motif,
  className = "pointer-events-none absolute -right-1 -top-1 h-20 w-20 text-[var(--brand)] opacity-[0.11]",
}: {
  motif: keyof typeof MOTIF_MAP;
  className?: string;
}) {
  const Motif = MOTIF_MAP[motif];
  return <Motif className={className} />;
}
