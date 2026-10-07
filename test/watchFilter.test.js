const assert = require('assert').strict;

describe('isNoisePath', () => {
  let isNoisePath;
  before(() => {
    ({ isNoisePath } = require('../out/watchFilter'));
  });

  it('ignores churny tool and vcs directories', () => {
    for (const p of [
      '/repo/.git/index',
      '/repo/.mypy_cache/3.11/foo.json',
      '/repo/src/__pycache__/mod.cpython-311.pyc',
      '/repo/.ruff_cache/x',
      '/repo/.pytest_cache/v/cache/lastfailed',
      '/repo/node_modules/pkg/index.js',
    ]) {
      assert.equal(isNoisePath(p), true, `${p} should be ignored`);
    }
  });

  it('allows real workspace files', () => {
    for (const p of ['/repo/src/app.ts', '/repo/README.md', '/repo/lib/git_cache.ts']) {
      assert.equal(isNoisePath(p), false, `${p} should not be ignored`);
    }
  });
});
