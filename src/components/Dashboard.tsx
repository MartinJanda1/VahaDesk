import type { Measurement, Profile } from "@/db/schema";
import { PARAM_META, type ParamKey } from "@/lib/params";
import { formatDateTime } from "@/lib/format";
import type { SeriesPoint } from "./charts/TimeSeriesChart";
import { ImportCsvForm } from "./ImportCsvForm";
import { ParamSection } from "./ParamSection";

function toSeries(rows: Measurement[]): SeriesPoint[] {
  return rows.map((m) => {
    const point: SeriesPoint = {
      t: new Date(m.measuredAt).getTime(),
      label: formatDateTime(new Date(m.measuredAt)),
    };
    for (const meta of PARAM_META) {
      const key = meta.key as ParamKey;
      const val = m[key as keyof Measurement];
      if (typeof val === "number" || typeof val === "string") {
        point[key] = val;
      } else {
        point[key] = null;
      }
    }
    return point;
  });
}

export function Dashboard({
  profile,
  measurements,
}: {
  profile: Profile;
  measurements: Measurement[];
}) {
  const data = toSeries(measurements);
  const weight = PARAM_META.filter((p) => p.section === "weight");
  const composition = PARAM_META.filter((p) => p.section === "composition");
  const other = PARAM_META.filter((p) => p.section === "other");
  const latest = measurements[measurements.length - 1];

  return (
    <div className="mx-auto max-w-5xl space-y-12 px-5 pb-20 pt-2 sm:px-8">
      <div className="animate-rise flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
            Profil
          </p>
          <h1 className="mt-1 font-[family-name:var(--font-display)] text-4xl text-[var(--ink)] sm:text-5xl">
            {profile.name}
          </h1>
          <p className="mt-2 text-[var(--muted)]">
            {profile.age} let · {profile.heightCm} cm
            {latest ? (
              <>
                {" · "}
                poslední měření {formatDateTime(new Date(latest.measuredAt))}
              </>
            ) : null}
            {measurements.length ? (
              <> · {measurements.length} záznamů</>
            ) : null}
          </p>
        </div>
        <p className="max-w-sm text-sm text-[var(--muted)]">
          Období: všechna měření. Jedno číslo ≠ verdikt — sledujte trendy.
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--line)] bg-white/50 p-4 sm:p-5">
        <ImportCsvForm profileId={profile.id} />
      </div>

      <ParamSection
        profileId={profile.id}
        title="Hmotnost"
        description="Největší a nejpřímější signál. Denní výkyvy jsou normální."
        meta={weight}
        data={data}
        large
      />

      <ParamSection
        profileId={profile.id}
        title="Složení těla"
        description="Tuk, svaly a voda — spolu vysvětlují většinu denního „šumu“."
        meta={composition}
        data={data}
        multi
        large
      />

      <ParamSection
        profileId={profile.id}
        title="Ostatní parametry"
        description="Doplňkové ukazatele z FitScale — kratší grafy, stejná logika trendu."
        meta={other}
        data={data}
      />
    </div>
  );
}
