# ColorArchive 改善提议书

**日期：** 2026-03-18
**状态：** 待审批

---

## 总体判断

网站的页面结构和内容层已经比较完整。当前最大的缺口是：
1. **核心功能缺失**：没有调色板构建器、没有对比度检测，这两个是色彩工具用户最高频的需求
2. **Spectrum 页视觉粗糙**：矩阵格子太小，是展示性最强的页面但目前体验最弱
3. **Collections 数量太少**：只有 5 个，直接影响付费包的感知价值
4. **付费产品文件是存根**：下载文件内容极少，需要在 checkout 上线前生成真实内容

---

## 提议清单

### A — 功能类（用户核心需求）

---

#### A1. 自定义调色板构建器（Palette Builder）
**优先级：极高**

**问题：** 用户来色彩工具的第一目的是"凑一套颜色"，但目前只能一个一个复制，没有组合功能。

**方案：**
- 在颜色卡片上增加"加入调色板"的小按钮（＋图标）
- 导航栏或页面底部出现浮动的调色板托盘（显示已选颜色，最多 6 个）
- 托盘支持：一键复制整套 CSS vars、复制 JSON、清空
- 纯 localStorage，不需要后端

**涉及文件：**
- 新建 `src/lib/palette-builder.ts`（状态管理 + localStorage）
- 新建 `src/components/palette-builder-tray.tsx`（浮动托盘 UI）
- 修改 `src/components/color-card.tsx`（加"＋"按钮）
- 修改 `app/layout.tsx`（注入托盘）

**效果：** 让网站从"浏览工具"升级为"创作工具"，是付费包的最佳引导路径

---

#### A2. WCAG 对比度检测器
**优先级：高**

**问题：** 设计师选颜色时最关心的问题是"这个颜色配白字/黑字能过无障碍标准吗"，目前完全没有这个信息。

**方案：**
- 在颜色详情页的 RGB/HSL/Metrics 卡片旁，增加一个"Contrast"卡片
- 显示：白字对比度比值（如 3.2:1）、黑字对比度比值（如 6.4:1）
- 用颜色标记等级：AA Pass（绿）、AA Large Pass（黄）、Fail（红）
- 算法：相对亮度公式，纯前端计算，无需 API

**涉及文件：**
- `src/lib/color-utils.ts`（新增 `getContrastRatio()` 函数）
- `src/components/color-detail-page.tsx`（新增对比度卡片区域）

**效果：** 大幅提升专业度，让设计师、开发者真正愿意用这个工具做决策

---

### B — 视觉类（美观与体验）

---

#### B1. Spectrum 页矩阵格子优化
**优先级：高**

**问题：** Spectrum 是展示性最强的页面（36×14 色彩矩阵），但当前格子极小、无间距、hover 无反馈，视觉冲击力远低于应有水平。

**方案：**
- 格子从现有极小尺寸改为更高（`h-10` → `h-14` 或更大）
- hover 时浮出颜色名 + hex tooltip
- 点击跳转颜色详情页（已有但体验可强化）
- 在矩阵左侧加明度标签（Veil / Whisper / Mist...），顶部加色相名（Red / Orange...）

**涉及文件：**
- `src/components/spectrum-explorer-page.tsx`

**效果：** 让 Spectrum 成为最具视觉震撼力的页面，适合截图分享，提升品牌印象

---

#### B2. 首页 Hero 嵌入实色彩带
**优先级：中**

**问题：** 首页 hero 是纯文字，第一眼看不到颜色，降低了"色库"的直觉感知。

**方案：**
- 在 hero 标题下方、按钮行上方，插入一条由 archive 中随机抽取的 12-16 色组成的水平色带
- 色块无间距拼接，`h-3` 圆角，宽度自适应
- 每次页面加载顺序固定（用种子取固定切片，不随机，保持 SSG 一致性）

**涉及文件：**
- `src/components/color-archive-page.tsx`（或新增 hero section）

**效果：** 第一屏即呈现色彩，强化产品印象

---

#### B3. 颜色详情页色调带（Tonal Strip）
**优先级：中**

**问题：** 详情页展示了单个颜色的信息，但用户往往想知道"这个色系的完整色谱是什么"。

**方案：**
- 在颜色卡片下方增加一条同色相（±5°以内）全部明度级别的色带
- 显示 7-14 个色块横向排列，当前颜色高亮（加小三角指示）
- 点击任意色块跳转对应详情页

**涉及文件：**
- `src/components/color-detail-page.tsx`
- `src/lib/color-utils.ts`（新增 `getTonalStrip()` 函数）

**效果：** 让单色页变成色系导航，大幅提升页面间跳转和浏览深度

---

### C — 内容类（产品价值密度）

---

#### C1. 新增 3 个 Collections（5 → 8 个）
**优先级：高**

**问题：** 5 个 collections 太少，对付费包的感知价值影响大（"只有 5 套？"）。

**方案：新增以下 3 个：**

1. **Forest Terrain**（深绿、苔藓、棕土、暗琥珀、石灰）
   - 标签：natural / organic / outdoor / editorial
   - 适合：环保品牌、户外产品、编辑类排版

2. **Nordic Frost**（冰蓝、浅灰、极白、淡丁香、银雾）
   - 标签：minimal / clean / nordic / ui
   - 适合：科技产品、SaaS UI、极简落地页

3. **Candy Pop**（珊瑚橙、柠檬黄、薄荷绿、粉紫、天蓝）
   - 标签：vibrant / playful / social / campaign
   - 适合：社交媒体、D2C 品牌、活动页面

**涉及文件：**
- `src/lib/collections.ts`（新增 3 个 collection 对象）
- `src/lib/palette-packs.ts`（更新 pack 的 previewCollections）

**效果：** 内容密度翻倍，付费包从"5 套"变"8 套"，直接提升感知价值

---

#### C2. Product Examples 页面加入视觉 UI 预览
**优先级：中**

**问题：** 当前 Product Examples 页是纯文字和链接，没有任何视觉展示，无法让用户直观感受"买了能得到什么"。

**方案：**
- 用 collections 的颜色数据，在页面内渲染 2-3 个"假 UI 卡片"：
  - 一个模拟落地页 hero 区（背景用 collection 主色，按钮用 accent 色）
  - 一个模拟品牌色板展示
  - 一个模拟 CSS 代码片段
- 全部用 inline 样式 + Tailwind 实现，纯静态，无图片

**涉及文件：**
- `src/components/product-examples-page.tsx`

**效果：** 让"产品价值"可视化，直接提升付费转化意愿

---

### D — 技术/商务准备类

---

#### D1. 构建时生成真实下载文件
**优先级：中**

**问题：** `public/downloads/` 里的文件是手写存根，内容极少（只有 2-3 个颜色）。Checkout 上线后买家下载的东西内容不够。

**方案：**
- 新建 `scripts/generate-downloads.ts`
- 在 `npm run build` 前运行，从 `collections.ts` 数据自动生成：
  - 每个 collection 的完整 CSS variable 文件（5 个颜色 × N 个 collections）
  - 完整 JSON 导出
  - Tailwind 4 CSS variable 配置片段
- 输出到 `public/downloads/`，覆盖原存根

**涉及文件：**
- 新建 `scripts/generate-downloads.ts`
- 修改 `package.json`（prebuild script）

**效果：** Checkout 上线即可交付真实内容，不需要再手动维护下载文件

---

#### D2. 颜色详情页 OG 图片（动态 SVG）
**优先级：低**

**问题：** 分享某个颜色页面到社交媒体时，OG 图片是通用的，没有体现那个颜色。

**方案：**
- 利用 Next.js App Router 的 `opengraph-image.tsx` 路由，为每个颜色生成动态 OG 图片
- 图片内容：大色块背景 + 颜色名 + hex + ColorArchive logo
- 纯 Next.js ImageResponse，无需第三方服务

**涉及文件：**
- 新建 `app/colors/[slug]/opengraph-image.tsx`

**效果：** 社交分享体验大幅提升，有助于口碑传播

---

## 优先级汇总

| # | 提议 | 类别 | 优先级 | 难度 |
|---|------|------|--------|------|
| A1 | 自定义调色板构建器 | 功能 | 极高 | 中 |
| A2 | WCAG 对比度检测器 | 功能 | 高 | 低 |
| B1 | Spectrum 矩阵格子优化 | 视觉 | 高 | 低 |
| C1 | 新增 3 个 Collections | 内容 | 高 | 低 |
| B2 | 首页 Hero 色彩带 | 视觉 | 中 | 低 |
| B3 | 颜色详情页色调带 | 视觉 | 中 | 低 |
| C2 | Product Examples 视觉预览 | 内容 | 中 | 中 |
| D1 | 构建时生成下载文件 | 技术 | 中 | 中 |
| D2 | 颜色 OG 图片 | 技术 | 低 | 中 |

---

## 建议执行顺序

**第一批（最快见效）：** A2 + B1 + C1
→ 对比度检测器 + Spectrum 优化 + 3 个新 collections，全部改动量小但效果直接

**第二批（核心功能）：** A1 + B3
→ 调色板构建器是最大的功能投入，色调带是配套的发现路径

**第三批（商务准备）：** C2 + D1 + B2
→ 面向付费转化和 checkout 上线前的最终准备

---

*请审批后开始执行。可以全部批准，也可以选择其中某几项优先做。*
