/**
 * Returns a wrapper that delays calling `fn` until `delayMs` have passed since the
 * last invocation. Rapid bursts collapse into a single trailing call — used to keep
 * filesystem-watcher storms from triggering a git command per event.
 */
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delayMs: number,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return (...args: Parameters<T>) => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      timer = undefined;
      fn(...args);
    }, delayMs);
  };
}
