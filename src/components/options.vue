<template>
  <div>
    <div class="routers-box">
      <ul class="routers">
        <li><router-link to="/">基本设置</router-link></li>
        <li><router-link to="/SubscribeChannel">订阅频道</router-link></li>
        <li><router-link to="/LiveRoomHelper">直播间助手</router-link></li>
      </ul>
    </div>

    <div class="container">
      <keep-alive>
        <router-view></router-view>
      </keep-alive>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

// @Component 修饰符注明了此类为一个 Vue 组件
@Component
export default class Options extends Vue {
  // 初始数据可以直接声明为实例的 property
  message = 'Hello!'
}
</script>
