<template>
  <div class="market">
    <TradingView v-show="$route.params.page === 'Chart'" type="chart" id="market_chart"/>
    <!-- eslint-disable-next-line -->
    <svg v-show="$route.params.page === 'Chart'" class="fav" :class="{ active: user.markets.includes($route.params.market) }" @click="fav()" viewBox="0 0 100 100"><path d="M80.18,36.52l-16.51-2.4-7.39-15A7,7,0,0,0,50,15.26h0a7,7,0,0,0-6.28,3.9l-7.39,15-16.51,2.4a7,7,0,0,0-3.88,11.94L27.89,60.11,25.07,76.55a7,7,0,0,0,10.16,7.38L50,76.17l14.77,7.76a7,7,0,0,0,10.16-7.38L72.11,60.11,84.06,48.46a7,7,0,0,0-3.88-11.94Zm-14,18.22a7,7,0,0,0-2,6.2l2.57,15L53.26,68.84a7,7,0,0,0-6.51,0L33.3,75.91l2.57-15a7,7,0,0,0-2-6.2L23,44.15,38,42a7,7,0,0,0,5.27-3.83L50,24.52l6.72,13.62A7,7,0,0,0,62,42l15,2.18Z"/></svg>

    <action v-show="$route.params.page === 'Trades'"
      :user="user"
      :fUser="fUser"
      :trades="trades"
      :values="values"
      :TAResults="TAResults"
    />

    <div class="bottomTabs">
      <div class="bottomTab"
        :class="{ selected: $route.params.page === 'Chart' }"
        @click="$router.push(`/${$route.params.market}/Chart`)"
      >
        <!-- eslint-disable-next-line -->
        <svg viewBox="-5 0 110 100"><path d="M95.5,59.2l-17.1-1.1c-1.8-0.1-2.9,1.8-1.9,3.3l3.4,5.1L55.1,83.2L46,69.5c-1.3-2-4-2.5-5.9-1.2L9.7,88.7 c-2,1.3-2.5,4-1.2,5.9c1.3,2,4,2.5,5.9,1.2l26.8-18l9.1,13.6c1.3,2,4,2.5,5.9,1.2l28.3-19l3.4,5.1c1,1.5,3.2,1.2,3.8-0.5L97.4,62 C97.8,60.7,96.9,59.3,95.5,59.2z"/><path d="M8.5,72.8c0,1.2,1,2.2,2.2,2.2s2.2-1,2.2-2.2v-4.4H17c1,0,1.9-0.9,1.9-1.9V40.2c0-1.1-0.9-1.9-1.9-1.9h-4.1v-4.4 c0-1.2-1-2.2-2.2-2.2s-2.2,1-2.2,2.2v4.4H4.4c-1,0-1.9,0.8-1.9,1.9v26.3c0,1,0.8,1.9,1.9,1.9h4.1V72.8z"/><path d="M75,40.1h4.1v4.4c0,1.2,1,2.2,2.2,2.2c1.2,0,2.2-1,2.2-2.2v-4.4h4.1c1,0,1.9-0.9,1.9-1.9V12c0-1.1-0.9-1.9-1.9-1.9h-4.1 V5.7c0-1.2-1-2.2-2.2-2.2c-1.2,0-2.2,1-2.2,2.2v4.4H75c-1,0-1.9,0.8-1.9,1.9v26.3C73.1,39.3,73.9,40.1,75,40.1z"/><path d="M39.7,50.4h4.1v4.4c0,1.2,1,2.2,2.2,2.2c1.2,0,2.2-1,2.2-2.2v-4.4h4.1c1,0,1.9-0.9,1.9-1.9V22.3c0-1-0.8-1.9-1.9-1.9 h-4.1V16c0-1.2-1-2.2-2.2-2.2c-1.2,0-2.2,1-2.2,2.2v4.4h-4.1c-1,0-1.9,0.9-1.9,1.9v26.3C37.8,49.6,38.6,50.4,39.7,50.4z"/></svg>
      </div>
      <div class="bottomTab"
        :class="{ selected: $route.params.page === 'Trades' }"
        @click="$router.push(`/${$route.params.market}/Trades`)"
      >
        <!-- eslint-disable-next-line -->
        <svg viewBox="5 0 90 100"><path d="M92.3,13.4c0,0-11.3,0-19.3,0c-0.9,0-3,0-6.1,0c-16.6,0-59.1,0-59.1,0c-1.6,0-2.8,1.3-2.8,2.8V28v55.7 c0,0.6,0.2,1.1,0.5,1.6c0.5,0.8,1.4,1.2,2.3,1.2l0,0h84.4l0,0c1,0,1.8-0.5,2.3-1.2c0.3-0.4,0.5-1,0.5-1.6V28V16.2 C95.1,14.7,93.8,13.4,92.3,13.4z M7.9,83.8V16.2h59.1H73h19.3v67.5H7.9z"/><path d="M44.1,51.6h-27c-0.9,0-1.6-0.7-1.6-1.6c0-0.9,0.7-1.6,1.6-1.6h27c0.9,0,1.6,0.7,1.6,1.6C45.7,50.9,44.9,51.6,44.1,51.6z"/><path d="M44.1,62.2h-27c-0.9,0-1.6-0.7-1.6-1.6c0-0.9,0.7-1.6,1.6-1.6h27c0.9,0,1.6,0.7,1.6,1.6C45.7,61.5,45,62.2,44.1,62.2z"/><path d="M44.1,72.6h-27c-0.9,0-1.6-0.7-1.6-1.6s0.7-1.6,1.6-1.6h27c0.9,0,1.6,0.7,1.6,1.6S45,72.6,44.1,72.6z"/><path d="M44.1,41.1h-27c-0.9,0-1.6-0.7-1.6-1.6c0-0.9,0.7-1.6,1.6-1.6h27c0.9,0,1.6,0.7,1.6,1.6C45.7,40.4,44.9,41.1,44.1,41.1z"/><path d="M44.1,30.6h-27c-0.9,0-1.6-0.7-1.6-1.6c0-0.9,0.7-1.6,1.6-1.6h27c0.9,0,1.6,0.7,1.6,1.6C45.7,29.9,44.9,30.6,44.1,30.6z"/><path d="M83,51.6H56c-0.9,0-1.6-0.7-1.6-1.6c0-0.9,0.7-1.6,1.6-1.6h27c0.9,0,1.6,0.7,1.6,1.6C84.5,50.9,83.8,51.6,83,51.6z"/><path d="M83,62.2H56c-0.9,0-1.6-0.7-1.6-1.6c0-0.9,0.7-1.6,1.6-1.6h27c0.9,0,1.6,0.7,1.6,1.6C84.6,61.5,83.9,62.2,83,62.2z"/><path d="M83,72.6H56c-0.9,0-1.6-0.7-1.6-1.6s0.7-1.6,1.6-1.6h27c0.9,0,1.6,0.7,1.6,1.6S83.9,72.6,83,72.6z"/><path d="M83,41.1H56c-0.9,0-1.6-0.7-1.6-1.6c0-0.9,0.7-1.6,1.6-1.6h27c0.9,0,1.6,0.7,1.6,1.6C84.5,40.4,83.8,41.1,83,41.1z"/><path d="M83,30.6H56c-0.9,0-1.6-0.7-1.6-1.6c0-0.9,0.7-1.6,1.6-1.6h27c0.9,0,1.6,0.7,1.6,1.6C84.5,29.9,83.8,30.6,83,30.6z"/></svg>
      </div>
    </div>
  </div>
</template>

<script>
import action from './marketTrades.vue';
import TradingView from './components/TradingView.vue';

/** @type {import('firebase').default.auth.Auth} */
const auth = window.auth;

/** @type {import('firebase').default.firestore.Firestore} */
const db = window.db;

export default {
  name: 'Market',

  components: { action, TradingView },

  props: {
    user: Object,
    fUser: Object,
    trades: Array,
    values: Object,
    TAResults: Array,
  },

  beforeCreate() {
    const market = (this.$route.params.market).toUpperCase();
    if (market === 'TRADES') return;
    if (market !== this.$route.params.market) this.$router.push(`/${market}/${this.$route.params.page}`);

    if (!['Trades', 'Chart'].includes(this.$route.params.page)) {
      this.$router.push(`/${this.$route.params.market}/Trades`);
    }
  },

  methods: {
    gotoTrades() {
      this.$router.push(`/${this.$route.params.market}/Trades`);
    },

    fav() {
      const markets = this.user.markets;
      const market = this.$route.params.market;
      if (markets.includes(market)) markets.splice(markets.indexOf(market), 1);
      else markets.push(market);

      db.collection('candlevault_users').doc(auth.currentUser.uid).update({ markets });
    },
  },
};
</script>

<style scoped>
#market_chart {
  position: fixed;
  top: 55px;
  left: 0;
  width: 100%;
  height: calc(100% - 100px);
}

.fav {
  cursor: pointer;
  position: fixed;
  bottom: 50px;
  left: 0;
  width: 50px;
  padding: 8px;
  fill: var(--color1);
}

.fav.active {
  fill: var(--color8) !important;
}

@media screen and (min-width: 1000px) {
  #market_chart {
    left: 300px;
    width: calc(100% - 300px);
  }
}
</style>

<style>
.bottomTabs {
  cursor: pointer;
  position: fixed;
  bottom: 0;
  left: 0;
  height: 45px;
  width: 100%;
  background-color: var(--color3);
  box-shadow: var(--color2) 0 2px 7px;
  display: grid;
  grid-template-columns: 50% 50%;
  opacity: 0.8;
}

.bottomTab {
  height: 100%;
  display: grid;
  align-items: center;
}

.bottomTab.selected {
  background-color: var(--color7);
}

.bottomTab svg {
  height: 100%;
  width: 30px;
  margin: 0 auto;
  fill: var(--font);
}

@media screen and (min-width: 1000px) {
  .bottomTabs {
    left: 300px;
    width: calc(100% - 300px);
  }
}
</style>
