import type { ReactNode } from "react";

interface ScrollTableProps {
  children: ReactNode;
  caption?: string;
  compact?: boolean;
  /** Extra classes on the scroll container (e.g. max-h-80 overflow-y-auto). */
  bodyClassName?: string;
}

/** Horizontally scrollable table wrapper with mobile scroll hint. */
export function ScrollTable({
  children,
  caption,
  compact,
  bodyClassName,
}: ScrollTableProps) {
  return (
    <div className="min-w-0 max-w-full">
      <p className="mb-2 text-xs text-slate-500 sm:hidden">
        Swipe horizontally to see all columns →
      </p>
      <div
        className={`min-w-0 max-w-full overflow-x-auto rounded-lg border border-slate-200 [-webkit-overflow-scrolling:touch] ${bodyClassName ?? ""}`}
      >
        <table
          className={`text-left text-sm ${compact ? "w-full table-fixed" : "w-max min-w-full"}`}
        >
          {caption && <caption className="sr-only">{caption}</caption>}
          {children}
        </table>
      </div>
    </div>
  );
}
