<template>
  <div>
    <h1>Btools 开发工具</h1>
    <button @click="clearAllCache">清空所有缓存</button>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import ExtStorage from '@/scripts/base/storage/ExtStorage'
import {
  TRetrieveInvalidVideo,
  IRetrieveInvalidVideo
} from '@/scripts/base/storage/template'

@Component
export default class DevelopmentHelper extends Vue {
  /**
   * 清空所有缓存
   */
  clearAllCache() {
    ExtStorage.Instance().clear()
  }
}
</script>

<style lang="scss" scoped></style>