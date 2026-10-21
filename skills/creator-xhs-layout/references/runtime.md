# 运行与移植

Skill 入口、HTML 和 CSS 不依赖特定 Agent。Codex、Claude Code 或其他能读取 SKILL.md 并运行本地命令的 Agent 均可使用；没有执行环境的聊天工具只能提供分镜/代码，不能宣称完成本地 PNG 渲染。

## 依赖

- Node.js 22 或更高版本。
- Playwright 1.62.1 与 Chromium、Sharp 0.35.5。安装版本记录在 `scripts/package.json`，本地已存在依赖时可直接复用。
- 本机中文字体：优先 Noto Sans/Serif CJK、思源黑体/宋体，兼容 Microsoft YaHei、SimSun 和 PingFang。Skill 不携带字体文件，也不请求在线字体。

缺少依赖时先告知安装范围和缓存位置，再按当前环境的授权规则安装。以下命令会下载 npm 包及 Chromium，不要在依赖已存在时重复执行：

```sh
npm install --prefix <skill目录>/scripts
<skill目录>/scripts/node_modules/.bin/playwright install chromium
```

Windows 使用相应的 `npm.cmd`、`playwright.cmd`；本机存在受控 Node 运行时时，可通过 `NODE_PATH` 指向它的包目录，不把该绝对路径提交到仓库。

## 制作目录

复制整个 `assets/`，保持子目录关系。HTML 链接：

```html
<link rel="stylesheet" href="assets/upstream/xhs.css">
<link rel="stylesheet" href="assets/creator.css">
```

可选加载 `assets/upstream/xhs.js` 与 `assets/upstream/figure-kit.js`。原母版中的相对图片/脚本路径需要据此调整。源 HTML 必须替换 `.ph`，不要直接渲染母版目录作为最终图组。

```sh
node <skill目录>/scripts/render.cjs <制作目录>/index.html <新的输出目录>
node <skill目录>/scripts/render.cjs <制作目录>/index.html <另一个新目录> --theme dark
```

第二条只适用于纯产品界面图组。`--browser <本机Chromium路径>` 可以复用兼容浏览器，无需修改源码；默认使用 Playwright 管理的 Chromium。

渲染默认阻止所有网络请求，HTML 必须使用本地素材或 data URI；并非用于隔离恶意 HTML，只处理自己制作或已经审查的页面。HTML 会执行其中脚本。

## 上游兼容说明

`references/upstream/` 是原作者的产品界面风格文档快照，其中的路径以原仓库结构书写。引用 `assets/...` 时在本 Skill 对应 `assets/upstream/...`；展示图未打包，应直接查看 HTML 母版。

上游的“苹方/Inter/Geist”“一处橙”“固定底盘”和 Python 渲染命令只适用于原系统或已被本 Skill 替换，不覆盖新增四种风格。实际运行统一使用本页的 Node 命令和离线字体。
