<template>
  <div class="market">
    <iframe id="market_analysis"
      :src="'https://s.tradingview.com/embed-widget/technical-analysis/'
        + '?locale=fr#%7B%22symbol%22%3A%22' + $route.params.market
        + '%22%2C%22interval%22%3A%221h%22%2C%22isTransparent%22%3Atrue'
        + '%2C%22showIntervalTabs%22%3Atrue%2C%22colorTheme%22%3A%22dark%22%7D'"
        frameborder="0"
    ></iframe>
  </div>
</template>

<script>
export default {
  name: 'MarketAction',

  props: { trades: Object },

  data: () => ({
  }),

  beforeCreate() {
    if (![
      'order',
    ].includes(this.$route.params.action)) this.$router.push(`/${this.$route.params.market}`);
  },
};
</script>

<style scoped>
#market_analysis {
  height: 500px;
  max-width: 500px;
  width: 100%;
}
</style>
