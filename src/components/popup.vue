<template>
  <div>
    <h1>{{ title }}</h1>
    <input type="text" v-model="input" value="" placeholder="输入UID" />
    <button @click="btn">请求数据测试</button>
    <p>{{ message }}</p>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { Url } from '@base/enums/url'

// @Component 修饰符注明了此类为一个 Vue 组件
@Component
export default class Popup extends Vue {
  // 初始数据可以直接声明为实例的 property
  title = 'Popup'
  message = ''

  input = '2198461'

  public async btn() {
    if (this.input === '') return

    const data = await Url.TEST.request({
      param: '233',
      complex: true
    })

    console.log(data)
  }
}
</script>

<style lang="scss" scoped>
div {
  width: 300px;
  height: 300px;
  text-align: center;
}
input[type='text'] {
  width: 200px;
  height: 30px;
}
</style>
