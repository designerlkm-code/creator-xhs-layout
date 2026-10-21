# 来源与改编

## 开源基础

- [Ian XHS Carousel](https://github.com/helloianneo/ian-xhs-carousel)，作者 Ian / helloianneo。
- 审阅版本：`1e16387315c29225deb54f2661a42fb503eb34e7`，2026-10-21 获取。
- 许可证原文保存在 [upstream-license.txt](upstream-license.txt)，MIT，Copyright (c) 2026 Ian。
- 原作者 [NOTICE](https://github.com/helloianneo/ian-xhs-carousel/blob/1e16387315c29225deb54f2661a42fb503eb34e7/NOTICE.md) 说明模板/视觉系统由 Ian 设计；本改编保留归属，未假称这些基础模板是原创。

`assets/upstream/` 保留 20 个母版、起始页、图标和图解工具；`references/upstream/` 保留设计、版式、图解和检查说明。仅 `xhs.css` 的在线字体导入改为本地离线字体策略。原渲染器未直接打包，新的 Node 渲染器参考其逐页截图、版式检查与总览流程，并增加分风格检查、错误退出和防覆盖。

本项目新增独立 Skill 入口、四种参考风格的 CSS/HTML、跨 Agent 运行说明和分风格检查。原作者的推广二维码、宣传信息和示例图片未打包。

## 用户指定的四组视觉参考

原作者：Elieen爱玲。以下为用户已收藏参考的公开来源链接，未复核帖子正文、发布时间或作者授权范围：

- [研究报告式封面拆解](https://www.xiaohongshu.com/explore/6a6e37a80000000027023b7c)：10 张。
- [Archive 静物封面教程](https://www.xiaohongshu.com/explore/6a69cfbd0000000004028b14)：12 张。
- [EVA 视觉语法教程](https://www.xiaohongshu.com/explore/6a66e1df0000000011018818)：13 张。
- [AI 概念知识卡](https://www.xiaohongshu.com/explore/6a662b99000000000f02b4ed)：9 张。

本 Skill 根据这 44 张本地参考的视觉分析独立编写规则和模板，没有复制参考图片、整段提示词、人物角色、商标或配套字体。参考图片显示部分原教程页序并不完整，不能声称已收录作者全部教程。图中的进一步来源署名未经本次独立核实，不当作官方设计规范。

用户的收藏可用于本地观察，不等于已获第三方原图再分发许可。因此公开包只含规则、代码和来源链接。需要加入品牌素材或他人图片时另行核对对应使用范围。
