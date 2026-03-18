# ColorArchive 项目备忘录

最后更新：2026-03-18

## 说明

这份文件是 `ColorArchive` 的长期产品备忘录。

后续项目方向、设计判断、部署方案、功能范围、品牌思路和路线图发生变化时，都应持续更新这份文档。

## 项目名称

ColorArchive

## 当前一句话版本

ColorArchive = 一个以“颜色档案馆”为核心，并延伸出轻量颜色生成工具的静态色彩项目。

## 项目定位

ColorArchive 的核心概念是“颜色档案馆 / Color Library”。

当前方向仍然以颜色档案馆为核心，但已经从“严格单页面”升级为“静态多页面轻产品”：

- 主页面仍然是颜色档案馆
- 新增独立搜索页，用于快速查找颜色
- 新增 All Colors 页面，用高密度方式一次性查看完整档案
- 新增 Collections 页面，用可分享的成套 palette 承接内容价值
- 新增 Collection detail 页面，用编辑型专题内容强化 collections 的“可读性”和 SEO
- 新增 Favorites 页面，用浏览器本地收藏承接回访需求
- 新增 Recent 页面，用浏览器本地最近查看承接继续浏览需求
- 新增 Spectrum Explorer 页面，用颜色矩阵而不是卡片来浏览档案
- 新增 Surprise 页面，用随机发现强化探索感
- 新增实验性工具页面，例如“输入一个词，生成一个颜色”
- 新增颜色详情页，用于承接更完整的颜色信息和后续 SEO 可能性
- 新增 Support 页面，用来承接后续商业化入口和支持方式
- 新增 Packs 页面，用产品化 palette 承接实际销售路径
- 新增 Pack detail 页面，用单个商品页承接更完整的产品信息
- 新增 Product Examples 页面，用公开产品示例承接 Lemon / Stripe 等支付平台审核
- 新增 Free Sample Pack 页面，用现有下载资产承接免费层和 lead magnet
- 新增 Waitlist 页面，用静态方式承接预热期兴趣流量
- 新增 Thanks 页面，用作支付完成后的静态回跳页面
- 新增 Cancel 页面，用作支付取消后的静态回跳页面
- 整体仍保持 GitHub Pages 兼容、纯静态、无后端

## 当前已确定事项

- 域名已购买：`colorarchive.me`
- 域名注册商：Namecheap
- 当前计划部署方式：GitHub Pages
- 技术方向：Next.js + TypeScript + Tailwind CSS
- 部署约束：必须兼容 GitHub Pages，因此优先使用静态导出
- 产品形态：以档案主页为核心，逐步增加少量静态工具页
- 品牌名：`ColorArchive`
- 当前已接入 `logo_v1` 资产作为站点 header / footer / icon / social preview 的基础品牌素材

## 为什么选择这个方向

相比一开始就做复杂产品，先做档案主页 + 少量工具页更适合快速上线，也更符合“颜色档案馆”的核心体验：

- 打开页面就能浏览大量颜色
- 按规则排序，形成连续的视觉体验
- 更容易部署到 GitHub Pages
- 更容易先做出一个美观、完整、可分享的 MVP
- 同时保留后续扩展成“颜色实验室 / 颜色工具集”的空间

## MVP 核心功能

第一阶段核心内容：

1. 主页展示所有颜色
2. 颜色网格 / 卡片布局
3. 搜索颜色（按名称或 HEX）
4. 排序功能
5. 点击复制 HEX
6. 响应式设计
7. 基础品牌样式（Logo / 页头 / 页脚）
8. 一个独立搜索页
9. 一个 All Colors 页面
10. 一个 Collections 页面
11. 一个 Favorites 页面
12. 一个 Recent 页面
13. 一个 Spectrum Explorer 页面
14. 一个 Surprise 页面
15. 一个轻量实验页：输入词语生成颜色
16. 颜色详情页，可单独访问和分享
17. 一个 Support 页面承接未来盈利路径
18. 一个 Packs 页面承接实际销售产品
19. 一个 Product Examples 页面，用于展示具体数字商品样例和导出内容
20. 一个 Pack detail 页面，用于展示单个数字商品的完整信息
21. 一个 Waitlist 页面，用于支付上线前承接兴趣
22. 一个 Thanks 页面，用于支付后的静态落地页
23. 一个 Cancel 页面，用于支付取消后的静态落地页
24. 一个 Collection detail 页面，用于展示单个专题 palette 的设计语境
25. 一个 Free Sample Pack 页面，用于在结账未上线前提供免费样例下载

## 颜色排序规则

### 默认排序规则

`Hue -> Saturation -> Lightness`

也就是：

1. 先按色相排序
2. 同色相内按饱和度排序
3. 再按明度排序

这样会让页面看起来更像一张连续、系统的色谱档案。

### 可选排序方式

- Hue
- Lightness
- Name

## 数据规模计划

MVP 阶段不追求“真正所有颜色”，而是做一个足够完整的视觉档案。

建议规模：

- 第一版：约 300 个颜色
- 当前版本：2016 颜色档案（本地生成）
- 后续版本：扩展到 500 或 1000+

每个颜色对象建议包含：

- `id`
- `name`
- `slug`
- `hex`
- `rgb`
- `hsl`
- `hue`
- `saturation`
- `lightness`
- `family`
- `shortDescription`

## 页面结构设想

### 顶部

- Logo
- 项目名：`ColorArchive`
- 简短副标题：`A library of every shade`

### 控制区

- 搜索栏
- 排序切换
- 可选 family filter
- 家族总览导航

### 主体内容

- 大量颜色卡片网格
- 选中颜色详情面板
- 每张卡片展示：
  - 色块
  - 名称
  - HEX
  - RGB
  - 点击 HEX 可复制

### 工具页

- `All Colors`
- 在一个页面中查看当前完整档案
- 用更高密度的方式展示全部颜色，适合快速扫视
- 应支持基础搜索、family 筛选、排序、密度切换与分享链接

- `Spectrum Explorer`
- 用 hue × lightness 矩阵来浏览颜色系统
- 更适合作为项目辨识度功能，而不是普通网格

- `Collections`
- 用少量高质量成套 palette 承接“审美、场景、内容分享”
- 比单纯颜色列表更接近可售卖、可传播的产品资产
- 应逐步扩展为可单独访问的专题页，而不是只停留在一个聚合列表页

- `Favorites`
- 使用浏览器本地存储
- 不引入账户系统也能形成个人工作集
- 目标是提高回访价值
- 应支持一键复制整个收藏 palette / CSS variables

- `Recent`
- 使用浏览器本地存储
- 记录最近查看过的颜色
- 用于在没有账户系统的前提下保留浏览连续性
- 首页应给出 Recent / Favorites 的快速回入口，而不是要求用户总是先进入专门页面
- Recent / Favorites 应支持 JSON 导出，方便后续接设计 token、内容整理或外部工具

- `Surprise`
- 随机进入一个颜色并继续分支探索
- 更偏“发现 / 玩味”体验

- `Search`
- 面向快速查找颜色
- 适合按名称、HEX、family 直接定位
- 持续扩展为多维过滤器（hue / tone / saturation / lightness / exact hex）
- 查询状态应尽量可分享，可通过 URL 直接还原筛选条件
- Archive / Search / All Colors 在空结果时应提供恢复动作，而不是只显示空白状态

- `Word → Color`
- 用户输入任意词语 / 短语
- 本地算法生成一个稳定颜色
- 输出 HEX / RGB / HSL 和简单 palette
- 适合作为未来的分享入口或 lead magnet

- `Support`
- 不做复杂支付系统
- 先承接：
  - 数字商品
  - 赞助支持
  - 定制色板服务
  - 后续 affiliate 入口

- `Packs`
- 把 collection 进一步产品化
- 面向未来接 Lemon Squeezy / Stripe Payment Links 之类的静态友好结账方式
- 当前阶段先保留 checkout placeholder，后面替换成真实外链
- checkout 配置应集中在单独配置层，而不是散落在组件里

- `Pack Detail`
- 路径形态：`/packs/[slug]`
- 用于展示单个商品的：
  - audience
  - deliverables
  - sample downloads
  - 来源 collections
  - FAQ

- `Product Examples`
- 用公开页面展示“实际卖什么”
- 面向支付平台审核、早期客户解释、以及产品证明
- 应包含：
  - 具体 pack
  - deliverables
  - 来源 collections
  - 示例导出内容

- `Waitlist`
- 用静态页面承接支付上线前的兴趣
- 当前阶段可以先用 copyable note / 公开路线说明
- 后续可再接 Buttondown / ConvertKit / Mailchimp

- `Free Sample Pack`
- 用现有的公开下载资产提供一个真正可打开、可下载、可分享的免费层
- 作用是：
  - 在 Lemon 审核未完成期间仍然给用户一个明确转化动作
  - 为后续 paid packs 建立 free-to-paid 路径
  - 提高产品可信度，而不是只有“等待上线”
- 页面本身还应清楚解释：
  - 如何领取
  - 免费层和付费层具体差异
  - 下一步是 waitlist 还是直接看 paid pack

- `Thanks`
- 用于 Lemon / Stripe 购买完成后的 return page
- 应承接：
  - 下一步指引
  - 返回 archive / collections / favorites 的入口

- `Cancel`
- 用于 Lemon / Stripe 购买取消后的 return page
- 应承接：
  - 返回 pack 页面
  - 加入 waitlist
  - 查看 product proof

### 详情页

- 路径形态：`/colors/[slug]`
- 展示单个颜色的完整信息
- 适合做分享和未来 SEO 扩展
- 不应只是“单色说明页”，还应承担继续探索的作用
- 推荐方向包括：
  - 邻近颜色
  - 明暗 companion
  - complementary 对照色
  - analogous 相邻色
- 详情页还应支持 palette 导出，例如：
  - 复制推荐 palette
  - 复制 CSS variables

### 底部

- 简洁 footer
- `© 2026 ColorArchive`

## 视觉方向

### 关键词

- minimal
- premium
- elegant
- calm
- neutral UI
- Apple-like cleanliness

### 原则

- UI 本身不要过于花哨
- 让颜色卡片成为视觉主角
- 版面要整齐、舒服、留白足够

## Logo 方向记录

目前已经探索过几种方向：

1. 色环型
   - 更像设计工具
   - 现代、通用

2. 色卡档案型
   - 更贴合 Archive 概念
   - 更像“颜色收藏库”

3. 极简正式版
   - 更适合官网导航栏
   - 更适合 favicon / 品牌延展

### 当前倾向

- 官网主 logo 用更简洁、正式的版本
- 图标保留“档案卡片 + 色轮”元素

## 商业化想法

当前不急着盈利，但长期可考虑：

- 广告
- Affiliate
- 高级功能，例如导出调色板、收藏、API、高级筛选
- SEO 长尾颜色页面
- 数字商品：palette packs / brand kits / token packs
- 定制服务：品牌色板策划 / campaign palette
- 赞助支持：支持公开维护这个 archive

### 当前阶段重点

先上线一个漂亮、好用、可分享的 MVP。

## 知识产权 / 品牌记录

当前理解：

- 这个项目更相关的是商标 / 品牌保护，而不是单纯版权
- 域名已拿下，但不等于自动拥有完整商标权
- 现阶段可以先使用 `ColorArchive`
- 后续如果项目持续运营，再考虑商标检索和注册

## 开发约束

为了兼容 GitHub Pages：

- 不使用 SSR
- 不使用 server actions
- 不使用数据库
- 不使用后端 API
- 不使用 auth
- 使用本地 mock data
- 保持完全静态导出兼容

## 当前开发方向

Codex 当前方向：

- 持续打磨以档案主页为核心的静态多页面 ColorArchive
- 使用 Next.js + TypeScript + Tailwind CSS
- 保持 GitHub Pages 静态导出兼容
- 维持 2016 色的本地档案规模
- 强化 Search 作为多维过滤入口
- 强化详情页作为继续探索颜色关系的入口
- 强化 Collections 作为可传播、可售卖的内容层
- 强化 Support 作为未来商业化入口
- 强化 Packs 与 Product Examples，减少“只有概念没有商品证明”的问题
- 强化 Pack detail 页面，让每个商品不只是一个卡片，而是可单独访问和分享的页面
- Packs 当前已补可公开访问的 sample download files，作为支付平台审核和早期用户预览材料
- checkout provider / status / note / URL 现已抽到独立配置层，后续只改一个文件即可
- waitlist provider / contact 和 success / cancel return path 也已进入配置层
- Waitlist 与 Thanks 已加入静态商业漏斗，减少“只有商品页、没有转化承接页”的问题
- Cancel 页面已加入，商业漏斗的退出路径也可控
- Recent trail 已加入浏览链路，减少“看过一个颜色之后回不去”的问题
- 继续增加具辨识度的实验页（Spectrum / Surprise / Word → Color）
- 记录可用 credits：
  - Azure credit: 200 USD（GitHub Student Developer Pack）
  - DigitalOcean credit: 200 USD（GitHub Student Developer Pack）
  - Heroku credit: 13 USD / month
- 当前 Lemon Squeezy 店铺申请已提交，待审核
- 当前阶段不需要主动回复 Lemon，先保持公开产品页面和 sample files 完整可访问
- 为配合审核，站点需要持续保留可公开访问的：
  - `/packs`
  - `/product-examples`
  - `/collections`
  - `/downloads/*`
  - `/waitlist`
  - `/thanks`
  - `/cancel`

## 路线图

### 最高优先级

- 继续提升首页和详情页的品牌完成度
- 提升全量浏览、搜索、详情页之间的互相导流
- 修完移动端会遮挡内容的交互细节
- 等待并确认 `colorarchive.me` 的 HTTPS 完全稳定

### 第二阶段

- 评估是否继续增加颜色数据，或转向更强的浏览方式
- 优化搜索与排序体验
- 持续优化移动端查看体验，避免顶部控制区遮挡内容
- 做 favicon
- 继续做 SEO 和分享体验
- 增强 Open Graph 表现
- 增加颜色生成 / 颜色实验功能

### 第三阶段

- 考虑 SEO 长尾页面
- 考虑收藏 / 导出等高级功能
- 评估商标申请
- 评估商业化路径

## 给未来自己的提醒

不要把项目做成“重产品”，但可以有节制地增加有辨识度的静态工具页。

最重要的是：

1. 先上线
2. 让主页足够像一个真正的颜色项目
3. 再逐步扩充工具能力
2. 先好看
3. 先可用
4. 先形成品牌感

ColorArchive 的核心不是“功能很多”，而是：

把颜色整理得漂亮、清楚、专业，让人一打开就觉得舒服。

## 当前总结

ColorArchive 当前已经不再是单页面，而是一个静态多页面的颜色档案产品：主站承接品牌和浏览，Search 承接快速定位，All Colors 承接全量查看，Spectrum / Surprise / Word → Color 承接探索与实验，颜色详情页承接分享和深度浏览。
