import type { Measurement } from "@/db/schema";
import type { ParamKey } from "@/lib/params";

/** Mid healthy BMI used as weight-loss target. */
export const IDEAL_BMI = 22;
/** Reference horizon for the smooth ideal trajectory. */
export const IDEAL_HORIZON_WEEKS = 52;
/** Weekly rate band around the ideal pace (kg/week). */
const RATE_TOLERANCE_KG_PER_WEEK = 0.25;

export const IDEAL_SERIES_COLOR = "#a8a29e";

/** Chart dataKey for a param's ideal overlay. */
export function idealChartKey(param: ParamKey): string {
  return `ideal__${param}`;
}

export type IdealPaceStatus = "onTrack" | "tooSlow" | "tooFast" | "atGoal";

export type IdealPoint = {
  t: number;
  byParam: Partial<Record<ParamKey, number>>;
  /** Convenience aliases used by dashboard weight summary */
  idealWeightKg: number;
  idealBodyFatPct: number | null;
  idealMusclePct: number | null;
  idealWaterPct: number | null;
};

export type IdealComparison = {
  applicable: boolean;
  reason?: string;
  targetWeightKg: number;
  startWeightKg: number;
  startAt: number;
  latestActualKg: number | null;
  latestIdealKg: number | null;
  /** actual − ideal at last measurement (positive = heavier than ideal path). */
  latestDeltaKg: number | null;
  avgDeltaKg: number | null;
  userKgPerWeek: number | null;
  idealKgPerWeek: number | null;
  status: IdealPaceStatus;
  statusText: string;
  summaryText: string;
  compositionNote: string | null;
};

export function idealWeightKg(heightCm: number): number {
  const h = heightCm / 100;
  return Math.round(IDEAL_BMI * h * h * 10) / 10;
}

function msOf(value: Date | string): number {
  return value instanceof Date ? value.getTime() : new Date(value).getTime();
}

function progressAt(elapsedMs: number): number {
  const horizonMs = IDEAL_HORIZON_WEEKS * 7 * 86400000;
  return Math.min(1, Math.max(0, elapsedMs / horizonMs));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function firstNumeric(
  rows: Measurement[],
  key: keyof Measurement,
): number | null {
  for (const row of rows) {
    const v = row[key];
    if (typeof v === "number" && Number.isFinite(v)) return v;
  }
  return null;
}

function mifflinBmr(weightKg: number, heightCm: number, age: number): number {
  return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5);
}

type TargetCtx = {
  heightCm: number;
  age: number;
  targetWeight: number;
  startWeight: number;
};

/** Orientational end targets at progress=1 (52 weeks). */
function targetFor(
  key: ParamKey,
  start: number,
  ctx: TargetCtx,
): number | null {
  switch (key) {
    case "weightKg":
      return Math.min(start, ctx.targetWeight);
    case "bodyFatPct":
      return Math.min(start, 22);
    case "musclePct":
      return Math.min(70, Math.max(start, start + 6));
    case "waterPct":
      return Math.min(56, Math.max(start, start + 5));
    case "proteinPct":
      return Math.min(15, Math.max(start, 13));
    case "bmi":
      return Math.min(start, IDEAL_BMI);
    case "bmrKcal":
      return mifflinBmr(ctx.targetWeight, ctx.heightCm, ctx.age);
    case "activeMassKg": {
      const lean = ctx.targetWeight * (1 - 0.22);
      return Math.max(start * 0.98, lean);
    }
    case "amrKcal":
      return Math.round(
        mifflinBmr(ctx.targetWeight, ctx.heightCm, ctx.age) * 1.54,
      );
    case "subcutaneousFatKg":
      return round1(ctx.targetWeight * 0.22 * 0.82);
    case "skeletalMuscleKg":
      return Math.max(start, start * 1.03);
    case "visceralFatIndex":
      return Math.min(start, 9);
    case "bonePct":
    case "somatotype":
      return null;
    default:
      return null;
  }
}

const OVERLAY_PARAMS: ParamKey[] = [
  "weightKg",
  "bodyFatPct",
  "musclePct",
  "waterPct",
  "proteinPct",
  "bmi",
  "bmrKcal",
  "activeMassKg",
  "amrKcal",
  "subcutaneousFatKg",
  "skeletalMuscleKg",
  "visceralFatIndex",
];

/**
 * Smooth ideal trajectories aligned to each measurement timestamp.
 * Weight / BMI → BMI 22; composition and related metrics move toward healthier bands.
 */
export function buildIdealSeries(input: {
  heightCm: number;
  age?: number;
  measurements: Measurement[];
  anchorMeasurements?: Measurement[];
}): { points: IdealPoint[]; applicable: boolean; reason?: string } {
  const age = input.age ?? 40;
  const sorted = [...input.measurements].sort(
    (a, b) => msOf(a.measuredAt) - msOf(b.measuredAt),
  );
  const anchor = [...(input.anchorMeasurements ?? input.measurements)].sort(
    (a, b) => msOf(a.measuredAt) - msOf(b.measuredAt),
  );
  const startRow = anchor.find(
    (m) => typeof m.weightKg === "number" && Number.isFinite(m.weightKg),
  );
  if (!startRow || typeof startRow.weightKg !== "number") {
    return {
      points: [],
      applicable: false,
      reason: "Chybí první měření hmotnosti pro ideální křivku.",
    };
  }

  const startWeight = startRow.weightKg;
  const startAt = msOf(startRow.measuredAt);
  const targetWeight = idealWeightKg(input.heightCm);
  const ctx: TargetCtx = {
    heightCm: input.heightCm,
    age,
    targetWeight,
    startWeight,
  };

  const starts = new Map<ParamKey, number>();
  for (const key of OVERLAY_PARAMS) {
    const s = firstNumeric(anchor, key);
    if (s != null) starts.set(key, s);
  }
  // Weight always from first weight row
  starts.set("weightKg", startWeight);
  const startBmi = firstNumeric(anchor, "bmi");
  if (startBmi == null) {
    starts.set(
      "bmi",
      round1(startWeight / ((input.heightCm / 100) * (input.heightCm / 100))),
    );
  }

  const points: IdealPoint[] = sorted.map((m) => {
    const t = msOf(m.measuredAt);
    const p = progressAt(t - startAt);
    const byParam: Partial<Record<ParamKey, number>> = {};

    for (const key of OVERLAY_PARAMS) {
      const start = starts.get(key);
      if (start == null) continue;
      const end = targetFor(key, start, ctx);
      if (end == null) continue;
      const v = lerp(start, end, p);
      byParam[key] = key === "weightKg" || key === "bmrKcal" || key === "amrKcal"
        ? key === "weightKg"
          ? round2(v)
          : Math.round(v)
        : round1(v);
    }

    return {
      t,
      byParam,
      idealWeightKg: byParam.weightKg ?? startWeight,
      idealBodyFatPct: byParam.bodyFatPct ?? null,
      idealMusclePct: byParam.musclePct ?? null,
      idealWaterPct: byParam.waterPct ?? null,
    };
  });

  return { points, applicable: true };
}

function formatDeltaKg(delta: number): string {
  const abs = Math.abs(delta).toLocaleString("cs-CZ", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
  });
  if (delta > 0.05) return `+${abs} kg nad ideálem`;
  if (delta < -0.05) return `−${abs} kg pod ideálem`;
  return "na ideálu";
}

export function compareToIdeal(input: {
  heightCm: number;
  age?: number;
  measurements: Measurement[];
  points: IdealPoint[];
  applicable: boolean;
  reason?: string;
  anchorMeasurements?: Measurement[];
}): IdealComparison {
  const targetWeightKg = idealWeightKg(input.heightCm);
  const sorted = [...input.measurements].sort(
    (a, b) => msOf(a.measuredAt) - msOf(b.measuredAt),
  );
  const anchor = [...(input.anchorMeasurements ?? input.measurements)].sort(
    (a, b) => msOf(a.measuredAt) - msOf(b.measuredAt),
  );
  const startRow = anchor.find(
    (m) => typeof m.weightKg === "number" && Number.isFinite(m.weightKg),
  );
  const startWeightKg = startRow?.weightKg ?? targetWeightKg;
  const startAt = startRow ? msOf(startRow.measuredAt) : Date.now();

  if (!input.applicable || !input.points.length || !startRow) {
    return {
      applicable: false,
      reason: input.reason,
      targetWeightKg,
      startWeightKg,
      startAt,
      latestActualKg: null,
      latestIdealKg: null,
      latestDeltaKg: null,
      avgDeltaKg: null,
      userKgPerWeek: null,
      idealKgPerWeek: null,
      status: "atGoal",
      statusText: input.reason ?? "Ideální křivka není k dispozici.",
      summaryText: input.reason ?? "Ideální křivka není k dispozici.",
      compositionNote: null,
    };
  }

  const byT = new Map(input.points.map((p) => [p.t, p]));
  const deltas: number[] = [];
  for (const m of sorted) {
    if (typeof m.weightKg !== "number") continue;
    const ideal = byT.get(msOf(m.measuredAt));
    if (!ideal) continue;
    deltas.push(m.weightKg - ideal.idealWeightKg);
  }

  const latest = [...sorted]
    .reverse()
    .find((m) => typeof m.weightKg === "number");
  if (!latest) {
    return {
      applicable: false,
      reason: "V zvoleném období chybí měření hmotnosti.",
      targetWeightKg,
      startWeightKg,
      startAt,
      latestActualKg: null,
      latestIdealKg: null,
      latestDeltaKg: null,
      avgDeltaKg: null,
      userKgPerWeek: null,
      idealKgPerWeek: null,
      status: "atGoal",
      statusText: "V zvoleném období chybí měření hmotnosti.",
      summaryText: "V zvoleném období chybí měření hmotnosti.",
      compositionNote: null,
    };
  }

  const latestIdeal = byT.get(msOf(latest.measuredAt));
  if (!latestIdeal) {
    return {
      applicable: false,
      reason: input.reason ?? "Ideální křivka není k dispozici.",
      targetWeightKg,
      startWeightKg,
      startAt,
      latestActualKg: null,
      latestIdealKg: null,
      latestDeltaKg: null,
      avgDeltaKg: null,
      userKgPerWeek: null,
      idealKgPerWeek: null,
      status: "atGoal",
      statusText: input.reason ?? "Ideální křivka není k dispozici.",
      summaryText: input.reason ?? "Ideální křivka není k dispozici.",
      compositionNote: null,
    };
  }

  const latestActualKg = latest.weightKg as number;
  const latestIdealKg = latestIdeal.idealWeightKg;
  const latestDeltaKg = latestActualKg - latestIdealKg;
  const avgDeltaKg =
    deltas.length > 0
      ? Math.round((deltas.reduce((a, b) => a + b, 0) / deltas.length) * 10) /
        10
      : null;

  const windowStart = sorted.find(
    (m) => typeof m.weightKg === "number" && Number.isFinite(m.weightKg),
  )!;
  const windowStartKg = windowStart.weightKg as number;
  const windowStartIdeal = byT.get(msOf(windowStart.measuredAt));
  const elapsedMs = msOf(latest.measuredAt) - msOf(windowStart.measuredAt);
  const weeks = Math.max(elapsedMs / (7 * 86400000), 1 / 7);
  const userKgPerWeek =
    Math.round(((latestActualKg - windowStartKg) / weeks) * 100) / 100;
  const idealKgPerWeek =
    windowStartIdeal != null
      ? Math.round(
          ((latestIdealKg - windowStartIdeal.idealWeightKg) / weeks) * 100,
        ) / 100
      : Math.round(((latestIdealKg - startWeightKg) / weeks) * 100) / 100;

  let status: IdealPaceStatus = "onTrack";
  let statusText = "Tempo hubnutí je v doporučeném pásmu.";
  if (latestActualKg <= targetWeightKg + 0.3) {
    status = "atGoal";
    statusText = `Cílová hmotnost kolem BMI ${IDEAL_BMI} (${targetWeightKg} kg) je dosažená.`;
  } else if (startWeightKg <= targetWeightKg) {
    status = "atGoal";
    statusText = `Start už byl na nebo pod cílem BMI ${IDEAL_BMI}; ideál drží udržovací trajektorii.`;
  } else {
    const rateDiff = userKgPerWeek - idealKgPerWeek;
    if (rateDiff < -RATE_TOLERANCE_KG_PER_WEEK) {
      status = "tooFast";
      statusText =
        "Tempo je rychlejší než doporučené — raději zvolněte, ať je hubnutí bezpečnější.";
    } else if (rateDiff > RATE_TOLERANCE_KG_PER_WEEK) {
      status = "tooSlow";
      statusText =
        "Hubnutí jde pomaleji než doporučená křivka — trend zatím nefunguje podle plánu.";
    }
  }

  const avgPart =
    avgDeltaKg != null
      ? ` Průměrná odchylka za období: ${formatDeltaKg(avgDeltaKg)}.`
      : "";

  const summaryText = `K poslednímu měření: ${formatDeltaKg(latestDeltaKg)}. Cíl BMI ${IDEAL_BMI}: ${targetWeightKg} kg.${avgPart}`;

  const compositionNote =
    latestIdeal.idealBodyFatPct != null
      ? `Ideální složení sleduje stejný horizont: tuk směrem k ~22 %, svaly a voda mírně nahoru.`
      : null;

  return {
    applicable: true,
    targetWeightKg,
    startWeightKg,
    startAt,
    latestActualKg,
    latestIdealKg,
    latestDeltaKg,
    avgDeltaKg,
    userKgPerWeek,
    idealKgPerWeek,
    status,
    statusText,
    summaryText,
    compositionNote,
  };
}

/** Merge ideal values into chart series points (same `t`). */
export function mergeIdealIntoSeries<
  T extends { t: number; [key: string]: number | string | null },
>(data: T[], points: IdealPoint[]): T[] {
  const byT = new Map(points.map((p) => [p.t, p]));
  return data.map((row) => {
    const ideal = byT.get(row.t);
    if (!ideal) return row;
    const next: T = {
      ...row,
      idealWeightKg: ideal.idealWeightKg,
      idealBodyFatPct: ideal.idealBodyFatPct,
      idealMusclePct: ideal.idealMusclePct,
      idealWaterPct: ideal.idealWaterPct,
    };
    for (const [key, value] of Object.entries(ideal.byParam)) {
      if (value == null) continue;
      (next as Record<string, number | string | null>)[idealChartKey(key as ParamKey)] =
        value;
    }
    return next;
  });
}
