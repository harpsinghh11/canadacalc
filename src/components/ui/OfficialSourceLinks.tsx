import Link from "next/link";
import {
  OFFICIAL_SOURCES,
  type OfficialSourceKey,
} from "@/lib/sources";

interface OfficialSourceLinksProps {
  sources: OfficialSourceKey[];
}

export function OfficialSourceLinks({ sources }: OfficialSourceLinksProps) {
  if (sources.length === 0) return null;

  return (
    <div className="mt-4 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-sm">
      <p className="font-medium text-[var(--foreground)]">Official sources</p>
      <ul className="mt-2 space-y-1">
        {sources.map((key) => (
          <li key={key}>
            <Link
              href={OFFICIAL_SOURCES[key].href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--brand)] underline hover:text-[var(--brand-hover)]"
            >
              {OFFICIAL_SOURCES[key].label}
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-[var(--muted)]">
        Reference links only — not an endorsement. See our{" "}
        <Link href="/methodology" className="underline hover:text-[var(--foreground)]">
          methodology
        </Link>
        .
      </p>
    </div>
  );
}
