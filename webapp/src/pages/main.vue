<template>
  <div v-if="fUser && !loading">
    <div class="container full withHead">
      <template v-if="!$route.params.market">

        <div class="money" :class="{
          red: user.money < 0,
          yellow: user.money == 0,
          green: user.money > 0,
        }">
          {{ toEuro(user.money) }}
        </div>

        <div class="gridable">
          <div class="block">
            <div class="title">Markets</div>

            <div class="searchContainer">
              <div class="inputLine triple">
                <select class="filters" v-model="searchFilter">
                  <option v-for="(filter, i) in filters" :key="filter" :value="i">
                    {{ filter }}
                  </option>
                </select>
                <input type="text"
                  placeholder="Search market"
                  v-model="search"
                  @keyup="searchMarket"
                >
                <!-- eslint-disable-next-line -->
                <svg viewBox="-1 0 18 16"><g fill="none" fill-rule="evenodd" stroke="currentColor"><circle cx="7.5" cy="7.5" r="6"></circle><path d="M11.5 11.5L15 15"></path></g></svg>
              </div>

              <div class="searchResults">
                <div class="twContainer result" v-for="symbol in searchResults" :key="symbol">
                  <div class="right">
                    <div class="symbolText">{{symbol}}</div>
                    <!-- eslint-disable-next-line -->
                    <svg class="fav" :class="{ active: user.markets.includes(symbol) }" @click="fav(symbol)" viewBox="0 0 100 100"><path d="M80.18,36.52l-16.51-2.4-7.39-15A7,7,0,0,0,50,15.26h0a7,7,0,0,0-6.28,3.9l-7.39,15-16.51,2.4a7,7,0,0,0-3.88,11.94L27.89,60.11,25.07,76.55a7,7,0,0,0,10.16,7.38L50,76.17l14.77,7.76a7,7,0,0,0,10.16-7.38L72.11,60.11,84.06,48.46a7,7,0,0,0-3.88-11.94Zm-14,18.22a7,7,0,0,0-2,6.2l2.57,15L53.26,68.84a7,7,0,0,0-6.51,0L33.3,75.91l2.57-15a7,7,0,0,0-2-6.2L23,44.15,38,42a7,7,0,0,0,5.27-3.83L50,24.52l6.72,13.62A7,7,0,0,0,62,42l15,2.18Z"/></svg>
                  </div>
                  <div style="cursor:pointer" @click="selectPage(symbol)">
                    <TradingView type="single-quote" :symbol="symbol"/>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="separator"/>

          <wallet :trades="trades" :values="values"/>

          <div class="separator"/>

          <div class="block">
            <div class="title">Trends</div>
              <TradingView type="hotlists"
                :style="{ width: '100%', height: '590px', 'margin-top': '-30px' }"
              />
          </div>

          <div class="separator"/>

          <transactionForm :fUser="fUser" :user="user"/>

          <div class="separator"/>

          <transactionList :fUser="fUser" :transactions="transactions"/>
        </div>

        <div class="separator"/>

        <accountSettings :fUser="fUser"/>

        <div class="separator"/>

        <div class="block">
          <div class="title">Delete account</div>
          <div class="button bigRed" @click="deleteAccount">Delete account</div>
        </div>
      </template>

      <template v-else>
        <router-view :fUser="fUser" :user="user" :trades="trades" :values="values"/>
      </template>
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
            <svg height="18" viewBox="0 0 120 100"><path d="M59.4,37.7c-4.7,0-8.5,3.8-8.5,8.5c0,4.7,3.8,8.5,8.5,8.5c4.7,0,8.5-3.8,8.5-8.5C67.9,41.5,64.1,37.7,59.4,37.7z"/><path d="M86.7,9H13.3c-6,0-10.8,4.9-10.8,10.8v53.1c0,6,4.9,10.8,10.8,10.8h3.1l1.2,4.8C18,90,19.3,91,20.8,91h10.5 c1.5,0,2.7-1,3.1-2.4l1.2-4.8h28.8l1.2,4.8C66,90,67.3,91,68.8,91h10.5c1.5,0,2.7-1,3.1-2.4l1.2-4.8h3.1c6,0,10.8-4.9,10.8-10.8 V19.8C97.5,13.9,92.6,9,86.7,9z M19,27.7c0-1.7,1.4-3.1,3.1-3.1s3.1,1.4,3.1,3.1v37.5c0,1.7-1.4,3.1-3.1,3.1S19,66.8,19,65.1 V27.7z M62.3,64.7c0,1.7-1.4,3.1-3.1,3.1c-1.7,0-3.1-1.4-3.1-3.1v-4.1c-1.7-0.4-3.4-1.1-4.8-2.1l-2.9,2.9 c-0.6,0.6-1.4,0.9-2.2,0.9c-0.8,0-1.6-0.3-2.2-0.9c-1.2-1.2-1.2-3.2,0-4.4l3-3c-0.9-1.5-1.6-3.1-1.9-4.8h-4.2 c-1.7,0-3.1-1.4-3.1-3.1s1.4-3.1,3.1-3.1h4.3c0.4-1.7,1.1-3.3,2-4.8l-3-3c-1.2-1.2-1.2-3.2,0-4.4c1.2-1.2,3.2-1.2,4.4,0l3,3 c1.4-0.9,3.1-1.6,4.8-2v-4.2c0-1.7,1.4-3.1,3.1-3.1s3.1,1.4,3.1,3.1v4.2c1.8,0.4,3.4,1.1,4.8,2l2.9-2.9c1.2-1.2,3.2-1.2,4.4,0 c1.2,1.2,1.2,3.2,0,4.4l-2.9,2.9c1,1.5,1.7,3.1,2,4.9h4c1.7,0,3.1,1.4,3.1,3.1c0,1.7-1.4,3.1-3.1,3.1h-4 c-0.4,1.8-1.1,3.4-2.1,4.9l2.8,2.8c1.2,1.2,1.2,3.2,0,4.4c-0.6,0.6-1.4,0.9-2.2,0.9s-1.6-0.3-2.2-0.9l-2.9-2.9 c-1.5,0.9-3.1,1.6-4.9,2V64.7z"/></svg>
            <div class="name">Vault</div>
            <!-- eslint-disable-next-line -->
            <svg v-if="!$route.params.market" viewBox="0 0 60 100"><path d="M5.271,100c-1.349,0-2.697-0.515-3.727-1.544c-2.059-2.059-2.059-5.395,0-7.454L42.546,50L1.544,8.998 c-2.059-2.059-2.059-5.395,0-7.454s5.395-2.059,7.454,0l44.729,44.729c2.059,2.059,2.059,5.395,0,7.454L8.998,98.456 C7.969,99.485,6.62,100,5.271,100z"/></svg>
          </div>
        </div>

        <div class="menuItems">
          <!-- <div class="rowSeparator"/> -->
          <div class="noItems" v-if="user.markets.length === 0">No markets</div>

          <div class="rowButton twContainer"
            v-for="symbol in user.markets"
            :key="symbol"
          >
            <div class="right">
              <div></div>
              <!-- eslint-disable-next-line -->
              <svg class="fav" :class="{ active: user.markets.includes(symbol) }" @click="unFav(symbol)" viewBox="0 0 100 100"><path d="M80.18,36.52l-16.51-2.4-7.39-15A7,7,0,0,0,50,15.26h0a7,7,0,0,0-6.28,3.9l-7.39,15-16.51,2.4a7,7,0,0,0-3.88,11.94L27.89,60.11,25.07,76.55a7,7,0,0,0,10.16,7.38L50,76.17l14.77,7.76a7,7,0,0,0,10.16-7.38L72.11,60.11,84.06,48.46a7,7,0,0,0-3.88-11.94Zm-14,18.22a7,7,0,0,0-2,6.2l2.57,15L53.26,68.84a7,7,0,0,0-6.51,0L33.3,75.91l2.57-15a7,7,0,0,0-2-6.2L23,44.15,38,42a7,7,0,0,0,5.27-3.83L50,24.52l6.72,13.62A7,7,0,0,0,62,42l15,2.18Z"/></svg>
              <div></div>
              <!-- eslint-disable-next-line -->
              <svg v-if="$route.params.market === symbol" viewBox="0 -20 50 200"><path d="M5.271,100c-1.349,0-2.697-0.515-3.727-1.544c-2.059-2.059-2.059-5.395,0-7.454L42.546,50L1.544,8.998 c-2.059-2.059-2.059-5.395,0-7.454s5.395-2.059,7.454,0l44.729,44.729c2.059,2.059,2.059,5.395,0,7.454L8.998,98.456 C7.969,99.485,6.62,100,5.271,100z"/></svg>
            </div>
            <div class="iframeContainer" @click="selectPage(symbol)">
              <TradingView type="mini-symbol-overview" :symbol="symbol"/>
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
import TradingView from './components/TradingView.vue';
import transactionForm from './components/transactionForm.vue';
import transactionList from './components/transactionList.vue';
import wallet from './components/wallet.vue';

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

    TradingView,
    accountSettings,
    transactionForm,
    transactionList,
    wallet,
  },

  data: () => ({
    loading: true,
    fUser: null,
    socket: null,

    trades: JSON.parse(localStorage.getItem('trades') || '[]'),
    user: JSON.parse(localStorage.getItem('user') || 0) || { markets: [], money: 0 },
    transactions: JSON.parse(localStorage.getItem('transactions') || '[]'),
    values: JSON.parse(sessionStorage.getItem('marketValues') || '{}'),

    lastUpdate: { symbol: '', value: 0 },

    filters: ['Stock', 'Futures', 'Forex', 'CFD', 'Crypto', 'Index', 'Economic'],
    searchFilter: JSON.parse(localStorage.getItem('searchFilter') || 0),
    search: '',
    searchResults: [],

    menuOpen: false,
    lang: navigator.language.split('-')[0] || 'en',
  }),

  created() {
    auth.onAuthStateChanged(async (fUser) => {
      if (fUser) {
        this.fUser = { ...fUser };
        this.listenUser();
        this.listenTrades();
        this.listenTransactions();
      }
    });

    auth.onIdTokenChanged((fUser) => {
      if (fUser) {
        console.log('Signed =>', fUser);
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
    selectPage(market = '', page = '') {
      if (!market) this.$router.push('/');
      else if (page) this.$router.push(`/${market}/${page}`);
      else this.$router.push(`/${market}/${this.$route.params.page || 'Trades'}`);

      localStorage.setItem('lastMarket', market);
      this.menuOpen = false;
    },

    searchMarket() {
      if (!this.search) this.searchResults = [];
      if (!this.socket || !this.search) return;
      this.sendPacket('\x12', miakode.string.encode(`${this.searchFilter}${this.search}`));
    },

    toEuro(val) {
      return new Intl.NumberFormat(navigator.languages, {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: (val < 10 ** 6 ? 2 : 0),
      }).format(val || 0);
    },

    fav(market) {
      const markets = this.user.markets;
      if (markets.includes(market)) markets.splice(markets.indexOf(market), 1);
      else markets.push(market);

      db.collection('candlevault_users').doc(auth.currentUser.uid).update({ markets });
    },

    unFav(market) {
      toast.confirm(
        `Are you sure you want to remove ${market} from your favourites markets ?`,
        () => this.fav(market),
      );
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
            this.sendPacket('\x10', data);
            break;

          case '\x01': // MARKET
            [this.lastUpdate.symbol, this.lastUpdate.value] = miakode.array.decode(data);
            this.values[this.lastUpdate.symbol] = this.lastUpdate.value;
            sessionStorage.setItem('marketValues', JSON.stringify(this.values));
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
          this.trades = snap.docs
            .map((doc) => ({ id: doc.id, openDate: { seconds: 10 ** 10 }, ...doc.data() }))
            .sort((a, b) => b.openDate.seconds - a.openDate.seconds);

          console.log('Trades =>', this.trades);
          localStorage.setItem('trades', JSON.stringify(this.trades));
        });

      const lastMarket = localStorage.getItem('lastMarket');
      if (lastMarket && !this.$route.params.market) this.$router.push(`/${lastMarket}`);

      this.loading = false;
    },

    async listenUser() {
      const userDoc = db.collection('candlevault_users').doc(auth.currentUser.uid);
      if (!(await userDoc.get()).exists) userDoc.set({ money: 0, markets: [] });

      userDoc.onSnapshot((snap) => {
        this.user.markets = snap.get('markets') || [];
        this.user.money = snap.get('money') || 0;

        console.log('Markets =>', this.user);
        localStorage.setItem('user', JSON.stringify({
          money: this.user.money,
          markets: this.user.markets,
        }));
      });
    },

    listenTransactions() {
      db.collection('candlevault_transactions')
        .where('from', '==', auth.currentUser.uid)
        .onSnapshot((snap) => { this.updateTransactions(snap.docChanges()); });

      db.collection('candlevault_transactions')
        .where('to', '==', auth.currentUser.uid)
        .onSnapshot((snap) => { this.updateTransactions(snap.docChanges()); });
    },

    updateTransactions(changes) {
      changes.forEach(({ doc, type }) => {
        const transaction = { id: doc.id, date: { seconds: 10 ** 10 }, ...doc.data() };
        const dI = this.transactions.findIndex((t) => t.id === doc.id);

        if (type === 'added' && dI === -1) this.transactions.push(transaction);
        else if (type === 'modified' && dI !== -1) this.transactions[dI] = transaction;
        else if (type === 'removed' && dI !== -1) this.transactions.splice(dI, 1);
      });

      this.transactions = this.transactions.sort((a, b) => b.date.seconds - a.date.seconds);
      localStorage.setItem('transactions', JSON.stringify(this.transactions));
    },

    deleteAccount() {
      toast.confirm('Are you sure you want to delete your account ? This action is irreversible.', () => {
        if (this.trades.length === 0) {
          auth.currentUser.delete().then(() => {
            localStorage.removeItem('trades');
            localStorage.removeItem('user');
            localStorage.removeItem('transactions');
            window.location.reload();
          }).catch(toastErr);
        } else toast.warning({ title: 'Please close all your trades before deleting your account' });
      }, { icon: 'ico-warning' });
    },
  },

  computed: {
    path() {
      const market = this.$route.params.market;
      if (!market) return [{ name: 'Dashboard', color: '#dddddd', path: [] }];
      const page = this.$route.params.page;

      return [
        { name: market, path: [market, page] },
        { name: page, path: [market, page] },
      ];
    },
  },

  watch: {
    searchFilter() {
      localStorage.setItem('searchFilter', this.searchFilter);
      this.searchMarket();
    },

    menuOpen() {
      document.body.className = (this.menuOpen ? 'noScroll' : '');
    },
  },
};
</script>

<style scoped>
.money {
  background-color: var(--color3);
  border-radius: 50%;
  width: 250px;
  margin: 50px auto 80px;
  line-height: 250px;
  font-size: 35px;
  user-select: none;
}

.money.red {
  color: var(--red);
  box-shadow: 3px 3px 8px #0000002e, inset 0 0 0 5px var(--red);
}

.money.yellow {
  color: var(--yellow);
  box-shadow: 3px 3px 8px #0000002e, inset 0 0 0 5px var(--yellow);
}

.money.green {
  color: var(--green);
  box-shadow: 3px 3px 8px #0000002e, inset 0 0 0 5px var(--green);
}
.money.red:hover { box-shadow: 3px 3px 8px #0000002e, inset 0 0 0 200px var(--red) }
.money.yellow:hover { box-shadow: 3px 3px 8px #0000002e, inset 0 0 0 200px var(--yellow) }
.money.green:hover { box-shadow: 3px 3px 8px #0000002e, inset 0 0 0 200px var(--green) }

.money:hover { color: var(--color3); }

.searchContainer {
  margin: 20px auto 0;
  max-width: 500px;
}

select.filters {
  text-align-last: center;
  padding: 0 5px;
}

.twContainer > .right {
  position: absolute;
  border-radius: 3px;
  display: grid;
  justify-content: end;
  grid-template: auto / auto 50px;
  border: solid 1px var(--color4);
}

.right {
  width: calc(100% - 80px);
  height: 55px;
  pointer-events: none;
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
  pointer-events: all;
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
  pointer-events: none;
}

.searchResults iframe {
  height: 55px;
  width: 100%;
  pointer-events: none;
}

@media screen and (max-width: 410px) {
  .symbolText { opacity: 0 }
}

@media screen and (max-width: 380px) {
  .result > .right { width: calc(100% - 42px) }
}

@media screen and (min-width: 600px) {
  .result > .right { width: 500px }

  .fav:not(.active):hover { fill: var(--color7-s) !important }
  .fav.active:hover { fill: var(--red) !important }
}

@media screen and (min-width: 1097px) {
  .result > .right { width: 500px }
}

@media screen and (min-width: 1000px) {
  .container { padding-left: 320px }
}
</style>
