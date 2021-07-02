<template>
  <div>
    <div class="subscribe-channel">
      <div v-for="(cids, uid) in channelInfo" :key="uid">
        <p class="user-info" @click="toUserSpace(uid)">
          <img
            class="face"
            :src="`${userInfo[uid].face}@50w_50h_100Q_1c.webp`"
          />
          <span class="nickname">{{ userInfo[uid].name }}</span>
        </p>
        <div v-for="(channel, cid) in cids" :key="cid">
          <p class="channel" @click="toChannel(uid, cid)">
            <span class="title">{{ channel.title }}</span>
            <span
              class="clear-all"
              href="javascript:void(0);"
              @click="clearAll(uid, cid, $event)"
              >清空</span
            >
          </p>
          <ul v-if="channel.videos.length > 0">
            <li
              v-for="(video, index) in channel.videos"
              :key="index"
              @click="linkTo(uid, cid, index, video.bvid)"
            >
              <img class="pic" :src="`${video.pic}@380w_240h_100Q_1c.webp`" />
              <p class="title">{{ video.title }}</p>
            </li>
          </ul>
          <p class="empty" v-else>
            <i class="icon-empty" v-html="getEmptyIcon()"></i>
            <span>空</span>
          </p>
        </div>
      </div>
    </div>
    <!-- 订阅频道 图片后缀 @380w_240h_100Q_1c.webp -->
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { Url } from '@base/Url'
import {
  ISubscribeChannel,
  IVideoData,
  IVideoInfo,
  TSubscribeChannel
} from '@base/storage/template'
import ExtStorage from '@base/storage/ExtStorage'
import _ from 'lodash'
import IconUtil from '@/scripts/base/IconUtil'

@Component
export default class Popup extends Vue {
  channelInfo = {}
  userInfo = {}

  private _localData: ISubscribeChannel = {}

  async created() {
    // 读取本地存储
    this._localData = await ExtStorage.Instance().getStorage<
      TSubscribeChannel,
      ISubscribeChannel
    >(
      new TSubscribeChannel({
        channelInfo: {},
        userInfo: {},
        channelVideos: {}
      })
    )

    // channelInfo 和 userInfo 的临时变量，直接修改这两页面不会渲染
    const data = {}
    const user = {}

    console.log(this._localData)

    // 遍历视频信息
    _.forEach(this._localData.channelVideos, async (cids, uid) => {
      // 如果是空直接跳过
      if (_.isEmpty(cids)) return true

      // 构造临时存储
      data[uid] = {}
      user[uid] = {}

      // 用户 昵称 和 头像
      user[uid].name = this._localData.userInfo![uid].name
      user[uid].face = this._localData.userInfo![uid].face
      // 循环频道信息
      _.forEach(cids, (videos: IVideoData[], cid) => {
        data[uid][cid] = {}
        // 频道名称
        data[uid][cid].title = this._localData.channelInfo![cid].title
        // 频道下已阅的视频
        data[uid][cid].videos = videos.filter((video) => !video.readed)
      })
    })

    // 渲染页面
    this.channelInfo = data
    this.userInfo = user
    console.log(this.channelInfo)
  }

  /**
   * 清空一个频道下所有视频
   */
  clearAll(uid: number, cid: number, e: MouseEvent) {
    e.stopPropagation()
    this.channelInfo[uid][cid].videos = []

    this._localData.channelVideos![uid][cid] = _.map(
      this._localData.channelVideos![uid][cid],
      (item) => {
        if (!item.readed) item.readed = true
        return item
      }
    )

    this.save()
  }

  /**
   * 跳转到该视频
   */
  linkTo(uid: number, cid: number, index: number, bvid: string) {
    // 临时存储
    const channelInfo = this.channelInfo
    // 删除视频
    channelInfo[uid][cid].videos.splice(index, 1)
    // 渲染页面
    this.channelInfo = channelInfo

    // 获取该视频在本地存储的 index
    const localDataIndex = _.findIndex(
      this._localData.channelVideos![uid][cid],
      { bvid }
    )

    if (localDataIndex === -1) return

    // 打开页面
    window.open(
      `https://b23.tv/${
        this._localData.channelVideos![uid][cid][localDataIndex].bvid
      }`
    )

    // 设置为 已读
    this._localData.channelVideos![uid][cid][localDataIndex].readed = true

    this.save()
  }

  toUserSpace(uid: number) {
    window.open(`https://space.bilibili.com/${uid}`)
  }

  toChannel(uid: number, cid: number) {
    window.open(`https://space.bilibili.com/${uid}/channel/detail?cid=${cid}`)
  }

  // 保存本地存储
  private save() {
    ExtStorage.Instance().setStorage<TSubscribeChannel, ISubscribeChannel>(
      new TSubscribeChannel(this._localData)
    )
  }

  getEmptyIcon() {
    return IconUtil.Instance().EMPRY_DATA()
  }
}
</script>

<style lang="scss" scoped></style>
