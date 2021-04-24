<template>
  <div v-if="fUser && !loading">
    <div class="container full withHead">
      <template v-if="!$route.params.market">
        <div class="block">
          <div class="title">Trades</div>

          <table v-if="trades.length > 0">
            <tr v-for="trade in trades"
              class="clickable"
              :key="trade.id"
              @click="selectPage(trade.market)"
            >
              <td>{{ trade.market }}</td>
              <td>(x{{ trade.lever }}) {{ trade.value }}</td>

              <td>{{ trade.openVal || 'Waiting...' }} €</td>
              <td>{{ trade.benefit || '0%' }}</td>
            </tr>
          </table>

          <div class="trades" v-if="trades && trades.length > 0">
            <div class="trade clickable"
              v-for="trade in trades"
              :key="trade.id"
              @click="selectPage(trade.market)"
            >
              <div>State: {{ trade.state }}</div>
              <div>Market: {{ trade.market }}</div>
              <div>Amount: {{ toEuro(trade.value) }} (x{{ Math.abs(trade.lever) }})</div>
              <div>TP: {{ toEuro(trade.TP) }}</div>
              <div>SL: {{ toEuro(trade.SL) }}</div>
              <div>Value: {{ toEuro(values[trade.market]) }}</div>
              -
              <div>Open: {{ toEuro(trade.openVal) }}</div>
              <div>OpenDate: {{ trade.openDate ? trade.openDate.seconds : '...' }}</div>

              <div>Close: {{ toEuro(trade.closeVal) }}</div>
              <div>CloseDate: {{ trade.closeDate ? trade.closeDate.seconds : '...' }}</div>
            </div>
          </div>

          <div v-else>No trade</div>

          <div class="searchContainer">
            <div class="inputLine triple">
              <select class="filters" v-model="searchFilter">
                <option v-for="(filter, i) in filters" :key="filter" :value="i">
                  {{ filter }}
                </option>
              </select>
              <input type="text" placeholder="Search market" v-model="search" @keyup="searchMarket">
              <!-- eslint-disable-next-line -->
              <svg viewBox="-1 0 18 16"><g fill="none" fill-rule="evenodd" stroke="currentColor"><circle cx="7.5" cy="7.5" r="6"></circle><path d="M11.5 11.5L15 15"></path></g></svg>
            </div>

            <div class="searchResults">
              <div class="twContainer result" v-for="symbol in searchResults" :key="symbol">
                <div class="right">
                  <div class="symbolText">{{symbol}}</div>
                  <!-- eslint-disable-next-line -->
                  <svg class="fav" :class="{ active: markets.includes(symbol) }" @click="fav(symbol)" viewBox="0 0 100 100"><path d="M80.18,36.52l-16.51-2.4-7.39-15A7,7,0,0,0,50,15.26h0a7,7,0,0,0-6.28,3.9l-7.39,15-16.51,2.4a7,7,0,0,0-3.88,11.94L27.89,60.11,25.07,76.55a7,7,0,0,0,10.16,7.38L50,76.17l14.77,7.76a7,7,0,0,0,10.16-7.38L72.11,60.11,84.06,48.46a7,7,0,0,0-3.88-11.94Zm-14,18.22a7,7,0,0,0-2,6.2l2.57,15L53.26,68.84a7,7,0,0,0-6.51,0L33.3,75.91l2.57-15a7,7,0,0,0-2-6.2L23,44.15,38,42a7,7,0,0,0,5.27-3.83L50,24.52l6.72,13.62A7,7,0,0,0,62,42l15,2.18Z"/></svg>
                </div>
                <iframe
                :src="'https://s.tradingview.com/embed-widget/mini-symbol'
                  + '-overview/?locale=fr#%7B%22symbol%22%3A%22' + symbol
                  + '%22%2C%22dateRange%22%3A%221m%22%2C%22colorTheme%22%'
                  + '3A%22dark%22%2C%22trendLineColor%22%3A%22%2300b176%2'
                  + '2%2C%22underLineColor%22%3A%22%2300b17630%22%2C%22au'
                  + 'tosize%22%3Atrue%7D'"
                  frameborder="0"
                ></iframe>
              </div>
            </div>
          </div>
        </div>

        <div class="separator"/>

        <div class="block">
          <div class="title">Transactions</div>

          <table v-if="transactions.length > 0">
            <tr v-for="transaction in transactions" :key="transaction.id">
              <td>{{ transaction.status }}</td>
              <td>{{ transaction.name }}</td>
              <td>{{ transaction.value }}</td>
            </tr>
          </table>

          <div v-else>No transactions</div>

          <div style="margin: 30px auto 0; max-width: 800px">
            <transactionForm/>
          </div>
        </div>

        <div class="separator"/>

        <accountSettings :fUser="fUser"/>

        <div class="separator"/>

        <div class="block">
          <div class="title">Delete account</div>
          <div class="button bigRed" @click="deleteAccount">Delete account</div>
        </div>
      </template>

      <router-view :trades="trades"/>
    </div>

    <div class="controls">
      <div class="statusBar">
        <menuBtn :active="menuOpen" @click="menuOpen = !menuOpen"/>
        <div class="path">
          <div class="step" style="font-size: 24px; font-weight: 900;" @click="selectPage()">
            CandleVault
          </div>
          <div class="step"
            v-for="step in path"
            :key="step.id"
            @click="selectPage(...step.path)">
            <!-- eslint-disable-next-line -->
            <svg viewBox="0 0 60 100"><path d="M5.271,100c-1.349,0-2.697-0.515-3.727-1.544c-2.059-2.059-2.059-5.395,0-7.454L42.546,50L1.544,8.998  c-2.059-2.059-2.059-5.395,0-7.454s5.395-2.059,7.454,0l44.729,44.729c2.059,2.059,2.059,5.395,0,7.454L8.998,98.456 C7.969,99.485,6.62,100,5.271,100z"/></svg>
            {{ step.name }}
          </div>
        </div>
      </div>

      <div class="sideMenu" :class="{ open: menuOpen }">
        <div class="rowButton" @click="selectPage()" :class="{ active: !$route.params.market }">
          <div class="topButton">
            <!-- eslint-disable-next-line -->
            <svg height="18" viewBox="0 0 120 100"><path d="M98.764,24.607L51.238,2.936c-0.683-0.31-1.79-0.31-2.472,0L1.241,24.607c-0.683,0.312-1.236,1.168-1.236,1.915v9.926h9.455 v44.633c0,0.747,0.605,1.352,1.352,1.352h13.513c0.747,0,1.352-0.604,1.352-1.352V36.448h16.216v44.633  c0,0.747,0.605,1.352,1.351,1.352h13.514c0.747,0,1.352-0.604,1.352-1.352V36.448h16.216v44.633c0,0.747,0.604,1.352,1.351,1.352  h13.515c0.747,0,1.352-0.604,1.352-1.352V36.448h1.351H100v-9.926C100,25.776,99.447,24.919,98.764,24.607z"/><path d="M94.595,97.297H5.405C2.42,97.297,0,94.877,0,91.892l0,0c0-2.984,2.42-5.405,5.405-5.405h89.189  c2.985,0,5.405,2.421,5.405,5.405l0,0C100,94.877,97.58,97.297,94.595,97.297z"/></svg>
            <div class="name">Home</div>
            <!-- eslint-disable-next-line -->
            <svg v-if="!$route.params.market" viewBox="0 0 60 100"><path d="M5.271,100c-1.349,0-2.697-0.515-3.727-1.544c-2.059-2.059-2.059-5.395,0-7.454L42.546,50L1.544,8.998 c-2.059-2.059-2.059-5.395,0-7.454s5.395-2.059,7.454,0l44.729,44.729c2.059,2.059,2.059,5.395,0,7.454L8.998,98.456 C7.969,99.485,6.62,100,5.271,100z"/></svg>
          </div>
        </div>

        <div class="menuItems">
          <!-- <div class="rowSeparator"/> -->
          <div class="noItems" v-if="markets.length === 0">No markets</div>

          <div class="rowButton twContainer"
            v-for="marketSymbol in markets"
            :key="marketSymbol"
          >
            <div class="right" @click="selectPage(marketSymbol)">
              <div></div>
              <!-- eslint-disable-next-line -->
              <svg class="fav" :class="{ active: markets.includes(marketSymbol) }" @click="fav(marketSymbol)" viewBox="0 0 100 100"><path d="M80.18,36.52l-16.51-2.4-7.39-15A7,7,0,0,0,50,15.26h0a7,7,0,0,0-6.28,3.9l-7.39,15-16.51,2.4a7,7,0,0,0-3.88,11.94L27.89,60.11,25.07,76.55a7,7,0,0,0,10.16,7.38L50,76.17l14.77,7.76a7,7,0,0,0,10.16-7.38L72.11,60.11,84.06,48.46a7,7,0,0,0-3.88-11.94Zm-14,18.22a7,7,0,0,0-2,6.2l2.57,15L53.26,68.84a7,7,0,0,0-6.51,0L33.3,75.91l2.57-15a7,7,0,0,0-2-6.2L23,44.15,38,42a7,7,0,0,0,5.27-3.83L50,24.52l6.72,13.62A7,7,0,0,0,62,42l15,2.18Z"/></svg>
              <div></div>
              <!-- eslint-disable-next-line -->
              <svg v-if="$route.params.market === marketSymbol" viewBox="0 -20 50 200"><path d="M5.271,100c-1.349,0-2.697-0.515-3.727-1.544c-2.059-2.059-2.059-5.395,0-7.454L42.546,50L1.544,8.998 c-2.059-2.059-2.059-5.395,0-7.454s5.395-2.059,7.454,0l44.729,44.729c2.059,2.059,2.059,5.395,0,7.454L8.998,98.456 C7.969,99.485,6.62,100,5.271,100z"/></svg>
            </div>
            <div class="iframeContainer">
              <iframe
                :src="'https://s.tradingview.com/embed-widget/mini-symbol'
                  + '-overview/?locale=fr#%7B%22symbol%22%3A%22' + marketSymbol
                  + '%22%2C%22dateRange%22%3A%221m%22%2C%22colorTheme%22%'
                  + '3A%22dark%22%2C%22trendLineColor%22%3A%22%2300b176%2'
                  + '2%2C%22underLineColor%22%3A%22%2300b17630%22%2C%22au'
                  + 'tosize%22%3Atrue%7D'"
                  frameborder="0"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="blur" :class="{ active: menuOpen }" @click="menuOpen = false"/>
    </div>
  </div>
  <login v-else-if="!loading"/>
  <loader v-else/>
</template>

<script>
import login from './login.vue';
import loader from './components/loader.vue';
import menuBtn from './components/menuBtn.vue';
import onSwipe from './lib/onSwipe';
import miakode from './lib/miakode';

import accountSettings from './settings/account.vue';
import transactionForm from './components/transactionForm.vue';

/** @type {import('firebase').default.auth.Auth} */
const auth = window.auth;

/** @type {import('firebase').default.firestore.Firestore} */
const db = window.db;

/** @type {import('izitoast').IziToast} */
const toast = window.toast;
const toastErr = (err) => toast.error({ title: err.message });

export default {
  name: 'CandleVault',
  components: {
    login,
    loader,
    menuBtn,

    accountSettings,
    transactionForm,
  },

  data: () => ({
    loading: true,
    fUser: null,
    socket: null,

    trades: JSON.parse(localStorage.getItem('trades') || '[]'),
    markets: JSON.parse(localStorage.getItem('markets') || '[]'),
    transactions: JSON.parse(localStorage.getItem('transactions') || '[]'),
    values: JSON.parse(sessionStorage.getItem('marketValues') || '{}'),

    lastUpdate: { symbol: '', value: 0 },

    filters: ['Stock', 'Futures', 'Forex', 'CFD', 'Crypto', 'Index', 'Economic'],
    searchFilter: JSON.parse(localStorage.getItem('searchFilter') || 0),
    search: '',
    searchResults: [],

    menuOpen: false,
  }),

  created() {
    auth.onAuthStateChanged((fUser) => {
      if (fUser) {
        this.fUser = { ...fUser };
        this.listenTrades();
        this.listenMarkets();
        this.listenTransactions();
      }
    });

    auth.onIdTokenChanged((fUser) => {
      if (fUser) {
        console.log('Signed', fUser);
        this.fUser = { ...fUser };
        this.connectSocket();
      } else this.loading = false;
    });

    onSwipe((direction) => {
      if (direction === 'right') this.menuOpen = true;
      else if (direction === 'left') this.menuOpen = false;
    });
  },

  methods: {
    selectPage(market = '', action = '') {
      if (!market) this.$router.push('/');
      else if (!action) this.$router.push(`/${market}`);
      else this.$router.push(`/${market}/${action}`);

      localStorage.setItem('lastMarket', market);
      this.menuOpen = false;
    },

    toEuro(val) {
      return !val
        ? '... €'
        : new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(val);
    },

    searchMarket() {
      if (!this.search) this.searchResults = [];
      if (!this.socket || !this.search) return;
      this.sendPacket('\x12', miakode.string.encode(`${this.searchFilter}${this.search}`));
    },

    async fav(market) {
      const markets = this.markets;
      if (markets.includes(market)) markets.splice(markets.indexOf(market), 1);
      else markets.push(market);

      await db.collection('candlevault_users').doc(auth.currentUser.uid).update({ markets });
      auth.updateCurrentUser(auth.currentUser);
    },

    connectSocket() {
      if (this.socket && this.socket.close) this.socket.close();

      this.socket = new WebSocket('wss://stock-candlevault.cloud.usp-3.fr/');

      this.socket.onopen = async () => {
        this.sendPacket('\x11', miakode.array.encode([
          auth.currentUser.uid,
          await auth.currentUser.getIdToken(),
        ]));
      };

      this.socket.onerror = () => {};

      this.socket.onclose = (ev) => {
        if (ev.wasClean) {
          if (ev.reason) toast.error({ title: ev.reason });
        } else setTimeout(this.connectSocket, 300);

        console.log('CLOSED', ev, ev.code, ev.wasClean);
      };

      this.socket.onmessage = async (ev) => {
        const packet = await ev.data.text();
        const type = packet[0];
        const data = packet.substring(1);

        switch (type) {
          case '\x00': // PING
            console.log('Ping', data);
            this.sendPacket('\x10', data);
            break;

          case '\x01': // MARKET
            [this.lastUpdate.symbol, this.lastUpdate.value] = miakode.array.decode(data);
            this.values[this.lastUpdate.symbol] = this.lastUpdate.value;
            sessionStorage.setItem('marketValues', JSON.stringify(this.values));
            console.log('Market', this.values);
            break;

          case '\x02': // SEARCH RESULTS
            this.searchResults = miakode.array.decode(data).filter((s) => s);
            console.log('Search results', this.searchResults);
            break;

          default:
            console.log('Unknown packet', type, data);
            break;
        }
      };
    },

    sendPacket(...chunks) {
      if (this.socket) this.socket.send(new Blob(chunks));
    },

    listenTrades() {
      db.collection('candlevault_trades')
        .where('user', '==', auth.currentUser.uid)
        .onSnapshot((snap) => {
          this.trades = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

          console.log('Trades =>', this.trades);
          localStorage.setItem('trades', JSON.stringify(this.trades));
        });

      const lastMarket = localStorage.getItem('lastMarket');
      if (lastMarket && !this.$route.params.market) this.$router.push(`/${lastMarket}`);

      this.loading = false;
    },

    listenMarkets() {
      db.collection('candlevault_users').doc(auth.currentUser.uid).onSnapshot((snap) => {
        this.markets = snap.get('markets') || [];

        console.log('Markets', this.markets);
        localStorage.setItem('markets', JSON.stringify(this.markets));
      });
    },

    listenTransactions() {
      db.collection('candlevault_transactions')
        .where('from', '==', auth.currentUser.uid)
        .onSnapshot((snap) => { this.updateTransactions(snap.docs); });

      db.collection('candlevault_transactions')
        .where('to', '==', auth.currentUser.uid)
        .onSnapshot((snap) => { this.updateTransactions(snap.docs); });
    },

    updateTransactions(transactions) {
      transactions.forEach((doc) => {
        const dI = this.transactions.findIndex((t) => t.id === doc.id);
        const transaction = { id: doc.id, ...doc.data(), date: doc.get('date').seconds };
        if (dI >= 0) this.transactions[dI] = transaction;
        else this.transactions.push(transaction);
      });

      this.transactions = this.transactions.sort((a, b) => b.date - a.date);
      localStorage.setItem('transactions', JSON.stringify(this.transactions));
    },

    deleteAccount() {
      toast.confirm('Are you sure you want to delete your account ? This action is irreversible.', () => {
        if (this.trades.length === 0) {
          auth.currentUser.delete().then(() => window.location.reload()).catch(toastErr);
        } else toast.warning({ title: 'Please close all your trades before deleting your account' });
      }, { icon: 'ico-warning' });
    },
  },

  computed: {
    path() {
      const market = this.$route.params.market;
      if (!market) return [{ name: 'Dashboard', color: '#dddddd', path: [] }];
      const action = this.$route.params.action;

      return action ? [
        { name: market, path: [market] },
        { name: action, path: [market, action] },
      ] : [
        { name: market, path: [market] },
      ];
    },
  },

  watch: {
    searchFilter() {
      localStorage.setItem('searchFilter', this.searchFilter);
      this.searchMarket();
    },
  },
};
</script>

<style scoped>

.searchContainer {
  margin: 20px auto 0;
  max-width: 700px;
}

select.filters {
  text-align-last: center;
  border-right: solid 1px var(--color4);
  padding: 0 5px;
}

.twContainer > .right {
  position: absolute;
  border-radius: 3px;
  border: solid 1px var(--color4);
  display: grid;
  justify-content: end;
  grid-template: auto / auto 50px;
}

.result > .right {
  width: calc(100% - 80px);
  height: 55px;
}

.twContainer.rowButton > .right {
  width: calc(100% - 100px);
  height: 90px;
  padding: 0;
  grid-template: auto auto / auto 40px;
}

.twContainer > .right > div {
  display: grid;
  align-items: center;
}

.symbolText {
  opacity: 0.4;
}

.fav {
  background-color: var(--color3);
  fill: var(--color1);
  padding: 9px;
  height: 50px;
  cursor: pointer;
}

.rowButton .fav {
  height: 40px;
  padding: 5px;
}

.fav.active { fill: var(--color8) !important }

.iframeContainer {
  height: 90px;
  padding: 0;
  border: 0;
  margin-top: 2px;
}

.iframeContainer iframe {
  height: 90px;
}

.searchResults iframe {
  height: 55px;
  width: 100%;
}

@media screen and (max-width: 410px) {
  .symbolText { opacity: 0 }
}

@media screen and (max-width: 500px) {
  .result > .right { width: calc(100% - 50px) }
}

@media screen and (min-width: 797px) and (max-width: 999px) {
  .result > .right { width: 700px }

  .fav:not(.active):hover { fill: var(--color7-s) !important }
  .fav.active:hover { fill: var(--error) !important }
}

@media screen and (min-width: 1000px) and (max-width: 1096px) {
  .result > .right { width: calc(100% - 380px) }
}

@media screen and (min-width: 1097px) {
  .result > .right { width: 700px }
}

@media screen and (min-width: 1000px) {
  .container { padding-left: 320px }
}
</style>
