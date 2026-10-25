"use client";

import {
  CHART_PERIODS,
  type ChartPeriod,
} from "@/lib/chart-period";

export function ChartPeriodToggle({
  value,
  onChange,
  caption,
}: {
  value: ChartPeriod;
  onChange: (period: ChartPeriod) => void;
  caption?: string;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div
        role="group"
        aria-label="Období grafů"
        className="inline-flex flex-wrap gap-1 rounded-xl border border-[var(--line)] bg-white/60 p-1"
      >
        {CHART_PERIODS.map((p) => {
          const active = value === p.id;
          return (
            <button
              key={p.id}
              type="button"
              title={p.hint}
              aria-pressed={active}
              onClick={() => onChange(p.id)}
              className={
                active
                  ? "rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-medium text-white sm:text-sm"
                  : "rounded-lg px-3 py-1.5 text-xs font-medium text-[var(--ink-soft)] transition hover:bg-white hover:text-[var(--ink)] sm:text-sm"
              }
            >
              {p.label}
            </button>
          );
        })}
      </div>
      {caption ? (
        <p className="text-xs text-[var(--muted)] sm:text-right">{caption}</p>
      ) : null}
    </div>
  );
}
