import Vue from 'vue'
import Options from '@/options/index.vue'

import '@styles/global'
import '@styles/options'

import router from '@/options/router'

export default new Vue({
  router,
  render: (h) => h(Options)
}).$mount('#app')
