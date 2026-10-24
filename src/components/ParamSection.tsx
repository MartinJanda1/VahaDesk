import Link from "next/link";
import type { ParamMeta } from "@/lib/params";
import { TimeSeriesChart, type SeriesPoint } from "./charts/TimeSeriesChart";

export function ChartPanel({
  profileId,
  title,
  description,
  meta,
  data,
  multi,
  height = 280,
  compactHelp,
}: {
  profileId: string;
  title: string;
  description?: string;
  meta: ParamMeta[];
  data: SeriesPoint[];
  multi?: boolean;
  height?: number;
  compactHelp?: boolean;
}) {
  const numeric = meta.filter((m) => m.kind === "number");

  return (
    <div className="flex h-full flex-col rounded-2xl border border-[var(--line)] bg-white/55 p-4 shadow-[0_1px_0_rgba(68,48,28,0.05)] backdrop-blur-sm sm:p-5">
      <div className="mb-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--ink)] sm:text-2xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-sm text-[var(--muted)]">{description}</p>
        ) : null}
      </div>
      <TimeSeriesChart
        data={data}
        height={height}
        series={
          multi
            ? numeric.map((m) => ({
                dataKey: m.key,
                name: m.title,
                color: m.color,
                unit: m.unit,
              }))
            : numeric.slice(0, 1).map((m) => ({
                dataKey: m.key,
                name: m.title,
                color: m.color,
                unit: m.unit,
              }))
        }
      />
      <div
        className={`mt-3 grid gap-2 ${
          compactHelp && meta.length > 1 ? "sm:grid-cols-1 lg:grid-cols-3" : ""
        }`}
      >
        {meta
          .filter((m) => m.kind === "number")
          .map((m) => (
            <HelpBlock
              key={m.key}
              profileId={profileId}
              meta={m}
              compact={compactHelp}
            />
          ))}
      </div>
    </div>
  );
}

export function ParamGrid({
  profileId,
  title,
  description,
  meta,
  data,
}: {
  profileId: string;
  title: string;
  description?: string;
  meta: ParamMeta[];
  data: SeriesPoint[];
}) {
  const numeric = meta.filter((m) => m.kind === "number");

  return (
    <section className="animate-rise space-y-4">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--ink)] sm:text-3xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 max-w-3xl text-sm text-[var(--muted)] sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {numeric.map((m) => (
          <div
            key={m.key}
            className="rounded-2xl border border-[var(--line)] bg-white/55 p-4 shadow-[0_1px_0_rgba(68,48,28,0.05)] backdrop-blur-sm"
          >
            <h3 className="mb-2 text-sm font-medium text-[var(--ink)]">
              {m.title}
              {m.unit ? (
                <span className="font-normal text-[var(--muted)]">
                  {" "}
                  ({m.unit})
                </span>
              ) : null}
            </h3>
            <TimeSeriesChart
              data={data}
              height={180}
              series={[
                {
                  dataKey: m.key,
                  name: m.title,
                  color: m.color,
                  unit: m.unit,
                },
              ]}
            />
            <div className="mt-2">
              <HelpBlock profileId={profileId} meta={m} compact />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function HelpBlock({
  profileId,
  meta,
  compact,
}: {
  profileId: string;
  meta: ParamMeta;
  compact?: boolean;
}) {
  return (
    <div>
      <p
        className={`leading-relaxed text-[var(--ink-soft)] ${
          compact ? "text-xs line-clamp-2" : "text-sm"
        }`}
      >
        {!compact ? (
          <>
            <span className="font-medium text-[var(--ink)]">{meta.title}</span>
            {meta.unit ? (
              <span className="text-[var(--muted)]"> ({meta.unit})</span>
            ) : null}
            {" — "}
          </>
        ) : null}
        {meta.shortHelp}
      </p>
      <Link
        href={`/profiles/${profileId}/params/${meta.key}`}
        className={`mt-1 inline-block font-medium text-[var(--teal)] underline-offset-2 hover:underline ${
          compact ? "text-xs" : "text-sm"
        }`}
      >
        Detail →
      </Link>
    </div>
  );
}
