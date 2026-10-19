/**
 * Dashboard widget color rule. The settings form uses a native color input,
 * which only produces #rrggbb, so that is the one format the dashboard
 * saves. The widget accepts it (plus other safe formats for snippets).
 */
export const WIDGET_PRIMARY_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

export const WIDGET_PRIMARY_COLOR_ERROR =
  "Primary color must be a hex color like #3ECF8E (# plus 6 hex digits).";

/** Returns an error message for an invalid color, or null when valid. */
export function widgetPrimaryColorError(value: string): string | null {
  return WIDGET_PRIMARY_COLOR_PATTERN.test(value)
    ? null
    : WIDGET_PRIMARY_COLOR_ERROR;
}
