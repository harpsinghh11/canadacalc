import Link from "next/link";
import { CURATED_TAX_PAGES } from "@/lib/constants";

const LINK_LABELS: Record<(typeof CURATED_TAX_PAGES)[number]["href"], string> =
  {
    "/tax/ontario": "Ontario Tax Calculator",
    "/tax/british-columbia": "British Columbia Tax Calculator",
    "/tax/alberta": "Alberta Tax Calculator",
    "/tax/quebec": "Quebec Tax Calculator",
  };

export function ProvinceTaxNavLinks() {
  return (
    <nav
      aria-labelledby="province-tax-links-heading"
      className="mb-6 border-b border-[var(--border)] pb-6"
    >
      <h2
        id="province-tax-links-heading"
        className="text-sm font-semibold text-[var(--foreground)]"
      >
        Province-specific tax estimates
      </h2>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
        {CURATED_TAX_PAGES.map((page) => (
          <li key={page.href}>
            <Link
              href={page.href}
              className="font-medium text-[var(--brand)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)]"
            >
              {LINK_LABELS[page.href]}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
