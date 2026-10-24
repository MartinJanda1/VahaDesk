export function formatDateTime(d: Date): string {
  return new Intl.DateTimeFormat("cs-CZ", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Prague",
  }).format(d);
}

export function formatShortDate(d: Date): string {
  return new Intl.DateTimeFormat("cs-CZ", {
    day: "numeric",
    month: "short",
    timeZone: "Europe/Prague",
  }).format(d);
}

/** Preserve up to 2 decimal places from the scale — never round 101.65 → 102. */
export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return value.toLocaleString("cs-CZ", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function formatValue(
  value: number | string | null | undefined,
  unit: string,
): string {
  if (value == null || value === "") return "—";
  if (typeof value === "string") return value;
  const n = formatNumber(value);
  return unit ? `${n} ${unit}` : n;
}
