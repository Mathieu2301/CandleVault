<template>
  <div class="trades">
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
};
</script>
