import type { Measurement } from "@/db/schema";

export type ChartPeriod = "1m" | "3m" | "1y" | "all";

export const CHART_PERIODS: {
  id: ChartPeriod;
  label: string;
  hint: string;
}[] = [
  { id: "1m", label: "1 měsíc", hint: "jednotlivá měření" },
  { id: "3m", label: "3 měsíce", hint: "jednotlivá měření" },
  { id: "1y", label: "1 rok", hint: "týdenní průměry" },
  { id: "all", label: "Vše", hint: "podle délky období" },
];

const DAY_MS = 86400000;

function msOf(value: Date | string): number {
  return value instanceof Date ? value.getTime() : new Date(value).getTime();
}

function sortedByTime(rows: Measurement[]): Measurement[] {
  return [...rows].sort((a, b) => msOf(a.measuredAt) - msOf(b.measuredAt));
}

function windowDays(period: ChartPeriod): number | null {
  if (period === "1m") return 30;
  if (period === "3m") return 90;
  if (period === "1y") return 365;
  return null;
}

export function filterMeasurementsByPeriod(
  rows: Measurement[],
  period: ChartPeriod,
): Measurement[] {
  const sorted = sortedByTime(rows);
  if (!sorted.length) return [];
  const days = windowDays(period);
  if (days == null) return sorted;
  const end = msOf(sorted[sorted.length - 1]!.measuredAt);
  const start = end - days * DAY_MS;
  return sorted.filter((m) => msOf(m.measuredAt) >= start);
}

type AggMode = "none" | "week" | "month";

function pickAggMode(
  period: ChartPeriod,
  rows: Measurement[],
): AggMode {
  if (period === "1m" || period === "3m") return "none";
  if (period === "1y") return "week";
  if (rows.length < 2) return "none";
  const span =
    msOf(rows[rows.length - 1]!.measuredAt) - msOf(rows[0]!.measuredAt);
  const spanDays = span / DAY_MS;
  if (spanDays > 400) return "month";
  if (spanDays > 120) return "week";
  return "none";
}

function bucketKey(t: number, mode: AggMode): string {
  const d = new Date(t);
  if (mode === "month") {
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
  }
  // ISO-ish week: year + week number from UTC Thursday trick
  const tmp = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((tmp.getTime() - yearStart.getTime()) / DAY_MS + 1) / 7);
  return `${tmp.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

const NUMERIC_KEYS: (keyof Measurement)[] = [
  "weightKg",
  "bodyFatPct",
  "musclePct",
  "proteinPct",
  "bonePct",
  "bmi",
  "bmrKcal",
  "waterPct",
  "activeMassKg",
  "amrKcal",
  "subcutaneousFatKg",
  "skeletalMuscleKg",
  "visceralFatIndex",
];

function aggregateMeasurements(
  rows: Measurement[],
  mode: AggMode,
): Measurement[] {
  if (mode === "none" || rows.length === 0) return rows;

  const groups = new Map<string, Measurement[]>();
  for (const m of rows) {
    const key = bucketKey(msOf(m.measuredAt), mode);
    const list = groups.get(key) ?? [];
    list.push(m);
    groups.set(key, list);
  }

  const out: Measurement[] = [];
  for (const [, group] of groups) {
    const sorted = sortedByTime(group);
    const last = sorted[sorted.length - 1]!;
    const avg: Measurement = {
      ...last,
      id: last.id,
      measuredAt: last.measuredAt,
    };

    for (const key of NUMERIC_KEYS) {
      const vals = sorted
        .map((r) => r[key])
        .filter((v): v is number => typeof v === "number" && Number.isFinite(v));
      if (!vals.length) {
        (avg as Record<string, unknown>)[key] = null;
        continue;
      }
      const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
      (avg as Record<string, unknown>)[key] =
        Math.round(mean * 100) / 100;
    }

    // Keep last somatotype in bucket
    avg.somatotype = last.somatotype;
    out.push(avg);
  }

  return sortedByTime(out);
}

export function prepareMeasurementsForPeriod(
  rows: Measurement[],
  period: ChartPeriod,
): { rows: Measurement[]; aggregation: AggMode } {
  const filtered = filterMeasurementsByPeriod(rows, period);
  const aggregation = pickAggMode(period, filtered);
  return {
    rows: aggregateMeasurements(filtered, aggregation),
    aggregation,
  };
}

export function periodCaption(
  period: ChartPeriod,
  aggregation: AggMode,
): string {
  const base = CHART_PERIODS.find((p) => p.id === period)?.label ?? period;
  if (aggregation === "week") return `${base} · týdenní průměry`;
  if (aggregation === "month") return `${base} · měsíční průměry`;
  return `${base} · jednotlivá měření`;
}
