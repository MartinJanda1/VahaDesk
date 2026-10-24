import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { getProfile, listMeasurements } from "@/db/store";
import { formatDateTime, formatValue } from "@/lib/format";
import { isParamKey, PARAM_BY_KEY } from "@/lib/params";

async function ParamDetail({
  profileId,
  param,
}: {
  profileId: string;
  param: string;
}) {
  if (!isParamKey(param)) notFound();
  const meta = PARAM_BY_KEY[param];
  const profile = await getProfile(profileId);
  if (!profile) notFound();
  const rows = await listMeasurements(profileId);

  return (
    <main className="mx-auto max-w-2xl px-5 pb-20 pt-4 sm:px-8">
      <Link
        href={`/profiles/${profileId}`}
        className="text-sm text-[var(--muted)] hover:text-[var(--teal)]"
      >
        ← Zpět na dashboard ({profile.name})
      </Link>
      <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl text-[var(--ink)]">
        {meta.title}
        {meta.unit ? (
          <span className="text-2xl text-[var(--muted)]"> ({meta.unit})</span>
        ) : null}
      </h1>
      <p className="mt-4 text-[var(--ink-soft)] leading-relaxed">
        {meta.longHelp}
      </p>
      <p className="mt-6 rounded-xl border border-dashed border-[var(--line)] bg-white/40 px-4 py-3 text-sm text-[var(--muted)]">
        Detailní časová osa s pokročilou logikou přijde v další iteraci. Zatím
        přehled naměřených hodnot:
      </p>
      <ul className="mt-6 divide-y divide-[var(--line)] rounded-2xl border border-[var(--line)] bg-white/55">
        {rows.length === 0 ? (
          <li className="px-4 py-6 text-sm text-[var(--muted)]">
            Žádná měření.
          </li>
        ) : (
          rows.map((r) => {
            const raw = r[param as keyof typeof r];
            const value =
              typeof raw === "number" || typeof raw === "string" ? raw : null;
            return (
              <li
                key={r.id}
                className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
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
    </main>
  );
}

export default async function ParamPage({
  params,
}: {
  params: Promise<{ id: string; param: string }>;
}) {
  const { id, param } = await params;
  return (
    <>
      <SiteHeader />
      <Suspense
        fallback={
          <div className="px-5 py-16 text-[var(--muted)] sm:px-8">
            Načítám…
          </div>
        }
      >
        <ParamDetail profileId={id} param={param} />
      </Suspense>
    </>
  );
}
