import { Lightbulb } from "lucide-react";

interface CanadaCalcInsightProps {
  children: React.ReactNode;
}

export function CanadaCalcInsight({ children }: CanadaCalcInsightProps) {
  return (
    <div className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-muted)] p-4">
      <div className="flex gap-3">
        <Lightbulb
          className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand)]"
          aria-hidden
        />
        <div>
          <p className="text-sm font-semibold text-[var(--foreground)]">
            CanadaCalc insight
          </p>
          <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">
            {children}
          </p>
        </div>
      </div>
    </div>
  );
}
