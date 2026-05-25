# 扩展权限说明

`Personal Browser Home` 只申请新标签页产品当前需要的最小权限。

| 权限 | 用途 | 数据流向 |
| --- | --- | --- |
| `storage` | 保存快捷入口、搜索引擎、天气位置、模块开关、待办、笔记等配置 | 仅保存在浏览器本地 `chrome.storage` |
| `bookmarks` | 在书签页展示浏览器真实书签，并允许加入首页快捷入口 | 仅读取并在本地页面展示 |
| `history` | 在历史页展示浏览器最近访问记录 | 仅读取并在本地页面展示 |
| `downloads` | 在下载页展示浏览器最近下载记录 | 仅读取并在本地页面展示 |

## 网络访问

`host_permissions` 仅用于首页已有功能：

- `https://stooq.com/*`：扩展版市场概览行情。
- `https://api.open-meteo.com/*`：实时天气。
- `https://geocoding-api.open-meteo.com/*`：天气位置解析。
- `https://air-quality-api.open-meteo.com/*`：空气质量。

扩展不会把书签、历史、下载记录发送到这些接口。
