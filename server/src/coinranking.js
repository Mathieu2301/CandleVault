const http = require('node:http');
const https = require('node:https');

/**
 * Coinranking's public API.
 *
 * The previous implementation called `https://coinranking.com/api/v2/coins`,
 * an internal endpoint of the website that has since been removed: it now
 * answers `404` with an HTML error page. Parsing that as JSON threw, and the
 * rejection travelled up to an unhandled promise, which kills the process on
 * Node >= 15. `api.coinranking.com` is the supported public entrypoint and
 * returns the exact same payload shape.
 */
const DEFAULT_URL = process.env.COINRANKING_API || 'https://api.coinranking.com/v2/coins';
const DEFAULT_TIMEOUT = 10000;

/**
 * @typedef {{ name: string, symbol: string, change: number }} Coin
 */

/**
 * Fetch the biggest 24h gainers.
 *
 * Rejects — never throws asynchronously — on network failure, timeout,
 * non-2xx status, unparseable body or unexpected payload shape. Callers are
 * expected to handle the rejection: see `runSafely` in `src/safety.js`.
 *
 * @param {number} n Number of markets.
 * @param {{ url?: string, apiKey?: string, timeout?: number }} [options]
 * @returns {Promise<Coin[]>} Sorted by 24h change, descending.
 */
module.exports = function fetchCoins(n = 5, options = {}) {
  const {
    url = DEFAULT_URL,
    apiKey = process.env.COINRANKING_API_KEY,
    timeout = DEFAULT_TIMEOUT,
  } = options;

  const endpoint = new URL(url);
  endpoint.searchParams.set('orderBy', 'change');
  endpoint.searchParams.set('orderDirection', 'desc');
  endpoint.searchParams.set('timePeriod', '24h');
  endpoint.searchParams.set('limit', String(n));

  const transport = endpoint.protocol === 'https:' ? https : http;

  return new Promise((resolve, reject) => {
    // `https.get` can emit `error` after the response started, and a timeout
    // can race a late response. Settle exactly once, whatever happens.
    let settled = false;
    const succeed = (value) => { if (!settled) { settled = true; resolve(value); } };
    const fail = (error) => { if (!settled) { settled = true; reject(error); } };

    const req = transport.get(endpoint, {
      timeout,
      headers: {
        accept: 'application/json',
        ...(apiKey ? { 'x-access-token': apiKey } : {}),
      },
    }, (res) => {
      const { statusCode } = res;

      if (statusCode < 200 || statusCode >= 300) {
        // Drain so the socket can be released, then reject.
        res.resume();
        fail(new Error(`Coinranking responded with HTTP ${statusCode}`));
        return;
      }

      res.setEncoding('utf8');
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('error', fail);
      res.on('end', () => {
        let payload;
        try {
          payload = JSON.parse(body);
        } catch {
          fail(new Error(`Coinranking returned a non-JSON body (${body.length} bytes)`));
          return;
        }

        if (payload?.status !== 'success' || !Array.isArray(payload?.data?.coins)) {
          fail(new Error(`Unexpected Coinranking payload (status: ${payload?.status ?? 'none'})`));
          return;
        }

        succeed(payload.data.coins.map((c) => ({
          name: c.name,
          symbol: c.symbol,
          change: parseFloat(c.change),
        })));
      });
    });

    req.on('timeout', () => {
      req.destroy(new Error(`Coinranking request timed out after ${timeout}ms`));
    });

    // Without this listener a connection failure is an unhandled `error` event,
    // which Node turns into an uncaught exception.
    req.on('error', fail);
  });
};
