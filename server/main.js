require('./envLoader');

const firebase = require('firebase-admin');
const stocksAPI = require('@mathieuc/tradingview')();

const credentials = process.env.credentials
  ? JSON.parse(process.env.credentials)
  : require('./firebaseCredentials.json');

global.firebase = firebase;
firebase.initializeApp({
  credential: firebase.credential.cert(credentials),
  databaseURL: process.env.DB_URL || 'https://iridium-blast.firebaseio.com',
});

const miakode = require('./miakode');
const ws = require('./wsServer').server;

const auth = firebase.auth();
const db = firebase.firestore();

/** @enum @const */
const P_TYPES = {
  /** From server (0x) */
  SERVER: {
    PING: '\x00',
    MARKET: '\x01',
    S_RESULTS: '\x02',
  },

  /** From user (2x) */
  CLIENT: {
    PONG: '\x10',
    AUTH: '\x11',
    SEARCH: '\x12',
  },
};

/**
 * @param {import('websocket').connection} socket
 * @param {string} type
 * @param {string} data
 */
function sendPacket(socket, type, data = '') {
  socket.sendBytes(Buffer.from(`${type}${data}`));
  console.log(type);
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
 *  openVal?: number,
 *  closeVal?: number,
 * }} Trade
 */

/** @type {Object<string, Trade} */
let trades = {};

/** @type {{ [userID: string]: { [socketID: number]: Function }} */
const userListeners = {};

/** @type {MarketSymbol[]} */
const subscribedSymbols = [];

stocksAPI.on('price', (data) => {
  console.log(data.symbol, '=>', data.price);
  Object.values(trades)
    .filter((t) => t.market === data.symbol && t.state !== 'CLOSED')
    .forEach((trade) => {
      if (trade.state === 'WAITFOROPEN') {
        db.collection('candlevault_trades').doc(trade.id).update({
          state: 'OPEN',
          openVal: data.price,
          openDate: new Date(),
        });
        return;
      }

      const gain = (data.price - trade.openVal) * (trade.value / trade.openVal) * trade.lever;

      if (trade.state === 'OPEN') {
        if (gain > trade.TP || gain < (0 - trade.SL)) {
          db.collection('candlevault_trades').doc(trade.id).update({
            state: 'WAITFORCLOSE',
          });
        }

        if (!userListeners[trade.user] || !userListeners[trade.user].forEach) {
          userListeners[trade.user] = [];
        }

        userListeners[trade.user].forEach((h) => h(data.symbol, data.price));

        const evol = (data.price / trade.openVal) - 1;
        console.log(`${trade.openVal} -> ${data.price} = ${evol * 100}% = ${gain}€`);
      }

      if (trade.state === 'WAITFORCLOSE') {
        console.log('Close trade', trade.id, gain);
        db.collection('candlevault_trades').doc(trade.id).update({
          state: 'CLOSED',
          closeVal: data.price,
          closeDate: new Date(),
        });

        db.collection('candlevault_users').doc(trade.user).update({
          money: firebase.firestore.FieldValue.increment(gain),
        });
      }
    });
});

let firstLog = true;

stocksAPI.on('logged', () => {
  console.log('Logged');
  if (!firstLog) return;
  firstLog = true;

  db.collection('candlevault_trades').onSnapshot((snap) => {
    const newTrades = {};
    snap.docs.forEach((t) => {
      newTrades[t.id] = { id: t.id, ...t.data() };
    });

    trades = newTrades;
    console.log('trades', trades);

    snap.docChanges().forEach((change) => {
      const symbol = change.doc.get('market');
      const state = change.doc.get('state');

      if (change.type !== 'removed') {
        if (['OPEN', 'WAITFOROPEN', 'WAITFORCLOSE'].includes(state) && !subscribedSymbols.includes(symbol)) {
          subscribedSymbols.push(symbol);
          stocksAPI.subscribe(symbol);
          console.log('Subscribe to', symbol);
        } else if (state === 'CLOSED' && subscribedSymbols.includes(symbol)) {
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

console.log('Ready !');
ws.on('connect', (socket) => {
  // return;
  incrementer += 1;

  const client = {
    authenticated: false,
    /** @type {number} */
    socketID: incrementer,
  };

  let pongPayload = null;
  let pongTime = null;

  socket.on('message', async (packet) => {
    const msg = parsePacket(packet);
    if (!msg.data) return;
    // If not authenticated and packet is not an authentication packet
    if (!client.authenticated && msg.type !== P_TYPES.CLIENT.AUTH) return;

    // USER AUTHENTICATION
    if (msg.type === P_TYPES.CLIENT.AUTH && !client.authenticated) {
      console.log('Auth user');
      const [userID, userToken] = miakode.array.decode(msg.data);
      if (!userID || !userToken) {
        socket.close(4002, 'WRONG_REQUEST');
        return;
      }

      auth.verifyIdToken(userToken).then(async (fUser) => {
        if (fUser.uid !== userID) {
          socket.close(4001, 'WRONG_ACCOUNT_CHECK');
          return;
        }

        if (!userListeners[userID]) userListeners[userID] = [];

        userListeners[userID][client.socketID] = (market, price) => {
          sendPacket(socket, P_TYPES.SERVER.MARKET, miakode.array.encode([market, price]));
          console.log('MARKET_VALUE =>', market, price);
        };

        socket.on('close', () => {
          delete userListeners[userID][client.socketID];
        });

        client.authenticated = true;
        console.log('=>', client);
      }).catch((e) => {
        console.log(e);
        socket.close(4001, 'WRONG_CREDENTIALS');
      });

      return;
    }

    if (msg.type === P_TYPES.CLIENT.SEARCH) {
      const parsed = miakode.string.decode(msg.data);
      const filter = ['stock', 'futures', 'forex', 'cfd', 'crypto', 'index', 'economic'][parsed[0]];
      const query = parsed.substring(1);

      const results = (await stocksAPI.search(query, filter))
        .map((m) => m.symbol)
        .filter((v, i, s) => s.indexOf(v) === i)
        .slice(0, 10);
      console.log('Search results', { filter, query }, results);
      sendPacket(socket, P_TYPES.SERVER.S_RESULTS, miakode.array.encode(results));
      return;
    }

    if (msg.type === P_TYPES.CLIENT.PONG) {
      pongTime = Date.now();
      pongPayload = msg.data;
      return;
    }

    console.log('Unknown packet', msg);
  });

  let pingPayload = null;
  let pingTime = null;
  const pingInterval = setInterval(() => {
    console.log('ping');
    if (pingPayload !== pongPayload) {
      socket.close(4000, 'TIMEOUT');
      return;
    }

    if (pongTime) console.log('Ping', pongTime - pingTime, 'ms');

    pingPayload = genPayload();
    pingTime = Date.now();
    sendPacket(socket, P_TYPES.SERVER.PING, pingPayload);
  }, 5000);

  socket.on('close', (code, desc) => {
    console.log('DISCONNECT', code, desc);
    clearInterval(pingInterval);
  });
});
