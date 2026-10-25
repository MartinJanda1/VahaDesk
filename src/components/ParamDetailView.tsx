"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import type { Measurement, Profile } from "@/db/schema";
import {
  periodCaption,
  prepareMeasurementsForPeriod,
  type ChartPeriod,
} from "@/lib/chart-period";
import {
  buildIdealSeries,
  compareToIdeal,
  IDEAL_SERIES_COLOR,
  idealChartKey,
  mergeIdealIntoSeries,
  type IdealPoint,
} from "@/lib/ideal-curve";
import { formatDateTime, formatNumber, formatValue } from "@/lib/format";
import type { ParamMeta } from "@/lib/params";
import { ChartPeriodToggle } from "./ChartPeriodToggle";
import { IdealSummary } from "./IdealSummary";
import { TimeSeriesChart, type SeriesDef } from "./charts/TimeSeriesChart";

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
        {title}
      </h2>
      <div className="text-sm leading-relaxed text-[var(--ink-soft)]">
        {children}
      </div>
    </section>
  );
}

function ParamIdealBlock({
  meta,
  comparison,
  preparedRows,
  idealPoints,
  applicable,
}: {
  meta: ParamMeta;
  comparison: ReturnType<typeof compareToIdeal>;
  preparedRows: Measurement[];
  idealPoints: IdealPoint[];
  applicable: boolean;
}) {
  if (!meta.hasIdealOverlay) {
    return (
      <p>
        Pro tento parametr aplikace nesleduje numerickou ideální křivku. Berte
        číslo jako orientaci a sledujte spíš dlouhodobý trend spolu s hmotností
        a složením těla.
      </p>
    );
  }

  if (meta.key === "weightKg") {
    return <IdealSummary comparison={comparison} variant="weight" />;
  }

  if (!applicable || !idealPoints.length) {
    return (
      <p>
        {comparison.reason ??
          "Ideální křivka není pro zvolené období k dispozici."}
      </p>
    );
  }

  const last = [...preparedRows].reverse().find((r) => {
    const v = r[meta.key as keyof Measurement];
    return typeof v === "number" && Number.isFinite(v);
  });
  if (!last) {
    return <p>V zvoleném období chybí naměřená hodnota.</p>;
  }

  const t =
    last.measuredAt instanceof Date
      ? last.measuredAt.getTime()
      : new Date(last.measuredAt).getTime();
  const ideal = idealPoints.find((p) => p.t === t);
  const idealVal = ideal?.byParam[meta.key] ?? null;
  const actual = last[meta.key as keyof Measurement];
  if (typeof actual !== "number" || idealVal == null) {
    return (
      <p>
        Ideální trajektorie sleduje stejný 52týdenní horizont jako u hmotnosti.
        Pro toto měření nejde odchylku spočítat.
      </p>
    );
  }

  const delta = actual - idealVal;
  const abs = Math.abs(delta).toLocaleString("cs-CZ", {
    maximumFractionDigits: 1,
  });
  const unit = meta.unit ? ` ${meta.unit}` : "";
  const deltaText =
    delta > 0.05
      ? `+${abs}${unit} nad ideálem`
      : delta < -0.05
        ? `−${abs}${unit} pod ideálem`
        : `na ideálu`;

  return (
    <div className="space-y-1.5">
      <p>
        K poslednímu bodu v období: {formatNumber(actual)}
        {unit} vs. ideál {formatNumber(idealVal)}
        {unit} ({deltaText}).
      </p>
      <p className="text-[var(--muted)]">
        Šedá přerušovaná čára je orientační trajektorie směrem ke zdravějšímu
        pásmu, ne lékařský cílový rozsah.
      </p>
    </div>
  );
}

export function ParamDetailView({
  profile,
  measurements,
  meta,
}: {
  profile: Profile;
  measurements: Measurement[];
  meta: ParamMeta;
}) {
  const [period, setPeriod] = useState<ChartPeriod>("all");

  const prepared = useMemo(
    () => prepareMeasurementsForPeriod(measurements, period),
    [measurements, period],
  );

  const { chartData, series, comparison, idealPoints, idealApplicable } =
    useMemo(() => {
      const idealBuilt = buildIdealSeries({
        heightCm: profile.heightCm,
        age: profile.age,
        measurements: prepared.rows,
        anchorMeasurements: measurements,
      });
      const points = prepared.rows.map((m) => {
        const raw = m[meta.key as keyof Measurement];
        const value =
          typeof raw === "number" || typeof raw === "string" ? raw : null;
        return {
          t:
            m.measuredAt instanceof Date
              ? m.measuredAt.getTime()
              : new Date(m.measuredAt).getTime(),
          label: formatDateTime(new Date(m.measuredAt)),
          [meta.key]: value,
        };
      });

      const merged = idealBuilt.applicable
        ? mergeIdealIntoSeries(points, idealBuilt.points)
        : points;

      const baseSeries: SeriesDef[] =
        meta.kind === "number"
          ? [
              {
                dataKey: meta.key,
                name: meta.title,
                color: meta.color,
                unit: meta.unit,
              },
            ]
          : [];

      const extra: SeriesDef[] = [];
      if (meta.hasIdealOverlay && idealBuilt.applicable) {
        extra.push({
          dataKey: idealChartKey(meta.key),
          name: `Ideál · ${meta.title}`,
          color: IDEAL_SERIES_COLOR,
          unit: meta.unit,
          dashed: true,
        });
      }

      return {
        chartData: merged,
        series: [...baseSeries, ...extra],
        comparison: compareToIdeal({
          heightCm: profile.heightCm,
          age: profile.age,
          measurements: prepared.rows,
          points: idealBuilt.points,
          applicable: idealBuilt.applicable,
          reason: idealBuilt.reason,
          anchorMeasurements: measurements,
        }),
        idealPoints: idealBuilt.points,
        idealApplicable: idealBuilt.applicable,
      };
    }, [prepared.rows, measurements, profile.heightCm, profile.age, meta]);

  const historyRows = useMemo(() => {
    return [...measurements].sort(
      (a, b) =>
        new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime(),
    );
  }, [measurements]);

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-5 pb-20 pt-4 sm:px-8">
      <div>
        <Link
          href={`/profiles/${profile.id}`}
          className="text-sm text-[var(--muted)] hover:text-sky-500"
        >
          ← Zpět na dashboard ({profile.name})
        </Link>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl text-[var(--ink)]">
          {meta.title}
          {meta.unit ? (
            <span className="text-2xl text-[var(--muted)]"> ({meta.unit})</span>
          ) : null}
        </h1>
      </div>

      {meta.kind === "number" ? (
        <div className="space-y-3 rounded-2xl border border-[var(--line)] bg-white/55 p-4 sm:p-5">
          <ChartPeriodToggle
            value={period}
            onChange={setPeriod}
            caption={periodCaption(period, prepared.aggregation)}
          />
          <TimeSeriesChart data={chartData} series={series} height={280} />
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-[var(--line)] bg-white/40 px-4 py-3 text-sm text-[var(--muted)]">
          Somatotyp je textový štítek — graf časové řady tu nedává smysl. Níže
          je historie hodnot.
        </p>
      )}

      <Section title="Co číslo znamená">
        <p>{meta.longHelp}</p>
      </Section>

      <Section title="Vs. ideál">
        <ParamIdealBlock
          meta={meta}
          comparison={comparison}
          preparedRows={prepared.rows}
          idealPoints={idealPoints}
          applicable={idealApplicable}
        />
      </Section>

      <Section title="Jak číst výkyvy">
        <p>{meta.noiseHelp}</p>
      </Section>

      <Section title="Co můžete zkusit">
        <ul className="list-disc space-y-2 pl-5">
          {meta.tips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </Section>

      <Section title="Historie">
        <ul className="mt-1 divide-y divide-[var(--line)] overflow-hidden rounded-2xl border border-[var(--line)] bg-white/55">
          {historyRows.length === 0 ? (
            <li className="px-4 py-6 text-[var(--muted)]">Žádná měření.</li>
          ) : (
            historyRows.map((r) => {
              const raw = r[meta.key as keyof Measurement];
              const value =
                typeof raw === "number" || typeof raw === "string" ? raw : null;
              return (
                <li
                  key={r.id}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <span className="text-[var(--muted)]">
                    {formatDateTime(new Date(r.measuredAt))}
                  </span>
                  <span className="font-medium text-[var(--ink)]">
                    {formatValue(value, meta.unit)}
                  </span>
                </li>
              );
            })
          )}
        </ul>
      </Section>

      <p className="text-xs leading-relaxed text-[var(--muted)]">
        Tipky jsou orientační a slouží ke čtení trendů z domácí BIA váhy. Nejde
        o diagnózu, léčebný plán ani jídelníček na předpis. Při zdravotních
        obtížích se obraťte na odborníka.
      </p>
    </main>
  );
}
