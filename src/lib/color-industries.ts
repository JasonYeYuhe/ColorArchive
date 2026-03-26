// Color Palettes by Industry — curated industry-specific color references
// Covers 9 major design industries with 6 signature colors each,
// plus brand context, psychological rationale, and design guidance.

export type IndustryId =
  | "technology"
  | "food-restaurant"
  | "healthcare"
  | "fashion-luxury"
  | "nature-outdoor"
  | "finance-banking"
  | "education"
  | "beauty-cosmetics"
  | "architecture-interior";

export type IndustrySignal =
  | "Trust"
  | "Appetite"
  | "Calm"
  | "Prestige"
  | "Vitality"
  | "Authority"
  | "Clarity"
  | "Sensuality"
  | "Warmth";

export interface IndustryColor {
  hex: string;
  name: string;
  role: string;
}

export interface ColorIndustry {
  id: IndustryId;
  name: string;
  nameZh: string;
  signal: IndustrySignal;
  tagline: string;
  taglineZh: string;
  description: string;
  descriptionZh: string;
  context: string;
  contextZh: string;
  designTips: string;
  designTipsZh: string;
  keyBrands: string[];
  keyBrandsZh: string[];
  avoidColors: string[];
  avoidColorsZh: string[];
  colors: IndustryColor[];
  tags: string[];
  gradientFrom: string;
  gradientTo: string;
}

export const SIGNAL_LABELS: Record<IndustrySignal, string> = {
  Trust: "Trust",
  Appetite: "Appetite",
  Calm: "Calm",
  Prestige: "Prestige",
  Vitality: "Vitality",
  Authority: "Authority",
  Clarity: "Clarity",
  Sensuality: "Sensuality",
  Warmth: "Warmth",
};

export const SIGNAL_LABELS_ZH: Record<IndustrySignal, string> = {
  Trust: "信赖",
  Appetite: "食欲",
  Calm: "宁静",
  Prestige: "尊贵",
  Vitality: "活力",
  Authority: "权威",
  Clarity: "清晰",
  Sensuality: "感性",
  Warmth: "温暖",
};

export const colorIndustries: ColorIndustry[] = [
  {
    id: "technology",
    name: "Technology",
    nameZh: "科技",
    signal: "Trust",
    tagline: "Precision, intelligence, forward motion",
    taglineZh: "精准、智能、向前推进",
    description:
      "Technology palettes center on blue — the universal signal of trust, logic, and digital competence. From the deep midnight navy of enterprise software to the electric indigo of consumer apps, blue anchors the sector's visual identity. Accent grays, clean whites, and selective purple or teal moves complete the palette. These colors communicate that the product works, scales, and can be trusted with important data.",
    descriptionZh:
      "科技行业调色板以蓝色为核心——这是信任、逻辑与数字能力的通用信号。从企业软件的深沉午夜海军蓝，到消费级应用的电气靛蓝，蓝色锚定了整个行业的视觉标识。搭配强调灰色、纯净白色以及选择性的紫色或青蓝色，构成完整调色板。这些色彩传达产品稳定、可扩展、值得信赖的核心信息。",
    context:
      "Blue's dominance in technology is not accidental — cognitive research consistently finds blue associated with reliability and precision. IBM's 'Big Blue' identity, Facebook's foundational blue, and the near-ubiquitous blue in fintech and SaaS products all stem from this insight. The shift toward darker, more saturated blues in recent product design reflects the move toward dark mode and premium positioning. Electric indigo and violet entries signal AI and advanced capabilities, differentiating product lines within the same blue family.",
    contextZh:
      "蓝色在科技行业的主导地位并非偶然——认知研究一致发现蓝色与可靠性和精准度相关。IBM的'大蓝'品牌形象、Facebook的基础蓝以及金融科技和SaaS产品中近乎普遍的蓝色，均源于这一洞察。近年产品设计向更深、更饱和蓝色的转变，反映了暗黑模式和高端定位的趋势。电气靛蓝和紫罗兰色则代表AI和高级功能，在同一蓝色家族中区分产品线。",
    designTips:
      "Lead with deep navy as your brand anchor, then use a bright blue or indigo for interactive elements and CTAs. Reserve purple for AI-adjacent features — it reads as 'intelligent' and 'generative' in the current market. Neutral gray backgrounds prevent the palette from reading as cold; add warm off-whites where possible. Dark mode works exceptionally well for tech products: deep navy backgrounds with electric blue accents signal premium and focus.",
    designTipsZh:
      "以深海军蓝作为品牌锚点，用明亮蓝色或靛蓝色突出交互元素和行动按钮。将紫色保留给AI相关功能——在当前市场中，它传达'智能'和'生成式'的感觉。中性灰色背景可防止调色板显得冷漠；尽量添加温暖的米白色。暗黑模式对科技产品效果极佳：深海军蓝背景搭配电气蓝强调色，传达高端与专注感。",
    keyBrands: ["IBM", "Salesforce", "Meta", "Twitter/X", "LinkedIn", "Notion", "Linear"],
    keyBrandsZh: ["IBM", "Salesforce", "Meta", "Twitter/X", "领英", "Notion", "Linear"],
    avoidColors: ["Bright red (danger signal)", "Pure yellow (caution signal)", "Bright orange (too casual)"],
    avoidColorsZh: ["亮红色（危险信号）", "纯黄色（警告信号）", "鲜橙色（过于随意）"],
    colors: [
      { hex: "#0F2A4A", name: "Midnight Navy", role: "Anchor" },
      { hex: "#2563EB", name: "System Blue", role: "Interactive" },
      { hex: "#7C3AED", name: "Intelligence Violet", role: "AI Accent" },
      { hex: "#38BDF8", name: "Signal Cyan", role: "Highlight" },
      { hex: "#64748B", name: "Interface Gray", role: "Neutral" },
      { hex: "#F8FAFC", name: "Clean Canvas", role: "Base" },
    ],
    tags: ["blue", "digital", "trust", "clean", "precision", "innovation"],
    gradientFrom: "#0F2A4A",
    gradientTo: "#2563EB",
  },
  {
    id: "food-restaurant",
    name: "Food & Restaurant",
    nameZh: "餐饮美食",
    signal: "Appetite",
    tagline: "Warmth, energy, and the pleasure of eating",
    taglineZh: "温暖、活力与饮食之乐",
    description:
      "Food industry palettes are built on appetite psychology: reds and warm oranges stimulate hunger and urgency (fast food), while warm browns and earthy ambers signal craft, quality, and artisanal origin (specialty food). The green entry represents freshness, health, and farm-to-table positioning. These palettes are among the most extensively researched in branding — small color shifts directly affect appetite stimulation and perceived flavor.",
    descriptionZh:
      "餐饮行业调色板建立在食欲心理学基础上：红色和暖橙色刺激饥饿感与紧迫感（快餐），温暖的棕色和大地琥珀色则传达工艺、品质和工匠来源（精品食品）。绿色代表新鲜、健康和从农场到餐桌的定位。这些调色板是品牌研究中最深入的领域之一——微小的色彩变化直接影响食欲刺激和感知口味。",
    context:
      "Red triggers the fastest appetite response and creates urgency — McDonald's, KFC, and Pizza Hut all leverage this. Orange adds warmth and friendliness to red's urgency, making it the fast-casual sweet spot (Dunkin', In-N-Out). Warm brown and cream palettes signal hand-crafted quality and premium origin: Nespresso, Starbucks, and artisan coffee brands use this register. Green is the farm-to-table and health food signal, deployed by Whole Foods, Sweetgreen, and clean-eating brands.",
    contextZh:
      "红色触发最快的食欲反应并制造紧迫感——麦当劳、肯德基和必胜客都利用了这一点。橙色在红色的紧迫感中增添了温暖和友好，使其成为快休闲的最佳点（Dunkin'、In-N-Out）。温暖的棕色和奶油色调色板传达手工制作的品质和高端来源：雀巢咖啡、星巴克和手工咖啡品牌使用这种基调。绿色是农场到餐桌和健康食品的信号，被全食超市、Sweetgreen和清洁饮食品牌所采用。",
    designTips:
      "Choose red-orange for quick-service brands where speed and appetite stimulation are primary. Choose warm brown and cream for premium, artisan, or heritage food positioning. Never use blue as a dominant food color — it suppresses appetite (the only natural blue foods are blueberries, and even they read as purple). Photography lighting should lean warm; cool light photographs make food look unappetizing. Menu design benefits from generous white space between categories.",
    designTipsZh:
      "为快速服务品牌选择红橙色，这类品牌以速度和食欲刺激为主要目标。为高端、工匠或传统食品定位选择温暖的棕色和奶油色。永远不要将蓝色作为食品的主导色——它会抑制食欲（自然界中唯一的蓝色食物是蓝莓，而它们看起来甚至偏紫色）。摄影光线应偏暖；冷光照片会让食物看起来缺乏食欲。菜单设计在类别之间保留充足的留白效果更佳。",
    keyBrands: ["McDonald's", "Chipotle", "Nespresso", "Starbucks", "Eataly", "Le Creuset"],
    keyBrandsZh: ["麦当劳", "Chipotle", "雀巢咖啡", "星巴克", "Eataly", "Le Creuset"],
    avoidColors: ["Cool blue dominant (suppresses appetite)", "Gray-heavy neutral (clinical)"],
    avoidColorsZh: ["冷蓝色主导（抑制食欲）", "灰色为主的中性色（显得冷漠临床）"],
    colors: [
      { hex: "#C0392B", name: "Appetite Red", role: "Anchor" },
      { hex: "#E67E22", name: "Harvest Orange", role: "Energy" },
      { hex: "#F39C12", name: "Warm Amber", role: "Warmth" },
      { hex: "#6B4226", name: "Roasted Brown", role: "Craft" },
      { hex: "#27AE60", name: "Garden Green", role: "Freshness" },
      { hex: "#FDF6EC", name: "Cream White", role: "Base" },
    ],
    tags: ["warm", "appetite", "earthy", "inviting", "energetic", "craft"],
    gradientFrom: "#C0392B",
    gradientTo: "#E67E22",
  },
  {
    id: "healthcare",
    name: "Healthcare & Medical",
    nameZh: "医疗健康",
    signal: "Calm",
    tagline: "Clean, trusted, quietly competent",
    taglineZh: "干净、可信、沉稳专业",
    description:
      "Healthcare palettes prioritize psychological safety above all else. Clean teal and medical blue signal clinical competence and sterility — environments where precision matters. Soft sage and mint add warmth that hospitals have historically lacked, increasingly deployed by wellness brands, telehealth, and mental health apps to differentiate from cold clinical aesthetics. Pure white creates the clarity of a clean slate. Every color in this palette says: this environment is controlled, clean, and safe.",
    descriptionZh:
      "医疗健康调色板首要考虑心理安全感。干净的青绿色和医疗蓝传达临床能力与无菌感——这是精准至关重要的环境。柔和的鼠尾草绿和薄荷绿增添了医院历来缺乏的温暖感，越来越多地被健康品牌、远程医疗和心理健康应用采用，以区别于冷漠的临床美学。纯白色营造干净空白的清晰感。调色板中的每种颜色都在传达：这个环境受控、干净且安全。",
    context:
      "The medical blue-white combination dates to surgical gowns and hospital environments designed to signal sterility and precision. As digital health has grown, the palette has evolved: telehealth brands like Teladoc use softer blues and greens to reduce anxiety, while mental health apps (Headspace, Calm) have moved toward sage greens and warm neutrals to signal psychological safety rather than clinical detachment. The trend is toward 'clinical warmth' — competent without being cold.",
    contextZh:
      "医疗蓝白组合可追溯至旨在传达无菌感和精准度的手术服和医院环境。随着数字医疗的发展，调色板也在演变：Teladoc等远程医疗品牌使用更柔和的蓝色和绿色来减少焦虑，而Headspace、Calm等心理健康应用则转向鼠尾草绿和暖中性色，传达心理安全感而非临床疏离感。趋势是走向'临床温暖'——专业但不冷漠。",
    designTips:
      "Avoid the all-white sterile look for consumer-facing health products — add sage or warm ivory to soften the environment. Use teal as your primary interactive color instead of a cold medical blue when targeting wellness rather than acute care. Reserve pure clinical blue for contexts where authority and precision are the primary value proposition (diagnostic tools, surgical platforms). Add plant imagery and organic textures to ground the digital palette in warmth.",
    designTipsZh:
      "对于面向消费者的健康产品，避免全白无菌风格——添加鼠尾草绿或温暖象牙色来柔化环境。在针对健康而非急救护理时，使用青绿色而非冷漠的医疗蓝作为主要交互色。将纯临床蓝保留给权威性和精准度是主要价值主张的场景（诊断工具、手术平台）。添加植物图像和有机纹理，使数字调色板扎根于温暖感。",
    keyBrands: ["Kaiser Permanente", "Headspace", "Calm", "One Medical", "Teladoc", "Mayo Clinic"],
    keyBrandsZh: ["Kaiser Permanente", "Headspace", "Calm", "One Medical", "Teladoc", "梅奥诊所"],
    avoidColors: ["Bright red outside of emergency contexts", "Deep purple or black (anxiety-inducing in medical)"],
    avoidColorsZh: ["急救场景外的亮红色", "深紫色或黑色（在医疗中引发焦虑）"],
    colors: [
      { hex: "#0D7377", name: "Clinical Teal", role: "Anchor" },
      { hex: "#14A0A6", name: "Medical Aqua", role: "Interactive" },
      { hex: "#6EBF8B", name: "Wellness Sage", role: "Warmth" },
      { hex: "#A8D8EA", name: "Trust Blue Mist", role: "Support" },
      { hex: "#E8F4F8", name: "Sterile Light", role: "Background" },
      { hex: "#FFFFFF", name: "Clinical White", role: "Base" },
    ],
    tags: ["clean", "calm", "trust", "clinical", "wellness", "safe"],
    gradientFrom: "#0D7377",
    gradientTo: "#6EBF8B",
  },
  {
    id: "fashion-luxury",
    name: "Fashion & Luxury",
    nameZh: "时尚与奢侈品",
    signal: "Prestige",
    tagline: "Restraint as the ultimate signal of taste",
    taglineZh: "克制是品味的终极信号",
    description:
      "Luxury palettes speak through what they omit. The dominant register is near-neutral: near-black, ivory, deep champagne, and pale sand. Into this restrained field, one or two accent colors are deployed with surgical precision — a deep burgundy, a midnight forest green, or a cold cobalt that reads as heritage and confidence. Pure white is often avoided in favor of warm ivory; pure black replaces navy. The total impression is: effortless, edited, and above trend.",
    descriptionZh:
      "奢侈品调色板通过省略来表达。主要基调是近中性色：近黑、象牙白、深香槟色和浅沙色。在这个克制的领域中，以外科手术般的精准部署一两种强调色——深酒红色、午夜森林绿或冷钴蓝，传达传承与自信感。通常避免纯白而倾向温暖象牙色；纯黑色取代海军蓝。总体印象是：毫不费力、精致编辑，超越流行趋势。",
    context:
      "The luxury color code has remained remarkably stable across decades because it resists trend. Chanel's black-and-white-and-gold, Hermès's saffron orange, Louis Vuitton's warm tan — these are among the most protected brand identities in the world. The key insight is that luxury communicates through reduction: the fewer colors used, and the more precisely they're deployed, the more premium the signal. Democratized brands use color abundantly; exclusive brands use it sparingly.",
    contextZh:
      "奢侈品的色彩语法几十年来保持了非凡的稳定性，因为它抵制流行趋势。香奈儿的黑白金，爱马仕的藏红花橙，路易威登的温暖棕褐色——这些是世界上保护最严密的品牌形象之一。核心洞察是奢侈品通过减法来传达：使用的颜色越少、部署越精准，品质信号就越强。民主化品牌丰富使用色彩；独家品牌则吝惜使用。",
    designTips:
      "Use black and ivory as the foundational pairing — they work across all luxury categories. Reserve gold or champagne for hover states, accents, and premium tier indicators (not backgrounds). Typography weight and white space carry more visual weight in luxury design than color — invest there first. Never use gradients as a luxury signal; flat color and texture are the premium registers. If you use photography, ensure it uses consistent warm-neutral color grading.",
    designTipsZh:
      "以黑色和象牙色作为基础配对——适用于所有奢侈品类别。将金色或香槟色保留给悬停状态、强调色和高端等级指示器（不用作背景）。在奢侈品设计中，字体粗细和留白比色彩承载更多视觉分量——优先投入那里。永远不要将渐变用于奢侈品信号；纯色和纹理才是高端基调。如果使用摄影，确保使用一致的暖中性色调。",
    keyBrands: ["Chanel", "Hermès", "Louis Vuitton", "Bottega Veneta", "The Row", "Jil Sander"],
    keyBrandsZh: ["香奈儿", "爱马仕", "路易威登", "葆蝶家", "The Row", "吉尔·桑达"],
    avoidColors: ["Bright primary colors (too accessible)", "Neon or saturated hues (youth/budget signal)"],
    avoidColorsZh: ["明亮原色（过于大众化）", "霓虹或高饱和色调（年轻/低端信号）"],
    colors: [
      { hex: "#1A1A1A", name: "Absolute Black", role: "Anchor" },
      { hex: "#F5F0E8", name: "Warm Ivory", role: "Base" },
      { hex: "#C9A96E", name: "Deep Champagne", role: "Accent" },
      { hex: "#4A1942", name: "Heritage Plum", role: "Depth" },
      { hex: "#8B7355", name: "Aged Sand", role: "Neutral" },
      { hex: "#2C3E2D", name: "Prestige Forest", role: "Cold Anchor" },
    ],
    tags: ["black", "ivory", "gold", "restrained", "elegant", "heritage"],
    gradientFrom: "#1A1A1A",
    gradientTo: "#C9A96E",
  },
  {
    id: "nature-outdoor",
    name: "Nature & Outdoor",
    nameZh: "自然与户外",
    signal: "Vitality",
    tagline: "Built for terrain, proven by elements",
    taglineZh: "为地形而生，经元素检验",
    description:
      "Outdoor and nature palettes draw from the physical world they serve: forest greens, earthy siennas, clay oranges, and storm grays. This is a palette grounded in materiality — it references bark, soil, lichen, and water rather than manufactured hues. The emotional register is confidence, physical capability, and environmental respect. These palettes must work in context: on a Gore-Tex jacket at a trailhead, on a field tent in rain, on an app screen in bright daylight.",
    descriptionZh:
      "户外与自然调色板取自它们所服务的物质世界：森林绿、大地赭色、粘土橙和风暴灰。这是一个扎根于物质性的调色板——它参照树皮、土壤、地衣和水，而非人工色调。情感基调是自信、体能与环境尊重。这些调色板必须在实际场景中发挥作用：在登山口的Gore-Tex夹克上、在雨中的野外帐篷上、在强烈日光下的应用屏幕上。",
    context:
      "The outdoor industry has moved away from the fluorescent yellows and greens of 1980s adventure gear toward increasingly sophisticated earth and forest palettes. Patagonia's commitment to earthy, subdued tones signals environmental consciousness. Arc'teryx uses storm gray and black to signal technical performance. REI and Outdoor Voices have shifted toward softer, more accessible earth tones to broaden the category's appeal beyond hardcore athletes. The color story has increasingly aligned with conservation values.",
    contextZh:
      "户外行业已从1980年代探险装备的荧光黄绿色，转向越来越复杂的大地和森林调色板。巴塔哥尼亚对大地、柔和色调的坚持传达了环保意识。始祖鸟使用风暴灰和黑色传达技术性能。REI和Outdoor Voices转向更柔和、更易接受的大地色调，以将这一品类的吸引力扩展到铁杆运动员之外。色彩叙事越来越与环保价值观保持一致。",
    designTips:
      "Anchor outdoor palettes with a deep forest green — it reads as both natural and high-performance. Use storm gray for secondary elements; it photographs well in field conditions and works across dark and light modes. Orange acts as the safety/visibility accent that also signals energy and adventure — use it for CTAs and accent touches, not backgrounds. Earth tones are remarkably durable across print, digital, and product applications. Texture and grain photography complement the palette's authenticity.",
    designTipsZh:
      "以深森林绿为户外调色板的锚点——它同时传达自然感和高性能感。将风暴灰用于次要元素；它在野外环境下拍摄效果好，适用于暗黑和明亮两种模式。橙色作为安全/可见性强调色，同时传达能量和冒险——用于行动按钮和强调触点，不用作背景。大地色调在印刷、数字和产品应用中持久性极强。纹理和颗粒感摄影与调色板的真实性相得益彰。",
    keyBrands: ["Patagonia", "Arc'teryx", "REI", "The North Face", "Salomon", "Merrell"],
    keyBrandsZh: ["巴塔哥尼亚", "始祖鸟", "REI", "北面", "萨洛蒙", "迈乐"],
    avoidColors: ["Bright neon colors (reads as synthetic)", "Glossy metallics (anti-nature signal)"],
    avoidColorsZh: ["明亮霓虹色（显得人工合成）", "光泽金属色（反自然信号）"],
    colors: [
      { hex: "#2D5016", name: "Deep Forest", role: "Anchor" },
      { hex: "#8B6914", name: "Trail Sienna", role: "Earth" },
      { hex: "#D4622A", name: "Clay Orange", role: "Energy" },
      { hex: "#607B63", name: "Lichen Gray", role: "Neutral" },
      { hex: "#4A5E4C", name: "Moss Stone", role: "Depth" },
      { hex: "#F2EDE3", name: "Chalk Base", role: "Base" },
    ],
    tags: ["green", "earth", "natural", "rugged", "sustainable", "outdoor"],
    gradientFrom: "#2D5016",
    gradientTo: "#D4622A",
  },
  {
    id: "finance-banking",
    name: "Finance & Banking",
    nameZh: "金融与银行",
    signal: "Authority",
    tagline: "Stability, wealth, and institutional trust",
    taglineZh: "稳定、财富与机构信赖",
    description:
      "Financial palettes are built on conservative authority: deep navy, dark green, burgundy, and restrained gold. These are the colors of institutions that have weathered economic cycles — JPMorgan's navy, Goldman Sachs' blue-gray, Morgan Stanley's dark green. The palette signals longevity, seriousness, and capital preservation. Fintech challengers have introduced cleaner versions of this vocabulary — brighter blues, white space, geometric precision — but the underlying authority signals remain the same.",
    descriptionZh:
      "金融调色板建立在保守权威上：深海军蓝、深绿色、酒红色和克制的金色。这些是经历过经济周期的机构色彩——摩根大通的海军蓝、高盛的蓝灰色、摩根士丹利的深绿色。调色板传达长久性、严肃感和资产保值。金融科技挑战者引入了更简洁版本的这一词汇——更明亮的蓝色、留白和几何精准感——但底层的权威信号保持不变。",
    context:
      "The financial palette codex was established in the 19th century through banking architecture: marble, dark wood, brass, and green banker's lamps. These material references persist in digital form. The 2010s fintech wave (Stripe, Square, Robinhood) briefly introduced lighter, more accessible palettes — bright greens, white interfaces — but the 2022 market correction caused many to revert toward more conservative, institutional signals. Wealth management and private banking have always stayed firmly in the dark navy/forest green/champagne register.",
    contextZh:
      "金融调色板准则在19世纪通过银行建筑建立：大理石、深色木材、黄铜和绿色银行家台灯。这些材质参照以数字形式延续。2010年代金融科技浪潮（Stripe、Square、Robinhood）短暂引入了更明亮、更易接受的调色板——明亮绿色、白色界面——但2022年的市场调整使许多品牌回归更保守、更机构化的信号。财富管理和私人银行业务始终坚定地保持在深海军蓝/森林绿/香槟色领域。",
    designTips:
      "Lead with dark navy for institutional banking; pivot to medium navy or steel blue for fintech accessibility. Gold works as an accent for premium tiers (private banking, wealth management) but must never read as cheap — use deep champagne rather than bright yellow-gold. Green signals wealth growth — use it as a secondary accent for positive performance indicators. Keep typography heavy and serif for traditional banking; switch to clean sans-serif for fintech.",
    designTipsZh:
      "机构银行业以深海军蓝为主；金融科技则转向中等海军蓝或钢蓝以提升可及性。金色作为高端层级的强调色（私人银行、财富管理），但绝不能显得廉价——使用深香槟色而非明亮黄金色。绿色象征财富增长——将其用作正面表现指标的次要强调色。传统银行业保持厚重的衬线字体；金融科技则切换到干净的无衬线字体。",
    keyBrands: ["JPMorgan", "Goldman Sachs", "Vanguard", "Fidelity", "Stripe", "Schwab"],
    keyBrandsZh: ["摩根大通", "高盛", "先锋", "富达", "Stripe", "嘉信理财"],
    avoidColors: ["Bright or neon colors (frivolous)", "Warm orange or red dominant (high-risk signal)"],
    avoidColorsZh: ["明亮或霓虹色（轻浮）", "以暖橙色或红色为主（高风险信号）"],
    colors: [
      { hex: "#0B1F3A", name: "Institutional Navy", role: "Anchor" },
      { hex: "#1A3A2F", name: "Wealth Forest", role: "Growth" },
      { hex: "#8B2335", name: "Reserve Burgundy", role: "Heritage" },
      { hex: "#B8960C", name: "Capital Gold", role: "Premium" },
      { hex: "#5A6478", name: "Portfolio Gray", role: "Neutral" },
      { hex: "#F5F5F0", name: "Ledger White", role: "Base" },
    ],
    tags: ["navy", "authority", "wealth", "conservative", "premium", "institutional"],
    gradientFrom: "#0B1F3A",
    gradientTo: "#1A3A2F",
  },
  {
    id: "education",
    name: "Education & Learning",
    nameZh: "教育与学习",
    signal: "Clarity",
    tagline: "Knowledge made bright, progress made visible",
    taglineZh: "知识因此明亮，进步因此可见",
    description:
      "Education palettes balance clarity and warmth. The dominant color is blue — signaling trust and cognitive engagement — combined with warm yellow that signals optimism, attention, and the joy of discovery. Green anchors growth and progress. For digital learning platforms, these palettes must function across age ranges: softer and rounder for K-8, more sophisticated and geometric for higher education and professional development. Accessibility contrast ratios are non-negotiable in educational design.",
    descriptionZh:
      "教育调色板平衡清晰度和温暖感。主导色是蓝色——传达信任和认知投入——结合温暖的黄色，象征乐观、注意力和发现的喜悦。绿色锚定成长与进步。对于数字学习平台，这些调色板必须适用于不同年龄段：K-8阶段更柔和圆润，高等教育和职业发展阶段则更精致几何。在教育设计中，无障碍对比度要求是不可妥协的。",
    context:
      "Educational color theory distinguishes between ages and subjects. Primary colors (red, blue, yellow) dominate early childhood for their recognizability and contrast. As learners age, palettes sophisticate: university branding typically favors deep blues, forest greens, or burgundy — colors that signal academic authority. EdTech platforms (Khan Academy's teal-green, Duolingo's lime green, Coursera's navy) have each carved distinct identities within the trust-and-engagement palette space.",
    contextZh:
      "教育色彩理论区分年龄和学科。原色（红、蓝、黄）因其可识别性和对比度在幼儿教育中占主导地位。随着学习者年龄增长，调色板更加精致：大学品牌通常倾向于深蓝色、森林绿或酒红色——传达学术权威的色彩。EdTech平台（可汗学院的青绿色、多邻国的青柠绿、Coursera的海军蓝）各自在信任与参与调色板空间中开辟了独特的品牌形象。",
    designTips:
      "Ensure minimum 4.5:1 contrast ratio for all text — educational contexts must be fully accessible. Use yellow as a highlight for key concepts, not as a text color (contrast fails on white). Progress indicators and achievement systems benefit enormously from green — it signals completion and growth intuitively. For higher education, reduce yellow and increase navy/forest green to signal academic weight. Segment age-appropriate palettes: round, soft shapes + primary colors for young learners; geometric, refined shapes + sophisticated hues for adults.",
    designTipsZh:
      "确保所有文本的最低对比度为4.5:1——教育环境必须完全无障碍。将黄色用于关键概念的高亮，而非文本色（白色背景上对比度不足）。进度指示器和成就系统极大受益于绿色——它直觉性地传达完成感和成长感。对于高等教育，减少黄色，增加海军蓝/森林绿以传达学术分量。针对年龄适当的调色板分层：圆润柔和的形状+原色适合小学习者；几何精致的形状+复杂色调适合成人。",
    keyBrands: ["Khan Academy", "Duolingo", "Coursera", "Pearson", "Chegg", "Quizlet"],
    keyBrandsZh: ["可汗学院", "多邻国", "Coursera", "培生", "Chegg", "Quizlet"],
    avoidColors: ["Dark or moody backgrounds for primary/K-8", "High-chroma red (anxiety in testing contexts)"],
    avoidColorsZh: ["K-8教育的深色或沉郁背景", "高饱和红色（在考试场景中引发焦虑）"],
    colors: [
      { hex: "#1565C0", name: "Knowledge Blue", role: "Anchor" },
      { hex: "#F9A825", name: "Discovery Yellow", role: "Attention" },
      { hex: "#2E7D32", name: "Growth Green", role: "Progress" },
      { hex: "#0097A7", name: "Focus Teal", role: "Support" },
      { hex: "#E8F5E9", name: "Learning Mint", role: "Background" },
      { hex: "#FAFAFA", name: "Clean Slate", role: "Base" },
    ],
    tags: ["blue", "yellow", "green", "clear", "accessible", "optimistic"],
    gradientFrom: "#1565C0",
    gradientTo: "#F9A825",
  },
  {
    id: "beauty-cosmetics",
    name: "Beauty & Cosmetics",
    nameZh: "美妆与化妆品",
    signal: "Sensuality",
    tagline: "Allure in restraint, depth in detail",
    taglineZh: "克制中的魅力，细节中的深度",
    description:
      "Beauty palettes span the widest range in commercial design — from the ultra-minimal white-and-chrome of clinical skincare to the maximalist, jewel-saturated world of color cosmetics. The connective tissue is tactility: colors that look touchable, pigmented, and sensory. Rose, mauve, deep plum, and pearl are the classic feminine register. The gender-neutral and men's grooming explosion has introduced charcoal, forest green, and industrial navy into the category. Packaging color strategy is the primary purchase trigger in beauty.",
    descriptionZh:
      "美妆调色板在商业设计中跨越最广泛的范围——从临床护肤的超简约白色与金属色，到彩妆领域的最大化、宝石饱和感。连接纽带是触感性：看起来可触摸、色素丰富、充满感官感的色彩。玫瑰色、淡紫色、深李子色和珍珠色构成经典的女性基调。无性别美容和男性护肤的爆发，将木炭色、森林绿和工业海军蓝引入这一品类。包装色彩策略是美容品的首要购买触发器。",
    context:
      "Beauty color trends are driven by the runway, social media, and cultural moments in ways that no other industry matches. Millennial Pink (2016-2019) transformed the category before the rise of genderfluid aesthetics in 2020+. Clean beauty has introduced sage green and beige-forward neutrals as sustainability signals. K-Beauty's influence has brought glassy, translucent color expressions — think sheer rose and luminous pearl. The current moment balances two poles: ultra-minimal and ultra-saturated.",
    contextZh:
      "美妆色彩趋势由T台、社交媒体和文化时刻驱动，其程度在其他任何行业都无法比拟。千禧粉（2016-2019年）在2020年以后无性别美学兴起之前改变了整个品类。清洁美容引入了鼠尾草绿和米色为主的中性色作为可持续发展信号。韩妆的影响带来了透明、半透明的色彩表达——想象一下透明玫瑰色和光泽珍珠色。当前时刻平衡着两个极端：超简约和超饱和。",
    designTips:
      "For luxury skincare, lead with white or ivory and a single premium accent (gold, rose gold, or champagne). For mass cosmetics, embrace the full vibrant palette — no restriction necessary. Rose gold is nearing saturation as a cue in beauty; consider platinum, silver, or iridescent alternatives. Matte black packaging reads as masculine/gender-neutral; glossy rose reads as traditionally feminine. For digital beauty (apps, AR try-on), dark mode dramatically improves color swatch visibility and creates a more luxurious atmosphere.",
    designTipsZh:
      "对于奢华护肤品，以白色或象牙色为主，加一种高端强调色（金色、玫瑰金或香槟色）。对于大众彩妆，拥抱完整的鲜艳调色板——无需限制。玫瑰金作为美妆信号已接近饱和；考虑铂金、银色或虹彩替代品。哑光黑色包装传达男性感/无性别感；光泽玫瑰色传达传统女性感。对于数字美妆（应用、AR试妆），暗黑模式极大提升色彩色板可见度，创造更奢华的氛围。",
    keyBrands: ["Charlotte Tilbury", "Glossier", "Fenty Beauty", "NARS", "La Mer", "Tatcha"],
    keyBrandsZh: ["夏洛特·蒂尔伯里", "Glossier", "Fenty Beauty", "NARS", "海蓝之谜", "匠心"],
    avoidColors: ["Harsh primary colors in skincare (anti-luxury)", "Clinical medical blue (wrong category signal)"],
    avoidColorsZh: ["护肤品中的刺眼原色（反奢华）", "临床医疗蓝（错误品类信号）"],
    colors: [
      { hex: "#9B4F6C", name: "Velvet Rose", role: "Anchor" },
      { hex: "#E8B4C8", name: "Blush Petal", role: "Light" },
      { hex: "#5C2D5B", name: "Deep Plum", role: "Depth" },
      { hex: "#D4A574", name: "Rose Gold", role: "Metallic" },
      { hex: "#C9A8B8", name: "Mauve Silk", role: "Neutral" },
      { hex: "#FDF8F5", name: "Pearl Base", role: "Base" },
    ],
    tags: ["rose", "plum", "gold", "sensory", "feminine", "pigmented"],
    gradientFrom: "#9B4F6C",
    gradientTo: "#E8B4C8",
  },
  {
    id: "architecture-interior",
    name: "Architecture & Interior",
    nameZh: "建筑与室内设计",
    signal: "Warmth",
    tagline: "Materials made visible, space made habitable",
    taglineZh: "材料呈现可见，空间成为家园",
    description:
      "Architecture and interior design palettes are material palettes: warm linen, aged concrete, terracotta clay, forest oak, and stone gray. These are the colors of texture — surfaces you would want to touch. The palette's range spans from the Swedish minimalist neutrals (white, birch, linen) to the Mediterranean warmth of Moroccan plaster and Spanish terracotta. What unites them is honesty about material — the color says 'this is what this surface is made of,' not 'this is a digital representation of a surface.'",
    descriptionZh:
      "建筑与室内设计调色板是材质调色板：温暖的亚麻色、沉淀的混凝土色、赤陶粘土、森林橡木和石灰岩灰。这些是纹理的色彩——你会想要触摸的表面。调色板范围从瑞典简约主义的中性色（白色、桦木、亚麻）到摩洛哥灰泥和西班牙赤陶的地中海温暖感。将它们统一起来的是对材料的诚实——色彩在说'这就是这个表面的构成'，而非'这是表面的数字呈现'。",
    context:
      "The interior design palette has undergone significant evolution from the white-on-white minimalism of 2015-2020 toward warmer, more characterful materials. Terracotta emerged as the defining color of 2019-2022, signaling a return to handmade, imperfect, and organic aesthetics. Limewash walls, exposed concrete, and natural wood have become the dominant material expressions of contemporary luxury residential design. The color vocabulary has shifted from 'clean and simple' to 'warm and considered.'",
    contextZh:
      "室内设计调色板已经历显著演变，从2015-2020年的白色极简主义，转向更温暖、更有个性的材质。赤陶色作为2019-2022年的定义色出现，标志着对手工制作、不完美和有机美学的回归。石灰水墙、裸露混凝土和天然木材已成为当代奢华住宅设计的主要材质表达。色彩词汇从'干净简约'转变为'温暖考究'。",
    designTips:
      "Start every interior color scheme from the material anchor: what's the primary surface (concrete, wood, plaster, stone)? Build the palette outward from that material's natural color. Warm whites (with slight yellow or pink undertone) consistently photograph and live better than pure cool white in residential settings. Terracotta is versatile — it grounds schemes from deep burgundy to sage green. Use deep stone gray as the masculine-neutral alternative to navy. Never use bright colors on large architectural surfaces — they overwhelm.",
    designTipsZh:
      "从材质锚点开始每个室内配色方案：主要表面是什么（混凝土、木材、灰泥、石材）？从该材质的自然色向外构建调色板。温暖的白色（带轻微黄色或粉色底调）在住宅环境中的拍摄和生活效果始终优于纯冷白色。赤陶色用途广泛——它能与从深酒红到鼠尾草绿的各种配色方案融合。将深石灰岩灰用作海军蓝的男性中性替代色。永远不要在大型建筑表面使用明亮色彩——它会造成视觉压迫。",
    keyBrands: ["Farrow & Ball", "Benjamin Moore", "Zara Home", "Muji", "Vitra", "Restoration Hardware"],
    keyBrandsZh: ["Farrow & Ball", "本杰明摩尔", "Zara Home", "无印良品", "Vitra", "Restoration Hardware"],
    avoidColors: ["Pure saturated primaries on walls", "Cool fluorescent whites (industrial, not residential)"],
    avoidColorsZh: ["墙面上的纯饱和原色", "冷荧光白色（工业感而非居住感）"],
    colors: [
      { hex: "#C17B4A", name: "Terracotta Clay", role: "Anchor" },
      { hex: "#8C7B6E", name: "Aged Concrete", role: "Neutral" },
      { hex: "#7D9B72", name: "Garden Sage", role: "Natural" },
      { hex: "#5C4A3D", name: "Forest Oak", role: "Depth" },
      { hex: "#D4C5B0", name: "Warm Linen", role: "Light" },
      { hex: "#FAF7F2", name: "Limestone White", role: "Base" },
    ],
    tags: ["terracotta", "concrete", "natural", "textured", "warm", "material"],
    gradientFrom: "#C17B4A",
    gradientTo: "#7D9B72",
  },
];

export const INDUSTRY_ORDER: IndustryId[] = [
  "technology",
  "food-restaurant",
  "healthcare",
  "fashion-luxury",
  "nature-outdoor",
  "finance-banking",
  "education",
  "beauty-cosmetics",
  "architecture-interior",
];
