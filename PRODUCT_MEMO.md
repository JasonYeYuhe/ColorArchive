# ColorArchive 项目备忘录

最后更新：2026-03-19

## 说明

这份文件是 `ColorArchive` 的长期产品备忘录。

后续项目方向、设计判断、部署方案、功能范围、品牌思路和路线图发生变化时，都应持续更新这份文档。

## 项目名称

ColorArchive

## 当前一句话版本

ColorArchive = 一个以“颜色档案馆”为核心、前端静态导出、动态能力由轻量 API 承担的色彩产品。

## 项目定位

ColorArchive 的核心概念是“颜色档案馆 / Color Library”。

当前方向仍然以颜色档案馆为核心，但已经从“严格单页面”升级为“静态多页面轻产品”：

- 主页面仍然是颜色档案馆
- 新增独立搜索页，用于快速查找颜色
- 新增 All Colors 页面，用高密度方式一次性查看完整档案
- 新增 Collections 页面，用可分享的成套 palette 承接内容价值
- 新增 Families 页面，用 hue family 作为目录入口和 SEO/导航层
- 新增 Collection detail 页面，用编辑型专题内容强化 collections 的“可读性”和 SEO
- 新增 Favorites 页面，用本地收藏和账号同步承接回访需求
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
- 新增 Analytics 页面，用站内方式查看订阅、订单和收入数据
- 新增 About 页面，用解释项目来源、静态约束和结构判断
- 新增 Updates 页面，用公开记录路由和产品层迭代
- 新增 Waitlist 页面，用静态方式承接预热期兴趣流量
- 新增 Thanks 页面，用作支付完成后的静态回跳页面
- 新增 Cancel 页面，用作支付取消后的静态回跳页面
- 整体仍保持 GitHub Pages 兼容，主站静态导出，动态能力走独立 API

## 当前已确定事项

- 域名已购买：`colorarchive.me`（主域名）、`colorarchive.org`（品牌保护 / 重定向）
- 域名注册商：Namecheap
- 当前计划部署方式：GitHub Pages
- 技术方向：Next.js + TypeScript + Tailwind CSS
- 部署约束：必须兼容 GitHub Pages，因此优先使用静态导出
- 产品形态：以档案主页为核心，逐步增加少量静态工具页
- 品牌名：`ColorArchive`
- 当前已接入 `logo_v1` 资产作为站点 header / footer / icon / social preview 的基础品牌素材
- 当前已接入独立 API（`api.colorarchive.me`）处理邮箱、webhook、analytics 与账号同步

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
26. 一个 About 页面，用于解释项目本身和技术约束
27. 一个 Updates 页面，用于公开记录迭代历史
28. 一个 Analytics 页面，用于查看订阅与订单数据
29. 一个 Families 页面，用于按色族浏览和落地 SEO

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

- `Families`
- 用 hue family 做中层目录，而不是只有首页 family filter
- 适合承接：
  - family SEO
  - 色族导航
  - family -> collection / pack 的升级入口

- `Favorites`
- 默认使用浏览器本地存储
- 已新增 magic link 登录，可把 favorites 同步到账号
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
- 首页 Archive 也应逐步支持 URL 状态恢复，而不只是独立 Search 页面
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

- `About`
- 用于回答“这个项目是什么、为什么这样做、为什么是静态站”
- 是信任层，不是营销页

- `Updates`
- 用于公开记录变化，而不是只把迭代留在 git 里
- 作用是：
  - 给 waitlist / 早期用户一个持续更新面
  - 给支付平台或合作方一个“项目在持续维护”的公开信号

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
- 当前不再只是“支付上线前等待页”
- 已转为未来新品、季节 drop、价格更新和项目通知的 email updates 页面
- 后续可再接 Buttondown / ConvertKit / Mailchimp

- `Login / Account Sync`
- 当前采用 passwordless magic link
- 后端负责：
  - 发登录邮件
  - 验证一次性 token
  - 建立 HttpOnly session cookie
  - 同步 favorites / palette
- 当前不做密码登录，不急着做完整账户中心

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
- 前端继续保持静态导出兼容
- 颜色档案数据继续以本地数据和构建期生成文件为主
- 动态能力允许放在独立 API：
  - 邮箱捕获
  - webhook
  - analytics
  - magic link auth
  - favorites / palette sync

## 当前开发方向

Codex 当前方向：

- 持续打磨以档案主页为核心的静态多页面 ColorArchive
- 使用 Next.js + TypeScript + Tailwind CSS
- 保持 GitHub Pages 静态导出兼容
- 维持 2016 色的本地档案规模
- 强化 Search 作为多维过滤入口
- 首页 Archive 已开始支持 URL 状态同步（query / family / sort / selected color）
- 强化详情页作为继续探索颜色关系的入口
- 颜色详情页现在不仅展示推荐关系，还应尽量缩短“看到推荐色 → 加入 palette builder”的距离
- 强化 Collections 作为可传播、可售卖的内容层
- 强化 Support 作为未来商业化入口
- 强化 Packs 与 Product Examples，减少“只有概念没有商品证明”的问题
- 强化 Pack detail 页面，让每个商品不只是一个卡片，而是可单独访问和分享的页面
- Packs 当前已补可公开访问的 sample download files，作为支付平台审核和早期用户预览材料
- checkout provider / status / note / URL 现已抽到独立配置层，后续只改一个文件即可
- waitlist provider / contact 和 success / cancel return path 也已进入配置层
- Waitlist 与 Thanks 已加入静态商业漏斗，减少“只有商品页、没有转化承接页”的问题
- free-pack 与 waitlist 现应视为两条不同邮件链路：
  - `free-pack`：发送免费包下载链接
  - `waitlist`：发送更新订阅确认邮件，用于未来新品和项目更新
- Cancel 页面已加入，商业漏斗的退出路径也可控
- Recent trail 已加入浏览链路，减少“看过一个颜色之后回不去”的问题
- 移动端导航和 palette builder tray 需要持续避免遮挡内容，优先保证首屏浏览和商品页阅读
- 新增 `/analytics` 页面，直接消费 API 的订阅者、订单和收入数据
- Pack / Collection / Color detail 页已开始补结构化 SEO（JSON-LD），不再只依赖普通 meta description
- 继续增加具辨识度的实验页（Spectrum / Surprise / Word → Color）
- 新增 `/families` 与 9 个 family detail 路由，作为 hue family 目录层
- palette 页面已支持导入：
  - share URL
  - color ids
  - hex list
  - JSON（`id` / `hex`）
- build 脚本现在除了 ZIP 和 preview files，还生成：
  - route-specific OG SVG（packs / collections / families / colors）
  - Figma-friendly token JSON
  - Style Dictionary token JSON
- analytics API 现已扩展：
  - source breakdown
  - product breakdown
  - 14-day subscriber / order / revenue series
  - free-pack / waitlist -> purchase funnel
  - filters for `days / source / utm_source / utm_campaign / landing_path`
  - attributed order rows tied back to subscriber capture source
  - filters for `utm_medium / utm_term / utm_content`
  - previous-window comparison metrics for subscribers / orders / revenue
  - source cohort rows with subscriber -> purchaser conversion and revenue
- auth API 已新增：
  - `POST /auth/request-link`
  - `POST /auth/verify`
  - `GET /auth/session`
  - `POST /auth/logout`
  - `GET /auth/google/start`
  - `GET /auth/google/callback`
  - `GET /me/preferences`
  - `PUT /me/preferences`
  - `GET /me/orders`
- 登录方式现定为 magic link：
  - `/login` 页面请求邮件链接
  - 登录链接 30 分钟有效、一次性使用
  - Session 使用 `HttpOnly` cookie
  - 登录后自动 merge 本地 favorites / palette 与云端数据
- Google 登录支持已接入代码层：
  - 通过 Google OAuth code flow
  - 环境变量 `GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_REDIRECT_URI` 已在服务器配置
  - `/login` 现已显示 Google 登录按钮
- `/login` 现在同时承担轻量账户页：
  - 当前显示 favorites / palette sync 状态
  - 当前显示账户订单与下载记录
  - 当前支持 receipt、pack page、重新发送下载邮件与 support 入口
  - 当前显示 Personal / Commercial 两档 license 说明与 support SLA
  - 当前对 admin 账户显示最近订单动作队列预览
- `/analytics` 现已从公开页改为受保护页：
  - 至少要求登录
  - 若设置 `ADMIN_EMAILS`，则进一步收紧到 allowlist 账户
- 服务器当前已配置 `ADMIN_EMAILS`，analytics 访问已收紧到管理邮箱
- waitlist 邮件内容已从简单确认扩展为“更新订阅”起点，含 cadence、featured collection、featured pack
- waitlist / free-pack 邮箱捕获现会一并记录：
  - landing path
  - referrer
  - UTM source / medium / campaign / term / content
- 新增 `/notes` 与 `/notes/[slug]`：
  - 作为公开 newsletter / update archive
  - waitlist 确认邮件会带上最新一期 note
  - note detail 现已支持上一期 / 下一期导航
  - note detail 现已强化 featured collection / featured pack 入口
- favorites / recent 页面已开始显示基于用户已保存和最近浏览的推荐颜色
- family detail 现已增加更明确的 archive -> collection -> pack 升级链
- 构建脚本现已额外生成：
  - GPL palette
  - Sketch palette JSON
  - Adobe Swatch Exchange (`.ase`)
- `/admin/orders` 已上线：
  - 仅 allowlisted admin 可访问
  - 可查看最近订单、重发下载邮件、直接联系买家
- Google 登录已在真实浏览器里验证启动链路：
  - `/login` 按钮可正常跳转到 Google Accounts
  - OAuth URL 中的 `client_id`、`redirect_uri`、`state` 均正确
  - 完整 callback 仍需 allowlist 测试账号本人做一次首次登录确认
- 记录可用 credits：
  - Azure credit: 200 USD（GitHub Student Developer Pack）
  - DigitalOcean credit: 200 USD（GitHub Student Developer Pack）
  - Heroku credit: 13 USD / month
- Lemon Squeezy 店铺已创建，6 个产品（全部 live，JPY 定价，2026-03-19 降价）：
  - Seasonal: Spring 2026: ¥99 ✅ live（限时季节包）
  - Palette Pack Vol. 1: ¥299 ✅ live（新手入门）
  - Dark Mode UI Kit: ¥499 ✅ live
  - Creator Bundle: ¥799 ✅ live
  - Brand Color Starter Kit: ¥999 ✅ live
  - Complete Archive Token Set: ¥1,499 ✅ live（旗舰）
  - 折扣码 FIRSTPACK（10% off，全产品可用）已创建，用于 /cancel 页面挽回
  - 全部 6 个 Checkout URL 已写入 `checkout-config.ts`，购买按钮可用
  - Webhook 已配置（api.colorarchive.me/webhook/ls → order_created）
- 后端服务器已部署（DigitalOcean Droplet $4/month，SGP1）：
  - 域名：api.colorarchive.me（HTTPS，Let's Encrypt）
  - IP：143.198.85.72
  - 技术栈：Node.js + Express + SQLite + Resend
  - POST /subscribe — 邮箱捕获：
    - `free-pack` → 发下载链接邮件
    - `waitlist` → 发更新订阅确认邮件
  - POST /webhook/ls — LS 付款 webhook → 发确认邮件 + 存订单
  - GET /analytics — 订阅者 / 订单统计
  - PM2 进程管理，开机自启
- 免费包 + 6 个付费包 ZIP 文件已生成（prebuild 脚本自动打包，含 SCSS maps、dark mode pairs、seasonal mood notes）
- free-pack 页面已改为邮箱捕获 → 发下载链接（不再直接下载）
- waitlist 页面已接入后端 EmailCaptureForm
- GitHub Actions build 注入 NEXT_PUBLIC_API_URL=https://api.colorarchive.me
- 新增 /contrast 页面：WCAG 对比度检查器（AA/AAA 评级，实时预览）
- 新增 /palette?ids=... 页面：可分享的调色板 URL
- Palette Builder 添加 Share 按钮，生成分享链接
- 2016 个颜色详情页增加动态 meta description（SEO 长尾）
- waitlist / free-pack / packs / updates 的站内文案已开始统一到“6 个产品已 live，free pack 作为长期免费层，waitlist 作为后续更新订阅”的状态
- 为配合审核，站点需要持续保留可公开访问的：
  - `/packs`
  - `/product-examples`
  - `/collections`
  - `/downloads/*`
  - `/waitlist`
  - `/thanks`
  - `/cancel`
  - `/contrast`
  - `/palette`

## 路线图

### 已完成

- ✅ Lemon Squeezy 6 产品全部 live（JPY 定价）
- ✅ DigitalOcean 后端部署（邮箱捕获 + webhook + analytics）
- ✅ 免费包 + 6 付费包 ZIP 打包（prebuild 自动生成）
- ✅ free-pack 邮箱捕获流程（填邮箱 → 发下载链接）
- ✅ waitlist 页面接入后端
- ✅ /contrast WCAG 对比度检查器
- ✅ /palette?ids=... 可分享调色板 URL
- ✅ 2016 色 SEO meta description
- ✅ 9 个 V2 改进提案（A1/A2/B1-B3/C1/C2/D1）
- ✅ HTTPS 全站稳定
- ✅ 12 个 Collections（+4 新增：Sunset Boulevard, Monochrome Studio, Neon After Dark, Matcha & Linen）
- ✅ Dark mode 全站切换（system / light / dark）
- ✅ 首页重设计（产品 showcase + stats bar + feature callouts）
- ✅ 导航重构（Explore / Tools / Shop 分组）
- ✅ Favicon（6 色色轮）
- ✅ Complete Archive Token Set 产品（2016 色 CSS/JSON/Tailwind/SCSS）
- ✅ Dark Mode UI Kit 产品（明暗配对 token）
- ✅ Seasonal: Spring 2026 产品（限定季节调色板 + mood notes）
- ✅ Resend 域名验证完成（colorarchive.me，Tokyo region）
- ✅ All Colors 页面新增 Canvas 全色谱（HSL 色彩空间，饱和度滑块，点击复制 hex）
- ✅ waitlist 邮件链路与 free-pack 邮件链路拆分，避免 waitlist 用户收到错误的下载邮件
- ✅ 首页 Archive 支持 URL 状态同步与分享恢复
- ✅ 新增 `/analytics` 页面，查看订阅、订单与收入数据
- ✅ Pack / Collection / Color detail 补充结构化 SEO（JSON-LD）
- ✅ 颜色详情页推荐色支持一键加入 palette builder
- ✅ 移动端导航与 palette builder tray 收缩，降低小屏遮挡风险
- ✅ 新增 `/families` 和 9 个 family detail 页面
- ✅ build-time route-specific OG SVG 方案上线（packs / collections / families / colors）
- ✅ `/analytics` 增加 funnel、时间序列和产品表现
- ✅ `/palette` 支持 URL / ids / hex / JSON 导入
- ✅ 完整 token exports 增加 Figma-friendly JSON 和 Style Dictionary JSON
- ✅ Collection detail 增强为更明确的 free -> paid 升级入口
- ✅ waitlist 邮件内容扩充为更接近 newsletter 的更新层
- ✅ passwordless magic link 登录上线
- ✅ favorites / palette 云同步上线
- ✅ 顶部导航新增 login / account 入口
- ✅ `/login` 账户页新增订单与下载记录
- ✅ `/login` 账户页增加 receipt / resend / support 等 post-purchase 入口
- ✅ `/login` 补充 Personal / Commercial license 说明与 support SLA
- ✅ `/analytics` 改为登录保护，并支持 `ADMIN_EMAILS` allowlist
- ✅ Google 登录已完成服务器环境配置并可启用
- ✅ `/analytics` 增加来源、UTM、landing path 过滤
- ✅ `/analytics` 增加 `utm_medium / utm_term / utm_content` 过滤
- ✅ 订阅与订单已开始记录 attribution / UTM 数据
- ✅ 新增 `/notes` 公开 newsletter archive，并接入 waitlist 邮件
- ✅ 真实浏览器已验证 Google 登录启动链路可到达 Google Accounts
- ✅ `/analytics` 增加 previous-window 对比和 source cohort
- ✅ `/notes` 增加 issue archive 视图与上一期 / 下一期导航
- ✅ note detail 增强 featured collection / pack 升级入口
- ✅ favorites / recent 页面增加推荐颜色层
- ✅ family detail 增强 archive -> collection -> pack 升级路径
- ✅ 生成 GPL / Sketch / ASE 设计工具导出格式
- ✅ `/admin/orders` 管理员动作页上线
- ✅ GitHub Pages 已成功发布上述前端改动（commit `d43d431`）
- ✅ 新增 ACO（Photoshop）/ Procreate .swatches / Framer tokens 导出格式
- ✅ Figma tokens 改为按 family 嵌套结构（更好的 Variables 面板组织）
- ✅ 移动端 palette-builder-tray 最大高度从 70vh 降为 50vh，Collapse 按钮加 × 图标
- ✅ admin orders 新增 search/filter/pagination（email、product、date range、分页）
- ✅ analytics 新增 buyer drilldown：source cohort 行可点击，展开 buyer 列表（脱敏 email、LTV、订单数）
- ✅ 新增 Issue 002（Spring Pastels）和 Issue 003（WCAG/Contrast）
- ✅ 新增 /notes/tags/[tag] tag landing pages（12 个 tag 静态页面）
- ✅ notes 和 note-detail 页面中的 tag 现在是可点击链接
- ✅ Google login 按钮加 loading spinner，error 显示加 "Try again" 动作按钮
- ✅ 自定义 404 页面（app/not-found.tsx → GitHub Pages 404.html），含品牌导航
- ✅ site-header.tsx 全部导航链接补 trailing slash（与 trailingSlash: true 配置一致，消除 redirect）
- ✅ /contrast 页面 meta 修正（absolute title 避免双重模板、canonical、openGraph、twitter）
- ✅ /notes/tags/[tag] 补 openGraph 和 twitter 元数据
- ✅ notes 列表页底部加 EmailCaptureForm 订阅区块
- ✅ word-to-color 页面加暗色 pack CTA panel（Browse packs + Free download）
- ✅ project-updates.ts 新增两条 shipped 条目（SEO pass、performance/conversion pass）
- ✅ `/thanks` 改为真实 post-purchase hub，明确 receipt / download / account / support 下一步
- ✅ `/cancel` 改为挽回页，强化 starter 折扣、free layer 和 All Access Bundle 三条回流路径
- ✅ All Access Bundle 详情页增加单品对比、总价 vs bundle 价和节省金额拆解
- ✅ 新增 `docs/commerce-ops-checklist.md`，整理 LS 生产设置、回跳 URL、购买 smoke test 与 GSC 提交步骤
- ✅ `/notes` 新增 Issue 006（free pack 转化逻辑）和 Issue 007（design token workflow / bundle 价值）
- ✅ 新增 `/guides` 内容层，补 brand palette / dark mode / free download / Figma tokens 四个高意图静态 landing pages
- ✅ `/guides` 扩展到 8 个高意图静态页，并在首页 hero 与 `/notes` 列表页补 guides 导流入口
- ✅ collection / pack / note 详情页已开始根据 featured collection / pack 自动挂接相关 guides，增强商业页与 SEO 内容页之间的互链
- ✅ `/guides` 入口页现已加入 popular guides + category 分组，首页 `/packs` `/free-pack` 文案进一步压向更明确的领取 / 购买话术
- ✅ `/packs` 与 `/free-pack` 页面现已直接挂 guide 入口，减少用户在内容页、免费入口和结账页之间的跳出断层

### 当前优先级

- ✅ Resend 域名验证完成（colorarchive.me verified，邮件可正常发送）
- ✅ 6 个产品全部 live，checkout URL 已填入
- ✅ route-specific OG SVG 已补上静态替代方案
- ✅ admin orders 已加入 search/filter/pagination
- ✅ analytics 已加入 buyer drilldown
- LS 店铺审核通过后关闭 Test mode（手动操作，见 checkout-config.ts 注释）
- LS 产品级 Thank You / Cancel URL 需统一配置到 `/thanks/` 和 `/cancel/`（手动操作，见 `docs/commerce-ops-checklist.md`）
- 提高邮件送达率（新域名初期可能进 spam，需要积累域名信誉）
- 由 allowlist 测试账号本人完成一次 Google 首次登录，确认 callback / session / redirect 全链路
- 继续观察 Personal / Commercial 两档 license 文案是否足够清晰

### 后续方向

- 1. 继续验证 Google 登录完整链路
  - 重点确认 callback 完成后是否稳定落到 `/favorites` 或预期 next path
  - 顺手确认 Google 登录后 analytics allowlist 判定是否符合预期
- 2. Figma 插件或 Tokens Studio 对接
  - 现有 token exports 已够做第一版集成，不必从零重做格式
- 3. 品牌与信任层补强
  - 评估商标申请、完善 support / about / updates 文案、持续提高邮件送达率与公开可信度
- 4. 继续加深 analytics 决策面板
  - 增加 cohort over time、source retention、买家搜索和 buyer-level audit trail
- 5. 把 `/notes` 继续扩成真正的可归档内容流
  - 增加更多 issue、归档分页、tag landing pages
- 6. 设计工具导出格式继续扩展
  - 补 ACO / Procreate / Framer 等更常见的设计软件格式
- 7. 把推荐系统继续推到颜色详情页之外
  - 让账户页、favorites、recent 和 family 页面形成连续探索链

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

ColorArchive 已从静态展示项目进化为完整的颜色产品：
- 前端：Next.js 静态站（GitHub Pages），含 archive / tools / packs / families / analytics / login
- 后端：Node.js API 服务器（DigitalOcean），处理邮箱捕获、支付 webhook、分析、magic link 登录与偏好同步
- 商业：Lemon Squeezy 七产品上架（6 个单品 + All Access Bundle，JPY），自动交付 ZIP 包
- 定价（2026-03-19 调整）：¥99 / ¥299 / ¥499 / ¥799 / ¥999 / ¥1,499 / ¥2,799（bundle）
- 折扣码 FIRSTPACK（10% off）用于 /cancel 挽回流失用户
- 增长：邮件列表（Day 0/3/7 自动 nurture sequence）、SEO 长尾页面、社交分享按钮（X/copy link）、可分享调色板 URL、登录后跨设备偏好同步
- 工具：WCAG 对比度检查器、Palette Builder、Word → Color、Spectrum
- 分析：自建 page view tracking（PageTracker beacon → SQLite），analytics 页面展示 top pages / referrers / device breakdown
- 社交：动态 OG 图片（api.colorarchive.me/og/color/:hex），颜色详情页分享到 X 时显示颜色色块
- 域名：colorarchive.me（主站）、colorarchive.org（redirect）、api.colorarchive.me（API）

用户可以浏览、搜索、收藏、登录同步、生成调色板、检查对比度、分享到 X、下载免费包、购买付费包——全链路闭环。
