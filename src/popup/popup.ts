import Vue from 'vue';
import Popup from '@components/popup';
import '@styles/popup';

Vue.chrome = Vue.prototype.$chrome = chrome || browser;

export default new Vue({
  data: { test1: 'World' },
  components: {
    Popup
  },
  render: h => h(Popup)
}).$mount('#app');
