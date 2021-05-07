<template>
  <div class="market">
    <div class="block">
      <div class="title">Techinal analysis</div>
      <div class="TAContainer" v-if="TAResults.length > 0">
        <div class="firstColumn">
          <div>Interval</div>
          <div>1 minute</div>
          <div>5 minute</div>
          <div>15 minute</div>
          <div>1 hour</div>
          <div>4 hours</div>
          <div>1 day</div>
          <div>1 week</div>
          <div>1 month</div>
        </div>
        <div class="valuesGrid">
          <div>ALL</div>
          <div>MA</div>
          <div>OSC</div>
          <div class="item"
            v-for="(v, i) in TAResults"
            :key="i"
            :class="{
              strong: Math.abs(v) > 1,
              sell: v < -0.5,
              buy: v > 0.5,
              neutral: Math.abs(v) <= 0.5,
            }"
          >{{ formatNumber(v) }}</div>
        </div>
      </div>
      <div v-else>Loading...</div>
    </div>

    <div class="separator"/>

    <div class="tabs">
      <div class="tab" :class="{ selected: buy }"
        @click="buy = true">Buy</div>
      <div class="tab" :class="{ selected: !buy }"
        @click="buy = false">Sell</div>
    </div>
    <div class="block" :style="{
      'border-top-left-radius': (!buy ? '5px' : 0),
      'border-top-right-radius': (buy ? '5px' : 0),
    }">
      <div class="title">New {{ buy ? 'buy' : 'sell' }} order</div>

      <form class="content" @submit="newTrade">
        <div class="inputLine textInput">
          <div class="text">Symbol</div>
          <input type="text" disabled :value="$route.params.market">
        </div>

        <div style="height:10px"/>

        <div class="inputLine textInput">
          <select v-model="lever">
            <option value="1">x1</option>
            <option value="2">x2</option>
            <option value="3">x3</option>
            <option value="5">x5</option>
            <option value="10">x10</option>
            <option value="20">x20</option>
            <option value="30">x30</option>
          </select>
          <input type="text" placeholder="10,00 €" v-model="value">
          <!-- eslint-disable-next-line -->
          <svg viewBox="-2 0 25 24"><path d="M12,2A10,10,0,1,0,22,12,10.0117,10.0117,0,0,0,12,2Zm0,18a8,8,0,1,1,8-8A8.0092,8.0092,0,0,1,12,20ZM8,9h8v2H8Zm0,4h8v2H8Z"/></svg>
        </div>

        <div class="inputLine textInput w100">
          <div class="text">Take profit</div>
          <input type="text" placeholder="10,00 €" v-model="TP">
          <svg viewBox="-10 -5 130 100" style="transform:rotate(180deg)">
            <polygon points="5,18.654 49.996,81.346 95,18.654"/>
          </svg>
        </div>
        <div class="inputLine textInput w100">
          <div class="text">Stop loss</div>
          <input type="text" placeholder="10,00 €" v-model="SL">
          <svg viewBox="-20 0 130 100"><polygon points="5,18.654 49.996,81.346 95,18.654"/></svg>
        </div>

        <div class="inputLine textInput dateInput" :class="{ disabled: !autoClose }">
          <div class="text" @click="autoClose = ''">Auto close</div>
          <input type="datetime-local" v-model="autoClose">
        </div>

        <div class="separator"/>

        <input type="submit"
          :class="{ redBg: !buy }"
          :value="`${buy ? 'BUY' : 'SELL'} ${$route.params.market}`"
        >
      </form>
    </div>

    <div class="separator"/>

    <tradeList :values="values" :trades="trades" :filterMarket="$route.params.market"/>

    <div class="bottomTabs">
      <div class="bottomTab" @click="chart()">
        <!-- eslint-disable-next-line -->
        <svg viewBox="-5 0 110 100"><path d="M95.5,59.2l-17.1-1.1c-1.8-0.1-2.9,1.8-1.9,3.3l3.4,5.1L55.1,83.2L46,69.5c-1.3-2-4-2.5-5.9-1.2L9.7,88.7 c-2,1.3-2.5,4-1.2,5.9c1.3,2,4,2.5,5.9,1.2l26.8-18l9.1,13.6c1.3,2,4,2.5,5.9,1.2l28.3-19l3.4,5.1c1,1.5,3.2,1.2,3.8-0.5L97.4,62 C97.8,60.7,96.9,59.3,95.5,59.2z"/><path d="M8.5,72.8c0,1.2,1,2.2,2.2,2.2s2.2-1,2.2-2.2v-4.4H17c1,0,1.9-0.9,1.9-1.9V40.2c0-1.1-0.9-1.9-1.9-1.9h-4.1v-4.4 c0-1.2-1-2.2-2.2-2.2s-2.2,1-2.2,2.2v4.4H4.4c-1,0-1.9,0.8-1.9,1.9v26.3c0,1,0.8,1.9,1.9,1.9h4.1V72.8z"/><path d="M75,40.1h4.1v4.4c0,1.2,1,2.2,2.2,2.2c1.2,0,2.2-1,2.2-2.2v-4.4h4.1c1,0,1.9-0.9,1.9-1.9V12c0-1.1-0.9-1.9-1.9-1.9h-4.1 V5.7c0-1.2-1-2.2-2.2-2.2c-1.2,0-2.2,1-2.2,2.2v4.4H75c-1,0-1.9,0.8-1.9,1.9v26.3C73.1,39.3,73.9,40.1,75,40.1z"/><path d="M39.7,50.4h4.1v4.4c0,1.2,1,2.2,2.2,2.2c1.2,0,2.2-1,2.2-2.2v-4.4h4.1c1,0,1.9-0.9,1.9-1.9V22.3c0-1-0.8-1.9-1.9-1.9 h-4.1V16c0-1.2-1-2.2-2.2-2.2c-1.2,0-2.2,1-2.2,2.2v4.4h-4.1c-1,0-1.9,0.9-1.9,1.9v26.3C37.8,49.6,38.6,50.4,39.7,50.4z"/></svg>
      </div>
      <div class="bottomTab selected">
        <!-- eslint-disable-next-line -->
        <svg viewBox="5 0 90 100"><path d="M92.3,13.4c0,0-11.3,0-19.3,0c-0.9,0-3,0-6.1,0c-16.6,0-59.1,0-59.1,0c-1.6,0-2.8,1.3-2.8,2.8V28v55.7 c0,0.6,0.2,1.1,0.5,1.6c0.5,0.8,1.4,1.2,2.3,1.2l0,0h84.4l0,0c1,0,1.8-0.5,2.3-1.2c0.3-0.4,0.5-1,0.5-1.6V28V16.2 C95.1,14.7,93.8,13.4,92.3,13.4z M7.9,83.8V16.2h59.1H73h19.3v67.5H7.9z"/><path d="M44.1,51.6h-27c-0.9,0-1.6-0.7-1.6-1.6c0-0.9,0.7-1.6,1.6-1.6h27c0.9,0,1.6,0.7,1.6,1.6C45.7,50.9,44.9,51.6,44.1,51.6z"/><path d="M44.1,62.2h-27c-0.9,0-1.6-0.7-1.6-1.6c0-0.9,0.7-1.6,1.6-1.6h27c0.9,0,1.6,0.7,1.6,1.6C45.7,61.5,45,62.2,44.1,62.2z"/><path d="M44.1,72.6h-27c-0.9,0-1.6-0.7-1.6-1.6s0.7-1.6,1.6-1.6h27c0.9,0,1.6,0.7,1.6,1.6S45,72.6,44.1,72.6z"/><path d="M44.1,41.1h-27c-0.9,0-1.6-0.7-1.6-1.6c0-0.9,0.7-1.6,1.6-1.6h27c0.9,0,1.6,0.7,1.6,1.6C45.7,40.4,44.9,41.1,44.1,41.1z"/><path d="M44.1,30.6h-27c-0.9,0-1.6-0.7-1.6-1.6c0-0.9,0.7-1.6,1.6-1.6h27c0.9,0,1.6,0.7,1.6,1.6C45.7,29.9,44.9,30.6,44.1,30.6z"/><path d="M83,51.6H56c-0.9,0-1.6-0.7-1.6-1.6c0-0.9,0.7-1.6,1.6-1.6h27c0.9,0,1.6,0.7,1.6,1.6C84.5,50.9,83.8,51.6,83,51.6z"/><path d="M83,62.2H56c-0.9,0-1.6-0.7-1.6-1.6c0-0.9,0.7-1.6,1.6-1.6h27c0.9,0,1.6,0.7,1.6,1.6C84.6,61.5,83.9,62.2,83,62.2z"/><path d="M83,72.6H56c-0.9,0-1.6-0.7-1.6-1.6s0.7-1.6,1.6-1.6h27c0.9,0,1.6,0.7,1.6,1.6S83.9,72.6,83,72.6z"/><path d="M83,41.1H56c-0.9,0-1.6-0.7-1.6-1.6c0-0.9,0.7-1.6,1.6-1.6h27c0.9,0,1.6,0.7,1.6,1.6C84.5,40.4,83.8,41.1,83,41.1z"/><path d="M83,30.6H56c-0.9,0-1.6-0.7-1.6-1.6c0-0.9,0.7-1.6,1.6-1.6h27c0.9,0,1.6,0.7,1.6,1.6C84.5,29.9,83.8,30.6,83,30.6z"/></svg>
      </div>
    </div>
  </div>
</template>

<script>
import tradeList from './components/tradeList.vue';

/** @type {import('firebase').default.firestore.Firestore} */
const db = window.db;

/** @type {import('izitoast').IziToast} */
const toast = window.toast;

export default {
  name: 'MarketAction',

  components: { tradeList },

  props: {
    user: Object,
    fUser: Object,
    trades: Array,
    values: Object,
    TAResults: Array,
  },

  data: () => ({
    buy: true,
    TP: '',
    SL: '',
    lever: 1,
    value: '',

    autoClose: '',

    lang: navigator.language.split('-')[0] || 'en',
  }),

  created() {
    const lastTrade = JSON.parse(localStorage.getItem('defaultTrade') || '{}');
    if (lastTrade.buy) this.buy = lastTrade.buy;
    if (lastTrade.TP) this.TP = lastTrade.TP;
    if (lastTrade.SL) this.SL = lastTrade.SL;
    if (lastTrade.lever) this.lever = lastTrade.lever;
    if (lastTrade.value) this.value = lastTrade.value;
  },

  watch: {
    SL() { this.SL = this.SL.replace(/[^0-9.]/g, ''); },
    TP() { this.TP = this.TP.replace(/[^0-9.]/g, ''); },
    value() {
      this.value = this.value.replace(/[^0-9.]/g, '');
      if (!this.SL) this.SL = this.value;
      if (!this.TP) this.TP = this.value;
    },
    autoClose() {
      const cDate = new Date(this.autoClose);
      if (cDate.getTime() < Date.now()) this.autoClose = '';
    },
  },

  methods: {
    formatNumber(val) {
      return new Intl.NumberFormat(navigator.languages, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(val || 0);
    },

    newTrade(e) {
      e.preventDefault();

      if (this.value >= this.user.money) {
        toast.error({ title: 'You don\'t have enough money' });
        return;
      }

      if (this.SL >= this.user.money) {
        toast.error({ title: 'Stop loss must be lower than your balance' });
        return;
      }

      if (this.TP === 0) {
        toast.error({ title: 'Take profit must be greater than 0' });
        return;
      }

      if (this.value === 0) {
        toast.error({ title: 'Value must be greater than 0' });
        return;
      }

      const trade = {
        state: 'WAITFOROPEN',
        market: this.$route.params.market,
        user: this.fUser.uid,
        SL: parseFloat(this.SL),
        TP: parseFloat(this.TP),
        value: parseFloat(this.value),
        lever: this.buy ? parseFloat(this.lever) : (0 - parseFloat(this.lever)),
      };

      if (this.autoClose) {
        const cDate = new Date(this.autoClose);
        if (cDate.getTime() > Date.now()) trade.autoClose = cDate;
        else this.autoClose = '';
      }

      localStorage.setItem('defaultTrade', JSON.stringify({
        TP: this.TP,
        SL: this.SL,
        value: this.value,
        lever: this.lever,
        buy: this.buy,
      }));

      db.collection('candlevault_trades').add(trade).then(() => {
        toast.success({ title: 'Trade initialized' });
      });
    },
  },
};
</script>

<style scoped>
.firstColumn {
  display: grid;
}

.TAContainer {
  display: grid;
  grid-template-columns: 1fr 2fr;
  max-width: 400px;
  margin: 0 auto;
  border: 1px solid var(--color4);
  border-bottom: none;
  border-right: none;
}

.valuesGrid {
  display: grid;
  grid-template: 1fr 1fr 1fr / auto auto auto;
}

.TAContainer > div > div {
  height: 35px;
  display: grid;
  align-content: center;
  border: 1px solid var(--color4);
  border-top: none;
  border-left: none;
}

.item { opacity: 0.9; }
.item.sell { color: var(--red) }
.item.buy { color: var(--color8-s) }
.item.neutral { color: var(--color4) }

.item.strong { color: var(--lightFont) }
.item.strong.sell { background-color: var(--red) }
.item.strong.buy { background-color: var(--green) }

.market {
  margin-bottom: 50px;
}

#marketAnalys {
  height: 400px;
  max-width: 350px;
  width: 100%;
  margin-top: -30px;
}

.w100 {
  grid-template-columns: 95px auto 45px;
}

.textInput.dateInput {
  margin-top: 10px;
  grid-template-columns: 95px auto 7px;
}

input[type=datetime-local] {
  display: block;
  width: 100%;
}
input[type=datetime-local]::-webkit-calendar-picker-indicator {
  filter: invert(1);
}
</style>
