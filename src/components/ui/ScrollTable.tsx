import type { ReactNode } from "react";

interface ScrollTableProps {
  children: ReactNode;
  caption?: string;
  compact?: boolean;
}

/** Horizontally scrollable table wrapper with mobile scroll hint. */
export function ScrollTable({ children, caption, compact }: ScrollTableProps) {
  return (
    <div>
      <p className="mb-2 text-xs text-slate-500 sm:hidden">
        Swipe horizontally to see all columns →
      </p>
      <div className="overflow-x-auto rounded-lg border border-slate-200 [-webkit-overflow-scrolling:touch]">
        <table
          className={`w-full text-left text-sm ${compact ? "table-fixed" : "min-w-[28rem]"}`}
        >
          {caption && <caption className="sr-only">{caption}</caption>}
          {children}
        </table>
      </div>
    </div>
  );
}
