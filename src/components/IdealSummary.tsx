import type { IdealComparison } from "@/lib/ideal-curve";

export function IdealSummary({
  comparison,
  variant = "weight",
}: {
  comparison: IdealComparison;
  variant?: "weight" | "composition";
}) {
  if (!comparison.applicable) {
    return (
      <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
        {comparison.reason ?? "Ideální křivka není k dispozici."}
      </p>
    );
  }

  const statusColor =
    comparison.status === "tooFast"
      ? "text-amber-800"
      : comparison.status === "tooSlow"
        ? "text-sky-800"
        : comparison.status === "atGoal"
          ? "text-emerald-800"
          : "text-[var(--ink-soft)]";

  if (variant === "composition") {
    return (
      <div className="mt-3 space-y-1 text-sm leading-relaxed">
        <p className="text-[var(--ink-soft)]">
          Šedé přerušované čáry = ideální trajektorie složení (stejný horizont
          jako u hmotnosti).
        </p>
        {comparison.compositionNote ? (
          <p className="text-[var(--muted)]">{comparison.compositionNote}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-1.5 text-sm leading-relaxed">
      <p className="text-[var(--ink-soft)]">{comparison.summaryText}</p>
      <p className={statusColor}>{comparison.statusText}</p>
      {comparison.userKgPerWeek != null && comparison.idealKgPerWeek != null ? (
        <p className="text-xs text-[var(--muted)]">
          Tempo:{" "}
          {comparison.userKgPerWeek.toLocaleString("cs-CZ", {
            maximumFractionDigits: 2,
          })}{" "}
          kg/týden (vy) vs.{" "}
          {comparison.idealKgPerWeek.toLocaleString("cs-CZ", {
            maximumFractionDigits: 2,
          })}{" "}
          kg/týden (ideál)
        </p>
      ) : null}
    </div>
  );
}
