<style lang="scss" scoped>
@import "~@/assets/styles/variables.scss";

.account-container {
  height: 100%;
}

.account-list {
  height: 100%;

  display: flex;
  flex-direction: column;

  .account-control-button {
    padding: 0 10px;
    height: 40px;

    display: flex;
    justify-content: space-between;
    align-items: center;

    span {
      font-size: 16px;
    }

    button {
      padding: 3px 5px;
      background-color: darken($success-color, 20%);
      color: #fff;

      border: 1px $success-color solid;
      border-radius: 5px;

      cursor: pointer;
    }
  }

  ul {
    height: 415px;
    overflow-y: auto;
  }

  ul > li {
    padding: 5px 10px;

    display: flex;
    justify-content: space-between;
    align-items: center;

    &:nth-child(2n - 1) {
      background-color: lighten($primary-color, 26%);
    }

    &:nth-child(2n) {
      background-color: lighten($primary-color, 28%);
    }

    .avatar {
      display: flex;
      align-items: center;

      img {
        width: 40px;
        height: 40px;
        border-radius: 100%;
      }

      span {
        margin-left: 10px;
        font-size: 16px;
      }
    }
  }
}

.login {
  height: 100%;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .qrcode {
    width: 220px;
    height: 220px;

    p {
      height: 21px;
    }
  }

  .iconfont {
    font-size: 20px;
  }

  .error-message,
  .success-message {
    display: flex;
    align-items: center;

    span {
      height: 21px;
      line-height: 21px;
    }
  }

  .error-message {
    color: $error-color;
  }

  .success-message {
    color: $success-color;
  }

  .cancel {
    margin-top: 20px;
    padding: 3px 5px;

    background-color: #f0f0f0;
    color: #999;

    border: 1px #ccc solid;
    border-radius: 5px;

    cursor: pointer;
  }
}

.control-button {
  .logout-button {
    // TODO: 按钮样式封装
    padding: 3px 5px;

    background-color: lighten($error-color, 10%);
    color: #fff;

    border: 1px #fff solid;
    border-radius: 5px;

    cursor: pointer;
  }
}
</style>

<template>
  <div class="account-container">
    <div v-show="!showLogin" class="account-list">
      <!-- 账号数 添加按钮 -->
      <div class="account-control-button">
        <span>帐号列表 ({{ accountList.length }})</span>
        <button @click="addAccount">添加帐号</button>
      </div>

      <!-- 帐号列表 -->
      <ul>
        <li v-for="item in accountList" :key="item.uid">
          <div class="avatar">
            <img :src="item.avatar" />
            <span>{{ item.name }}</span>
          </div>

          <div class="control-button">
            <button class="logout-button" @click="logout(item.csrf, item.uid)">退出</button>
          </div>
        </li>
      </ul>
    </div>

    <div v-show="showLogin" class="login">
      <img v-show="qrcode !== ''" class="qrcode" :src="qrcode" />

      <p v-show="currentStatus === LoginStatus.NotScanned">
        <span>请扫描二维码登录</span>
      </p>
      <p v-show="currentStatus === LoginStatus.Scanned" class="success-message">
        <i class="iconfont icon-success"></i>
        <span>扫描成功</span>
      </p>

      <p v-show="accountList.length > 0">
        <button class="cancel" @click="showLogin = false">取消</button>
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import _ from 'lodash'
import qs from 'querystring'
import qrcode from 'qrcode'
import { Vue, Component, Watch } from 'vue-property-decorator'

import { primaryColor } from '@/assets/styles/variables'

import { BilibiliApi, BilibiliPassport } from '@/api'
import { IAccountItem } from '@/scripts/base/interface/IMultipleAccounts'

import ExtStorage from '@/scripts/base/storage/ExtStorage'
import { TMultipleAccounts, IMultipleAccounts } from '@/scripts/base/storage/template/TMultipleAccounts'
import { browser, Cookies } from 'webextension-polyfill-ts'

@Component({
  name: 'MultipleAccounts'
})
export default class MultipleAccounts extends Vue {

  private _localData: IMultipleAccounts = {}

  public qrcode: string = ''
  public oauthKey: string = ''

  public showLogin: boolean = false

  public checkLoginTimer: number | null = null

  public LoginStatus = {
    /** 未扫描 */
    NotScanned: -4,
    /** 已扫描 */
    Scanned: -5
  }

  public currentStatus: number = this.LoginStatus.NotScanned

  public accountList: IAccountItem[] = []

  /** 当前账号的 cookie */
  private _currentAccountCookie: Cookies.Cookie[] = []

  private _accountCookieNames: string[] = []

  @Watch('showLogin')
  onShowLoginChanged(val: boolean) {
    if (this.checkLoginTimer) clearInterval(this.checkLoginTimer)

    if (val) {
      this.checkLoginTimer = window.setInterval(() => {
        this.checkQrcodeStatus()
      }, 1000)
    }
  }

  async created() {
    this._localData = await ExtStorage.Instance().getStorage<
      TMultipleAccounts,
      IMultipleAccounts
    >(new TMultipleAccounts({
      userList: []
    }))

    this.accountList = _.cloneDeep(this._localData.userList) || []

    // const test = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    // for (let i = 0; i < test.length; i++) {
    //   const element = test[i];

    //   this.accountList.push({
    //     uid: `${element}`,
    //     name: `imba久期${element}`,
    //     avatar: 'http://i1.hdslb.com/bfs/face/cda293b4bf23052d52c58471702ff90e32145040.jpg',
    //     token: '123',
    //     csrf: '456'
    //   })
    // }

    // 没登录过帐号 自动切换到登录页
    this.checkAccountCount()

  }

  public addAccount() {
    this.refreshQrcode()
    this.showLogin = true
  }

  public async logout(csrf: string, uid: string) {
    await BilibiliPassport.Instance().logout(csrf, uid)

    _.remove(this._localData.userList!, {
      uid
    })

    this.accountList = _.cloneDeep(this._localData.userList) || []

    // 退出也重新替换当前 cookie 
    this.replaceToken()

    this.checkAccountCount()
    this.save()
  }

  private checkAccountCount() {
    this.showLogin = this.accountList.length === 0
    if (this.showLogin) {
      this.refreshQrcode()
    }
  }

  /**
   * 刷新二维码
   */
  private async refreshQrcode() {
    const loginUrlResponse = await BilibiliPassport.Instance().getLoginUrl()

    const loginUrl = _.get(loginUrlResponse, 'data.url', '')

    this.oauthKey = _.get(loginUrlResponse, 'data.oauthKey', '')

    // 获取当前 cookie

    // TODO: 禁止 response set-cookie
    // 登陆后会 set-cookie 目前不知道怎么禁止 response headers set-cookie
    // 现在就只能获取原来的 cookie 登陆后换回原来的
    const cookies = await browser.cookies
      .getAll({
        domain: '.bilibili.com'
      })

    this._currentAccountCookie = []
    this._accountCookieNames = [
      'SESSDATA',
      'bili_jct',
      'DedeUserID',
      'DedeUserID__ckMd5'
    ]

    _.forEach(this._accountCookieNames, key => {
      const cookie = _.find(cookies, { name: key })

      if (cookie) {
        this._currentAccountCookie.push(cookie)
      }
    })

    console.log(this._currentAccountCookie)

    // 二维码
    this.qrcode = await qrcode.toDataURL(loginUrl, {
      color: {
        dark: primaryColor.hex()
      }
    })
  }

  private async checkQrcodeStatus() {
    const response = await BilibiliPassport.Instance().getLoginInfo(this.oauthKey)

    console.log(response)

    this.currentStatus = response.data || this.LoginStatus.NotScanned

    if (!response.status) return

    // 登陆成功
    if (this.checkLoginTimer) {
      const dataUrl = _.get(response, 'data.url', '')

      const urlSplit = dataUrl.split('?')
      const params = qs.parse(_.get(urlSplit, '1', '').replace(/%/g, '%25')) as {
        DedeUserID: string
        SESSDATA: string
        bili_jct: string
      }

      const savedUserInfo = _.find(this._localData.userList, {
        uid: params.DedeUserID
      })

      if (savedUserInfo) {
        savedUserInfo.token = params.SESSDATA
        savedUserInfo.csrf = params.bili_jct
      } else {

        const userInfo = await BilibiliApi.Instance().userCard(params.DedeUserID)

        this._localData.userList?.push({
          uid: params.DedeUserID,
          name: userInfo.data.card.name,
          avatar: userInfo.data.card.face,
          token: params.SESSDATA,
          csrf: params.bili_jct
        })
      }

      this.replaceToken()

      this.accountList = _.cloneDeep(this._localData.userList) || []
      this.currentStatus = this.LoginStatus.NotScanned

      this.checkAccountCount()

      this.save()
      clearInterval(this.checkLoginTimer)
      return
    }
  }

  /**
   * 替换 token
   * 好耶，这样果然能成功
   */
  private replaceToken() {
    _.forEach(this._currentAccountCookie, cookie => {
      browser.cookies.set({
        url: 'https://bilibili.com',
        domain: cookie.domain,
        expirationDate: cookie.expirationDate,
        httpOnly: cookie.httpOnly,
        name: cookie.name,
        path: cookie.path,
        sameSite: cookie.sameSite,
        secure: cookie.secure,
        storeId: cookie.storeId,
        value: cookie.value
      })
    })
  }

  private save() {

    this.accountList = this._localData.userList || []

    ExtStorage.Instance().setStorage<
      TMultipleAccounts,
      IMultipleAccounts
    >(new TMultipleAccounts(
      this._localData
    ))
  }
}

</script>
