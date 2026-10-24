import Link from "next/link";
import type { ParamMeta } from "@/lib/params";
import { TimeSeriesChart, type SeriesPoint } from "./charts/TimeSeriesChart";

export function ParamSection({
  profileId,
  title,
  description,
  meta,
  data,
  multi,
  large,
}: {
  profileId: string;
  title: string;
  description?: string;
  meta: ParamMeta[];
  data: SeriesPoint[];
  multi?: boolean;
  large?: boolean;
}) {
  const numeric = meta.filter((m) => m.kind === "number");

  return (
    <section className="animate-rise space-y-3">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--ink)] sm:text-3xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm text-[var(--muted)] sm:text-base">
            {description}
          </p>
        ) : null}
      </div>

      {multi && numeric.length > 1 ? (
        <div className="rounded-2xl border border-[var(--line)] bg-white/55 p-4 shadow-[0_1px_0_rgba(15,61,46,0.04)] backdrop-blur-sm sm:p-5">
          <TimeSeriesChart
            data={data}
            height={large ? 320 : 260}
            series={numeric.map((m) => ({
              dataKey: m.key,
              name: m.title,
              color: m.color,
              unit: m.unit,
            }))}
          />
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {meta.map((m) => (
              <HelpBlock key={m.key} profileId={profileId} meta={m} />
            ))}
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {meta.map((m) => (
            <div
              key={m.key}
              className="rounded-2xl border border-[var(--line)] bg-white/55 p-4 shadow-[0_1px_0_rgba(15,61,46,0.04)] backdrop-blur-sm sm:p-5"
            >
              {m.kind === "number" ? (
                <TimeSeriesChart
                  data={data}
                  height={large ? 300 : 220}
                  series={[
                    {
                      dataKey: m.key,
                      name: m.title,
                      color: m.color,
                      unit: m.unit,
                    },
                  ]}
                />
              ) : (
                <TextTimeline data={data} dataKey={m.key} />
              )}
              <div className="mt-3">
                <HelpBlock profileId={profileId} meta={m} />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function HelpBlock({
  profileId,
  meta,
}: {
  profileId: string;
  meta: ParamMeta;
}) {
  return (
    <div>
      <p className="text-sm leading-relaxed text-[var(--ink-soft)]">
        <span className="font-medium text-[var(--ink)]">{meta.title}</span>
        {meta.unit ? (
          <span className="text-[var(--muted)]"> ({meta.unit})</span>
        ) : null}
        {" — "}
        {meta.shortHelp}
      </p>
      <Link
        href={`/profiles/${profileId}/params/${meta.key}`}
        className="mt-1 inline-block text-sm font-medium text-[var(--teal)] underline-offset-2 hover:underline"
      >
        Detail a delší vysvětlení →
      </Link>
    </div>
  );
}

function TextTimeline({
  data,
  dataKey,
}: {
  data: SeriesPoint[];
  dataKey: string;
}) {
  const items = data
    .map((d) => ({ t: d.t, v: d[dataKey] }))
    .filter((x) => x.v != null && x.v !== "");
  if (!items.length) {
    return (
      <p className="py-8 text-center text-sm text-[var(--muted)]">
        Žádné hodnoty somatotypu.
      </p>
    );
  }
  return (
    <ul className="divide-y divide-[var(--line)]">
      {items.map((item) => (
        <li
          key={String(item.t)}
          className="flex items-center justify-between gap-3 py-2.5 text-sm"
        >
          <span className="text-[var(--muted)]">
            {new Intl.DateTimeFormat("cs-CZ", {
              dateStyle: "medium",
              timeStyle: "short",
              timeZone: "Europe/Prague",
            }).format(new Date(item.t))}
          </span>
          <span className="font-medium text-[var(--ink)]">{String(item.v)}</span>
        </li>
      ))}
    </ul>
  );
}
