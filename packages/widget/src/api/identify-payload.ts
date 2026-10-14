export interface IdentifyVisitorInfo {
  userId?: string;
  name?: string;
  email?: string;
  metadata?: Record<string, unknown>;
  userHash?: string;
}

/**
 * JSON body for POST /api/widget/visitors.
 *
 * `userHash` is forwarded as `userHash` (not `hash`) so identity
 * verification on the server can check HMAC-SHA256(secret, userId).
 */
export function buildIdentifyPayload(
  appId: string,
  visitorToken: string | null | undefined,
  info: IdentifyVisitorInfo,
) {
  return {
    appId,
    visitorToken,
    externalId: info.userId,
    name: info.name,
    email: info.email,
    metadata: info.metadata,
    userHash: info.userHash,
  };
}
