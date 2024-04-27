const axios = require('axios');

const validateStatus = (status) => status < 500;

module.exports = {
  async searchMarket(search, filter = '') {
    const { data } = await axios.get(
      `https://symbol-search.tradingview.com/symbol_search/?text=${search.replace(/ /g, '%20')}&type=${filter}`,
      {
        validateStatus,
        headers: {
          origin: 'https://www.tradingview.com',
        },
      },
    );

    return data.map((s) => {
      const exchange = s.exchange.split(' ')[0];
      const id = `${exchange}:${s.symbol}`;

      const screener = 'global';

      return {
        id,
        exchange,
        fullExchange: s.exchange,
        screener,
        symbol: s.symbol,
        description: s.description,
        type: s.type,
        getTA: () => this.getTA(screener, id),
      };
    });
  },
};
