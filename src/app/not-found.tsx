import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-wide text-[#16a34a]">
        404
      </p>
      <h1 className="mt-3 text-3xl font-bold text-[#0f172a] sm:text-4xl">
        Page not found
      </h1>
      <p className="mt-4 text-base text-slate-600">
        The calculator or page you were looking for does not exist.
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg bg-[#16a34a] px-5 py-3 text-sm font-medium text-white hover:bg-[#15803d]"
        >
          Back to homepage
        </Link>
        <Link
          href="/compound"
          className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-5 py-3 text-sm font-medium text-[#0f172a] hover:bg-slate-50"
        >
          Try a calculator
        </Link>
      </div>
    </div>
  );
}
