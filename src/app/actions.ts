"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseFitScaleCsv, type ParsedMeasurement } from "@/lib/csv";
import {
  createProfile,
  deleteProfile,
  ensureSchema,
  importMeasurements,
  insertMeasurements,
  listMeasurements,
  type ImportDuplicateMode,
} from "@/db/store";

export type ActionState = {
  ok: boolean;
  message?: string;
  needsDecision?: boolean;
  newCount?: number;
  duplicateCount?: number;
};

function toMeasurementRows(rows: ParsedMeasurement[]) {
  return rows.map((r) => ({
    measuredAt: r.measuredAt,
    weightKg: (r.values.weightKg as number | null) ?? null,
    bodyFatPct: (r.values.bodyFatPct as number | null) ?? null,
    musclePct: (r.values.musclePct as number | null) ?? null,
    proteinPct: (r.values.proteinPct as number | null) ?? null,
    bonePct: (r.values.bonePct as number | null) ?? null,
    bmi: (r.values.bmi as number | null) ?? null,
    bmrKcal: (r.values.bmrKcal as number | null) ?? null,
    waterPct: (r.values.waterPct as number | null) ?? null,
    activeMassKg: (r.values.activeMassKg as number | null) ?? null,
    amrKcal: (r.values.amrKcal as number | null) ?? null,
    subcutaneousFatKg: (r.values.subcutaneousFatKg as number | null) ?? null,
    skeletalMuscleKg: (r.values.skeletalMuscleKg as number | null) ?? null,
    visceralFatIndex: (r.values.visceralFatIndex as number | null) ?? null,
    somatotype: (r.values.somatotype as string | null) ?? null,
    rawJson: r.raw,
  }));
}

function parseDuplicateMode(formData: FormData): ImportDuplicateMode | null {
  const raw = formData.get("duplicateMode");
  if (raw === "overwrite" || raw === "skip") return raw;
  return null;
}

function num(formData: FormData, key: string): number | null {
  const v = formData.get(key);
  if (v == null || v === "") return null;
  const n = Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

export async function createProfileAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await ensureSchema();

  const name = String(formData.get("name") ?? "").trim();
  const age = num(formData, "age");
  const heightCm = num(formData, "heightCm");
  const file = formData.get("csv");

  if (!name) return { ok: false, message: "Zadejte jméno profilu." };
  if (age == null || age < 1 || age > 120)
    return { ok: false, message: "Věk musí být mezi 1 a 120." };
  if (heightCm == null || heightCm < 50 || heightCm > 250)
    return { ok: false, message: "Výška musí být mezi 50 a 250 cm." };

  let parsedRows: ReturnType<typeof parseFitScaleCsv>["rows"] = [];
  if (file instanceof File && file.size > 0) {
    const csvText = await file.text();
    const { rows, errors } = parseFitScaleCsv(csvText);
    if (!rows.length) {
      return {
        ok: false,
        message:
          errors[0] ??
          "CSV neobsahuje platná měření. Zkontrolujte export z TrueLife.",
      };
    }
    parsedRows = rows;
  }

  const profile = await createProfile({
    name,
    age: Math.round(age),
    heightCm: Math.round(heightCm),
  });

  if (parsedRows.length) {
    await insertMeasurements(profile.id, toMeasurementRows(parsedRows));
  }

  revalidatePath("/");
  redirect(`/profiles/${profile.id}`);
}

export async function deleteProfileAction(
  profileId: string,
): Promise<ActionState> {
  await ensureSchema();
  const ok = await deleteProfile(profileId);
  if (!ok) {
    return { ok: false, message: "Profil se nepodařilo smazat." };
  }
  revalidatePath("/");
  return { ok: true, message: "Profil byl smazán." };
}

export async function importCsvAction(
  profileId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await ensureSchema();
  const file = formData.get("csv");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Vyberte CSV soubor z TrueLife FitScale." };
  }
  const text = await file.text();
  const { rows, errors } = parseFitScaleCsv(text);
  if (!rows.length) {
    return {
      ok: false,
      message: errors[0] ?? "CSV neobsahuje platná měření.",
    };
  }

  const mapped = toMeasurementRows(rows);
  const existing = await listMeasurements(profileId);
  const existingTimes = new Set(
    existing.map((m) =>
      m.measuredAt instanceof Date
        ? m.measuredAt.getTime()
        : new Date(m.measuredAt).getTime(),
    ),
  );

  let newCount = 0;
  let duplicateCount = 0;
  for (const row of mapped) {
    const t =
      row.measuredAt instanceof Date
        ? row.measuredAt.getTime()
        : new Date(row.measuredAt).getTime();
    if (existingTimes.has(t)) duplicateCount += 1;
    else newCount += 1;
  }

  const mode = parseDuplicateMode(formData);
  if (!mode && duplicateCount > 0) {
    return {
      ok: true,
      needsDecision: true,
      newCount,
      duplicateCount,
      message: `CSV obsahuje ${newCount} nových a ${duplicateCount} již existujících měření (stejný čas).`,
    };
  }

  const result = await importMeasurements(profileId, mapped, mode ?? "skip");
  revalidatePath(`/profiles/${profileId}`);

  if (result.updated > 0) {
    return {
      ok: true,
      message: `Přidáno ${result.inserted}, přepsáno ${result.updated}.`,
    };
  }
  if (result.skipped > 0) {
    return {
      ok: true,
      message: `Přidáno ${result.inserted} (${result.skipped} duplicit přeskočeno).`,
    };
  }
  return { ok: true, message: `Přidáno ${result.inserted} měření.` };
}
