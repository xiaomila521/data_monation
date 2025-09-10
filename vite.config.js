import { fileURLToPath, URL } from 'node:url'
import { itemCookie } from './src/api/MT/cookie'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { viteSingleFile } from 'vite-plugin-singlefile'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools(), viteSingleFile()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/mt': {
        target: 'https://e.waimai.meituan.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/mt/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            // Inject cookie on the server side to avoid sending forbidden headers from the browser
            proxyReq.setHeader('cookie', require('./src/api/MT/cookie').cookie)
            proxyReq.setHeader('origin', 'https://e.waimai.meituan.com')
            proxyReq.setHeader('referer', 'https://e.waimai.meituan.com/')
            if (req && req.headers['user-agent']) {
              proxyReq.setHeader('user-agent', req.headers['user-agent'])
            }
            if (req && req.headers['accept-language']) {
              proxyReq.setHeader('accept-language', req.headers['accept-language'])
            }
          })
        },
      },
      '/imt': {
        target: 'https://waimaieapp.meituan.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/imt/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            // Inject cookie on the server side to avoid sending forbidden headers from the browser
            proxyReq.setHeader('cookie', itemCookie) // 用“能访问成功”的那份 Cookie
            proxyReq.setHeader('origin', 'https://waimaieapp.meituan.com')
            proxyReq.setHeader('referer', 'https://waimaieapp.meituan.com/')
            if (req && req.headers['user-agent']) {
              proxyReq.setHeader('user-agent', req.headers['user-agent'])
            }
            if (req && req.headers['accept-language']) {
              proxyReq.setHeader('accept-language', req.headers['accept-language'])
            }
          })
        },
      },
      // Ele.me API proxy
      '/ele': {
        target: 'https://app-api.shop.ele.me',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/ele/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            proxyReq.setHeader('origin', 'https://app-api.shop.ele.me')
            proxyReq.setHeader('referer', 'https://app-api.shop.ele.me/')
            if (req && req.headers['user-agent']) {
              proxyReq.setHeader('user-agent', req.headers['user-agent'])
            }
            if (req && req.headers['accept-language']) {
              proxyReq.setHeader('accept-language', req.headers['accept-language'])
            }
          })
        },
      },
      // Ele.me alsc (taobao) API proxy
      '/ielealsc': {
        target: 'https://agw.alsc.taobao.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/ielealsc/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            proxyReq.setHeader('Content-Type', 'application/json')
            // proxyReq.setHeader('Connection', 'keep-alive')
            proxyReq.setHeader('Origin', 'https://r.ele.me')
            proxyReq.setHeader(
              'Referer',
              'https://r.ele.me/doujin-isv-manage/index.html?__path__=eleChainIndex%2FchainIndex&_debug_=true',
            )
            if (req && req.headers['user-agent']) {
              proxyReq.setHeader('user-agent', req.headers['user-agent'])
            }
            if (req && req.headers['accept-language']) {
              proxyReq.setHeader('accept-language', req.headers['accept-language'])
            }
            proxyReq.setHeader('x-requested-with', 'XMLHttpRequest')
          })
        },
      },
    },
  },
})
