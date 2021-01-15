<template>
  <div>
    <h1>{{ title }}</h1>
    <input type="text" v-model="uid" value="" placeholder="输入UID" />
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
  title = 'Popup 125'
  message = ''

  uid = '2198461'

  public btn() {
    if (this.uid === '') return

    // Url.USER_CARD.request({ mid: this.uid }).then((json) => {
    //   this.message = `用户：${json.data.card.name}`
    // })
    Url.POST_TEST.request({ param: this.uid }).then((json) => {
      this.message = json.param || 'none'
    })
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
