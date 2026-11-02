/**
 * Run GudBot after the widget HTTP response, same pattern as password reset.
 * If after() cannot be used, the job still runs without being awaited.
 */

export type ScheduleAfterResponse = (task: () => Promise<void>) => void;

export function deferGudBot(
  schedule: ScheduleAfterResponse,
  job: () => Promise<unknown>,
  log: (line: string) => void = console.error,
): void {
  const task = async () => {
    try {
      await job();
    } catch (error) {
      log(
        `[gudbot] deferred turn failed: ${error instanceof Error ? error.name : "error"}`,
      );
    }
  };
  try {
    schedule(task);
  } catch {
    void task();
  }
}
