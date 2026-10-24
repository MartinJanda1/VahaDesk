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

export type MeasurementInput = Omit<NewMeasurement, "id" | "profileId"> & {
  profileId?: string;
};

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
  rows: Omit<NewMeasurement, "id" | "profileId">[],
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
      measuredAt: r.measuredAt instanceof Date ? r.measuredAt : new Date(r.measuredAt!),
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
    });
  }
  await writeFileStore(store);
  return rows.length;
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
}
