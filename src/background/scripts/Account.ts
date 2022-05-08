// 获取当前登录的帐号
import _ from 'lodash'
import { browser, Cookies } from 'webextension-polyfill-ts'
import ExtStorage from '@/scripts/base/storage/ExtStorage'
import {
  IMultipleAccounts,
  TMultipleAccounts
} from '@/scripts/base/storage/template/TMultipleAccounts'
import { BilibiliApi } from '@/api'
;(async () => {
  const localData = await ExtStorage.Instance().getStorage<
    TMultipleAccounts,
    IMultipleAccounts
  >(
    new TMultipleAccounts({
      currentAccount: '',
      userList: []
    })
  )

  const cookies = await browser.cookies.getAll({
    domain: '.bilibili.com'
  })

  const accountCookieNames = [
    'SESSDATA',
    'bili_jct',
    'DedeUserID',
    'DedeUserID__ckMd5'
  ]

  const accountCookie: { [key: string]: string | undefined } = {}

  _.forEach(accountCookieNames, (key) => {
    const cookie = _.find(cookies, { name: key })

    accountCookie[key] = cookie?.value
  })

  // 当前账号
  localData.currentAccount = accountCookie.DedeUserID

  // 本地存储有当前账号
  if (_.find(localData.userList, { uid: accountCookie.DedeUserID })) {
    return
  }

  if (!accountCookie.DedeUserID) {
    return
  }

  const userInfo = await BilibiliApi.Instance().userCard(
    accountCookie.DedeUserID
  )

  localData.userList?.push({
    uid: accountCookie.DedeUserID,
    name: userInfo.data.card.name,
    avatar: userInfo.data.card.face,
    token: accountCookie.SESSDATA!,
    ckMd5: accountCookie.DedeUserID__ckMd5!,
    csrf: accountCookie.bili_jct!
  })

  // 保存
  ExtStorage.Instance().setStorage<TMultipleAccounts, IMultipleAccounts>(
    new TMultipleAccounts(localData)
  )
})()
