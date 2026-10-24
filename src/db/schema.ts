import {
  integer,
  jsonb,
  pgTable,
  real,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const profiles = pgTable("profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  heightCm: integer("height_cm").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const measurements = pgTable("measurements", {
  id: uuid("id").defaultRandom().primaryKey(),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  measuredAt: timestamp("measured_at", { withTimezone: true }).notNull(),
  weightKg: real("weight_kg"),
  bodyFatPct: real("body_fat_pct"),
  musclePct: real("muscle_pct"),
  proteinPct: real("protein_pct"),
  bonePct: real("bone_pct"),
  bmi: real("bmi"),
  bmrKcal: real("bmr_kcal"),
  waterPct: real("water_pct"),
  activeMassKg: real("active_mass_kg"),
  amrKcal: real("amr_kcal"),
  subcutaneousFatKg: real("subcutaneous_fat_kg"),
  skeletalMuscleKg: real("skeletal_muscle_kg"),
  visceralFatIndex: real("visceral_fat_index"),
  somatotype: text("somatotype"),
  rawJson: jsonb("raw_json"),
});

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
export type Measurement = typeof measurements.$inferSelect;
export type NewMeasurement = typeof measurements.$inferInsert;
