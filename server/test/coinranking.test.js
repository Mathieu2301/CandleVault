const test = require('node:test');
const assert = require('node:assert');
const http = require('node:http');

const fetchCoins = require('../src/coinranking');

/** Spin up a throwaway HTTP server that replies with a canned response. */
function withServer(handler, run) {
  return new Promise((resolve, reject) => {
    const server = http.createServer(handler);
    server.listen(0, '127.0.0.1', async () => {
      const url = `http://127.0.0.1:${server.address().port}/coins`;
      try {
        resolve(await run(url));
      } catch (e) {
        reject(e);
      } finally {
        server.close();
      }
    });
  });
}

const VALID_PAYLOAD = JSON.stringify({
  status: 'success',
  data: {
    coins: [
      { name: 'Gaia Token', symbol: 'GAIA', change: '80.82' },
      { name: 'Moonriver', symbol: 'MOVR', change: '49.43' },
    ],
  },
});

test('resolves with name/symbol/change, change coerced to number', async () => {
  await withServer(
    (req, res) => { res.writeHead(200, { 'content-type': 'application/json' }); res.end(VALID_PAYLOAD); },
    async (url) => {
      const coins = await fetchCoins(2, { url });
      assert.deepStrictEqual(coins, [
        { name: 'Gaia Token', symbol: 'GAIA', change: 80.82 },
        { name: 'Moonriver', symbol: 'MOVR', change: 49.43 },
      ]);
    },
  );
});

// This is the exact production failure: the old coinranking.com endpoint was
// removed and now answers 404 with a Next.js HTML error page.
test('rejects cleanly when the API returns 404 + HTML (the production crash)', async () => {
  await withServer(
    (req, res) => {
      res.writeHead(404, { 'content-type': 'text/html' });
      res.end('<!DOCTYPE html><html><head><title>404</title></head></html>');
    },
    async (url) => {
      const err = await fetchCoins(5, { url }).then(
        () => { throw new Error('expected rejection, got success'); },
        (e) => e,
      );
      assert.match(err.message, /404/, 'error should name the HTTP status');
    },
  );
});

test('rejects once (not twice) on an unparseable body', async () => {
  await withServer(
    (req, res) => { res.writeHead(200, { 'content-type': 'text/html' }); res.end('<html>nope</html>'); },
    async (url) => {
      let settles = 0;
      await new Promise((resolve) => {
        fetchCoins(5, { url })
          .then(() => { settles += 1; }, () => { settles += 1; })
          .finally(() => setTimeout(resolve, 50));
      });
      assert.strictEqual(settles, 1);
    },
  );
});

test('rejects when the payload shape is not the success envelope', async () => {
  await withServer(
    (req, res) => { res.writeHead(200, { 'content-type': 'application/json' }); res.end('{"status":"fail"}'); },
    async (url) => {
      await assert.rejects(() => fetchCoins(5, { url }));
    },
  );
});

test('rejects on connection error instead of throwing an uncatchable error event', async () => {
  // Port 1 on loopback: nothing listens there, connection is refused.
  await assert.rejects(() => fetchCoins(5, { url: 'http://127.0.0.1:1/coins' }));
});

test('rejects on timeout rather than hanging forever', async () => {
  await withServer(
    () => { /* deliberately never respond */ },
    async (url) => {
      await assert.rejects(() => fetchCoins(5, { url, timeout: 150 }), /timed out|timeout/i);
    },
  );
});
