/**
 * Demo CSV for ideal-curve comparison (BMI 22 overlay).
 * Profile hint: height 175 cm, age 54 — start weight 110 kg.
 *
 * Run: node scripts/generate-demo-csvs.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "..", "public", "samples");

const HEIGHT_M = 1.75;
const HEIGHT_CM = 175;
const AGE = 54;
const START = new Date(Date.UTC(2025, 9, 25, 8, 15, 0));
const WEEKS = 52;

const HEADER =
  "Datum,Hmotnost,Tělesný tuk(%),Svaly(%),Bílkoviny(%),Kosti(%),BMI,BMR,Voda v těle(%),Aktivní tělesná hmota,AMR,Podkožní tuk,Kosterní svalstvo(%),Index viscerálního tuku,Somatotyp";

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}
function round(n, d = 1) {
  const p = 10 ** d;
  return Math.round(n * p) / p;
}
function fmtDate(d) {
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const yyyy = d.getUTCFullYear();
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mi = String(d.getUTCMinutes()).padStart(2, "0");
  const ss = String(d.getUTCSeconds()).padStart(2, "0");
  return `${mm}-${dd}-${yyyy} ${hh}:${mi}:${ss}`;
}
function somatotype(bmi) {
  if (bmi >= 30) return "Obezita";
  if (bmi >= 25) return "Nadváha";
  if (bmi >= 18.5) return "Normální";
  return "Podváha";
}

function makeRand(seed0) {
  let seed = seed0;
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

/** Absolute weight kg at week 0..52 */
function radicalWeight(week) {
  // Aggressive: ~110 → ~78 in 16 weeks, then crawl to 70.
  const t = week / WEEKS;
  if (week <= 16) {
    return lerp(110, 78, week / 16);
  }
  return lerp(78, 70, (week - 16) / (WEEKS - 16));
}

/**
 * Volatile path ending at 125:
 * 0–12w: loss 110 → ~98
 * 12–24w: regain → ~112
 * 24–36w: sharp −20 kg → ~92
 * 36–52w: rebound up → 125
 */
function volatileWeight(week) {
  if (week <= 12) return lerp(110, 98, week / 12);
  if (week <= 24) return lerp(98, 112, (week - 12) / 12);
  if (week <= 36) return lerp(112, 92, (week - 24) / 12);
  return lerp(92, 125, (week - 36) / 16);
}

function lerp(a, b, t) {
  return a + (b - a) * clamp(t, 0, 1);
}

function rowFor(weightBase, week, rand) {
  const noise = (rand() - 0.5) * 0.85;
  const weight = round(clamp(weightBase + noise, 65, 130), 2);
  const bmi = round(weight / (HEIGHT_M * HEIGHT_M), 1);

  // Rough composition tied to BMI / weight level
  const fatBase = clamp(18 + (bmi - 22) * 1.15, 16, 48);
  const bodyFat = round(clamp(fatBase + (rand() - 0.5) * 1.1, 15, 50), 1);
  const muscle = round(
    clamp(68 - (bodyFat - 22) * 0.55 + (rand() - 0.5) * 0.9, 45, 72),
    1,
  );
  const water = round(
    clamp(55 - (bodyFat - 22) * 0.45 + (rand() - 0.5) * 1.0, 38, 58),
    1,
  );
  const protein = round(
    clamp(14 - (bodyFat - 22) * 0.12 + (rand() - 0.5) * 0.3, 10, 15),
    1,
  );
  const bone = round(clamp(3.5 + (rand() - 0.5) * 0.15, 3.0, 4.0), 1);

  const bmr = Math.round(
    10 * weight + 6.25 * HEIGHT_CM - 5 * AGE + 5 + (rand() - 0.5) * 18,
  );
  const amr = Math.round(bmr * 1.54);
  const fatMass = (weight * bodyFat) / 100;
  const activeMass = round(weight - fatMass, 1);
  const subcutaneous = round(fatMass * 0.82 + (rand() - 0.5) * 0.4, 1);
  const skeletal = round(
    weight * (muscle / 100) * 0.62 + (rand() - 0.5) * 0.35,
    1,
  );
  const visceral = round(
    clamp(6 + (bodyFat - 20) * 0.45 + (rand() - 0.5) * 0.8, 4, 24),
    1,
  );

  const d = new Date(START.getTime() + week * 7 * 86400000);
  d.setUTCHours(7 + Math.floor(rand() * 2), Math.floor(rand() * 60), 0);

  return [
    fmtDate(d),
    `${weight.toFixed(2)}kg`,
    `${bodyFat.toFixed(1)}%`,
    `${muscle.toFixed(1)}%`,
    `${protein.toFixed(1)}%`,
    `${bone.toFixed(1)}%`,
    String(bmi),
    `${bmr}kcal`,
    `${water.toFixed(1)}%`,
    `${activeMass.toFixed(1)}kg`,
    `${amr}kcal`,
    `${subcutaneous.toFixed(1)}kg`,
    `${skeletal.toFixed(1)}kg`,
    visceral.toFixed(1),
    somatotype(bmi),
  ].join(",");
}

function writeCsv(filename, weightFn, seed) {
  const rand = makeRand(seed);
  const rows = [];
  for (let week = 0; week <= WEEKS; week++) {
    rows.push(rowFor(weightFn(week), week, rand));
  }
  const dest = path.join(OUT, filename);
  fs.writeFileSync(dest, `${HEADER}\n${rows.join("\n")}\n`, "utf8");
  const first = rows[0].split(",")[1];
  const last = rows[rows.length - 1].split(",")[1];
  console.log(`${filename}: ${rows.length} weeks, ${first} → ${last}`);
}

fs.mkdirSync(OUT, { recursive: true });

writeCsv(
  "demo-radical-110-to-70.csv",
  radicalWeight,
  101,
);

writeCsv(
  "demo-volatile-110-to-125.csv",
  volatileWeight,
  202,
);

const readme = `# Ukázková CSV (TrueLife FitScale)

Importuj ručně do profilu (doporučení: výška **175 cm**, věk ~54 — sedí s dopočty BMI/BMR).
Ideální křivka v aplikaci míří na **BMI 22** (~67,4 kg při 175 cm).

## demo-radical-110-to-70.csv

- **Start:** 110 kg → **konec:** ~70 kg za 1 rok (týdenní měření)
- **Příběh:** velmi rychlý úbytek (~110→78 za ~16 týdnů), pak dojezd k 70 kg
- **K čemu:** proti šedé ideální křivce má vypadat **moc radikální tempo** (tooFast)

## demo-volatile-110-to-125.csv

- **Start:** 110 kg → **konec:** ~125 kg za 1 rok
- **Příběh:**
  1. první ~3 měsíce ubytek (~110→98)
  2. další ~3 měsíce přibrání (~98→112)
  3. ostrý úbytek ~20 kg za ~3 měsíce (~112→92)
  4. závěr roku rebound nahoru ke ~125 kg
- **K čemu:** kolísání a finální nárůst vs. klesající ideál — hubnutí **nefunguje / tooSlow**, občas i krátký tooFast úsek

## Regenerace

\`\`\`bash
node scripts/generate-demo-csvs.mjs
\`\`\`
`;

fs.writeFileSync(path.join(OUT, "README.md"), readme, "utf8");
console.log("Wrote public/samples/README.md");
