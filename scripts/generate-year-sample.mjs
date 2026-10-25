import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const HEIGHT_M = 1.75;
const HEIGHT_CM = 175;
const AGE = 54;
const START_KG = 105;
const END_KG = 80;
const START = new Date(Date.UTC(2025, 9, 25, 8, 15, 0)); // 25. 10. 2025
const WEEKS = 52;

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

/**
 * Progress 0..1 with intentional phases for later health alerts:
 * - weeks 0–10: healthy loss
 * - weeks 11–18: plateau (almost flat) — hubnutí nefunguje
 * - weeks 19–24: too-fast catch-up — moc radikální
 * - weeks 25–52: steady healthy finish to 80 kg
 */
function progressAt(t) {
  if (t < 10 / 52) return (t / (10 / 52)) * 0.18;
  if (t < 18 / 52) return 0.18 + ((t - 10 / 52) / (8 / 52)) * 0.02;
  if (t < 24 / 52) return 0.2 + ((t - 18 / 52) / (6 / 52)) * 0.22;
  return 0.42 + ((t - 24 / 52) / (28 / 52)) * 0.58;
}

function somatotype(bmi) {
  if (bmi >= 30) return "Obezita";
  if (bmi >= 25) return "Nadváha";
  if (bmi >= 18.5) return "Normální";
  return "Podváha";
}

let seed = 42;
function rand() {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
}

const rows = [];
for (let week = 0; week <= WEEKS; week++) {
  const t = week / WEEKS;
  const base = START_KG + (END_KG - START_KG) * progressAt(t);
  const noise = (rand() - 0.5) * 0.9;
  const weight = round(clamp(base + noise, 78, 107), 2);

  const bmi = round(weight / (HEIGHT_M * HEIGHT_M), 1);
  const fatBase = 39 - 17 * progressAt(t);
  const bodyFat = round(clamp(fatBase + (rand() - 0.5) * 1.2, 18, 42), 1);
  const muscle = round(
    clamp(52 + 14 * progressAt(t) + (rand() - 0.5) * 1.0, 50, 70),
    1,
  );
  const water = round(
    clamp(43 + 10 * progressAt(t) + (rand() - 0.5) * 1.2, 40, 56),
    1,
  );
  const protein = round(
    clamp(11.2 + 2.6 * progressAt(t) + (rand() - 0.5) * 0.35, 10.5, 14.5),
    1,
  );
  const bone = round(
    clamp(3.3 + 0.3 * progressAt(t) + (rand() - 0.5) * 0.12, 3.1, 3.9),
    1,
  );

  const bmr = Math.round(
    10 * weight + 6.25 * HEIGHT_CM - 5 * AGE + 5 + (rand() - 0.5) * 20,
  );
  const amr = Math.round(bmr * 1.54);
  const fatMass = (weight * bodyFat) / 100;
  const activeMass = round(weight - fatMass, 1);
  const subcutaneous = round(fatMass * 0.82 + (rand() - 0.5) * 0.5, 1);
  const skeletal = round(
    weight * (muscle / 100) * 0.62 + (rand() - 0.5) * 0.4,
    1,
  );
  const visceral = round(
    clamp(18 - 11 * progressAt(t) + (rand() - 0.5) * 1.0, 5, 20),
    1,
  );

  const d = new Date(START.getTime() + week * 7 * 86400000);
  d.setUTCHours(7 + Math.floor(rand() * 2), Math.floor(rand() * 60), 0);

  rows.push(
    [
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
    ].join(","),
  );
}

const header =
  "Datum,Hmotnost,Tělesný tuk(%),Svaly(%),Bílkoviny(%),Kosti(%),BMI,BMR,Voda v těle(%),Aktivní tělesná hmota,AMR,Podkožní tuk,Kosterní svalstvo(%),Index viscerálního tuku,Somatotyp";

const dest = path.join(
  __dirname,
  "..",
  "public",
  "samples",
  "truelife-fitscale-year-sample.csv",
);
fs.writeFileSync(dest, `${header}\n${rows.join("\n")}\n`, "utf8");

const firstW = rows[0].split(",")[1];
const lastW = rows[rows.length - 1].split(",")[1];
console.log(`Wrote ${rows.length} weekly rows → ${dest}`);
console.log(`Weight: ${firstW} → ${lastW}`);
