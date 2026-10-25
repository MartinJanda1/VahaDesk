import type { Measurement } from "@/db/schema";

/** Mid healthy BMI used as weight-loss target. */
export const IDEAL_BMI = 22;
/** Reference horizon for the smooth ideal trajectory. */
export const IDEAL_HORIZON_WEEKS = 52;
/** Weekly rate band around the ideal pace (kg/week). */
const RATE_TOLERANCE_KG_PER_WEEK = 0.25;

export const IDEAL_SERIES_COLOR = "#a8a29e";

export type IdealPaceStatus = "onTrack" | "tooSlow" | "tooFast" | "atGoal";

export type IdealPoint = {
  t: number;
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

/** Linear progress 0..1 over the 52-week horizon (clamped). */
function progressAt(elapsedMs: number): number {
  const horizonMs = IDEAL_HORIZON_WEEKS * 7 * 86400000;
  return Math.min(1, Math.max(0, elapsedMs / horizonMs));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
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

/**
 * Smooth ideal trajectories aligned to each measurement timestamp.
 * Weight: startWeight → BMI 22 over 52 weeks.
 * Composition: first measured value → healthier band along the same progress.
 */
export function buildIdealSeries(input: {
  heightCm: number;
  measurements: Measurement[];
}): { points: IdealPoint[]; applicable: boolean; reason?: string } {
  const sorted = [...input.measurements].sort(
    (a, b) => msOf(a.measuredAt) - msOf(b.measuredAt),
  );
  const startRow = sorted.find(
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
  const target = idealWeightKg(input.heightCm);

  if (startWeight <= target) {
    return {
      points: [],
      applicable: false,
      reason: `Hmotnost je už na nebo pod cílem BMI ${IDEAL_BMI} (${target} kg). Ideální křivka hubnutí se nezobrazuje.`,
    };
  }

  const startFat = firstNumeric(sorted, "bodyFatPct");
  const startMuscle = firstNumeric(sorted, "musclePct");
  const startWater = firstNumeric(sorted, "waterPct");

  const targetFat = 22;
  const targetMuscle =
    startMuscle != null ? Math.min(70, startMuscle + 8) : null;
  const targetWater = startWater != null ? Math.min(56, startWater + 6) : null;

  const points: IdealPoint[] = sorted.map((m) => {
    const t = msOf(m.measuredAt);
    const p = progressAt(t - startAt);
    return {
      t,
      idealWeightKg: Math.round(lerp(startWeight, target, p) * 100) / 100,
      idealBodyFatPct:
        startFat != null
          ? Math.round(lerp(startFat, targetFat, p) * 10) / 10
          : null,
      idealMusclePct:
        startMuscle != null && targetMuscle != null
          ? Math.round(lerp(startMuscle, targetMuscle, p) * 10) / 10
          : null,
      idealWaterPct:
        startWater != null && targetWater != null
          ? Math.round(lerp(startWater, targetWater, p) * 10) / 10
          : null,
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
  measurements: Measurement[];
  points: IdealPoint[];
  applicable: boolean;
  reason?: string;
}): IdealComparison {
  const targetWeightKg = idealWeightKg(input.heightCm);
  const sorted = [...input.measurements].sort(
    (a, b) => msOf(a.measuredAt) - msOf(b.measuredAt),
  );
  const startRow = sorted.find(
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

  const latest = [...sorted].reverse().find(
    (m) => typeof m.weightKg === "number",
  )!;
  const latestIdeal = byT.get(msOf(latest.measuredAt))!;
  const latestActualKg = latest.weightKg as number;
  const latestIdealKg = latestIdeal.idealWeightKg;
  const latestDeltaKg = latestActualKg - latestIdealKg;
  const avgDeltaKg =
    deltas.length > 0
      ? Math.round((deltas.reduce((a, b) => a + b, 0) / deltas.length) * 10) /
        10
      : null;

  const elapsedMs = msOf(latest.measuredAt) - startAt;
  const weeks = Math.max(elapsedMs / (7 * 86400000), 1 / 7);
  const userKgPerWeek =
    Math.round(((latestActualKg - startWeightKg) / weeks) * 100) / 100;
  const idealKgPerWeek =
    Math.round(((latestIdealKg - startWeightKg) / weeks) * 100) / 100;

  let status: IdealPaceStatus = "onTrack";
  let statusText = "Tempo hubnutí je v doporučeném pásmu.";
  if (latestActualKg <= targetWeightKg) {
    status = "atGoal";
    statusText = `Cílová hmotnost kolem BMI ${IDEAL_BMI} (${targetWeightKg} kg) je dosažená.`;
  } else {
    const rateDiff = userKgPerWeek - idealKgPerWeek;
    // Both rates are typically negative when losing weight.
    // user more negative than ideal → too fast; less negative → too slow.
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

  const lastFat = latestIdeal.idealBodyFatPct;
  const compositionNote =
    lastFat != null
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
    return {
      ...row,
      idealWeightKg: ideal.idealWeightKg,
      idealBodyFatPct: ideal.idealBodyFatPct,
      idealMusclePct: ideal.idealMusclePct,
      idealWaterPct: ideal.idealWaterPct,
    };
  });
}
