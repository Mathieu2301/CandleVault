const https = require('https');

/**
 * @param {number} n Number of markets
 * @returns {Promise<{ name: string, symbol: string, change: number }[]>}
 */
module.exports = function fetch(n = 5) {
  return new Promise((cb, err) => {
    https.get(
      `https://coinranking.com/api/v2/coins?orderBy=change&limit=${n}&orderDirection=desc&timePeriod=24h`,
      (res) => {
        let data = '';
        res.on('data', (d) => { data += d; });
        res.on('end', () => {
          let rs = null;
          try {
            rs = JSON.parse(data);
          } catch (error) {
            err(new Error('Can\'t parse server response'));
          }

          if (!rs || !rs.status || rs.status !== 'success') {
            err(new Error('Coinranking server error'));
            return;
          }

          const symbols = rs.data.coins.map((c) => ({
            name: c.name,
            symbol: c.symbol,
            change: parseFloat(c.change),
          }));

          cb(symbols);
        });
      },
    ).end();
  });
};
