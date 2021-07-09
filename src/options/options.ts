import Vue from 'vue'
import Options from '@components/options'
import '@styles/options'
import Router from 'vue-router'

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import(/*  */ '@components/options/Home.vue')
    },
    {
      path: '/SubscribeChannel',
      name: 'SubscribeChannel',
      component: () => import('@components/options/SubscribeChannel.vue')
    },
    {
      path: '/LiveRoomHelper',
      name: 'LiveRoomHelper',
      component: () => import('@components/options/LiveRoomHelper.vue')
    }
  ],
  linkExactActiveClass: 'active'
})

export default new Vue({
  components: {
    Options
  },
  router,
  render: (h: (arg0: any) => any) => h(Options)
}).$mount('#app')
