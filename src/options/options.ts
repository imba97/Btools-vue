import Vue from 'vue';
import Options from '@components/options';
import '@styles/options';

Vue.chrome = Vue.prototype.$chrome = chrome || browser;

export default new Vue({
  data: { test1: 'World' },
  components: {
    Options
  },
  render: (h: (arg0: any) => any) => h(Options)
}).$mount('#app');
