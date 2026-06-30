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
    success: "text-[#16a34a]",
    warning: "text-amber-600",
    neutral: "text-[#0f172a]",
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
        className="relative max-w-full overflow-hidden rounded-xl border-2 border-[#16a34a] bg-gradient-to-br from-white to-green-50 p-6 text-center"
      >
        <div
          className="pointer-events-none absolute right-4 top-4 text-4xl opacity-10"
          aria-hidden
        >
          🍁
        </div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[#16a34a]">
          CanadaCalc
        </p>
        <p className="mt-2 break-words text-lg font-bold text-[#0f172a]">{headline}</p>
        <div className="mt-3 space-y-1">
          {lines.map((line) => (
            <p key={line} className="break-words text-sm text-slate-700">
              {line}
            </p>
          ))}
        </div>
        {verdict && (
          <p className={`mt-4 text-base font-semibold ${verdictColors[verdictType]}`}>
            {verdict}
          </p>
        )}
        <p className="mt-4 text-[10px] text-slate-400">canadacalc.net</p>
      </div>
      <button
        type="button"
        onClick={handleShare}
        disabled={sharing}
        className="mt-3 w-full rounded-lg bg-[#0f172a] px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
      >
        {sharing ? "Generating…" : copied ? "Copied to clipboard!" : "Share your result"}
      </button>
    </div>
  );
}
