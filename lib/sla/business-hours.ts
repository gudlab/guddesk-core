/**
 * Business hours utilities for SLA deadline computation.
 *
 * Handles timezone-aware schedule evaluation, holiday exclusion,
 * and "business minutes" arithmetic (advancing a clock only through
 * configured working hours).
 */

export interface DaySchedule {
  start: string; // "09:00"
  end: string; // "17:00"
}

export interface WeekSchedule {
  monday?: DaySchedule | null;
  tuesday?: DaySchedule | null;
  wednesday?: DaySchedule | null;
  thursday?: DaySchedule | null;
  friday?: DaySchedule | null;
  saturday?: DaySchedule | null;
  sunday?: DaySchedule | null;
}

const DAY_NAMES = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

/**
 * Parse "HH:MM" into total minutes since midnight.
 */
function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/**
 * Get the day-of-week name for a Date in a given timezone.
 */
function getDayName(date: Date, timezone: string): (typeof DAY_NAMES)[number] {
  const dayIndex = new Date(
    date.toLocaleString("en-US", { timeZone: timezone }),
  ).getDay();
  return DAY_NAMES[dayIndex];
}

/**
 * Get hours and minutes for a Date in a given timezone.
 */
function getTimeInTimezone(
  date: Date,
  timezone: string,
): { hours: number; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(date);

  let hours = 0;
  let minutes = 0;
  for (const part of parts) {
    if (part.type === "hour") hours = parseInt(part.value, 10);
    if (part.type === "minute") minutes = parseInt(part.value, 10);
  }
  // Node 20 Intl uses hour 24 at midnight; treat that as 0.
  if (hours === 24) hours = 0;
  return { hours, minutes };
}

/**
 * Get the date string (YYYY-MM-DD) for a Date in a given timezone.
 */
function getDateString(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/**
 * Check if a date falls on a holiday.
 */
function isHoliday(date: Date, holidays: string[], timezone: string): boolean {
  const dateStr = getDateString(date, timezone);
  return holidays.includes(dateStr);
}

/**
 * Check if a given timestamp is within business hours.
 */
export function isWithinBusinessHours(
  date: Date,
  schedule: WeekSchedule,
  timezone: string,
  holidays: string[] = [],
): boolean {
  if (isHoliday(date, holidays, timezone)) return false;

  const dayName = getDayName(date, timezone);
  const daySchedule = schedule[dayName];
  if (!daySchedule) return false;

  const { hours, minutes } = getTimeInTimezone(date, timezone);
  const currentMinutes = hours * 60 + minutes;
  const startMinutes = parseTimeToMinutes(daySchedule.start);
  const endMinutes = parseTimeToMinutes(daySchedule.end);

  return currentMinutes >= startMinutes && currentMinutes < endMinutes;
}

/**
 * Add business minutes to a start time, advancing only through
 * configured working hours.
 *
 * If the start time is outside business hours, it advances to the
 * next business-hours window before starting the countdown.
 *
 * @returns The deadline Date in UTC.
 */
export function addBusinessMinutes(
  start: Date,
  minutes: number,
  schedule: WeekSchedule,
  holidays: string[] = [],
  timezone: string = "UTC",
): Date {
  if (minutes <= 0) return new Date(start);

  let remaining = minutes;
  let cursor = new Date(start);

  // Safety: max 365 days of iteration to prevent infinite loops
  const maxIterations = 365 * 24 * 60;
  let iterations = 0;

  while (remaining > 0 && iterations < maxIterations) {
    iterations++;

    const dayName = getDayName(cursor, timezone);
    const daySchedule = schedule[dayName];

    // If this day has no schedule or is a holiday, advance to next day's start
    if (!daySchedule || isHoliday(cursor, holidays, timezone)) {
      cursor = advanceToNextDay(cursor, timezone);
      continue;
    }

    const { hours, minutes: mins } = getTimeInTimezone(cursor, timezone);
    const currentMinutes = hours * 60 + mins;
    const startMinutes = parseTimeToMinutes(daySchedule.start);
    const endMinutes = parseTimeToMinutes(daySchedule.end);

    // Before business hours: advance to start of business hours
    if (currentMinutes < startMinutes) {
      const diffMs = (startMinutes - currentMinutes) * 60 * 1000;
      cursor = new Date(cursor.getTime() + diffMs);
      continue;
    }

    // After business hours: advance to next day
    if (currentMinutes >= endMinutes) {
      cursor = advanceToNextDay(cursor, timezone);
      continue;
    }

    // Within business hours: consume as many minutes as possible
    const availableMinutes = endMinutes - currentMinutes;
    if (remaining <= availableMinutes) {
      // Deadline falls within this window
      cursor = new Date(cursor.getTime() + remaining * 60 * 1000);
      remaining = 0;
    } else {
      // Consume the rest of this window and move to next day
      remaining -= availableMinutes;
      cursor = new Date(cursor.getTime() + availableMinutes * 60 * 1000);
      cursor = advanceToNextDay(cursor, timezone);
    }
  }

  return cursor;
}

/**
 * Advance a cursor to the start of the next calendar day in the given timezone.
 */
function advanceToNextDay(date: Date, timezone: string): Date {
  // Get the current date string and add one day
  const dateStr = getDateString(date, timezone);
  const [year, month, day] = dateStr.split("-").map(Number);
  const nextDay = new Date(Date.UTC(year, month - 1, day + 1));

  // Convert "next day midnight in timezone" back to UTC
  // Create a date string for next day and parse it in the timezone
  const nextDayStr = `${year}-${String(month).padStart(2, "0")}-${String(day + 1).padStart(2, "0")}T00:00:00`;

  // Use a simple approach: compute the offset
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  // Start from an approximate UTC midnight of the next day
  let cursor = new Date(nextDay);

  // Iterate to find the exact UTC time that corresponds to midnight in the timezone
  // This handles DST transitions correctly
  for (let i = -14; i <= 14; i++) {
    const candidate = new Date(nextDay.getTime() + i * 60 * 60 * 1000);
    const parts = formatter.formatToParts(candidate);
    const candidateDay = parseInt(
      parts.find((p) => p.type === "day")?.value ?? "0",
      10,
    );
    let candidateHour = parseInt(
      parts.find((p) => p.type === "hour")?.value ?? "99",
      10,
    );
    const candidateMinute = parseInt(
      parts.find((p) => p.type === "minute")?.value ?? "99",
      10,
    );
    if (candidateHour === 24) candidateHour = 0;

    if (
      candidateDay === day + 1 &&
      candidateHour === 0 &&
      candidateMinute === 0
    ) {
      cursor = candidate;
      break;
    }
  }

  return cursor;
}

/**
 * Default business hours schedule: Monday–Friday 9am–5pm.
 */
export const DEFAULT_SCHEDULE: WeekSchedule = {
  monday: { start: "09:00", end: "17:00" },
  tuesday: { start: "09:00", end: "17:00" },
  wednesday: { start: "09:00", end: "17:00" },
  thursday: { start: "09:00", end: "17:00" },
  friday: { start: "09:00", end: "17:00" },
  saturday: null,
  sunday: null,
};
