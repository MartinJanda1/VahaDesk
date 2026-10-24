"use client";

import { useActionState } from "react";
import { importCsvAction, type ActionState } from "@/app/actions";

const initial: ActionState = { ok: true };

export function ImportCsvForm({ profileId }: { profileId: string }) {
  const bound = importCsvAction.bind(null, profileId);
  const [state, formAction, pending] = useActionState(bound, initial);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 sm:flex-row sm:items-end"
    >
      <div className="min-w-0 flex-1 space-y-1">
        <label htmlFor="csv-import" className="text-sm font-medium">
          Další CSV
        </label>
        <input
          id="csv-import"
          name="csv"
          type="file"
          accept=".csv,text/csv"
          required
          className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-[var(--teal-soft)] file:px-3 file:py-2 file:text-sm file:font-medium file:text-[var(--teal-deep)]"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="shrink-0 rounded-lg border border-[var(--line)] bg-white/70 px-4 py-2.5 text-sm font-medium transition hover:border-[var(--teal)] hover:text-[var(--teal)] disabled:opacity-60"
      >
        {pending ? "Import…" : "Importovat"}
      </button>
      {state?.message ? (
        <p
          className={`text-sm sm:basis-full ${state.ok ? "text-[var(--teal-deep)]" : "text-red-700"}`}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
