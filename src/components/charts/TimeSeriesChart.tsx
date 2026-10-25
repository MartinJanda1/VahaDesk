"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatNumber, formatShortDate } from "@/lib/format";

export type SeriesPoint = {
  t: number;
  label: string;
  [key: string]: number | string | null;
};

export type SeriesDef = {
  dataKey: string;
  name: string;
  color: string;
  unit?: string;
  /** Reference / ideal line styling */
  dashed?: boolean;
};

export function TimeSeriesChart({
  data,
  series,
  height = 280,
}: {
  data: SeriesPoint[];
  series: SeriesDef[];
  height?: number;
}) {
  if (!data.length) {
    return (
      <div
        className="flex items-center justify-center rounded-xl border border-dashed border-[var(--line)] bg-white/40 text-sm text-[var(--muted)]"
        style={{ height }}
      >
        Zatím žádná měření — nahrajte CSV.
      </div>
    );
  }

  const showLegend = series.length > 1;

  return (
    <div style={{ width: "100%", height }} className="animate-fade-in">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="rgba(68, 48, 28, 0.08)" strokeDasharray="4 6" />
          <XAxis
            dataKey="t"
            type="number"
            domain={["dataMin", "dataMax"]}
            tickFormatter={(v) => formatShortDate(new Date(v))}
            tick={{ fill: "#78716c", fontSize: 11 }}
            axisLine={{ stroke: "rgba(68,48,28,0.15)" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#78716c", fontSize: 11 }}
            tickFormatter={(v) => formatNumber(Number(v))}
            axisLine={false}
            tickLine={false}
            width={48}
            domain={([dataMin, dataMax]) => {
              if (
                typeof dataMin !== "number" ||
                typeof dataMax !== "number" ||
                !Number.isFinite(dataMin) ||
                !Number.isFinite(dataMax)
              ) {
                return [dataMin, dataMax];
              }
              const span = dataMax - dataMin;
              const pad =
                span === 0
                  ? Math.max(Math.abs(dataMin) * 0.002, 0.05)
                  : span * 0.12;
              return [dataMin - pad, dataMax + pad];
            }}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 10,
              border: "1px solid rgba(68,48,28,0.12)",
              background: "rgba(255,250,244,0.97)",
              fontSize: 13,
            }}
            labelFormatter={(v) =>
              new Intl.DateTimeFormat("cs-CZ", {
                dateStyle: "medium",
                timeStyle: "short",
                timeZone: "Europe/Prague",
              }).format(new Date(Number(v)))
            }
            formatter={(value, name) => {
              const s = series.find((x) => x.name === name || x.dataKey === name);
              const unit = s?.unit ? ` ${s.unit}` : "";
              const num =
                typeof value === "number" ? formatNumber(value) : String(value);
              return [`${num}${unit}`, s?.name ?? String(name)];
            }}
          />
          {showLegend ? (
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
          ) : null}
          {series.map((s) => (
            <Line
              key={s.dataKey}
              type="monotone"
              dataKey={s.dataKey}
              name={s.name}
              stroke={s.color}
              strokeWidth={s.dashed ? 1.75 : 2.25}
              strokeDasharray={s.dashed ? "6 4" : undefined}
              dot={
                s.dashed
                  ? false
                  : { r: 3, strokeWidth: 0, fill: s.color }
              }
              activeDot={s.dashed ? false : { r: 5 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
