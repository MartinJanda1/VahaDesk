import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { ProfileForm } from "@/components/ProfileForm";

export default function NewProfilePage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-xl px-5 pb-20 pt-6 sm:px-8">
        <Link
          href="/"
          className="text-sm text-[var(--muted)] hover:text-[var(--teal)]"
        >
          ← Zpět na profily
        </Link>
        <h1 className="animate-rise mt-4 font-[family-name:var(--font-display)] text-4xl text-[var(--ink)]">
          Nový profil
        </h1>
        <p className="animate-rise mt-2 mb-8 text-[var(--muted)] [animation-delay:80ms]">
          Jméno, věk, výška a volitelně CSV export z TrueLife FitScale W8 BT.
        </p>
        <div className="animate-rise [animation-delay:140ms]">
          <ProfileForm />
        </div>
      </main>
    </>
  );
}
