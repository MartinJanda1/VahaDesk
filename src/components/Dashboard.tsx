import type { Measurement, Profile } from "@/db/schema";
import { PARAM_META, type ParamKey } from "@/lib/params";
import { formatDateTime } from "@/lib/format";
import type { SeriesPoint } from "./charts/TimeSeriesChart";
import { ImportCsvForm } from "./ImportCsvForm";
import { ChartPanel, ParamGrid } from "./ParamSection";

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
  const other = PARAM_META.filter(
    (p) => p.section === "other" && p.kind === "number",
  );
  const latest = measurements[measurements.length - 1];
  const latestSomatotype = latest?.somatotype?.trim() || null;

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 pb-20 pt-2 sm:px-6 lg:px-8">
      <div className="animate-rise flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
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
            {latestSomatotype ? (
              <>
                {" · "}
                <span className="font-medium text-[var(--ink-soft)]">
                  somatotyp: {latestSomatotype}
                </span>
              </>
            ) : null}
          </p>
          <p className="mt-2 max-w-xl text-sm text-[var(--muted)]">
            Období: všechna měření. Jedno číslo ≠ verdikt — sledujte trendy.
          </p>
        </div>
        <div className="shrink-0 lg:pt-6">
          <ImportCsvForm profileId={profile.id} compact />
        </div>
      </div>

      <div className="animate-rise grid gap-4 lg:grid-cols-2 lg:items-stretch">
        <ChartPanel
          profileId={profile.id}
          title="Hmotnost"
          description="Nejpřímější signál. Denní výkyvy jsou normální."
          meta={weight}
          data={data}
          height={300}
        />
        <ChartPanel
          profileId={profile.id}
          title="Složení těla"
          description="Tuk, svaly a voda — vysvětlují většinu denního šumu."
          meta={composition}
          data={data}
          multi
          height={300}
          compactHelp
        />
      </div>

      <ParamGrid
        profileId={profile.id}
        title="Ostatní parametry"
        description="Doplňkové ukazatele z FitScale — 3×3 přehled trendů."
        meta={other}
        data={data}
      />
    </div>
  );
}
