"use client";

import { useActionState, useId } from "react";
import { importCsvAction, type ActionState } from "@/app/actions";

const initial: ActionState = { ok: true };

export function ImportCsvForm({
  profileId,
  compact = false,
}: {
  profileId: string;
  compact?: boolean;
}) {
  const bound = importCsvAction.bind(null, profileId);
  const [state, formAction, pending] = useActionState(bound, initial);
  const inputId = useId();

  return (
    <form
      action={formAction}
      className={
        compact
          ? "flex flex-col items-stretch gap-1.5 sm:items-end"
          : "flex flex-col gap-3 sm:flex-row sm:items-end"
      }
    >
      <div
        className={
          compact
            ? "flex flex-wrap items-center justify-end gap-2"
            : "min-w-0 flex-1 space-y-1"
        }
      >
        {!compact ? (
          <label htmlFor={inputId} className="text-sm font-medium">
            Další CSV
          </label>
        ) : (
          <label
            htmlFor={inputId}
            className="sr-only"
          >
            Import CSV
          </label>
        )}
        <input
          id={inputId}
          name="csv"
          type="file"
          accept=".csv,text/csv"
          required
          className={
            compact
              ? "max-w-[14rem] text-xs file:mr-2 file:rounded-md file:border-0 file:bg-[var(--teal-soft)] file:px-2.5 file:py-1.5 file:text-xs file:font-medium file:text-[var(--teal-deep)]"
              : "block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-[var(--teal-soft)] file:px-3 file:py-2 file:text-sm file:font-medium file:text-[var(--teal-deep)]"
          }
        />
        <button
          type="submit"
          disabled={pending}
          className={
            compact
              ? "shrink-0 rounded-md bg-[var(--teal)] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[var(--teal-deep)] disabled:opacity-60"
              : "shrink-0 rounded-lg border border-[var(--line)] bg-white/70 px-4 py-2.5 text-sm font-medium transition hover:border-[var(--teal)] hover:text-[var(--teal)] disabled:opacity-60"
          }
        >
          {pending ? "Import…" : compact ? "Import CSV" : "Importovat"}
        </button>
      </div>
      {state?.message ? (
        <p
          className={`text-xs ${compact ? "text-right" : "text-sm sm:basis-full"} ${
            state.ok ? "text-[var(--teal-deep)]" : "text-red-700"
          }`}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
