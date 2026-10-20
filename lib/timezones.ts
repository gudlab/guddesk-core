/**
 * IANA timezone helpers shared by the business hours picker (browser) and
 * the business hours save action (server).
 */

/**
 * Shown when Intl.supportedValuesOf is missing, and always merged into the
 * picker so "UTC" and current names such as "Asia/Kolkata" are offered even
 * where the runtime only lists older aliases ("Asia/Calcutta").
 */
export const FALLBACK_TIME_ZONES: readonly string[] = [
  "UTC",
  "Pacific/Pago_Pago",
  "Pacific/Honolulu",
  "America/Anchorage",
  "America/Los_Angeles",
  "America/Vancouver",
  "America/Tijuana",
  "America/Phoenix",
  "America/Denver",
  "America/Edmonton",
  "America/Chicago",
  "America/Mexico_City",
  "America/Winnipeg",
  "America/New_York",
  "America/Toronto",
  "America/Bogota",
  "America/Lima",
  "America/Caracas",
  "America/Halifax",
  "America/Santiago",
  "America/Sao_Paulo",
  "America/Argentina/Buenos_Aires",
  "America/St_Johns",
  "Atlantic/Azores",
  "Atlantic/Reykjavik",
  "Europe/London",
  "Europe/Dublin",
  "Europe/Lisbon",
  "Africa/Casablanca",
  "Africa/Lagos",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Madrid",
  "Europe/Rome",
  "Europe/Amsterdam",
  "Europe/Brussels",
  "Europe/Stockholm",
  "Europe/Warsaw",
  "Africa/Johannesburg",
  "Africa/Cairo",
  "Europe/Athens",
  "Europe/Helsinki",
  "Europe/Kyiv",
  "Europe/Istanbul",
  "Asia/Jerusalem",
  "Africa/Nairobi",
  "Europe/Moscow",
  "Asia/Riyadh",
  "Asia/Tehran",
  "Asia/Dubai",
  "Asia/Kabul",
  "Asia/Karachi",
  "Asia/Tashkent",
  "Asia/Kolkata",
  "Asia/Kathmandu",
  "Asia/Dhaka",
  "Asia/Yangon",
  "Asia/Bangkok",
  "Asia/Jakarta",
  "Asia/Ho_Chi_Minh",
  "Asia/Shanghai",
  "Asia/Hong_Kong",
  "Asia/Singapore",
  "Asia/Manila",
  "Asia/Taipei",
  "Australia/Perth",
  "Asia/Seoul",
  "Asia/Tokyo",
  "Australia/Darwin",
  "Australia/Adelaide",
  "Australia/Brisbane",
  "Australia/Sydney",
  "Pacific/Guam",
  "Pacific/Noumea",
  "Pacific/Auckland",
  "Pacific/Fiji",
  "Pacific/Apia",
  "Pacific/Tongatapu",
  "Pacific/Kiritimati",
];

/** Area/Location style names. Rejects offsets such as "+05:30". */
const IANA_NAME_PATTERN = /^[A-Za-z][A-Za-z0-9_+-]*(?:\/[A-Za-z0-9_+-]+)*$/;
const MAX_NAME_LENGTH = 64;

type SupportedValuesOf = (key: "timeZone") => string[];

function runtimeTimeZones(): string[] | null {
  const supportedValuesOf = (Intl as { supportedValuesOf?: SupportedValuesOf })
    .supportedValuesOf;
  if (typeof supportedValuesOf !== "function") return null;
  try {
    return supportedValuesOf.call(Intl, "timeZone");
  } catch {
    return null;
  }
}

/** The zone Intl resolves `value` to, or null if Intl rejects it. */
function resolveWithIntl(value: string): string | null {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: value,
    }).resolvedOptions().timeZone;
  } catch {
    return null;
  }
}

/**
 * Every zone the picker offers: Intl.supportedValuesOf("timeZone") where
 * the runtime has it, plus FALLBACK_TIME_ZONES. Names the runtime cannot
 * resolve are left out. "UTC" comes first, the rest are sorted by name.
 */
export function listTimeZones(
  source: () => string[] | null = runtimeTimeZones,
): string[] {
  const names = new Set<string>();
  for (const name of [...FALLBACK_TIME_ZONES, ...(source() ?? [])]) {
    if (resolveWithIntl(name)) names.add(name);
  }
  return [...names].sort((a, b) => {
    if (a === "UTC") return -1;
    if (b === "UTC") return 1;
    return a.localeCompare(b);
  });
}

let knownNames: Map<string, string> | null = null;

function knownName(value: string): string | undefined {
  if (!knownNames) {
    knownNames = new Map(
      listTimeZones().map((name) => [name.toLowerCase(), name]),
    );
  }
  return knownNames.get(value.toLowerCase());
}

/**
 * The shared validator. Returns the zone name to store, or null when
 * `value` is not an IANA timezone name that Intl can resolve.
 *
 * - Offsets ("+05:30", "-08:00") and free text are rejected.
 * - Letter case is fixed ("europe/london" becomes "Europe/London").
 * - Valid aliases are kept as given ("Asia/Kolkata" is not rewritten to
 *   "Asia/Calcutta").
 */
export function normaliseTimeZone(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const name = value.trim();
  if (!name || name.length > MAX_NAME_LENGTH || !IANA_NAME_PATTERN.test(name)) {
    return null;
  }
  const resolved = resolveWithIntl(name);
  if (!resolved) return null;
  const listed = knownName(name);
  if (listed) return listed;
  return resolved.toLowerCase() === name.toLowerCase() ? resolved : name;
}

export function isIanaTimeZone(value: unknown): value is string {
  return normaliseTimeZone(value) !== null;
}

/**
 * The zone to use for SLA maths, given what is stored for a workspace.
 * Any value Intl can resolve keeps working as it did before validation
 * existed (this includes offsets such as "+05:30"). A missing or broken
 * value falls back to "UTC" instead of throwing.
 */
export function resolveStoredTimeZone(
  value: string | null | undefined,
): string {
  if (value && resolveWithIntl(value)) return value;
  return "UTC";
}

/**
 * The current UTC offset of `timeZone`, such as "UTC+05:30" or "UTC-08:00".
 * Returns null if the zone cannot be resolved.
 */
export function formatUtcOffset(
  timeZone: string,
  date: Date = new Date(),
): string | null {
  let parts: Intl.DateTimeFormatPart[];
  try {
    parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    }).formatToParts(date);
  } catch {
    return null;
  }
  const get = (type: string) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);
  const wallClockAsUtc = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour") % 24,
    get("minute"),
    get("second"),
  );
  const instant = Math.floor(date.getTime() / 1000) * 1000;
  const totalMinutes = Math.round((wallClockAsUtc - instant) / 60_000);
  const sign = totalMinutes < 0 ? "-" : "+";
  const abs = Math.abs(totalMinutes);
  const hours = String(Math.floor(abs / 60)).padStart(2, "0");
  const minutes = String(abs % 60).padStart(2, "0");
  return `UTC${sign}${hours}:${minutes}`;
}
