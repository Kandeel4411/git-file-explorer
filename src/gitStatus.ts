import { execFile } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';

const execFileAsync = promisify(execFile);

export interface GitChange {
  /** X column (index/staged status) */
  x: string;
  /** Y column (worktree/unstaged status) */
  y: string;
  /** Path relative to repo root */
  filePath: string;
  /** Display label: M, A, D, ?, R, ... */
  badge: string;
  /** Tooltip color hint */
  color: 'modified' | 'untracked' | 'added' | 'deleted' | 'renamed' | 'conflict';
}

/** Runs `git status --porcelain=v1` asynchronously so the extension host never blocks. */
export async function getGitChanges(repoRoot: string): Promise<GitChange[]> {
  try {
    const { stdout } = await execFileAsync('git', ['status', '--porcelain=v1', '-uall'], {
      cwd: repoRoot,
      encoding: 'utf8',
    });

    const changes: GitChange[] = [];

    for (const raw of stdout.split('\n')) {
      if (!raw.trim()) continue;

      const x = raw[0];
      const y = raw[1];
      // Handle renames: "R old -> new" — porcelain v1 uses " -> "
      const rest = raw.substring(3).trim();
      const filePath = rest.includes(' -> ') ? rest.split(' -> ')[1] : rest;

      let badge = (x !== ' ' && x !== '?' ? x : y).trim() || '?';
      let color: GitChange['color'] = 'modified';

      // Merge-conflict states (git porcelain v1): DD AU UD UA DU AA UU.
      // Must be checked before A/D so they are not misclassified as added/deleted.
      const isConflict =
        x === 'U' || y === 'U' || (x === 'A' && y === 'A') || (x === 'D' && y === 'D');

      if (x === '?' && y === '?') {
        badge = 'U';
        color = 'untracked';
      } else if (isConflict) {
        badge = 'C';
        color = 'conflict';
      } else if (x === 'A' || y === 'A') {
        badge = 'A';
        color = 'added';
      } else if (x === 'D' || y === 'D') {
        badge = 'D';
        color = 'deleted';
      } else if (x === 'R' || y === 'R') {
        badge = 'R';
        color = 'renamed';
      }

      changes.push({ x, y, filePath, badge, color });
    }

    return changes;
  } catch {
    return [];
  }
}

/** Returns the set of absolute paths that are gitignored. */
export async function getIgnoredPaths(repoRoot: string): Promise<Set<string>> {
  try {
    const { stdout } = await execFileAsync(
      'git',
      ['ls-files', '--others', '--ignored', '--exclude-standard', '--directory'],
      { cwd: repoRoot, encoding: 'utf8' },
    );
    const ignored = new Set<string>();
    for (const line of stdout.split('\n')) {
      const trimmed = line.trim().replace(/\/$/, ''); // strip trailing slash from dirs
      if (!trimmed) continue;
      ignored.add(path.join(repoRoot, trimmed));
    }
    return ignored;
  } catch {
    return new Set();
  }
}

/** Build a map of all changed absolute paths for quick lookup. */
export async function buildChangedPathSet(repoRoot: string): Promise<Map<string, GitChange>> {
  const changes = await getGitChanges(repoRoot);
  const map = new Map<string, GitChange>();
  for (const c of changes) {
    map.set(path.join(repoRoot, c.filePath), c);
  }
  return map;
}
