interface Segment {
  label: string;
  value: number;
  color: string;
}

interface IncomeBreakdownBarProps {
  segments: Segment[];
  total: number;
}

export function IncomeBreakdownBar({
  segments,
  total,
}: IncomeBreakdownBarProps) {
  if (total <= 0) return null;

  const filtered = segments.filter((s) => s.value > 0);
  if (filtered.length === 0) return null;

  return (
    <div className="space-y-2">
      <div
        className="flex h-3 w-full overflow-hidden rounded-full bg-[var(--surface-muted)]"
        role="img"
        aria-label="Income breakdown bar"
      >
        {filtered.map((seg) => (
          <div
            key={seg.label}
            className="h-full transition-[width] duration-200"
            style={{
              width: `${(seg.value / total) * 100}%`,
              backgroundColor: seg.color,
              minWidth: seg.value > 0 ? "2px" : 0,
            }}
            title={`${seg.label}: ${seg.value}`}
          />
        ))}
      </div>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--muted)]">
        {filtered.map((seg) => (
          <li key={seg.label} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: seg.color }}
              aria-hidden
            />
            {seg.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
