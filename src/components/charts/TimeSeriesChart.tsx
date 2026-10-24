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
import { formatShortDate } from "@/lib/format";

export type SeriesPoint = {
  t: number;
  label: string;
  [key: string]: number | string | null;
};

type SeriesDef = {
  dataKey: string;
  name: string;
  color: string;
  unit?: string;
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

  return (
    <div style={{ width: "100%", height }} className="animate-fade-in">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="rgba(15, 61, 46, 0.08)" strokeDasharray="4 6" />
          <XAxis
            dataKey="t"
            type="number"
            domain={["dataMin", "dataMax"]}
            tickFormatter={(v) => formatShortDate(new Date(v))}
            tick={{ fill: "#5c6b63", fontSize: 11 }}
            axisLine={{ stroke: "rgba(15,61,46,0.15)" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#5c6b63", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={42}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 10,
              border: "1px solid rgba(15,61,46,0.12)",
              background: "rgba(255,252,247,0.96)",
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
              return [`${value}${unit}`, s?.name ?? String(name)];
            }}
          />
          {series.length > 1 ? (
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
          ) : null}
          {series.map((s) => (
            <Line
              key={s.dataKey}
              type="monotone"
              dataKey={s.dataKey}
              name={s.name}
              stroke={s.color}
              strokeWidth={2.25}
              dot={{ r: 3, strokeWidth: 0, fill: s.color }}
              activeDot={{ r: 5 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
