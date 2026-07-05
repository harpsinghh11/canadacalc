import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CalculatorIcon } from "@/lib/calculator-icons";

interface CalculatorCardProps {
  href: string;
  title: string;
  description: string;
  badge?: string;
}

export function CalculatorCard({
  href,
  title,
  description,
  badge,
}: CalculatorCardProps) {
  return (
    <article className="group flex h-full flex-col rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-5 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-[var(--brand)]/30 hover:shadow-[var(--shadow-elevated)] motion-reduce:hover:translate-y-0">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--surface-muted)] text-[var(--brand)] transition-colors group-hover:bg-[var(--brand-muted)]">
        <CalculatorIcon href={href} className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-[var(--foreground)]">
        {title}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--muted)]">
        {description}
      </p>
      {badge && (
        <p className="mt-3 text-xs font-medium text-[var(--muted)]">{badge}</p>
      )}
      <Link
        href={href}
        className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[var(--brand)] transition-colors hover:text-[var(--brand-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)]"
      >
        View calculator
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </article>
  );
}
