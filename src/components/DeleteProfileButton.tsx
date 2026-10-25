"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { deleteProfileAction } from "@/app/actions";
import { Tooltip } from "./Tooltip";

export function DeleteProfileButton({
  profileId,
  profileName,
}: {
  profileId: string;
  profileName: string;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open]);

  function dismiss() {
    if (pending) return;
    setOpen(false);
    setError(null);
  }

  function confirmDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteProfileAction(profileId);
      if (!result.ok) {
        setError(result.message ?? "Profil se nepodařilo smazat.");
        return;
      }
      setOpen(false);
    });
  }

  return (
    <>
      <Tooltip content="Smazat profil a všechna jeho měření" side="top">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen(true);
          }}
          aria-label={`Smazat profil ${profileName}`}
          className="rounded-lg p-2 text-[var(--muted)] transition hover:bg-red-50 hover:text-red-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            aria-hidden
          >
            <path d="M3 6h18" />
            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
          </svg>
        </button>
      </Tooltip>

      <dialog
        ref={dialogRef}
        className="import-dialog fixed inset-0 z-50 m-0 hidden h-full max-h-none w-full max-w-none bg-transparent p-4 open:flex open:items-center open:justify-center"
        onCancel={(e) => {
          e.preventDefault();
          dismiss();
        }}
        onClick={(e) => {
          if (e.target === dialogRef.current) dismiss();
        }}
      >
        {open ? (
          <div
            className="w-full max-w-md animate-rise rounded-2xl border border-[var(--line)] bg-[#fbf7f1] p-5 shadow-[0_24px_60px_-20px_rgba(28,25,23,0.45)] sm:p-6"
            role="document"
          >
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
              Smazání profilu
            </p>
            <h2 className="mt-1 font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
              Opravdu smazat?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--ink-soft)]">
              Profil <span className="font-medium text-[var(--ink)]">{profileName}</span>{" "}
              a všechna jeho měření budou trvale odstraněna. Tuto akci nelze
              vrátit.
            </p>
            {error ? (
              <p className="mt-3 text-sm text-red-700">{error}</p>
            ) : null}
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={confirmDelete}
                disabled={pending}
                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {pending ? "Mazání…" : "Smazat profil"}
              </button>
              <button
                type="button"
                onClick={dismiss}
                disabled={pending}
                className="rounded-lg border border-[var(--line)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--ink)] transition hover:bg-stone-50 disabled:opacity-60 sm:ml-auto"
              >
                Zavřít
              </button>
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  );
}
