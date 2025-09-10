# 数据监控项目部署指南

## 项目简介
这是一个数据监控应用程序，用于监控美团等平台的数据。本文档详细说明如何在Vercel上部署此项目。

## 部署准备工作

### 1. 安装依赖
```bash
# 使用npm
npm install

# 或使用pnpm
pnpm install
```

### 2. 本地开发测试
在部署前，建议先在本地测试确保应用正常运行：
```bash
npm run dev
```

然后访问 `http://localhost:5173` 测试功能。

## 部署到Vercel

### 关键问题说明
**为什么会出现404错误？**

Vercel的无服务器函数必须放在项目根目录的`api`文件夹下，这是Vercel平台的特定要求。如果API函数放在错误的位置（如`src/api`），部署后会导致404错误。

### 部署步骤

1. **确保根目录有api文件夹**
   - 项目已包含正确的`api/proxy.js`文件，用于处理代理请求
   - 检查`vercel.json`文件，确保重写规则正确配置：
     ```json
     {
       "rewrites": [
         {"source": "/mt/(.*)", "destination": "/api/proxy?target=mt&path=$1"},
         {"source": "/imt/(.*)", "destination": "/api/proxy?target=imt&path=$1"},
         {"source": "/ele/(.*)", "destination": "/api/proxy?target=ele&path=$1"},
         {"source": "/ielealsc/(.*)", "destination": "/api/proxy?target=ielealsc&path=$1"}
       ]
     }
     ```

2. **配置Vercel环境变量**
   - 登录Vercel账号，进入项目设置
   - 导航到"Environment Variables"（环境变量）部分
   - 添加以下环境变量（值来自`vercel.env.example`文件）：
     
     | 环境变量名称 | 说明 | 值 |
     |-------------|------|-----|
     | `MT_COOKIE` | 美团主API Cookie | 从vercel.env.example复制完整的cookie值 |
     | `MT_ITEM_COOKIE` | 美团商品详情API Cookie | 从vercel.env.example复制完整的itemCookie值 |

3. **部署项目**
   - 可以通过Vercel CLI或直接通过GitHub/GitLab集成部署
   - 使用CLI部署：
     ```bash
     # 安装Vercel CLI（如果未安装）
     npm i -g vercel
     
     # 登录并部署
     vercel login
     vercel
     ```
   - 或者通过Vercel网站导入Git仓库进行部署

## 常见问题排查

### 404错误
- 检查根目录是否有`api`文件夹
- 确认`api/proxy.js`文件存在
- 检查`vercel.json`中的重写规则是否正确

### 环境变量问题
- 确保在Vercel中正确配置了`MT_COOKIE`和`MT_ITEM_COOKIE`
- 可以在部署日志中检查环境变量是否正确加载

### 代理请求失败
- 检查Cookie是否过期（Cookie通常有有效期）
- 确认目标API地址是否变更

## 本地开发配置

对于本地开发，代理配置在`vite.config.js`中，使用`src/api/MT/cookie.js`中的Cookie值：
```javascript
// vite.config.js中的代理配置示例
import { cookie, itemCookie } from './src/api/MT/cookie'

server: {
  proxy: {
    '/mt': {
      target: 'https://e.waimai.meituan.com',
      changeOrigin: true,
      secure: false,
      rewrite: (path) => path.replace(/^\/mt/, ''),
      configure: (proxy) => {
        proxy.on('proxyReq', (proxyReq) => {
          proxyReq.setHeader('cookie', cookie)
          // 其他头信息...
        })
      },
    },
    // 其他代理配置...
  }
}
```

## 构建项目
如果需要生成生产环境构建文件：
```bash
npm run build
```

构建后的文件将位于`dist`目录中。