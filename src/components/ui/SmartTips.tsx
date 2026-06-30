import type { SmartTip } from "@/lib/insights";

interface SmartTipsProps {
  tips: SmartTip[];
}

const styles: Record<SmartTip["type"], string> = {
  info: "border-blue-200 bg-blue-50 text-blue-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  success: "border-green-200 bg-green-50 text-green-900",
};

export function SmartTips({ tips }: SmartTipsProps) {
  if (tips.length === 0) return null;

  return (
    <div className="mt-6 space-y-2">
      <h3 className="text-sm font-semibold text-[#0f172a]">Smart Tips</h3>
      {tips.map((tip, i) => (
        <p
          key={i}
          className={`rounded-lg border px-4 py-3 text-sm ${styles[tip.type]}`}
        >
          {tip.text}
        </p>
      ))}
    </div>
  );
}
