# tanrunzhi.github.io

> 一个纯前端、零依赖的实用小工具集合，所有功能均在浏览器本地运行，数据不上传服务器。

[![Static](https://img.shields.io/badge/Static-Yes-2563eb)](https://github.com/TanRunzhi/tanrunzhi.github.io)
[![No Backend](https://img.shields.io/badge/No%20Backend-Yes-2563eb)](https://github.com/TanRunzhi/tanrunzhi.github.io)
[![Language](https://img.shields.io/badge/Language-中文-orange)](https://github.com/TanRunzhi/tanrunzhi.github.io)
[![Privacy](https://img.shields.io/badge/Privacy-100%25%20Local-22c55e)](https://github.com/TanRunzhi/tanrunzhi.github.io)

## 简介

本项目是一个托管在 GitHub Pages 上的个人工具箱，集成了加解密、UUID 生成、常用字符串管理等高频小工具。所有计算与存储都发生在你的浏览器中，**不会向任何服务器发送数据**，可在完全离线的环境下使用。

## ✨ 功能特性

- 🔐 **加解密**：Base64、AES-GCM、SHA1、MD5，支持历史记录。
- 🆔 **UUID 生成**：标准 UUID 单条 / 批量生成与一键复制。
- 🗃️ **本地数据（常用字符串）**：保存模板 / 片段，支持占位符，复制时自动填充时间 / 时间戳。
- ⚙️ **配置同步**：导出 / 导入浏览器 `localStorage`，方便多设备间同步设置。
- 🕒 **时间胶囊**：实时时钟，点击或悬停即可复制多种时间格式，并记住上次选择。
- 🔒 **隐私优先**：无后端、无追踪、无外部依赖，纯静态文件。

## 📦 模块一览

| 模块 | 路径 | 说明 |
| --- | --- | --- |
| 主页 / 路由导航 | [`index.html`](index.html) | 各工具入口、搜索、配置同步、本地数据抽屉 |
| 加解密工具 | [`crypto/crypto.html`](crypto/crypto.html) | Base64 / AES / SHA1 / MD5，含历史记录与时间胶囊 |
| UUID 生成器 | [`uuid/uuid.html`](uuid/uuid.html) | 单条 / 批量生成 UUID，一键复制 |
| 本地数据（独立页） | [`data/localdb.html`](data/localdb.html) | 常用字符串管理面板的独立页面版 |

> 主页右上角提供「❔ 说明」按钮；各工具页右上角（卡片内）提供「🗃️ 本地数据」抽屉，可随时查看用法。

## 🗃️ 本地数据与占位符

「本地数据」用于保存常用字符串（模板、链接、密钥片段等）。内容中可写入**占位符**，复制时会自动替换为实时值：

| 占位符 | 复制时替换为 | 示例 |
| --- | --- | --- |
| `{yyyy-MM-dd}` | 当前日期 | `2026-09-29` |
| `{yyyy-MM-dd HH:mm:ss}` | 当前日期时间 | `2026-09-29 14:03:07` |
| `{HH:mm:ss}` | 当前时间 | `14:03:07` |
| `{ts13}` | 13 位时间戳（毫秒） | `1769652187000` |
| `{ts10}` | 10 位时间戳（秒） | `1769652187` |

还可自由组合单字符：`{yyyy}` 年、`{MM}` 月、`{dd}` 日、`{HH}` 时、`{mm}` 分、`{ss}` 秒。例如 `{yyyy}{MM}{dd}` 可生成 `20260929`。

## ⚙️ 配置同步

在首页底部「配置同步」区块，可：

- **导出**：生成 JSON 文件下载，或复制 JSON 文本到剪贴板；
- **导入**：粘贴 JSON 文本，或选择 `.json` 文件，应用后自动刷新。

导出内容为当前浏览器 `localStorage` 的全部配置（加解密历史、常用字符串、抽屉状态等），用于不同电脑间同步。

## 🕒 时间胶囊

加解密页顶部的时间胶囊每秒刷新，提供多种复制形式：

- **点击胶囊**：按「上次选择」的格式复制（默认 `yyyy-MM-dd HH:mm:ss`）；
- **悬停胶囊**：弹出菜单，可切换 `yyyy-MM-dd HH:mm:ss` / `yyyy-MM-dd` / 13 位时间戳 / 10 位时间戳；
- 当前格式在菜单中打勾高亮，选择会被记住，下次点击沿用。

## 🚀 本地运行

纯静态站点，无需构建。推荐用本地静态服务器打开（剪贴板 API 在 `https` / `localhost` 下体验最佳）：

```bash
# 在项目根目录执行其一
python3 -m http.server 8000
# 或
npx serve .
```

然后浏览器访问 `http://localhost:8000/`。直接双击 `index.html` 以 `file://` 打开也可使用，但部分浏览器会限制剪贴板权限（已内置 `execCommand` 兜底方案）。

## 📁 目录结构

```text
.
├── index.html            # 主页 / 路由导航
├── crypto/
│   └── crypto.html       # 加解密工具
├── uuid/
│   └── uuid.html         # UUID 生成器
├── data/
│   └── localdb.html      # 本地数据（独立页）
├── demo/
│   └── demo.html         # 开发自测页（非正式功能）
└── assets/
    ├── snippets.js       # 常用字符串数据层（localStorage 封装）
    └── localdb-panel.js  # 全局右侧抽屉组件
```

## 🛠️ 技术栈

- 原生 HTML / CSS / JavaScript，**无框架、无构建步骤**；
- 加解密使用浏览器原生 **Web Crypto API**（AES-GCM、SHA-1、PBKDF2），MD5 为内置纯 JS 实现；
- 数据持久化使用 `localStorage`；
- 全部图标为内联 SVG / Emoji，离线可用。

## 🔒 隐私说明

本项目**没有任何后端**，所有运算与存储均在你的浏览器本地完成。历史记录、常用字符串等数据只保存在当前浏览器，清除浏览器数据或更换设备后将无法恢复，请妥善保管密钥。

## 📄 许可证

仓库当前未包含 LICENSE 文件。你可以阅读、学习并自行修改使用；若计划对外分发或商用，请自行补充合适的开源许可证。

---

⭐ 如果对你有帮助，欢迎在 [GitHub](https://github.com/TanRunzhi/tanrunzhi.github.io) 上 Star！
