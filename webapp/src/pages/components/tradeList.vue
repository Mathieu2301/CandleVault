<template>
  <div class="block">
    <div class="title">Trades</div>
    <div class="trades" v-if="filteredTrades && filteredTrades.length > 0">
      <div class="trade clickable"
        v-for="trade in filteredTrades"
        :key="trade.id"
        @click="selectedDrop = (selectedDrop === trade.id ? '' : trade.id)"
        :class="{
          active: trade.state === 'OPEN',
          selected: selectedDrop === trade.id,
        }"
      >
        <div class="head">
          <div class="line1">
            <div class="type" :class="{
              greenBg: trade.lever > 0,
              redBg: trade.lever < 0,
            }">{{ trade.lever > 0 ? 'B' : 'S' }}</div>
            <div class="symbol left">{{ trade.market }}</div>

            <div class="price">
              {{ (trade.state === 'OPEN'
                ? formatNumber(values[trade.market], 5)
                : (trade.state === 'CLOSED' ? 'Closed' : 'Pending...')) }}
            </div>

            <div class="evol right" :class="{
              green: (trade.closeVal || values[trade.market]) > trade.openVal,
              red: (trade.closeVal || values[trade.market]) < trade.openVal,
            }">
              {{ ((trade.closeVal || values[trade.market])
                ? calcEvol(trade)
                : 'Waiting') }}
            </div>
          </div>

          <div class="line1">
            <div class="lever greyBg">x{{ Math.abs(trade.lever) }}</div>
            <div class="value left">{{ toEuro(trade.value) }}</div>
            <div class="value">{{ calcNewTradeValue(trade) }}</div>
            <div class="gain right" :class="{
              green: trade.lever * ((trade.closeVal || values[trade.market]) - trade.openVal) > 0,
              red: trade.lever * ((trade.closeVal || values[trade.market]) - trade.openVal) < 0,
            }">{{ calcGain(trade) }}</div>
          </div>
        </div>

        <div class="droppable">
          <div class="line2">
            <div style="background-color: var(--red)">SL : {{ toEuro(trade.SL) }}</div>
            <div style="background-color: var(--green)">TP : {{ toEuro(trade.TP) }}</div>
          </div>

          <div class="stateLine">
            <div>Open</div>
            <div>{{ formatNumber(trade.openVal, 5) }}</div>
            <div class="date right">{{ getDate(trade.openDate) }}</div>
          </div>

          <div class="stateLine">
            <div>Close</div>
            <div>{{
              trade.closeVal
                ? formatNumber(trade.closeVal, 5)
                : (trade.autoClose ? '-' : '...')
            }}</div>
            <div class="date right">{{ getDate(trade.closeDate || trade.autoClose) }}</div>
          </div>

          <div class="closeBtn redBg button"
            v-if="trade.state === 'WAITFOROPEN'"
            @click="deleteTrade(trade)">Abort</div>

          <div class="closeBtn button"
            :class="{
              greenBg: trade.lever * (values[trade.market] - trade.openVal) > 0,
              redBg: trade.lever * (values[trade.market] - trade.openVal) < 0,
            }"
            v-if="trade.state === 'OPEN'"
            @click="closeTrade(trade)">Close ({{ calcGain(trade) }})</div>
        </div>
      </div>
    </div>

    <div v-else>No {{ $route.params.market }} trade</div>
  </div>
</template>

<script>
/** @type {import('firebase').default.firestore.Firestore} */
const db = window.db;

/** @type {import('izitoast').IziToast} */
const toast = window.toast;

export default {
  name: 'TradeList',

  data: () => ({
    selectedDrop: '',
  }),

  props: {
    trades: Array,
    values: Object,
    filterMarket: String,
  },

  computed: {
    filteredTrades() {
      if (!this.filterMarket) return this.trades;
      return this.trades.filter((t) => t.market === this.filterMarket);
    },
  },

  methods: {
    toEuro(val) {
      return new Intl.NumberFormat(navigator.languages, {
        style: 'currency',
        currency: 'EUR',
      }).format(val || 0);
    },

    formatNumber(val, maximumFractionDigits = 3) {
      return new Intl.NumberFormat(navigator.languages, {
        minimumFractionDigits: 2,
        maximumFractionDigits,
      }).format(val || 0);
    },

    calcEvol(trade) {
      const last = trade.closeVal || this.values[trade.market];
      const evol = ((last / trade.openVal) - 1) * 100;
      return `${evol > 0 ? '+' : '-'}${this.formatNumber(Math.abs(evol), 2)} %`;
    },

    calcGain(trade) {
      const last = trade.closeVal || this.values[trade.market];
      const gain = (last - trade.openVal)
        * (trade.value / trade.openVal)
        * trade.lever;
      return `${gain > 0 ? '+' : '-'}${this.toEuro(Math.abs(gain))}`;
    },

    calcNewTradeValue(trade) {
      const last = trade.closeVal || this.values[trade.market];
      const newVal = (last / trade.openVal) * trade.value;
      return `${this.toEuro(newVal)}`;
    },

    getDate(timestamp) {
      if (!timestamp) return '...';
      const d = new Date(timestamp.seconds * 1000);
      return d.toLocaleString().replace(/(\/[0-9]{4})|([0-9]{4}\/)|(:[0-9]{2}$)|,/g, '');
    },

    closeTrade(trade) {
      toast.confirm('Are your sure you want to CLOSE this trade ?', () => {
        db.collection('candlevault_trades').doc(trade.id).update({
          state: 'WAITFORCLOSE',
        }).then(() => {
          toast.success({ title: 'Trade closed !' });
        });
      });
    },
  },
};
</script>

<style scoped>
.trade {
  border: 1px solid var(--color4);
  border-radius: 10px;
  max-width: 400px;
  margin: 0 auto;
  margin-bottom: 10px;
}

.trade:not(.active):not(.selected) { opacity: 0.6 }

.droppable { pointer-events: none }

.trade:not(.selected) .droppable {
  height: 0;
  opacity: 0;
}

.line1 {
  display: grid;
  grid-template-columns: 40px auto auto auto;
}

.line2 {
  display: grid;
  grid-template-columns: 50% 50%;
}

.stateLine {
  display: grid;
  grid-template-columns: 50px auto 100px;
  padding: 0 5px;
}

.trade > div > div > div {
  padding: 7px;
  opacity: 0.8;
  overflow: hidden;
  white-space: nowrap;
}

.type {
  border-top-left-radius: 9px;
}

.symbol {
  font-weight: 700;
  opacity: 0.7 !important;
}

.lever {
  opacity: 0.5;
}

.trade:not(.selected) .lever { border-bottom-left-radius: 9px }

.evol {
  opacity: 1 !important;
}

.gain {
  font-weight: 600;
}

.date {
  opacity: 0.6 !important;
  font-size: 14px;
  display: grid;
  align-items: center;
}

.closeBtn {
  margin: 0;
  border-radius: 0;
  border-bottom-left-radius: 9px;
  border-bottom-right-radius: 9px;
}

.selected .closeBtn { pointer-events: all }

.red { color: var(--red); }
.green { color: var(--green); }
.grey { color: var(--color4); }

.left { text-align: left }
.right { text-align: right }
</style>
