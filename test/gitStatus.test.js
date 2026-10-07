const assert = require('assert').strict;
const path = require('path');
const proxyquire = require('proxyquire');

// handler(file, args) returns stdout string, or throws to simulate a git failure.
function loadGitStatus(handler) {
  const execFile = (file, args, opts, cb) => {
    try {
      cb(null, { stdout: handler(file, args) });
    } catch (err) {
      cb(err);
    }
  };
  return proxyquire('../out/gitStatus', { child_process: { execFile } });
}

describe('gitStatus', () => {
  it('parses porcelain output into badges and colors', async () => {
    const gitStatus = loadGitStatus(() =>
      [
        ' M src/edited.ts',
        'A  src/new.ts',
        ' D src/deleted.ts',
        'R  src/old.ts -> src/renamed.ts',
        'UU src/conflict.ts',
        '?? src/untracked.ts',
      ].join('\n'),
    );

    const changes = await gitStatus.getGitChanges('/repo');
    assert.equal(changes.length, 6);
    assert.equal(changes[0].badge, 'M');
    assert.equal(changes[1].badge, 'A');
    assert.equal(changes[2].badge, 'D');
    assert.equal(changes[3].filePath, 'src/renamed.ts');
    assert.equal(changes[4].badge, 'C');
    assert.equal(changes[5].badge, 'U');
  });

  it('badges all merge-conflict states as C', async () => {
    const gitStatus = loadGitStatus(() =>
      [
        'DD src/both-deleted.ts',
        'AU src/added-by-us.ts',
        'UD src/deleted-by-them.ts',
        'UA src/added-by-them.ts',
        'DU src/deleted-by-us.ts',
        'AA src/both-added.ts',
        'UU src/both-modified.ts',
      ].join('\n'),
    );

    const changes = await gitStatus.getGitChanges('/repo');
    assert.equal(changes.length, 7);
    for (const change of changes) {
      assert.equal(change.badge, 'C', `${change.x}${change.y} should badge as C`);
      assert.equal(change.color, 'conflict');
    }
  });

  it('returns empty list when git command fails', async () => {
    const gitStatus = loadGitStatus(() => {
      throw new Error('git not available');
    });
    assert.deepEqual(await gitStatus.getGitChanges('/repo'), []);
  });

  it('builds a changed path set keyed by absolute path', async () => {
    const gitStatus = loadGitStatus(() =>
      [' M src/a.ts', 'A  src/nested/b.ts', ' M README.md'].join('\n'),
    );
    const map = await gitStatus.buildChangedPathSet('/repo');
    assert.equal(map.size, 3);
    assert.ok(map.has(path.join('/repo', 'src/a.ts')));
    assert.ok(map.has(path.join('/repo', 'src/nested/b.ts')));
    assert.ok(map.has(path.join('/repo', 'README.md')));
  });

  it('reads ignored paths and trims directory suffixes', async () => {
    const gitStatus = loadGitStatus((file, args) => {
      if (args.includes('ls-files')) {
        return ['tmp/', '.cache/', 'notes.txt'].join('\n');
      }
      return '';
    });
    const ignored = await gitStatus.getIgnoredPaths('/repo');
    assert.ok(ignored.has(path.join('/repo', 'tmp')));
    assert.ok(ignored.has(path.join('/repo', '.cache')));
    assert.ok(ignored.has(path.join('/repo', 'notes.txt')));
  });
});
