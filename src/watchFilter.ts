/** Directory names whose churn should never trigger a git refresh. */
const NOISE_DIRS = new Set([
  '.git',
  'node_modules',
  '.mypy_cache',
  '__pycache__',
  '.ruff_cache',
  '.pytest_cache',
]);

/**
 * True when a path lies inside a high-churn tool or VCS directory. Tools like mypy
 * rewrite hundreds of cache files at once; ignoring them keeps the watcher from
 * firing a git command per event.
 */
export function isNoisePath(fsPath: string): boolean {
  const segments = fsPath.split(/[\\/]/);
  return segments.some((segment) => NOISE_DIRS.has(segment));
}
