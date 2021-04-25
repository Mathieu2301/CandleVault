<template>
  <iframe v-if="active" :style="style" :src='src' frameborder='0'/>
</template>

<script>
export default {
  name: 'Loader',

  props: {
    type: String,
    symbol: String,
    style: Object,
  },

  data: () => ({
    lang: navigator.language.split('-')[0] || 'en',
    active: true,
  }),

  computed: {
    options() {
      if (this.type === 'hotlists') {
        return {
          colorTheme: 'dark',
          dateRange: 'ALL',
          exchange: 'US',
          showChart: true,
          width: '100%',
          height: '100%',
          largeChartUrl: './',
          isTransparent: true,
          showSymbolLogo: true,
          plotLineColorGrowing: '#00b176',
          plotLineColorFalling: '#00b176',
          gridLineColor: 'rgba(42, 46, 57, 1)',
          scaleFontColor: 'rgba(120, 123, 134, 1)',
          belowLineFillColorGrowing: '#00b17630',
          belowLineFillColorFalling: '#00b17630',
          symbolActiveColor: '#00b17630',
        };
      }

      if (this.type === 'single-quote') {
        return {
          symbol: this.symbol || this.$route.params.market,
          width: '100%',
          colorTheme: 'dark',
          isTransparent: true,
          height: 126,
        };
      }

      if (this.type === 'mini-symbol-overview') {
        return {
          symbol: this.symbol || this.$route.params.market,
          dateRange: '1m',
          colorTheme: 'dark',
          trendLineColor: '#00b176',
          underLineColor: '#00b17630',
        };
      }

      if (this.type === 'technical-analysis') {
        console.log('Reload TA');
        return {
          symbol: this.$route.params.market,
          interval: '1h',
          isTransparent: true,
          showIntervalTabs: true,
          colorTheme: 'dark',
        };
      }

      return {};
    },

    src() {
      if (this.type !== 'chart') {
        return encodeURI(
          `https://s.tradingview.com/embed-widget/${this.type}/?locale=${this.lang}#${JSON.stringify(this.options)}`,
        );
      }

      return encodeURI('https://www.tradingview.com/widgetembed/'
        + '?frameElementId=market_chart'
        + `&locale=${this.lang}`
        + `&symbol=${this.$route.params.market}`
        + '&interval=3'
        + '&hidesidetoolbar=0'
        + '&saveimage=0'
        + '&toolbarbg=f1f3f6'
        + '&details=1'
        + '&calendar=1'
        + '&theme=dark'
        + '&style=1'
        + '&timezone=Etc%2FUTC'
        + '&withdateranges=1');
    },
  },

  watch: {
    $route(from, to) {
      if (!this.symbol && this.type !== 'chart' && from.params.market
        && from.params.market !== to.params.market
      ) {
        this.active = false;
        this.$nextTick(() => { this.active = true; });
      }
    },
  },
};
</script>

<style scoped>

</style>
