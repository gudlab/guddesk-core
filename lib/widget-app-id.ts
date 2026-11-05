/**
 * Widget public appId on /api/widget/config and /api/widget/auth.
 * Embeds send a cosmetic `gd_pub_` prefix; the database stores the id without it.
 */
export const WIDGET_APP_ID_REQUIRED = "App ID is required";

export type ParseWidgetAppIdResult =
  | { ok: true; appId: string }
  | { ok: false; status: 400; error: string };

export function parseWidgetAppId(raw: unknown): ParseWidgetAppIdResult {
  if (!raw || typeof raw !== "string") {
    return { ok: false, status: 400, error: WIDGET_APP_ID_REQUIRED };
  }
  return { ok: true, appId: raw.replace(/^gd_pub_/, "") };
}
