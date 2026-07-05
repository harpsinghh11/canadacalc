import Link from "next/link";
import type { ReactNode } from "react";

interface TrustPageLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function TrustPageLayout({
  title,
  description,
  children,
}: TrustPageLayoutProps) {
  return (
    <div className="mx-auto min-w-0 max-w-3xl px-4 py-12 pb-24 sm:px-6 lg:px-8 lg:pb-12">
      <p className="text-sm font-medium text-[var(--brand)]">CanadaCalc</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--foreground)]">
        {title}
      </h1>
      <p className="mt-3 text-base text-[var(--muted)]">{description}</p>
      <div className="prose-trust mt-8 space-y-4 text-sm leading-relaxed text-[var(--foreground)]">
        {children}
      </div>
      <p className="mt-10 border-t border-[var(--border)] pt-6 text-sm text-[var(--muted)]">
        <Link href="/" className="font-medium text-[var(--brand)] hover:underline">
          ← Back to calculators
        </Link>
      </p>
    </div>
  );
}
