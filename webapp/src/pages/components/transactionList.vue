<template>
  <div class="block">
    <div class="title">Transactions</div>
    <div class="transactions" v-if="transactions && transactions.length > 0">
      <div class="transaction"
        v-for="transaction in transactions"
        :key="transaction.id"
      >
        <div class="head">
          <div class="line">
            <div class="name left">{{ transaction.name }}</div>
            <div class="value right" :class="{
              green: transaction.to === fUser.uid,
              red: transaction.from === fUser.uid,
            }">{{ getValText(transaction) }}</div>

            <div class="state left" v-if="transaction.state === 'WAITING'">
              Waiting...
            </div>
            <div class="date left" v-if="transaction.state === 'DONE'">
              {{ getDate(transaction.date.seconds) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else>No transaction</div>
  </div>
</template>

<script>
export default {
  name: 'TransactionList',

  props: {
    transactions: Array,
    fUser: Object,
  },

  methods: {
    getValText(transaction) {
      const text = !transaction.value
        ? '0,00 €'
        : new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(transaction.value);

      return `${transaction.from === this.fUser.uid ? '-' : '+'} ${text}`;
    },

    getDate(timestamp) {
      if (!timestamp) return '...';
      const d = new Date(timestamp * 1000);
      return d.toLocaleString().replace(/(\/[0-9]{4})|([0-9]{4}\/)|(:[0-9]{2}$)|,/g, '');
    },
  },
};
</script>

<style scoped>
.transaction {
  border: 1px solid var(--color4);
  border-radius: 10px;
  max-width: 400px;
  margin: 0 auto;
  margin-bottom: 10px;
}

.droppable { pointer-events: none }

.transaction:not(.selected) .droppable {
  height: 0;
  opacity: 0;
}

.name {
  width: 100%;
}

.value {
  font-weight: 600;
  grid-row: 1 / 3;
  grid-column: 2;
  display: grid;
  align-items: center;
}

.line {
  display: grid;
  grid-template-columns: auto min-content;
}

.transaction > div > div > div {
  padding: 12px;
  opacity: 0.8;
  overflow: hidden;
  white-space: nowrap;
}

.state {
  opacity: 0.6 !important;
  padding-top: 4px !important;
}

.date {
  opacity: 0.6 !important;
  font-size: 15px;
  display: grid;
  align-items: center;
  padding-top: 4px !important;
  grid-column: 1 3;
}

.red { color: var(--red); }
.green { color: var(--green); }

.left { text-align: left }
.right { text-align: right }
</style>
