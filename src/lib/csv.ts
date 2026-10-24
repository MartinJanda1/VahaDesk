import Papa from "papaparse";
import type { ParamKey } from "./params";

export type ParsedMeasurement = {
  measuredAt: Date;
  values: Partial<Record<ParamKey, number | string | null>>;
  raw: Record<string, string>;
};

const HEADER_MAP: Record<string, ParamKey | "measuredAt"> = {
  datum: "measuredAt",
  hmotnost: "weightKg",
  "tělesný tuk(%)": "bodyFatPct",
  "telesny tuk(%)": "bodyFatPct",
  "svaly(%)": "musclePct",
  "bílkoviny(%)": "proteinPct",
  "bilkoviny(%)": "proteinPct",
  "kosti(%)": "bonePct",
  bmi: "bmi",
  bmr: "bmrKcal",
  "voda v těle(%)": "waterPct",
  "voda v tele(%)": "waterPct",
  "aktivní tělesná hmota": "activeMassKg",
  "aktivni telesna hmota": "activeMassKg",
  amr: "amrKcal",
  "podkožní tuk": "subcutaneousFatKg",
  "podkozni tuk": "subcutaneousFatKg",
  "kosterní svalstvo(%)": "skeletalMuscleKg",
  "kosterni svalstvo(%)": "skeletalMuscleKg",
  "index viscerálního tuku": "visceralFatIndex",
  "index visceralniho tuku": "visceralFatIndex",
  somatotyp: "somatotype",
};

function normalizeHeader(h: string): string {
  return h
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

/** Build accent-insensitive lookup from HEADER_MAP */
const NORMALIZED_HEADER_MAP: Record<string, ParamKey | "measuredAt"> = {};
for (const [k, v] of Object.entries(HEADER_MAP)) {
  NORMALIZED_HEADER_MAP[normalizeHeader(k)] = v;
}

export function parseNumericCell(raw: string): number | null {
  const s = raw.trim();
  if (!s) return null;
  const cleaned = s
    .replace(/\s/g, "")
    .replace(",", ".")
    .replace(/(kg|kcal|%)$/i, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

/** TrueLife: MM-DD-YYYY HH:mm:ss */
export function parseTrueLifeDate(raw: string): Date | null {
  const s = raw.trim();
  const m = s.match(
    /^(\d{1,2})-(\d{1,2})-(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})$/,
  );
  if (!m) {
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const [, mm, dd, yyyy, hh, min, ss] = m;
  const d = new Date(
    Date.UTC(
      Number(yyyy),
      Number(mm) - 1,
      Number(dd),
      Number(hh),
      Number(min),
      Number(ss),
    ),
  );
  return Number.isNaN(d.getTime()) ? null : d;
}

export function parseFitScaleCsv(text: string): {
  rows: ParsedMeasurement[];
  errors: string[];
} {
  const errors: string[] = [];
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.replace(/^\uFEFF/, "").trim(),
  });

  if (parsed.errors.length) {
    for (const e of parsed.errors.slice(0, 5)) {
      errors.push(`CSV: ${e.message}`);
    }
  }

  const rows: ParsedMeasurement[] = [];
  for (const [i, row] of parsed.data.entries()) {
    const mapped: Partial<Record<ParamKey, number | string | null>> = {};
    let measuredAt: Date | null = null;

    for (const [header, cell] of Object.entries(row)) {
      const key = NORMALIZED_HEADER_MAP[normalizeHeader(header)];
      if (!key) continue;
      if (key === "measuredAt") {
        measuredAt = parseTrueLifeDate(cell ?? "");
        continue;
      }
      if (key === "somatotype") {
        mapped.somatotype = (cell ?? "").trim() || null;
        continue;
      }
      mapped[key] = parseNumericCell(cell ?? "");
    }

    if (!measuredAt) {
      errors.push(`Řádek ${i + 2}: neplatné nebo chybějící datum`);
      continue;
    }

    rows.push({ measuredAt, values: mapped, raw: row });
  }

  rows.sort((a, b) => a.measuredAt.getTime() - b.measuredAt.getTime());
  return { rows, errors };
}
