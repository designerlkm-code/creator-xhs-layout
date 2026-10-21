# Creator XHS Layout

把已有文案做成 1080×1440 小红书轮播图，输出可编辑 HTML、逐页 PNG、总览和检查报告。可供支持 Agent Skills 的本地 Agent 使用，不绑定单一模型服务。

基于 [Ian XHS Carousel](https://github.com/helloianneo/ian-xhs-carousel) 改编：保留作者的 20 个产品界面母版，增加四种视觉参考的独立规则和封面/正文模板。原始模板版权归 Ian，新增内容与修改范围见 [来源说明](skills/creator-xhs-layout/references/credits.md)。

| 风格 | 内容 | 模板 |
| --- | --- | --- |
| 产品界面 `product-ui` | 软件、工具、步骤、对比 | 上游 T01–T20，浅/深主题 |
| 研究报告 `research` | 方法论、观点论证、复盘 | R01 封面、R02 论述页 |
| 档案静物 `archive` | 主题收藏、材料研究 | A01 静物封面框架、A02 档案正文 |
| 戏剧叙事 `dramatic` | 单一冲突、关键转折 | D01 场景封面框架、D02 解析页 |
| 蓝白知识卡 `blueprint` | 概念、教程、知识链路 | B01 封面、B02 知识卡 |

Archive 和戏剧封面需另备主视觉，或调用当前 Agent 的图像工具。本仓库不包含照片生成模型、第三方参考原图或影视角色素材。四种参考风格来自视觉分析，不是任何公司的官方规范。

## 安装

```bash
npx -y skills add designerlkm-code/creator-xhs-layout -g --all
```

## 使用

也可将 `skills/creator-xhs-layout/` 放入目标 Agent 支持的 Skill 目录。安装后示例：

> 用 $creator-xhs-layout 将我提供的文案排成小红书图文，选择合适风格并输出 PNG 和可编辑源文件。

> 用 $creator-xhs-layout 做蓝白知识卡，先给我看分镜。

本 Skill 负责图上文字和排版，可接收 MyContent 或其他写作工具的成稿，不自动发布。

## 运行依赖

安装 Skill 不会自动安装运行依赖。渲染需要 Node.js 22+、Playwright 1.62.1、Sharp 0.35.5、兼容 Chromium 和本机中文字体。安装范围、复用已有浏览器和离线字体策略见 [运行说明](skills/creator-xhs-layout/references/runtime.md)。

```sh
node <skill目录>/scripts/render.cjs <制作目录>/index.html <新的输出目录>
```

输出 `01.png` 等逐页文件、`overview.png` 和 `qa.json`。输出目录必须不存在；检查失败返回非零退出码。默认阻止网络请求，素材应为本地文件或 data URI。

可渲染 [五种正文风格演示](skills/creator-xhs-layout/assets/demo.html)。它用于比较版式，不建议一篇图文每页换一种风格。

## 当前验证范围

- Windows 五种正文排版已渲染并逐页检查，每页 1080×1440。
- 产品界面深色版、占位检查、父容器裁字检查、防覆盖已通过。
- Archive 静物封面与戏剧场景的完整生图尚未验证。
- 尚未进行独立 Agent 留出测试或其他操作系统验证。

不保证平台流量或发布效果。Eagle 是可选参考来源，安装和运行不依赖用户素材库。

## 内容

本仓库只发布运行这个 Skill 所需的文件。本地评测样本、预期答案和运行记录不包含在公开包中。

## 许可

MIT，见 [LICENSE](LICENSE)。上游署名和修改说明见 [NOTICE.md](NOTICE.md)，安装后的 Skill 内也保留许可证原文。
