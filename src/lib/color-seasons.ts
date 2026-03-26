// Color Seasons — curated seasonal palettes for design and nature reference
// Covers the four classic seasons with 6 signature colors each,
// plus cultural context, design guidance, and natural associations.

export type SeasonId = "spring" | "summer" | "autumn" | "winter";

export type SeasonMood =
  | "Renewal"
  | "Warmth"
  | "Harvest"
  | "Clarity";

export interface SeasonColor {
  hex: string;
  name: string;
  role: string; // e.g. "Anchor", "Accent", "Background"
}

export interface ColorSeason {
  id: SeasonId;
  name: string;
  nameZh: string;
  months: string;
  mood: SeasonMood;
  tagline: string;
  taglineZh: string;
  description: string;
  descriptionZh: string;
  context: string;
  contextZh: string;
  designTips: string;
  designTipsZh: string;
  natureSources: string[];
  natureSourcesZh: string[];
  industryUses: string[];
  industryUsesZh: string[];
  colors: SeasonColor[];
  tags: string[];
  browseHref: string;
  gradientFrom: string;
  gradientTo: string;
}

export const MOOD_LABELS: Record<SeasonMood, string> = {
  Renewal: "Renewal",
  Warmth: "Warmth",
  Harvest: "Harvest",
  Clarity: "Clarity",
};

export const MOOD_LABELS_ZH: Record<SeasonMood, string> = {
  Renewal: "新生",
  Warmth: "温暖",
  Harvest: "丰收",
  Clarity: "清澈",
};

export const colorSeasons: ColorSeason[] = [
  {
    id: "spring",
    name: "Spring",
    nameZh: "春",
    months: "March · April · May",
    mood: "Renewal",
    tagline: "Fresh optimism in bloom",
    taglineZh: "盛开的清新乐观",
    description:
      "Spring palettes bloom from nature's reset — the pastel flush of cherry blossom, tender mint of new leaves, and the sunny warmth of early wildflowers. These are colors of possibility, optimism, and gentle energy. Nothing is fully saturated; everything is softened by morning light and the haze of new growth.",
    descriptionZh:
      "春季调色板从大自然的重置中绽放——樱花的淡雅粉红、新叶的嫩绿，以及早春野花的明媚温暖。这是充满可能性、乐观精神和温柔活力的色彩。一切都不完全饱和；一切都被晨光和新生的朦胧所柔化。",
    context:
      "Spring color signals psychological renewal across nearly every culture. In East Asia, cherry blossom season is a cultural event tied to renewal, transience, and collective celebration. In Western design, spring palettes power health and wellness brands, baby and parenting products, and the beauty industry's seasonal launches. The key to authentic spring color is restraint — high lightness with moderate saturation, never strident.",
    contextZh:
      "春季色彩在几乎每种文化中都标志着心理上的更新。在东亚，樱花季是与更新、短暂和集体庆祝相关的文化事件。在西方设计中，春季调色板为健康与养生品牌、婴儿和育儿产品以及美妆行业的季节性发布提供支持。正宗春季色彩的关键在于克制——高明度、适度饱和度，绝不刺眼。",
    designTips:
      "Use spring palettes for healthcare, beauty, baby products, and wellness brands. Layer soft pinks over ivory backgrounds for editorial elegance. Combine pale yellow with mint for a fresh, modern digital product feel. Avoid pairing too many pastels simultaneously — anchor the palette with one warm neutral.",
    designTipsZh:
      "将春季调色板用于医疗保健、美妆、婴儿产品和健康品牌。将柔和的粉色叠加在象牙色背景上，营造精致的编辑感。将淡黄色与薄荷色结合，呈现清新现代的数字产品感觉。避免同时搭配过多柔和色调——用一种暖中性色锚定调色板。",
    natureSources: [
      "Cherry blossom",
      "Lily of the valley",
      "New grass",
      "Forsythia",
      "Wisteria",
      "Morning sky",
    ],
    natureSourcesZh: [
      "樱花",
      "铃兰",
      "嫩草",
      "连翘",
      "紫藤",
      "晨空",
    ],
    industryUses: [
      "Health & wellness",
      "Beauty & skincare",
      "Children's brands",
      "Floral & lifestyle",
      "Spring fashion",
    ],
    industryUsesZh: [
      "健康与养生",
      "美妆护肤",
      "儿童品牌",
      "花艺与生活方式",
      "春季时装",
    ],
    colors: [
      { hex: "#F9C6C9", name: "Blossom Pink", role: "Anchor" },
      { hex: "#B8E4C5", name: "Tender Mint", role: "Support" },
      { hex: "#F7E8A4", name: "Forsythia Yellow", role: "Accent" },
      { hex: "#C9DCF0", name: "Morning Sky", role: "Background" },
      { hex: "#D4A9C7", name: "Wisteria Mist", role: "Depth" },
      { hex: "#F5F0E8", name: "Ivory Bloom", role: "Base" },
    ],
    tags: ["pastel", "soft", "light", "floral", "fresh", "optimistic"],
    browseHref: "/collections/",
    gradientFrom: "#F9C6C9",
    gradientTo: "#B8E4C5",
  },
  {
    id: "summer",
    name: "Summer",
    nameZh: "夏",
    months: "June · July · August",
    mood: "Warmth",
    tagline: "Bold sun, open water",
    taglineZh: "烈日与开阔水域",
    description:
      "Summer palettes carry maximum energy — the saturated coral of a sunset over water, the electric turquoise of shallow Caribbean sea, the vivid yellow of midday sun. Summer color is unapologetically confident. Saturation climbs, values pop, and contrast becomes the design language. These are the colors of celebration, outdoor living, and peak vitality.",
    descriptionZh:
      "夏季调色板携带最大能量——水面日落的饱和珊瑚色、加勒比浅海的电气蓝绿色、正午阳光的鲜艳黄色。夏季色彩毫不掩饰其自信。饱和度攀升，明度突出，对比度成为设计语言。这是庆典、户外生活和巅峰活力的色彩。",
    context:
      "Summer's vibrant palette dominates consumer marketing from May through September. FMCG, beverages, sportswear, and tourism brands lean heavily on these hues. The cultural association with vacation, freedom, and peak social activity makes summer palettes effective for engagement-focused digital products. The challenge is avoiding visual overload — successful summer design typically anchors the bright palette with generous white space or a single deep navy.",
    contextZh:
      "夏季鲜明的调色板在五月至九月间主导消费者营销。快速消费品、饮料、运动服和旅游品牌大量使用这些色调。与度假、自由和社交活动高峰期的文化关联，使夏季调色板对注重参与度的数字产品非常有效。挑战在于避免视觉过载——成功的夏季设计通常通过大量留白或单一深海军蓝来锚定明亮的调色板。",
    designTips:
      "Pair sunset coral with deep navy for high-contrast summer editorial. Use turquoise and white for clean, aspirational travel or lifestyle branding. Yellow anchors optimistic brand identities best at 60-70% saturation — fully pure yellow can read as cautionary. Summer palettes work well in dark mode too: vivid accents on dark backgrounds replicate evening-under-lights energy.",
    designTipsZh:
      "将日落珊瑚色与深海军蓝配对，打造高对比度的夏季编辑风格。使用蓝绿色和白色，营造干净、令人向往的旅行或生活方式品牌形象。黄色在60-70%饱和度时最能锚定乐观的品牌形象——完全纯正的黄色可能传达警告意味。夏季调色板在暗黑模式下同样效果出色：暗背景上的鲜艳强调色再现了灯光下的夜晚能量。",
    natureSources: [
      "Coral reef",
      "Sea glass",
      "Sunflower",
      "Ripe watermelon",
      "Open ocean",
      "Sand dune",
    ],
    natureSourcesZh: [
      "珊瑚礁",
      "海玻璃",
      "向日葵",
      "成熟西瓜",
      "开阔海洋",
      "沙丘",
    ],
    industryUses: [
      "Travel & tourism",
      "Sports & outdoor",
      "Food & beverage",
      "Festival events",
      "Youth brands",
    ],
    industryUsesZh: [
      "旅行与旅游",
      "运动与户外",
      "食品与饮料",
      "节日活动",
      "青年品牌",
    ],
    colors: [
      { hex: "#FF6B6B", name: "Sunset Coral", role: "Anchor" },
      { hex: "#4ECDC4", name: "Sea Glass Teal", role: "Support" },
      { hex: "#FFE66D", name: "Sol Yellow", role: "Accent" },
      { hex: "#1A535C", name: "Deep Lagoon", role: "Depth" },
      { hex: "#FF9F43", name: "Mango Pulse", role: "Warm Accent" },
      { hex: "#F7FFF7", name: "Sea Foam White", role: "Base" },
    ],
    tags: ["vibrant", "warm", "saturated", "bold", "energetic", "coastal"],
    browseHref: "/collections/",
    gradientFrom: "#FF6B6B",
    gradientTo: "#4ECDC4",
  },
  {
    id: "autumn",
    name: "Autumn",
    nameZh: "秋",
    months: "September · October · November",
    mood: "Harvest",
    tagline: "Earth, fire, and turning leaves",
    taglineZh: "大地、火焰与落叶",
    description:
      "Autumn palettes descend into the richest, most complex color of the year — the amber of maple canopy, the deep rust of dried hydrangea, the forest green that holds through October, and the burgundy of late harvest wine. These are colors of depth, maturity, and earned beauty. Saturation is medium-to-high, values are mid-to-dark, and every color feels like it has been seasoned by time.",
    descriptionZh:
      "秋季调色板沉浸在一年中最丰富、最复杂的色彩之中——枫树冠层的琥珀色、干燥绣球花的深锈色、贯穿整个十月的森林绿，以及晚秋葡萄酒的酒红色。这是深度、成熟和岁月沉淀之美的色彩。饱和度中到高，明度中到暗，每种颜色都感觉经过了时间的沉淀。",
    context:
      "Autumn is the dominant palette for luxury, heritage, and craft-adjacent brands. The warmth and richness of these hues signals quality, tradition, and handmade integrity — which is why you see them across artisan food, whiskey, leather goods, and premium home goods. Fall color campaigns drive the highest seasonal shopping engagement of the year, from September's fashion week to November's holiday warm-up.",
    contextZh:
      "秋季是奢侈品、传统品牌和工艺相关品牌的主导调色板。这些色调的温暖和丰富信号着质量、传统和手工完整性——这就是为什么你在工匠食品、威士忌、皮革制品和高级家居产品中看到它们的原因。秋季色彩活动驱动一年中最高的季节性购物参与度，从九月的时装周到十一月的节日预热。",
    designTips:
      "Burnt orange and forest green are the autumn anchor pair — they work across print, web, and packaging with extraordinary range. Burgundy elevates the palette toward premium; pair it with cream for a classic editorial combination. Avoid mixing too many warm tones without a cool anchor (deep green or dark slate). Autumn palettes photograph beautifully in natural light — ideal for product photography backgrounds.",
    designTipsZh:
      "烧橙色和森林绿是秋季的锚定对——它们在印刷、网络和包装中以非凡的范围发挥作用。酒红色将调色板提升至高端；将其与奶油色配对，打造经典的编辑组合。避免在没有冷色锚点（深绿色或深石板色）的情况下混合太多暖色调。秋季调色板在自然光下拍摄效果出色——非常适合产品摄影背景。",
    natureSources: [
      "Maple canopy",
      "Dried hydrangea",
      "Acorn cap",
      "Harvest pumpkin",
      "Late-harvest grape",
      "Forest floor",
    ],
    natureSourcesZh: [
      "枫树冠层",
      "干燥绣球花",
      "橡果帽",
      "丰收南瓜",
      "晚收葡萄",
      "森林地面",
    ],
    industryUses: [
      "Luxury & premium",
      "Food & hospitality",
      "Fashion & apparel",
      "Home & interior",
      "Artisan & craft",
    ],
    industryUsesZh: [
      "奢侈品与高端",
      "食品与餐饮",
      "时装与服饰",
      "家居与室内",
      "工匠与手工艺",
    ],
    colors: [
      { hex: "#C0392B", name: "Harvest Burgundy", role: "Anchor" },
      { hex: "#D35400", name: "Burnt Pumpkin", role: "Warm Lead" },
      { hex: "#E8B84B", name: "Amber Canopy", role: "Accent" },
      { hex: "#27684A", name: "October Forest", role: "Cool Anchor" },
      { hex: "#8E5C3A", name: "Aged Bark", role: "Depth" },
      { hex: "#F5E6D3", name: "Harvest Cream", role: "Base" },
    ],
    tags: ["warm", "rich", "earthy", "harvest", "rustic", "deep"],
    browseHref: "/collections/",
    gradientFrom: "#C0392B",
    gradientTo: "#27684A",
  },
  {
    id: "winter",
    name: "Winter",
    nameZh: "冬",
    months: "December · January · February",
    mood: "Clarity",
    tagline: "Crisp air, deep night, pure light",
    taglineZh: "清冽空气、深沉夜晚、纯净光线",
    description:
      "Winter palettes bifurcate into two distinct registers: the stark, crystalline clarity of snow and ice — white, pale silver, ice blue, frost violet — and the concentrated warmth of gathered firelight — deep crimson, forest pine, candlelight gold. Both share extreme value contrast. Winter is the season where pure black and pure white both finally make sense as anchors, and where bold, jewel-toned accents carry their full weight against dark backgrounds.",
    descriptionZh:
      "冬季调色板分为两个截然不同的层次：雪与冰的严酷、晶莹清澈——白色、淡银色、冰蓝色、霜紫色——以及聚集的火光所带来的浓缩温暖——深红色、松林绿、烛光金色。两者都具有极端的明度对比。冬季是纯黑色和纯白色作为锚点都最终有意义的季节，也是大胆宝石色调强调色在深色背景上充分彰显其分量的季节。",
    context:
      "Winter palettes dominate the year's highest-spend retail season. The holiday color system — crimson, forest green, gold — is one of the most commercially powerful palette combinations in existence. Beyond holiday, winter's ice palette drives luxury skincare, fragrance, and technology brands seeking to project cool precision and authority. Scandinavian design — often winter-influenced — has made the restrained white-and-pine palette an enduring global aesthetic.",
    contextZh:
      "冬季调色板主导一年中消费额最高的零售季节。节日色彩系统——深红色、森林绿、金色——是现存商业上最强大的调色板组合之一。除节日外，冬季的冰色调驱动奢侈品护肤、香水和科技品牌，以呈现冷静的精确性和权威性。受冬季影响的斯堪的纳维亚设计，已使克制的白色与松木调色板成为持久的全球美学。",
    designTips:
      "For holiday design, use the classic crimson-forest-gold triad but control proportions — 60% dark green, 30% cream or white, 10% crimson and gold. For ice-register winter, pair ice blue with near-white and add one metallic or cool silver accent. Deep navy serves as the bridge between both winter modes — it reads as both festive and premium. Winter is the only season where pure black backgrounds fully unlock the palette's potential.",
    designTipsZh:
      "对于节日设计，使用经典的深红色-森林绿-金色三色组合，但控制比例——60%深绿色，30%奶油色或白色，10%深红色和金色。对于冰色调冬季，将冰蓝色与近白色配对，并添加一种金属色或冷银色强调色。深海军蓝充当两种冬季模式之间的桥梁——它同时传达节日感和高端感。冬季是唯一一个纯黑色背景完全释放调色板潜力的季节。",
    natureSources: [
      "Fresh snow",
      "Frost crystal",
      "Evergreen pine",
      "Frozen lake",
      "Fireplace embers",
      "Northern lights",
    ],
    natureSourcesZh: [
      "新雪",
      "霜晶",
      "常青松树",
      "冰湖",
      "壁炉余烬",
      "北极光",
    ],
    industryUses: [
      "Holiday & gifting",
      "Luxury retail",
      "Skincare & fragrance",
      "Tech & precision",
      "Nordic lifestyle",
    ],
    industryUsesZh: [
      "节日与礼品",
      "奢侈品零售",
      "护肤与香水",
      "科技与精准",
      "北欧生活方式",
    ],
    colors: [
      { hex: "#1B3A6B", name: "Midnight Navy", role: "Anchor" },
      { hex: "#9E2A2B", name: "Crimson Ember", role: "Warm Lead" },
      { hex: "#C5D8F1", name: "Ice Glass", role: "Light" },
      { hex: "#2C6E49", name: "Evergreen Pine", role: "Natural Depth" },
      { hex: "#E8C97A", name: "Candlelight Gold", role: "Warm Accent" },
      { hex: "#F2F4F8", name: "First Snow", role: "Base" },
    ],
    tags: ["crisp", "jewel", "deep", "festive", "icy", "nocturnal"],
    browseHref: "/collections/",
    gradientFrom: "#1B3A6B",
    gradientTo: "#9E2A2B",
  },
];

// Season order for display
export const SEASON_ORDER: SeasonId[] = ["spring", "summer", "autumn", "winter"];
