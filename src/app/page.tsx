import Link from "next/link";
import { Suspense } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { listProfiles } from "@/db/store";
import { formatDateTime } from "@/lib/format";

async function ProfileList() {
  const profiles = await listProfiles();

  if (!profiles.length) {
    return (
      <section className="mx-auto flex min-h-[70vh] max-w-3xl flex-col justify-center px-5 pb-16 pt-6 sm:px-8">
        <p className="animate-rise text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
          TrueLife FitScale W8
        </p>
        <h1 className="animate-brand mt-3 font-[family-name:var(--font-display)] text-5xl leading-[1.05] text-[var(--ink)] sm:text-7xl">
          VahaDesk
        </h1>
        <p className="animate-rise mt-5 max-w-md text-lg text-[var(--ink-soft)] [animation-delay:120ms]">
          CSV z váhy nestačí samo o sobě. VahaDesk ukáže trendy a vysvětlí, co
          čísla znamenají — bez Bluetooth sync.
        </p>
        <div className="animate-rise mt-8 [animation-delay:220ms]">
          <Link
            href="/profiles/new"
            className="inline-flex rounded-lg bg-sky-500 px-5 py-3 font-medium text-white shadow-sm transition hover:bg-sky-600"
          >
            Přidat první profil
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl px-5 pb-20 pt-4 sm:px-8">
      <div className="animate-rise mb-10">
        <h1 className="font-[family-name:var(--font-display)] text-4xl text-[var(--ink)] sm:text-5xl">
          VahaDesk
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          Vyberte profil nebo přidejte nový. Data zůstávají ve vaší databázi.
        </p>
      </div>
      <ul className="space-y-3">
        {profiles.map((p, i) => (
          <li
            key={p.id}
            className="animate-rise"
            style={{ animationDelay: `${80 + i * 60}ms` }}
          >
            <Link
              href={`/profiles/${p.id}`}
              className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--line)] bg-white/55 px-5 py-4 transition hover:border-sky-500/40 hover:bg-white/80"
            >
              <div>
                <p className="font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
                  {p.name}
                </p>
                <p className="text-sm text-[var(--muted)]">
                  {p.age} let · {p.heightCm} cm · založeno{" "}
                  {formatDateTime(new Date(p.createdAt))}
                </p>
              </div>
              <span className="text-sky-500">→</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ListFallback() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-20 text-[var(--muted)] sm:px-8">
      Načítám profily…
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <Suspense fallback={<ListFallback />}>
        <ProfileList />
      </Suspense>
    </>
  );
}
