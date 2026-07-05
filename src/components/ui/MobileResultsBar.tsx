"use client";

import { useEffect, useState } from "react";

interface MobileResultsBarProps {
  label: string;
  value: string;
}

export function MobileResultsBar({ label, value }: MobileResultsBarProps) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const onFocusIn = (e: FocusEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      setHidden(
        tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA",
      );
    };
    const onFocusOut = () => {
      requestAnimationFrame(() => {
        const active = document.activeElement?.tagName;
        setHidden(
          active === "INPUT" ||
            active === "SELECT" ||
            active === "TEXTAREA",
        );
      });
    };
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    return () => {
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  if (hidden) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--border)] bg-[var(--surface)]/95 px-4 py-3 shadow-lg backdrop-blur lg:hidden">
      <div className="flex items-center justify-between">
        <span className="text-sm text-[var(--muted)]">{label}</span>
        <span className="text-lg font-bold tabular-nums text-[var(--foreground)]">{value}</span>
      </div>
    </div>
  );
}
