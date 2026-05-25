# 个人浏览器首页

一个使用 Next.js、TypeScript 和 Tailwind CSS 构建的个人浏览器新标签页产品雏形。当前版本同时保留 Web 部署能力，并支持生成 Chrome / Edge 可加载的新标签页扩展目录。

## 当前功能

- 当前时间、日期、问候语
- 搜索框，默认 Google，支持 Bing、YouTube、GitHub、Perplexity
- 可管理的快捷入口，支持分类、名称、网址、描述
- 今日待办，数据通过 `StorageAdapter` 保存
- 快捷笔记、天气、市场概览、历史、下载、插件、设置等模块
- 深色 / 浅色模式
- 移动端、笔记本和大屏响应式布局

## 运行

```bash
npm install
npm run dev
```

默认开发地址：

```text
http://localhost:3000
```

Web 版生产构建：

```bash
npm run build
```

启动 Web 版生产服务：

```bash
npm run start
```

## 扩展构建

生成 Chrome / Edge 可加载目录：

```bash
npm run build:extension
```

构建产物位于：

```text
out-extension
```

在 Chrome / Edge 中加载：

1. 打开扩展管理页。
2. 开启开发者模式。
3. 选择“加载已解压的扩展程序”。
4. 选择项目里的 `out-extension` 目录。

扩展入口配置位于 `extension/manifest.chrome.json`，其中 `chrome_url_overrides.newtab` 指向 `index.html`。

## 架构约束

- 业务组件不直接访问 `localStorage`，统一通过 `StorageAdapter`。
- 浏览器扩展 API 不在组件内直接调用，统一通过 adapter 封装。
- Web 版保留 Next.js API Route。
- Extension 版使用静态导出，不依赖 Next.js API Route。
- 市场概览在 Web 版走 `/api/market`，在扩展版走 client/provider 模式。

## 数据与存储

相关文件：

- `core/storage/StorageAdapter.ts`：存储接口
- `core/storage/LocalStorageAdapter.ts`：Web 本地存储实现
- `core/storage/ChromeStorageAdapter.ts`：扩展版 `chrome.storage` 实现
- `hooks/useLocalStorage.ts`：兼容现有组件 API，但底层已迁移到 adapter
- `core/storage/schema.ts`：应用数据备份结构、`schemaVersion` 和迁移函数

完整数据备份格式：

```json
{
  "app": "personal-browser-home",
  "schemaVersion": 1,
  "exportedAt": "2026-05-16T00:00:00.000Z",
  "records": {}
}
```

## 修改快捷入口

默认快捷入口在 `data/shortcuts.ts`。也可以在 `/settings` 的“快捷入口编辑”中直接新增、修改、删除，并恢复默认配置。

每个入口结构：

```ts
{
  id: "github",
  name: "GitHub",
  url: "https://github.com",
  description: "代码托管平台",
  category: "开发",
}
```

分类类型定义在 `types/home.ts` 的 `shortcutCategories`。

## 修改搜索引擎

默认搜索引擎在 `data/searchEngines.ts`。也可以在 `/settings` 的“搜索引擎编辑”中修改名称、占位文案、图标 URL 和搜索 URL 模板。

`urlTemplate` 必须包含 `{query}`：

```ts
{
  id: "google",
  name: "Google",
  placeholder: "搜索或输入网址",
  urlTemplate: "https://www.google.com/search?q={query}",
}
```

## 天气与市场数据

天气使用 Open-Meteo 免费接口，当前在 `hooks/useWeather.ts` 中实现，并通过 adapter 做 15 分钟缓存。

市场概览：

- Web 版：`hooks/useMarketQuotes.ts` 请求 `app/api/market/route.ts`。
- Extension 版：`hooks/useMarketQuotes.ts` 使用客户端 Stooq provider。
- 共享解析逻辑：`core/market/stooq.ts`。
- 接口失败时回退到 `data/investments.ts` 中的静态数据。

## 浏览器 API Adapter

扩展浏览器能力统一封装在：

- `core/browser/BrowserApiAdapter.ts`

当前已经定义书签、历史、下载的 adapter 边界。第三阶段再把 UI 模块接到 `chrome.bookmarks`、`chrome.history`、`chrome.downloads`。

## 部署

推荐 Web 版部署到 Vercel：

1. 将项目推送到 GitHub。
2. 在 Vercel 导入仓库。
3. Framework 选择 Next.js。
4. Build Command 使用 `npm run build`。

当前 Web 版不需要数据库和额外环境变量。

## 后续阶段

第三阶段计划：

- 接入 `chrome.bookmarks`
- 接入 `chrome.history`
- 接入 `chrome.downloads`
- 增加权限说明
- 增加扩展隐私说明
- 增加 Playwright 或基础 E2E 测试

## 第三阶段进展

已完成浏览器真实能力接入：

- `chrome.bookmarks`：书签页展示真实浏览器书签，并可加入首页快捷入口。
- `chrome.history`：历史页展示最近浏览器访问记录。
- `chrome.downloads`：下载页展示最近浏览器下载记录。
- 所有浏览器能力仍通过 `core/browser/BrowserApiAdapter.ts` 封装，组件不直接调用 `chrome.*`。

权限说明见 `extension/PERMISSIONS.md`，隐私说明见 `extension/PRIVACY.md`。

扩展构建校验：

```bash
npm run test:e2e
```
