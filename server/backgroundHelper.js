/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const stocksAPI = require('@mathieuc/tradingview/miscRequests');

(async () => {
  /** @type {import('firebase-admin').firestore.Firestore} */
  const db = global.firebase.firestore();
  const { sendPush } = global;

  const recommandedMarkets = [
    'BTCEUR', 'ETHEUR', 'ETCEUR', 'DOGEEUR',
    'LINKEUR', 'USDTEUR', 'XRPEUR', 'BNBEUR',
    'TSLA', 'GOOG', 'AMZN', 'NFLX',
  ];

  // async function getUserHabits(userID) {
  //   let sum = 0;
  //   let i = 0;

  //   (await db.collection('candlevault_trades')
  //     .where('user', '==', userID)
  //     .where('state', '==', 'CLOSED')
  //     .orderBy('openDate', 'desc')
  //     .limit(10)
  //     .get()
  //   ).docs.forEach((t) => {
  //     i += 1;
  //     sum += t.get('closeDate').seconds - t.get('openDate').seconds;
  //   });

  //   return {
  //     averageTime: sum / i,
  //   };
  // }

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

  async function getAlerts(user, advList) {
    const symbolAdvice = {};
    advList.forEach((adv) => { symbolAdvice[adv.s] = adv; });
    const alerts = [];

    await Promise.all((
      await db.collection('candlevault_trades')
        .where('state', '==', 'OPEN')
        .where('user', '==', user.id)
        .get()
    ).docs.map(async (d) => {
      const t = d.data();
      if (
        !alerts.find((a) => a.market === t.market)
        && symbolAdvice[t.market]
        && symbolAdvice[t.market].type !== (t.lever > 0 ? 'BUY' : 'SELL')
      ) {
        alerts.push({
          market: t.market,
          tradeType: (t.lever > 0 ? 'BUY' : 'SELL'),
          adviceType: symbolAdvice[t.market].type,
          interval: symbolAdvice[t.market].interval,
          rel: symbolAdvice[t.market].rel,
          short: symbolAdvice[t.market].short,
          long: symbolAdvice[t.market].long,
          value: t.value * Math.abs(t.lever),
          SL: Math.abs(t.SL),
        });
      }
    }));

    return alerts;
  }

  async function scanUsers() {
    const users = await Promise.all((
      await db.collection('candlevault_users').get()
    ).docs.map(async (d) => ({
      id: d.id,
      ...d.data(),
      // habits: await getUserHabits(d.id),
    })));

    const TACache = {};
    async function getAdvice(symbol) {
      if (TACache[symbol]) return TACache[symbol];
      const rs = {
        s: symbol, short: 0, long: 0, rev: false,
      };
      try {
        const adv = await getTA(await searchMarket(symbol));
        if (!adv) return rs;

        Object.values(adv).forEach((a, i) => {
          if (i < 5) rs.short += a.All;
          else rs.long += a.All;
          rs.rel = Math.abs((rs.short * 2) + rs.long);
        });

        rs.rev = (rs.short * rs.long < 0);
        rs.rel -= Math.abs(rs.short + rs.long) * rs.rev;

        if (Math.abs(rs.short) > Math.abs(rs.long)) {
          rs.interval = 'SHORT';
          rs.type = (rs.short < 0 ? 'SELL' : 'BUY');
        } else {
          rs.interval = 'LONG';
          rs.type = (rs.long < 0 ? 'SELL' : 'BUY');
        }

        TACache[symbol] = rs;
        return rs;
      } catch (error) {
        TACache[symbol] = rs;
        return rs;
      }
    }

    for (const user of users) {
      let { markets } = user;
      if (!markets.length) markets = [...markets, ...recommandedMarkets];

      const advList = (await Promise.all(markets.map((m) => getAdvice(m))))
        .filter((a) => a && a.rel >= 12).sort((a, b) => b.rel - a.rel);

      if (!advList || !advList[0]) return;

      const nbr = new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      const euro = new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
      });

      const ITEXT = { SHORT: '1 minute - 4 hours', LONG: '1 day - 1 month' };

      const alerts = await getAlerts(user, advList) || [];

      alerts.forEach((alert) => {
        sendPush(
          'PeIR71cVMkgqLCSKYKkZ3CN3GhG2' || user.id,
          `Alert for your ${alert.tradeType} trade on ${alert.market}`,
          [
            'Risky trade ! You could reach your Stop Loss',
            '',
            `Trade value: ${euro.format(alert.value)}`,
            `Loss risk: ${euro.format(alert.SL)}`,
            '',
            `Recommended: ${alert.adviceType}`,
            `Interval: ${ITEXT[alert.interval]}`,
            `Relevance: ${nbr.format(alert.rel)}`,
            `Short sum: ${nbr.format(alert.short)}`,
            `Long sum: ${nbr.format(alert.long)}`,
            '',
            `For ${user.displayName}`,
          ].join('\n'),
          alert.market,
        );
      });

      const a = advList[0];

      sendPush(
        user.id,
        `CandleVault advice for ${a.s}`,
        [
          `Recommended: ${a.type}`,
          `Interval: ${ITEXT[a.interval]}`,
          `Relevance: ${nbr.format(a.rel)}`,
          '',
          `Short sum: ${nbr.format(a.short)}`,
          `Long sum: ${nbr.format(a.long)}`,
          '',
          `For ${user.displayName}`,
        ].join('\n'),
        a.s,
      );
    }
  }

  scanUsers();
  setInterval(scanUsers, 1000 * 60 * 60); // Every hour
})();
