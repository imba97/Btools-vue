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

  ul>li {
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

      p {
        margin-left: 5px;
        width: 100px;
        font-size: 16px;

        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
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
}

.control-button {
  .current-account {
    color: darken($error-color, 10%);
    font-weight: 700;
  }
}

.invalid {
  filter: grayscale(100%);
  filter: gray;
}

.invalid-text {
  color: gray !important;
  font-weight: 700;
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
            <img :src="item.avatar" :class="{ invalid: invalidAccount && item.uid === currentAccount }" />
            <p>{{ item.name }}</p>
          </div>

          <div class="control-button">
            <button v-if="item.uid !== currentAccount" class="btn-success" @click="changeAccount(item)">切换</button>
            <span v-else class="current-account" :class="{ 'invalid-text': invalidAccount }">{{
                invalidAccount ? '登录失效' : '当前账号'
            }}</span>

            <button v-if="invalidAccount && item.uid === currentAccount" class="btn-info"
              @click="doShowLogin">登录</button>
            <button v-else class="btn-error" @click="logout(item.csrf, item.uid)">退出</button>
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
        <button class="btn-info mt-10" @click="showLogin = false">取消</button>
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import _ from 'lodash'
import qs from 'querystring'
import qrcode from 'qrcode'
import moment from 'moment'
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

  /**
   * 登录账号是否失效
   */
  public invalidAccount: boolean = false

  public currentAccount?: string = ''
  public accountList: IAccountItem[] = []

  /** 当前账号的 cookie */
  private _currentAccountCookie: Partial<Cookies.SetDetailsType>[] = []

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
      currentAccount: '',
      userList: []
    }))

    this._accountCookieNames = [
      'SESSDATA',
      'bili_jct',
      'DedeUserID',
      'DedeUserID__ckMd5'
    ]

    this.currentAccount = this._localData.currentAccount

    const userInfo = await BilibiliApi.Instance().myInfo()

    this.invalidAccount = userInfo.code === -101

    this.accountList = _.cloneDeep(this._localData.userList) || []

    // 没登录过帐号 自动切换到登录页
    this.checkAccountCount()
  }

  public addAccount() {
    this.refreshQrcode()
    this.showLogin = true
  }

  public async changeAccount(item: IAccountItem) {
    // 获取当前 cookies
    const cookies = await browser.cookies
      .getAll({
        domain: '.bilibili.com'
      })

    this._currentAccountCookie = []

    _.forEach(['SESSDATA', 'bili_jct'], key => {
      let cookie: any = _.find(cookies, { name: key })

      if (!cookie) {
        cookie = {
          url: 'https://bilibili.com',
          domain: '.bilibili.com',
          expirationDate: moment().add(180, 'days').valueOf() / 1000,
          httpOnly: key === 'SESSDATA',
          name: key,
          path: '/',
          sameSite: 'unspecified',
          secure: false,
          storeId: '0',
          value: ''
        }
      }

      switch (key) {
        case 'SESSDATA': cookie.value = item.token; break
        case 'bili_jct': cookie.value = item.csrf; break
      }

      if (cookie) {
        this._currentAccountCookie.push(cookie)
      }
    })

    this.currentAccount = item.uid
    this._localData.currentAccount = item.uid

    this.invalidAccount = false

    this.replaceToken()

    this.save()
  }

  public async logout(csrf: string, uid: string) {
    await BilibiliPassport.Instance().logout(csrf, uid)

    _.remove(this._localData.userList!, {
      uid
    })

    this.currentAccount = undefined
    this._localData.currentAccount = undefined

    this.accountList = _.cloneDeep(this._localData.userList) || []

    // 退出也重新替换当前 cookie
    this.replaceToken()

    this.checkAccountCount()
    this.save()
  }

  public doShowLogin() {
    this.showLogin = true
    this.refreshQrcode()
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

    _.forEach(this._accountCookieNames, key => {
      const cookie = _.find(cookies, { name: key })

      if (cookie) {
        this._currentAccountCookie.push(cookie)
      }
    })

    // 二维码
    this.qrcode = await qrcode.toDataURL(loginUrl, {
      color: {
        dark: primaryColor.hex()
      }
    })
  }

  private async checkQrcodeStatus() {
    const response = await BilibiliPassport.Instance().getLoginInfo(this.oauthKey)

    this.currentStatus = response.data || this.LoginStatus.NotScanned

    if (!response.status) return

    // 登陆成功
    if (this.checkLoginTimer) {
      const dataUrl = _.get(response, 'data.url', '')

      const urlSplit = dataUrl.split('?')
      const params = qs.parse(_.get(urlSplit, '1', '').replace(/%/g, '%25')) as {
        DedeUserID: string
        DedeUserID__ckMd5: string
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
          ckMd5: params.DedeUserID__ckMd5,
          csrf: params.bili_jct
        })
      }

      const cookie = _.find(this._currentAccountCookie, { name: 'DedeUserID' })
      if (!cookie?.value) {
        this.currentAccount = params.DedeUserID
        this._localData.currentAccount = params.DedeUserID
      }

      this.replaceToken()

      this.invalidAccount = false
      this.accountList = _.cloneDeep(this._localData.userList) || []
      this.currentStatus = this.LoginStatus.NotScanned

      this.checkAccountCount()

      this.save()
      clearInterval(this.checkLoginTimer)
    }
  }

  /**
   * 替换 token
   * 好耶，这样果然能成功
   */
  private replaceToken() {
    if (this.invalidAccount) return

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
