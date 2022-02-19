import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () =>
        import(
          /* webpackChunkName: "OptionsHome" */
          '@/options/views/Home.vue'
        )
    },
    {
      path: '/DevelopmentHelper',
      name: 'DevelopmentHelper',
      component: () =>
        import(
          /* webpackChunkName: "OptionsDevelopmentHelper" */
          '@/options/views/DevelopmentHelper.vue'
        )
    },
    {
      path: '/SubscribeChannel',
      name: 'SubscribeChannel',
      component: () =>
        import(
          /* webpackChunkName: "OptionsSubscribeChannel" */
          '@/options/views/SubscribeChannel.vue'
        )
    },
    {
      path: '/LiveRoomHelper',
      name: 'LiveRoomHelper',
      component: () =>
        import(
          /* webpackChunkName: "OptionsLiveRoomHelper" */
          '@/options/views/LiveRoomHelper.vue'
        )
    }
  ],
  linkExactActiveClass: 'active'
})

export default router
