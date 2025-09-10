const { createProxyMiddleware } = require('http-proxy-middleware')

module.exports = (req, res) => {
  const { target, path } = req.query

  let targetUrl = ''
  let headers = {}

  switch (target) {
    case 'mt':
      targetUrl = 'https://e.waimai.meituan.com'
      headers = {
        cookie: '你的美团cookie',
        origin: 'https://e.waimai.meituan.com',
        referer: 'https://e.waimai.meituan.com/',
      }
      break
    case 'ele':
      targetUrl = 'https://app-api.shop.ele.me'
      headers = {
        origin: 'https://app-api.shop.ele.me',
        referer: 'https://app-api.shop.ele.me/',
      }
      break
    case 'elealsc':
      targetUrl = 'https://agw.alsc.taobao.com'
      headers = {
        origin: 'https://r.ele.me',
        referer: 'https://r.ele.me/doujin-isv-manage/index.html',
      }
      break
  }

  const proxy = createProxyMiddleware({
    target: targetUrl,
    changeOrigin: true,
    pathRewrite: { [`^/${target}`]: '' },
    onProxyReq: (proxyReq) => {
      Object.entries(headers).forEach(([key, value]) => {
        proxyReq.setHeader(key, value)
      })
    },
  })

  proxy(req, res)
}
