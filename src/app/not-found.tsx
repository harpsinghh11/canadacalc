import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-wide text-[var(--brand)]">
        404
      </p>
      <h1 className="mt-3 text-3xl font-bold text-[var(--foreground)] sm:text-4xl">
        Page not found
      </h1>
      <p className="mt-4 text-base text-[var(--muted)]">
        The calculator or page you were looking for does not exist.
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-[var(--radius-control)] bg-[var(--brand)] px-5 py-3 text-sm font-medium text-white hover:bg-[var(--brand-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)]"
        >
          Back to homepage
        </Link>
        <Link
          href="/compound"
          className="inline-flex items-center justify-center rounded-[var(--radius-control)] border border-[var(--border-strong)] px-5 py-3 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--surface-muted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)]"
        >
          Try a calculator
        </Link>
      </div>
    </div>
  );
}
