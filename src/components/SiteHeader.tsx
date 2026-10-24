import Link from "next/link";

export function SiteHeader({ subtle = false }: { subtle?: boolean }) {
  return (
    <header
      className={`relative z-10 flex items-center justify-between gap-4 px-5 py-5 sm:px-8 ${
        subtle ? "" : ""
      }`}
    >
      <Link href="/" className="group flex items-baseline gap-2">
        <span className="font-[family-name:var(--font-display)] text-2xl tracking-tight text-[var(--ink)] transition-colors group-hover:text-sky-500 sm:text-3xl">
          VahaDesk
        </span>
        <span className="hidden text-xs uppercase tracking-[0.18em] text-[var(--muted)] sm:inline">
          FitScale
        </span>
      </Link>
      <nav className="flex items-center gap-3 text-sm">
        <Link
          href="/profiles/new"
          className="rounded-md bg-sky-500 px-3.5 py-2 font-medium text-white shadow-sm transition hover:bg-sky-600"
        >
          Přidat profil
        </Link>
      </nav>
    </header>
  );
}
