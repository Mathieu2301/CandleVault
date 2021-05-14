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
          <div>Score</div>
          <div :class="{
            green: stats.total > 0,
            red: stats.total < 0,
          }">{{ stats.total >= 0 ? '+' : '-' }}{{ formatNumber(
            (stats.total / (stats.gain - stats.loss)) * 100
          ) }} %</div>
        </div>

        <div class="group">
          <div>Total</div>
          <div :class="{
            green: stats.total > 0,
            red: stats.total < 0,
          }">{{ stats.total >= 0 ? '+' : '-' }}{{ toEuro(stats.total) }}</div>
        </div>

        <div class="group">
          <div>Sell trades</div>
          <div>{{ stats.sellTrades }}</div>
        </div>

        <div class="group">
          <div>Buy trades</div>
          <div>{{ stats.buyTrades }}</div>
        </div>

        <div class="group">
          <div>Open trades</div>
          <div>{{ stats.openTrades }}</div>
        </div>

        <div class="group">
          <div>Total trades</div>
          <div>{{ trades.length }}</div>
        </div>
      </div>

      <div class="button resetBtn" v-if="stats.openTrades !== trades.length" @click="resetTrades">
        Reset all
      </div>
    </div>

    <div class="separator"/>

    <tradeList :trades="trades" :values="values"/>
  </div>
</template>

<script>
import tradeList from './components/tradeList.vue';

/** @type {import('firebase').default.firestore.Firestore} */
const db = window.db;

/** @type {import('izitoast').IziToast} */
const toast = window.toast;

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

        openTrades: 0,
        buyTrades: 0,
        sellTrades: 0,
      };

      this.trades.forEach((t) => {
        if (t.state === 'CLOSED') {
          const gain = (t.closeVal - t.openVal)
            * (t.value / t.openVal)
            * t.lever;
          stats[gain < 0 ? 'loss' : 'gain'] += gain;
        } else stats.openTrades += 1;
        stats[`${t.lever > 0 ? 'buy' : 'sell'}Trades`] += 1;
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

    resetTrades() {
      toast.confirm('Are your sure you want to DELETE all your trades ?', async () => {
        const coll = db.collection('candlevault_trades');
        const batch = db.batch();

        this.trades.filter((t) => t.state === 'CLOSED').slice(0, 500).forEach((t) => {
          batch.delete(coll.doc(t.id));
        });

        await batch.commit();
        toast.success({ title: 'Trades deleted !' });
      });
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

.resetBtn {
  margin: 20px auto 5px;
  max-width: 400px;
}

@media screen and (min-width: 500px) {
  .stats { grid-template-columns: auto auto }
}

</style>
