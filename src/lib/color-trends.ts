// Color Trends 2026 — Curated palette forecast based on design, fashion, and tech directions
// Each trend includes hex palettes, cultural context, and design guidance

export interface TrendColor {
  hex: string;
  name: string;
  role: string;
}

export type TrendCategory =
  | "fashion"
  | "interior"
  | "tech"
  | "branding"
  | "editorial"
  | "universal";

export interface ColorTrend {
  id: string;
  slug: string;
  name: string;
  nameZh: string;
  tagline: string;
  taglineZh: string;
  category: TrendCategory;
  heroHex: string;
  colors: TrendColor[];
  description: string;
  descriptionZh: string;
  context: string;
  contextZh: string;
  designGuidance: string;
  designGuidanceZh: string;
  industries: string[];
  relatedCollectionSlug?: string;
  tags: string[];
}

export const CATEGORY_LABELS: Record<TrendCategory, string> = {
  fashion: "Fashion",
  interior: "Interior",
  tech: "Tech & Digital",
  branding: "Branding",
  editorial: "Editorial",
  universal: "Universal",
};

export const CATEGORY_LABELS_ZH: Record<TrendCategory, string> = {
  fashion: "时尚",
  interior: "室内设计",
  tech: "科技与数字",
  branding: "品牌设计",
  editorial: "编辑设计",
  universal: "通用",
};

export const colorTrends2026: ColorTrend[] = [
  {
    id: "warm-earth-revival",
    slug: "warm-earth-revival",
    name: "Warm Earth Revival",
    nameZh: "暖土复兴",
    tagline: "Clay, sienna, and burnished terracotta as a grounding counterweight to digital abstraction.",
    taglineZh: "陶土、赭石与烧制红陶，作为对数字抽象的平衡与根植。",
    category: "universal",
    heroHex: "#B5622A",
    colors: [
      { hex: "#B5622A", name: "Fired Sienna", role: "Hero" },
      { hex: "#C8845A", name: "Warm Clay", role: "Mid" },
      { hex: "#E8C9A8", name: "Raw Sand", role: "Light" },
      { hex: "#7A3D1A", name: "Adobe Brown", role: "Dark" },
      { hex: "#D4956B", name: "Burnished Terracotta", role: "Accent" },
      { hex: "#F5E8D8", name: "Pale Linen", role: "Base" },
    ],
    description:
      "The pendulum swings back to handmade, material, and sun-baked. After years of cool minimalism and digital blue, 2026 sees warm earth tones reclaim ground across fashion runways, interior collections, and brand identities. These aren't the 1970s clay tones — they're refined, dusty, and contemporary.",
    descriptionZh:
      "钟摆摆回手工、材质与阳光烘烤的方向。在多年的冷调极简与数字蓝之后，2026年暖土色调在时尚秀场、室内系列和品牌形象中重新夺回席位。这不是70年代的陶土色调——它们更精炼、更沉静、更具当代感。",
    context:
      "Driven by a cultural appetite for analog warmth and sustainability, warm earth tones appear across ceramics, natural textiles, and skin-tone-inclusive beauty campaigns. The trend connects to slow living, artisan craft revival, and a rejection of the perfectly rendered digital palette.",
    contextZh:
      "受到人们对模拟温暖和可持续性的渴望驱动，暖土色调出现在陶瓷、天然纺织品和包容性美妆宣传中。这一趋势与慢生活、工匠复兴以及对完美数字调色板的排斥相连。",
    designGuidance:
      "Pair fired sienna with pale linen for editorial layouts. Use adobe brown as a headline color against sand backgrounds. Avoid adding too many saturated accents — let the earthiness breathe.",
    designGuidanceZh:
      "将烧制赭石与浅麻色搭配用于编辑排版。以深土棕作为标题色，搭配沙色背景。避免添加过多高饱和度点缀色——让土质感有空间呼吸。",
    industries: ["Fashion", "Beauty", "Home goods", "Ceramics", "Natural food brands"],
    relatedCollectionSlug: "sunbaked-clay-terracotta",
    tags: ["earthy", "warm", "terracotta", "sustainable", "artisan", "2026"],
  },
  {
    id: "digital-sage",
    slug: "digital-sage",
    name: "Digital Sage",
    nameZh: "数字鼠尾草",
    tagline: "Muted, intelligent green for brands navigating the AI and sustainability intersection.",
    taglineZh: "哑光智性绿，适用于在AI与可持续性交叉点上定位的品牌。",
    category: "tech",
    heroHex: "#7A9E7E",
    colors: [
      { hex: "#7A9E7E", name: "Digital Sage", role: "Hero" },
      { hex: "#5C8060", name: "Deep Sage", role: "Dark" },
      { hex: "#A8C5A0", name: "Pale Fern", role: "Light" },
      { hex: "#D8EAD5", name: "Soft Mint", role: "Base" },
      { hex: "#3D6B45", name: "Forest Floor", role: "Anchor" },
      { hex: "#B5D4AF", name: "Misted Leaf", role: "Mid" },
    ],
    description:
      "Technology brands are pivoting from sterile whites and electric blues to greens that communicate both intelligence and natural responsibility. Digital Sage is the sweet spot: not too pure to feel naive, not too gray to lose warmth. It reads as considered, calm, and forward-thinking.",
    descriptionZh:
      "科技品牌正从无菌白和电蓝转向传达智慧与自然责任感的绿色。数字鼠尾草是最佳平衡点：不太纯粹以免显得天真，不太灰以保留温暖感。它读起来深思熟虑、平静而具有前瞻性。",
    context:
      "AI companies, fintech, and B2B SaaS are adopting sage and muted greens to signal sustainability credentials and human-centered values. The trend accelerates as green becomes the default shorthand for 'responsible tech.'",
    contextZh:
      "AI公司、金融科技和B2B SaaS正在采用鼠尾草和哑光绿来传递可持续发展信誉和以人为中心的价值观。随着绿色成为\"负责任科技\"的默认简写，这一趋势加速发展。",
    designGuidance:
      "Use digital sage as a primary brand color against white or light warm gray. Pair with warm neutrals (oatmeal, stone) rather than cool grays to keep the palette from feeling clinical. Works well as a data visualization accent in dashboards.",
    designGuidanceZh:
      "以数字鼠尾草为主品牌色，搭配白色或浅暖灰。与暖中性色（燕麦色、石灰色）而非冷灰色搭配，避免调色板显得过于临床。在仪表板的数据可视化中作为点缀色效果良好。",
    industries: ["Tech", "AI", "Fintech", "B2B SaaS", "Sustainable brands"],
    relatedCollectionSlug: "botanical-foliage-study",
    tags: ["tech", "green", "sage", "AI", "sustainable", "2026"],
  },
  {
    id: "quiet-luxury-neutrals",
    slug: "quiet-luxury-neutrals",
    name: "Quiet Luxury Neutrals",
    nameZh: "静奢中性色",
    tagline: "The un-color statement: greige, stone, oat, and cashmere as the height of restraint.",
    taglineZh: "无色彩声明：灰米、石灰、燕麦与羊绒，是克制的极致。",
    category: "fashion",
    heroHex: "#C8B99A",
    colors: [
      { hex: "#C8B99A", name: "Cashmere Oat", role: "Hero" },
      { hex: "#E8E0D5", name: "Warm Alabaster", role: "Light" },
      { hex: "#A89880", name: "Stone", role: "Mid" },
      { hex: "#7A6E60", name: "Warm Slate", role: "Dark" },
      { hex: "#D8CCB8", name: "Greige", role: "Accent" },
      { hex: "#F5F0EB", name: "Cream Veil", role: "Base" },
    ],
    description:
      "Quiet luxury isn't fading — it's deepening. The 2026 version moves beyond minimal beige into a sophisticated palette of warm oat, aged parchment, and cashmere tones that feel genuinely expensive rather than simply neutral. The key is texture and subtlety over statement.",
    descriptionZh:
      "静奢不会消退——它在深化。2026年版本超越了极简米色，进入精致的暖燕麦、旧羊皮纸和羊绒色调，感觉真正昂贵而非仅仅是中性。关键是质感和微妙胜过声明。",
    context:
      "The backlash against conspicuous branding continues. Consumers — especially Gen Z and Millennial luxury buyers — are choosing brands that communicate quality through understatement. This palette is the visual equivalent of cashmere without a logo.",
    contextZh:
      "对炫耀性品牌的反弹持续存在。消费者——尤其是Z世代和千禧一代奢侈品买家——选择通过低调传达品质的品牌。这个调色板相当于没有logo的羊绒。",
    designGuidance:
      "Layer these tones with extreme subtlety — vary value by 5-10% between elements. Add texture through typography weight rather than color contrast. Use warm slate for body text and cashmere oat as the dominant background.",
    designGuidanceZh:
      "以极度微妙的方式叠加这些色调——元素间价值变化在5-10%之间。通过字体粗细而非色彩对比增加质感。以暖石板色作为正文，羊绒燕麦色作为主导背景。",
    industries: ["Fashion", "Luxury goods", "Hospitality", "High-end real estate", "Jewelry"],
    relatedCollectionSlug: "japandi-neutral-study",
    tags: ["luxury", "neutral", "quiet", "beige", "oat", "fashion", "2026"],
  },
  {
    id: "cobalt-confidence",
    slug: "cobalt-confidence",
    name: "Cobalt Confidence",
    nameZh: "钴蓝自信",
    tagline: "A bold, saturated blue that signals authority, clarity, and presence in a crowded market.",
    taglineZh: "一种大胆、饱和的蓝色，在拥挤的市场中传递权威、清晰与存在感。",
    category: "branding",
    heroHex: "#1B4FD8",
    colors: [
      { hex: "#1B4FD8", name: "Cobalt True", role: "Hero" },
      { hex: "#0F3AAA", name: "Deep Cobalt", role: "Dark" },
      { hex: "#4F7AE8", name: "Bright Cobalt", role: "Light" },
      { hex: "#C8D8FF", name: "Cobalt Tint", role: "Base" },
      { hex: "#E8EEFF", name: "Pale Sky", role: "Surface" },
      { hex: "#0A2580", name: "Midnight Blue", role: "Anchor" },
    ],
    description:
      "After years of muted, desaturated 'accessible' blues, cobalt is swinging back as a confident choice for brands that want to stand out. Not navy, not pastel — true cobalt occupies a bold, memorable middle ground that photographs well, holds up in print, and dominates digital screens.",
    descriptionZh:
      "在多年的哑光、去饱和\"易访问\"蓝之后，钴蓝作为希望脱颖而出的品牌的自信选择回归。不是海军蓝，不是粉彩——真正的钴蓝占据大胆、难忘的中间地带，拍照效果好，印刷持久，在数字屏幕上引人注目。",
    context:
      "Finance, legal, and B2B brands traditionally default to navy. In 2026, a new wave of direct-to-consumer and challenger brands use cobalt specifically to differentiate from this legacy palette — it says 'smart and modern' without the conservatism of traditional corporate blue.",
    contextZh:
      "金融、法律和B2B品牌传统上默认使用海军蓝。2026年，一波新的直销消费者和挑战者品牌专门使用钴蓝来区别于这种传统调色板——它说'聪明且现代'，不带传统企业蓝的保守主义。",
    designGuidance:
      "Use cobalt as the primary call-to-action color against white or pale sky backgrounds. The contrast is inherently strong. Pair with near-white type on cobalt backgrounds (not pure white — try cobalt tint at 90% opacity). Avoid adding warm accent colors; keep the system cool and focused.",
    designGuidanceZh:
      "以钴蓝为主要号召行动色，搭配白色或浅天空背景。对比本身就很强。在钴蓝背景上搭配接近白色的文字（不是纯白——尝试90%不透明度的钴蓝色调）。避免添加暖色调点缀色；保持系统冷调且专注。",
    industries: ["Fintech", "Legal", "B2B SaaS", "Healthcare", "Education"],
    relatedCollectionSlug: "midnight-jewel-tones",
    tags: ["blue", "cobalt", "bold", "branding", "corporate", "2026"],
  },
  {
    id: "neo-botanica",
    slug: "neo-botanica",
    name: "Neo-Botanica",
    nameZh: "新植物学",
    tagline: "Rich, complex greens that reference actual foliage — not the flattened greens of minimal design.",
    taglineZh: "丰富而复杂的绿色，参照真实植物——而非极简设计中被压平的绿色。",
    category: "interior",
    heroHex: "#2E6B3A",
    colors: [
      { hex: "#2E6B3A", name: "Deep Fern", role: "Hero" },
      { hex: "#4A8C5A", name: "Forest Moss", role: "Mid" },
      { hex: "#7AB88A", name: "Bright Leaf", role: "Light" },
      { hex: "#1A4525", name: "Midnight Canopy", role: "Dark" },
      { hex: "#C5DFB5", name: "New Growth", role: "Tint" },
      { hex: "#8FB87A", name: "Sunlit Foliage", role: "Accent" },
    ],
    description:
      "Biophilic design matures in 2026 into something more sophisticated than a plant wall. Neo-Botanica references the actual, varied greens of specific plants — the blue-green of succulents, the yellow-green of new ferns, the deep saturated green of tropical leaves — with botanical accuracy.",
    descriptionZh:
      "2026年生物亲和设计成熟为比植物墙更复杂的东西。新植物学参照特定植物的真实、多变的绿色——多肉植物的蓝绿色、新蕨类的黄绿色、热带叶片的深饱和绿——具有植物学精度。",
    context:
      "Interior designers are moving away from blanket 'earth tone' moodboards toward site-specific, species-aware plant palettes. In fashion, botanical print fabrics have shifted to using the actual pigment colors of the plants depicted rather than stylized versions.",
    contextZh:
      "室内设计师正在从笼统的\"大地色调\"情绪板转向针对特定地点、物种的植物调色板。时尚界中，植物印花面料已转向使用所描绘植物的实际色素颜色，而非风格化版本。",
    designGuidance:
      "Build a two-tone botanical palette: one deep anchor green and one lighter foliage tone. Add a pale yellow-green tint (new growth) for backgrounds and type areas. Avoid making greens too warm (yellow) or too cool (teal) — botanical greens tend toward slightly warm mid-greens.",
    designGuidanceZh:
      "构建双色植物调色板：一种深锚定绿和一种较浅的叶片色调。添加浅黄绿色调（新芽）用于背景和文字区域。避免使绿色过于温暖（偏黄）或过于冷调（偏青）——植物绿倾向于略暖的中绿色。",
    industries: ["Interior design", "Hospitality", "Fashion", "Food & beverage", "Wellness"],
    relatedCollectionSlug: "forest-dusk-palette",
    tags: ["green", "botanical", "nature", "interior", "biophilic", "2026"],
  },
  {
    id: "evolved-coral",
    slug: "evolved-coral",
    name: "Evolved Coral",
    nameZh: "进化珊瑚",
    tagline: "Coral grows up: complex, layered, and dimensional rather than the flat orange-pink of the late 2010s.",
    taglineZh: "珊瑚色成熟了：复杂、分层、立体，而非2010年代末的扁平橙粉。",
    category: "editorial",
    heroHex: "#E8735A",
    colors: [
      { hex: "#E8735A", name: "Evolved Coral", role: "Hero" },
      { hex: "#D45540", name: "Deep Coral", role: "Dark" },
      { hex: "#F5A08A", name: "Soft Coral", role: "Light" },
      { hex: "#FDD5C8", name: "Blush Coral", role: "Tint" },
      { hex: "#C84030", name: "Coral Ember", role: "Anchor" },
      { hex: "#FFE8E0", name: "Coral Veil", role: "Surface" },
    ],
    description:
      "The flat, digital coral of the late 2010s has evolved into something more complex — with deeper undertones, more variation, and a connection to natural pigments like crushed berries and sunset light. This evolved coral works in layered systems rather than as a single statement color.",
    descriptionZh:
      "2010年代末的扁平数字珊瑚色已演变为更复杂的东西——带有更深的底色调、更多变化，以及与天然色素（如压碎浆果和落日光线）的连接。这种进化的珊瑚色在分层系统中发挥作用，而非作为单一声明色。",
    context:
      "Beauty, fashion, and lifestyle brands rediscover coral after distancing themselves from the Pantone 2019 moment. The updated version reads as warmer and more analog — it suggests hand-mixed pigments rather than RGB output, which aligns with the broader craft-and-authenticity trend.",
    contextZh:
      "美妆、时尚和生活方式品牌在与2019年Pantone时刻保持距离后重新发现珊瑚色。更新版本读起来更温暖、更模拟——它暗示手调色素而非RGB输出，与更广泛的工艺与真实性趋势一致。",
    designGuidance:
      "Layer evolved coral with blush tints and deep coral for editorial depth. Pair with warm cream or aged white backgrounds rather than pure white, which can make the coral feel harsh. Works exceptionally well in print and packaging where the warmth reads as tactile.",
    designGuidanceZh:
      "将进化珊瑚与腮红色调和深珊瑚分层，以获得编辑深度。搭配温暖奶油或旧白背景，而非纯白（纯白会使珊瑚色显得刺眼）。在印刷和包装中效果极佳，温暖感在触感上传达良好。",
    industries: ["Beauty", "Fashion", "Food & beverage", "Lifestyle", "Travel"],
    relatedCollectionSlug: "golden-hour-warmth",
    tags: ["coral", "pink", "warm", "beauty", "editorial", "2026"],
  },
  {
    id: "midnight-plum",
    slug: "midnight-plum",
    name: "Midnight Plum",
    nameZh: "午夜李子",
    tagline: "Deep purple-burgundy for premium brands reclaiming depth, mystery, and aged luxury.",
    taglineZh: "深紫勃艮第，适用于重新诠释深度、神秘与陈年奢华的高端品牌。",
    category: "branding",
    heroHex: "#4A1840",
    colors: [
      { hex: "#4A1840", name: "Midnight Plum", role: "Hero" },
      { hex: "#6B2558", name: "Deep Mulberry", role: "Mid" },
      { hex: "#8B3D70", name: "Soft Plum", role: "Light" },
      { hex: "#2A0C25", name: "Plum Ink", role: "Dark" },
      { hex: "#C8A0B8", name: "Dusty Orchid", role: "Tint" },
      { hex: "#F0E0EC", name: "Plum Veil", role: "Surface" },
    ],
    description:
      "Purple reclaims its status as the color of premium in 2026, but not in the bright violet of previous cycles. Midnight Plum is dark, complex, and faintly red — it reads as aged wine, old velvet, and whispered secrets rather than the obvious luxury of gold or the corporate authority of navy.",
    descriptionZh:
      "2026年紫色重新夺回高端色彩的地位，但不是以往周期中明亮的紫罗兰。午夜李子深邃、复杂、略带红调——读起来像陈年葡萄酒、旧丝绒和低语的秘密，而非黄金的明显奢华或海军蓝的企业权威。",
    context:
      "Wine, spirits, beauty, and fashion brands are all exploring this deep plum register. It offers an alternative to overused black-and-gold luxury systems while still feeling genuinely premium. The color appears prominently in runway collections and premium spirits rebrands.",
    contextZh:
      "葡萄酒、烈酒、美妆和时尚品牌都在探索这种深李子色调。它提供了一种替代过度使用的黑金奢华系统的方式，同时仍感觉真正高端。这种颜色在秀场系列和高端烈酒重塑品牌中显著出现。",
    designGuidance:
      "Use midnight plum as a dark background color with dusty orchid or plum veil for type. Avoid harsh white against deep plum — opt for warm off-white or the dusty orchid tint. Gold works as a warm metallic accent but use sparingly to avoid trophy-room clichés.",
    designGuidanceZh:
      "以午夜李子作为深色背景，搭配尘桃或李子薄纱文字。避免纯白与深李子强烈对比——选择温暖的浅白或尘桃色调。黄金作为暖金属点缀色有效，但少用以避免奖杯室老套。",
    industries: ["Wine & spirits", "Luxury beauty", "Jewelry", "High fashion", "Premium hospitality"],
    relatedCollectionSlug: "midnight-jewel-tones",
    tags: ["purple", "plum", "luxury", "premium", "dark", "2026"],
  },
  {
    id: "warm-minimalism",
    slug: "warm-minimalism",
    name: "Warm Minimalism",
    nameZh: "暖调极简",
    tagline: "The correction to cold minimalism: cream, warm white, pale amber, and bone replace clinical gray-white.",
    taglineZh: "对冷调极简的修正：奶油、暖白、浅琥珀与骨白取代临床灰白。",
    category: "interior",
    heroHex: "#F2E8D8",
    colors: [
      { hex: "#F2E8D8", name: "Warm Cream", role: "Hero" },
      { hex: "#E8D8C0", name: "Aged Bone", role: "Mid" },
      { hex: "#D8C5A0", name: "Pale Amber", role: "Accent" },
      { hex: "#F8F4EE", name: "Warm White", role: "Light" },
      { hex: "#C8B090", name: "Stone Wheat", role: "Dark" },
      { hex: "#FDF9F4", name: "Near White", role: "Surface" },
    ],
    description:
      "Pure white minimalism is being replaced by warmer, more forgiving whites — cream, bone, warm gray-white, and pale amber. These near-neutrals have the cleanliness of minimalism without its clinical coldness. They photograph with warmth under natural light and feel more human-habitable.",
    descriptionZh:
      "纯白极简主义正被更温暖、更宽容的白色取代——奶油、骨白、暖灰白和浅琥珀。这些近中性色拥有极简主义的洁净感，却没有临床冷漠感。它们在自然光下拍照带有温暖感，感觉更适合人居住。",
    context:
      "The all-white interior aesthetic that dominated Instagram in the 2010s is being replaced by warmer tones in both editorial photography and actual interior design. Paint companies report significant growth in cream and warm neutral categories at the expense of pure whites.",
    contextZh:
      "主导2010年代Instagram的全白室内美学正在被编辑摄影和实际室内设计中的暖色调所取代。油漆公司报告奶油色和暖中性类别显著增长，而纯白类别下降。",
    designGuidance:
      "Replace pure white (#FFFFFF) with warm cream as your default background. Even a subtle warm shift (2000K warmer) transforms a layout from clinical to inviting. Use pale amber as a gentle highlight accent. Stone wheat works as a softer alternative to medium gray for dividers and captions.",
    designGuidanceZh:
      "以温暖奶油取代纯白（#FFFFFF）作为默认背景。即使是微妙的暖色偏移（偏暖2000K）也能将布局从临床感转变为亲切感。以浅琥珀作为轻柔的高光点缀色。石小麦色作为分隔线和说明文字的柔软灰色替代品。",
    industries: ["Interior design", "Architecture", "Web design", "Hospitality", "Photography"],
    relatedCollectionSlug: "japandi-neutral-study",
    tags: ["neutral", "warm", "minimal", "interior", "cream", "white", "2026"],
  },
];
