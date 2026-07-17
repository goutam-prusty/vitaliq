import { format, isValid, parse, parseISO, subDays, subMonths, subYears } from "date-fns";
import { toZonedTime } from "date-fns-tz";

export function nowParts(timezone: string) {
  const zoned = toZonedTime(new Date(), timezone);
  return { date: format(zoned, "yyyy-MM-dd"), time: format(zoned, "HH:mm") };
}

export function normalizeDate(value: unknown): string | undefined {
  if (value instanceof Date && isValid(value)) return format(value, "yyyy-MM-dd");
  if (typeof value !== "string" || !value.trim()) return undefined;
  const text = value.trim();
  const parsed = parseISO(text);
  if (isValid(parsed)) return format(parsed, "yyyy-MM-dd");
  const fallback = parse(text, "M/d/yyyy", new Date());
  return isValid(fallback) ? format(fallback, "yyyy-MM-dd") : undefined;
}

export function normalizeTime(value: unknown): string {
  if (value instanceof Date && isValid(value)) return format(value, "HH:mm");
  if (typeof value !== "string") return "";
  const match = value.trim().match(/^(\d{1,2}):(\d{2})/);
  return match ? `${match[1].padStart(2, "0")}:${match[2]}` : "";
}

export function makeTimestamp(date: string, time?: string) {
  return `${date}T${time || "00:00"}:00`;
}

export function ageFromDateOfBirth(dateOfBirth?: string) {
  if (!dateOfBirth) return undefined;
  const dob = parseISO(dateOfBirth);
  if (!isValid(dob)) return undefined;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDelta = today.getMonth() - dob.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < dob.getDate())) age -= 1;
  return age >= 0 ? age : undefined;
}

export function rangeStart(range: string): Date | undefined {
  const now = new Date();
  if (range === "7D") return subDays(now, 7);
  if (range === "30D") return subDays(now, 30);
  if (range === "90D") return subDays(now, 90);
  if (range === "6M") return subMonths(now, 6);
  if (range === "1Y") return subYears(now, 1);
  return undefined;
}
