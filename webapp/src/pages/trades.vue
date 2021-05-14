<template>
  <div class="trades">
    <div class="block">
      <div class="title">Statistics</div>
      <div class="stats">
        <div class="group">
          <div>Gain</div>
          <div class="green">+{{ toEuro(stats.gain) }}</div>
        </div>

        <div class="group">
          <div>Loss</div>
          <div class="red">-{{ toEuro(stats.loss) }}</div>
        </div>

        <div class="group">
          <div>Total</div>
          <div :class="{
            green: stats.gain > 0,
            red: stats.gain < 0,
          }">{{ stats.gain >= 0 ? '+' : '-' }}{{ toEuro(stats.total) }}</div>
        </div>

        <div class="group">
          <div>Sell trades</div>
          <div>{{ trades.filter((t) => !(t.lever > 0)).length }}</div>
        </div>

        <div class="group">
          <div>Buy trades</div>
          <div>{{ trades.filter((t) => t.lever > 0).length }}</div>
        </div>

        <div class="group">
          <div>Total trades</div>
          <div>{{ trades.length }}</div>
        </div>
      </div>
    </div>

    <div class="separator"/>

    <tradeList :trades="trades" :values="values"/>
  </div>
</template>

<script>
import tradeList from './components/tradeList.vue';

export default {
  name: 'Trades',

  components: { tradeList },

  props: {
    trades: Array,
    values: Object,
  },

  computed: {
    stats() {
      const stats = {
        gain: 0,
        loss: 0,
        total: 0,
      };

      this.trades.forEach((t) => {
        if (t.state === 'CLOSED') {
          const gain = (t.closeVal - t.openVal)
            * (t.value / t.openVal)
            * t.lever;
          stats[gain < 0 ? 'loss' : 'gain'] += gain;
        }
      });

      stats.total = stats.gain + stats.loss;
      return stats;
    },
  },

  methods: {
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
.stats {
  border: 1px solid var(--color4);
  border-radius: 10px;
  max-width: 400px;
  margin: 0 auto;
  margin-bottom: 10px;
  display: grid;
  grid-template-columns: auto auto;
}

.group {
  display: grid;
  grid-template-columns: auto auto;
  padding: 10px;
}

.group > :first-child {
  text-align: left;
  font-weight: 600;
}

.group > :last-child {
  text-align: right;
}

.red { color: var(--red) }
.green { color: var(--green) }
</style>
