const assert = require('assert').strict;

describe('debounce', () => {
  let debounce;
  before(() => {
    ({ debounce } = require('../out/debounce'));
  });

  it('coalesces rapid calls into a single invocation', (done) => {
    let calls = 0;
    const d = debounce(() => {
      calls += 1;
    }, 20);
    d();
    d();
    d();
    assert.equal(calls, 0, 'should not fire synchronously');
    setTimeout(() => {
      assert.equal(calls, 1, 'rapid calls collapse to one');
      done();
    }, 50);
  });

  it('fires again after the delay elapses', (done) => {
    let calls = 0;
    const d = debounce(() => {
      calls += 1;
    }, 20);
    d();
    setTimeout(() => {
      d();
      setTimeout(() => {
        assert.equal(calls, 2, 'separate bursts fire separately');
        done();
      }, 40);
    }, 40);
  });
});
