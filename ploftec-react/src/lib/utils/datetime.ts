export function parseApiUtc(input: string | Date | number | null | undefined): Date {
  if (input instanceof Date) return input;
  if (typeof input === 'number') return new Date(input);
  let s = (input ?? '').toString().trim();
  if (!s) return new Date(NaN);
  // Normaliza fracciones: 2025-09-28T01:41:00.4966667 -> 2025-09-28T01:41:00.496
  s = s.replace(/(\.\d{3})\d+/, '$1');
  // Si no trae zona horaria, interpretamos como UTC (append Z)
  const hasTz = /[zZ]$|[+-]\d{2}:?\d{2}$/.test(s);
  const norm = hasTz ? s : `${s}Z`;
  return new Date(norm);
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
