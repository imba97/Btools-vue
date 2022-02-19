<template>
  <div>
    <Navbar>
      <router-link to="/">基本设置</router-link>
      <router-link v-if="!isProduction" to="/DevelopmentHelper">开发者工具</router-link>
      <router-link to="/SubscribeChannel">订阅频道</router-link>
      <router-link to="/LiveRoomHelper">直播间助手</router-link>
    </Navbar>

    <div class="container">
      <keep-alive>
        <router-view></router-view>
      </keep-alive>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import Navbar from '@/components/Navbar.vue'

// @Component 修饰符注明了此类为一个 Vue 组件
@Component({
  components: {
    Navbar
  }
})
export default class Options extends Vue {
  // 初始数据可以直接声明为实例的 property
  message = 'Hello!'

  isProduction = true

  created() {
    this.isProduction = process.env.NODE_ENV === 'production'
  }
}
</script>
