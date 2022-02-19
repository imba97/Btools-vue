import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/',
      redirect: '/SubscribeChannel'
    },
    {
      path: '/SubscribeChannel',
      name: 'SubscribeChannel',
      component: () =>
        import(
          /* webpackChunkName: "PopupSubscribeChannel" */
          '@/popup/views/SubscribeChannel.vue'
        )
    },
    {
      path: '/MultipleAccounts',
      name: 'MultipleAccounts',
      component: () =>
        import(
          /* webpackChunkName: "PopupMultipleAccounts" */
          '@/popup/views/MultipleAccounts.vue'
        )
    }
  ],
  linkExactActiveClass: 'active'
})

export default router
