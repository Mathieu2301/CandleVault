const test = require('node:test');
const assert = require('node:assert');
const { execFile } = require('node:child_process');
const path = require('node:path');

const { runSafely, scheduleSafely } = require('../src/safety');

const SERVER_DIR = path.join(__dirname, '..');

/** Run a snippet in a child node process, resolving with its exit code + stderr. */
function runChild(source) {
  return new Promise((resolve) => {
    execFile(process.execPath, ['-e', source], { cwd: SERVER_DIR, timeout: 10000 },
      (error, stdout, stderr) => resolve({ code: error?.code ?? 0, stdout, stderr }));
  });
}

// Encodes the production bug: an unhandled rejection from a background job
// took the whole agent down, which Kubernetes saw as CrashLoopBackOff.
test('an unhandled rejection kills the process when unguarded (the old behaviour)', async () => {
  const { code } = await runChild(`
    (async () => { throw new Error('coinranking is down'); })();
  `);
  assert.strictEqual(code, 1, 'baseline: node exits 1 on an unhandled rejection');
});

test('the safety net keeps the process alive on an unhandled rejection', async () => {
  const { code, stderr } = await runChild(`
    require('./src/safety').installSafetyNet();
    (async () => { throw new Error('coinranking is down'); })();
    setTimeout(() => process.exit(0), 300);
  `);
  assert.strictEqual(code, 0, 'process must survive');
  assert.match(stderr, /coinranking is down/, 'and must still report the failure');
});

test('the safety net keeps the process alive on an uncaught exception', async () => {
  const { code, stderr } = await runChild(`
    require('./src/safety').installSafetyNet();
    setTimeout(() => { throw new Error('socket exploded'); }, 10);
    setTimeout(() => process.exit(0), 300);
  `);
  assert.strictEqual(code, 0);
  assert.match(stderr, /socket exploded/);
});

test('runSafely swallows a rejecting job and reports it', async () => {
  const errors = [];
  const logger = { error: (...a) => errors.push(a.join(' ')), log: () => {} };

  await assert.doesNotReject(() => runSafely('scanCryptos', async () => {
    throw new Error('API unreachable');
  }, { logger }));

  assert.strictEqual(errors.length, 1);
  assert.match(errors[0], /scanCryptos/);
  assert.match(errors[0], /API unreachable/);
});

test('runSafely swallows a synchronous throw too', async () => {
  const logger = { error: () => {}, log: () => {} };
  await assert.doesNotReject(() => runSafely('boom', () => { throw new Error('sync'); }, { logger }));
});

test('runSafely returns the job result when it succeeds', async () => {
  assert.strictEqual(await runSafely('ok', async () => 42), 42);
});

test('scheduleSafely runs immediately and keeps running after a failure', async () => {
  const logger = { error: () => {}, log: () => {} };
  let calls = 0;

  const stop = scheduleSafely('flaky', () => {
    calls += 1;
    throw new Error('always fails');
  }, 40, { logger });

  await new Promise((r) => setTimeout(r, 150));
  stop();

  assert.ok(calls >= 3, `expected repeated runs despite failures, got ${calls}`);
});
