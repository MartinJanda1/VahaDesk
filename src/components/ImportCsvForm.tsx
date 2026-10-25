"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { importCsvAction, type ActionState } from "@/app/actions";
import { Tooltip } from "./Tooltip";

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
  const [dismissedKey, setDismissedKey] = useState<string | null>(null);
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedFileRef = useRef<File | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const needsDecision = Boolean(state?.needsDecision);
  const showResult = Boolean(state?.message) && !needsDecision;
  const modalKey = needsDecision
    ? `decision:${state.newCount ?? 0}:${state.duplicateCount ?? 0}:${state.message ?? ""}`
    : showResult
      ? `result:${state.ok}:${state.message ?? ""}`
      : null;
  const open = modalKey != null && dismissedKey !== modalKey;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open]);

  function clearFile() {
    selectedFileRef.current = null;
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function dismiss() {
    if (modalKey != null) setDismissedKey(modalKey);
    dialogRef.current?.close();
    clearFile();
  }

  function submitImport(mode?: "skip" | "overwrite") {
    const file = selectedFileRef.current;
    if (!file) return;
    const fd = new FormData();
    fd.set("csv", file);
    if (mode) fd.set("duplicateMode", mode);
    startTransition(() => {
      formAction(fd);
    });
  }

  function pickFile() {
    if (pending || (needsDecision && open)) return;
    fileInputRef.current?.click();
  }

  return (
    <>
      <div className={compact ? "flex justify-end" : "flex items-end"}>
        <input
          ref={fileInputRef}
          id={inputId}
          type="file"
          accept=".csv,text/csv"
          className="sr-only"
          tabIndex={-1}
          onChange={() => {
            const file = fileInputRef.current?.files?.[0] ?? null;
            selectedFileRef.current = file;
            if (file) submitImport();
          }}
        />
        <Tooltip content="Vyberte CSV export z TrueLife FitScale. Po výběru souboru se import spustí automaticky.">
          <button
            type="button"
            onClick={pickFile}
            disabled={pending || (needsDecision && open)}
            aria-label="Import CSV — vyberte soubor, import se spustí automaticky"
            className={
              compact
                ? "shrink-0 rounded-md bg-sky-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-sky-600 disabled:opacity-60"
                : "shrink-0 rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-sky-600 disabled:opacity-60"
            }
          >
            {pending && !open ? "Import…" : "Import CSV"}
          </button>
        </Tooltip>
      </div>

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
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                Import CSV
              </p>
              <h2 className="mt-1 font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
                {needsDecision
                  ? "Duplicitní měření"
                  : state.ok
                    ? "Import dokončen"
                    : "Import se nepovedl"}
              </h2>
            </div>

            <p
              className={`mt-3 text-sm leading-relaxed ${
                needsDecision
                  ? "text-[var(--ink-soft)]"
                  : state.ok
                    ? "text-sky-700"
                    : "text-red-700"
              }`}
            >
              {state.message ??
                (needsDecision
                  ? `CSV obsahuje ${state.newCount ?? 0} nových a ${state.duplicateCount ?? 0} již existujících měření (stejný čas).`
                  : null)}
            </p>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              {needsDecision ? (
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => submitImport("skip")}
                    disabled={pending}
                    className="rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-sky-600 disabled:opacity-60"
                  >
                    {pending ? "Import…" : "Jen nové"}
                  </button>
                  <button
                    type="button"
                    onClick={() => submitImport("overwrite")}
                    disabled={pending}
                    className="rounded-lg bg-sky-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-sky-900 disabled:opacity-60"
                  >
                    Přepsat duplicity
                  </button>
                </div>
              ) : (
                <div />
              )}
              <button
                type="button"
                onClick={dismiss}
                disabled={pending && needsDecision}
                className="rounded-lg border border-[var(--line)] bg-gray-200 px-4 py-2.5 text-sm font-medium text-[var(--ink)] transition hover:bg-stone-50 disabled:opacity-60 sm:ml-auto"
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
