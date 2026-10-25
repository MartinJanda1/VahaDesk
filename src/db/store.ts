import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { neon } from "@neondatabase/serverless";
import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import {
  measurements,
  profiles,
  type Measurement,
  type NewMeasurement,
  type Profile,
} from "./schema";

export type ImportDuplicateMode = "overwrite" | "skip";

export type ImportMeasurementsResult = {
  inserted: number;
  updated: number;
  skipped: number;
};

export type MeasurementInput = Omit<NewMeasurement, "id" | "profileId"> & {
  profileId?: string;
};

type MeasurementRow = Omit<NewMeasurement, "id" | "profileId">;

function measuredAtMs(value: Date | string): number {
  return value instanceof Date ? value.getTime() : new Date(value).getTime();
}

function toMeasurementFields(r: MeasurementRow) {
  return {
    measuredAt:
      r.measuredAt instanceof Date ? r.measuredAt : new Date(r.measuredAt!),
    weightKg: r.weightKg ?? null,
    bodyFatPct: r.bodyFatPct ?? null,
    musclePct: r.musclePct ?? null,
    proteinPct: r.proteinPct ?? null,
    bonePct: r.bonePct ?? null,
    bmi: r.bmi ?? null,
    bmrKcal: r.bmrKcal ?? null,
    waterPct: r.waterPct ?? null,
    activeMassKg: r.activeMassKg ?? null,
    amrKcal: r.amrKcal ?? null,
    subcutaneousFatKg: r.subcutaneousFatKg ?? null,
    skeletalMuscleKg: r.skeletalMuscleKg ?? null,
    visceralFatIndex: r.visceralFatIndex ?? null,
    somatotype: r.somatotype ?? null,
    rawJson: r.rawJson ?? null,
  };
}

type FileStore = {
  profiles: Profile[];
  measurements: Measurement[];
};

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "store.json");

function hasDatabaseUrl(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL chybí");
  return drizzle(neon(url));
}

async function readFileStore(): Promise<FileStore> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(raw, (key, value) => {
      if (
        (key === "createdAt" || key === "measuredAt") &&
        typeof value === "string"
      ) {
        return new Date(value);
      }
      return value;
    }) as FileStore;
  } catch {
    return { profiles: [], measurements: [] };
  }
}

async function writeFileStore(store: FileStore): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(store, null, 2), "utf8");
}

export async function listProfiles(): Promise<Profile[]> {
  if (hasDatabaseUrl()) {
    return getDb().select().from(profiles).orderBy(desc(profiles.createdAt));
  }
  const store = await readFileStore();
  return [...store.profiles].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );
}

export async function getProfile(id: string): Promise<Profile | null> {
  if (hasDatabaseUrl()) {
    const rows = await getDb()
      .select()
      .from(profiles)
      .where(eq(profiles.id, id))
      .limit(1);
    return rows[0] ?? null;
  }
  const store = await readFileStore();
  return store.profiles.find((p) => p.id === id) ?? null;
}

export async function createProfile(input: {
  name: string;
  age: number;
  heightCm: number;
}): Promise<Profile> {
  if (hasDatabaseUrl()) {
    const rows = await getDb()
      .insert(profiles)
      .values({
        name: input.name,
        age: input.age,
        heightCm: input.heightCm,
      })
      .returning();
    return rows[0]!;
  }
  const store = await readFileStore();
  const profile: Profile = {
    id: randomUUID(),
    name: input.name,
    age: input.age,
    heightCm: input.heightCm,
    createdAt: new Date(),
  };
  store.profiles.push(profile);
  await writeFileStore(store);
  return profile;
}

export async function deleteProfile(id: string): Promise<boolean> {
  if (hasDatabaseUrl()) {
    const rows = await getDb()
      .delete(profiles)
      .where(eq(profiles.id, id))
      .returning({ id: profiles.id });
    return rows.length > 0;
  }
  const store = await readFileStore();
  const before = store.profiles.length;
  store.profiles = store.profiles.filter((p) => p.id !== id);
  if (store.profiles.length === before) return false;
  store.measurements = store.measurements.filter((m) => m.profileId !== id);
  await writeFileStore(store);
  return true;
}

export async function listMeasurements(
  profileId: string,
): Promise<Measurement[]> {
  if (hasDatabaseUrl()) {
    return getDb()
      .select()
      .from(measurements)
      .where(eq(measurements.profileId, profileId))
      .orderBy(measurements.measuredAt);
  }
  const store = await readFileStore();
  return store.measurements
    .filter((m) => m.profileId === profileId)
    .sort((a, b) => a.measuredAt.getTime() - b.measuredAt.getTime());
}

export async function insertMeasurements(
  profileId: string,
  rows: MeasurementRow[],
): Promise<number> {
  if (!rows.length) return 0;
  if (hasDatabaseUrl()) {
    await getDb()
      .insert(measurements)
      .values(rows.map((r) => ({ ...r, profileId })));
    return rows.length;
  }
  const store = await readFileStore();
  for (const r of rows) {
    store.measurements.push({
      id: randomUUID(),
      profileId,
      ...toMeasurementFields(r),
    });
  }
  await writeFileStore(store);
  return rows.length;
}

export async function importMeasurements(
  profileId: string,
  rows: MeasurementRow[],
  mode: ImportDuplicateMode,
): Promise<ImportMeasurementsResult> {
  const result: ImportMeasurementsResult = {
    inserted: 0,
    updated: 0,
    skipped: 0,
  };
  if (!rows.length) return result;

  const existing = await listMeasurements(profileId);
  const byTime = new Map<number, Measurement>();
  for (const m of existing) {
    byTime.set(measuredAtMs(m.measuredAt), m);
  }

  type MeasurementFields = ReturnType<typeof toMeasurementFields>;
  const toInsert: MeasurementFields[] = [];
  const toUpdate: { id: string; fields: MeasurementFields }[] = [];

  for (const row of rows) {
    const fields = toMeasurementFields(row);
    const existingRow = byTime.get(measuredAtMs(fields.measuredAt));
    if (!existingRow) {
      toInsert.push(fields);
      continue;
    }
    if (mode === "skip") {
      result.skipped += 1;
      continue;
    }
    toUpdate.push({ id: existingRow.id, fields });
  }

  if (hasDatabaseUrl()) {
    const db = getDb();
    if (toInsert.length) {
      await db
        .insert(measurements)
        .values(toInsert.map((r) => ({ ...r, profileId })));
      result.inserted = toInsert.length;
    }
    for (const item of toUpdate) {
      await db
        .update(measurements)
        .set(item.fields)
        .where(eq(measurements.id, item.id));
    }
    result.updated = toUpdate.length;
    return result;
  }

  const store = await readFileStore();
  for (const fields of toInsert) {
    store.measurements.push({
      id: randomUUID(),
      profileId,
      ...fields,
    });
  }
  result.inserted = toInsert.length;

  for (const item of toUpdate) {
    const idx = store.measurements.findIndex((m) => m.id === item.id);
    if (idx < 0) continue;
    store.measurements[idx] = {
      ...store.measurements[idx]!,
      ...item.fields,
    };
  }
  result.updated = toUpdate.length;

  if (toInsert.length || toUpdate.length) {
    await writeFileStore(store);
  }
  return result;
}

export async function ensureSchema(): Promise<void> {
  if (!hasDatabaseUrl()) return;
  const sql = neon(process.env.DATABASE_URL!);
  await sql`
    CREATE TABLE IF NOT EXISTS profiles (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      age integer NOT NULL,
      height_cm integer NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS measurements (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      measured_at timestamptz NOT NULL,
      weight_kg real,
      body_fat_pct real,
      muscle_pct real,
      protein_pct real,
      bone_pct real,
      bmi real,
      bmr_kcal real,
      water_pct real,
      active_mass_kg real,
      amr_kcal real,
      subcutaneous_fat_kg real,
      skeletal_muscle_kg real,
      visceral_fat_index real,
      somatotype text,
      raw_json jsonb
    )
  `;
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS measurements_profile_measured_at_uidx
    ON measurements (profile_id, measured_at)
  `;
}
