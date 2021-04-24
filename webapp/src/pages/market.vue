<template>
  <div class="market">
    Loading...
    <div id="market_chart"></div>
  </div>
</template>

<script>
export default {
  name: 'Market',

  props: { trades: Object },

  mounted() {
    this.setChart();
  },

  beforeUpdate() {
    this.setChart();
  },

  methods: {
    setChart() {
      // eslint-disable-next-line
      new window.TradingView.widget({
        autosize: true,
        symbol: this.$route.params.market,
        interval: 'D',
        timezone: 'Europe/Paris',
        theme: 'dark',
        style: 1,
        locale: 'fr',
        toolbar_bg: '#f1f3f6',
        withdateranges: true,
        enable_publishing: false,
        hide_side_toolbar: false,
        details: true,
        container_id: 'market_chart',
      });
    },
  },
};
</script>

<style scoped>
#market_chart {
  position: fixed;
  top: 55px;
  left: 0;
  bottom: 0;
  width: 100%;
  height: calc(100% - 55px);
}

@media screen and (min-width: 1000px) {
  #market_chart {
    left: 300px;
    width: calc(100% - 300px);
  }
}
</style>
