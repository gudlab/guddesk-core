/**
 * Forgot-password answers before it knows whether the account exists.
 * The lookup, the token and the email all run after the response (Next's
 * after()), so a known and an unknown address take the same path and the
 * same time. Before, only known addresses waited on Resend (about 300 ms
 * against 2 ms), which told an attacker which emails have accounts.
 */

export type ScheduleAfterResponse = (task: () => Promise<void>) => void;

/**
 * Schedule the reset for after the response and return at once. A failure
 * in the job is logged without the address. If after() can't be used
 * (outside a request), the job still runs, without being awaited.
 */
export function deferPasswordReset(
  email: string,
  schedule: ScheduleAfterResponse,
  job: (email: string) => Promise<unknown>,
  log: (line: string) => void = console.error,
): void {
  const task = async () => {
    try {
      await job(email);
    } catch (error) {
      log(`[password-reset] deferred reset failed: ${error instanceof Error ? error.name : "error"}`);
    }
  };
  try {
    schedule(task);
  } catch {
    void task();
  }
}
