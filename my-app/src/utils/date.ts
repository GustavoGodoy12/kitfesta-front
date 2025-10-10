// src/utils/date.ts
export function todayLocalISO(): string {
  const d = new Date();
  const tzOffsetMin = d.getTimezoneOffset();
  const local = new Date(d.getTime() - tzOffsetMin * 60_000);
  return local.toISOString().slice(0, 10); // YYYY-MM-DD
}
