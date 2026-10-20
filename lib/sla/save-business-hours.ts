import { normaliseTimeZone } from "../timezones";
import type { WeekSchedule } from "./business-hours";

/**
 * Validation and write for the business hours settings. The server action
 * (actions/manage-business-hours.ts) checks the session and role, then
 * calls this with Prisma. Tests call it with an in-memory fake.
 */

export type BusinessHoursInput = {
  timezone?: unknown;
  schedule?: unknown;
  holidays?: unknown;
};

export type BusinessHoursWrite = {
  timezone: string;
  schedule: WeekSchedule;
  holidays: string[];
};

export type SaveBusinessHoursDeps = {
  upsert(workspaceId: string, data: BusinessHoursWrite): Promise<void>;
};

export type SaveBusinessHoursResult =
  | { status: "success"; timezone: string }
  | { status: "error"; message: string };

export function validateBusinessHours(
  input: BusinessHoursInput,
): { ok: true; value: BusinessHoursWrite } | { ok: false; message: string } {
  if (typeof input.timezone !== "string" || !input.timezone.trim()) {
    return { ok: false, message: "Timezone is required" };
  }
  const timezone = normaliseTimeZone(input.timezone);
  if (!timezone) {
    const shown = input.timezone.trim().slice(0, 64);
    return {
      ok: false,
      message: `"${shown}" is not a valid timezone. Choose one from the list.`,
    };
  }

  const schedule = input.schedule;
  const hasWorkingDay =
    !!schedule &&
    typeof schedule === "object" &&
    Object.values(schedule).some(
      (day) =>
        !!day &&
        typeof day === "object" &&
        !!(day as { start?: unknown }).start &&
        !!(day as { end?: unknown }).end,
    );
  if (!hasWorkingDay) {
    return { ok: false, message: "At least one working day is required" };
  }

  const holidays = Array.isArray(input.holidays) ? input.holidays : [];
  for (const holiday of holidays) {
    if (typeof holiday !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(holiday)) {
      return {
        ok: false,
        message: `Invalid holiday date format: ${String(holiday)}`,
      };
    }
  }

  return {
    ok: true,
    value: {
      timezone,
      schedule: schedule as WeekSchedule,
      holidays: holidays as string[],
    },
  };
}

export async function saveBusinessHours(
  deps: SaveBusinessHoursDeps,
  workspaceId: string,
  input: BusinessHoursInput,
): Promise<SaveBusinessHoursResult> {
  const result = validateBusinessHours(input);
  if (!result.ok) return { status: "error", message: result.message };
  await deps.upsert(workspaceId, result.value);
  return { status: "success", timezone: result.value.timezone };
}
