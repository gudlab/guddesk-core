/** Fallback when a configured color is missing or not a safe CSS color. */
export const DEFAULT_WIDGET_COLOR = "#3ECF8E";

const HEX_COLOR = /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const NUMBER = String.raw`(?:\d+(?:\.\d+)?|\.\d+)%?`;
const RGB_COLOR = new RegExp(
  String.raw`^rgba?\(\s*${NUMBER}\s*,\s*${NUMBER}\s*,\s*${NUMBER}\s*(?:,\s*${NUMBER}\s*)?\)$`,
  "i",
);

/**
 * True for hex colors (#rgb, #rgba, #rrggbb, #rrggbbaa) and for rgb() or
 * rgba() with plain numeric arguments. Anything else could break out of the
 * CSS declaration the color is written into, so it is rejected.
 */
export function isSafeCssColor(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  return HEX_COLOR.test(trimmed) || RGB_COLOR.test(trimmed);
}

/** Return the trimmed color when it is safe, otherwise the fallback. */
export function safeCssColor(
  value: unknown,
  fallback: string = DEFAULT_WIDGET_COLOR,
): string {
  if (isSafeCssColor(value)) return value.trim();
  return isSafeCssColor(fallback) ? fallback.trim() : DEFAULT_WIDGET_COLOR;
}
