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

export function formatValue(
  value: number | string | null | undefined,
  unit: string,
): string {
  if (value == null || value === "") return "—";
  if (typeof value === "string") return value;
  const n =
    Math.abs(value) >= 100
      ? value.toFixed(0)
      : Math.abs(value) >= 10
        ? value.toFixed(1)
        : value.toFixed(2);
  return unit ? `${n} ${unit}` : n;
}
