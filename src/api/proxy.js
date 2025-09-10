export const config = { runtime: 'nodejs22.x' }

export default async function handler(req, res) {
  const segs = req.query.path || []
  const qs = req.url.includes('?') ? '?' + req.url.split('?')[1] : ''
  const url = `https://e.waimai.meituan.com/${(Array.isArray(segs) ? segs : []).join('/')}${qs}`

  const upstream = await fetch(url, {
    method: req.method,
    headers: {
      cookie: process.env.MT_COOKIE || '', // 在 Vercel 环境变量里配置 MT_COOKIE
      origin: 'https://e.waimai.meituan.com',
      referer: 'https://e.waimai.meituan.com/',
      'user-agent': req.headers['user-agent'] || 'Mozilla/5.0',
      accept: req.headers['accept'] || '*/*',
    },
    body: ['GET', 'HEAD'].includes(req.method) ? undefined : req.body,
  })

  const h = new Headers(upstream.headers)
  h.delete('set-cookie') // 不把上游 cookie 回传给浏览器

  res.status(upstream.status)
  h.forEach((v, k) => res.setHeader(k, v))
  const buf = Buffer.from(await upstream.arrayBuffer())
  res.send(buf)
}
