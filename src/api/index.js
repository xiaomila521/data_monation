import request from '@/utils/request'
import { cookie, itemCookie } from './MT/cookie'
const isDev = import.meta.env.DEV
// 美团
// 获取全部商铺
const TOKEN = '0rBQb7KkXu2mneIXlcgcevxt48dmjgdtmu51hFfSse4M*'
function createConfig() {
  let formData = new FormData()
  formData.append('uuid', '!f0052e04-8adb-4983-9538-5145779bcab6')
  formData.append('pushToken', TOKEN)
  const url = isDev ? '' : 'https://e.waimai.meituan.com'

  return {
    method: 'post',
    // Use dev proxy to avoid CORS in browser
    url: isDev
      ? '/mt/v2/chat/im/multi/pubids/get?ignoreSetRouterProxy=true&yodaReady=h5&csecplatform=4&csecversion=4.0.3&mtgsig=%7B%22a1%22%3A%221.2%22%2C%22a2%22%3A1757051171077%2C%22a3%22%3A%22973yy7u1563v5v1u14v6zz6wyx284w8980087u089889795858v13wwx%22%2C%22a5%22%3A%22gRPnR2Yhva%2BpX9%2FfVHEmEwZkqbjxFutvow1KduDMO3adu1sgxdxMwM3nqNmr%2Bx8ZVPXY9XinzCrATGTr1yE4CTXF%22%2C%22a6%22%3A%22hs1.6fGG1mJz1uyKuoZ9Ii5n8fVVtE32xF22ElgnpWUdzg6q1Fi93H7YffDuvUNItCrQF0rxZie5DCeHkU8Dc4AaxYroqX1iKnvASYP0TLwL5XjpwojhEYx8XdS5UfC6DHg6N%22%2C%22a8%22%3A%22473d386148d766bfa494d318c0a06e9b%22%2C%22a9%22%3A%224.0.3%2C7%2C86%22%2C%22a10%22%3A%2280%22%2C%22x0%22%3A4%2C%22d1%22%3A%22b94831e58b2cfb30b31e9b7b3264cad1%22%7D'
      : `${url}/v2/chat/im/multi/pubids/get?ignoreSetRouterProxy=true&yodaReady=h5&csecplatform=4&csecversion=4.0.3&mtgsig=%7B%22a1%22%3A%221.2%22%2C%22a2%22%3A1757051171077%2C%22a3%22%3A%22973yy7u1563v5v1u14v6zz6wyx284w8980087u089889795858v13wwx%22%2C%22a5%22%3A%22gRPnR2Yhva%2BpX9%2FfVHEmEwZkqbjxFutvow1KduDMO3adu1sgxdxMwM3nqNmr%2Bx8ZVPXY9XinzCrATGTr1yE4CTXF%22%2C%22a6%22%3A%22hs1.6fGG1mJz1uyKuoZ9Ii5n8fVVtE32xF22ElgnpWUdzg6q1Fi93H7YffDuvUNItCrQF0rxZie5DCeHkU8Dc4AaxYroqX1iKnvASYP0TLwL5XjpwojhEYx8XdS5UfC6DHg6N%22%2C%22a8%22%3A%22473d386148d766bfa494d318c0a06e9b%22%2C%22a9%22%3A%224.0.3%2C7%2C86%22%2C%22a10%22%3A%2280%22%2C%22x0%22%3A4%2C%22d1%22%3A%22b94831e58b2cfb30b31e9b7b3264cad1%22%7D`,
    headers: {
      // Do NOT set forbidden headers in the browser. Content-Type will be set automatically for FormData.
      Accept: '*/*',
      Cookie: cookie,
    },
    data: formData,
  }
}
export function getMTALLListApi() {
  const config = createConfig()
  return request(config)
}

function createItemConfig() {
  const url = isDev ? '' : 'https://waimaieapp.meituan.com'
  return {
    method: 'get',
    url: isDev ? '/imt/ad/v4/index/r/account/info' : `${url}/ad/v4/index/r/account/info`,
    params: {
      acctId: 177071395,
      token: TOKEN,
      platform: 0,
      bizad_cityId: 330200,
      bizad_second_city_id: 330200,
      bizad_third_city_id: 330203,
      _: Date.now(),
      yodaReady: 'h5',
      csecplatform: 4,
      csecversion: '4.0.3',
    },
    headers: {
      Accept: '*/*',
      Cookie: itemCookie,
    },
  }
}
// 获取各商铺信息
export function getMTItemInfoApi(item) {
  const itemConfig = createItemConfig()
  return request({
    ...itemConfig,
    params: {
      ...itemConfig.params,
      wmPoiId: item?.wmPoiId,
      _: Date.now(),
    },
  })
}

// 饿了么

var eleData =
  '{"metas":{"shopId":"99626094","ksid":"OTU1OGMTA1MzEyMDAwMzIzOTAxUTI0Zkx1WTFQ"},"params":{"request":{}}}'

var requestListConfig = {
  method: 'post',
  // use local proxy to avoid CORS
  url: '/ele/xtop/xtop.napos.keeper.shop.queryShopTree/1.0',
  headers: {
    'Content-Type': 'text/plain',
    Accept: '*/*',
  },
  data: eleData,
}

export function getEleAllListApi() {
  return request(requestListConfig)
}

var itemDataEle = { params: [{}] }

var itemConfigEle = {
  method: 'post',
  url: '/ielealsc/gw/h5api/alsc-ad-account.IGwBalanceService.findBalanceInfo?source=ELE&h=r.ele.me',
  headers: {
    'Current-shop-id': '',
    Ksid: 'OTU1OGMTA1MzEyMDAwMzIzOTAxUTI0Zkx1WTFQ',
    'Content-Type': 'application/json',
    Accept: '*/*',
  },
  data: itemDataEle,
}

export function getItemEleInfoApi(item) {
  return request({
    ...itemConfigEle,
    headers: {
      ...itemConfigEle.headers,
      'Current-shop-id': item.id + '',
    },
  })
  // return request(itemConfigEle)
}
