"use client";

import { useActionState } from "react";
import {
  createProfileAction,
  type ActionState,
} from "@/app/actions";

const initial: ActionState = { ok: true };

export function ProfileForm() {
  const [state, formAction, pending] = useActionState(
    createProfileAction,
    initial,
  );

  return (
    <form action={formAction} className="mx-auto w-full max-w-lg space-y-5">
      <div className="space-y-1.5">
        <label htmlFor="name" className="text-sm font-medium text-[var(--ink)]">
          Jméno profilu
        </label>
        <input
          id="name"
          name="name"
          required
          placeholder="např. Martin"
          className="w-full rounded-lg border border-[var(--line)] bg-white/80 px-3.5 py-2.5 text-[var(--ink)] outline-none ring-sky-500/30 transition focus:ring-2"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="age" className="text-sm font-medium text-[var(--ink)]">
            Věk
          </label>
          <input
            id="age"
            name="age"
            type="number"
            min={1}
            max={120}
            required
            placeholder="35"
            className="w-full rounded-lg border border-[var(--line)] bg-white/80 px-3.5 py-2.5 outline-none ring-sky-500/30 focus:ring-2"
          />
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor="heightCm"
            className="text-sm font-medium text-[var(--ink)]"
          >
            Výška (cm)
          </label>
          <input
            id="heightCm"
            name="heightCm"
            type="number"
            min={50}
            max={250}
            required
            placeholder="175"
            className="w-full rounded-lg border border-[var(--line)] bg-white/80 px-3.5 py-2.5 outline-none ring-sky-500/30 focus:ring-2"
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <label htmlFor="csv" className="text-sm font-medium text-[var(--ink)]">
          Import CSV z TrueLife FitScale W8
        </label>
        <input
          id="csv"
          name="csv"
          type="file"
          accept=".csv,text/csv"
          className="block w-full text-sm text-[var(--muted)] file:mr-3 file:rounded-md file:border-0 file:bg-sky-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-sky-700"
        />
        <p className="text-xs text-[var(--muted)]">
          Volitelné — CSV můžete nahrát i později. Ukázka:{" "}
          <a
            href="/samples/truelife-fitscale-sample.csv"
            className="underline decoration-sky-500/40 underline-offset-2 hover:text-sky-500"
          >
            sample CSV
          </a>
          .
        </p>
      </div>
      {state?.message && !state.ok ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">
          {state.message}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-sky-500 px-4 py-3 font-medium text-white transition hover:bg-sky-600 disabled:opacity-60"
      >
        {pending ? "Ukládám…" : "Vytvořit profil"}
      </button>
    </form>
  );
}
