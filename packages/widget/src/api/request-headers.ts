/**
 * Headers for widget API fetches.
 *
 * `Content-Type: application/json` is not a CORS-safelisted value, so
 * putting it on GET /api/widget/config forces a preflight. Only send it
 * when the request has a body (POST).
 */
export function widgetRequestHeaders(options: {
  hasBody: boolean;
  visitorToken?: string | null;
  extra?: Record<string, string>;
}): Record<string, string> {
  const headers: Record<string, string> = { ...options.extra };
  if (options.hasBody) {
    headers["Content-Type"] = "application/json";
  }
  if (options.visitorToken) {
    headers["x-visitor-token"] = options.visitorToken;
  }
  return headers;
}
