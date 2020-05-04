import Vue from 'vue';
import Options from '@components/options';
import '@styles/options';

export default new Vue({
  data: { test1: 'World' },
  components: {
    Options
  },
  render: h => h(Options)
}).$mount('#app');
