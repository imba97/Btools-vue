import Vue from 'vue'
import Popup from '@/popup/index.vue'
import '@styles/popup'

import router from '@/popup/router'

export default new Vue({
  router,
  render: (h) => h(Popup)
}).$mount('#app')
