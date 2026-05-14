# 个人浏览器首页

一个使用 Next.js、TypeScript 和 Tailwind CSS 构建的个人浏览器首页。第一版只使用本地配置文件和 `localStorage`，适合部署成网页，也方便后续改造成 Chrome 新标签页扩展。

## 功能

- 当前时间、日期和问候语
- 大搜索框，默认 Google，并预留 Bing、YouTube、GitHub、Perplexity
- 分类快捷入口：AI 工具、投资、学习、开发、娱乐、服务器
- 今日待办：新增、完成、删除，数据保存在 `localStorage`
- 投资关注列表：NVDA、MSFT、META、MU、QQQM、黄金
- 真实天气：使用 Open-Meteo 免费接口获取当前天气和空气质量
- 深色/浅色模式切换
- 响应式卡片布局，兼顾 16:9 屏幕和移动端
- 左侧页面入口：书签、历史记录、下载、插件、笔记、设置

## 页面结构

- `/`：浏览器首页
- `/bookmarks`：本地书签管理，后续可接 `chrome.bookmarks`
- `/history`：首页操作历史，后续可接 `chrome.history`
- `/downloads`：常用下载入口，后续可接 `chrome.downloads`
- `/plugins`：首页模块开关
- `/notes`：本地笔记
- `/settings`：默认搜索引擎、历史记录开关、本地数据导入导出

## 运行

```bash
npm install
npm run dev
```

默认开发地址是：

```text
http://localhost:3000
```

构建生产版本：

```bash
npm run build
```

启动生产服务：

```bash
npm run start
```

## 修改快捷网站

快捷入口都放在 `data/shortcuts.ts`。

每个入口结构如下：

```ts
{
  id: "github",
  name: "GitHub",
  url: "https://github.com",
  description: "代码仓库、Issue、PR 和开源项目。",
  category: "开发",
}
```

分类类型定义在 `types/home.ts` 的 `shortcutCategories`。如果要新增分类，先修改那里，再给入口使用新的分类名。

## 修改搜索引擎

搜索引擎配置在 `data/searchEngines.ts`。

`urlTemplate` 中的 `{query}` 会被替换为编码后的搜索内容：

```ts
{
  id: "google",
  name: "Google",
  placeholder: "用 Google 搜索，或输入网址",
  urlTemplate: "https://www.google.com/search?q={query}",
}
```

## 修改投资关注列表

投资关注列表配置在 `data/investments.ts`。每个资产可以配置 `stooqSymbol`，例如：

```ts
{
  symbol: "NVDA",
  stooqSymbol: "nvda.us",
  name: "NVIDIA",
}
```

市场概览会通过 `app/api/market/route.ts` 请求 Stooq 免费报价接口，返回当前价和相对上一收盘价的涨跌幅。接口失败时会自动回退到本地 `quote` 静态数据。

如果以后要换成 Finnhub、Alpha Vantage、Polygon 等需要密钥的数据源，可以保留 `InvestmentAsset` 和 `InvestmentQuote` 结构，只替换 `app/api/market/route.ts` 里的适配逻辑。

## 天气数据

天气卡片使用 Open-Meteo：

- Geocoding API：把设置页中的位置转换成经纬度
- Forecast API：获取当前温度、体感温度、湿度、天气代码、风速
- Air Quality API：获取 PM2.5 和 US AQI

当前实现位于 `hooks/useWeather.ts`，默认做 15 分钟 localStorage 缓存。位置可在 `/settings` 的“天气位置”里修改。

## 部署

推荐部署到 Vercel：

1. 将项目推送到 GitHub。
2. 在 Vercel 导入仓库。
3. Framework 选择 Next.js。
4. Build Command 使用 `npm run build`。

这个项目没有后端和数据库，默认部署不需要额外环境变量。

## 后续改造成 Chrome 新标签页扩展

这个项目已经把数据和 UI 分开，后续改成扩展时主要做三件事：

1. 改为静态导出。

   在 `next.config.ts` 中加入：

   ```ts
   const nextConfig: NextConfig = {
     output: "export",
     images: {
       unoptimized: true,
     },
   };
   ```

2. 新增扩展清单。

   在 `public/manifest.json` 中加入类似配置：

   ```json
   {
     "manifest_version": 3,
     "name": "个人浏览器首页",
     "version": "0.1.0",
     "chrome_url_overrides": {
       "newtab": "index.html"
     }
   }
   ```

3. 构建并加载扩展。

   ```bash
   npm run build
   ```

   使用 Chrome 的“加载已解压的扩展程序”，选择生成的 `out` 目录。

注意：扩展环境下依然可以使用 `localStorage`。如果以后要同步待办或配置，可以再升级到 `chrome.storage.sync`。
