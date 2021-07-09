<template>
  <div>
    <h1>Btools 设置说明</h1>
    <ul>
      <li>上方标题切换配置项页面</li>
      <li>点击切换配置项</li>
      <li>左键下一项，右键上一项</li>
    </ul>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class Home extends Vue {
  // 初始数据可以直接声明为实例的 property
}
</script>

<style lang="scss" scoped>
h1 {
  padding-top: 10px;
  text-align: center;
  color: #666;
}
ul {
  padding: 20px 0 0 50px;
  list-style: decimal;
  box-sizing: border-box;

  li {
    font-size: 18px;
  }
}
</style>
