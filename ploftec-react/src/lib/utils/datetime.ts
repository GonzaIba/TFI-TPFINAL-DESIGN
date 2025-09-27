export function parseApiUtc(input: string | Date | number | null | undefined): Date {
  if (input instanceof Date) return input;
  if (typeof input === 'number') return new Date(input);
  const s = (input ?? '').toString().trim();
  if (!s) return new Date(NaN);
  // If the API omits timezone (e.g. 2025-09-27T23:30:47.957), treat it as UTC.
  // If it already has 'Z' or an offset, respect it.
  const hasTz = /[zZ]$|[+-]\d{2}:?\d{2}$/.test(s);
  return new Date(hasTz ? s : `${s}Z`);
}

export function formatLocalSlot(startIso: string, endIso: string, withTz = false): string {
  const start = parseApiUtc(startIso);
  const end = parseApiUtc(endIso);
  const d = start.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' });
  const baseOpts: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: false };
  const opts = withTz ? { ...baseOpts, timeZoneName: 'short' as const } : baseOpts;
  const sh = start.toLocaleTimeString(undefined, opts);
  const eh = end.toLocaleTimeString(undefined, opts);
  return `${d} ${sh}–${eh}`;
}

