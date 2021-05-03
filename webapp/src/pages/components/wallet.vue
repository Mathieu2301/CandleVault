<template>
  <div class="block">
    <div class="title">Wallet</div>
    <div v-if="wallet.markets && Object.keys(wallet.markets).length > 0">
      <div class="market clickable"
        v-for="(market, symbol) in wallet.markets"
        :key="symbol"
        @click="gotoMarket(symbol)"
      >
        <div class="head">
          <div class="line1">
            <div class="nbr greyBg">{{ market.nbr }}</div>
            <div class="bold left">{{ symbol }}</div>

            <div class="price">
              {{ formatNumber(values[symbol], 5) }}
            </div>

            <div class="evol right" :class="{
              green: market.evol > 0,
              red: market.evol < 0,
            }">
              {{ market.evol >= 0 ? '+' : '-' }}{{ formatNumber(market.evol, 2) }} %
            </div>
          </div>

          <div class="line2">
            <div class="bold" :class="{
              green: market.gain > 0,
              red: market.gain < 0,
            }">{{ market.gain >= 0 ? 'G' : 'L' }}</div>
            <div class="value left">{{ toEuro(market.value) }}</div>
            <div class="value">{{ toEuro(market.nowValue) }}</div>
            <div class="gain right" :class="{
              green: market.gain > 0,
              red: market.gain < 0,
            }">{{ market.gain >= 0 ? '+' : '-' }}{{ toEuro(market.gain) }}</div>
          </div>
        </div>
      </div>

      <div class="separator"/>

      <div class="market">
        <div class="head">
          <div class="line3">
            <div class="bold left">Total</div>
            <div class="value left">{{ toEuro(wallet.global.value) }}</div>

            <div class="evol" :class="{
              green: wallet.global.evol > 0,
              red: wallet.global.evol < 0,
            }">
              {{ wallet.global.evol >= 0 ? '+' : '-' }}{{ formatNumber(wallet.global.evol, 2) }} %
            </div>

            <div class="gain right" :class="{
              green: wallet.global.gain > 0,
              red: wallet.global.gain < 0,
            }">{{ wallet.global.gain >= 0 ? '+' : '-' }}{{ toEuro(wallet.global.gain) }}</div>
          </div>
        </div>
      </div>
    </div>

    <div v-else>Empty wallet</div>
  </div>
</template>

<script>
export default {
  name: 'Wallet',

  props: {
    trades: Array,
    values: Object,
    filterMarket: String,
  },

  computed: {
    wallet() {
      const global = {
        value: 0, gain: 0, evol: 0, nowValue: 0,
      };
      const markets = {};

      this.trades.filter((t) => t.state === 'OPEN').forEach((trade) => {
        if (!markets[trade.market]) {
          markets[trade.market] = {
            nbr: 0, value: 0, nowValue: 0, openValues: 0, gain: 0,
          };
        }
        const value = trade.value * trade.lever;
        markets[trade.market].nbr += 1;
        markets[trade.market].value += value;
        markets[trade.market].nowValue += (this.values[trade.market] / trade.openVal) * value;
        markets[trade.market].openValues += trade.openVal;
        markets[trade.market].gain += (this.values[trade.market] - trade.openVal)
          * (value / trade.openVal);
      });

      Object.keys(markets).forEach((symbol) => {
        const market = markets[symbol];
        markets[symbol].evol = ((this.values[symbol] / (market.openValues / market.nbr)) - 1) * 100;
        global.value += (market.value || 0);
        global.gain += (market.gain || 0);
        global.nowValue += (market.nowValue || 0);
      });

      if (global.value) global.evol = ((global.nowValue / global.value) - 1) * 100;

      return { global, markets };
    },
  },

  methods: {
    gotoMarket(symbol) {
      this.$router.push(`/${symbol}/Trades`);
    },

    toEuro(val) {
      return new Intl.NumberFormat(navigator.languages, {
        style: 'currency',
        currency: 'EUR',
      }).format(Math.abs(val || 0));
    },

    formatNumber(val, maximumFractionDigits = 3) {
      return new Intl.NumberFormat(navigator.languages, {
        minimumFractionDigits: 2,
        maximumFractionDigits,
      }).format(Math.abs(val || 0));
    },
  },
};
</script>

<style scoped>
.market {
  border: 1px solid var(--color4);
  border-radius: 10px;
  max-width: 400px;
  margin: 0 auto;
  margin-bottom: 10px;
}

.line1 {
  display: grid;
  grid-template-columns: min-content auto auto auto;
}

.line2 {
  display: grid;
  grid-template-columns: 35px auto auto auto;
}

.line3 {
  display: grid;
  grid-template-columns: auto auto auto auto;
}

.market > div > div > div {
  padding: 7px;
  opacity: 0.8;
  overflow: hidden;
  white-space: nowrap;
}

.nbr {
  border-top-left-radius: 9px;
  border-bottom-right-radius: 9px;
  min-width: 35px;
}

.bold {
  font-weight: 700;
  opacity: 0.7 !important;
}

.evol {
  opacity: 1 !important;
}

.gain {
  font-weight: 600;
}

.red { color: var(--red) }
.green { color: var(--green) }

.left { text-align: left }
.right { text-align: right }
</style>
