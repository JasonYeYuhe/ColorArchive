export type Locale = "en" | "zh";

const translations: Record<string, Record<string, string>> = {
  // Navigation group labels
  "nav.explore": { en: "Explore", zh: "探索" },
  "nav.tools": { en: "Tools", zh: "工具" },
  "nav.shop": { en: "Shop", zh: "商店" },
  "nav.project": { en: "Project", zh: "项目" },
  "nav.account": { en: "Account", zh: "账户" },

  // Navigation items
  "nav.archive": { en: "Archive", zh: "色彩库" },
  "nav.allColors": { en: "All Colors", zh: "所有颜色" },
  "nav.search": { en: "Search", zh: "搜索" },
  "nav.families": { en: "Families", zh: "色系" },
  "nav.collections": { en: "Collections", zh: "合集" },
  "nav.notes": { en: "Notes", zh: "笔记" },
  "nav.guides": { en: "Guides", zh: "指南" },
  "nav.spectrum": { en: "Spectrum", zh: "色谱" },
  "nav.wordToColor": { en: "Word \u2192 Color", zh: "文字 → 颜色" },
  "nav.contrast": { en: "Contrast", zh: "对比度" },
  "nav.convert": { en: "Convert", zh: "转换" },
  "nav.paletteGenerator": { en: "Palette Generator", zh: "调色板生成器" },
  "nav.gradient": { en: "Gradient", zh: "渐变" },
  "nav.harmonies": { en: "Harmonies", zh: "色彩和谐" },
  "nav.compare": { en: "Compare", zh: "比较" },
  "nav.colorblind": { en: "Colorblind", zh: "色盲模拟" },
  "nav.brand": { en: "Brand System", zh: "品牌色系" },
  "nav.wcagAudit": { en: "WCAG Audit", zh: "批量检测" },
  "nav.surprise": { en: "Surprise", zh: "随机发现" },
  "nav.favorites": { en: "Favorites", zh: "收藏" },
  "nav.packs": { en: "Packs", zh: "色彩包" },
  "nav.freePack": { en: "Free Pack", zh: "免费包" },
  "nav.recent": { en: "Recent", zh: "最近浏览" },
  "nav.analytics": { en: "Analytics", zh: "数据分析" },
  "nav.updates": { en: "Updates", zh: "更新动态" },
  "nav.about": { en: "About", zh: "关于" },
  "nav.support": { en: "Support", zh: "支持" },
  "nav.tools.all": { en: "All Tools", zh: "全部工具" },

  // Header actions
  "header.login": { en: "Log in", zh: "登录" },
  "header.account": { en: "Account", zh: "账户" },
  "header.menu": { en: "Menu", zh: "菜单" },
  "header.close": { en: "Close", zh: "关闭" },
  "header.logout": { en: "Log out", zh: "退出登录" },

  // Hero section
  "hero.badge": { en: "Curated color archive", zh: "精选色彩档案" },
  "hero.description": {
    en: "A calm, searchable library of color. Browse a large curated spectrum, sort it with precision, and copy production-ready hex values in one click.",
    zh: "一个宁静、可搜索的色彩库。浏览大量精选色谱，精确排序，一键复制可直接使用的 HEX 值。",
  },
  "hero.getStartedFree": { en: "Get started free", zh: "免费开始" },
  "hero.browseArchive": { en: "Browse archive", zh: "浏览色彩库" },
  "hero.browsePacks": { en: "Browse packs", zh: "浏览色彩包" },
  "hero.readGuides": { en: "Read guides", zh: "阅读指南" },
  "hero.colorOfTheDay": { en: "Color of the day", zh: "今日色彩" },
  "hero.convertColors": { en: "Convert colors", zh: "颜色转换" },
  "hero.findYourPack": { en: "Find your pack", zh: "找到适合你的色彩包" },
  "hero.showingFullArchive": { en: "Showing full archive", zh: "显示完整色彩库" },
  "hero.allFamilies": { en: "All families", zh: "所有色系" },
  "hero.family": { en: "family", zh: "色系" },
  "hero.archive": { en: "Archive", zh: "色彩库" },
  "hero.showing": { en: "Showing", zh: "显示" },
  "hero.colors": { en: "colors", zh: "种颜色" },
  "hero.defaultSort": { en: "Default sort", zh: "默认排序" },
  "hero.collections": { en: "collections", zh: "个合集" },
  "hero.products": { en: "products", zh: "个产品" },
  "hero.static": { en: "static", zh: "静态" },
  "hero.new": { en: "New", zh: "全新" },
  "hero.contrastChecker": { en: "Contrast Checker", zh: "对比度检查器" },
  "hero.contrastDesc": {
    en: "Test any two colors against WCAG AA and AAA standards. Get instant readability scores and find accessible pairings.",
    zh: "按照 WCAG AA 和 AAA 标准测试任意两种颜色。即时获取可读性评分，找到无障碍配色方案。",
  },
  "hero.tryContrastChecker": { en: "Try contrast checker", zh: "试用对比度检查器" },
  "hero.shareablePalettes": { en: "Shareable Palettes", zh: "可分享调色板" },
  "hero.paletteDesc": {
    en: "Build custom palettes and share them via URL. Collaborate on color choices with a direct link — no account needed.",
    zh: "创建自定义调色板并通过链接分享。无需账户，直接通过链接协作选色。",
  },
  "hero.createPalette": { en: "Create a palette", zh: "创建调色板" },
  "hero.colorblindSimulator": { en: "Color Blindness Simulator", zh: "色盲模拟器" },
  "hero.colorblindDesc": {
    en: "Preview how your palette looks under deuteranopia, protanopia, tritanopia, and achromatopsia. Paste up to 8 hex codes for a full simulation table.",
    zh: "预览你的调色板在绿色盲、红色盲、蓝色盲和全色盲下的效果。输入最多 8 个 HEX 值查看完整模拟表。",
  },
  "hero.tryColorblind": { en: "Try the simulator", zh: "试用模拟器" },
  "hero.guides": { en: "Guides", zh: "指南" },
  "hero.guidesHeading": {
    en: "High-intent color guides tied to real archive routes",
    zh: "与实际色彩库路径关联的实用色彩指南",
  },
  "hero.guidesDesc": {
    en: "Start from the question you actually have: brand palette, dark mode, free downloads, Figma tokens, Tailwind tokens, or website color direction.",
    zh: "从你的实际需求出发：品牌调色板、深色模式、免费下载、Figma 令牌、Tailwind 令牌或网站配色方案。",
  },
  "hero.browseAllGuides": { en: "Browse all guides", zh: "浏览所有指南" },
  "hero.toolsSection": { en: "Color tools", zh: "色彩工具" },
  "hero.toolsHeading": { en: "Free tools for working with color", zh: "免费色彩工具" },
  "hero.toolsDesc": {
    en: "Contrast checkers, converters, harmony generators, gradient builders — all free, no account needed.",
    zh: "对比度检查器、转换器、和谐色生成器、渐变构建器——全部免费，无需账户。",
  },
  "hero.browseAllTools": { en: "Browse all tools", zh: "浏览所有工具" },
  "hero.readNotes": { en: "Read notes", zh: "阅读笔记" },
  "hero.latestNotes": { en: "Latest notes", zh: "最新笔记" },
  "hero.latestNotesHeading": { en: "Fresh ideas from the archive", zh: "来自色彩库的新鲜灵感" },
  "hero.palettePacks": { en: "Palette Packs", zh: "调色板套装" },
  "hero.readyToUse": { en: "Ready-to-use color systems", zh: "即用型色彩系统" },
  "hero.packsDesc": {
    en: "Curated palette bundles with CSS tokens, Tailwind snippets, and usage guides. Start with a free sample or browse all packs.",
    zh: "精选调色板套装，含 CSS 令牌、Tailwind 代码片段和使用指南。从免费样品开始，或浏览所有套装。",
  },
  "hero.browseAllPacks": { en: "Browse all packs", zh: "浏览所有套装" },
  "hero.tokenPipeline": { en: "Token pipeline", zh: "令牌工作流" },
  "hero.tokenHeading": {
    en: "Not a color picker — a design token library",
    zh: "不只是取色器——而是设计令牌库",
  },
  "hero.tokenDesc": {
    en: "Every color exports as production-ready code. Drop tokens straight into your CSS, Tailwind config, Figma, or Style Dictionary workflow — no reformatting.",
    zh: "每种颜色都可导出为生产级代码。直接放入 CSS、Tailwind 配置、Figma 或 Style Dictionary 工作流——无需重新格式化。",
  },

  // Filter toolbar
  "filter.searchPlaceholder": { en: "Search by color name or hex value", zh: "按颜色名称或 HEX 值搜索" },
  "filter.clear": { en: "Clear", zh: "清除" },
  "filter.sort": { en: "Sort", zh: "排序" },
  "filter.sortHue": { en: "Hue", zh: "色相" },
  "filter.sortLightness": { en: "Lightness", zh: "明度" },
  "filter.sortName": { en: "Name", zh: "名称" },
  "filter.reset": { en: "Reset", zh: "重置" },
  "filter.shareView": { en: "Share view", zh: "分享视图" },
  "filter.allFamilies": { en: "All families", zh: "所有色系" },
  "filter.showingAll": { en: "Showing all", zh: "显示全部" },
  "filter.showingOf": { en: "of", zh: "/" },
  "filter.archiveControls": { en: "Archive controls", zh: "色彩库控制" },
  "filter.searchSortNarrow": { en: "Search, sort, and narrow by family", zh: "搜索、排序并按色系筛选" },

  // Color card
  "color.select": { en: "Select", zh: "选择" },
  "color.copy": { en: "Copy", zh: "复制" },
  "color.copied": { en: "Copied", zh: "已复制" },
  "color.openDetail": { en: "Open detail", zh: "查看详情" },
  "color.addToPalette": { en: "Add to palette", zh: "添加到调色板" },
  "color.inPalette": { en: "In palette", zh: "已在调色板中" },
  "color.paletteFull": { en: "Palette full", zh: "调色板已满" },
  "color.alreadyInPalette": { en: "Already in palette", zh: "已在调色板中" },

  // Footer
  "footer.description": {
    en: "A curated color library with 2016 algorithmically generated colors. Browse, search, save favorites, and export palette tokens — no account required.",
    zh: "一个包含 2016 种算法生成颜色的精选色彩库。浏览、搜索、收藏和导出调色板令牌——无需账户。",
  },
  "footer.readyForExport": { en: "Ready for static export", zh: "可静态导出" },

  // Login page
  "login.accountSync": { en: "Account sync", zh: "账户同步" },
  "login.signingYouIn": { en: "Signing you in", zh: "正在登录" },
  "login.loginComplete": { en: "Login complete", zh: "登录完成" },
  "login.verifyingLink": {
    en: "We are verifying your email link and loading your saved colors.",
    zh: "正在验证您的邮件链接并加载已保存的颜色。",
  },
  "login.syncComplete": {
    en: "Your favorites, palette, and account history are synced. Redirecting now.",
    zh: "您的收藏、调色板和账户历史已同步。正在跳转。",
  },
  "login.finishingGoogle": { en: "Finishing Google sign-in", zh: "正在完成 Google 登录" },
  "login.googleComplete": { en: "Google sign-in complete", zh: "Google 登录完成" },
  "login.connectingGoogle": {
    en: "We are connecting this Google account and loading your saved colors.",
    zh: "正在连接此 Google 账户并加载已保存的颜色。",
  },
  "login.heading": {
    en: "Sync favorites, downloads, and purchase history",
    zh: "同步收藏、下载和购买记录",
  },
  "login.noPassword": { en: "No password to remember", zh: "无需记忆密码" },
  "login.favSync": { en: "Favorites and palette sync automatically", zh: "收藏和调色板自动同步" },
  "login.downloadsSync": { en: "Downloads and receipts stay with your account", zh: "下载和收据与账户绑定" },
  "login.signedIn": { en: "Signed in", zh: "已登录" },
  "login.openFavorites": { en: "Open favorites", zh: "打开收藏" },
  "login.openPalette": { en: "Open palette", zh: "打开调色板" },
  "login.browsePacks": { en: "Browse packs", zh: "浏览套装" },
  "login.openAnalytics": { en: "Open analytics", zh: "打开分析" },
  "login.adminOrders": { en: "Admin orders", zh: "管理员订单" },
  "login.logOut": { en: "Log out", zh: "退出登录" },
  "login.lastSync": { en: "Last sync", zh: "上次同步" },
  "login.emailSent": { en: "Email sent", zh: "邮件已发送" },
  "login.checkInbox": { en: "Check your inbox", zh: "请查收邮箱" },
  "login.sendAnother": { en: "Send another link", zh: "重新发送链接" },
  "login.signIn": { en: "Sign in", zh: "登录" },
  "login.requestLink": { en: "Request a sign-in link", zh: "请求登录链接" },
  "login.sendingLink": { en: "Sending link\u2026", zh: "正在发送链接\u2026" },
  "login.emailMeLink": { en: "Email me a login link", zh: "发送登录链接到邮箱" },
  "login.or": { en: "or", zh: "或" },
  "login.redirectingGoogle": { en: "Redirecting to Google\u2026", zh: "正在跳转到 Google\u2026" },
  "login.continueGoogle": { en: "Continue with Google", zh: "使用 Google 继续" },
  "login.tryGoogleAgain": { en: "Try Google sign-in again", zh: "重试 Google 登录" },
  "login.ordersDownloads": { en: "Orders & downloads", zh: "订单与下载" },
  "login.yourPackHistory": { en: "Your pack history", zh: "套装购买记录" },
  "login.orders": { en: "orders", zh: "个订单" },
  "login.loadingOrders": { en: "Loading your orders\u2026", zh: "正在加载订单\u2026" },
  "login.downloadZip": { en: "Download ZIP", zh: "下载 ZIP" },
  "login.sending": { en: "Sending\u2026", zh: "发送中\u2026" },
  "login.sent": { en: "Sent", zh: "已发送" },
  "login.resendEmail": { en: "Resend email", zh: "重新发送邮件" },
  "login.packPage": { en: "Pack page", zh: "套装页面" },
  "login.receipt": { en: "Receipt", zh: "收据" },
  "login.whatSyncs": { en: "What syncs", zh: "同步内容" },
  "login.favorites": { en: "Favorites", zh: "收藏" },
  "login.paletteBuilder": { en: "Palette builder", zh: "调色板构建器" },
  "login.packs": { en: "Packs", zh: "套装" },
  "login.analytics": { en: "Analytics", zh: "分析" },
  "login.licenseSupport": { en: "License & support", zh: "许可与支持" },
  "login.purchaseSupport": { en: "Purchase support", zh: "购买支持" },
  "login.supportPage": { en: "Support page", zh: "支持页面" },
  "login.adminQueue": { en: "Admin queue", zh: "管理员队列" },
  "login.recentOrderActions": { en: "Recent order actions", zh: "最近订单操作" },
  "login.openFullQueue": { en: "Open full queue", zh: "打开完整队列" },
  "login.loadingAdmin": { en: "Loading admin queue\u2026", zh: "正在加载管理员队列\u2026" },
  "login.emailBuyer": { en: "Email buyer", zh: "联系买家" },

  // Favorites page
  "favorites.badge": { en: "Personal archive", zh: "个人档案" },
  "favorites.heading": { en: "Your saved colors", zh: "已保存的颜色" },
  "favorites.saved": { en: "Saved", zh: "已保存" },
  "favorites.colors": { en: "colors", zh: "种颜色" },
  "favorites.copyPalette": { en: "Copy palette", zh: "复制调色板" },
  "favorites.paletteCopied": { en: "palette copied", zh: "调色板已复制" },
  "favorites.copyCssVars": { en: "Copy CSS vars", zh: "复制 CSS 变量" },
  "favorites.cssVarsCopied": { en: "CSS vars copied", zh: "CSS 变量已复制" },
  "favorites.copyJson": { en: "Copy JSON", zh: "复制 JSON" },
  "favorites.jsonCopied": { en: "JSON copied", zh: "JSON 已复制" },
  "favorites.browseCollections": { en: "Browse collections", zh: "浏览合集" },
  "favorites.findMoreColors": { en: "Find more colors", zh: "发现更多颜色" },
  "favorites.noSavedYet": { en: "No saved colors yet", zh: "还没有保存的颜色" },
  "favorites.recommendedTitle": { en: "Based on your saved shelf", zh: "基于您的收藏推荐" },
  "favorites.exportPreview": { en: "Export preview", zh: "导出预览" },
  "favorites.jsonExportNote": {
    en: "JSON export is also available from the action row above.",
    zh: "也可以从上方操作栏进行 JSON 导出。",
  },

  // Recent colors page
  "recent.badge": { en: "Recent trail", zh: "浏览足迹" },
  "recent.heading": { en: "Your recently viewed colors", zh: "最近浏览的颜色" },
  "recent.recentLabel": { en: "Recent", zh: "最近" },
  "recent.colors": { en: "colors", zh: "种颜色" },
  "recent.copyPalette": { en: "Copy palette", zh: "复制调色板" },
  "recent.paletteCopied": { en: "palette copied", zh: "调色板已复制" },
  "recent.copyJson": { en: "Copy JSON", zh: "复制 JSON" },
  "recent.jsonCopied": { en: "JSON copied", zh: "JSON 已复制" },
  "recent.clearRecent": { en: "Clear recent", zh: "清除浏览记录" },
  "recent.favorites": { en: "Favorites", zh: "收藏" },
  "recent.searchArchive": { en: "Search archive", zh: "搜索色彩库" },
  "recent.noRecentYet": { en: "No recent colors yet", zh: "还没有浏览记录" },
  "recent.recommendedTitle": { en: "Keep exploring from your recent trail", zh: "从浏览记录继续探索" },
  "recent.exportPreview": { en: "Recent export preview", zh: "最近颜色导出预览" },
  "recent.jsonExportNote": {
    en: "JSON export is also available from the action row above.",
    zh: "也可以从上方操作栏进行 JSON 导出。",
  },

  // Palette page
  "palette.heading": { en: "Palette", zh: "调色板" },
  "palette.loadingPalette": { en: "Loading palette...", zh: "正在加载调色板..." },
  "palette.noColors": { en: "No colors in this palette", zh: "此调色板中没有颜色" },
  "palette.browseColors": { en: "Browse colors", zh: "浏览颜色" },
  "palette.searchArchive": { en: "Search archive", zh: "搜索色彩库" },
  "palette.sharedPalette": { en: "Shared palette", zh: "共享调色板" },
  "palette.yourPalette": { en: "Your palette", zh: "你的调色板" },
  "palette.color": { en: "color", zh: "种颜色" },
  "palette.colors": { en: "colors", zh: "种颜色" },
  "palette.copyCss": { en: "Copy CSS", zh: "复制 CSS" },
  "palette.cssCopied": { en: "CSS copied", zh: "CSS 已复制" },
  "palette.copyJson": { en: "Copy JSON", zh: "复制 JSON" },
  "palette.jsonCopied": { en: "JSON copied", zh: "JSON 已复制" },
  "palette.shareLink": { en: "Share link", zh: "分享链接" },
  "palette.linkCopied": { en: "Link copied!", zh: "链接已复制！" },
  "palette.addAllToBuilder": { en: "+ Add all to builder", zh: "+ 全部添加到构建器" },
  "palette.importPalette": { en: "Import palette", zh: "导入调色板" },
  "palette.replaceBuilder": { en: "Replace builder", zh: "替换构建器" },
  "palette.appendToBuilder": { en: "Append to builder", zh: "追加到构建器" },
  "palette.cssVariables": { en: "CSS variables", zh: "CSS 变量" },
  "palette.jsonExport": { en: "JSON export", zh: "JSON 导出" },
  "palette.tokenWorkflows": { en: "Token workflow exports", zh: "令牌工作流导出" },
  "palette.figmaTokens": { en: "Figma tokens", zh: "Figma 令牌" },
  "palette.styleDictionary": { en: "Style Dictionary", zh: "Style Dictionary" },
  "palette.gplPalette": { en: "GPL palette", zh: "GPL 调色板" },
  "palette.sketchPalette": { en: "Sketch palette", zh: "Sketch 调色板" },
  "palette.aseSwatches": { en: "ASE swatches", zh: "ASE 色板" },
  "palette.inBuilder": { en: "\u2713 In builder", zh: "\u2713 已在构建器中" },
  "palette.addToBuilder": { en: "+ Add to builder", zh: "+ 添加到构建器" },

  // Palette builder tray
  "tray.palette": { en: "Palette", zh: "调色板" },
  "tray.collapse": { en: "Collapse", zh: "收起" },
  "tray.clickToRemove": {
    en: "Click a swatch to remove. Tap \"+\" on any color card to add.",
    zh: "点击色块可移除，在任意颜色卡片上点击「+」可添加。",
  },
  "tray.copyCss": { en: "Copy CSS", zh: "复制 CSS" },
  "tray.copyJson": { en: "Copy JSON", zh: "复制 JSON" },
  "tray.share": { en: "Share", zh: "分享" },
  "tray.linkCopied": { en: "Link copied!", zh: "链接已复制！" },
  "tray.viewPalette": { en: "View palette", zh: "查看调色板" },
  "tray.clearAll": { en: "Clear all", zh: "清除全部" },
  "tray.copied": { en: "Copied!", zh: "已复制！" },
  "tray.openPaletteBuilder": { en: "Open palette builder", zh: "打开调色板构建器" },
  "tray.turnIntoTokenPack": { en: "Turn this palette into a token pack", zh: "将此调色板转换为令牌包" },

  // Selected color panel
  "panel.selectedColor": { en: "Selected color", zh: "选中的颜色" },
  "panel.nearbyPicks": { en: "Nearby picks", zh: "相近色" },
  "panel.moreFrom": { en: "More from", zh: "更多相关" },
  "panel.related": { en: "related", zh: "个相关" },
  "panel.openDetail": { en: "Open detail", zh: "查看详情" },
  "panel.recentTrail": { en: "Recent trail", zh: "浏览足迹" },
  "panel.balance": { en: "Balance", zh: "平衡" },
  "panel.copy": { en: "Copy", zh: "复制" },
  "panel.copied": { en: "copied", zh: "已复制" },

  // Archive empty state
  "empty.recovery": { en: "Recovery", zh: "恢复" },
  "empty.noResults": { en: "No colors found", zh: "未找到颜色" },
  "empty.description": {
    en: "The current filters are too narrow. Clear one of them and widen the archive again.",
    zh: "当前筛选条件过于严格。请清除其中一个条件以扩大搜索范围。",
  },
  "empty.queryLabel": { en: "Query:", zh: "查询：" },
  "empty.familyLabel": { en: "Family:", zh: "色系：" },
  "empty.clearSearch": { en: "Clear search", zh: "清除搜索" },
  "empty.showAllFamilies": { en: "Show all families", zh: "显示所有色系" },
  "empty.resetEverything": { en: "Reset everything", zh: "重置全部" },
  "empty.openAllColors": { en: "Open all colors", zh: "打开所有颜色" },
  "empty.openRecent": { en: "Open recent", zh: "打开最近浏览" },
  "empty.trySuggestions": { en: "Try these instead", zh: "试试这些" },

  // Email capture form
  "capture.placeholder": { en: "you@example.com", zh: "you@example.com" },
  "capture.sendLink": { en: "Send download link", zh: "发送下载链接" },
  "capture.sending": { en: "Sending\u2026", zh: "发送中\u2026" },
  "capture.successMessage": {
    en: "Check your inbox \u2014 download link sent.",
    zh: "请查收邮箱——下载链接已发送。",
  },
  "capture.browsePacks": { en: "Browse paid packs", zh: "浏览付费套装" },

  // Pagination (shared across archive/search/all-colors)
  "pagination.showing": { en: "Showing", zh: "显示" },
  "pagination.of": { en: "of", zh: "/" },
  "pagination.showMore": { en: "Show more", zh: "加载更多" },

  // All colors page
  "allColors.badge": { en: "Full archive view", zh: "完整色彩库视图" },
  "allColors.title": { en: "All archive colors", zh: "全部档案颜色" },
  "allColors.description": {
    en: "A dense view of the full curated archive. This page is optimized for broad scanning, comparison, and jumping into individual color detail pages.",
    zh: "完整精选色彩库的高密度视图。此页面针对大范围浏览、比较以及跳转至各颜色详情页进行了优化。",
  },
  "allColors.archiveLabel": { en: "Archive", zh: "色彩库" },
  "allColors.visibleLabel": { en: "Visible", zh: "可见" },
  "allColors.useCaseLabel": { en: "Use case", zh: "使用场景" },
  "allColors.closerLook": { en: "Closer look", zh: "近距离查看" },
  "allColors.balancedScan": { en: "Balanced scan", zh: "均衡浏览" },
  "allColors.denseScan": { en: "Dense scan", zh: "密集浏览" },
  "allColors.displayControls": { en: "Display controls", zh: "显示控制" },
  "allColors.displayControlsDesc": {
    en: "Switch sort order or isolate a family without leaving the dense overview.",
    zh: "在高密度概览页面中直接切换排序方式或筛选特定色系。",
  },
  "allColors.searchLabel": { en: "Search", zh: "搜索" },
  "allColors.searchPlaceholder": { en: "Search name or hex", zh: "搜索名称或 HEX" },
  "allColors.sortLabel": { en: "Sort", zh: "排序" },
  "allColors.densityLabel": { en: "Density", zh: "密度" },
  "allColors.reset": { en: "Reset", zh: "重置" },
  "allColors.allFamilies": { en: "All families", zh: "所有色系" },
  "allColors.denseSpectrum": { en: "Dense spectrum", zh: "密集色谱" },
  "allColors.denseDesc": { en: "Each tile opens a full detail page for that color.", zh: "点击每个色块可打开该颜色的详情页面。" },
  "allColors.openSearch": { en: "Open search", zh: "打开搜索" },
  "allColors.compact": { en: "Compact", zh: "紧凑" },
  "allColors.comfortable": { en: "Comfortable", zh: "舒适" },
  "allColors.expanded": { en: "Expanded", zh: "展开" },

  // Search page
  "search.badge": { en: "Search the archive", zh: "搜索色彩库" },
  "search.title": { en: "Find colors fast", zh: "快速查找颜色" },
  "search.description": {
    en: "Search by name, family, or hex fragment. This page is optimized for quick lookup rather than browsing the full archive.",
    zh: "按名称、色系或 HEX 片段搜索。此页面针对快速查找而非浏览完整色彩库进行了优化。",
  },
  "search.hueBand": { en: "Hue band", zh: "色相区间" },
  "search.allHues": { en: "All hues", zh: "所有色相" },
  "search.warm": { en: "Warm", zh: "暖色" },
  "search.fresh": { en: "Fresh", zh: "清新" },
  "search.cool": { en: "Cool", zh: "冷色" },
  "search.violet": { en: "Violet / Pink", zh: "紫色 / 粉色" },
  "search.tone": { en: "Tone", zh: "色调" },
  "search.allTones": { en: "All tones", zh: "所有色调" },
  "search.light": { en: "Light", zh: "浅色" },
  "search.mid": { en: "Mid", zh: "中间色" },
  "search.dark": { en: "Dark", zh: "深色" },
  "search.currentQuery": { en: "Current query", zh: "当前查询" },
  "search.noKeyword": { en: "No keyword", zh: "无关键词" },
  "search.currentLens": { en: "Current lens", zh: "当前筛选" },
  "search.satRange": { en: "Saturation range", zh: "饱和度范围" },
  "search.lightRange": { en: "Lightness range", zh: "明度范围" },
  "search.exactHex": { en: "Exact hex", zh: "精确 HEX" },
  "search.ctaLabel": { en: "Take your palette further", zh: "进一步利用你的调色板" },
  "search.ctaTitle": { en: "From search to production-ready tokens", zh: "从搜索到生产级令牌" },
  "search.ctaDesc": {
    en: "ColorArchive packs include CSS variables, Figma tokens, Tailwind config, and Procreate swatches built around curated color directions.",
    zh: "ColorArchive 套装包含 CSS 变量、Figma 令牌、Tailwind 配置和基于精选色彩方案的 Procreate 色板。",
  },
  "search.browsePacks": { en: "Browse packs", zh: "浏览套装" },
  "search.viewCollections": { en: "View collections", zh: "查看合集" },
  "search.freeDownload": { en: "Free download", zh: "免费下载" },
  "search.mood": { en: "Mood", zh: "情绪" },
  "search.recent": { en: "Recent", zh: "最近搜索" },

  // Contrast checker page
  "contrast.badge": { en: "WCAG accessibility", zh: "WCAG 无障碍" },
  "contrast.title": { en: "Contrast checker", zh: "对比度检查器" },
  "contrast.description": {
    en: "Enter two colors to calculate the WCAG contrast ratio. Check compliance for normal text, large text, and UI components at AA and AAA levels.",
    zh: "输入两种颜色计算 WCAG 对比度。检查普通文本、大号文本和 UI 组件在 AA 和 AAA 级别的合规性。",
  },
  "contrast.foreground": { en: "Foreground (text)", zh: "前景（文本）" },
  "contrast.background": { en: "Background", zh: "背景" },
  "contrast.swap": { en: "Swap foreground and background", zh: "交换前景和背景" },
  "contrast.pickFromArchive": { en: "Pick from archive", zh: "从色彩库选择" },
  "contrast.hidePalette": { en: "Hide palette", zh: "隐藏调色板" },
  "contrast.searchPlaceholder": { en: "Search colors by name, hex, or family", zh: "按名称、HEX 或色系搜索" },
  "contrast.noResults": { en: "No colors match your search.", zh: "没有找到匹配的颜色。" },
  "contrast.livePreview": {
    en: "Live preview",
    zh: "实时预览",
  },
  "contrast.headingSample": {
    en: "Heading text sample",
    zh: "标题文本示例",
  },
  "contrast.bodySample": {
    en: "The quick brown fox jumps over the lazy dog. This paragraph demonstrates how body text appears at normal size with these two colors combined.",
    zh: "敏捷的棕色狐狸跳过了懒狗。此段落展示了使用这两种颜色组合时正常大小的正文文本效果。",
  },
  "contrast.smallSample": {
    en: "Small text is harder to read at low contrast ratios. WCAG requires at least 4.5:1 for normal text and 3:1 for large text at the AA level.",
    zh: "低对比度下小文本更难阅读。WCAG AA 级别要求普通文本至少 4.5:1，大文本至少 3:1。",
  },
  "contrast.buttonOutline": {
    en: "Button outline",
    zh: "按钮轮廓",
  },
  "contrast.buttonFilled": {
    en: "Button filled",
    zh: "按钮填充",
  },
  "contrast.reversed": {
    en: "Reversed: background color on foreground color.",
    zh: "反转：背景色在前景色上。",
  },
  "contrast.contrastRatio": {
    en: "Contrast ratio",
    zh: "对比度",
  },
  "contrast.excellent": {
    en: "Excellent contrast. Passes all WCAG criteria.",
    zh: "优秀的对比度，通过所有 WCAG 标准。",
  },
  "contrast.good": {
    en: "Good contrast. Passes AA for normal text and AAA for large text.",
    zh: "良好的对比度。普通文本通过 AA，大文本通过 AAA。",
  },
  "contrast.moderate": {
    en: "Moderate contrast. Passes AA for large text and UI components only.",
    zh: "中等对比度。仅大文本和 UI 组件通过 AA。",
  },
  "contrast.poor": {
    en: "Poor contrast. Fails most WCAG criteria.",
    zh: "对比度不足，未通过大多数 WCAG 标准。",
  },
  "contrast.wcagCompliance": {
    en: "WCAG compliance",
    zh: "WCAG 合规性",
  },
  "contrast.normalText": {
    en: "Normal text",
    zh: "普通文本",
  },
  "contrast.largeText": {
    en: "Large text",
    zh: "大文本",
  },
  "contrast.uiComponents": {
    en: "UI components",
    zh: "UI 组件",
  },
  "contrast.colorBlindness": {
    en: "Color blindness simulation",
    zh: "色盲模拟",
  },
  "contrast.colorBlindnessDesc": {
    en: "See how your foreground/background pair looks under common color vision deficiencies.",
    zh: "查看常见色觉缺陷下前景/背景组合的显示效果。",
  },
  "contrast.ctaLabel": {
    en: "Build with accessible color systems",
    zh: "使用无障碍配色系统构建",
  },
  "contrast.ctaTitle": {
    en: "Take contrast-safe palettes into your project",
    zh: "将对比度安全的调色板引入您的项目",
  },
  "contrast.ctaDesc": {
    en: "The Dark Mode UI Kit ships pre-tested light/dark pairings with contrast ratios that pass AA — structured as CSS variables, Figma tokens, and Tailwind config.",
    zh: "深色模式 UI 套件提供经过预测试的明/暗配对，对比度通过 AA 标准——以 CSS 变量、Figma Token 和 Tailwind 配置形式提供。",
  },
  "contrast.darkModeKit": {
    en: "Dark Mode UI Kit",
    zh: "深色模式 UI 套件",
  },
  "contrast.browseAllPacks": {
    en: "Browse all packs",
    zh: "浏览所有套装",
  },
  "contrast.freeDownload": {
    en: "Free download",
    zh: "免费下载",
  },

  // Palette packs page
  "packs.badge": {
    en: "Productized color assets",
    zh: "产品化色彩资源",
  },
  "packs.title": {
    en: "Explore the paid palette catalog, token exports, and the full bundle",
    zh: "探索付费调色板目录、Token 导出和完整套装",
  },
  "packs.description": {
    en: "Start with the free sample to inspect file quality, then browse the paid catalog for deeper collections, structured token exports, and implementation-ready downloads. Every pack ships instantly after checkout.",
    zh: "先通过免费示例检查文件质量，再浏览付费目录获取更丰富的系列、结构化 Token 导出和开箱即用的下载。所有套装结账后即时交付。",
  },
  "packs.getFreeSample": {
    en: "Get free sample",
    zh: "获取免费示例",
  },
  "packs.openExamples": {
    en: "Open product examples",
    zh: "查看产品示例",
  },
  "packs.pricingSupport": {
    en: "Pricing & support",
    zh: "价格与支持",
  },
  "packs.whichPack": {
    en: "Which pack is right for me?",
    zh: "哪个套装适合我？",
  },
  "packs.save32": {
    en: "Save 32%",
    zh: "节省 32%",
  },
  "packs.bestValue": {
    en: "Best value",
    zh: "最佳性价比",
  },
  "packs.bundleIndividualTotal": {
    en: "Individual total",
    zh: "单独购买总计",
  },
  "packs.bundleDesc": {
    en: "One checkout, every paid pack included. Individual total:",
    zh: "一次结账，包含所有付费套装。单独购买总计：",
  },
  "packs.buyAllAccess": {
    en: "Buy All Access",
    zh: "购买全部访问权",
  },
  "packs.whatsIncluded": {
    en: "What's included",
    zh: "包含内容",
  },
  "packs.buyingGuides": {
    en: "Buying guides",
    zh: "购买指南",
  },
  "packs.buyingGuidesDesc": {
    en: "If you know the problem but not the right pack yet, start from the guide that matches your use case, then come back to the checkout lane that fits.",
    zh: "如果您知道问题但还不确定哪个套装合适，请从与您用例匹配的指南开始，然后回到合适的结账通道。",
  },
  "packs.allGuides": {
    en: "All guides",
    zh: "所有指南",
  },
  "packs.audience": {
    en: "Audience",
    zh: "目标受众",
  },
  "packs.includes": {
    en: "Includes",
    zh: "包含",
  },
  "packs.previewCollections": {
    en: "Preview collections",
    zh: "预览系列",
  },
  "packs.deliverables": {
    en: "Deliverables",
    zh: "交付物",
  },
  "packs.whyCredible": {
    en: "Why it is credible",
    zh: "可信的理由",
  },
  "packs.checkout": {
    en: "Checkout",
    zh: "结账",
  },
  "packs.buyNow": {
    en: "Buy now",
    zh: "立即购买",
  },
  "packs.checkoutUnavailable": {
    en: "Checkout unavailable",
    zh: "暂不可结账",
  },
  "packs.checkoutReady": {
    en: "Checkout ready",
    zh: "可以结账",
  },
  "packs.comingSoon": {
    en: "Coming soon",
    zh: "即将推出",
  },
  "packs.freeSampleFiles": {
    en: "Free sample files",
    zh: "免费示例文件",
  },
  "packs.viewProductProof": {
    en: "View product proof",
    zh: "查看产品证明",
  },
  "packs.packDetails": {
    en: "Pack details",
    zh: "套装详情",
  },
  "packs.openSourceCollections": {
    en: "Open source collections",
    zh: "开源系列",
  },
  "packs.whyPageExists": {
    en: "Why this page exists",
    zh: "此页面存在的原因",
  },
  "packs.relatedRoutes": {
    en: "Related routes",
    zh: "相关页面",
  },
  "packs.browseCollections": {
    en: "Browse collections",
    zh: "浏览系列",
  },
  "packs.openSupport": {
    en: "Open support page",
    zh: "打开支持页面",
  },
  "packs.productExamples": {
    en: "Product examples",
    zh: "产品示例",
  },
  "packs.freeSamplePack": {
    en: "Free sample pack",
    zh: "免费示例套装",
  },
  "packs.useCaseGuides": {
    en: "Use-case guides",
    zh: "用例指南",
  },
  "packs.compareOffers": {
    en: "Compare offers",
    zh: "比较方案",
  },
  "packs.packCol": {
    en: "Pack",
    zh: "套装",
  },
  "packs.priceCol": {
    en: "Price",
    zh: "价格",
  },
  "packs.bestForCol": {
    en: "Best for",
    zh: "最适合",
  },
  "packs.fulfillmentCol": {
    en: "Fulfillment",
    zh: "交付方式",
  },

  // Pack detail page
  "packDetail.badge": {
    en: "Pack detail",
    zh: "套装详情",
  },
  "packDetail.pricingLane": {
    en: "Pricing lane",
    zh: "价格通道",
  },
  "packDetail.checkout": {
    en: "Checkout",
    zh: "结账",
  },
  "packDetail.checkoutReady": {
    en: "Checkout ready",
    zh: "可以结账",
  },
  "packDetail.savings": {
    en: "Savings",
    zh: "节省金额",
  },
  "packDetail.savingsDesc": {
    en: "Versus buying all 6 packs separately",
    zh: "与单独购买全部 6 个套装相比",
  },
  "packDetail.getAllPacks": {
    en: "Get all 6 packs for",
    zh: "以以下价格获取全部 6 个套装",
  },
  "packDetail.bundleBreakdown": {
    en: "Bundle breakdown",
    zh: "套装明细",
  },
  "packDetail.bundleTitle": {
    en: "Every paid pack, one checkout, one download",
    zh: "所有付费套装，一次结账，一次下载",
  },
  "packDetail.bundleDesc": {
    en: "This is for the buyer who already knows they will want more than one lane: brand system setup, creator assets, dark mode pairs, seasonal direction, and the full token archive in one purchase.",
    zh: "适合已知需要多个方向的买家：品牌系统搭建、创作者素材、深色模式配对、季节性方向以及完整的 Token 档案，一次购买全部到手。",
  },
  "packDetail.individualTotal": {
    en: "Individual total",
    zh: "单独购买总计",
  },
  "packDetail.bundlePrice": {
    en: "Bundle price",
    zh: "套装价格",
  },
  "packDetail.youSave": {
    en: "You save",
    zh: "节省",
  },
  "packDetail.openPack": {
    en: "Open pack",
    zh: "打开套装",
  },
  "packDetail.whatPackIsFor": {
    en: "What this pack is for",
    zh: "此套装的用途",
  },
  "packDetail.sampleFiles": {
    en: "Sample files",
    zh: "示例文件",
  },
  "packDetail.sampleNoteBundle": {
    en: "These previews come from several included packs so buyers can inspect the bundle quality before checkout.",
    zh: "这些预览来自多个包含的套装，买家可以在结账前检查捆绑包的质量。",
  },
  "packDetail.sampleNoteRegular": {
    en: "These files are public preview assets. They make the product concrete before checkout.",
    zh: "这些是公开预览文件，让产品在结账前更加直观。",
  },
  "packDetail.sourceCollections": {
    en: "Source collections",
    zh: "来源系列",
  },
  "packDetail.openAllCollections": {
    en: "Open all collections",
    zh: "打开所有系列",
  },
  "packDetail.sampleTokenExport": {
    en: "Sample token export",
    zh: "示例 Token 导出",
  },
  "packDetail.generatedFrom": {
    en: "Generated from",
    zh: "生成自",
  },
  "packDetail.afterYouBuy": {
    en: "After you buy",
    zh: "购买后",
  },
  "packDetail.faq": {
    en: "FAQ",
    zh: "常见问题",
  },
  "packDetail.relatedGuides": {
    en: "Related guides",
    zh: "相关指南",
  },
  "packDetail.license": {
    en: "License",
    zh: "许可证",
  },
  "packDetail.fullLicenseDetails": {
    en: "Full license details",
    zh: "完整许可详情",
  },
  "packDetail.readyToDownload": {
    en: "Ready to download",
    zh: "可以下载",
  },
  "packDetail.instantDownload": {
    en: "Instant download after payment.",
    zh: "付款后即时下载。",
  },
  "packDetail.getFullCatalog": {
    en: "Get the full catalog",
    zh: "获取完整目录",
  },
  "packDetail.buyNow": {
    en: "Buy now",
    zh: "立即购买",
  },
  "packDetail.compareIndividualPacks": {
    en: "Compare individual packs",
    zh: "比较单独套装",
  },
  "packDetail.tryFreeFirst": {
    en: "Try free layer first",
    zh: "先试用免费版",
  },
  "packDetail.backToPacks": {
    en: "Back to packs",
    zh: "返回套装列表",
  },
  "packDetail.productExamples": {
    en: "Product examples",
    zh: "产品示例",
  },
  "packDetail.support": {
    en: "Support",
    zh: "支持",
  },

  // Guide detail page
  "guide.searchIntent": {
    en: "Search intent:",
    zh: "搜索意图：",
  },
  "guide.keyPoints": {
    en: "Key points",
    zh: "要点",
  },
  "guide.featuredCollection": {
    en: "Featured collection",
    zh: "精选系列",
  },
  "guide.openCollection": {
    en: "Open collection",
    zh: "打开系列",
  },
  "guide.allCollections": {
    en: "All collections",
    zh: "所有系列",
  },
  "guide.featuredPack": {
    en: "Featured pack",
    zh: "精选套装",
  },
  "guide.openPack": {
    en: "Open pack",
    zh: "打开套装",
  },
  "guide.tryFreeLayer": {
    en: "Try free layer",
    zh: "试用免费版",
  },
  "guide.openNext": {
    en: "Open next",
    zh: "打开下一个",
  },
  "guide.ctaLabel": {
    en: "Practical next step",
    zh: "下一步行动",
  },
  "guide.ctaTitle": {
    en: "Move from the guide into a concrete palette lane",
    zh: "从指南进入具体的调色板方案",
  },
  "guide.ctaDesc": {
    en: "Guides explain the use case. Collections prove the taste. Packs handle the export and implementation layer.",
    zh: "指南解释用例，系列展示品味，套装处理导出和实施。",
  },
  "guide.browsePacks": {
    en: "Browse packs",
    zh: "浏览套装",
  },
  "guide.moreGuides": {
    en: "More guides",
    zh: "更多指南",
  },
  "guide.relatedGuides": {
    en: "Related guides",
    zh: "相关指南",
  },

  // Note detail page
  "note.highlights": {
    en: "Highlights",
    zh: "亮点",
  },
  "note.featuredCollection": {
    en: "Featured collection",
    zh: "精选系列",
  },
  "note.openCollection": {
    en: "Open collection",
    zh: "打开系列",
  },
  "note.searchFamily": {
    en: "Search family",
    zh: "搜索色系",
  },
  "note.featuredPack": {
    en: "Featured pack",
    zh: "精选套装",
  },
  "note.openPack": {
    en: "Open pack",
    zh: "打开套装",
  },
  "note.tryFreeLayer": {
    en: "Try free layer",
    zh: "试用免费版",
  },
  "note.openNext": {
    en: "Open next",
    zh: "打开下一个",
  },
  "note.joinUpdates": {
    en: "Join updates",
    zh: "订阅更新",
  },
  "note.relatedGuides": {
    en: "Related guides",
    zh: "相关指南",
  },
  "note.newerIssue": {
    en: "Newer issue",
    zh: "更新的一期",
  },
  "note.olderIssue": {
    en: "Older issue",
    zh: "较早的一期",
  },
  "note.stayInLoop": {
    en: "Stay in the loop",
    zh: "保持关注",
  },
  "note.latestIssue": {
    en: "You've reached the latest issue",
    zh: "您已到达最新一期",
  },
  "note.notifyDesc": {
    en: "Get notified when new issues and palette drops land.",
    zh: "新一期和调色板发布时通知您。",
  },
  "note.oldestIssue": {
    en: "This is currently the oldest public issue.",
    zh: "这是目前最早的公开期刊。",
  },
  "note.subscribe": {
    en: "Subscribe",
    zh: "订阅",
  },
  "note.successMessage": {
    en: "You're in — we'll email you about new issues.",
    zh: "订阅成功——新一期发布时我们会通过邮件通知您。",
  },

  // Family overview
  "family.colorFamilies": {
    en: "Color families",
    zh: "色系",
  },
  "family.desc": {
    en: "Jump between hue clusters and compare each family at a glance.",
    zh: "在色相群组之间跳转，一目了然地比较各个色系。",
  },
  "family.viewAll": {
    en: "View all",
    zh: "查看全部",
  },
  "family.openFamilyPages": {
    en: "Open family pages",
    zh: "打开色系页面",
  },
  "family.noMatches": {
    en: "No matches",
    zh: "无匹配",
  },
  "family.active": {
    en: "Active",
    zh: "已选中",
  },
  "family.familyLabel": {
    en: "Family",
    zh: "色系",
  },
  "family.filtered": {
    en: "Filtered",
    zh: "已筛选",
  },
  "family.filterArchive": {
    en: "Filter archive",
    zh: "筛选档案",
  },
  "family.familyPage": {
    en: "Family page",
    zh: "色系页面",
  },
  "family.colorSingular": {
    en: "color",
    zh: "个颜色",
  },
  "family.colorPlural": {
    en: "colors",
    zh: "个颜色",
  },

  // Free pack page
  "freePack.badge": {
    en: "Free sample drop",
    zh: "免费示例",
  },
  "freePack.title": {
    en: "Get the free pack first, then decide if the paid catalog fits",
    zh: "先获取免费包，再决定是否购买付费目录",
  },
  "freePack.description": {
    en: "This is the fastest way to inspect ColorArchive file quality before paying. We send the free pack by email, and the hosted paid catalog is ready if you want more depth, more collections, or implementation-ready token exports.",
    zh: "这是在付款前检查 ColorArchive 文件质量的最快方式。我们通过邮件发送免费包，如果您需要更多系列或开箱即用的 Token 导出，付费目录随时可用。",
  },
  "freePack.emailHint": {
    en: "Enter your email and we'll send the full free pack directly:",
    zh: "输入您的邮箱，我们将直接发送完整的免费包：",
  },
  "freePack.copyRequestNote": {
    en: "Copy request note",
    zh: "复制请求说明",
  },
  "freePack.whatIncluded": {
    en: "What is included in the free layer",
    zh: "免费版包含的内容",
  },
  "freePack.curatedCollection": {
    en: "Curated preview collection:",
    zh: "精选预览系列：",
  },
  "freePack.whyExists": {
    en: "Why this exists",
    zh: "此页面存在的原因",
  },
  "freePack.claimFlow": {
    en: "Claim flow",
    zh: "领取流程",
  },
  "freePack.step1": {
    en: "1. Download the preview files below.",
    zh: "1. 下载下方的预览文件。",
  },
  "freePack.step2": {
    en: "2. Review the featured collection and export shape.",
    zh: "2. 查看精选系列和导出格式。",
  },
  "freePack.step3": {
    en: "3. Enter your email above, get the full free pack, then move into the paid catalog once hosted checkout is fully available.",
    zh: "3. 在上方输入邮箱，获取完整免费包，待结账功能上线后可进入付费目录。",
  },
  "freePack.freeVsPaid": {
    en: "Free vs paid",
    zh: "免费 vs 付费",
  },
  "freePack.upgradeTitle": {
    en: "What changes when you upgrade to the paid pack",
    zh: "升级到付费套装后有什么变化",
  },
  "freePack.openPaidPack": {
    en: "Open paid pack",
    zh: "打开付费套装",
  },
  "freePack.tableLayer": {
    en: "Layer",
    zh: "层级",
  },
  "freePack.tableFreeSample": {
    en: "Free sample",
    zh: "免费示例",
  },
  "freePack.tablePaidPack": {
    en: "Paid pack",
    zh: "付费套装",
  },
  "freePack.ctaLabel": {
    en: "Ready to go deeper?",
    zh: "准备深入了解？",
  },
  "freePack.ctaTitle": {
    en: "Browse all palette packs",
    zh: "浏览所有调色板套装",
  },
  "freePack.ctaDesc": {
    en: "The free pack shows the file shape. Paid packs add more collections, deeper exports, structured usage guidance, and implementation-ready token files.",
    zh: "免费包展示文件格式。付费套装增加更多系列、更深入的导出、结构化使用指南和开箱即用的 Token 文件。",
  },
  "freePack.browseAllPacks": {
    en: "Browse all packs",
    zh: "浏览所有套装",
  },
  "freePack.exploreCollections": {
    en: "Explore collections",
    zh: "探索系列",
  },
  "freePack.seeWhatsInside": {
    en: "See what's inside",
    zh: "查看内容",
  },
  "freePack.featuredCollection": {
    en: "Featured preview collection",
    zh: "精选预览系列",
  },
  "freePack.relatedGuides": {
    en: "Related guides",
    zh: "相关指南",
  },
  "freePack.relatedGuidesDesc": {
    en: "If you are still deciding whether to stay free or upgrade, these guides explain the specific use case behind the sample and the matching paid lane.",
    zh: "如果您还在犹豫是否升级，这些指南会介绍免费示例背后的具体用例和对应的付费方案。",
  },
  "freePack.openGuides": {
    en: "Open guides",
    zh: "打开指南",
  },
  "freePack.wantEverything": {
    en: "Want everything?",
    zh: "想要全部？",
  },
  "freePack.bundleSave": {
    en: "All 6 packs in one download. Save 32%.",
    zh: "6 个套装一次下载，节省 32%。",
  },
  "freePack.getAllAccess": {
    en: "Get All Access",
    zh: "获取全部访问权",
  },
  "freePack.viewPaidPacks": {
    en: "View paid packs",
    zh: "查看付费套装",
  },
  "freePack.productUpdates": {
    en: "Product updates",
    zh: "产品更新",
  },
  "freePack.productProof": {
    en: "Product proof",
    zh: "产品证明",
  },
  "freePack.joinWaitlist": {
    en: "Join waitlist",
    zh: "加入等待列表",
  },
  "freePack.emailForLaunch": {
    en: "Email for launch",
    zh: "发布通知邮件",
  },
  "freePack.openCollection": {
    en: "Open collection",
    zh: "打开系列",
  },

  // Color detail page
  "colorDetail.badge": {
    en: "Color detail",
    zh: "颜色详情",
  },
  "colorDetail.hueLabel": {
    en: "Hue",
    zh: "色相",
  },
  "colorDetail.hexLabel": {
    en: "Hex",
    zh: "HEX",
  },
  "colorDetail.metrics": {
    en: "Metrics",
    zh: "指标",
  },
  "colorDetail.contrastWcag": {
    en: "Contrast (WCAG)",
    zh: "对比度 (WCAG)",
  },
  "colorDetail.onWhite": {
    en: "on white",
    zh: "在白底上",
  },
  "colorDetail.onBlack": {
    en: "on black",
    zh: "在黑底上",
  },
  "colorDetail.copyAction": {
    en: "Copy",
    zh: "复制",
  },
  "colorDetail.copiedState": {
    en: "copied",
    zh: "已复制",
  },
  "colorDetail.inPalette": {
    en: "In palette",
    zh: "已在调色板中",
  },
  "colorDetail.paletteFull": {
    en: "Palette full",
    zh: "调色板已满",
  },
  "colorDetail.addToPalette": {
    en: "Add to palette",
    zh: "添加到调色板",
  },
  "colorDetail.alreadySaved": {
    en: "Already saved",
    zh: "已保存",
  },
  "colorDetail.recentTrailLink": {
    en: "Recent trail",
    zh: "最近浏览",
  },
  "colorDetail.aboutThisColor": {
    en: "About this color",
    zh: "关于这个颜色",
  },
  "colorDetail.copyHint": {
    en: "Copy the hex, RGB, or HSL value above, or paste the CSS custom property below into your stylesheet to reference this color directly.",
    zh: "复制上方的 HEX、RGB 或 HSL 值，或将下方的 CSS 自定义属性粘贴到样式表中直接引用此颜色。",
  },
  "colorDetail.tonalStrip": {
    en: "Tonal strip",
    zh: "色调条",
  },
  "colorDetail.tonalDesc": {
    en: "All lightness levels at this hue and saturation. Click any to navigate.",
    zh: "此色相和饱和度下的所有明度级别。点击任意一个进行导航。",
  },
  "colorDetail.paletteMoves": {
    en: "Palette moves",
    zh: "调色板展开",
  },
  "colorDetail.paletteMovesDesc": {
    en: "Instead of stopping at one swatch, use nearby, opposite, and tonal neighbors to branch into a broader palette.",
    zh: "不要止步于一个色样，利用邻近色、对比色和色调邻色来扩展更广泛的调色板。",
  },
  "colorDetail.exportPreview": {
    en: "Export preview",
    zh: "导出预览",
  },
  "colorDetail.nearestNeighbors": {
    en: "Nearest neighbors",
    zh: "最近邻色",
  },
  "colorDetail.nearestDesc": {
    en: "The closest archive matches by hue, saturation, and lightness.",
    zh: "按色相、饱和度和明度匹配的最接近档案颜色。",
  },
  "colorDetail.searchByHex": {
    en: "Search by hex",
    zh: "按 HEX 搜索",
  },
  "colorDetail.nearbyMatch": {
    en: "Nearby match",
    zh: "邻近匹配",
  },
  "colorDetail.readyToBuild": {
    en: "Ready to build",
    zh: "准备开始构建",
  },
  "colorDetail.buildTitle": {
    en: "Turn these colors into design tokens",
    zh: "将这些颜色转换为设计 Token",
  },
  "colorDetail.buildDesc": {
    en: "ColorArchive packs include CSS variables, Figma tokens, Tailwind config, and Procreate swatches — ready to drop into any project.",
    zh: "ColorArchive 套装包含 CSS 变量、Figma Token、Tailwind 配置和 Procreate 色板——可直接用于任何项目。",
  },
  "colorDetail.browsePacks": {
    en: "Browse packs",
    zh: "浏览套装",
  },
  "colorDetail.freeDownload": {
    en: "Free download",
    zh: "免费下载",
  },
  "colorDetail.viewCollections": {
    en: "View collections",
    zh: "查看系列",
  },
  "colorDetail.recentTrail": {
    en: "Recent trail",
    zh: "最近浏览",
  },
  "colorDetail.recentDesc": {
    en: "Colors you viewed recently in this browser session.",
    zh: "您在此浏览器会话中最近查看的颜色。",
  },
  "colorDetail.openRecent": {
    en: "Open recent",
    zh: "打开最近",
  },
  "colorDetail.recentlyViewed": {
    en: "Recently viewed",
    zh: "最近查看",
  },
  "colorDetail.relatedColors": {
    en: "Related colors",
    zh: "相关颜色",
  },
  "colorDetail.moreFrom": {
    en: "More from",
    zh: "更多来自",
  },
  "colorDetail.search": {
    en: "Search",
    zh: "搜索",
  },
  "colorDetail.lighterCompanion": {
    en: "Lighter companion",
    zh: "较浅的搭配色",
  },
  "colorDetail.darkerCompanion": {
    en: "Darker companion",
    zh: "较深的搭配色",
  },
  "colorDetail.complementary": {
    en: "Complementary counterpoint",
    zh: "互补色",
  },
  "colorDetail.analogousLead": {
    en: "Analogous lead",
    zh: "类似色主色",
  },
  "colorDetail.analogousEcho": {
    en: "Analogous echo",
    zh: "类似色呼应",
  },
  "colorDetail.triadic1": {
    en: "Triadic +120°",
    zh: "三等分 +120°",
  },
  "colorDetail.triadic2": {
    en: "Triadic +240°",
    zh: "三等分 +240°",
  },
  "colorDetail.splitComp1": {
    en: "Split-comp +150°",
    zh: "分裂互补 +150°",
  },
  "colorDetail.splitComp2": {
    en: "Split-comp +210°",
    zh: "分裂互补 +210°",
  },
  "colorDetail.usedIn": {
    en: "Appears in collections",
    zh: "出现在以下系列中",
  },
  "colorDetail.addRecommendedPalette": {
    en: "Add recommended palette",
    zh: "添加推荐调色板",
  },
  "colorDetail.addPaletteMoves": {
    en: "Add palette moves",
    zh: "添加调色板展开",
  },
  "colorDetail.accessiblePairings": {
    en: "Accessible pairings",
    zh: "无障碍配色",
  },
  "colorDetail.accessibleDesc": {
    en: "Archive colors that meet WCAG contrast standards when paired with this color. Use as text-on-background or background-on-text.",
    zh: "与此颜色搭配时符合 WCAG 对比度标准的档案颜色。可用作文本背景或背景文本。",
  },
  "colorDetail.contrastChecker": {
    en: "Contrast checker",
    zh: "对比度检查器",
  },

  // Trending page
  "trending.badge": {
    en: "Trending this week",
    zh: "本周趋势",
  },
  "trending.title": {
    en: "Trending colors",
    zh: "流行色",
  },
  "trending.description": {
    en: "See which colors and families are getting the most attention this week. The ranking refreshes every seven days.",
    zh: "查看本周最受关注的颜色和色系。排名每七天更新一次。",
  },
  "trending.searchArchive": {
    en: "Search archive",
    zh: "搜索档案",
  },
  "trending.browseCollections": {
    en: "Browse collections",
    zh: "浏览系列",
  },
  "trending.familyTrends": {
    en: "Family trends",
    zh: "色系趋势",
  },
  "trending.topColors": {
    en: "Top colors this week",
    zh: "本周热门颜色",
  },
  "trending.topColorsDesc": {
    en: "The most popular archive colors based on community interest this week.",
    zh: "基于本周社区关注度的最热门档案颜色。",
  },
  "trending.yourRecent": {
    en: "Your recent trail",
    zh: "您的最近浏览",
  },
  "trending.viewAll": {
    en: "View all",
    zh: "查看全部",
  },
  "trending.ctaLabel": {
    en: "Go deeper",
    zh: "深入了解",
  },
  "trending.ctaTitle": {
    en: "Turn trending colors into production tokens",
    zh: "将流行色转换为生产 Token",
  },
  "trending.ctaDesc": {
    en: "ColorArchive packs include CSS variables, Figma tokens, Tailwind config, and Procreate swatches — ready for any project.",
    zh: "ColorArchive 套装包含 CSS 变量、Figma Token、Tailwind 配置和 Procreate 色板——适用于任何项目。",
  },
  "trending.browsePacks": {
    en: "Browse packs",
    zh: "浏览套装",
  },
  "trending.freeDownload": {
    en: "Free download",
    zh: "免费下载",
  },

  // Color Converter page
  "converter.title": {
    en: "Color Converter",
    zh: "颜色转换器",
  },
  "converter.description": {
    en: "Convert any color between HEX, RGB, HSL, HSB/HSV, and CMYK formats instantly. Enter a value below and all formats update in real time.",
    zh: "在 HEX、RGB、HSL、HSB/HSV 和 CMYK 格式之间即时转换任何颜色。输入值后所有格式实时更新。",
  },
  "converter.presets": {
    en: "Presets",
    zh: "预设",
  },
  "converter.nearestColor": {
    en: "Nearest archive color",
    zh: "最近的档案颜色",
  },
  "converter.viewInArchive": {
    en: "View in archive",
    zh: "在档案中查看",
  },
  "converter.invalidInput": {
    en: "Enter a valid color value above",
    zh: "请在上方输入有效的颜色值",
  },
  "converter.aboutTitle": {
    en: "About color formats",
    zh: "关于颜色格式",
  },
  "converter.aboutHex": {
    en: "A 6-digit hexadecimal code (e.g. #3A86FF) representing RGB channels. The most common format for web and design tools.",
    zh: "用 6 位十六进制代码（如 #3A86FF）表示 RGB 通道。Web 和设计工具中最常用的格式。",
  },
  "converter.aboutRgb": {
    en: "Red, Green, Blue channels from 0–255. The native color model for screens and digital displays.",
    zh: "红、绿、蓝通道，范围 0-255。屏幕和数字显示器的原生颜色模型。",
  },
  "converter.aboutHsl": {
    en: "Hue (0–360°), Saturation (0–100%), Lightness (0–100%). More intuitive for humans — easy to adjust tone or brightness.",
    zh: "色相 (0-360°)、饱和度 (0-100%)、明度 (0-100%)。对人类更直观，便于调整色调或亮度。",
  },
  "converter.aboutHsb": {
    en: "Hue, Saturation, Brightness (also called HSV). Used in design tools like Photoshop and Figma color pickers.",
    zh: "色相、饱和度、亮度（也称 HSV）。用于 Photoshop 和 Figma 等设计工具的拾色器。",
  },
  "converter.aboutCmyk": {
    en: "Cyan, Magenta, Yellow, Key (Black) — the four-ink model for print. Converts from RGB with some gamut loss for out-of-gamut colors.",
    zh: "青、品红、黄、黑（Key）——印刷用四色油墨模型。从 RGB 转换时色域外颜色会有损失。",
  },

  // Color Harmonies page
  "harmonies_title": {
    en: "Color Harmonies Calculator",
    zh: "色彩和谐计算器",
  },
  "harmonies_subtitle": {
    en: "Enter a hex color and explore six classic harmony types on an interactive color wheel. Click any swatch to copy its hex code.",
    zh: "输入十六进制颜色，在交互式色轮上探索六种经典和谐配色。点击任意色样复制其十六进制代码。",
  },
  "seed_color": {
    en: "Seed Color",
    zh: "基准色",
  },
  "invalid_hex": {
    en: "Invalid hex color",
    zh: "无效的十六进制颜色",
  },

  // Color Compare page
  "compare.badge": {
    en: "Color Comparison",
    zh: "颜色比较",
  },
  "compare.title": {
    en: "Compare Two Colors",
    zh: "比较两种颜色",
  },
  "compare.description": {
    en: "Place any two colors side by side to compare their values, contrast ratio, and WCAG accessibility compliance at a glance.",
    zh: "将任意两种颜色并排放置，一目了然地比较其值、对比度和 WCAG 无障碍合规性。",
  },
  "compare.colorA": {
    en: "Color A",
    zh: "颜色 A",
  },
  "compare.colorB": {
    en: "Color B",
    zh: "颜色 B",
  },
  "compare.contrastRatio": {
    en: "Contrast Ratio",
    zh: "对比度",
  },
  "compare.textPreview": {
    en: "Text Preview",
    zh: "文本预览",
  },
  "compare.headingText": {
    en: "Heading Text",
    zh: "标题文本",
  },
  "compare.smallTextSample": {
    en: "Small text sample for fine print and captions.",
    zh: "用于注释和标题的小文本示例。",
  },
  "compare.copyComparison": {
    en: "Copy comparison",
    zh: "复制比较",
  },
  "compare.pass": {
    en: "Pass",
    zh: "通过",
  },
  "compare.fail": {
    en: "Fail",
    zh: "未通过",
  },
  "compare.lightness": {
    en: "Lightness",
    zh: "明度",
  },
  "compare.saturation": {
    en: "Saturation",
    zh: "饱和度",
  },
  "compare.family": {
    en: "Family",
    zh: "色系",
  },

  // Common
  "common.showMore": {
    en: "Show more",
    zh: "显示更多",
  },
  "common.loading": {
    en: "Loading…",
    zh: "加载中…",
  },

  // Cancel page
  "cancel.badge": {
    en: "Checkout cancelled",
    zh: "结账已取消",
  },
  "cancel.title": {
    en: "No charge went through. You still have three strong paths.",
    zh: "没有产生任何费用。您仍有三条可靠的选择。",
  },
  "cancel.subtitle": {
    en: "If price, timing, or uncertainty stopped the order, do not start over from zero. You can come back lighter with the starter pack, use the free layer first, or jump straight to the best-value bundle.",
    zh: "如果价格、时机或不确定性阻止了订单，不必从零开始。您可以通过入门包轻松重新开始，先使用免费版，或直接跳转到最佳性价比套装。",
  },
  "cancel.discount.label": {
    en: "Still thinking? Here's a discount",
    zh: "还在犹豫？这里有折扣",
  },
  "cancel.discount.title": {
    en: "10% off your first pack",
    zh: "首个套装九折优惠",
  },
  "cancel.discount.note": {
    en: "at checkout. The button below preloads it for the starter pack, and the same code works on any other pack too.",
    zh: "在结账时应用。下方按钮为入门包预加载，同一代码也适用于其他任何套装。",
  },
  "cancel.discount.useCode": {
    en: "Use code",
    zh: "使用代码",
  },
  "cancel.discount.cta": {
    en: "Browse all packs",
    zh: "浏览所有套装",
  },
  "cancel.starter.label": {
    en: "Lowest-friction paid path",
    zh: "最低门槛的付费方案",
  },
  "cancel.free.label": {
    en: "Zero-risk path",
    zh: "零风险方案",
  },
  "cancel.free.title": {
    en: "Free Sample Pack",
    zh: "免费示例套装",
  },
  "cancel.free.price": {
    en: "Free",
    zh: "免费",
  },
  "cancel.free.desc": {
    en: "If you need proof before paying, start with the free layer. It shows the file style, product quality, and the free-to-paid upgrade path without asking for money first.",
    zh: "如果需要在付款前验证，从免费版开始。它展示文件风格、产品质量和从免费到付费的升级路径，无需先付款。",
  },
  "cancel.free.cta": {
    en: "Get the free pack",
    zh: "获取免费包",
  },
  "cancel.free.proof": {
    en: "View product proof",
    zh: "查看产品证明",
  },
  "cancel.bundle.label": {
    en: "Best value",
    zh: "最佳性价比",
  },
  "cancel.bundle.cta": {
    en: "Get the bundle",
    zh: "获取套装",
  },
  "cancel.bundle.details": {
    en: "See what is inside",
    zh: "查看内容",
  },
  "cancel.starter.cta": {
    en: "Review details",
    zh: "查看详情",
  },
  "cancel.nextSteps.label": {
    en: "Next actions",
    zh: "下一步操作",
  },
  "cancel.nextSteps.1": {
    en: "Review one pack page carefully instead of reopening the whole catalog without context.",
    zh: "仔细查看一个套装页面，而不是毫无头绪地重新打开整个目录。",
  },
  "cancel.nextSteps.2": {
    en: "Use the free sample if trust is the blocker, not the product itself.",
    zh: "如果信任是障碍而非产品本身，请使用免费示例。",
  },
  "cancel.nextSteps.3": {
    en: "Use FIRSTPACK on the starter lane if price is the blocker and you want the fastest paid path.",
    zh: "如果价格是障碍且您希望走最快的付费路径，在入门方案上使用 FIRSTPACK。",
  },
  "cancel.nextSteps.4": {
    en: "Open the bundle page if you were comparing multiple packs and decision fatigue slowed you down.",
    zh: "如果您在比较多个套装时决策疲劳拖慢了进度，请打开套装页面。",
  },
  "cancel.questions.label": {
    en: "Questions before buying",
    zh: "购买前的疑问",
  },
  "cancel.questions.desc": {
    en: "If something felt unclear, the fastest way to fix drop-off is to answer the exact objection: file contents, use case, license, or support expectations.",
    zh: "如果有不清楚的地方，解决流失的最快方式是回答具体的疑虑：文件内容、用例、许可或支持期望。",
  },
  "cancel.questions.compareAll": {
    en: "Compare all packs",
    zh: "比较所有套装",
  },
  "cancel.questions.freeSample": {
    en: "Free sample",
    zh: "免费示例",
  },
  "cancel.questions.proof": {
    en: "Product proof",
    zh: "产品证明",
  },
  "cancel.questions.support": {
    en: "Support & licensing",
    zh: "支持与许可",
  },

  // Tools index page
  "tools.badge": {
    en: "Color tools",
    zh: "色彩工具",
  },
  "tools.heading": {
    en: "Free Color Tools",
    zh: "免费色彩工具",
  },
  "tools.subheading": {
    en: "Twelve free tools to help designers work with color more effectively. No account required.",
    zh: "十二款免费工具，帮助设计师更高效地使用颜色。无需注册。",
  },
  "tools.openTool": {
    en: "Open tool",
    zh: "打开工具",
  },
  "tools.badge.new": {
    en: "New",
    zh: "新",
  },
  "tools.cat.accessibility": {
    en: "Accessibility",
    zh: "无障碍",
  },
  "tools.cat.analysis": {
    en: "Color Analysis",
    zh: "色彩分析",
  },
  "tools.cat.creative": {
    en: "Creative Tools",
    zh: "创意工具",
  },
  "tools.cat.explore": {
    en: "Exploration",
    zh: "探索",
  },
  "tools.contrast.name": {
    en: "Contrast Checker",
    zh: "对比度检查器",
  },
  "tools.contrast.desc": {
    en: "Check WCAG AA/AAA compliance between any two colors. Covers normal text, large text, and UI components.",
    zh: "检查任意两种颜色之间的 WCAG AA/AAA 合规性。涵盖普通文本、大文本和 UI 组件。",
  },
  "tools.colorblind.name": {
    en: "Color Blindness Simulator",
    zh: "色盲模拟器",
  },
  "tools.colorblind.desc": {
    en: "Preview your palette through 8 types of color vision deficiency — including deuteranopia, protanopia, and achromatopsia.",
    zh: "通过 8 种色觉缺陷类型预览您的调色板——包括绿色盲、红色盲和全色盲。",
  },
  "tools.convert.name": {
    en: "Color Converter",
    zh: "颜色转换器",
  },
  "tools.convert.desc": {
    en: "Convert any color between HEX, RGB, HSL, HSB, and CMYK instantly. Copy any format with one click.",
    zh: "在 HEX、RGB、HSL、HSB 和 CMYK 之间即时转换任何颜色。一键复制任何格式。",
  },
  "tools.compare.name": {
    en: "Color Compare",
    zh: "颜色比较",
  },
  "tools.compare.desc": {
    en: "Place two colors side by side and compare their hex values, HSL properties, luminance, and contrast ratio.",
    zh: "将两种颜色并排放置，比较其十六进制值、HSL 属性、亮度和对比度。",
  },
  "tools.harmonies.name": {
    en: "Color Harmonies",
    zh: "色彩和谐",
  },
  "tools.harmonies.desc": {
    en: "Generate complementary, analogous, triadic, tetradic, and split-complementary palettes from any seed color.",
    zh: "从任意基准色生成互补、类似、三等分、四等分和分裂互补调色板。",
  },
  "tools.gradient.name": {
    en: "Gradient Generator",
    zh: "渐变生成器",
  },
  "tools.gradient.desc": {
    en: "Create linear or radial CSS gradients between any two colors. Adjust stops and copy production-ready CSS.",
    zh: "在任意两种颜色之间创建线性或径向 CSS 渐变。调整色标并复制可直接使用的 CSS。",
  },
  "tools.paletteGen.name": {
    en: "Palette Generator",
    zh: "调色板生成器",
  },
  "tools.paletteGen.desc": {
    en: "Build a curated 5-color palette algorithmically from any seed hue. Export as CSS variables or copy hex values.",
    zh: "从任意基准色通过算法生成 5 色调色板。导出为 CSS 变量或复制十六进制值。",
  },
  "tools.palette.name": {
    en: "Palette Builder",
    zh: "调色板构建器",
  },
  "tools.palette.desc": {
    en: "Pick colors from the 2016-color archive and export your selection as CSS variables, Tailwind config, or Figma JSON.",
    zh: "从 2016 色档案中选色，导出为 CSS 变量、Tailwind 配置或 Figma JSON。",
  },
  "tools.wordToColor.name": {
    en: "Word \u2192 Color",
    zh: "文字 → 颜色",
  },
  "tools.wordToColor.desc": {
    en: "Type any word or phrase and get a deterministic color palette derived from its characters. Consistent across sessions.",
    zh: "输入任意单词或短语，根据字符生成确定性的调色板。跨会话保持一致。",
  },
  "tools.spectrum.name": {
    en: "Spectrum View",
    zh: "光谱视图",
  },
  "tools.spectrum.desc": {
    en: "Explore all 2016 archive colors arranged in a full-spectrum grid sorted by hue, lightness, and saturation.",
    zh: "在按色相、明度和饱和度排列的全光谱网格中探索全部 2016 种档案颜色。",
  },
  "tools.surprise.name": {
    en: "Surprise Me",
    zh: "随机惊喜",
  },
  "tools.surprise.desc": {
    en: "Click for a random color from the curated archive. Great for breaking creative blocks and finding unexpected inspiration.",
    zh: "点击从精选档案中获取随机颜色。非常适合打破创意瓶颈，发现意想不到的灵感。",
  },
  "tools.tints.name": {
    en: "Tints & Shades Generator",
    zh: "色调与阴影生成器",
  },
  "tools.tints.desc": {
    en: "Generate a complete 11-step tonal scale (50–950) from any hex color. Export as CSS variables, Tailwind config, Sass, or JSON.",
    zh: "从任意十六进制颜色生成完整的 11 级色调阶梯（50-950）。导出为 CSS 变量、Tailwind 配置、Sass 或 JSON。",
  },
  "tools.wcagAudit.name": {
    en: "WCAG Contrast Auditor",
    zh: "WCAG 批量检测",
  },
  "tools.wcagAudit.desc": {
    en: "Paste up to 10 design system colors and get a full AA/AAA compliance matrix for every foreground/background pair. Export as CSV.",
    zh: "粘贴最多 10 个设计系统颜色，即可获得每对前景/背景的完整 AA/AAA 合规矩阵。支持导出为 CSV。",
  },
  "tools.brand.name": {
    en: "Brand Color System",
    zh: "品牌色彩系统",
  },
  "tools.brand.desc": {
    en: "Turn any hex color into a complete design system: 11-step primary & neutral scales, semantic colors, WCAG validation, and CSS/Tailwind export.",
    zh: "将任意十六进制颜色转化为完整的设计系统：11 级主色和中性色阶、语义色、WCAG 验证，以及 CSS/Tailwind 导出。",
  },
  "tools.ctaBadge": {
    en: "More to explore",
    zh: "更多探索",
  },
  "tools.ctaHeading": {
    en: "2,016 colors, zero noise",
    zh: "2,016 种颜色，零噪音",
  },
  "tools.ctaDesc": {
    en: "Every tool on this page works with the same carefully curated archive of 2,016 designer-ready colors. Browse the full archive or read the guides to level up your color knowledge.",
    zh: "此页面上的每个工具都使用同一个精心策划的 2,016 色设计师级档案。浏览完整档案或阅读指南来提升您的色彩知识。",
  },
  "tools.ctaBrowseArchive": {
    en: "Browse archive",
    zh: "浏览档案",
  },
  "tools.ctaReadGuides": {
    en: "Read guides",
    zh: "阅读指南",
  },

  // Error page
  "error.title": { en: "Something went wrong", zh: "出现错误" },
  "error.description": {
    en: "An unexpected error occurred. Try refreshing the page.",
    zh: "发生了意外错误。请尝试刷新页面。",
  },
  "error.tryAgain": { en: "Try again", zh: "重试" },
  "error.goHome": { en: "Go home", zh: "返回首页" },

  // Favorite actions
  "favorite.save": { en: "Save", zh: "保存" },
  "favorite.saved": { en: "Saved", zh: "已保存" },

  // Share actions
  "share.shareOnX": { en: "Share on X", zh: "分享到X" },
  "share.shareLink": { en: "Share link", zh: "分享链接" },
  "share.linkCopied": { en: "Link copied", zh: "链接已复制" },

  // Grid section
  "grid.archiveTitle": { en: "Archive", zh: "色彩库" },
  "grid.archiveDesc": {
    en: "Curated swatches arranged for fast scanning and comparison.",
    zh: "精心策划的色板，便于快速浏览和比较。",
  },
};

export function t(key: string, locale: Locale): string {
  const entry = translations[key];
  if (!entry) return key;
  return entry[locale] ?? entry.en ?? key;
}

export function getLocaleFromStorage(): Locale {
  if (typeof window === "undefined") return "en";
  try {
    const stored = localStorage.getItem("colorarchive-locale");
    if (stored === "zh") return stored;
  } catch {
    /* ignore */
  }
  return "en";
}
