import Link from "next/link";
import { SITE_NAME, TRUST_PAGES } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--border)] bg-[var(--surface-muted)]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <nav
          aria-label="Footer"
          className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm"
        >
          {TRUST_PAGES.map((page) => (
            <Link
              key={page.href}
              href={page.href}
              className="text-[var(--muted)] transition-colors hover:text-[var(--brand)]"
            >
              {page.label}
            </Link>
          ))}
        </nav>
        <p className="mt-6 text-center text-sm font-medium text-[var(--foreground)]">
          Built for Canadians · No signup required · Privacy-friendly tools
        </p>
        <p className="mx-auto mt-4 max-w-3xl text-center text-sm leading-relaxed text-[var(--muted)]">
          <strong>Disclaimer:</strong> {SITE_NAME} is an independent
          informational tool and is not affiliated with the Government of
          Canada, CRA, OSFI, FCAC, Bank of Canada, or any financial institution.
          Results are estimates only and are not financial, tax, legal, or
          investment advice. Consult a qualified professional for decisions
          about your situation.
        </p>
        <p className="mt-4 text-center text-xs text-[var(--muted)]">
          © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
