import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CalculatorIcon } from "@/lib/calculator-icons";
import { FeaturedCardMotif } from "./FeaturedCardMotifs";

interface FeaturedCalculatorCardProps {
  href: string;
  categoryLabel: string;
  title: string;
  description: string;
  actionLabel: string;
  motif: "tax" | "mortgage" | "retirement" | "stocks";
}

export function FeaturedCalculatorCard({
  href,
  categoryLabel,
  title,
  description,
  actionLabel,
  motif,
}: FeaturedCalculatorCardProps) {
  return (
    <Link
      href={href}
      className="group relative flex min-h-[220px] flex-col overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-5 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-[var(--brand)]/30 hover:shadow-[var(--shadow-elevated)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)] motion-reduce:hover:translate-y-0 sm:min-h-[240px]"
    >
      <FeaturedCardMotif motif={motif} />
      <p className="text-[0.6875rem] font-semibold uppercase tracking-wide text-[var(--brand)]">
        {categoryLabel}
      </p>
      <div className="mt-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--surface-muted)] text-[var(--brand)] transition-colors group-hover:bg-[var(--brand-muted)]">
        <CalculatorIcon href={href} className="h-5 w-5" />
      </div>
      <h3 className="mt-3 text-base font-semibold leading-snug text-[var(--foreground)] sm:text-lg">
        {title}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--muted)] line-clamp-3">
        {description}
      </p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[var(--brand)] transition-colors group-hover:text-[var(--brand-hover)]">
        {actionLabel}
        <ArrowRight
          className="h-4 w-4 transition-transform group-hover:translate-x-0.5 motion-reduce:group-hover:translate-x-0"
          aria-hidden
        />
      </span>
    </Link>
  );
}
