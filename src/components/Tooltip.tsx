"use client";

import type { ReactNode } from "react";

/** Vizualita sjednocená s Recharts Tooltip v TimeSeriesChart. */
export function Tooltip({
  content,
  children,
  side = "bottom",
}: {
  content: ReactNode;
  children: ReactNode;
  side?: "top" | "bottom";
}) {
  const position =
    side === "top"
      ? "bottom-full mb-2"
      : "top-full mt-2";

  return (
    <span className="group relative inline-flex">
      {children}
      <span
        role="tooltip"
        className={`pointer-events-none absolute right-0 z-40 w-max max-w-64 ${position} rounded-[10px] border border-[rgba(68,48,28,0.12)] bg-[rgba(255,250,244,0.97)] px-3 py-2 text-left text-[13px] leading-snug text-[var(--ink-soft)] opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100`}
      >
        {content}
      </span>
    </span>
  );
}
