import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CalculatorIcon } from "@/lib/calculator-icons";

interface MediumToolTileProps {
  href: string;
  title: string;
  description: string;
}

export function MediumToolTile({ href, title, description }: MediumToolTileProps) {
  return (
    <Link
      href={href}
      className="group flex min-h-[140px] flex-col rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--background)] p-4 transition-[border-color,box-shadow] duration-200 hover:border-[var(--brand)]/30 hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)] sm:p-5"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--surface-muted)] text-[var(--brand)] transition-colors group-hover:bg-[var(--brand-muted)]">
        <CalculatorIcon href={href} className="h-[1.125rem] w-[1.125rem]" />
      </div>
      <h3 className="mt-3 text-base font-semibold text-[var(--foreground)]">{title}</h3>
      <p className="mt-1.5 flex-1 text-sm leading-relaxed text-[var(--muted)]">
        {description}
      </p>
      <ArrowRight
        className="mt-3 h-4 w-4 self-end text-[var(--brand)] transition-transform group-hover:translate-x-0.5 motion-reduce:group-hover:translate-x-0"
        aria-hidden
      />
    </Link>
  );
}
