import type { ColorFamily, ColorRecord } from "@/src/types/color";
import type { ColorCollection } from "@/src/lib/collections";
import { COLOR_FAMILIES, sortColors } from "@/src/lib/color-utils";

export interface ColorFamilyPageData {
  family: ColorFamily;
  slug: string;
  title: string;
  summary: string;
  description: string;
  seoDescription: string;
  useCases: string[];
  culturalBackground: string;
  culturalBackgroundJa: string;
}

const FAMILY_PAGE_DATA: Record<ColorFamily, ColorFamilyPageData> = {
  Red: {
    family: "Red",
    slug: "red",
    title: "Red Family",
    summary: "Crimson, ruby, and merlot shades for editorial warmth, campaigns, and bold contrast.",
    description:
      "The red family holds ColorArchive's warmest expressive tones, spanning pale blushes through deep merlots. Use this lane when the palette needs urgency, appetite, romance, or dramatic contrast.",
    seoDescription:
      "Browse the red color family in ColorArchive, from pale blush to merlot ink, with searchable shades and related collections.",
    useCases: ["Campaign accents", "Editorial warmth", "Beauty and food brands"],
    culturalBackground:
      "Red is among the oldest pigments in human history, found in 40,000-year-old cave paintings. In China, red (hong) symbolizes luck, prosperity, and celebration — it dominates weddings, New Year, and festival décor. In Japan, red (aka) appears in torii gates, daruma dolls, and the national flag as a symbol of vitality and the sun. Western traditions associate red with passion, danger, and power — from Roman generals' cloaks to modern-day stop signs. In Indian culture, red signifies marriage, fertility, and devotion, worn as vermillion (sindoor) and bridal saris.",
    culturalBackgroundJa:
      "赤は人類最古の顔料のひとつで、4万年前の洞窟壁画にも見られます。中国では「紅」は幸運・繁栄・祝賀の象徴で、結婚式や春節の装飾に多用されます。日本では鳥居、だるま、国旗に赤が使われ、活力と太陽の象徴です。西洋では情熱・危険・権力を表し、ローマ将軍のマントから現代の停止標識まで続いています。インド文化では赤は婚姻・豊穣・献身を象徴し、シンドゥールや花嫁のサリーに使われます。",
  },
  Orange: {
    family: "Orange",
    slug: "orange",
    title: "Orange Family",
    summary: "Coral, apricot, and ember tones for warmth, hospitality, and sunlit product surfaces.",
    description:
      "The orange family adds heat without the bluntness of pure red. It is useful when the work should feel alive, tactile, and welcoming rather than purely loud.",
    seoDescription:
      "Explore the orange color family in ColorArchive, from coral and apricot to ember and amber tones.",
    useCases: ["Travel and lifestyle", "Warm product surfaces", "Hospitality brands"],
    culturalBackground:
      "Orange takes its English name from the fruit, which arrived in Europe via Arabic (naranj) and Sanskrit (naranga). In Hinduism and Buddhism, saffron orange represents renunciation and spiritual quest — it is the color of monks' robes across Southeast Asia. In the Netherlands, orange (oranje) is the national color, tied to the House of Orange-Nassau. In Japan, orange tones appear in autumn momiji (maple) traditions and the persimmon (kaki) harvest. The pigment chrome orange, first synthesized in the 1800s, helped Impressionists capture sunlight.",
    culturalBackgroundJa:
      "オレンジの英名は果物に由来し、サンスクリット語のnarangaからアラビア語を経てヨーロッパに伝わりました。ヒンドゥー教と仏教では、サフランオレンジは放棄と精神的な探求を表し、東南アジアの僧侶の袈裟の色です。オランダではオレンジ（oranje）がオラニエ＝ナッサウ家に因む国民色。日本では秋の紅葉や柿の収穫にオレンジ色調が現れます。1800年代に合成されたクロムオレンジは印象派の画家たちの日光表現を助けました。",
  },
  Yellow: {
    family: "Yellow",
    slug: "yellow",
    title: "Yellow Family",
    summary: "Amber, citrine, and honey tones for optimistic surfaces, highlights, and soft contrast.",
    description:
      "The yellow family moves from restrained paper-like warmth to vivid attention-grabbing signals. It works well when the interface needs lift, sunlight, or optimistic energy.",
    seoDescription:
      "Browse the yellow color family in ColorArchive, including amber, citrine, and honey shades.",
    useCases: ["Highlight systems", "Editorial warmth", "Optimistic interfaces"],
    culturalBackground:
      "Yellow ochre is the oldest known pigment, used in prehistoric art worldwide. In Imperial China, bright yellow was reserved exclusively for the emperor — the Yellow Emperor (Huangdi) is a mythological progenitor of Chinese civilization. In Japan, yellow (ki) appears in the golden pavilion (Kinkaku-ji) and autumn ginkgo celebrations. In Western art, yellow symbolizes both divinity (gold leaf in religious icons) and caution (hazard signs). Van Gogh's iconic sunflowers elevated yellow to a symbol of hope and intensity.",
    culturalBackgroundJa:
      "黄土色は世界中の先史時代の美術に使われた、最古の顔料です。中国の帝政時代、鮮やかな黄色は皇帝専用で、黄帝は中華文明の神話的祖先です。日本では金閣寺や秋の銀杏並木に黄色が現れます。西洋美術では黄色は神聖（宗教画の金箔）と注意（危険標識）の両方を象徴します。ゴッホの象徴的なひまわりは、黄色を希望と強烈さのシンボルに高めました。",
  },
  Lime: {
    family: "Lime",
    slug: "lime",
    title: "Lime Family",
    summary: "Olive and lime tones for freshness, sport energy, and sharp contrast in curated systems.",
    description:
      "The lime family sits between yellow energy and green structure. It works as a bright organic accent, especially when a product wants freshness without becoming candy-like.",
    seoDescription:
      "Browse lime and olive family colors in ColorArchive for fresh, energetic, and organic palette building.",
    useCases: ["Wellness accents", "Sport and movement", "Fresh organic brands"],
    culturalBackground:
      "Lime and chartreuse sit at the boundary between yellow and green, a zone that nature uses as a universal signal for new growth. In medieval European heraldry, vert (green-yellow) represented loyalty and friendship. In Japanese aesthetics, the color of young bamboo shoots (wakakusa-iro) symbolizes youth and vitality. Contemporary designers use lime-green for energy brands, fitness apps, and sustainability messaging — its high visibility made it the go-to accent for safety vests and emergency signage.",
    culturalBackgroundJa:
      "ライムとシャルトリューズは黄色と緑の境界に位置し、自然界では新芽の普遍的なシグナルです。中世ヨーロッパの紋章学では、vert（黄緑）は忠誠と友情を表しました。日本の美学では若草色が若さと活力を象徴します。現代のデザイナーはライムグリーンをエナジーブランド、フィットネスアプリ、サステナビリティメッセージに使用。高い視認性から安全ベストや緊急標識のアクセントカラーにもなっています。",
  },
  Green: {
    family: "Green",
    slug: "green",
    title: "Green Family",
    summary: "Moss, leaf, emerald, and mint tones for natural systems, wellness brands, and grounded UI.",
    description:
      "The green family is one of the broadest lanes in the archive, ranging from earthy moss to crisp mint. It is the most reliable choice when the work should feel organic, restorative, or environmentally rooted.",
    seoDescription:
      "Explore the green color family in ColorArchive, from moss and leaf tones to emerald and mint shades.",
    useCases: ["Wellness brands", "Environmental campaigns", "Grounded interface systems"],
    culturalBackground:
      "Green has been sacred across cultures for millennia. In Islam, green is the holiest color, associated with the Prophet and paradise — it dominates mosque décor and national flags. In Japanese culture, green (midori) is deeply tied to tea ceremony aesthetics and the moss gardens of Kyoto temples like Saiho-ji. Celtic traditions linked green to the otherworld and fertility. In Western marketing, green became the universal shorthand for 'eco-friendly' and 'natural' in the 1970s environmental movement. The pigment Scheele's Green, popular in Victorian wallpaper, was infamously made with arsenic.",
    culturalBackgroundJa:
      "緑は何千年もの間、文化を超えて神聖視されてきました。イスラム教では緑は最も聖なる色で、預言者と楽園に関連し、モスクの装飾や国旗に多用されます。日本文化では緑（みどり）は茶道の美学や西芳寺などの京都の苔庭と深く結びついています。ケルトの伝統では緑は異界と豊穣に関連。西洋のマーケティングでは1970年代の環境運動以降、緑は「エコフレンドリー」の代名詞になりました。ヴィクトリア朝の壁紙に人気だったシェーレグリーンは砒素で作られていたことでも知られます。",
  },
  Teal: {
    family: "Teal",
    slug: "teal",
    title: "Teal Family",
    summary: "Seafoam, jade, lagoon, and teal shades for coastal, health, and product clarity.",
    description:
      "The teal family bridges organic green and technical blue. It suits products that need calm confidence, gentle freshness, and a slightly aquatic feel.",
    seoDescription:
      "Browse teal and seafoam family colors in ColorArchive for calm, fresh, and coastal palettes.",
    useCases: ["Coastal product brands", "Calm dashboards", "Health and wellness UI"],
    culturalBackground:
      "Teal bridges the organic warmth of green and the technical coolness of blue. In ancient Egypt, turquoise — the mineral that gives teal its earliest cultural form — was prized as a protective stone, adorning Tutankhamun's death mask. In Mesoamerican cultures, turquoise was more valuable than gold. In Japanese art, the color seiji-iro (celadon) appeared in prized Edo-period ceramics. Teal entered modern design language through mid-century Scandinavian furniture and healthcare interiors, where its calming properties reduce patient anxiety.",
    culturalBackgroundJa:
      "ティールは緑の有機的な温かさと青の技術的な冷たさを橋渡しします。古代エジプトではターコイズ石が守護の石として珍重され、ツタンカーメンのデスマスクを飾りました。メソアメリカ文化ではターコイズは金よりも価値がありました。日本の美術では青磁色（せいじいろ）が江戸時代の珍重された陶磁器に現れます。ティールは20世紀半ばの北欧家具やヘルスケアインテリアを通じて現代のデザイン言語に入り、鎮静効果で患者の不安を軽減します。",
  },
  Blue: {
    family: "Blue",
    slug: "blue",
    title: "Blue Family",
    summary: "Azure, sapphire, cobalt, and indigo shades for interface systems, trust, and technical products.",
    description:
      "The blue family gives the archive its strongest product and systems language. It is the default lane for trust, precision, coolness, and technical clarity, but still spans soft airy mists through vivid cobalt cores.",
    seoDescription:
      "Explore the blue color family in ColorArchive, from pale azure and sapphire to vivid cobalt and indigo.",
    useCases: ["SaaS and product UI", "Trust-driven brands", "Technical landing pages"],
    culturalBackground:
      "Blue was historically the rarest and most expensive pigment. Ultramarine, ground from lapis lazuli imported from Afghanistan, was more costly than gold in medieval Europe — reserved for painting the Virgin Mary's robes. In Japan, indigo dyeing (ai-zome) became so prevalent during the Edo period that visitors called it 'Japan Blue.' The invention of synthetic Prussian Blue in 1706 democratized the color. In Tuareg culture, indigo-dyed cloth is so significant that the people are called 'Blue Men of the Sahara.' Today, blue dominates digital interfaces — Facebook, Twitter, LinkedIn — because it conveys trust and reduces eye strain.",
    culturalBackgroundJa:
      "青は歴史的に最も希少で高価な顔料でした。アフガニスタンから輸入されたラピスラズリから作るウルトラマリンは中世ヨーロッパで金より高価で、聖母マリアのローブ専用でした。日本では藍染め（あいぞめ）が江戸時代に広く普及し、訪問者は「ジャパンブルー」と呼びました。1706年のプロシアンブルーの発明で青は民主化されました。トゥアレグ文化では藍染め布が非常に重要で「サハラの青い人々」と呼ばれます。現在、青はFacebook、Twitter、LinkedInなどデジタルインターフェースを支配し、信頼感と目の疲労軽減を伝えます。",
  },
  Purple: {
    family: "Purple",
    slug: "purple",
    title: "Purple Family",
    summary: "Iris, violet, orchid, plum, and mulberry tones for creative, cultural, and nocturne palettes.",
    description:
      "The purple family is where the archive becomes more expressive and atmospheric. Use it for culture, entertainment, launch pages, and products that need to feel imaginative without losing structure.",
    seoDescription:
      "Browse the purple color family in ColorArchive, from iris and violet to orchid, plum, and mulberry shades.",
    useCases: ["Creative brands", "Launch pages", "Atmospheric dark interfaces"],
    culturalBackground:
      "Purple has been the color of royalty since antiquity. Tyrian purple, extracted from murex sea snails in Phoenicia, required 12,000 snails per gram of dye — making it literally worth its weight in gold. Roman sumptuary laws restricted purple to senators and emperors. In Japanese court culture, murasaki (purple) was the highest-ranking color in the cap-rank system. The synthetic dye mauveine, accidentally discovered by William Perkin in 1856, launched the entire synthetic dye industry. In contemporary design, purple signals creativity, premium quality, and technological innovation — from Twitch to Cadbury.",
    culturalBackgroundJa:
      "紫は古代から王族の色でした。フェニキアのツブリ貝から抽出するティリアンパープルは1グラムに12,000個の貝が必要で、文字通り金と同等の価値がありました。ローマの奢侈法は紫を元老院議員と皇帝に制限しました。日本の宮廷文化では紫（むらさき）が冠位制度の最高位の色でした。1856年にウィリアム・パーキンが偶然発見した合成染料モーヴェインは合成染料産業全体を立ち上げました。現代のデザインでは紫は創造性、プレミアム品質、技術革新を示します。",
  },
  Pink: {
    family: "Pink",
    slug: "pink",
    title: "Pink Family",
    summary: "Magenta, fuchsia, peony, rose, and blush tones for campaign energy and expressive brand surfaces.",
    description:
      "The pink family carries the archive's most social, campaign-ready, and expressive tones. It ranges from pale blushes to vivid fuchsias, useful for beauty, culture, and high-energy product stories.",
    seoDescription:
      "Explore the pink color family in ColorArchive, from soft blush and rose to vivid peony and fuchsia shades.",
    useCases: ["Beauty and culture", "Campaign systems", "Expressive social surfaces"],
    culturalBackground:
      "Pink's cultural meaning has shifted dramatically over centuries. In 18th-century Europe, pink was a masculine color — boys wore pink as a 'lighter red' signaling strength. The gender association flipped in the mid-20th century through marketing. In Japan, pink (momoiro/pinku) is deeply tied to cherry blossom season (hanami) and represents transient beauty, a core concept in Japanese aesthetics (mono no aware). In India, the city of Jaipur is called the 'Pink City' after Maharaja Ram Singh painted it pink to welcome Prince Albert in 1876. Baker-Miller Pink, a specific shade, has been studied for its calming physiological effects.",
    culturalBackgroundJa:
      "ピンクの文化的意味は何世紀にもわたり劇的に変化しました。18世紀ヨーロッパではピンクは男性的な色で、赤の淡い色として力強さを示していました。性別の関連付けは20世紀半ばのマーケティングで逆転しました。日本ではピンク（桃色）は桜の季節（花見）と深く結びつき、儚い美しさ（もののあわれ）を表します。インドのジャイプールは1876年にマハラジャがアルバート公を迎えるためにピンクに塗ったことから「ピンクシティ」と呼ばれます。ベーカーミラーピンクは鎮静の生理的効果が研究されています。",
  },
};

export const COLOR_FAMILY_PAGES = COLOR_FAMILIES.map((family) => FAMILY_PAGE_DATA[family]);

export function getFamilyPageData(family: ColorFamily) {
  return FAMILY_PAGE_DATA[family];
}

export function getFamilySlug(family: ColorFamily) {
  return FAMILY_PAGE_DATA[family].slug;
}

export function getFamilyBySlug(slug: string): ColorFamily | null {
  const match = COLOR_FAMILY_PAGES.find((entry) => entry.slug === slug);
  return match?.family ?? null;
}

export function getColorsForFamily(colors: readonly ColorRecord[], family: ColorFamily) {
  return sortColors(colors.filter((color) => color.family === family), "hue");
}

export function getCollectionsForFamily(
  collections: readonly ColorCollection[],
  family: ColorFamily,
) {
  return [...collections]
    .map((collection) => ({
      collection,
      matchingColors: collection.palette.filter((color) => color.family === family),
    }))
    .filter((entry) => entry.matchingColors.length > 0)
    .sort((left, right) => right.matchingColors.length - left.matchingColors.length);
}
