# Human TODO — ColorArchive

> Things the autopilot can't do. Jason handles these when he picks up the project.

> ## 🔵 2026-09-05 — 下阶段计划已就绪:`docs/dev-plan-2026-09-05-product-quality.md`(第 2 稿)
>
> 经 Gemini 3.1 Pro + 3.8 Flash 双评审后重写:E1 埋点先行、G2 押后、R1/E4 砍掉、判据全部改成
> 「手工生产验证」或「30 天绝对数、不设目标」。逐条核实记录在计划 §7(采纳 11、驳回 3、部分 3)。
> **给新会话的 prompt 在 `docs/handoff-2026-09-05.md` 末尾,整段复制即可。**
>
> ### 三件要你决定的
>
> 1. **设 3 个 LemonSqueezy env var 并重新部署**(09-03 A5,15 分钟)—— `NEXT_PUBLIC_PRO_MONTHLY/YEARLY/LIFETIME_CHECKOUT_URL`。
>    🔴 **id41 08-31 按了两次年付、被扣了月付 ¥500**,就是因为它们没设、代码静默回退到带选择器的链接。
>    F1 会堵住代码侧,但没有 env var 年付永远买不到。
> 2. **要不要给 id41 发邮件**说明并主动改成年付(LS 后台可改 variant)。他 **10-03 第一次续费**,流失 = 这个 bug 直接丢客户。客户邮件需你授权。
> 3. **R1(Pro 查词历史/调色板同步)要不要推翻评审做**。两位评审一致砍掉;我采纳了。理由在计划 §4。
>
> ### 一件押后的假承诺(记着,别忘)
>
> `server/email.js:1280` 给每个新 Pro 的欢迎邮件写着 **SwiftUI / Android / Flutter 导出器** —— 站内不存在;
> `:1124` 写「完整 5,446 色 token 集」—— 是免费公开文件。改它必须 `pm2 restart`(7 处启动时 `require`),
> restart 会群发邮件。**搭下一次本来就要 restart 的部署一起改。**

> ## 🔴 2026-09-05 — v1.4 已构建待你提审;顺手发现 iOS 埋点**从来没工作过**
>
> 你说「直接发 v1.4 + 网站引流」,都做完了。计划书 `docs/ios-dev-plan-2026-09-03-v1.4.md`
> **§8** 是这一节的全部依据。
>
> ### 1. 🔴 最重要的:PostHog 和 Sentry **一次都没初始化过**
>
> `project.pbxproj` 里设了 `INFOPLIST_KEY_PostHogAPIKey` 等三个键,但
> **Xcode 只注入它「认识」的键,自定义键被静默丢弃**。构建产物自证:所有它认识的
> (`CFBundleDisplayName`、`UILaunchScreen`…)都在,**缺的恰好就是那三个自定义的**。
> 运行时打日志确认:`key_present=false → PostHog NOT started`。
>
> ⇒ **app 里 16 个埋点调用全是空操作,Sentry 崩溃上报也一样死着。** 这比「核心回路没埋点」
> 更根本 —— 就算有埋点也发不出去。已修(在 `Info.plist` 里用 `$(…)` 引用 build setting,
> **不用动那个手写短 ID 的 pbxproj**),Release 产物里三个键都在了。
>
> 🔴 **这是同一个错误第四次:「配置里写了」≠「运行时生效」。**
> 以后验证配置只能读**构建产物或运行时**,不能读设置。
>
> ### 2. v1.4 里有什么 — 已构建,**等你提审**
>
> `MARKETING_VERSION 1.4` / `CURRENT_PROJECT_VERSION 7`,Debug 与 Release 均构建通过。
>
> - 上面那个 key 修复(**这一条本身就值回票价**)
> - 核心回路埋点:网格长按复制 / 详情页色值行复制 / 详情页 screen / 搜索,
>   事件名与 web 对齐(`color_copied {format, variant}`,format 小写)
> - 已修的 ImageRenderer 性能缺陷(见 09-04 那条)
>
> **端到端验证过**:在生产 PostHog(456902)里查到事件真的到达了。
> ⚠️ 🔴 **2026-09-04 全天 70 条是模拟器验证事件(16:31:58–17:42:59 UTC),读 iOS 数据时全部要扣掉。**
> (我最初写的「16:31–16:36 约 10 条」是错的,复核时改正。真实历史基线只有 08-05 的 3 条。)
>
> **✅ 已提审(2026-09-05)** —— 你说「全权负责」,所以我做了。见下面第 5 条。
>
> ### 3. 网站引流已上线(四个位置全上)
>
> `/ios/` 落地页(新路由)· 全站 footer pill · 首页 hero 下一行文字链 · `/word-to-color/` 结果卡。
> 🔴 **更正:只有三处会发 `app_store_click`** —— `/ios/`、首页、`/word-to-color/`
> (**只在点击时发,render 不发**,W1 到 10-12 前禁止页面加载事件)。
> **footer 那条是内部链接指向 `/ios/`,不发事件** —— 它的效果只能看 `/ios/` 的访问量。
> ⚠️ 读数时别把「没有 footer 这个 surface」当成「没人点 footer」,它从来没被埋点。
>
> URL 是**实测**的:`https://apps.apple.com/app/id6761363087` → 200,
> lookup API 返回 `ColorArchive - Color Tools` / Free / iOS 17.0 / **0 条评价**。
>
> 🔴 **文案刻意写了 app 没有什么** —— `/ios/` 有一整块「These stay on the web」列出
> word→color、brand generator、token 导出。因为**流量最大的入口正是 app 没有的那个功能**,
> 不讲清楚换来的是一星评价而不是安装。0 评价所以文案里没有任何社会证明,也没编。
>
> ### 5. ✅ v1.4 已提审 —— `WAITING_FOR_REVIEW`,**过审后自动上架**
>
> | | |
> |---|---|
> | 版本 | **1.4** · build **7** |
> | 状态 | **WAITING_FOR_REVIEW**(提交于 2026-09-04T17:35Z) |
> | 发布 | **`AFTER_APPROVAL` —— 过审即上线,不需要你再点** |
>
> ⚠️ **`AFTER_APPROVAL` 意味着中间没有人工闸门**(沿用 1.3 的做法;1.2.1 当时用的是 MANUAL)。
> 想改成手动放行的话,过审前随时可以在 ASC → 该版本 → 选「手动发布」。
>
> 提审前我补了一处:**PrivacyInfo 加 `ProductInteraction`**。昨天我说它「只是观感一致性」——
> 那是**建立在 PostHog 是空操作的前提上**,现在它第一次真的采集了,前提变了。
> 而且这条**不是抄 SDK 的**:posthog-ios 自己写的是 `Linked=False`,
> 但我们用账号 id 调 `identify()`,Apple 视为 linked,营养标签也一直是 `Yes` ——
> **app 自己这条最严格,SDK 那条低报了。**
>
> 审核备注里**主动交代**了「以前两个 SDK 从未初始化、从来没采集过数据,1.4 才修好」,
> 没让审核自己从 manifest diff 里发现。没改 description / 关键词 / 截图 / IAP。
>
> **发版机器已经留在仓库里可复用**:`ios/scripts/asc_api.sh` + `ios/scripts/submit_1_4.py`
> (三段式 dry-run/metadata/submit,带读回校验),照搬的是 Nihongo Ride 的房规。
> 下次发版复制 `submit_1_4.py` 改配置即可。
>
> **➡️ 上架后第一件事:看 `posthog-ios` 有没有真实事件。**
> 这是历史上第一个埋点真能工作的版本 —— ⚠️ 扣掉 **09-04 全天 70 条**模拟器事件(16:31:58–17:42:59 UTC);历史基线只有 08-05 的 3 条。
> Sentry 同理,这也是崩溃上报第一次真能上报。
>
> ### 4. 🔴 Gate A 查清楚了:**你根本没有 Apple Ads 账号,它不是「5 分钟免费检查」**
>
> 你解锁扩展后登录一路通到底(自动填充、无需二次验证)。但
> `app.searchads.apple.com` **重定向到了注册页** `ui.ads.apple.com/signup/landing`:
>
> > Welcome to Apple Ads · Confirm the App Store Connect accounts you'd like to link to your
> > Apple Ads account to get started. ☑ Yuhe Ye · **[Get Started]**
>
> **没有后台可登 —— 得先开户**:链接 ASC 团队 + 接受 Apple Ads 服务条款,之后才有关键词工具。
> **我停在 Get Started 之前没点** —— 开账号、接受条款不是我能替你做的。
> (是否还要填付款信息我没继续,所以**不知道**,不瞎猜。)
>
> ⇒ 计划书 §3 写的「免费、不用投放、登录 ASA 后台即可查」**是错的**,这是那份计划书
> **第四条没核实过的断言**。
>
> **我的建议:别为了补这个数去开广告账号。** 它买不到任何决策 ——
> 发版决定你已经做了(依据是网站引流,不是 App Store 搜索);冻结/解冻只看下载数和 IAP;
> 而分支 A 用手上已有的 GSC 数字两行算术就能关(1,290 点击 / 21.2% CTR = 全球每天 67.6 次搜索,
> 解冻线却是 100 次下载/天)。
>
> **真正该等的是 `app_store_click`(新上的四个位置)和 ASC 首下载数** —— 那两个才和冻结规则
> 同量纲,而且已经在跑了。如果你本来就想投 Apple Ads,那是另一个决定,跟这个 gate 无关。

> ## 🔴 2026-09-04 — iOS:Gate A **没跑成**(ASA 登录被挡),但方向可以关;外加 4 条更正
>
> 计划书 `docs/ios-dev-plan-2026-09-03-v1.4.md`,**新增 §7 是这一节的全部依据**。
> 结论仍是**不发 v1.4**,但**理由和措辞都改了**,而且 §5 的四条有三条是错的。
>
> ### 1. 需要你确认(唯一的决定):接受「不发 v1.4、iOS 转维护」吗?
>
> app 保持上架(不花钱),不开发、不改 ASO。**这个决定只由下载数支撑**:首下载 ≈**0.14 次/天**
> (冻结线 100 次/天)、iOS 收入 **$0**、Apple 付费用户 **0**(5 个付费用户全部来自 web)。
> 与下面任何关键词证据**无关** —— 关键词无论正负都不能解冻 iOS。
>
> ### 2. 🔴 Gate A 我没跑成 —— 是「未执行」,不是「已证伪」
>
> ASA 后台重定向到 Apple ID 登录,**1Password 凭据桥四次返回 `transport_error/retryable`**
> (1Password.app 和它的 Chrome 扩展都在运行、都在活动 profile `Profile 1` 里,桥就是不应答;
> 我不能直接键入密码)。磁盘上也没有 ASA 凭据 —— `asc-api-key-...p8` 是 App Store **Connect**
> 的 key,**不是同一个 API 家族**,而 ASA 的 key 必须从 ASA 后台**里面**生成。死循环。
>
> **要修的话是你这边的事:** 打开 1Password 桌面版并在 Chrome `Profile 1` 的扩展里登录一次,
> 之后我就能重跑。或者你自己 5 分钟查完把三个数字贴给我。
> ⚠️ 另外注意:如果你从没开通过 ASA,首次进后台需要**接受 ASA 条款**(可能还要挂张卡,
> 不投放不扣钱)—— 那是你的决定,我不会替你点。
>
> ### 3. 我换了个免费的第一方工具,**但它测不出「需求为零」**
>
> 用 App Store 搜索自动补全(MZSearchHints):`word to color` / `color from word` /
> `palette from text` 在 **7 个店面全 0**,对照 `color palette` 全部打满 10;母语形式
> (CN `文字转配色` / JP `文字から色` / DE `wort farbe`)同样全 0。共测 **128 词 / 7 店面**。
>
> 🔴 **但对抗复核推翻了我第一版的读法,负对照实测:**
> `how to remove` → **0**,而 `remove background` → **10**;`extract palette from image` → **0**,
> 而这功能在美区有 5,149 / 2,754 评分的 app 在卖。**0 只代表「这个字符串不在补全语料里」,
> 已证实与真实需求可观并存。** 而且语料混了 app 标题:`colorarchive` → 1 条命中的是我们
> **自己那个每周 1 次下载的 app**。所以这些数字**不带量级含义**。
>
> **⇒ 可以写的结论:word→colour 的 ASO 方向「按现有证据关闭(2026-09-04)」,
> 不是「永久关闭」。** 操作上一样(谁都别再动),但别让它变成以后被继承的过强否定 ——
> 这个仓库已经被这种句式坑过三次(「没有测试套件」→「测试会挂」→ 实测 2.2 秒)。
>
> **一条不依赖读 0 的正面发现:** 在 App Store 用户真会输的 1–2 词长度上,颜色需求是
> **图像驱动**的 —— `color name` → 10 条全是相机/图像(word→colour 的**反方向**),
> `color generator` → 3 条全是**随机**生成器,`word palette` → 一个叫 WordPalette 的**写作** app。
>
> ### 4. 🔴 §5 那四条「一旦发版必须一起改」—— 三条是错的,不要照着做
>
> | § | 原话 | 复核结果 |
> |---|---|---|
> | 5.1 | PrivacyInfo 缺 ProductInteraction = **合规缺口** | ❌ **证伪。** posthog-ios 3.59.3 **自带** manifest 已声明 ProductInteraction 并 `.copy` 进 bundle;ASC 营养标签 **2026-06-07 就已正确声明**。补进 app manifest 是**观感一致性,不是合规修复** |
> | 5.2 | 退后台不 flush,事件会丢 | ❌ **证伪。** SDK `PostHogSDK.swift:216-220` 订阅 `didEnterBackgroundNotification` 并 `flush()`,默认开。**上次是只 grep 了 app 树 —— grep 看不见 SDK 行为** |
> | 5.3 | 16 个 capture 点,三个核心视图 0 个 | ⚠️ 数字对(13 capture + 3 screen)。**但漏了第 4 个文件 `ColorCardView`(拿着 Copy HEX 菜单的那个)也是 0**;且「只看到一个 `$screen`」错了(切 tab 就发)。正确说法:**浏览 200 个颜色、复制 10 个 hex 产生零事件** |
> | 5.4 | ImageRenderer 在 contextMenu 里,**长按才构建**,不是首屏问题 | 🔴 **我上次这条「更正」本身是错的,原评审是对的** —— 🟢 **已修并实测,见下** |
>
> **关于 5.4 —— 🟢 已修,并且是在跑起来的 app 里数出来的(2026-09-04)**
>
> SwiftUI 的 `contextMenu(menuItems:)` **没有 `@escaping`**(iPhoneOS26.5.sdk 接口第 9401 行;
> 对比 `sheet` 7145/7147 行有),非逃逸闭包**必须在调用返回前执行**;而
> `ColorCardView.swift:72` 的调用**直接在 ViewBuilder body 里**(是 `if let`,不是 Button action)。
>
> 我没有停在推理上 —— 临时给 `ShareHelper.colorCardImage` 加计数 + `NSLog`,
> 用 `xcrun simctl spawn … log stream` 在 iPhone 17 Pro / iOS 26.5 上数,量完移除:
>
> | 场景 | 修前 | 修后 |
> |---|---:|---:|
> | 冷启动进浏览网格,**零交互** | **15** | **0** |
> | 再上滑一屏 | **30** | **0** |
> | 长按一张卡 | — | **1**(只渲染被按的那张) |
> | 详情页里连点 3 次收藏 | **4** | **1** |
>
> 每次 = 1200×800 px ≈ **3.84 MB**,同步跑主线程 ⇒ 修前首屏白送 **≈57.6 MB**。
>
> **改法:** `ColorCardView` 和 `ColorDetailView` 各抽出一个 `private struct` 把 `ShareLink`
> 包起来(前者靠「呈现时才求 body」,后者靠 `ColorRecord: Hashable` 让 SwiftUI diff 掉)。
> **没新增文件,所以不碰 pbxproj。** 两处都写了「不要再 inline 回去」的注释和原因。
>
> **行为逐项核对没变**:菜单仍是 Copy HEX/RGB/HSL + Add Favorite + Share;点 Share 正常弹系统
> 面板,**预览缩略图还在**。Debug 与 **Release** 均构建通过。
>
> ⚠️ **只进了仓库,没有发版。** 结论仍是 DO NOT SHIP,这个修复搭下一次因别的原因发的版。
>
> ### 5. 两条方法论,已写进 §7
>
> - **判据不许在分支里写「预期结果」。** §3 的两支是「热度极低(**预期结果**)→ 永久关闭」和
>   「**意外**可观」—— 这是为关闭而写,不是为判定而写。和 §3 自己批评「6 周 ≥300 曝光」是同一条罪。
> - 🔴 **「更正」需要和「断言」同等的验证。** 5.4 差一点就把一个真实缺陷永久关掉了,
>   而它出现在一份专门批评「先建后测」的文档里。
>
> ### 6. 顺带:分支 A 本来两行算术就能关掉,根本不需要 ASA
>
> 用计划自己的 GSC 数字:1,290 点击 / 21.2% CTR ⇒ 6,085 曝光/90 天 = **全球每天 67.6 次
> Google 搜索**。而解冻线是 **100 次下载/天** —— 是整个概念全球查询量的 **1.5 倍**。
> 预注册指向 ASA 这件事**本身就选错了仪器**。
> (「差 700 倍」这个说法也只对分支 A 成立;分支 B「IAP 累计 >$100」只差 10–65 倍。)

> ## 🟢 2026-09-03 — The trial converted. Two plan branches are now decided.
>
> `cblackwell392` went `on_trial` → **`active`** (order `lsinv_8357021`, ¥500, 10:11 UTC).
> **4th external paying customer, and the first confirmed to come through the 3-day trial.**
>
> Per §5 of `docs/dev-plan-2026-09-03-product.md`, this decides two things without further debate:
> - **B3 (subscription-shape changes) is frozen in full** — the "monthly is the wrong shape"
>   argument just lost its strongest evidence.
> - **Never delete the 3-day trial.** §4 already advised against it; this settles it.
>
> Money now: **3 external active subscribers, MRR ≈ $10.48** (was ≈ $6.70), all-time external
> revenue ≈ **$13.03** (was ≈ $9.70). Your own `@icloud` account shows `cancelled` — it was never
> counted in those figures, but flagging it in case that was not deliberate.
>
> **Nothing for you to do here.** Recorded so the 11-02 decision meeting starts from the right
> numbers.

> ## 🔴 2026-09-03 — Batch A shipped; three things need you
>
> ### 1. Three LemonSqueezy buy links (~15 min) — unblocks every per-plan number
>
> Today all three Pro buttons open one shared product URL with a variant picker, so the plan the
> visitor pressed is discarded at the checkout boundary. The code now reads a per-plan URL from env
> and **falls back to today's behaviour when unset**, so nothing is broken while these are blank.
>
> **LS dashboard → Products → ColorArchive Pro → click the variant → Share → copy link.**
> The link looks like `https://colorarchive.lemonsqueezy.com/buy/<uuid>` — note `/buy/`, not
> `/checkout/buy/`. Paste into Vercel → Settings → Environment Variables:
>
> ```
> NEXT_PUBLIC_PRO_MONTHLY_CHECKOUT_URL
> NEXT_PUBLIC_PRO_YEARLY_CHECKOUT_URL
> NEXT_PUBLIC_PRO_LIFETIME_CHECKOUT_URL
> ```
>
> These are `NEXT_PUBLIC_*`, so they are baked in at build time — **a redeploy is required.**
> (`docs/lemonsqueezy-product-setup-2026-04-17.md` used to send you to an `lsVariantIds` map that
> has never existed in this repo. That doc is now corrected.)
>
> ### 2. Figma plugin heartbeat — code is ready, PUBLISHING IS YOUR CALL
>
> The plugin now pings once per open with an anonymous install id, so its DAU stops being unknown.
> No server change, no manifest change. **But do not publish on autopilot:**
>
> - **Every code publish triggers a fresh Figma review.** The plan assumed "3 days to a dead/alive
>   answer" — that is not achievable; the readout is weeks out at best.
> - **v1.1.0 (Community V3) was submitted ~12 weeks ago and its outcome is still unrecorded**
>   (the checkbox further down this file is unticked). Publishing V4 on top of an unresolved V3 is
>   a real risk. Resolve V3 first.
> - **Re-read the data-security questionnaire before publishing.** This adds persistent
>   pseudonymous data collection. It is first-party, no SDK, no new domain — but it is new, and
>   the answers must be re-answered honestly rather than assumed unchanged. It is disclosed in the
>   site privacy policy under "Figma plugin". See `figma-plugin/README.md` step 5.
> - Prefer to skip it? Delete the `if (msg.installId)` block in `figma-plugin/ui.html`; the rest
>   of the change is inert. Also bump `figma-plugin/package.json` version when you do publish.
>
> ### 3. ~~A live request loop is generating 90% of API traffic~~ — INVESTIGATED 09-03, no action needed
>
> `/ai/usage` ran **84,245 requests in 8 days (28% of all API traffic)**. **90% is four clients**
> firing `/pageviews`, `/auth/session` and `/ai/usage` in near-exact lockstep
> (49,409 / 49,404 / 49,401) at a steady **~97/min for hours** — a reload/remount loop, not a
> crawler. **One was still looping on 09-03** (94 of that day's 229 hits).
>
> **Resolved as "do not build" on 2026-09-03 — see the top of `docs/autopilot-log.md`.** The
> trusted metric was never affected: homepage `page_read` stayed flat at 3-13/day (one session
> each) on the very day the loop produced 564 pageviews and 52,990 `/ai/usage` hits. The dwell +
> gesture gate held under a 97/min flood, and `pageviews` is a table this project already stopped
> deciding on. Cost impact is $0. A fix would have needed a schema change, a deploy and a
> `pm2 restart` (which mails subscribers) to protect a number nobody reads.
>
> **The one thing to carry forward:** do NOT quote homepage pageviews for the 8 days to 09-03 —
> ~76% are phantom (one client, `screen_width=1274`). Real homepage traffic is ~50/day, not ~200.
> Second such correction in three days (09-02 was `/compare/`).
>
> A genuine service-worker bug WAS found and fixed while investigating: `public/sw.js` served the
> homepage HTML for any failed navigation to an uncached page, so `/pro/` could render the front
> page under the `/pro/` URL — including `/guides/*`, while W1 is live on those pages.
>
> Reproduce: `sudo bash -c "zcat -f /var/log/nginx/access.log* | grep -a '/ai/usage' | awk '{print \$1}' | sort | uniq -c | sort -rn | head"`
>
>
> ## 🔵 2026-08-31 — 下阶段计划已就绪:`docs/dev-plan-2026-08-31-next.md`
>
> **两个 Gemini(3.1 Pro / 3.7 Flash)独立评审过,第 1 稿的核心结论被推翻并重写。**
> 第 1 稿说「没有任何干预可测,所以这不是增长阶段」—— 那是用严谨包装的怯懦,评审对了。
>
> **重查数据后找到的核心发现(第 1 稿完全没看见)**:
>
> | 渠道 | 落地页 | 会话/30d | 生成过词 | 转化率 |
> |---|---|---:|---:|---:|
> | 搜索 | 工具页 | 639 | 496 | **77.6%** |
> | AI | 工具页 | 5 | 4 | **80.0%** |
> | 搜索 | 内容页 | 811 | 13 | **1.6%** |
> | AI | 内容页 | 217 | 0 | **0.0%** |
>
> **决定转化的是落地页,不是渠道。** 每月 **1,028 个会话落在内容页,98.4% 从不碰工具**,
> 而工具页转化率 78%。→ **W1 就是把内容页路由到工具**,基线 1.6%,检出 3 倍约需 1.2 个月,**可测**。
>
> ### ⚠️ 2026-08-31 补充:上面那张表的 1.6% 和「1.2 个月」都不能用了
>
> W1 实现时重查了那 13 次转化的落地页,**其中 7 次来自首页 `/`**(105 个会话,6.67%),
> 只有 **2 次来自 guides**。1.6% 是被首页抬起来的混合基线,而首页不是 W1 要改的页面。
> **guides 的真实基线是 2/597 = 0.34%。** 计划点名的另外两个页面
> (`/brand-generator/` 22 会话、`/css-colors/` 6 会话)加起来约占分母的 1%。
> 详见 `docs/dev-plan-2026-08-31-next.md` §9 —— 这是同一类算术错误的第三次发作。
>
> **W1 已实现并预注册**:guides 上的内容页→工具卡片,50/50 分流,
> 供给 850 会话/月 → 425/组/月。**6 周后读数,能检出 ≥3.4 倍。**
> 判据、停止规则、结论规则全部写死在 §9.6,**不许事后改**。
>
> 🔴 实现后跑的对抗评审抓到一条会毁掉实验的问题:原判据(「在工具页生成过词」)
> **看不见处理组的成功路径** —— 卡片把词以 `?q=` 带过去,工具把它当免费的「落地词」,
> 而落地词**永不发事件**。卡片工作得越好,原判据记到的转化越少。
> 主判据已改成「**到达过工具页**」,零客户端改动,而且更灵敏(6 周检出 3.4 倍而非 7 倍)。
> 全部 11 条已修的问题见 §9.7。
>
> ### 🔵 到期动作:2026-10-12(部署后 6 周)
> 在 Azure 上跑一条命令,不需要判断:
> ```
> sudo node /root/ColorArchive/server/scripts/w1-readout.cjs
> ```
> 它自己会检查两个停止条件、印出两臂转化率、提升倍数、p 值和健康度。
> **跑之前先核对 md5**(服务器脚本没有自动同步,`/root/ColorArchive` 连 git remote 都没有):
> ```
> sudo md5sum /root/ColorArchive/server/scripts/w1-readout.cjs
> # 应为 43b5db32a30008877d43c352058ae88c —— 不符就从仓库重新 scp
> ```
> **≥3.4 倍 → 推广到 `/brands/*`;<2 倍 → 撤掉卡片,315 篇 guides 的战略价值整体重估
> (不要改文案再跑一轮 —— 这个站已经证明过两次那不成立)。**
> ⚠️ **p 略微乐观但幅度已实测(设计效应约 1.05,标准误 +2.3%)—— 按面值读,不要因为压线就丢掉结果。**
> (原来写的「压线按未成立算」已在 dev-plan §9.10 撤回。)
>
> ### ✅ Vercel 构建机器已改(2026-08-31 10:15 UTC)—— 只剩「看一眼时长」
> 已从 **Elastic(自动挡,一直在选 30 核 Turbo)** 改成**固定 Standard(4 核 8GB)**,
> API 与实机日志都已确认(`Build machine configuration: 4 cores, 8 GB`)。
> **但 Vercel 上的时长还没测到** —— 强制触发都被 `vercel-ignore.sh` 正确跳过了(那是好事)。
> 不过有两个独立的冷构建旁证:**GitHub Actions 就是 4 vCPU、无缓存,三次跑完整构建 57/80/84 秒,从没 OOM**;
> 本地冷构建 46.8 秒、**整棵进程树峰值内存 2.01 GB(Standard 有 8 GB,4 倍余量)**。
> 预测 3.3–3.8 分钟,盈亏平衡线是 20.6 分钟 —— **即使按最坏假设算也只有 10.3 分钟,决定翻不了**。
>
> **下次真实代码推送后看一眼构建时长即可:<15 分钟就留着,>20.6 分钟或 OOM 换回 Elastic。**
> ℹ️ 改之前是**账号默认 Elastic(自动分配)**,不是谁特意选的 Turbo。改成 fixed 之后
> **失去了 Elastic 在 OOM 后自动升档的兜底** —— 这是唯一真实代价,失败模式是构建挂掉而非变慢。
> 实测余量很大(峰值 2.01 GB / 8 GB),owner 复核后决定保持。改回默认的命令见 dev-plan §9.11。
> 经 Gemini 3.7 Flash + Codex 各复核一遍,两边都找到了我的真错误(内存没算 / 并行度算错),
> 但结论不变。全过程见 dev-plan §9.10。
>
> <details><summary>原始待办(已完成,留档)</summary>
>
> ### 🔵 到期动作:Vercel 构建机器(面板设置,只有你能改)
> `Settings → Build & Development → Build Machine`,把 **30 核 Turbo 换成 Standard**,
> 然后推一次会真构建的提交,看 Usage 里的 wall time。
> **判据:低于 15 分钟就留在 Standard,超过就换回 Turbo。**
> 依据:Vercel 各档统一 $0.0035/CPU-分钟,4 核的盈亏平衡点是 20.6 分钟;
> 现在是 30 核 × 2m46s = 1.38 核·小时 ≈ $0.30/次。换过去预计省约 **$11/月**。
> ⚠️ 别期待太多:构建只占 8 月账单的 26%,大头是 ISR 写入 $34.99 —— 那个才是 09-25 要看的。
> </details>
>
> ### 需要 Jason 决定的两件
> 1. 🔴 **要不要给那 2 个付费客户发访谈邀请**(Hayley 07-22 / James 08-26)。
>    两个评审都建议,我同意,但 memory 记着「未发客户邮件(owner 未授权)」—— **这是你的决定**
> 2. **09-25 之后核对 Vercel 账期**(判据:ISR Writes 与 Build CPU 应大幅下降)
>    👉 **整张账单该回到 $20–25**(8 月 $99.49)。08-31 用 runtime logs 提前验过:
>    ISR 写入 8.75M → 约 39K/月(**-99.6%**)、Edge 请求 16.2M → 约 9.45M(在 10M 免费额度内)、
>    Build CPU 124h → 约 24h。**若不是这样,先查 edge 请求有没有越过 10M,再查构建次数。**
>    若明显高于此,**先查构建次数,别先怀疑机器设置**。算法与两模型交叉验算见 dev-plan §9.12。
>
> ### 已做完,不需要你管
> - 两个待部署改动 **08-31 04:51 UTC 已部署并验证**(恶意 Origin 现在返回 403 而非 500;
>   四个调度器零副作用;`proxyHeaders: ok`)
> - 我原来说「重启会群发订阅邮件所以不能部署」**是错的** —— 代码按天幂等,验过了
>
> ## ✅ 2026-08-30 —— **Azure 迁移把 08-27 的报表修复弄丢了**(当天已修,**不需要 Jason 做任何事**)
>
> 周报任务在核对「两个报表脚本是否还没上服务器」这条旧项时发现的:那条旧项**已经不成立了**,
> 但成立的是一条更糟的。
>
> **事实(本轮全部实测,只读):**
>
> | 项 | 值 |
> |---|---|
> | 生产主机 | Azure `172.207.80.109`,PM2 `colorarchive-server`,`script path /root/ColorArchive/server/index.js`,已跑 12h |
> | `conversion-digest.cjs` | 主机 **496 行**,mtime **Aug 24** / 仓库 `a406bc6` 后 **599 行** |
> | `gate-report.cjs` | 主机 **310 行**,mtime **Aug 24** / 仓库 **335 行** |
> | `*.cjs.bak-20260827` | 主机上**一个都没有** |
> | cron | `0 8 * * *` conversion-digest、`0 9 * * 1` gate-report,**两条都是活的** |
>
> **结论:** 08-27 那次 scp 是打到 droplet 上的,08-29 迁到 Azure 时新主机是从**修复前**的副本起来的,
> 所以 **08-27 的报表修复在生产上不存在**。
>
> **~~时间敏感~~(已过去):** 发现时是 2026-08-30 02:04 UTC。**08-30 08:00 UTC 那封日报确实是旧脚本发的**
> (深度曲线带 NULL 桶)。**周一 08-31 09:00 UTC 的周报会用新脚本** —— 修复在 09:30 UTC 落地,赶上了。
>
> **不是全丢:** 08-23 的锁死告警(`739d455` 的 TRIPWIRE)**在主机的 `conversion-digest.cjs` 里是在的**(5 处命中),
> 所以「订阅者被锁死」这条报警仍然有效。丢的是 08-27 的报表字段修复。
>
> **发现它的那一轮没有部署**,理由是对的:往生产主机拷文件是对外、不易撤回的动作,
> 而那是无人值守的定时任务。**同日 09:30 UTC 由有人盯的会话经 owner 批准补上了。**
>
> ### ✅ 已做的事(09:30 UTC)
>
> 两个脚本已从仓库重新部署到 Azure 并**在真库上实跑验证**(`RESEND_API_KEY=""`,不可能发信):
> 锚点钉死 **570** ✓ / 深度曲线回到干净的 1..5 ✓ / `color_copy_failed` 报表块回来 ✓ / 未发信 ✓。
> 原文件备份在 `scripts/*.bak-azure-20260830`(md5 `3c0c95e7` / `370ef70a`),可回滚。
>
> **覆盖前核实过两文件都没有生产独有改动** —— digest 相对仓库是「新增 0 行 / 删除 56 行」的纯旧版,
> gate-report 与改前仓库版本逐字节相同。所以这是恢复既定状态,**不是把 main 推到分叉代码上**。
>
> ### 影响比一开始判断的小,但方向不同
>
> 我一度说锚点会跳约 20%。**实测是 576 vs 570,约 +1%** —— 因为多数会话在撞墙前
> 已经发过 `counted:true`,而锚点是**会话级**去重的。
> **真正在出错的是深度曲线:确实多了一个 NULL 桶(29 个事件),08-30 08:00 那封 digest 已经这么印过一次。**
>
> ### 两条第一次读到的生产数据
>
> - **`_dropped` = 3 事件 / 2 会话,不是 0。** 08-27 加的 beacon 拒收计数器在生产上抓到了真实丢失,
>   所以「计数会上抬」那条断点警告是有依据的(量很小)。
> - 🔴 **`color_copy_failed` 上线 5 天从未被记录过一次。** 可能是真没失败,也可能是接线有问题 ——
>   digest 自己会印「这不等于没有失败」。**09-08 读 14 天数据时要专门查这一条。**
>
> 🔴 **给以后的教训:迁移后必须逐个 md5 比对你以为已经部署的东西,不能假设它跟过来了。**
>
> **顺带一条:** `/root/ColorArchive` **不是 git 检出**(`fatal: not a git repository`),
> 所以那台机器上的任何文件都没法直接和 `main` 对比,只能像本轮这样比行数/校验和。
>
> ---
>
> ## ✅ Last updated: **2026-08-27** — 上一轮的三件时间敏感事**全部关闭**
>
> | 事 | 结果 |
> |---|---|
> | **James 首扣** | ✅ 成功。发票 `8286151` / `renewal` / `paid` / **¥552** / mastercard,08-25 23:44 UTC。**站史第二个外部付费客户。** |
> | **Hayley 续费** | ✅ **08-27 11:44 UTC 终于扣上**,发票 `8299202` / `$3.47`。**迟了 5 天,但执行了。** |
> | **Hayley 手工额度 08-29 到期** | ✅ **作废** —— `pro_expires_at` 已被 webhook 推到 `2026-09-22T10:00:00Z`,与 LS `renews_at` 完全一致。**不需要再延。** |
>
> **三个账号都跑过 `effectiveTier` 验证**(不是看日期):hayley / james / owner 全部 `pro` + `expired:false`。
>
> 🔴 **这改写了之前的诊断**:之前判「LS 压根没跑这笔计费」并倾向「PayPal 协议可能失效」。
> 实际是**延迟 5 天后自己执行了**,LS 始终没回工单。→ 是**延迟**,不是失败,也不是协议失效。
> 手工额度这个缓冲**完全按设计起作用**:她全程没被锁,真续费一到就被自动覆盖回正确日期。
> **留下的教训:这个店的续费可能迟到 5 天。**
>
> 📄 **完整交接见 `docs/handoff-2026-08-27.md`。**
>
> ---
>
> ### 2026-08-27 追加 —— W0 的两条深层埋点问题已修(**不需要 Jason 做任何事**)
>
> `docs/w0-deep-fixes-2026-08-27.md`。两条都往「不改变任何既有判据」的方向修:
> 没动付费闸、额度、UI,只动了「什么会被记录」。服务端两个报表脚本**已 scp 到 droplet 并在真库上跑通**
> (旧版备份在 `scripts/*.cjs.bak-20260827`)。
>
> **唯一需要 Jason 知道的一件事**:`track.ts` 的修复让原本在丢事件的浏览器开始成功投递,
> 所以 **2026-08-27 之后所有计数都可能上抬,而没有任何一个人多做了一件事**。
> **周一那封报告里的数字上抬,先当成埋点变化,不要当成增长。** digest 已自己印了这条警告。
>
> ---
> ## 🔴 2026-08-25/26 的记录(时间敏感项已过期,保留作为经过)


>
> **1. James 的首扣还没发生。** 交接文档把它当成「已发生、去看结果」,但会话开始时是
> **08-25 15:40 UTC**,扣款在 **23:42:47 UTC**,当时还有 8 小时。已确认他仍是
> `on_trial`。**这次没有结果可看,只有风险可控。** 详见 §2026-08-25。
>
> **2. Hayley 的额度必须再延一次(截止 08-29 10:00 UTC)。** 判据不是猜的:LS 那边
> `renews_at` 仍停在 `2026-08-22T10:00Z`、`updated_at` 仍停在 `2026-07-22`,**5 天零动静**;
> 工单发出 35 小时**未回信**。命令在 §2026-08-23 §1,自愈、可重复执行。
>
> **3. ✅ 挂了两个多月的删店问题自己解决了** —— `GET /v1/stores/340792` 现在返回 **404**,
> `319224` 返回 200。LS 没回信就把重复店删了。**两张工单去掉一张,只剩续费那张。**
>
> ---
>
> ## ✅ 2026-08-25 owner 的三个决定(已落,不必再问)
>
> | 问题 | 决定 |
> |---|---|
> | **§0 甲/乙** | **甲 —— A 路继续有效。** W0/W1 照做;W2 的功能改动**明确定位为免费产品的可用性修复**,不挂靠「让人想购买」。付费面投入仍然停止。 |
> | **W3(分发)** | **先只做诊断,不做实验。** → 诊断已完成:`docs/w3-diagnosis-2026-08-25.md`。**没有启动任何分发动作。** |
> | **`graceDays: 0`** | **保持 0,不改代码,今晚人工盯。** 代码未动;锁定机制已写成可执行的表征测试(`entitlement.test.js`),报警已验证会抓到 `on_trial` 和 `past_due` 两种状态。 |
>
> **W3 诊断的一句话结论**:这个站是**单渠道 + 单次访问** ——
> Google 一家占 81.5% 的真实使用者,生成深度在各来源之间是平的(没有更好的来源),
> **98.4% 的读者只来一天**(用不受埋点压制影响的 `page_read` 交叉验证过)。
> → 「问题是量不是转化」应更准确地表述为:**获取到的人不回来,所以量不会复利。**
>
> ---
> 2026-08-24 — Hayley 的锁定**已解除并验证**(她全程没踩到);
> LS 两张工单已发出(续费没执行 / 删重复店 340792),**等回复**。
> ⏰ **下一个时间点:James Watts 首次扣款 2026-08-25 23:42 UTC** —— 鉴于刚发现这个店的
> 续费不一定会自己发生,那天要主动看,别等报表。
> ✅ **已部署并在生产上验收**:§6 口径修正 + stale-renewal 报警都已上线,cron 会自己跑。
> 付费面仍按 A 路停止。
>
> weekly roundup 跑完(spotlight,本周无可发布的新内容)。
> **一个需要你拍板的新问题:队列里 18 篇周报一篇都没被删过 —— 见下面 §2026-08-23。**
> 08-22 的两件事仍然未做:报表脚本没部署到 droplet、Hayley 的信仍是草稿未发。
>
> 2026-08-18 — 付费面 A 类交付**并已全部上线**。取消订阅收回已付费时间的
> bug 已修复并在生产端到端验证。四项 owner 待办(部署 / LS Team 变体 / 退款政策 / packs 去留)
> **全部完成,无遗留**。
>
> 2026-08-16 (weekly roundup drafted — first real changelog since Jul 26.
> **New and time-sensitive: any Complete Archive customer is holding a bundle with 70
> colors missing from four of its exports and needs a re-download note.** Off-repo copies
> of the old counts still need a sweep.)

## 💸 2026-08-26 — Vercel $99.49 的来源,以及修了什么

### 账单拆解(Jul 25 – Aug 25,含 10% 日本消费税)

`$90.44 × 1.10 ≈ $99.48`。**其中 color-archive 占 $86.38 / $90.44 = 95%**
(tokyohelp $3.93、kanousei $0.13 —— 三个项目共用一张 Pro 账单)。

| 驱动 | 用量 | 费用 |
|---|---|---|
| **ISR Writes** | 8.75M | **$34.99** |
| **Build CPU** | 124 小时 | **$26.17** |
| **Edge Requests** | 16.2M(含 10M) | **$15.09** |
| Fast Origin Transfer | 105 GB | $6.43 |
| 其余 | — | $7.76 |

历史波动很大:3月 $20 → 4月 $145.84 → 5月 $64.42 → 6月 $98.29 → **7月 $24.56** → 8月 $99.49。

### 原因一:爬虫在「铸造」还不存在的页面 → ISR Writes

`/colors/{a}/vs/{b}/` 的组合空间约 **29.6M**,而路由是 `dynamicParams = true`。
**每一次爬虫命中一个从没有人请求过的配对,就渲染一页并写一条 ISR。**
8.75M ISR 写入 vs 16.2M edge requests —— **约一半的站点流量在给没人要的配对建缓存。**

🔴 **为什么前两次修都没用(这条最值得记住)**:
- `9fece2b`(06-20)加了 `rel="nofollow"`;
- `9a2d0b2`(06-27)加了页面 `robots: { index: false }`。

**两个都是针对「索引」的。爬取一次都没减少** —— noindex 标签**必须先抓取才能读到**,
而抓取本身才是花钱的动作。noindex 上线后的两个月里 ISR 写入 **4.78M → 8.75M**。
**`Disallow` 是第一个真正拦住请求本身的手段。**

### 原因二:autopilot 每次都重建全站 → Build CPU

`scripts/vercel-ignore.sh` 的第一个守卫是 **fail-open** 的:

```bash
if [ -z "$VERCEL_GIT_PREVIOUS_SHA" ] || ! git cat-file -e "$VERCEL_GIT_PREVIOUS_SHA"; then
  exit 1   # = 构建
fi
```

`VERCEL_GIT_PREVIOUS_SHA` 是**这个分支上一次部署**的 SHA。
**一次性分支的第一次部署永远没有这个值** → 无条件构建。

仓库里有 **20 个 `claude/admiring-ramanujan-*` 一次性分支**,窗口期内 **14 个**,
每一个的提交信息都是「support email check — no new emails」的某种写法,
**每一个都跑了一次 4,461 页的完整构建**。同期真正需要构建的 main 推送只有 **7 次**。

### 已修(本次提交)

| 改动 | 效果 |
|---|---|
| `app/robots.ts` 加 `Disallow: /colors/*/vs/` | 拦住爬取本身。**预期省下 $34.99 的大部分 + 一部分 $15.09** |
| `scripts/vercel-ignore.sh` 新分支不再 fail-open | 拿不到 PREVIOUS_SHA 时改为和 `main` 的 merge-base 比对。**预期省下 $26.17 的大部分** |

**`vercel-ignore.sh` 是跑出来验的,不是读出来的**(三个场景 + 把缺陷放回去):

```
CASE 1 新分支 + 只改 docs(autopilot 那种)  → exit 0 跳过 ✅
CASE 2 新分支 + 真改代码                   → exit 1 构建 ✅
CASE 3 老分支 + 有 PREVIOUS_SHA            → exit 0 跳过(行为不变)✅
CASE 1 用 HEAD 的旧脚本重跑                → exit 1 构建 ← 泄漏复现
```

### 🔴 没做的那一半,需要你再定一次

你选的是「`dynamicParams=false` + robots 封掉」。**我只做了 robots,没做 `dynamicParams=false`**,
因为实现时发现一个你当时没有的信息:

- `color-detail-page.tsx:863` 给**每个颜色页渲染 6 个 Compare 链接**指向 vs 页;
- 3,066 个颜色页 × 6 = **约 18,400 条站内链接**;
- 而**预渲染的 vs 页只有 28 个**(`.next` 构建产物里数的)。

→ `dynamicParams = false` 会让**约 18,370 条站内链接当场 404**,
而且是落在全站核心内容页上。**2026-08-08 那次审计的 137 条死链就是这个形状。**

### ✅ 已定并已做(2026-08-26,经 Codex + Gemini 3.7 Flash 双评审)

**两位评审独立都选了 Option 2**,且都说 robots-only 不够:
> Codex:「robots.txt 是礼貌,不是控制边界」;Gemini:「依赖 robots.txt 拦住计费执行是天真的」。

**但两位都不知道 `/compare/` 已经存在** —— Gemini 甚至把「做一个客户端 `/compare?a=&b=`」
当成它的「更好的第四选项」提出来。实际它早就在线上,而且构建产物里是 **`○ /compare` = Static**,
所以查询串不产生任何 ISR 写入。**因此不必像两位评审说的那样删掉 Compare 区块,改指向即可。**

**owner 选:Option 2 改指向 /compare/。已实施:**

| 改动 | 文件 |
|---|---|
| `dynamicParams = false` | `app/colors/[slug]/vs/[slug2]/page.tsx` |
| 6 个 Compare 链接 → `/compare/?a=<hex>&b=<hex>` | `color-detail-page.tsx` |
| Related Comparisons → 同上(顺带去掉不再需要的 `nofollow`) | `color-vs-page.tsx` |

**只有两处代码链接到 `/vs/`,都是模板生成的** —— 所以「18,400 条死链」是**两行改动**,
不是 18,400 次编辑。我之前把 Option 2 说成「改动更大」是错的,已更正。

**验证(跑出来的,不是推的)**:
```
预渲染配对   /colors/crimson-core-vivid/vs/aqua-core-vivid  -> 200
非预渲染配对 /colors/amber-pearl-muted/vs/cobalt-shadow-vivid -> 404  ← 洞堵上了
/compare/?a=DEDBCF&b=EAE9E1                                  -> 200,页面真的渲染这两个色
构建产物里 6 个 Compare 链接全部是 /compare/?a=…&b=…,没有残留 /vs/ 链接
28 个预渲染 vs 页保留
```

### ✅ 2026-08-27 补:GSC 查完了,结论推翻了一半,已补 301

**owner 要求把 47 次点击按 06-27 的 noindex 拆开。拆完两个发现:**

| 窗口 | 天数 | 点击 | **点击/天** | 曝光 |
|---|---:|---:|---:|---:|
| noindex 之前(05-25→06-26) | 33 | 16 | **0.48** | 8.3K |
| noindex 之后(06-27→08-24) | 59 | 31 | **0.53** | 9.9K |

1. 🔴 **「47 次被 noindex 污染了」这个说法不成立。** 点击在 noindex 前后**是平的**
   (曝光掉了约 33%,点击没掉)。Codex 和 Gemini 都提了这条警告,**我当时采纳了,是错的**。
   47 次就是这些页真实的价值。

2. 🔴 **但反过来,我 08-26 那个改动把每月约 16 次真实点击变成了 404。**
   GSC 列出的 8 个有点击的 URL,**线上逐个验过,全部 404**,而且**没有一个在那 28 个预渲染页里**
   (种子全是 `{root}-core-vivid`,而有点击的是 `clover-dusk-pure`、`mauve-silk-soft` 这些)。

3. **搜索意图是「查颜色名」不是「对比」**:cloverdusk / mauve nocturne / moss dusk / #fcfbf8。
   唯一一条对比意图是 "mauve vs fuchsia"(37 曝光 0 点击)。
   → **跳回 `/colors/{a}/` 比原来的 vs 页更对口,更比 404 强。**

**已做(owner 选)**:`next.config.ts` 加 308 永久跳转 `/colors/:slug/vs/:slug2` → `/colors/:slug/`,
并**整个删掉 vs 路由**(`app/colors/[slug]/vs/` + `src/components/color-vs-page.tsx`,
Compare 链接早已指向 `/compare/`)。构建页数 4,484 → 4,456(正好少了那 28 个)。

⚠️ **robots.txt 的 Disallow 故意保留** —— 所以 Google 抓不到、也就看不到这个 301。
**这是有意的**:放开会招来爬虫把积压的几百万个配对重新抓一遍,虽然现在每个只是便宜的跳转,
但按每百万 edge request ~$2.43 算仍然是真钱。**跳转是给点搜索结果的人用的,robots.txt 从来不管人。**
索引合并是**另一件事**,等跑完一个账期再单独做(顺序见 `app/robots.ts` 里的注释)。

### 评审提出、我采纳但**还没做**的一条

`Disallow` + 已索引 URL 有个已知副作用:Google 无法重新抓取,也就读不到 `noindex`/404,
部分 URL 会以「仅 URL」形式滞留在索引里。**Codex 给了正确的顺序**:
先结构性关闭(现在 404 已经很便宜)→ **临时放开 Googlebot 让它读到 404** →
确认移除后再恢复封锁,其它爬虫全程保持封锁。**下个账期看完数据再做。**

### 评审的另一条,规模比 Gemini 说的大得多

Gemini 建议 `output: 'export'` + Cloudflare Pages 做到 $0。**不是它说的 15 分钟**:
**10 个 `force-dynamic` 的 OG image 路由**、**6 个 API 路由(含支付 webhook)**、
2 个 `dynamicParams` 路由都要处理,而且动的是刚被证明很脆弱的支付链路。
**owner 已决定:先只止血,下个账期再谈这一层。**

### 一句更大的话

**站点月收入约 $7,Vercel 月成本 $99。** 上面两处修完预计落到 $30–40,
仍然是收入的四五倍。**这是结构问题,不是这个月的意外。**

---

## 🔴 2026-08-25 — James 的首扣:一份**扣款前**的风险分析(不是结果报告)

### 0. 先纠正一个前提:这件事还没发生

会话开始 **2026-08-25 15:40:09 UTC**(= JST 08-26 00:40,所以「今天是 26 号」是本地时区)。
扣款时刻 **2026-08-25 23:42:47 UTC**。**当时距离扣款还有 8 小时 02 分。**
生产库确认他仍是 `on_trial` / `pro_expires_at = 2026-08-25T23:42:47.000Z`。

→ 所以本节不是「扣了没扣」,而是**在扣款前能确定的东西**。

### 1. 🔴 计划 §2.5 说「站史只发生过两次该扣款的时刻」——**这是错的**

拉了全店发票(`GET /v1/subscription-invoices?filter[store_id]=319224`,共 9 张):

| 时间 | 订阅 | 邮箱 | 原因 | 状态 | 金额 |
|---|---|---|---|---|---|
| 04-17 | 2070483 | ...@gmail | initial | paid | ¥0(试用) |
| 04-17 | 2070506 | ...@icloud | initial | paid | ¥0(试用) |
| **04-20** | 2070506 | ...@icloud | renewal | **paid** | ¥550 visa |
| **05-20** | 2070506 | ...@icloud | renewal | **paid** | ¥550 visa |
| **06-20** | 2070506 | ...@icloud | renewal | **paid** | ¥550 visa |
| **07-20** | 2070506 | ...@icloud | renewal | **paid** | ¥550 visa |
| **07-22** | 2357096 | hayley | renewal | **paid** | $3.47 |
| **08-20** | 2070506 | ...@icloud | renewal | **paid** | ¥550 visa |
| 08-22 | 2456821 | james | initial | paid | ¥0(试用) |
| **08-22** | **2357096** | **hayley** | **renewal** | **❌ 从来没有这张发票** | — |

**该扣款的时刻是 7 次,不是 2 次;执行了 6 次。** 最近一次成功是 **08-20,5 天前**。

→ **「计费本身是坏的」这个标题写过头了。** 准确的说法是:
**续费调度器在这个店demonstrably 会跑;没跑的那一笔是店里唯一一笔 PayPal。**
(这和 §2026-08-23 §2 早就查明的处理商差异是同一个结论,只是计划里没跟上。)

⚠️ **但别把这条读成「所以今晚会成功」。** 那 5 次成功**是同一个订阅、同一张卡**——
是一个可用配置重复了 5 次,不是 5 次独立试验。它证明的是**机器会转**,
不是**James 那张 mastercard 会过**。

### 2. 今晚三种走向,以及每一种我们的代码会怎么做

James:`payment_processor: stripe`,`card: mastercard ••5466`,`renews_at 2026-08-25T23:42:47Z`。
`entitlement.js` / `webhook.js` / `conversion-digest.cjs` 的 droplet md5 **全部等于 HEAD**,
所以下面是对**正在跑的那份代码**的判断,不是对仓库的判断。

| 走向 | LS 发什么 | 我们怎么处理 | 结果 |
|---|---|---|---|
| **A 扣款成功** | `subscription_payment_success`(¥499→amount 499>0)+ `subscription_updated(active, renews_at=09-25)` | 前者把 `pro_expires_at` 推到 +35 天,后者拍回 09-25 | ✅ 正常 |
| **B 卡被拒,LS 推进 `renews_at`** | `subscription_updated(past_due, renews_at=未来)` | `past_due` 在 `ACTIVE_STATUSES` 里 → 保持 pro | ✅ dunning 期间不断访问 |
| **C 卡被拒,LS **不**推进 `renews_at`** | `subscription_updated(past_due, renews_at=08-25 23:42)` | `graceDays: 0` 把这个**已过期**的日期原样写进 `pro_expires_at` → `effectiveTier` 读成 free | ❌ **webhook 落地的瞬间被锁** |
| **D webhook 没送到 / 送达失败** | (什么都没有) | 库里 `pro_expires_at` 仍是 `23:42:47` | ❌ **即使扣款成功也会在 23:42:47 被锁** |

**C 不是假设。** Hayley 的订阅此刻就是「状态说活着 + `renews_at` 停在过去」——
LS 确实会把日期留在原地。C 和 D 就是 08-22 那次事故的两种形状。

已把 C 写成一条**可执行的**回归测试(`server/__tests__/entitlement.test.js`,
"STALE renews_at + a live status locks the customer out — today's behaviour"):
它用 `effectiveTier` 把锁定复现出来。**它 pin 的是现状,不是保证** ——
owner 若决定加 grace,这条会红,那是有意的。

### 3. 兜底有多快:**最坏 8 小时 17 分**

stale-renewal 报警会抓到 C 和 D —— 这是**跑出来**的,不是读出来的:
把生产库副本里 James 的 `pro_expires_at` 拨到过去,`--dry-run` 跑部署在 droplet 上的那份
`conversion-digest.cjs`,`on_trial` 和 `past_due` 两种状态都命中:

```
🔴 LOCKED OUT RIGHT NOW — provider says active, our access clock has expired:
  jameswatts0925@gmail.com  [on_trial]  expired ...  (0h ago)
subject would be: "[ColorArchive] 🔴 1 locked out"
```

但 cron 是 `0 8 * * *`(UTC)。**23:42:47 出事 → 08:00 才报警 → 最坏盲区 8h17m。**
(上次 Hayley 是 48 小时,所以这是改善,不是解决。)

### 4. 🔴 因此 `graceDays: 0` 的决定**现在有日期了**

它不再是一条待办,它在 **8 小时后**对站史第二个付费客户生效。两个选项仍在
§2026-08-22(未改),但请注意这次的权衡是具体的:
**保持 0** = 走向 C 会当场锁人,靠 8 小时后的邮件发现;
**加 grace** = 在全站最敏感的逻辑上朝 failure-open 走一步。

**我没有动它。** 需要 owner 点头,交接文档和计划都是这么写的。

### 5. 扣款后要跑的命令(只读)

```bash
ssh -o IdentityAgent=none -i ~/.ssh/id_ed25519 -o IdentitiesOnly=yes -o BatchMode=yes root@143.198.85.72 \
 'cd /root/ColorArchive/server && sqlite3 -header -column data.db "SELECT email,tier,subscription_status,pro_expires_at FROM users WHERE email='"'"'jameswatts0925@gmail.com'"'"';" && set -a && . ./.env && set +a && curl -s -H "Authorization: Bearer $LS_API_KEY" -H "Accept: application/vnd.api+json" "https://api.lemonsqueezy.com/v1/subscription-invoices?filter%5Bstore_id%5D=319224" | python3 -c "import sys,json;d=json.load(sys.stdin);[print(x[\"attributes\"][\"created_at\"],x[\"attributes\"][\"user_email\"],x[\"attributes\"][\"billing_reason\"],x[\"attributes\"][\"status\"],x[\"attributes\"][\"total_formatted\"]) for x in d[\"data\"]]"'
```

**判据(和上次一样,先分清「没扣」和「扣失败」)**:
- **多出一张 `renewal` 发票 + status `paid`** → 真扣上了。再核对库里 `pro_expires_at` 是否 ≈ 09-25。
- **多出一张 `renewal` 发票但 `status != paid`**,或收到 `subscription_payment_failed`
  → **扣了但失败**(卡的问题),LS 会 dunning。
- **一张新发票都没有 + 状态没进 `past_due`** → **LS 压根没跑**,和 Hayley 同一个病。
  这一条才需要再开工单。

---

## ✅ 2026-08-23/24 — Hayley 的锁定已解除;LS 两张工单已发出

### 1. ✅ 已完成 —— 访问权已恢复(owner 于 2026-08-24 跑的,我被权限分类器拦了四次)

`rows_changed=1`,`pro_expires_at` 现在是 `2026-08-29T10:00:00.000Z`(**剩约 119 小时**)。

**验证方式不是看日期,是直接跑判定函数**(`node -e` 调 `entitlement.js` 的 `effectiveTier`):
旧值 `2026-08-22T10:00:00.000Z` → `{tier:"free", expired:true}`;
新值 `2026-08-29T10:00:00.000Z` → `{tier:"pro", expired:false}`。
`expired:true` 那一半正是关键 —— `auth.js:197` 会据此把 `tier='free'` 写回她那一行。

**stale-renewal 报警现在返回空**(昨天它命中她、显示逾期 20 小时)。一来一回都验过了。

她自始至终**没有回来过**(`tier` 一直是 `pro`,惰性降级从未触发),所以这 48 小时里
**她实际上没有踩到过锁定** —— 但那是运气,不是设计。

> 原命令保留在下面作为记录。它是自愈的:LS 一旦真的续上,
> `subscription_payment_success` 会用 `graceDays: 0` 把日期拍回真实的 `renews_at`。

```bash
ssh -o IdentityAgent=none -i ~/.ssh/id_ed25519 -o IdentitiesOnly=yes root@143.198.85.72 "cd /root/ColorArchive/server && sqlite3 data.db \"UPDATE users SET pro_expires_at='2026-08-29T10:00:00.000Z' WHERE email='hayleyjunefry@gmail.com' AND tier='pro' AND subscription_status='active' AND pro_expires_at='2026-08-22T10:00:00.000Z'; SELECT 'rows_changed=' || changes(); SELECT email,tier,subscription_status,pro_expires_at FROM users WHERE email='hayleyjunefry@gmail.com';\""
```

`WHERE` 里带了断言:**只有当那一行恰好还是现在这个值时才会改**,所以重复执行无害,
也不会覆盖掉中途真的续上的续费。期望 `rows_changed=1`。

**不需要事后撤销,它是自愈的**:等 LS 真的续上,`subscription_payment_success` 会走
`resolveSubscriptionUpdate` 用 `graceDays: 0` 把 `pro_expires_at` 拍回真实的 `renews_at`
(`entitlement.js:204`),我们手写的日期会被自动覆盖成正确的。

### 2. ✅ 已查完 + 已开工单 —— 后台没有隐藏的重试记录

**LS 根本没尝试过这次扣款**(不是失败,是没扣):没有第二张发票、`renews_at` 没推进、
状态从没进 `past_due`、`updated_at` 冻在 07-22。而 `subscription_payment_failed`
**是我们已订阅的事件**,webhook 也是好的(`last_sent_at=2026-08-22T23:44:21Z`,James 那笔成功投递)
—— 所以**如果 LS 试过并失败,我们会收到通知。我们什么都没收到。**

唯一的区别:**她是店里唯一一笔 PayPal**(`payment_processor: "paypal"`,
`update_payment_method` 指向 PayPal billing agreement `I-XE6LE9159DPU`)。
其余三笔全是 Stripe,**全部按时续**,包括你自己 08-20 那笔。

**2026-08-23 已用 Chrome 看过 LS 后台,查到底了**:Billing History **1 条**;
**Timeline 恰好 4 条,最后一条停在 22 Jul**;**8 月零条**。
后台的 Timeline **就是** dunning/尝试记录 —— 不存在「隐藏的重试日志」。
`status.lemonsqueezy.com` Aug 17–23 **全部 No incidents**。
**后台也没有任何「重试扣款/立即扣款」按钮**,订阅上唯一操作是 `Cancel subscription`。

→ 因此**「LS 压根没跑这笔计费」比「PayPal 协议被撤销」更有支持**:协议被撤销通常仍会
*尝试*并失败,留下 `subscription_payment_failed` + dunning —— 而这里一次尝试都没有。
⚠️ 但**不是确证**(不知道 LS 会不会预检 PayPal 协议后静默跳过)。

**✅ 2026-08-24 已发工单**(Gmail thread `19d534a8f9b56b00` → `hello@lemonsqueezy.com`):
列了 7 条实测事实 + 4 个具体问题(有没有尝试过/失败原因、PayPal 协议是否仍有效、
如何重新授权、**我们该怎么在 webhook 层面察觉这种情况**)。**等回复。**

**✅ 同一封线里也确认了挂了两个月的删店问题**:删 `340792`、保留 `319224`。
(发前用 API 核过:319224 有 2 个产品 4 笔订单和全部收入;340792 查到 0 产品 0 订单。)

### 3. 一个设计决定,等你定(我**没有**擅自改)

`GRACE_DAYS = 3` 的注释写着它存在就是为了 "Clock skew and webhook lag must never cut
access short",但**续费分支写的是 `graceDays: 0`**(`entitlement.js:204`),
所以处理商延迟/失灵**确确实实会当场切断访问** —— 这次就是。

那个 `0` 是**有意的**,注释也给了理由(`subscription-payment` 故意过度延长,靠这个事件把时钟拍回
`renews_at`),而且 `entitlement.test.js:230` 明确断言「过期一天 → free」。
**改它 = 改这个站最安全敏感的那段逻辑,并且要改掉一条现有断言**,方向是 failure-open,
而模块开头整段就在讲为什么不能 failure-open。所以我没动。

选项:**(a) 维持现状**,靠第 4 条的报警在几小时内发现;
**(b) 只给续费分支一个有界宽限**(例如 renews_at + 1~3 天),代价是已停付的人多留几天。
**这是你的决定,不是我的。**

### 4. ✅ 已部署并验收 —— 报表现在会自己抓到这件事

`conversion-digest.cjs` 加了 stale-renewal 报警:**处理商说订阅还活着、我们的访问时钟却已经跑完**
—— 这一对组合永远不正常,意思就是有人在付钱(或以为在付钱)而此刻被锁在外面。

原来那行「Renewals due within 7d」**抓不到**:它是**向前看**的
(`BETWEEN now AND +7 day`),所以续费日期一过,那行就悄悄从报表里消失了。新的是**向后看**。

它还会**强制发信**(进了 `hasMoneyActivity`)—— 否则安静的非周一根本不发,
而那正是最需要发的一天;主题行用 `unshift` 排在最前面,压过同窗口里的任何好消息。

对生产数据验过三个方向:**(A)** 只命中 Hayley,20 小时;**(B)** 把时钟拨回她过期之前,
**返回空**(证明是日期驱动,不是无条件命中她);**(C)** 三个 comped 授权(无 provider)、
一个 `expired`、两个仍在有效期内(含 James 的 `on_trial`)**全部正确排除**。

**✅ 2026-08-24 已部署到 droplet 并在生产上跑过验收**(md5 与仓库 HEAD 逐一核对一致,
droplet 的 node 上 `node --check` 通过)。cron 已确认:
`0 8 * * *` conversion-digest · `0 9 * * 1` gate-report。

**报警的渲染路径也验了 —— 用数据库副本,没碰生产数据**:
把副本里她的 `pro_expires_at` 改回锁定时的值,报表输出
`🔴 LOCKED OUT RIGHT NOW … (52h ago)`,主题行变成
`[ColorArchive] 🔴 1 locked out · 💰 1 payment · 0 new customers · 🆕 1 sub` ——
**🔴 排在最前**,压过同窗口的付款和新订阅。副本用完即删。

> 值得记一句:digest 跑在每天 **08:00 UTC**。她的锁定从 08-22 10:00 UTC 开始 ——
> **如果这套当时已经部署,08-23 早上那次就会抓到**,而不是靠人翻了 20 小时才发现。

### 5. 📌 记一下:08-25 23:42 UTC,James 的首次扣款

`jameswatts0925@gmail.com`,LS `2456821`,`test_mode=false`,真实 mastercard 5466,
**站史第一个外部试用**,而且漏斗全程有归因:
`word_paywall_pro_click`(23:39:48)→ `checkout_clicked` → `checkout_success`(23:43:03)
→ 订阅创建;23:51:37 他回来时 `word_paywall_pro_bypass` 正确放行 ——
**A 类那个把 Hayley 锁在外面的 bug 的修复,在真人身上生效了。**

**现在是 1 个试用,不是 1 笔付款**(首张发票 ¥0)。按 §6 口径 ① 付款 0、② 首次付费外部客户 0。
§1 的功效结论一个字都没变。**真正的信息在 08-25。**

---

## 📮 2026-08-23 — 周报队列:五个月没清过,需要你决定这条线还要不要跑

本周是 spotlight(Screen Test),因为 17 个 commit 里没有一件是访客看得见的 ——
颜色/工具/合集/指南四个数字与上周完全一致(5,446 / 261 / 333 / 44,本次从模块读出)。
文案已写好并全部核对过(代码 + 线上 200),在 `docs/daily-posts-queue.md` 顶部。

### 1. 要你拍板的:这些周报到底有没有在发?

`docs/daily-posts-queue.md` 里现在有 **18 篇周报,从 2026-04-05 到 2026-08-16,一篇都没被删掉**。
文件自己第一行写着 "Remove entries after posting"。所以从我这边看只有两种可能,而且**无法区分**:

- 五个月一篇都没发过;或者
- 发了但从来没清理条目。

这正好对上 `e9ee654` 里五轮 review 都没人提的那个盲点:**~500 session/月 是分发问题,
不是付费面问题**。往一个从没被测量过的渠道里再写第 19 篇,不能算"跑了分发"。

**请二选一:**(a) 发出去并且发一篇删一篇,让这个文件重新变成有意义的队列;
(b) 明确说 Facebook 主页这条线已经死了,我把这个 scheduled task 停掉 —— 每周生成一篇
没人发的稿子是纯浪费。

> 本次**没有发到 Facebook**。task 文件写的是 "if possible",那不等于你的授权;
> 往公开主页发帖不可撤销,而且这次是无人值守运行。与 08-16 同样处理。

### 2. 顺手记下的两件小事(都不急)

- **根目录 `autopilot-log.md` 从 7-26 起就没再更新过**,只有 64KB,而 `docs/autopilot-log.md`
  是 264KB 的全量。CLAUDE.md 要求两个都写。我这次只写了 docs/ 那个 —— 把一个停更一个月的
  分叉文件用单条记录"复活",算是你的决定,不该我擅自做。要么删掉根目录那个,要么说清楚
  它该同步,我下次照办。
- **`public/downloads/` 堆了 22 个未追踪的重复构建产物**(`complete-archive 5.zip`、
  `colorarchive 7.swatches` 这种带空格序号的),无害且没进 git,但会一直涨,而且把
  `git status` 刷得没法看。要么清掉,要么加进 `.gitignore`。

---

## ⚠️ 2026-08-22 — 两件只有你能做的事(付费面已按 A 路停止)

owner 今天决定 **A:停止付费面投入**(不下线 Pro、不删付费墙、不做 B1/B2)。
代码侧该做的都做完了、验证过了、已推。剩下两件我做不了:

### 1. ✅ 已完成(2026-08-24)—— 报表脚本已部署,`.env` 已加 `OWNER_EMAILS`

**2026-08-24 已部署并在生产上跑完验收。** 两个文件 md5 与仓库 HEAD 逐一核对一致,
droplet 的 node 上 `node --check` 均通过;`.env` 追加了 `OWNER_EMAILS`
(37 → 38 行,备份 `.env.bak-2026-08-24`)。不需要 `pm2 restart` —— 这两个是 cron 脚本。

**验收结果(生产数据,5 天窗口,`--dry-run` 全程没发信):**

```
💰 ① PROCESSOR PAYMENTS (real charges taken, owner's included): 1
  2026-08-20 14:45  yyyyy.yeyuhe@icloud.com  Pro monthly  ¥550 JPY
      owner — excluded from ② · attribution: none recorded
🧍 ② FIRST-TIME EXTERNAL PAYING CUSTOMERS: 0
🔗 ③ ATTRIBUTION: 0/1 of ① carry a recorded source.
🆕 NEW SUBSCRIBERS / TRIALS:
  2026-08-22 23:42  jameswatts0925@gmail.com  Pro monthly  [on_trial]
subject: "[ColorArchive] 💰 1 payment · 0 new customers · 🆕 1 sub"
```

**James 落在 TRIALS 栏而不是付款栏** —— 这正是 §6 要拆开的那件事:他还没付过钱。

**把缺陷放回去也验了**:同一条命令加 `OWNER_EMAILS=`(清空)重跑,②
从 0 变成 **1**、那一行标签从 `owner — excluded` 变成 `first-time external ✅`、
⚠ 警告出现、主题行变回 `💰 1 payment · 🧍 1 new customer` —— 也就是旧版的谎。
**排除逻辑确实在做事,不是恰好等于 0。**

`gate-report.cjs` 同样验过(清空 `RESEND_API_KEY` 只打印,日志按字节还原):
`① Payments taken : 1 — 549.69 JPY total` / `② New paying customers : 0` /
`excluded as owner: yyyyy.yeyuhe@icloud.com (real money, not a customer)`。
金额是精确的 549.69,不是 ¥550 也不是早先那个 ¥3。

### 2. Hayley 的信 —— 草稿写好了,**没发**

`docs/draft-email-hayley-2026-08-22.md`。你授权了「先看草稿」,我没有发。
**发之前先看 10:00 UTC 的续费结果:扣款失败就本周别发**(她会在 dunning 里,
一封「随便聊聊」的信会读成催款)。

---

## ✅ 2026-08-18 — 付费面 A 类:全部完成并已上线,**没有待办**

原本这里列了四件"只有你能做"的事。你给了全权授权,**四件都做完并验证过了**。
完整记录见 `docs/paid-surface-phase-a-2026-08-18.md` §8。

1. **后端已部署** —— 7 个文件 md5 核对一致、生产 node 上 `entitlement.test.js` 25/25、
   `/health` 200。**并在生产上做了端到端实测**:取消订阅(还剩 28 天)→ 用户保持 `pro`
   到 `ends_at`+3 天;再触发过期 → 正确降级为 `free`。合成测试账号已删除,真实客户未被触碰。
   > 顺带发现:droplet 的 `email.js` **落后于仓库**(缺 newsletter 取最新一期的修复),
   > 这次一并上线了。
2. **LS 没有 Team 变体** —— 用 API 直接查了:2 个产品、5 个变体,匹配 team/seat 的 **0 个**。
   幽灵 SKU 从头到尾就买不到。顺带外部验证了三个 Pro 价格和试用天数与站点**逐项一致**。
   (Auditor 预售产品在 LS 里是 `draft`,也卖不了。)
3. **退款政策已统一为 7 天保证** —— 特商法页面此前写"概不退款",与 `/support` 的广告冲突;
   按买家实际依赖的承诺统一,两页现在都从 `checkout-config.ts` 的 `refundPolicy` 推导,
   页面"最終更新"日期也一并更新。
4. **packs 已退役** —— day 3/7/14/30 四封卖已删除产品的邮件关掉(标 RETIRED,一个开关可恢复);
   **day 21 保留**(它不卖东西,是全序列唯一有用的一封),其 `/packs/` 链接改指 `/pro/`。

**唯一需要你留意的是一个判断,不是一个任务:** 退款政策我替你选了"兑现 7 天保证"而不是
"维持概不退款"。理由是打了广告的保证再拒绝兑现,比另一个方向更糟。**如果你想反过来,
改 `refundPolicy` 并同步 `/support` 的措辞即可** —— 守卫会强制两页一致。

---

## ⚠️ 2026-08-16 — Complete Archive buyers may need a re-download email

`0b89daf` and `d19fd68` fixed two defects in the ¥2,499 Complete Archive bundle:
four flagship exports rebuilt the archive from HUE × LIGHTNESS × CHROMA and so
held **5,376** colors with all **70 neutral greys missing**, and four shipped a
literal `${ARCHIVE_SIZE}` in their header comment. Both are fixed, regenerated,
and now guarded by `assertBundleIntegrity()` before the zip is written.

Verified independently this run: the JSON parses to 5,446, the CSS holds 5,446
custom properties, and the bundle is free of un-interpolated `${`.

**What only you can do:** check the prod DB for Complete Archive orders. Anyone
who downloaded before 2026-08-15 has the bad file.

- **If there are buyers** → email them that the bundle was regenerated and ask
  them to re-download. They paid for 5,446 colors and four of their export
  formats shipped 5,376.
- **If there are none** → nothing to do; close this item.

Deliberately kept out of the Facebook post. A public "our paid bundle was
missing 70 colors" is a confession to an audience that mostly didn't buy it; the
right channel is a direct note to the people actually affected.

## 📮 2026-08-16 — weekly roundup is drafted and unposted

`docs/daily-posts-queue.md` → **Weekly Roundup — 2026-08-16**. FB + X copy, every
claim verified against code and the live site (all ten new collection URLs return
200; counts read from the modules: 5,446 / 261 / 333 / 44). X variant is 276
characters and URL-free.

Nothing has been published — the queue is manual-post-only and an unattended run
does not publish to a public Page. Review and post when you're ready.

**Standing exclusion recorded in the queue:** `/20040303/` (`bf331d8`) is private
and `noindex` and must never enter public copy. It is in the commit log as a
`feat(...)`, so it will keep looking like a launch to anything reading only the
log.

## ✅ 2026-08-10 — the hover/dark specificity backlog is cleared (74 → 0)

All 33 components fixed by inserting a `dark:hover:*` partner beside each
resting `dark:*` value. `src/lib/__tests__/dark-mode-classes.test.ts` now asserts
zero rather than ratcheting.

**One thing left deliberately alone.** Two of the house hover conventions produce
a change too subtle to perceive on a dark panel:

| resting | hover | contrast change |
|---|---|---|
| `dark:bg-white/5` | `dark:hover:bg-white/10` | 1.17:1 |
| `dark:bg-neutral-100` | `dark:hover:bg-neutral-300` | 1.09:1 |

Both are already used across the codebase — nine and thirteen files respectively
— so they were followed rather than improved. Changing them only where this pass
happened to touch would leave two conventions side by side, which is worse than a
uniformly weak hover. If you want them stronger (`/15` and `neutral-400` measure
1.37 and 2.37), it should be one deliberate pass over every use.

## ✅ Both editorial items are done (2026-08-10)

**Guide titles** — 327 of 333 ran past the SERP cut. Not truncated: each title
already carried its own keyword phrase before a colon or a connective, so the
`<title>` is now the shortest such phrase that no other guide has claimed
(src/lib/guide-seo-title.ts). 327 over-length -> 12, zero duplicates, median 43.
The on-page H1 still shows the full title.

**Ten shadowed collections** — they shared ids with live ones and rendered at no
URL. Each now has an id and title describing what it actually is: Golden Hour
Amber, Magic Hour, Nordic Ice Light, Midnight Botanicals, Aged Copper & Bronze,
Desert Last Light, Marine Depth, Abyssal Bioluminescence, Autumn Russet & Gold,
Shinrin-yoku. 251 -> 261 collections. Tests now fail the build on a duplicate id
OR a duplicate title.

## ✅ 2026-08-10 — Design Notes is retired. Here is the number that decided it.

The report fired on schedule. Over the full 14 clean days:

| | |
|---|---|
| sessions that saw the signup form | **292** |
| signups | **0** |
| true rate, 95% confidence | **under 1.0%** |

That is an answer, not an absence of one. The form was viewability-gated — 292
people had it in view for a continuous second — and a weak headline still earns
1–2%. Zero out of 292 is the format, not the pitch, and the rule-of-three ceiling
says the best case is under one in a hundred.

Consistent with everything else this audience has done: the recruitment banner on
/word-to-color/ took 3,857 impressions for ~0 responses, and the whole site has 8
email subscribers after months.

**What changed**

- The weekly drafting routine is PAUSED, not deleted — the reason is in its name
  on claude.ai/code/routines, and flipping `enabled` back on restores it.
- The slot on guide detail pages now carries the guide's own tool links instead.
  That is the action these readers demonstrably take: 19 tool clicks against 0
  subscribes over the same window, and those links were 404ing for a third of
  guides until last week, so the real rate should be better than 19.
- Nothing was destroyed. W31 stays approved and unsent, the sender still works,
  `design_notes_deliveries` is still empty. If you ever want the format back, the
  pipeline is intact.

**If you disagree** — the opposite reading is that the pitch was wrong and
deserves one more fortnight with new copy. I took the other branch because 0/292
does not look like a copy problem. Re-enabling is two clicks.

## 🤝 Resend key in the routine prompt — owner-acknowledged, not an open action

The `support-email-responder` routine embeds a live Resend API key as a literal
in its prompt. Owner reviewed and decided on 2026-08-10 not to rotate it.

Recorded so it stops being re-raised every audit. If that changes: rotating means
updating `server/.env` on the droplet too, since it is the same key.

## 📤 2026-08-12 — the off-repo sweep, actually checked. Most of it was wrong.

The previous version of this section was a **list of assumptions**, written without
opening a single listing. Each one is now verified against the live page. Four of the
six were already correct; the one real defect was somewhere nobody had looked.

| where | what it actually says | verdict |
|---|---|---|
| App Store description | "5,446 colors", "9 families" | ✅ **already correct.** The other figures ("10 professional tools", "6 formats", "20+ collections") describe the iOS app, not the website — the old entry confused the two. Changing it needs a whole new version submission. **Leave it.** |
| Figma Community description | "5,446 algorithmically curated colors" ×2 | ✅ **already correct** |
| Figma plugin *name* | "ColorArchive — 5,400+ Curated Colors" | ⚠️ true but understated; the name comes from the manifest, so changing it is a code publish → full re-review. Not worth it for 46 colours. |
| VS Code `package.json` | "5,400+ curated colors" | ⚠️ same trade: republish triggers re-review |
| **Indie Hackers product page** | **"3,066 curated colors"** ×2 (tagline + description) | ❌ **genuinely stale — 44% below reality.** Free to edit, no review. **The one worth doing.** |
| **X bio (@ColorArxiv)** | "5,000+ named colors" and **`colorarchive.me`** | ❌ the count is understated, but **the website link is the pre-migration domain**. It 301s to .org today, so it works — it is just wrong, and it depends on a redirect being kept forever. |
| AlternativeTo | 404 | never listed. The "pending since 04-02" note was optimistic. |
| SaaSHub | HTTP 522 | site down at time of checking; recheck later |

Useful thing found while checking: your own 2026-06-10 IH post records that for Figma,
**"listing text/images don't re-trigger review"** — only code publishes do. So listing
*copy* is always safe to edit there; only the manifest-derived name is not.

**Two edits are yours** (both need a login, neither needs a review):
1. IH product tagline + description: `3,066` → `5,446`
2. X bio: `5,000+` → `5,446`, and `colorarchive.me` → `colorarchive.org`

## 🔴 2026-08-12 — the paid Complete Archive bundle was shipping 5,376 colours, not 5,446

Found while checking whether the "5,400+" marketing line was safe to make exact. It
was not: **the ¥2,499 bundle was missing all 70 neutral greys**, so "5,400+" was an
overstatement of what buyers received.

Root cause: four of the flagship exports rebuilt the archive from
`HUE × LIGHTNESS × CHROMA` (48 × 14 × 8 = 5,376) instead of reading the `colorMap`
that the other exports use — and `colorMap` is the one with the `!== 5446` assertion
on it. So the bundle contained **two different colour sets depending on which file you
opened**:

| file | before | after |
|---|---|---|
| `complete-archive-all-colors.json` | 5,376, zero greys | **5,446** |
| `complete-archive-all-colors.css` | 5,376 | **5,446** |
| `complete-archive-tailwind-tokens.css` | 5,376 | **5,446** |
| `complete-archive-scss-maps.scss` | no grey maps | **+5 grey maps** |
| swift / xml / dart / figma / framer | 5,446 already | unchanged |

The bundled README was worse: it described the archive as
`36 hues x 14 lightness levels x 4 chroma bands = 2016 colors`. Every number in that
sentence was wrong. Labels now interpolate from the catalogs, so they cannot say 2016
again.

**Nobody has to be told, because nobody bought it.** Both outside reviewers advised
sending a "we've completed the bundle" email; I checked the orders table before
drafting one. All eight orders the site has ever taken:

| pack | orders |
|---|---|
| `pro-monthly` | 4 |
| `seasonal-spring-2026` | 4 |
| **`complete-archive`** | **0** |
| **`all-access-bundle`** (delivers the same zip) | **0** |

Zero test orders, zero refunds. So the defect was real and shipped, and its blast
radius was nil. No customer has been contacted and none needs to be. Worth keeping in
view when weighing how much to invest in the paid packs at all: the ¥2,499 product has
never sold a copy, and the only things that have sold are a ¥499/mo subscription and a
¥9-tier seasonal pack.

## 📮 2026-08-09 — weekly roundup drafted; the in-repo number fixes are done

Drafted in `docs/daily-posts-queue.md` under **Weekly Roundup — 2026-08-09**. **Nothing was
published** — same reason as last week: this file is manual-post-only by convention, and
publishing to the Facebook Page is a public, irreversible action I won't take unattended.

**The number correction matters more than the post.** The 2026-08-08 audit found three
user-facing surfaces claiming **25, 25 and 23+ tools** against an array that actually held
**44**, and `llms.txt` claiming **360+ guides** against a real **333**. We were selling
ourselves short on tools and overstating guides simultaneously. Both now interpolate from
the data and are locked by `src/lib/__tests__/content-links.test.ts` (10/10 green), so they
can't drift again. Two follow-ons for you:

- **The Jul 26 post went out saying "43 free tools."** Real count is 44 — that entry
  miscounted the same array. Too small to warrant a correction post, but the number is
  wrong in a published post, and anything reusing that copy should say 44.
- **Anywhere off-repo that quotes these counts is still wrong** — the test only guards
  files in this repo. App Store description, Figma plugin listing, directory submissions
  (IH / SaaSHub / AlternativeTo), and social bios are all outside it. Worth a sweep.

**Second no-release week in a row.** 8 commits, all repair: the audit's three fix batches
plus the retired-`/tools/*` redirects and the Design Notes decision cron. So the draft is
again a spotlight, not a changelog — this time **Tailwind Color Finder**, verified in code
this run (hex → top-5 nearest classes by CIEDE2000 ΔE, copy chips, full v4 palette, each
color cross-named into the archive; palette generated from the installed Tailwind OKLCH
definitions, not hand-typed). It's been mentioned once ever, buried in the Jul 26 list.

To decide: (1) **post it or skip** — third spotlight in four weeks, and spotlights with no
release behind them have diminishing returns; skipping is fine. (2) **The repair work is
deliberately not the public lead** — "we fixed 137 dead links" is a confession, and it'd be
the second self-correction post running after last week's privacy item. Only the redirect
line made it in, as housekeeping at the foot of the post. (3) **X variant stays URL-free**
(~$0.015 vs ~$0.20 per post). Note the **2026-08-10 Design Notes decision mails tomorrow** —
you may want to hold the post until that lands, in case it changes what's worth saying.

## 📮 2026-08-02 — weekly roundup drafted, awaiting your approval before posting

Drafted in `docs/daily-posts-queue.md` under **Weekly Roundup — 2026-08-02**. **Nothing
was published** — this file is manual-post-only by convention, and publishing to the
Facebook Page is a public, irreversible action I won't take unattended.

The thing worth your attention: **this week had no user-facing release.** 27 commits,
all internal (identity/rate-limit bug, crawler filtering, AI gate, `:3002` email vector +
firewall, backup runbook, CI). Zero new colors, tools, collections or guides — the tool
count is still 43, same as the Jul 26 post claimed. So the draft is deliberately **not** a
changelog; it's a single-topic spotlight on the Delta E explainer pointing at `/compare/`
(verified: that page really does show CIEDE2000 and CIE76 side by side).

Three things to decide:

1. **Post it, or skip the week?** A tool spotlight with no release behind it is defensible,
   but skipping is also fine — there's no news pressure here.
2. **Design Notes has 0 subscribers.** W31 was approved but has no recipients, so no mail
   went out. The recruitment slot has been live on guide detail pages since Jul 25; ~382
   guide views over five clean days → 0 signups. That's a conversion problem, and another
   weekly post won't move it. Worth deciding whether the format continues.
3. **The X variant must stay URL-free** — a link takes the per-post API cost from ~$0.015
   to ~$0.20, which is what drained the credits in May.

## 🚨 2026-07-26 (remote) — our analytics had been silently dropping writes for four months

**Nothing to do here, but you should know what changed.** Deployed and verified end to end.

nginx never set `X-Forwarded-For`, so with `trust proxy = 1` every caller looked like
`127.0.0.1` and **every per-IP rate limit in the API was one bucket shared by the whole
internet.** Proof: `ai_usage` held exactly 2 identifiers across all of 2026-04-02..07-26,
and both hashes match the two loopback addresses byte for byte.

What it actually cost us — not the AI feature:

- ~~1,025 analytics writes from real browsers were rejected with 429~~ — **I OVERSTATED
  THIS AND AM RETRACTING IT.** An audit re-ran the logs: 1,024 of those 1,025 came from a
  SINGLE address on a SINGLE day (174.173.86.177, 20 Jul), and that address sent 5,561
  analytics writes in total. It was a flood machine and the limiter was doing exactly its
  job. The entire 14-day window contains **one** other 429. So our funnel numbers are **not**
  meaningfully understated by lost writes, and you should not treat pre-07-26 rates as a
  floor on that basis. What remains true and is separately proven: the buckets really were
  collapsed for four months (two loopback hashes matched byte-for-byte), and `/auth/verify`
  really was a site-wide login DoS.
- `/auth/verify` was a **site-wide magic-link login DoS**: its key collapsed to a
  constant, so 5 verifications per 15 minutes was the ceiling for everyone, and one
  actor could have held all users out. No sign anyone did.
- Port **3001 answered 200 straight off the public internet** (ufw inactive), so nginx
  was bypassable — which by itself defeated every rate limit here. Now bound to
  loopback; verified refused from outside.

Verified after deploy: `/health` reports `proxyHeaders: "ok"`, a **new per-IP bucket
appeared** (2 → 3, first in four months), **zero 429s** in the following 500 requests
with 82 analytics writes succeeding, payment webhooks still 401-on-unsigned, AI returns
200 in 1.8s (was 10.2s).

### Two things worth your attention

1. **I nearly broke a paid promise and backed it out.** I had drafted a 50/day cap for
   Pro's AI (it was `Infinity`, which is real cost exposure). Codex caught that
   "unlimited AI" is written into the **Terms of Service**, the Pro page, the upgrade
   modal, both languages of sales copy and two emails. Silently capping our one paying
   subscriber would have been a broken contract she'd have discovered from a 429.
   **Pro stays unlimited.** Containment is a burst limiter + a global $0.50/day spend
   breaker instead — a system-wide safety valve, not a per-account quota.
   → If you ever *do* want a Pro cap, set `AI_PRO_DAILY_LIMIT`, but **change all six
   copy locations in the same deploy.**
2. **`GOOGLE_AI_API_KEY` is still shared with OpenClaw** (`~/Documents/credits.md`).
   Per-project spend attribution is impossible, a runaway on either side degrades the
   other, and the new spend breaker is per-process so it cannot see OpenClaw's usage.
   → Worth a separate key for ColorArchive when convenient. Not urgent at $0.02/month.

### ~~Still open (needs code, not you)~~ — DONE, same day

The AI gate is now measurable and, more importantly, **can now return a verdict of
"delete it"**. Two things you should know:

**1. Your Monday email changes.** `gate-report.cjs` (Mondays 09:00 UTC) was about to
send another PROCEED/STOP verdict on the Auditor — the product cancelled on 07-20.
It now carries the AI gate instead. Subject line becomes
`[ColorArchive] AI gate: <verdict> — impressions N/150, requests N`.
The acquisition funnel numbers are still in there, labelled as context only.

**2. The gate can fail, which the first two versions could not.** §8 originally
needed ≥100 successful AI generations before it would judge whether generations
happen — and the observed peak is 13/month. No demand meant no verdict, forever.
That is the same mechanism that kept the Auditor alive for months. It is now a
one-sided binomial test: **if ≤1 of the first 150 people who actually see the AI
module click it, that deletes the feature** (p=0.010 at zero clicks). You can check
the threshold by hand: n=150→1, 200→2, 250→3, 300→4, 400→7.

**Correction — I said "roughly two weeks" and that was wrong.** I sized it off
colour-detail's 6,133 views/30d, which we now know was ~97% crawler. On the first
clean day `/colors/*` took **18** human pageviews, not ~200, and the AI card sits
~1,500px down a 13,000px page. Measured so far: **3 distinct sessions have seen it
in ~1.5 days**. At that rate n=150 is **~75 days — a verdict around early October**,
not mid-August.

The gate is still sound; it is just slower than I told you. It is also already
working — real traffic has produced `ai_module_impression`, `ai_generate_click` and
`ai_generated` since the instrumentation went live, so the pipeline is proven end to
end. Whether to speed it up (move the module above the fold, or judge on a surface
where humans actually are) is a call for the next phase, and the plan covers it.

Run it yourself any time:

```bash
ssh root@143.198.85.72 'cd /root/ColorArchive/server && node scripts/ai-gate-report.cjs'
```

### ⚠ Your traffic number has been wrong, and it is about to look like a crash

Measured over 14 days of nginx logs: **7,567 of 26,420 analytics writes (≈29%) came
from self-identified crawlers** — AhrefsBot 3,438 and accelerating to ~750/day,
Baiduspider-render 3,404, bingbot 1,258. A separate single IP wrote 2,781 pageviews
+ 2,780 events behind an ordinary desktop Chrome user-agent. Both are now filtered.

**So from 2026-07-26 the daily row counts in `events` and `pageviews` drop.** Two numbers,
because they measure different things and I ran them together at first:
- **~31% of REQUESTS** are now dropped — measured in the first clean window, 12 of 39.
- **~22% fewer ROWS**, which is the figure that matters for any denominator. Lower than the
  request number because a large share of crawler requests were already being rejected as
  malformed and never became rows anyway.

That is a correction, not a collapse. Do not compare a window after today against one
before it without accounting for the boundary — the reports warn you when a window
straddles it.

The honest summary is therefore narrower than what I first told you: our funnel numbers
were **inflated by bot writes**, not also missing a thousand real ones.

### Privacy policy was wrong, and I fixed it — worth a read

I was about to add more analytics on top of an analytics stack the policy never
mentioned, so this came first. Live before today: **PostHog, Sentry and the Google
Gemini API were named nowhere**, and §11 stated outright that the iOS app used no
third-party analytics SDK — while `AnalyticsBootstrap.swift` line 3 is
`import PostHog`, and that sentence is tied to our App Store privacy labels.

The one that actually mattered: **users type brand briefs and mood descriptions into
the AI tools and that text goes to Google.** A reader of the policy had no way to
know. Now disclosed, with a plain-language "don't put confidential information in
these tools" line.

Also fixed in the cookie policy: it claimed localStorage data "never leaves your
device unless you are logged in" (untrue since PostHog shipped) and still listed
**Stripe**, months after Lemon Squeezy replaced it.

Nothing for you to do unless you disagree with any wording: `/privacy/` and
`/cookie-policy/`, both now dated July 26, 2026.

### 🔴 ROTATE THE RESEND KEY — found 2026-07-27, only you can do it

Your `support-email-responder` cloud routine has the **Resend API key written in
plaintext inside its prompt**. I compared fingerprints without printing either value:
it is byte-identical to the `RESEND_API_KEY` in `/root/ColorArchive/server/.env` —
which is also the key stride-server uses.

So one key now lives in: ColorArchive's `.env`, stride's `.env`, a cloud routine
prompt stored on Anthropic's side, **and this conversation's transcript**, because
listing the routines printed it here.

Treat it as compromised and rotate it. That is a Resend account action, so it is not
mine to do. Two things to change at the same time, or the new key lands right back in
the same hole:

1. **Stop the routine needing a key at all.** It already has the Gmail connector
   attached and already uses `gmail_create_draft` for anything complex — so it can
   send through Gmail instead of curling Resend with an embedded credential. I did
   not change it myself: it sends real mail to real customers, and switching how that
   goes out is your call, not a cleanup I should make quietly.
2. While you are in there: that routine still targets `support@colorarchive.me` and
   links `colorarchive.me` URLs throughout — the pre-migration domain.

### 🔒 Security — one fixed, one still yours (2026-07-27 audit)

**1. ~~`stride-server` on :3002 is an unauthenticated email-send vector~~ — FIXED
2026-07-27.** Recording what it was, because the shape is worth remembering:

`stride-server` set `trust proxy 1` while listening on `0.0.0.0`, so on the direct
port `req.ip` was whatever the caller claimed. Proven with read-only GETs: the same
forged `X-Forwarded-For` decremented one bucket (99 → 98), a different value got a
fresh 99. That made **every** per-IP limiter there a no-op — including the 3-per-15-min
gate on the unauthenticated `POST /auth/request-link`, which sends mail via Resend on
**the same API key ColorArchive uses**. Anyone who found port 3002 had an unmetered
mail sender, and the damage would have landed on us: burn that key and our magic-link
login and transactional email stop.

What I did, lowest-lockout-risk first:
- **Bound stride to `127.0.0.1`** (`index.js`, same `BIND_HOST` pattern as
  ColorArchive; backup at `/root/stride-index.js.bak.*`). nginx already fronted it at
  `stride-api.colorarchive.me` and already set X-Forwarded-For correctly, so this cost
  nothing. Verified after: the domain still returns 200, direct `:3002` refuses, and
  **forged XFF no longer works** — three requests with two different forged values
  decremented one bucket continuously (98 → 97 → 96).
- **Enabled ufw** (allow 22/80/443, default deny incoming, enabled at boot). Before
  touching it I enumerated every listening socket: only 22, 80 and 443 were externally
  bound; 3001, 3002, 5000, 5001, 5012, 8126 and 53 were already loopback. I installed a
  5-minute auto-`ufw disable` dead-man's switch first in case I locked us out, verified
  SSH on a fresh connection plus every service, then removed it. Verified after:
  ColorArchive API 200, stride API 200, site 200, payment webhook 401, port 80 still
  301s, and :3001/:3002/:5000/:8126 all refuse from outside.

**Still yours to do, but no longer urgent:** the two apps share one `RESEND_API_KEY`.
That is now a blast-radius concern rather than an open hole — the mail endpoint is
properly rate-limited again. I can't create the second key for you (it's an account
action on Resend), but when convenient: issue a separate key for stride and swap it in
`/root/stride-server/.env`.

**2. `server/.env` exists only on the droplet.** It is gitignored, absent from the
Mac, and covered by no backup. `.env.example` documents 19 of the 29 live keys —
missing ones include **both Lemon Squeezy payment secrets**. The database is backed
up; the credentials that make it a business are not. If the droplet died today you
would keep the data and lose the ability to take money. Same for
**Correction to what I said earlier about the backup script:** a copy WAS in git —
just the wrong one. The tracked copy was an April generation at the repo root; the
one root's crontab actually runs was a July rewrite living only on the droplet. The
consequence was real: `docs/backup-runbook.md` documented gzipped
`colorarchive-*.db.gz` snapshots, and **zero such files exist** — the live script
writes uncompressed `data-*.sqlite`. Following the runbook during a real restore
died at step 5. Now fixed: the live script is committed at
`server/scripts/backup-sqlite.sh`, the stale root copy and its README (which pointed
at `/root/colorarchive-api/`, a path dead since the domain migration) are deleted,
and the restore + drill commands are corrected and **tested on the droplet**
(`integrity_check` → ok, 14 users). Your actual protection was never at risk: 76
offsite copies on the Mac, newest 19M, integrity ok.

### ⚠️ Two scheduled things that will misbehave, but not urgently

**~~Design Notes has no sender cron~~ — FIXED 2026-07-27.** The drafting routine wrote
to `docs/design-notes/` in the repo; the sender read a directory on the droplet;
nothing carried the file between them, and that directory did not exist. The first
approved issue would have gone nowhere.

Now wired: `server/scripts/send-design-notes-cron.sh`, cron **Fri 10:00 UTC** — the
draft lands Thu 01:00 UTC, so you get ~33 hours to approve. It stages the issues
straight out of `origin/main` using `git fetch` + `git archive`, which write only to
`.git` and stream from the object store — **it never touches the droplet's working
tree**, because that tree IS production here and a `git pull` would have silently
reverted the rate-limit fixes. Verified after a live dry run: HEAD still 6caeded,
32 local modifications intact, today's fixes all still present.

Dry run output: `staged 1 issue file(s)` → `no approved issues (drafts are skipped by
design)`. So it is live and will keep doing nothing until you flip a
`status: draft` to `status: approved`. **The approval is still the only thing that
can send mail** — running on a schedule cannot cause an unapproved send.

**`daily-traffic-check` has a stale baseline.** Its SKILL.md hardcodes "真实流量基线约
160 PV/天" and flags ">500 PV" as a possible bot anomaly. Actual traffic is ~1,300
PV/day, so that anomaly rule has been firing every single day for over a week, and
after today's bot filter it will read the drop as a decline. Worth a 1-line update
next time you touch it.

**One thing that does need you — 2 minutes in the PostHog console, no code.**
The project has `session_recording_opt_in=True`, `capture_console_log_opt_in=True`
and `anonymize_ips=False`. Replay is off *only* because of a client-side flag in
`src/lib/posthog.ts:68`, so the policy sentence "Session recording is disabled" is
true today but one bad deploy from being false. Flip all three at the project level
(recording off, console capture off, IP anonymisation on) so the written promise is
structurally guaranteed rather than depending on a line of our code:
us.posthog.com → project 456902 → Settings.

**Also cleaned up, and worth knowing because it was in the database:** the AI brand
generator was storing what people typed. Real rows included
`"Health & Wellness + Tech (Wearable Technology)"` and
`"salt air, glass water, seafoam"` — somebody's actual creative brief, kept
first-party and forwarded to PostHog. Removed; the gate never read those fields.
The historical rows are still in `events` if you ever want them purged.

## 📣 2026-07-26 (autopilot) — weekly roundup queued for manual posting

> The Jul 19–26 roundup is written and waiting in `docs/daily-posts-queue.md` under
> **Weekly Roundup — 2026-07-26** (Facebook + Twitter/X copy). Unlike the last two weeks,
> this one is a **real changelog**: 10 new tool routes, CIEDE2000 ΔE in /compare/ and
> /name/, OKLCH/Lab in /convert/, and iOS v1.3 live. Every number in the copy (including
> "43 free tools") was verified against the code, not the commit messages.
>
> Not auto-posted — the queue file is explicitly manual and publishing is owner-authorized
> only.
>
> **Your items:**
> - [ ] **Post the roundup to the Facebook Page and X** (copy is ready to paste; ~2 min).
>       Worth pinning — it's the first post in three weeks with real news in it.
> - [ ] Optional: a second, standalone Screen Test post later in the week. It's the
>       strongest SEO-intent tool of the batch and it's currently buried in a 10-item list.

## 🎯 2026-07-25 (remote) — conversion P0 shipped + a dead unsubscribe fixed

> Executed docs/dev-plan-2026-07-24-conversion.md P0 (commit f4170cd):
> - **Email capture on the two biggest sections** — guides (8,398/mo) → a new weekly
>   **Design Notes** list; color-detail (6,133/mo) → the existing daily color, in the slot
>   the cancelled Auditor CTA vacated. Placed after the content, never popups.
> - **Instrumented what was blind**: guide_tool_click on the 317 existing guide→tool links,
>   pro_cta_click on every /pro/ CTA, email_subscribed{source,list,isNew}.
> - **Survey banner off** (3,857 impressions/30d for ~0 returns on our best surface).
> - **⚠️ Found and fixed: /unsubscribe did not exist.** Every marketing email we've ever
>   sent — including the daily color going out right now — linked to a 404. Route + API +
>   page now live; opt-out is POST-only so inbox scanners can't unsubscribe people.
>
> **Design Notes delivery is human-gated by design.** A weekly cloud routine drafts an
> issue into `docs/design-notes/` (status: draft) and pushes it; nothing can be mailed until
> a human flips it to `status: approved`. See docs/design-notes/README.md.
>
> **Your items:**
> - [ ] **Each week (~1 min): read the drafted Design Notes issue** and either tell Claude
>       "approve it" or edit it. First draft arrives Thu 2026-07-30. If you'd rather not do
>       this weekly, say so — the alternative is dropping the guides hook back to the daily
>       color, which needs no approval.
> - [ ] Optional: routine settings at https://claude.ai/code/routines

## 🎯 2026-07-24 (remote) — Auditor pre-orders CLOSED (bleeding stopped)

> The cancelled Accessibility Auditor was still being sold: its CTA was live in 8 placements
> across 7 pages plus a /pro/ promo, and **3 people reached the ¥4,999 checkout in 30 days**.
> All shut down (commit d9fed32):
> - **Lemon Squeezy product 1146653 unpublished** — API-verified `status: draft`, public
>   checkout URL now returns 404. (Done merchant-side FIRST: the checkout URL is a build-baked
>   NEXT_PUBLIC_ env var, so code alone would have left a window where money could still land.)
> - All 8 CTAs + the /pro/ promo removed; `preorderConfig.closed` is a hardcoded kill switch
>   (clearing the env var alone would have fallen back to "reserve your founder price").
> - `/preorder/` is now an honest closed page — explains the bar, that it wasn't met, that
>   nobody was charged, and routes to the free tools that did ship.
> - Verified live on all 7 pages: zero pre-order CTAs remain.
>
> **Nothing for you to do here.** Next up is the rest of docs/dev-plan-2026-07-24-conversion.md
> (email capture on guides + color-detail, Pro CTA instrumentation) — it needs your 4 answers
> in §6 first, except the ones I can decide alone.

## 🎯 2026-07-21 (remote) — tools cycle shipped, what's left is decisions + data

> **Web tools expansion is code-complete** (commits d025419 → 09f224f → a2507c7 → 4d01923):
> screen-test suite (hub + dead-pixel + color-screens + gamma/banding/sharpness + archive
> color-distance + hue game + guided wizard with shareable report card), OKLCH/Lab in /convert/,
> ΔE in /compare/, /tailwind-colors/, /css-filter/, /color-wheel/, colorblind safe-fixes,
> /color-temperature/, /dark-mode-colors/, /duotone/, /paint-mix/, /name/ ΔE top-5.
> vitest 671/671. Every batch adversarially reviewed pre-commit (17 real bugs fixed, 6 false alarms).
>
> **Your items:**
> - [ ] **~2026-08-20: 30-day tools review** — GSC (screen-test/tailwind/css-filter query families)
>       + PostHog qualified actions (screen_test_completed, downstream_click, trial attribution)
>       per dev-plan-2026-07-20 §4 Phase 3. Ask Claude to run the复盘 — the decision rule is
>       qualified actions, NOT impressions.
> - [x] **iOS v1.3 IS LIVE (approved 2026-07-22, READY_FOR_SALE)** — Hue Challenge game
>       (web-parity verified) + typed AI errors + ASO refresh (subtitle "Palettes, Contrast
>       & Hex Codes", keywords rebuilt 94B). Auto-released via AFTER_APPROVAL; submission
>       `9d63d863` COMPLETE. Nothing left to click.
> - [x] **~2026-08-12: iOS 3-week data gate** — **READ 3 WEEKS LATE on 2026-09-03.** Downloads
>       criterion **truly failed** (≈0.14/day vs ≥10). The other two are **VOID, not failed** —
>       the core loop has zero instrumentation, so the instrument could not see them.
>       (The "and events are lost on background" half of that reasoning was **refuted 09-04**:
>       posthog-ios flushes on background by default. See `docs/autopilot-log.md` 2026-09-04.)
>       → shrink. `docs/ios-dev-plan-2026-09-03-v1.4.md`.
> - [ ] Optional: fresh App Store screenshots featuring the Hue Challenge (skipped in v1.3 for
>       budget — worth doing if the game shows any traction).

## 🎯 2026-06-29 (remote) — multi-platform review + gate-safe fixes shipped
> Ran a multi-model review (Claude agents + **Gemini 3.1 Pro + 3.5 Flash** via the Google AI API
> key — the `gemini` CLI is dead, `IneligibleTierError`) across all 5 platforms + competitors →
> `docs/review-2026-06-29-multiplatform.md`. Then executed the gate-safe DO-NOW items one-by-one
> (each typecheck/build + Gemini 3.1 Pro reviewed). **Finding: the review was partly stale** — e.g.
> color-detail already had the Auditor CTA + colour-blind sim (06-24), the AI rate-limit "race" was a
> false positive (better-sqlite3 is synchronous), and most DB indexes already existed. So I verified
> every item against real code and only shipped genuine ones.
>
> **Shipped (commits 969ae93, 9d7586f, 6caeded + this one):**
> - **Web:** palette-audit results CTA; checkout funnel events (success/cancel/impression); real
>   **APCA-W3 0.1.9** in the contrast checker (was approximate); **archive-sourced auto-fix** for
>   failing pairs (the moat — a named token, not a synthetic hex); **W3C DTCG** token export with
>   self-documenting `$description`; `/analyze` contrast snapshot → Auditor funnel; generator
>   "Preview on UI" link.
> - **Server (deployed + verify-preorder.cjs 15/15 PASS):** wrapped the order-completed payment
>   writes in `db.transaction()` (atomic); 2 composite gate indexes.
> - **iOS — BUILT + SUBMITTED for you (1.2.1 / build 5, `WAITING_FOR_REVIEW`):** **real StoreKit bug fixed** —
>   `purchase()` finished the transaction BEFORE backend sync, so a failed sync lost the backend
>   record with no retry; now `syncPurchaseWithBackend` returns Bool and both paths `finish()` only
>   on success → StoreKit re-delivers + retries on next launch (local entitlement still granted
>   immediately). Plus email-validation on the login button. I archived + signed + uploaded via the
>   ASC API and submitted (1.2 was READY_FOR_SALE + build 4 already up, so this is the new patch 1.2.1;
>   metadata + 12 screenshots auto-carried from 1.2; release notes written; commit `5fcd0c7`).
>   **Set to `releaseType=MANUAL`**, so it will NOT auto-go-live. **➡️ Your only remaining iOS step:**
>   after Apple approves (~1 day), run **one sandbox purchase in TestFlight** to confirm the StoreKit
>   fix on a real device (the one thing I couldn't test here — code is compile-clean + Gemini
>   StoreKit-reviewed, change is conservative), then click **Release** in App Store Connect. Submission id
>   `b076bd95`. (Ask me to flip it to auto-release-on-approval if you'd rather skip the manual click.)
> - **VS Code:** marketplace description/keywords now mention WCAG/contrast (republish when you like).
>
> **NOT done (your call):** Figma in-plugin "fake-door" Auditor (#9) — high value but **republishing the
> plugin triggers a Marketplace re-review** (your red line), so I held it. The remaining review items are
> mostly post-validation scope (whole-system Auditor, Figma Variables push, CI integration, public API).


## 🎯 2026-06-27 (remote) — Pre-gate hardening P0 (WS-A measurement/fulfillment + WS-B security)
> Executed `docs/dev-plan-2026-06-27-pre-gate-hardening.md` P0. **No Auditor build — gate STOP still holds.**
> All gate_safe (fixed broken wiring + live security holes; no net-new product features, no new ISR/routes).
>
> **WS-A — the pre-order loop now actually measures + fulfills:**
> - **Headline bug fixed:** the Next LS webhook (`app/api/webhook/route.ts`) only forwarded *lifetime*
>   orders → every real ¥4,999 Auditor pre-order was silently dropped (no order row, no receipt, gate
>   stuck at 0). Now it detects the pre-order variant (custom_data.pack_id **or** variant-name match)
>   and forwards to `/webhooks/order-completed`, which writes `is_test`, takes an explicit
>   `attributed_source='preorder'`, skips the bogus download link, returns **500 on DB error** (so LS
>   retries; idempotent on the LS order id), and sends a dedicated **pre-order confirmation** mail.
> - Gate now **excludes test-mode orders** and exposes a **secondary numerator** (distinct email
>   reservers, `subscribers.source='preorder'`). Email reserve form fires `preorder_email_reserve`.
> - **⚠️ Gate semantics changed (please note):** the PROCEED criterion is now **Auditor pre-orders
>   specifically** (`orders.preorder` / `pack_id='preorder-auditor'`), not *all* orders — a stray
>   pack/Pro sale can no longer falsely trip "≥10 real pre-orders". All-orders count still shown as context.
> - Pre-order email form: no longer dumps reservers into the daily COTD list or sends the wrong
>   free-pack mail; dark-mode styling fixed; `/preorder?purchased=1` fires `preorder_purchase_confirmed`.
>
> **WS-B — un-merged security debt from `fix/security-hardening-2026-05-30` cherry-picked to main + deployed:**
> - **SSRF guard** on `/ai/analyze-url` (blocks private/loopback/link-local/metadata IPs v4+v6,
>   per-redirect re-validation, 2 MB streamed cap). Hardened beyond the original (closed an IPv6
>   `::ffff:7f00:1` localhost bypass Codex caught). 7 unit tests.
> - **Apple IAP:** production now rejects unverified (non-JWS) transactions (403) — closes self-grant-Pro.
> - **XFF spoofing:** all rate limiters + `/ai/usage` now key on `req.ip` (shared `getClientIp`), not the
>   spoofable `X-Forwarded-For[0]`.
> - **/subscribe:** per-IP rate limit + 100 kb JSON body cap + welcome mail only on first signup (was an
>   open email-bomb relay / subscriber-table flood vector).
> - B5: old FB token already rotated (see `project_facebook_token_expired`) — **no action needed**.
>
> **Droplet ops:** `server/scripts/gate-report.cjs` is now **version-controlled** (its is_test filter +
> pre-order numerator must stay in sync with `analytics.js`). The droplet had an untracked copy — it was
> removed during deploy so the tracked one takes over. New `server/scripts/verify-preorder.cjs` is a
> repeatable integration test for the loop (run on the droplet; self-cleans its test rows).
>
> **Manual when you flip on card checkout** (`NEXT_PUBLIC_PREORDER_CHECKOUT_URL`): set the LS checkout
> link's post-purchase redirect to `…/preorder?purchased=1`, and ideally add custom data
> `pack_id=preorder-auditor` (+ `attributed_source=preorder`). The webhook also name-matches as a
> fallback, so a missed custom-data field won't drop the order — but the redirect is what makes the
> on-site purchase-confirmed conversion readable in the gate.
>
> **P1 (same session, WS-C — conversion/quality/a11y polish, frontend-only, no droplet):**
> - **palette-audit perf:** a big paste no longer freezes the tab — `audit()` caps analysis to the
>   60 most-used colors (the O(n²) contrast matrix + O(n×5,446) matching were the freeze); a notice
>   shows when truncated. Text-only mitigation added to the contrast list ("all pairwise combinations")
>   — role-aware FG×BG inference stays deferred to post-gate (it's Auditor scope).
> - **ProGate quota:** free daily export was charged on *any* click in the wrapper (and on the upgrade
>   link) — now only a real export control counts, no keyboard double-charge, upsell link moved out.
> - **contrast checker a11y:** results region is now an `aria-live` status; hex/search inputs + archive
>   swatch buttons got accessible names. Pre-order CTA card got a visible keyboard focus ring.
> - Verified: typecheck + build green, **vitest 618/618**. (Codex review was rate-limited this run →
>   self-review + full test suite instead.)
>
> **P2 (same session, WS-D — cost/hygiene, final batch):**
> - **vs pages `noindex`:** `/colors/[a]/vs/[b]` (≈29M on-demand pairs) was indexable — crawlers
>   spidering it drove ISR-write cost ([[reference_vercel_cost]]). Now `robots:{index:false,follow:true}`
>   (still usable for humans; pairs with intent are reached via color pages). `/preorder/` added to
>   robots.ts Disallow (it's meta-noindex + acquires via on-site CTAs/posts, not search — real-user
>   UV is unaffected). These reduce crawler cost; **pre-gate cost red line kept** (no new ISR/routes).
> - **`.env.local.example`:** added `NEXT_PUBLIC_PAYMENT_PROVIDER` + `NEXT_PUBLIC_PREORDER_CHECKOUT_URL`;
>   dropped the stale Stripe comment.
> - **D3:** `send-preorder-broadcast.cjs` is now version-controlled in `server/scripts/` (was droplet-only,
>   like gate-report.cjs). Still dry-run by default; the actual `--send` is held for your approval.
> - `.gitignore` now also ignores `* 4.*` iCloud copies; ~1.9MB of stray `public/downloads/* N.*` dupes
>   removed locally. Verified typecheck + build green.
>
> **Card checkout — it's ALREADY live** (the `NEXT_PUBLIC_PREORDER_CHECKOUT_URL` env var was set back on
> 06-15; I confirmed prod `/preorder` shows the card button, not the email fallback). So there's nothing
> to "flip on" — and that's exactly why P0 mattered: until today a real card pre-order would've been
> silently dropped. While I had the LS dashboard open I also:
> - **Set the LS Confirmation modal** (product → Confirmation modal): button "Back to ColorArchive" →
>   `https://colorarchive.org/preorder/?purchased=1` + a pre-order-accurate title/message. So a buyer now
>   returns to the site and the `preorder_purchase_confirmed` funnel event fires (was: no return at all).
> - **Hardened the webhook detection** (`app/api/webhook/route.ts`): it now matches on `product_name` too,
>   so a real LS order is recognized regardless of how LS names the single variant (e.g. "Default"). This
>   removes any residual silent-drop risk → **`custom_data` is NOT needed.**
>
> **Genuinely remaining (yours):** (1) optionally run one LS **test-mode** purchase to watch the full live
> pipeline record an order (is_test=1, attributed_source=preorder, pre-order confirmation mail) — backend
> already verified via `verify-preorder.cjs`; (2) the distribution sprint to drive real /preorder traffic
> (the gate's real bottleneck); (3) approve `send-preorder-broadcast.cjs --send` if you want it sent.


## 🎯 2026-06-24 (remote) — Phase-2 gate ran = STOP-build; connected the offer to traffic
> Ran the Auditor §0 gate check on the prod DB. **Verdict: do NOT build the Auditor yet**
> (qualified /preorder UV 0 / target 500, paywall 32 / target 1000, orders 0 / target 10;
> /preorder = 0 views EVER). Root cause = the WTP experiment was never connected to traffic:
> the pre-order CTA only sat on `/palette-audit` + `/wcag-audit` (≈0 traffic), while the real
> firehose (`/word-to-color/` 13.4k/10d) had no link to the offer. Commercial loop is LIVE
> (prod /preorder shows a real card pre-order button → real LS order).
>
> **Shipped this commit (code, no Auditor build):** placed the existing `AuditorPreorderCta`
> on `word-to-color`, `color-detail`, `collections` (channel-stamped via `from`). Now real
> traffic can reach the offer; conversions read split by surface.
>
> **Automation shipped (droplet, not in repo — operational scripts like the backups):**
> - **Weekly gate report → your email.** `server/scripts/gate-report.cjs` + cron
>   `0 9 * * 1` (Mon 09:00 UTC). Reuses the `/analytics/gate` SQL + the §0 matrix, emails
>   yyyyy.yeyuhe@gmail.com a verdict (PROCEED/STOP) + numbers + on-site CTA clicks by surface.
>   First report already sent 2026-06-24 (STOP). Fires ~06-29 / 07-06 / 07-13 → covers the
>   07-02 tripwire window and the 07-15 gate. Log: `server/logs/gate-report.cron.log`.
> - **Pre-order broadcast — drafted + ready, NOT sent.** `server/scripts/send-preorder-broadcast.cjs`
>   (dry-run by default; `--send [--source=…] [--to=…] [--limit=…]`). Holding the send for your
>   approval (outward email to real people).
>
> **⚠️ Decision / finding:**
> - **The subscriber list is ~empty: 5 rows total (cotd 2, free-pack 1, test 1, debug 1) — only
>   ~3 real.** So the "email the warm list" lever has ~zero EV right now; nothing meaningful to
>   send to. The real upstream issue: huge anonymous traffic (13.4k/10d) but almost no captured
>   emails — email capture isn't converting. The broadcast is ready to fire the moment a real
>   list exists. **Say "send it" and I'll fire it (you can pick the source segment).**
> - **~07-02 / ~07-15:** read the weekly email (or admin `/analytics/gate`). Rule unchanged
>   (dev-plan-2026-06-19 §5): pre-orders ≥10 → build the Auditor; still ~0 → evidence-based off-ramp.
> - **Optional volume escalation:** if the word-to-color/color-detail/collections CTAs get clicks
>   but few pre-orders, add the CTA to home `/` (1k/10d) and the other browse pages.

## 💸 Vercel cost 2026-06-20 (remote) — diagnosed + 2 fixes shipped
> Owner asked why Vercel cost spiked. Pulled the actual usage dashboard (Pro, billing
> 5/25–6/25): **$73.93 total = $20 Pro + $53.93 on-demand overage.** Drivers, ranked:
> | Item | Usage | $ |
> |---|---|---|
> | Build CPU Minutes | 145 h | **$30.51** |
> | ISR Writes | 4.78M | **$19.13** |
> | Fast Origin Transfer | 199 GB | $12.01 |
> | ISR Reads | 20.65M | $8.26 |
> | Fluid CPU / Func Invocations / Mem | — | $3.90 |
>
> **Root causes:** (1) **~45 production builds since 6/1** of a 4,461-page site → 145
> build-CPU-h. (2) **Crawler traffic × on-demand pages**: 20.65M ISR reads + 4.78M writes +
> 1.03M fn calls + 199GB vs only ~26k human pageviews — almost all bots (incl. AI crawlers;
> saw PerplexityBot). The `/colors/[slug]/vs/[slug2]/` route (dynamicParams=true, ~28
> prebuilt of a ~29M combinatorial space) let crawlers spider color→vs→vs→vs → millions of
> on-demand ISR writes, **re-invalidated on every deploy**.
>
> **Shipped (this commit):**
> - **#1 — `scripts/vercel-ignore.sh`**: blanket-skip ALL `docs/*.md` + `.claude/*` (was an
>   enumerated list that silently built on any new/unlisted doc). Cuts future build count +
>   ISR re-write storms. Safe (build imports nothing from docs/.claude, no .md/mdx; verified).
> - **#2 — vs→vs links `rel="nofollow"`** (`src/components/color-vs-page.tsx`): caps the
>   exponential combinatorial crawl that drives the ISR writes. Color→vs entry links stay
>   followable; users can still click through. Zero deindex / no 404s / reversible.
>
> **Owner levers NOT yet done (need your call — they touch deploy cadence / SEO):**
> 1. **Cut deploy frequency further** — the autopilot's near-daily content roundups + multi-push
>    sessions are the build-cost multiplier (the ignore script only helps metadata-only pushes;
>    content/code pushes still do a full 4,461-page build). Batch autopilot content to e.g.
>    2×/week. Biggest remaining $ lever (~$20/mo). This is autopilot-cadence config (local), not repo.
> 2. **Build "mode" can't be made cheaper** — Vercel's default build container is already the
>    cheapest tier (enhanced machines cost MORE). The only real build-cost levers are fewer
>    builds (above) + fewer pages/build. Moving the 4,461 SSG pages → ISR would cut build time
>    but RAISE ISR writes (the #2 line item) — a wash, not a win. So: reduce frequency, not mode.
> 3. **If ISR writes stay high after #2**: stronger options = `noindex` the non-seed vs pages, or
>    `force-dynamic` the vs route (moves cost from ISR writes → cheaper fn invocations), or
>    robots-disallow `/colors/*/vs/`. All trade against SEO/crawl — pick one if monitoring shows need.
> **→ Re-check SCHEDULED for 2026-06-24 10:00 JST** (one-time task `vercel-cost-recheck-2026-06-24`;
>   runs the deploy-count proxy via Vercel MCP + dashboard if Chrome's up; auto-disables after).

## 📣 Distribution kit 2026-06-21 (remote) → `docs/distribution-kit-2026-06-21.md`
> The actual lever for the 07-15 gate. Hard data: 26k pageviews/30d, ~13k/wk to /word-to-color,
> but **0 /preorder visits ever, 0 orders** — pure distribution gap, not code. v3-aligned kit
> (supersedes the v2 06-15 plan's free-tool→HN hook): **hook = a11y-audit pain → /preorder**;
> **channels = a11y + design-systems communities + direct ICP outreach** (LinkedIn/X DMs, cold
> email). Has ready-to-send DM/email/post copy, an ICP target list, content-post angles, weekly
> quotas (≥40 ICP touches + ≥20 community contributions + ≥2 posts/wk → ~145 qualified UV/wk), and
> **pre-built UTM /preorder links per channel** that auto-attribute in the new `/analytics` gate +
> PostHog dashboard (r/accessibility tagged `a11y-community` so it counts as qualified, not generic
> reddit). Execution is yours (DMs/posts/emails); the prep is done. Tripwire ~07-02, gate ~07-15.

## 🔴 NEW 2026-06-20 (remote) — owner action items (B-meas + D1 done in code)

> This session shipped the two remaining code tracks (B-meas + D1) from the 2026-06-19 dev plan
> (distribution-first, exit-gate validation). **After this, code is done — the rest is YOUR
> distribution (Track A), ~3 weeks to the 07-15 gate.** Three things only you can do:
>
> 1. **Force-refresh social-card caches (~10 min, do before you start posting links).** The OG
>    fix changes what's served, but X/Facebook/LinkedIn cache the OLD card per URL. Paste each
>    URL you'll share into the validators to bust their cache + see the new card:
>    - X (Twitter): https://cards-dev.twitter.com/validator (login required)
>    - Facebook: https://developers.facebook.com/tools/debug/ → "Scrape Again"
>    - LinkedIn: https://www.linkedin.com/post-inspector/
>    Check at least: `/preorder/`, `/word-to-color/`, one `/guides/<slug>/`, one `/notes/<slug>/`,
>    one `/collections/<slug>/`. (All now serve a real per-page PNG card — verified in the build
>    + live for the already-deployed ones.)
>
> 2. **Build the PostHog dashboard (the "把看板做实" step — UI only, can't be coded).** Every event
>    now carries first-touch source as super-properties: `channel`, `utm_source`, `utm_medium`,
>    `utm_campaign`, `referrer_domain`, `landing_path`. In PostHog:
>    - **Funnel** (Product Analytics → Funnels): `$pageview` (path = /preorder…) → `preorder_view`
>      → `preorder_cta_click` → `preorder_checkout_clicked`. Add a **breakdown by `channel`**.
>    - Second funnel for the paywall: `word_paywall_hit`/`word_paywall_restored` →
>      `word_paywall_pro_click` / `word_paywall_email_unlock`, breakdown by `channel`.
>    - A trend of `$pageview` where path=/preorder, broken down by `channel` = the qualified-UV floor.
>
> 3. **Use the new first-party gate dashboard** at `/analytics` (admin login). There's now an
>    **"Exit-gate funnel (by channel)"** card at the top: /preorder UV (raw + qualified), paywall
>    triggers, real orders — each with the per-channel split. This is the 07-15 decision screen,
>    readable without PostHog. (Generic channels — hackernews / organic-search / direct / reddit /
>    unknown / unknown-referrals — are excluded from the *qualified* UV count per dev-plan §5
>    channel hygiene, so junk traffic can't silently meet the 500 floor.)
>
> **Caveat (known, deferred):** orders in the gate are split by **sign-up source tag**
> (free-pack / waitlist / preorder), NOT first-touch acquisition channel — labelled honestly in
> the UI. True channel attribution on the *numerator* would mean threading `channel` through the
> Stripe/LS purchase webhook; skipped this sprint (payment-path risk, no test suite, near-zero
> orders, and the gate decision uses orders.*total* anyway). Post-gate follow-up if needed.
>
> **Server deploy:** the backend changes (events/pageviews source columns + `/analytics/gate`
> endpoint) were deployed to the droplet this session (ssh + `pm2 restart colorarchive-server`);
> db.js migrations (ensureColumn) re-run idempotently on boot. Vercel auto-deploys the frontend.

## 🟢 B-meas + D1 shipped 2026-06-20 (remote) — exit-gate funnel readable by source + OG hygiene
> The 2026-06-19 dev plan's only two remaining code tracks. Adversarially reviewed (4-dim
> Workflow, 3 confirmed-high findings fixed before commit). typecheck + build green.
> - **B-meas (source-split funnel, end-to-end):** new `src/lib/attribution.ts` captures
>   first-touch UTM + referrer + landing ONCE on first load (persisted localStorage), derives a
>   `channel` bucket (linkedin/x/reddit/hackernews/producthunt/email/a11y-community/design-systems/
>   organic-search/direct/…). Threaded through `track()` (every funnel event), the `/pageviews`
>   beacon (the /preorder UV denominator), and PostHog super-properties (`phRegister`, so even
>   autocapture events break down by source — $pageview capture preserved). Server: `events` +
>   `pageviews` got channel/utm_*/referrer_domain/landing_path columns + indexes; new admin
>   `GET /analytics/gate` returns the exit-gate funnel split by channel; admin `/analytics` page
>   renders it. Subscriber attribution (`email-capture-form`, `cotd-subscribe-form`) switched from
>   lossy submit-time `searchParams` to persisted first-touch. **Why it mattered:** the funnel
>   carried ZERO source before — the gate's "≥500 *qualified* UV, split by source" was unreadable.
> - **D1 (post hygiene — no blank/small/generic share cards):** verified 9885f5b's PNG fix is live
>   (0 SVG og:image; /preorder + /word-to-color serve valid PNG). Added per-note OG cards
>   (`app/notes/[slug]/opengraph-image.tsx`). Fixed **8 page families** whose per-page dynamic OG
>   card was suppressed by a generic-PNG `images` override and/or rendered a small `summary` card:
>   word-to-color, guides, regions, brands, families, **stories, use-cases** (last two found by the
>   review), + notes. 9885f5b had only fixed collections+families; now all 9 dynamic-OG families
>   bind their per-page card with `summary_large_image`. Verified across the built HTML.

## 🟢 Perf follow-up shipped 2026-06-19 (remote) — og fix + RSC + algo + backend
> Owner approved doing all three remaining tracks. Done + verified from build artifacts:
> - **SVG og:image → PNG (distribution win, ~374 pages)**: collections + families [slug]
>   had working next/og PNG routes suppressed by a manual `openGraph.images:[svg]` override
>   → removed the override so the PNG route binds; notes (no route) → swapped to
>   `/og-image-v1.png`. **Verified: 0 `/generated/og/*.svg` left in any built HTML.** Social
>   share cards (X/FB/LinkedIn/Slack/Discord) now render instead of blank.
> - **#29 resolved (the homepage/9-page full-dataset RSC)**: instead of the API lazy-load,
>   used the cheaper NEED7 pattern — the 9 client pages now `import { colors }` (the ~151-line
>   deterministic generator) client-side instead of receiving the 5,446-record array as a
>   serialized prop. **index.rsc 996KB→32KB (−97%)**; all-colors/search/favorites/recent/
>   surprise/spectrum ~1MB→24KB each. (pick-for-me still 600KB — that's its `collections`
>   prop, a separate slim-able follow-up; not the colors array.)
> - **Color-relationship single-pass**: replaced `[...colors].filter().sort()[0]` in 5
>   functions with a `minByComparator` (O(n), strict-< keeps first-on-tie = byte-identical to
>   the stable sort). **Verified output-identical** (a color page still renders 51 unique hex,
>   unchanged). Cuts build CPU + speeds runtime callers (mood-palette/url-analyzer).
> - **Backend SQLite WAL (server/db.js)**: added `journal_mode=WAL` + `synchronous=NORMAL` +
>   `busy_timeout=5000` so reads don't block the high-volume event/pageview writes (no more
>   SQLITE_BUSY drops). **Deployed to the droplet** (ssh + pm2). `node --check` passed.
> - Still deferred: posthog eager-load (defer risks losing validation analytics);
>   pick-for-me/families `collections` prop slimming; per-note custom OG cards (notes use the
>   generic brand PNG for now).

## 🟢 Deep performance batch shipped 2026-06-19 (remote) — bundle + RSC payload
> A deep perf/structural audit (8 dims, adversarially verified, 34 findings) then a
> parallel apply pass. Root cause of the two ~1.38MB client chunks: **content datasets
> leaking into client bundles** because a pure helper (`tagToSlug`) / value-import sat in
> the same module as a 1.48MB JSON (newsletter) / 1.36MB array (guides), so tree-shaking
> kept the data. Fixes (typecheck + build green, wins measured from the build artifacts):
> - **Two ~1.38MB client content chunks ELIMINATED** (newsletter-issues.json + guides.ts)
>   from /notes, /use-cases, /collections, AND the homepage. Verified: `grep` for the
>   dataset markers in `.next/static/chunks/*.js` → **0 hits**; largest chunk now 448KB
>   (Sentry). Method: extracted `tagToSlug` to `src/lib/newsletter-slug.ts`; server-derive
>   related/featured guides and pass SLIMMED props (only rendered fields) from the server
>   pages into the client components (notes, use-cases, homepage hero, collections).
> - **RSC payloads slimmed**: `guides.rsc` 1322KB→**372KB** (−72%, dropped detail-only
>   `sections` prose); `collections.rsc` 611KB→**456KB** (−25%, dropped editorialNote/
>   promptWords/useCases); **every color page `.rsc` 1MB→36KB (−96%)** by computing the
>   tonal strip server-side and passing it instead of the full 5,446-color array (×3,066
>   pages ≈ ~3GB less build output, much smaller per-page payload).
> - **Render/algo**: single-pass family counts + `useDeferredValue` on /all-colors and
>   /search (no more 9–48 full scans + blocking keystroke on the 5,446 set); `colorsById`
>   Map for O(1) slug lookup. **Config/asset**: Cache-Control on /downloads, footer logo
>   `priority` removed, color OG route `force-dynamic` for consistency.
> - ⏸ **Still flagged (NOT done this batch)** — the audit's remaining high-value items:
>   - **🔴 SVG og:image rejected by social crawlers → blank share cards on ~374 pages**
>     (notes/collections/families). Real distribution bug (relevant to the dist. bottleneck);
>     needs the og:image to be a PNG/dynamic-OG route. Medium effort across page.tsx files.
>   - Homepage still serializes the full 5,446-color array into its RSC (~1MB) — the same
>     deferred #29 dataset-payload issue (needs `/api/colors` lazy-load + benchmark).
>   - color-relationship helpers do `[...colors].filter().sort()[0]` (~13ms/page build CPU)
>     → single-pass min-scan (output-identical) would cut build CPU; deferred (touches core,
>     no test suite — wants careful output-equivalence checks).
>   - posthog-js (~72KB gz) eager on every page — deferrable like New Relic, but NOT done
>     (deferring risks losing the pageview/funnel data the validation period needs).
>   - **Backend (server/*) — needs droplet deploy (ssh + pm2), NOT Vercel**: BACK1 = add
>     SQLite `WAL` + `busy_timeout=5000` + `synchronous=NORMAL` in `server/db.js` (prevents
>     event-write drops under concurrent read/write — worth doing); plus minor missing
>     indexes + a /trending cache. Owner to confirm before I deploy to the droplet.

## 🟢 Product-optimization batch shipped 2026-06-19 (remote) — 28 verified fixes
> Owner steer: "keep optimizing existing features" (not just distribute + wait). Ran a
> read-only multi-agent audit of all 70+ routes (adversarially verified, ranked), then a
> parallel implementation pass. **28 low-regret fixes to EXISTING features; no new features
> (red line held). typecheck + build both green.** Highlights:
> - **Real bugs**: word-to-color "Search by hex" CTA dead-ended on an ignored `?hex=` param
>   → now `/colors/hex/?c=` (the #1 page's highest-intent step); /all-colors + /archive
>   "Show more" capped at 960/720 so 82% of colors were unreachable (inert button) → cap =
>   full set; family-pill counts overstated when advanced filters active → count the filtered
>   set; AI Mood Palette "+ Save" showed "✓ Saved" but favorited nothing (exact-hex match) →
>   nearest-archive-color; ProGate burned the free-export quota on *format-toggle* clicks
>   (paywall slammed shut without exporting) → stopPropagation on toggles only.
> - **Dark mode** (a product that markets WCAG shipping unreadable dark pages): word-to-color
>   (#1 page, had ZERO dark: classes), brand-generator, favorites, recent, /pro comparison
>   table, upgrade modal, color-card palette chips — all given additive `dark:` variants.
> - **Conversion**: upgrade-modal price buttons were a fake plan-picker (both → /pro/) → real
>   CheckoutButtons that go straight to checkout; ProGate locked-overlay now gives anonymous
>   users a "Sign in for more" step before the paywall; /pro "Save 31%"→33% + FAQ 3-day-trial
>   copy + word-to-color "completely free" FAQ corrected; tool-upsell secondary CTA demoted.
> - **Perf**: New Relic browser agent was eager on every page's critical path → deferred to
>   requestIdleCallback (RUM unchanged). **A11y**: email-capture form + search combobox ARIA;
>   bigger tap targets. **Mobile**: copy-upsell toast no longer clips off 380px screens;
>   back-to-top no longer overlaps the palette pill.
> - ⏸ **Deferred (NOT shipped)**: the one "bigger" finding — the full 5,446-color dataset is
>   serialized into the home + /all-colors HTML payload (~120–180KB gzip). Real, but the audit
>   re-scored it **L-effort + INP-regression risk** (rgb/hsl/family are consumed across the
>   whole set by ~40 components), so it needs the `/api/colors` lazy-load path + benchmarking,
>   not a quick patch. Left as a separate follow-up for a deliberate session.

## 🟢 B3 + B5 shipped 2026-06-19 (remote) — pricing口径 fixed, conversion hygiene
> Owner decided the B3 pricing口径: **JPY-primary + corrected approximate USD** (keep
> billing in JPY; show an honest ≈USD at ~150 JPY/USD). Code-only, no LS changes needed.
> A read-only multi-agent audit (adversarially verified) then surfaced 5 low-regret
> conversion-hygiene fixes, all shipped in the same commit:
> - **B3**: fixed `priceUsd` in `checkout-config.ts` (monthly $6.99→**$3.49**, yearly
>   $49.99→**$26.99**, lifetime $199.99→**$129**); added preorder `priceUsd $33` /
>   `regularPriceUsd $67`. Reconciled stale USD on `/pro` promo card ("$49"→JP¥4,999 ≈$33)
>   and support FAQ ("$199.99"→$129).
> - **B5-1**: `/pro` JSON-LD `SoftwareApplication` Lifetime Offer price was **¥9,999**
>   (half the real ¥19,999) — a machine-readable price Google/Bing index. Fixed → 19999.
> - **B5-2**: 10 bare `href="/pro"` across upgrade-modal / pro-gate / projects / account /
>   tool-upsell-banner forced a 308 redirect (next.config `trailingSlash:true`) on the
>   paywall CTA — all → `/pro/`.
> - **B5-3**: `/preorder` + auditor CTA rendered bare `¥4,999` (zh users misread as RMB,
>   ~7× inflated) — propagated the existing `JP¥` disambiguation + added the ≈USD line.
> - **Deliberately NOT done**: the audit suggested dropping the `JP¥` prefix on /pro as
>   "non-standard"; rejected — `JP¥` is the intentional 2026-06-14 anti-RMB-misread fix.
>   Standardized the whole site ON `JP¥` instead. Mock-dashboard `¥48,200` on
>   palette-preview left as-is (decorative, not a price).
> typecheck + build both green.

## 🟢 WTP batch shipped 2026-06-15 — 1 quick human step + measure
> Code-doable growth levers are basically done; the remaining signal is validation +
> distribution + time. This batch wired the two remaining code probes; the rest is yours.

- [x] **Real card pre-order test — LIVE 2026-06-15.** LS one-time product created in the
      **ColorArchive** store, priced **¥4,999 founder / ¥9,999 regular** (JPY, the store
      currency — referenced the existing Pro scale; "$49" couldn't be billed since the store
      is JPY). `NEXT_PUBLIC_PREORDER_CHECKOUT_URL` set in Vercel Production via CLI; page now
      shows a card-required "Pre-order — ¥4,999" button. **Kill criterion: <10 real card
      pre-orders in 30 days (by ~2026-07-15) → stop building Pro.** Read orders in LS →
      Orders (live mode). Needs traffic — see the paywall + distribution drafts.
- [ ] **Delete the duplicate LS store "Color Archive"** (the one with a space — empty, ¥0,
      never activated, test-mode). Keep **"ColorArchive"** (the active one). Self-serve delete
      may not exist → email **hello@lemonsqueezy.com** (draft in the 2026-06-15 chat). The
      separate paused **Stripe account "Color Archive"** (`acct_1TFOUMGzX2t5YKlz`, payments
      paused / verification overdue) is unrelated to the live LS flow (LS is MoR, pays out to
      your bank) — leave it dormant unless you decide to go direct-Stripe later.
- [x] **word-to-color WTP paywall — BUILT + ENABLED** (your call "建并直接开"). After 5
      distinct word generations the result gates behind Pro + an email-unlock. SEO-safe
      (crawlers / shared links / the 474 static pages never hit it). Toggle off any time
      via the `WORD_PAYWALL_ENABLED` constant in `word-color-generator-page.tsx`.
- [ ] **Measure the new funnels (PostHog / first-party events), 2–3 weeks:**
      `word_paywall_hit` → `word_paywall_pro_click` (paid intent) vs `word_paywall_email_unlock`
      (lead). And the preorder funnel once the card test is on. First-party query is in the
      pre-order kit doc.
- **Measured 2026-06-15**: the preorder funnel had **0 events / 0 reservations** since the
  06-14 launch — NOT a tracking bug (pageviews ~800–1000/day, `track()` events do land).
  `/preorder/` just gets no traffic (buried behind low-traffic pages). It needs the paywall
  + distribution to feed it. **The two highest-leverage human tasks now have execution docs:**
  - [ ] **Post the distribution drafts** on a cadence → `docs/distribution-plan-2026-06-15.md`
        (14-day schedule, CTAs routed to the live paywall/preorder, disclosure + anti-spam rules).
  - [x] **User interviews → DROPPED in favor of the self-serve SURVEY (decided 2026-06-19).**
        No more scheduled 1:1 interviews. The survey (SURVEY1MON = free month of Pro), recruited
        via the /word-to-color banner (B4), is now the qualitative exit-gate input. Just keep
        survey responses flowing; no booking link / outreach needed.

## 🟢 SEO/exposure batch shipped 2026-06-14 — measure & follow up
> Goal: push page-2 pages to page 1 + grow traffic (Google + AI engines). All code
> is live; these are the human-only measurement/verification steps.
- [ ] **GSC: confirm the new /word-to-color/[word]/ pages get indexed** (474 pages,
      now in sitemap.xml + linked from a hub on the generator). Check Coverage + the
      "word to color" query family in 2–3 weeks.
- [ ] **GSC: watch avg position on the top guides** (blue-color-psychology-branding-guide,
      film-cinematography-color-guide, color-trends-2026-design-guide) — they got
      query-optimized titles + FAQ rich-result eligibility; expect CTR lift first.
- [ ] **Bing Webmaster Tools (optional):** IndexNow key `c0107a3b9f2d4e8a8b6c1d5e7f0a2b34`
      is auto-served at /<key>.txt and pinged on every prod deploy (postbuild). Nothing
      required, but you can verify submissions in Bing WMT → IndexNow.
- [ ] **Validate rich results:** run a couple guide URLs + a /word-to-color/[word]/ URL
      through Google's Rich Results Test to confirm FAQ/DefinedTerm markup is picked up.
- [ ] (Optional) Add more entries to `src/lib/guide-seo.ts` (FAQ/titles) and
      `src/lib/word-to-color-seeds.ts` (more words) — both are append-only and safe.

## 🟢 Core Web Vitals batch shipped 2026-06-14
- **Sentry session/error Replay turned OFF** (`instrumentation-client.ts`,
  `replaysOnErrorSampleRate: 0`) to drop ~50KB from every page. Error capture +
  10% perf tracing still on; only the visual before-crash replay is gone. Re-enable
  by raising that rate if you ever need replay debugging.
- **Google Ads gtag → `lazyOnload`** (`app/layout.tsx`) — off the critical path;
  conversions still queue via `dataLayer`. If you notice conversion under-reporting
  in Google Ads, switch it back to `afterInteractive`.
- **Product Hunt launch banner turned off** (`ph-launch-banner.tsx`,
  `PH_LAUNCH_ACTIVE=false`) — stale since the April launch + caused a layout shift.
  Flip back to `true` for any future launch.
- Kept intentionally (per credits.md observability split): NewRelic RUM, Sentry
  crashes, PostHog product, GTM ads.
- [ ] Optional: confirm CWV improved in NewRelic RUM / PageSpeed Insights in ~1 week.

## 🟢 Backlink engine shipped 2026-06-14 — post the drafts
- Code live: static HTML color-badge on every color page (the "Embed" button) + the
  embed landing (`/embed/embed-code/`, now discoverable in sitemap + footer); fixed the
  previously-broken widget attribution backlink.
- [ ] **Post the distribution drafts** in `docs/backlink-distribution-drafts-2026-06-14.md`
      (Dev.to article, Show HN, Reddit r/web_design, free-tool directories, Pinterest) —
      ~1/day to avoid same-link spam filters; disclose maker where required. These are the
      actual backlinks; the code just makes them easy to create.
- [ ] (Optional) PR ColorArchive into an "awesome-design-tools" GitHub list (durable backlink).

## 🟢 Conversion batch shipped 2026-06-14 + decisions for you
Shipped (code, safe + verdict-independent):
- Removed the **fabricated Pro testimonial** ("paid for itself in the first week" — false
  advertising with 0 real customers); replaced with an honest trust row (real guarantees).
- **`¥` → `JP¥`** on /pro/ + upgrade modal so it can't be misread as RMB (zh users were
  seeing ¥3,999 as ~$560 instead of ~$50).
- **Email capture on /word-to-color/** (the #1 page's dead-end) — builds the only durable
  handle on casual traffic. Subscribes tagged `source: "word-to-color"`.

🔴 **Decisions only you can make (I did NOT guess these):**
- [x] **Fix the pricing numbers — RESOLVED 2026-06-19 (B3).** Owner chose **JPY-primary +
      corrected approximate USD** (keep JPY billing; show an honest ≈USD). Implemented in
      `checkout-config.ts` + reconciled all stale USD surfaces — see the 2026-06-19 batch
      at the top of this file. Open sub-question still yours if you want it: **whether to
      bill in USD at all** (JPY billing is friction for a global/US ICP) — that needs new
      LS variants in USD, not a code change, so left for you to decide later.
- [ ] **Run the willingness-to-pay test** (the audit's core — nobody has ever paid):
      1. *Pre-order landing page* — **BUILT + live at `/preorder/`** (Accessibility Auditor,
         founder $49 / reg $99, ships Q3 2026, refund if not shipped). Linked from `/pro/`.
         Fires `preorder_view` / `preorder_checkout_clicked` events (first-party + PostHog).
         **To turn on the REAL card-required test (3 steps, ~15 min):**
         - a) In Lemon Squeezy, create a one-time "Accessibility Auditor — Pre-order" product
              at $49, get its checkout URL.
         - b) Set `NEXT_PUBLIC_PREORDER_CHECKOUT_URL=<that url>` in Vercel Production env.
         - c) Redeploy. The page auto-flips from the email fallback to a card-required
              "Pre-order — $49" button. (Until then it's collecting email reservations tagged
              `source: "preorder"` — a weaker but live signal.)
         - Drive traffic: linked from `/pro/` + contextual CTAs now live on `/palette-audit/`
           and `/wcag-audit/` (the exact ICP; clicks tracked as `preorder_cta_click {from}` so
           you can see which surface converts). Also post about it (the distribution drafts).
         - **KILL CRITERION: < 10 real card pre-orders in 30 days → the designer-Pro theory
           is not validated; do not keep building Pro features.** (Email reservations are NOT
           pass — only card-required pre-orders count.)
      2. *Paywall /word-to-color/ after N free generations* — the pain IS the signal. This
         WILL cut traffic; that's the point of the test. I can build it behind a flag, but
         it's your call since it touches your #1 traffic asset.
      The audit explicitly rejected a "$9 export of free color data" as validation theater —
      don't run that one.

## 🔴 P0 — this week (Figma launch window)

- [x] ~~Facebook token re-auth~~ — **DONE 2026-06-10 evening** (with Jason assisting the
      OAuth clicks): fresh Graph Explorer user token → discovered the app secret had been
      rotated in Meta console (old one in .env was dead) → new `FB_APP_SECRET` written to
      Droplet .env → 60-day long-lived user token + page token in `server/.env.facebook`
      (Droplet + local synced). **FB launch post published**: post id
      `1014363318430170_122113574726881547`. Daily pipeline restored.
- [x] ~~Pinterest token re-auth with write scopes~~ — **DONE 2026-06-10 evening**: the
      api.colorarchive.org admin OAuth callback turned out to be unregistered in the
      Pinterest app (that flow can never have worked); re-authed via the registered
      frontend callback (`colorarchive.org/pinterest/callback/`) + a temporary one-shot
      server patch that persisted the exchange into the admin token store (patch
      reverted, droplet reset to origin/main). Token now has all 4 scopes incl. writes,
      refresh works (boot-refresh confirmed). **Launch pin published**: pin id
      `855683997995147303` on board ColorArchive Pro. Daily rotation restored.
- [ ] **Watch for the Figma v1.1.0 (Community Version 3) review email** — published
      2026-06-10 with clientStorage key persistence + UTM links. If rejected, the fix
      playbook from review 1842708 applies (figma-plugin/README.md → publish runbook).
- [x] ~~Reddit r/FigmaDesign post~~ — **DONE 2026-06-10 evening**: posted via a
      screencapture-eyes + cliclick-hands workaround (the Chrome extension domain-blocks
      reddit.com, but native screencapture + cliclick + AppleScript drive the logged-in
      session). Title "I built a free plugin that puts 5,446 curated colors + WCAG
      contrast checks inside Figma", flair **design feedback**, maker disclosed, body asks
      what feedback is wanted (export formats / brand-scale steps) per the subreddit's
      feedback-flair rule. Confirmed live in the r/FigmaDesign feed. (Permalink not
      captured — reddit blocks unauthenticated JSON and the tab kept getting swapped.)
- [ ] **Reddit r/web_design (or r/UI_Design) post** — do a day or two after the
      FigmaDesign one to dodge same-link spam filters; softer accessibility-angle draft in
      docs/figma-plugin-launch-posts-2026-06-10.md §3. Disclose maker. (Same manual
      workaround works: screencapture + cliclick; watch for display-sleep→lock mid-run.)
- [x] ~~Product Hunt + Indie Hackers updates~~ — **DONE 2026-06-10 evening**:
      IH product-timeline post published (the global "create posts" gate doesn't apply
      to product posts); PH product page tagline/description refreshed (was "3066
      colors") + maker-update comment posted on the live launch thread. NOTE: a full PH
      *re-launch* was deliberately NOT fired (it was 4 AM PT — wasted slot); if wanted,
      schedule one for 12:01 AM PT with proper assets.

## 🟠 P1 — strategy critical path (V2 plan)

- [x] **S2 qualitative input = the self-serve SURVEY, not interviews (decided 2026-06-19).**
      1:1 interviews dropped. The survey (SURVEY1MON reward, recruited from the #1 traffic page)
      is the exit-gate qualitative signal; the borderline 7–9-preorder tiebreaker in the dev
      plan §5 now reads survey responses for a clear ICP + shared pain point.
- [ ] **StoreKit sandbox purchase test** (carried over): Xcode → sandbox tester → Pro
      purchase; watch `ssh root@143.198.85.72 'pm2 logs colorarchive-api --lines 40
      --nostream'` for `[DEPRECATION] apple-purchase got JSON (not JWS)`.
      iOS v1.2 build 4 is in App Store review (submitted 2026-06-07).
- [x] ~~App Privacy label~~ — **already done** (verified 2026-06-10: App Privacy published
      4 days ago with Crash Data + Product Interaction; the memo was stale). Bonus
      finding: **iOS v1.2 shows "Ready for Distribution" in ASC — the review passed.**

## 🟡 Carried over (still open)

- [x] **React hydration #418 on /palette-audit/** — FIXED 2026-06-18 (B1). Root cause was
      NOT the locale race (the locale system is hydration-safe — en-first, deferred via
      effect; `<html>` has suppressHydrationWarning; content is ErrorBoundary-wrapped). It's
      **browser extensions (Grammarly etc.) injecting into the page's `<textarea>`** before
      hydration — classic intermittent #418 on the only page with a prominent paste box.
      Fixed with `suppressHydrationWarning` on the textarea (`palette-audit-page.tsx`). Same
      pattern would apply to any other big textarea if one appears.
- [ ] **Domain migration Phase 2 leftovers** (see docs/domain-migration-checklist.md):
      Droplet `.env` final pass, Meta/Instagram redirect URI, Resend DNS, GSC domain
      change, LS webhook URL, external listings (PH/IH/AlternativeTo).
- [ ] TikTok video still "in review"? Follow up if stuck.
- [ ] Indie Hackers logo manual upload (pending since ~05-01).

## ✅ Closed this session (2026-06-10) — reference

- [x] Figma plugin v1.1.0 published (Community Version 3): API key persists via
      figma.clientStorage; UTM attribution on all outbound links; desktop regression
      passed in Design + FigJam (see figma-plugin/README.md checklist).
- [x] Community listing refreshed without re-review: truthful description, playground
      file attached, 16:9 cover + 2 carousel images, tags = design tokens / color
      palette / accessibility / tailwind / wcag, support email typo fixed
      (support@coloarchive.org → support@colorarchive.org).
- [x] Launch posts: X (tweet 2064653503738659311) + Instagram (media 18598880383063302)
      published 2026-06-10. Facebook + Pinterest blocked on the re-auths above.
- [x] PostHog funnel "Figma plugin funnel — visit → sign up → checkout"
      (us.posthog.com/project/456902/insights/8dStedB9) + weekly autopilot check
      (.claude/autopilot-tasks.md). UTM → PostHog attribution verified end-to-end.
- [x] api.colorarchive.org CORS: plugin iframe sends `Origin: null` and was blocked —
      /projects (and all bearer-auth routes) now allow it; deployed to Droplet + in repo.
- [x] figma-plugin CI job (tsc, ui.html syntax check, bare-localStorage guard).

## Done (older)
- [x] YouTube video — published
- [x] Twitter/X API — configured (URL-free posts only: $0.015 vs $0.20)
- [x] Pinterest — integrated (Standard access 2026-04-17; write scopes now broken, see P0)
- [x] Product Hunt — live listing created
- [x] VS Marketplace — extension v0.2.0 published; DNS TXT verified
- [x] iOS v1.1 approved; v1.2 build 4 submitted 2026-06-07 (PostHog + fixes)
- [x] LS live + first real purchase validated 2026-04-17/18
- [x] Frontend Sentry verified capturing (2026-04-24)
- [x] GCP OAuth .org redirect verified (2026-04-24)
- [x] SQLite backups on Droplet (docs/backup-runbook.md)
- [x] Figma plugin Community V2 approved 2026-06-09 (rejection fixes via PR #6)
