import type { SmartTip } from "@/lib/insights";

interface SmartTipsProps {
  tips: SmartTip[];
}

const styles: Record<SmartTip["type"], string> = {
  info: "border-blue-200 bg-blue-50 text-blue-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  success: "border-[var(--positive)]/20 bg-[var(--positive-muted)] text-[var(--positive)]",
};

export function SmartTips({ tips }: SmartTipsProps) {
  if (tips.length === 0) return null;

  return (
    <div className="mt-6 min-w-0 max-w-full space-y-2">
      <h3 className="text-sm font-semibold text-[var(--foreground)]">Smart Tips</h3>
      {tips.map((tip, i) => (
        <p
          key={i}
          className={`max-w-full break-words rounded-lg border px-4 py-3 text-sm ${styles[tip.type]}`}
        >
          {tip.text}
        </p>
      ))}
    </div>
  );
}
