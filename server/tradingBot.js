/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const stocksAPI = require('@mathieuc/tradingview/miscRequests');

const searchCache = {};
async function searchMarket(symbol) {
  if (searchCache[symbol]) return searchCache[symbol];

  const searchRs = (await stocksAPI.search(symbol));
  if (!searchRs || !searchRs[0] || !searchRs[0].id) return false;
  [searchCache[symbol]] = searchRs;
  return searchRs[0];
}

async function getTA(market) {
  const exchange = (['forex', 'crypto'].includes(market.type)
    ? market.type
    : stocksAPI.getScreener(market.exchange)
  );

  try {
    return stocksAPI.getTA(exchange, market.id);
  } catch (ex) {
    return false;
  }
}

module.exports = async (userID) => {
  /** @type {import('firebase-admin').firestore.Firestore} */
  const db = global.firebase.firestore();

  let markets = [];
  let trades = [];

  async function action(symbol, sum, abs) {
    trades.filter((t) => t.market === symbol).forEach((trade) => {
      if (trade.lever * sum < 0 || abs < 4) {
        console.log('Bot: Closing trade on', symbol);
        db.collection('candlevault_trades').doc(trade.id).update({ state: 'WAITFORCLOSE' });
      }
    });

    if (abs > 5) {
      console.log(symbol, '=>', (sum > 0 ? 'BUY' : 'SELL'), sum);
      db.collection('candlevault_trades').add({
        state: 'WAITFOROPEN',
        market: symbol,
        user: userID,
        SL: 30,
        TP: 50,
        value: 100,
        lever: Math.round(sum * 5),
      });
    }
  }

  async function scanMarkets() {
    console.log('Scanning markets');
    for (const symbol of markets) {
      try {
        const advice = await getTA(await searchMarket(symbol));
        let sum = 0;

        Object.values(advice).forEach((a, i) => {
          if (i < 5) sum += a.All;
        });

        action(symbol, sum, Math.abs(sum));
      } catch (error) {
        // Wrong exchange
      }
    }
  }

  let firstFetch = true;
  db.collection('candlevault_users').doc(userID).onSnapshot((snap) => {
    markets = snap.get('markets');
    if (firstFetch && snap.exists && markets) {
      scanMarkets();
      setInterval(scanMarkets, 2 * 60 * 1000);
      firstFetch = false;
    }
  });

  db.collection('candlevault_trades')
    .where('user', '==', userID)
    .where('state', '==', 'OPEN')
    .onSnapshot((snap) => {
      snap.docs.forEach((d) => ({ id: d.id, ...d.data() }));
    });

  db.collection('candlevault_trades')
    .where('user', '==', userID)
    .where('state', '==', 'OPEN')
    .onSnapshot((snap) => {
      trades = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    });
};
