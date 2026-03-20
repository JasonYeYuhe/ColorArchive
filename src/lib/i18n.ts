export type Locale = "en" | "ja";

const translations: Record<string, Record<Locale, string>> = {
  // Navigation group labels
  "nav.explore": { en: "Explore", ja: "探索" },
  "nav.tools": { en: "Tools", ja: "ツール" },
  "nav.shop": { en: "Shop", ja: "ショップ" },
  "nav.project": { en: "Project", ja: "プロジェクト" },
  "nav.account": { en: "Account", ja: "アカウント" },

  // Navigation items
  "nav.archive": { en: "Archive", ja: "アーカイブ" },
  "nav.allColors": { en: "All Colors", ja: "すべての色" },
  "nav.search": { en: "Search", ja: "検索" },
  "nav.families": { en: "Families", ja: "カラーファミリー" },
  "nav.collections": { en: "Collections", ja: "コレクション" },
  "nav.notes": { en: "Notes", ja: "ノート" },
  "nav.guides": { en: "Guides", ja: "ガイド" },
  "nav.spectrum": { en: "Spectrum", ja: "スペクトラム" },
  "nav.wordToColor": { en: "Word \u2192 Color", ja: "ワード → カラー" },
  "nav.contrast": { en: "Contrast", ja: "コントラスト" },
  "nav.surprise": { en: "Surprise", ja: "サプライズ" },
  "nav.favorites": { en: "Favorites", ja: "お気に入り" },
  "nav.packs": { en: "Packs", ja: "パック" },
  "nav.freePack": { en: "Free Pack", ja: "無料パック" },
  "nav.recent": { en: "Recent", ja: "最近" },
  "nav.analytics": { en: "Analytics", ja: "分析" },
  "nav.updates": { en: "Updates", ja: "更新情報" },
  "nav.about": { en: "About", ja: "概要" },
  "nav.support": { en: "Support", ja: "サポート" },

  // Header actions
  "header.login": { en: "Log in", ja: "ログイン" },
  "header.account": { en: "Account", ja: "アカウント" },
  "header.menu": { en: "Menu", ja: "メニュー" },
  "header.close": { en: "Close", ja: "閉じる" },
  "header.logout": { en: "Log out", ja: "ログアウト" },

  // Hero section
  "hero.badge": { en: "Curated color archive", ja: "キュレーションカラーアーカイブ" },
  "hero.description": {
    en: "A calm, searchable library of color. Browse a large curated spectrum, sort it with precision, and copy production-ready hex values in one click.",
    ja: "穏やかで検索しやすいカラーライブラリ。厳選されたスペクトラムを閲覧し、正確にソートし、ワンクリックでHEX値をコピー。",
  },
  "hero.getStartedFree": { en: "Get started free", ja: "無料で始める" },
  "hero.browseArchive": { en: "Browse archive", ja: "アーカイブを見る" },
  "hero.browsePacks": { en: "Browse packs", ja: "パックを見る" },
  "hero.readGuides": { en: "Read guides", ja: "ガイドを読む" },
  "hero.showingFullArchive": { en: "Showing full archive", ja: "全アーカイブを表示中" },
  "hero.allFamilies": { en: "All families", ja: "全ファミリー" },
  "hero.family": { en: "family", ja: "ファミリー" },
  "hero.archive": { en: "Archive", ja: "アーカイブ" },
  "hero.showing": { en: "Showing", ja: "表示中" },
  "hero.colors": { en: "colors", ja: "色" },
  "hero.defaultSort": { en: "Default sort", ja: "デフォルトソート" },
  "hero.collections": { en: "collections", ja: "コレクション" },
  "hero.products": { en: "products", ja: "製品" },
  "hero.static": { en: "static", ja: "静的" },
  "hero.new": { en: "New", ja: "新着" },
  "hero.contrastChecker": { en: "Contrast Checker", ja: "コントラストチェッカー" },
  "hero.contrastDesc": {
    en: "Test any two colors against WCAG AA and AAA standards. Get instant readability scores and find accessible pairings.",
    ja: "WCAG AAおよびAAAの基準で任意の2色をテスト。即座に読みやすさのスコアを取得し、アクセシブルな組み合わせを発見。",
  },
  "hero.tryContrastChecker": { en: "Try contrast checker", ja: "コントラストチェッカーを試す" },
  "hero.shareablePalettes": { en: "Shareable Palettes", ja: "共有パレット" },
  "hero.paletteDesc": {
    en: "Build custom palettes and share them via URL. Collaborate on color choices with a direct link — no account needed.",
    ja: "カスタムパレットを作成してURLで共有。ダイレクトリンクで色の選択を共同作業 — アカウント不要。",
  },
  "hero.createPalette": { en: "Create a palette", ja: "パレットを作成" },
  "hero.guides": { en: "Guides", ja: "ガイド" },
  "hero.guidesHeading": {
    en: "High-intent color guides tied to real archive routes",
    ja: "実際のアーカイブルートに紐づいた実用カラーガイド",
  },
  "hero.guidesDesc": {
    en: "Start from the question you actually have: brand palette, dark mode, free downloads, Figma tokens, Tailwind tokens, or website color direction.",
    ja: "あなたの実際の疑問から始めましょう：ブランドパレット、ダークモード、無料ダウンロード、Figmaトークン、Tailwindトークン、サイトのカラー方針。",
  },
  "hero.browseAllGuides": { en: "Browse all guides", ja: "すべてのガイドを見る" },
  "hero.readNotes": { en: "Read notes", ja: "ノートを読む" },
  "hero.palettePacks": { en: "Palette Packs", ja: "パレットパック" },
  "hero.readyToUse": { en: "Ready-to-use color systems", ja: "すぐに使えるカラーシステム" },
  "hero.packsDesc": {
    en: "Curated palette bundles with CSS tokens, Tailwind snippets, and usage guides. Start with a free sample or browse all packs.",
    ja: "CSSトークン、Tailwindスニペット、使い方ガイド付きの厳選パレットバンドル。無料サンプルから始めるか、全パックを閲覧。",
  },
  "hero.browseAllPacks": { en: "Browse all packs", ja: "すべてのパックを見る" },

  // Filter toolbar
  "filter.searchPlaceholder": { en: "Search by color name or hex value", ja: "色名またはHEX値で検索" },
  "filter.clear": { en: "Clear", ja: "クリア" },
  "filter.sort": { en: "Sort", ja: "並べ替え" },
  "filter.sortHue": { en: "Hue", ja: "色相" },
  "filter.sortLightness": { en: "Lightness", ja: "明度" },
  "filter.sortName": { en: "Name", ja: "名前" },
  "filter.reset": { en: "Reset", ja: "リセット" },
  "filter.shareView": { en: "Share view", ja: "ビューを共有" },
  "filter.allFamilies": { en: "All families", ja: "全ファミリー" },
  "filter.showingAll": { en: "Showing all", ja: "全" },
  "filter.showingOf": { en: "of", ja: "/" },
  "filter.archiveControls": { en: "Archive controls", ja: "アーカイブ操作" },
  "filter.searchSortNarrow": { en: "Search, sort, and narrow by family", ja: "検索、並べ替え、ファミリーで絞り込み" },

  // Color card
  "color.copy": { en: "Copy", ja: "コピー" },
  "color.copied": { en: "Copied", ja: "コピー済み" },
  "color.openDetail": { en: "Open detail", ja: "詳細を見る" },
  "color.addToPalette": { en: "Add to palette", ja: "パレットに追加" },
  "color.inPalette": { en: "In palette", ja: "パレット内" },
  "color.paletteFull": { en: "Palette full", ja: "パレット満杯" },
  "color.alreadyInPalette": { en: "Already in palette", ja: "パレットに追加済み" },

  // Footer
  "footer.description": {
    en: "A curated color library with 2016 algorithmically generated colors. Browse, search, save favorites, and export palette tokens — no account required.",
    ja: "アルゴリズムで生成された2016色のキュレーションカラーライブラリ。閲覧、検索、お気に入り保存、パレットトークンのエクスポート — アカウント不要。",
  },
  "footer.readyForExport": { en: "Ready for static export", ja: "静的エクスポート対応" },

  // Common
  "common.showMore": { en: "Show more", ja: "もっと見る" },
  "common.loading": { en: "Loading…", ja: "読み込み中…" },
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
    if (stored === "ja") return "ja";
  } catch {
    /* ignore */
  }
  return "en";
}
