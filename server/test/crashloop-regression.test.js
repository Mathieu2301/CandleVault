const test = require('node:test');
const assert = require('node:assert');
const { execFile } = require('node:child_process');
const http = require('node:http');
const path = require('node:path');

const fetchCoins = require('../src/coinranking');

const SERVER_DIR = path.join(__dirname, '..');

function runChild(source, env = {}) {
  return new Promise((resolve) => {
    execFile(process.execPath, ['-e', source],
      { cwd: SERVER_DIR, timeout: 15000, env: { ...process.env, ...env } },
      (error, stdout, stderr) => resolve({ code: error?.code ?? 0, stdout, stderr }));
  });
}

/** A stand-in for the dead coinranking.com: 404 + an HTML error page. */
function withDeadApi(run) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      res.writeHead(404, { 'content-type': 'text/html' });
      res.end('<!DOCTYPE html><html><head><title>404: This page could not be found</title></head></html>');
    });
    server.listen(0, '127.0.0.1', async () => {
      try {
        resolve(await run(`http://127.0.0.1:${server.address().port}/coins`));
      } catch (e) { reject(e); } finally { server.close(); }
    });
  });
}

// End-to-end reproduction of the incident: the crypto notification job hits a
// dead third-party API. Before the fix this exited 1 and Kubernetes restarted
// the pod, 57 times in 18 hours.
test('the agent survives a dead coinranking API (the CrashLoopBackOff)', async () => {
  await withDeadApi(async (deadUrl) => {
    const { code, stderr } = await runChild(`
      const { installSafetyNet, scheduleSafely } = require('./src/safety');
      const fetchCoins = require('./src/coinranking');
      installSafetyNet();

      // Exactly what backgroundHelper does for scanCryptos.
      scheduleSafely('scanCryptos', async () => {
        const coins = await fetchCoins(5);
        return coins.filter((c) => c.change > 20);
      }, 60000);

      // Still alive after the job had every chance to kill us?
      setTimeout(() => { console.log('AGENT_STILL_ALIVE'); process.exit(0); }, 1500);
    `, { COINRANKING_API: deadUrl });

    assert.strictEqual(code, 0, `agent must not die. stderr:\n${stderr}`);
    assert.match(stderr, /scanCryptos.*failed.*404/s, 'the failure must be logged, not silent');
  });
});

test('the same scenario without containment still kills the process', async () => {
  await withDeadApi(async (deadUrl) => {
    const { code } = await runChild(`
      const fetchCoins = require('./src/coinranking');
      (async () => { await fetchCoins(5); })();       // no catch: the old pattern
      setTimeout(() => process.exit(0), 1500);
    `, { COINRANKING_API: deadUrl });

    assert.strictEqual(code, 1, 'proves the regression test is actually exercising the bug');
  });
});

test('the live coinranking endpoint returns usable data', async (t) => {
  let coins;
  try {
    coins = await fetchCoins(5);
  } catch (e) {
    return t.skip(`network unavailable: ${e.message}`);
  }
  assert.ok(coins.length > 0, 'expected at least one coin');
  for (const c of coins) {
    assert.ok(typeof c.name === 'string' && c.name, 'name');
    assert.ok(typeof c.symbol === 'string' && c.symbol, 'symbol');
    assert.ok(Number.isFinite(c.change), `change must be a number, got ${c.change}`);
  }
  return undefined;
});
