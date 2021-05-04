require('./envLoader');

const firebase = require('firebase-admin');
const https = require('https');
const stocksAPI = require('@mathieuc/tradingview')();

const credentials = process.env.credentials
  ? JSON.parse(process.env.credentials)
  : require('./firebaseCredentials.json');

global.firebase = firebase;
firebase.initializeApp({
  credential: firebase.credential.cert(credentials),
  databaseURL: process.env.DB_URL || 'https://iridium-blast.firebaseio.com',
});

setTimeout(() => { // Auto restart every hour
  console.log('Restarting...');
  process.exit(0);
}, 3600000);

const miakode = require('./miakode');
const ws = require('./wsServer').server;

const filters = ['stock', 'futures', 'forex', 'cfd', 'crypto', 'index', 'economic'];

const CORR = process.env.CORR || 0;
function getDate() {
  return new Date(Date.now() + CORR);
}

const auth = firebase.auth();
const db = firebase.firestore();
const fcm = firebase.messaging();

async function sendPush(userID, title, body = '', tag = '/') {
  const tokenColl = db.collection('candlevault_users').doc(userID).collection('pushTokens');
  const pushTokens = await tokenColl.get();
  pushTokens.forEach(({ id: token }) => {
    console.log(`Send to '${userID.substring(0, 8)}...' => "${title}", "${body}"`);
    fcm.send({
      token,
      data: { title, body, tag },
    }).then(() => {
      tokenColl.doc(token).update({ lastUse: getDate() });
    }).catch(() => {
      tokenColl.doc(token).delete();
    });
  });
}

global.sendPush = sendPush;

/** @enum @const */
const P_TYPES = {
  /** From server (0x) */
  SERVER: {
    PING: '\x00',
    MARKET: '\x01',
    S_RESULTS: '\x02',
    TA_RESULTS: '\x03',
  },

  /** From user (2x) */
  CLIENT: {
    PONG: '\x10',
    AUTH: '\x11',
    SEARCH: '\x12',
    TA: '\x13',
  },
};

/**
 * @param {import('websocket').connection} socket
 * @param {string} type
 * @param {string} data
 */
function sendPacket(socket, type, data = '') {
  socket.sendBytes(Buffer.from(`${type}${data}`));
}

function parsePacket(packet) {
  if (!packet.binaryData) return { type: 'unknown' };

  const parsed = packet.binaryData.toString();
  return {
    type: parsed[0],
    data: parsed.substring(1),
  };
}

const genPayload = () => miakode.string.encode(Math.round(Math.random() * 10000).toString());

function checkDeal(dealID) {
  return new Promise((cb) => {
    https.request('https://denisbank.usp-3.fr/api/?checkDeal', {
      method: 'POST',
    }, (res) => {
      let body = '';
      res.on('data', (c) => { body += c; });
      res.on('close', () => {
        console.log('BODY', body);
        cb(body);
      });
    }).end(JSON.stringify({ id: dealID }));
  });
}

db.collection('candlevault_transactions').where('state', '==', 'WAITING').onSnapshot((snap) => {
  snap.forEach(async (transacDoc) => {
    const { from, to, value } = transacDoc.data();

    if (!from || !to || !value) {
      transacDoc.ref.delete();
      return;
    }

    const users = db.collection('candlevault_users');
    const toUser = await users.doc(to).get();

    if (from === 'DenisBank' && transacDoc.id.includes('DB_')) {
      const dealID = transacDoc.id.split('DB_')[1];

      const validDeal = await checkDeal(dealID);

      if (!validDeal) {
        console.log('Invalid deal', dealID);
        transacDoc.ref.delete();
        return;
      }

      transacDoc.ref.update({ state: 'DONE', date: getDate() });
    } else {
      const fromUser = await users.doc(from).get();
      const fromUserMoney = fromUser.get('money');

      if (!fromUser.exists || !toUser.exists || !fromUserMoney || fromUserMoney < value) {
        transacDoc.ref.delete();
        return;
      }

      transacDoc.ref.update({ state: 'DONE', date: getDate() });

      fromUser.ref.update({
        money: firebase.firestore.FieldValue.increment(0 - value),
      });
    }

    toUser.ref.update({
      money: firebase.firestore.FieldValue.increment(value),
    });

    const formattedValue = new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(Math.abs(value));

    sendPush(to, `Transaction received: +${formattedValue}`, (transacDoc.get('name') || ''));
  });
});

/** @typedef {string} MarketSymbol */

/**
 * @typedef {{
 *  id: string,
 *  user: string,
 *  market: MarketSymbol,
 *  state: 'WAITFOROPEN' | 'OPEN' | 'CLOSED' | 'WAITFORCLOSE',
 *  value: number,
 *  lever: number,
 *  TP: number,
 *  SL: number,
 *  autoClose?: { seconds: number },
 *  openVal?: number,
 *  closeVal?: number,
 * }} Trade
 */

/** @type {Object<string, Trade>} */
let trades = {};

/** @type {{ [userID: string]: { [socketID: number]: Function }} */
const userListeners = {};

/** @type {MarketSymbol[]} */
const subscribedSymbols = [];

const lastPrices = {};

stocksAPI.on('price', (data) => {
  lastPrices[data.symbol] = data.price;

  Object.values(trades)
    .filter((t) => t.market === data.symbol && t.state !== 'CLOSED')
    .forEach((trade) => {
      if (trade.state === 'WAITFOROPEN') {
        db.collection('candlevault_trades').doc(trade.id).update({
          state: 'OPEN',
          openVal: data.price,
          openDate: getDate(),
        });
        return;
      }

      const gain = (data.price - trade.openVal) * (trade.value / trade.openVal) * trade.lever;

      if (trade.state === 'OPEN') {
        if (gain > trade.TP || gain < (0 - trade.SL) || (
          trade.autoClose
          && trade.autoClose.seconds
          && new Date(trade.autoClose.seconds * 1000).getTime() < Date.now()
        )) {
          db.collection('candlevault_trades').doc(trade.id).update({
            state: 'WAITFORCLOSE',
          });
        }

        if (!userListeners[trade.user] || !userListeners[trade.user].forEach) {
          userListeners[trade.user] = [];
        }

        userListeners[trade.user].forEach((h) => h(data.symbol, data.price));
      }

      if (trade.state === 'WAITFORCLOSE') {
        console.log('Close trade', trade.id, gain);
        db.collection('candlevault_trades').doc(trade.id).update({
          state: 'CLOSED',
          closeVal: data.price,
          closeDate: getDate(),
        });

        db.collection('candlevault_users').doc(trade.user).update({
          money: firebase.firestore.FieldValue.increment(gain),
        });

        const formattedGain = new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'EUR',
        }).format(Math.abs(gain));

        const evol = (data.price / trade.openVal) - 1;
        const formattedEvol = new Intl.NumberFormat('fr-FR', {
          minimumFractionDigits: 2,
        }).format(Math.abs(evol * 100));

        const type = (trade.lever > 0 ? 'BUY' : 'SELL');

        sendPush(
          trade.user,
          `${trade.market} (${type}) trade closed (${evol > 0 ? '+' : '-'}${formattedEvol}%)`,
          `Gain/Loss: ${gain > 0 ? '+' : '-'}${formattedGain}`,
          trade.market,
        );
      }
    });
});

let firstLog = true;

stocksAPI.on('logged', () => {
  console.log('Stocks API: logged !');
  if (!firstLog) return;
  firstLog = true;

  db.collection('candlevault_trades').onSnapshot((snap) => {
    const newTrades = {};
    snap.docs.forEach((t) => {
      newTrades[t.id] = { id: t.id, ...t.data() };
    });

    trades = newTrades;

    snap.docChanges().forEach((change) => {
      const symbol = change.doc.get('market');
      const state = change.doc.get('state');

      if (change.type !== 'removed') {
        if (['OPEN', 'WAITFOROPEN', 'WAITFORCLOSE'].includes(state) && !subscribedSymbols.includes(symbol)) {
          subscribedSymbols.push(symbol);
          stocksAPI.subscribe(symbol);
          console.log('Subscribe to', symbol);
        } else if (state === 'CLOSED' && change.type === 'modified' && subscribedSymbols.includes(symbol)) {
          const checkLastTrade = Object.values(trades).findIndex((t) => (
            t.market === symbol && t.state === 'OPEN'));

          if (checkLastTrade < 0) {
            stocksAPI.unsubscribe(symbol);
            delete subscribedSymbols[subscribedSymbols.indexOf(symbol)];
            console.log('Unsubscribe from', symbol);
          }
        }
      }
    });
  });
});

let incrementer = 0;

console.log(getDate(), 'Socket ready !');
ws.on('connect', (socket) => {
  incrementer += 1;

  const client = {
    authenticated: false,
    socketID: incrementer,
  };

  let pongPayload = null;

  socket.on('message', async (packet) => {
    const msg = parsePacket(packet);
    if (!msg.data) return;
    // If not authenticated and packet is not an authentication packet
    if (!client.authenticated && msg.type !== P_TYPES.CLIENT.AUTH) return;

    // USER AUTHENTICATION
    if (msg.type === P_TYPES.CLIENT.AUTH && !client.authenticated) {
      const [userID, userToken] = miakode.array.decode(msg.data);
      if (!userID || !userToken) {
        socket.close(4002, 'WRONG_REQUEST');
        return;
      }

      auth.verifyIdToken(userToken).then((fUser) => {
        if (fUser.uid !== userID) {
          socket.close(4001, 'WRONG_ACCOUNT_CHECK');
          return;
        }

        if (!userListeners[userID]) userListeners[userID] = [];

        userListeners[userID][client.socketID] = (market, price) => {
          sendPacket(socket, P_TYPES.SERVER.MARKET, miakode.array.encode([market, price]));
        };

        db.collection('candlevault_trades')
          .where('user', '==', userID)
          .where('state', '!=', 'CLOSED')
          .get()
          .then((tList) => {
            const sent = [];
            tList.forEach((trade) => {
              const market = trade.get('market');
              if (market && lastPrices[market]) {
                if (sent.includes(market)) return;
                console.log('Send', market, 'price', lastPrices[market]);
                sendPacket(
                  socket,
                  P_TYPES.SERVER.MARKET,
                  miakode.array.encode([market, lastPrices[market]]),
                );
                sent.push(market);
              }
            });
          });

        socket.on('close', () => {
          delete userListeners[userID][client.socketID];
        });

        client.authenticated = true;
        console.log('Connect =>', client);
      }).catch((e) => {
        console.log(e);
        socket.close(4001, 'WRONG_CREDENTIALS');
      });

      return;
    }

    if (msg.type === P_TYPES.CLIENT.SEARCH) {
      const parsed = miakode.string.decode(msg.data);
      const filter = filters[parsed[0]];
      const query = parsed.substring(1);

      const results = (await stocksAPI.search(query, filter))
        .map((m) => m.symbol)
        .filter((v, i, s) => s.indexOf(v) === i)
        .slice(0, 10);
      sendPacket(socket, P_TYPES.SERVER.S_RESULTS, miakode.array.encode(results));
      return;
    }

    if (msg.type === P_TYPES.CLIENT.TA) {
      const symbol = miakode.string.decode(msg.data);

      const searchRs = (await stocksAPI.search(symbol));
      if (!searchRs || !searchRs[0] || !searchRs[0].id) return;
      const market = searchRs[0];

      const exchange = (['forex', 'crypto'].includes(market.type)
        ? market.type
        : stocksAPI.getScreener(market.exchange)
      );

      let results = [];
      try {
        const TA = await stocksAPI.getTA(exchange, market.id);
        Object.values(TA).forEach((AN) => {
          results.push(AN.All, AN.MA, AN.Other);
        });
      } catch (ex) {
        results = '0'.repeat(24).split('');
      }

      sendPacket(socket, P_TYPES.SERVER.TA_RESULTS, miakode.array.encode(results));
      return;
    }

    if (msg.type === P_TYPES.CLIENT.PONG) {
      pongPayload = msg.data;
      return;
    }

    console.log('Unknown packet', msg);
  });

  let pingPayload = null;
  const pingInterval = setInterval(() => {
    if (pingPayload !== pongPayload) {
      socket.close(4000, 'TIMEOUT');
      return;
    }

    pingPayload = genPayload();
    sendPacket(socket, P_TYPES.SERVER.PING, pingPayload);
  }, 5000);

  socket.on('close', (code, desc) => {
    console.log('Disconnect', code, desc);
    clearInterval(pingInterval);
  });
});

require('./backgroundHelper');
