"use client";

import { useRef, useState } from "react";
import html2canvas from "html2canvas";

interface ShareResultCardProps {
  headline: string;
  lines: string[];
  verdict?: string;
  verdictType?: "success" | "warning" | "neutral";
}

export function ShareResultCard({
  headline,
  lines,
  verdict,
  verdictType = "neutral",
}: ShareResultCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);

  const verdictColors = {
    success: "text-[var(--positive)]",
    warning: "text-[var(--warning)]",
    neutral: "text-[var(--foreground)]",
  };

  const handleShare = async () => {
    if (!cardRef.current) return;
    setSharing(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
      });
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const text = [headline, ...lines, verdict].filter(Boolean).join("\n");
        if (navigator.share && navigator.canShare?.({ files: [new File([blob], "result.png", { type: "image/png" })] })) {
          await navigator.share({
            files: [new File([blob], "canadacalc-result.png", { type: "image/png" })],
            text,
          });
        } else {
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob }),
          ]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      });
    } catch {
      const text = [headline, ...lines, verdict].filter(Boolean).join("\n");
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="mt-6 min-w-0 max-w-full">
      <div
        ref={cardRef}
        className="relative max-w-full overflow-hidden rounded-[var(--radius-card)] border-2 border-[var(--brand)] bg-[var(--surface)] p-6 text-center"
      >
        <div
          className="pointer-events-none absolute right-4 top-4 text-4xl opacity-10"
          aria-hidden
        >
          🍁
        </div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">
          CanadaCalc
        </p>
        <p className="mt-2 break-words text-lg font-bold text-[var(--foreground)]">{headline}</p>
        <div className="mt-3 space-y-1">
          {lines.map((line) => (
            <p key={line} className="break-words text-sm text-[var(--muted)]">
              {line}
            </p>
          ))}
        </div>
        {verdict && (
          <p className={`mt-4 text-base font-semibold ${verdictColors[verdictType]}`}>
            {verdict}
          </p>
        )}
        <p className="mt-4 text-[10px] text-[var(--muted)]">canadacalc.net</p>
      </div>
      <button
        type="button"
        onClick={handleShare}
        disabled={sharing}
        className="mt-3 w-full rounded-[var(--radius-control)] bg-[var(--navy)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--foreground)] disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)]"
      >
        {sharing ? "Generating…" : copied ? "Copied to clipboard!" : "Share your result"}
      </button>
    </div>
  );
}
