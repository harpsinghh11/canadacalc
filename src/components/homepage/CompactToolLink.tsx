import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CalculatorIcon } from "@/lib/calculator-icons";

interface CompactToolLinkProps {
  href: string;
  title: string;
  description?: string;
}

export function CompactToolLink({ href, title, description }: CompactToolLinkProps) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--background)] px-3.5 py-3 transition-[border-color,background-color] duration-200 hover:border-[var(--brand)]/25 hover:bg-[var(--surface-muted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)] sm:px-4"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[var(--surface-muted)] text-[var(--brand)]">
        <CalculatorIcon href={href} className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-[var(--foreground)]">{title}</span>
        {description && (
          <span className="mt-0.5 block text-xs leading-relaxed text-[var(--muted)] line-clamp-2">
            {description}
          </span>
        )}
      </div>
      <ArrowRight
        className="h-4 w-4 shrink-0 text-[var(--muted)] transition-[color,transform] group-hover:translate-x-0.5 group-hover:text-[var(--brand)] motion-reduce:group-hover:translate-x-0"
        aria-hidden
      />
    </Link>
  );
}
