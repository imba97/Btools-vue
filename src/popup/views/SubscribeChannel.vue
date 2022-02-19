<style lang="scss" scoped>
.container {
  width: 100%;
  height: 100%;
}

.subscribe-channel {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  box-sizing: border-box;

  ul {
    overflow-y: auto;
  }

  ul > li {
    position: relative;
    width: 150px;
    height: 130px;
    list-style: none;
    box-sizing: border-box;
    float: left;
    cursor: pointer;

    .pic {
      position: absolute;
      top: 0;
      left: 0;
      width: 150px;
      height: 100px;
      object-fit: fill;
    }

    .title {
      position: absolute;
      top: 100px;
      left: 0;
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .user-info {
    position: relative;
    width: 100%;
    height: 40px;
    background-image: linear-gradient(to right, #868f96 0%, #596164 100%);
    cursor: pointer;

    .face {
      position: absolute;
      top: 5px;
      left: 10px;
      width: 30px;
      height: 30px;
      border-radius: 100%;
    }

    .nickname {
      position: absolute;
      top: 10px;
      left: 45px;
      color: #fff;
      font-size: 16px;
    }
  }

  .channel {
    position: relative;
    width: 100%;
    height: 30px;
    background-image: linear-gradient(
      to top,
      #d5d4d0 0%,
      #d5d4d0 1%,
      #eeeeec 31%,
      #efeeec 75%,
      #e9e9e7 100%
    );
    cursor: pointer;

    .title {
      position: absolute;
      top: 5px;
      right: 40px;
      font-size: 14px;
    }

    .clear-all {
      position: absolute;
      top: 3px;
      right: 5px;
      padding: 3px;
      font-size: 12px;
      text-decoration: none;
      color: #fff;
      background-color: #f66;
      border-radius: 5px;
      user-select: none;
    }
  }

  .empty {
    width: 100%;
    height: 50px;
    line-height: 50px;

    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;

    .icon-empty {
      width: 30px;
      height: 30px;
      display: inline;
    }

    span {
      margin-left: 10px;
      font-size: 20px;
      font-weight: 700;
    }
  }
}

.subscribe-channel-empty {
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .icon-empty {
    width: 60px;
    height: 60px;
  }

  span {
    font-size: 20px;
  }
}
</style>

<template>
  <div class="container">
    <div class="subscribe-channel" v-if="Object.keys(channelInfo).length !== 0">
      <div v-for="(sids, uid) in channelInfo" :key="uid">
        <p class="user-info" @click="toUserSpace(uid)">
          <img class="face" :src="`${userInfo[uid].face}@50w_50h_100Q_1c.webp`" />
          <span class="nickname">{{ userInfo[uid].name }}</span>
        </p>
        <div v-for="(channel, sid) in sids" :key="sid">
          <p class="channel" @click="toChannel(uid, sid)">
            <span class="title">{{ channel.title }}</span>
            <span
              class="clear-all"
              href="javascript:void(0);"
              @click="clearAll(uid, sid, $event)"
            >清空</span>
          </p>
          <ul v-if="channel.videos.length > 0">
            <li
              v-for="(video, index) in channel.videos"
              :key="index"
              @click="linkTo(uid, sid, index, video.bvid)"
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
    <div class="subscribe-channel-empty" v-else>
      <i class="icon-empty" v-html="getEmptyIcon()"></i>
      <span>您还没订阅任何频道</span>
    </div>
    <!-- 订阅频道 图片后缀 @380w_240h_100Q_1c.webp -->
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import {
  ISubscribeChannel,
  IUserInfo,
  IVideoData,
  TSubscribeChannel
} from '@/scripts/base/storage/template'
import ExtStorage from '@/scripts/base/storage/ExtStorage'
import _ from 'lodash'
import IconUtil from '@/scripts/base/IconUtil'
import { IChannelList } from '@/scripts/base/interface/IPopup'

@Component
export default class SubscribeChannel extends Vue {
  channelInfo: IChannelList = {}
  userInfo: IUserInfo = {}

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

    // 遍历视频信息
    _.forEach(this._localData.channelVideos, async (sids, uid) => {
      // 如果是空直接跳过
      if (_.isEmpty(sids)) return true

      // 构造临时存储
      data[uid] = {}
      user[uid] = {}

      // 用户 昵称 和 头像
      user[uid].name = this._localData.userInfo![uid].name
      user[uid].face = this._localData.userInfo![uid].face
      // 循环频道信息
      _.forEach(sids, (videos: IVideoData[], sid) => {
        if (_.isEmpty(videos)) {
          return true
        }
        data[uid][sid] = {}
        // 频道名称
        data[uid][sid].title = this._localData.channelInfo![sid].title
        // 频道下已阅的视频
        data[uid][sid].videos = videos.filter((video) => !video.readed)
      })
    })

    // 渲染页面
    this.channelInfo = data
    this.userInfo = user
  }

  /**
   * 清空一个频道下所有视频
   */
  clearAll(uid: number, sid: number, e: MouseEvent) {
    e.stopPropagation()
    this.channelInfo[uid][sid].videos = []

    this._localData.channelVideos![uid][sid] = _.map(
      this._localData.channelVideos![uid][sid],
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
  linkTo(uid: number, sid: number, index: number, bvid: string) {
    // 临时存储
    const channelInfo = this.channelInfo
    // 删除视频
    channelInfo[uid][sid].videos.splice(index, 1)
    // 渲染页面
    this.channelInfo = channelInfo

    // 获取该视频在本地存储的 index
    const localDataIndex = _.findIndex(
      this._localData.channelVideos![uid][sid],
      { bvid }
    )

    if (localDataIndex === -1) return

    // 打开页面
    window.open(
      `https://b23.tv/${this._localData.channelVideos![uid][sid][localDataIndex].bvid
      }`
    )

    // 设置为 已读
    this._localData.channelVideos![uid][sid][localDataIndex].readed = true

    this.save()
  }

  toUserSpace(uid: number) {
    window.open(`https://space.bilibili.com/${uid}`)
  }

  toChannel(uid: number, sid: number) {
    window.open(`https://space.bilibili.com/${uid}/channel/seriesdetail?sid=${sid}`)
  }

  // 保存本地存储
  private save() {
    ExtStorage.Instance().setStorage<TSubscribeChannel, ISubscribeChannel>(
      new TSubscribeChannel(this._localData)
    )
  }

  getEmptyIcon() {
    return IconUtil.Instance().EMPRY_DATA('#000')
  }
}
</script>
