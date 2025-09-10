export const config = { runtime: 'nodejs22.x' }

const TARGET_CONFIGS = {
  mt: {
    baseUrl: 'https://e.waimai.meituan.com',
    cookie: process.env.MT_COOKIE || '',
    origin: 'https://e.waimai.meituan.com',
    referer: 'https://e.waimai.meituan.com/'
  },
  imt: {
    baseUrl: 'https://waimaieapp.meituan.com',
    cookie: process.env.MT_ITEM_COOKIE || '',
    origin: 'https://waimaieapp.meituan.com',
    referer: 'https://waimaieapp.meituan.com/'
  },
  ele: {
    baseUrl: 'https://app-api.shop.ele.me',
    cookie: '',
    origin: 'https://app-api.shop.ele.me',
    referer: 'https://app-api.shop.ele.me/'
  },
  ielealsc: {
    baseUrl: 'https://agw.alsc.taobao.com',
    cookie: '',
    origin: 'https://r.ele.me',
    referer: 'https://r.ele.me/doujin-isv-manage/index.html?__path__=eleChainIndex%2FchainIndex&_debug_=true'
  }
}

export default async function handler(req, res) {
  const { target, path } = req.query
  const targetConfig = TARGET_CONFIGS[target]
  
  if (!targetConfig) {
    return res.status(400).json({ error: 'Invalid target' })
  }

  const segs = path || []
  const qs = req.url.includes('?') ? '?' + req.url.split('?')[1] : ''
  const url = `${targetConfig.baseUrl}/${(Array.isArray(segs) ? segs : []).join('/')}${qs}`

  try {
    const upstream = await fetch(url, {
      method: req.method,
      headers: {
        cookie: targetConfig.cookie,
        origin: targetConfig.origin,
        referer: targetConfig.referer,
        'user-agent': req.headers['user-agent'] || 'Mozilla/5.0',
        'accept-language': req.headers['accept-language'] || 'zh-CN,zh;q=0.9',
        accept: req.headers['accept'] || '*/*',
        ...(target === 'ielealsc' && {
          'Content-Type': 'application/json',
          'x-requested-with': 'XMLHttpRequest'
        })
      },
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : req.body,
    })

    const h = new Headers(upstream.headers)
    h.delete('set-cookie') // 不把上游 cookie 回传给浏览器

    res.status(upstream.status)
    h.forEach((v, k) => res.setHeader(k, v))
    
    if (upstream.headers.get('content-type')?.includes('application/json')) {
      const data = await upstream.json()
      res.json(data)
    } else {
      const buf = Buffer.from(await upstream.arrayBuffer())
      res.send(buf)
    }
  } catch (error) {
    console.error('Proxy error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
