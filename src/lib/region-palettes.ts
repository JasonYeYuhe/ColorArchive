/**
 * Region color palettes — programmatic SEO landing pages targeting
 * geographic / cultural long-tail searches:
 *   - "Japanese color palette"
 *   - "Tokyo aesthetic colors"
 *   - "Moroccan palette hex"
 *   - "Scandinavian color scheme"
 *
 * These pages are about palettes documented by ethnographers, design
 * historians, and museum collections — not about claiming any
 * official "national colors" beyond flags. We cite traditional dye
 * sources, named architectural traditions, and well-known visual
 * codes (e.g. Wabi-sabi, Mediterranean blue-and-white).
 *
 * Color values are factual sRGB hex codes derived from public
 * references; they are not subject to copyright. The cultural
 * context paragraphs are original synthesis, not quotation.
 */

export type RegionContinent =
  | "asia"
  | "europe"
  | "africa"
  | "americas"
  | "oceania"
  | "middle-east";

export interface RegionColor {
  /** Cultural / material name (e.g. "Indigo dye", "Terra rossa", "Saffron"). */
  name: string;
  hex: string;
  /** Source: dye plant, mineral, architectural element, textile tradition. */
  source: string;
}

export interface RegionPalette {
  slug: string;
  name: string;
  continent: RegionContinent;
  /** Tight tagline for the listing page. */
  tagline: string;
  /** 1-2 paragraphs of cultural framing. */
  description: string;
  /** 5-7 colors that read as iconic for this region's traditional palette. */
  colors: RegionColor[];
  /** Use cases the palette suits: branding, interiors, fashion, etc. */
  useCases: string[];
  /** Key sources / further reading. */
  references: { label: string; url: string }[];
}

export const CONTINENT_LABELS: Record<RegionContinent, string> = {
  asia: "Asia",
  europe: "Europe",
  africa: "Africa",
  americas: "Americas",
  oceania: "Oceania",
  "middle-east": "Middle East",
};

export const regionPalettes: RegionPalette[] = [
  {
    slug: "japan",
    name: "Japan",
    continent: "asia",
    tagline: "Indigo, sumi ink, and unbleached paper — restraint as aesthetics.",
    description:
      "The Japanese traditional palette is built on dyes, papers, and lacquers that pre-date industrial pigment by centuries. Indigo (ai-iro) saturates everything from samurai underrobes to modern denim. Sumi-zumi black ink defines calligraphy and ink-wash landscapes. Unbleached washi paper is the canvas. The supporting palette pulls from cherry-blossom pink (sakura), persimmon orange (kaki), and the deep red lacquer of Shinto torii gates. The discipline is restraint — rarely more than four hues in any composition.",
    colors: [
      { name: "Indigo (ai-iro 藍色)", hex: "#22366E", source: "Persicaria tinctoria fermentation dye" },
      { name: "Sumi Black (墨)", hex: "#1A1A1A", source: "Pine-soot stick ink" },
      { name: "Washi Cream (和紙)", hex: "#F4ECD8", source: "Unbleached mulberry-fiber paper" },
      { name: "Cherry Blossom (sakura 桜)", hex: "#FBC4D0", source: "Prunus serrulata flower" },
      { name: "Persimmon (kaki 柿)", hex: "#D44A2C", source: "Diospyros kaki fruit dye" },
      { name: "Torii Vermillion (朱)", hex: "#A52821", source: "Cinnabar lacquer on Shinto gates" },
    ],
    useCases: ["Editorial design", "Wabi-sabi interiors", "Premium packaging", "Minimal stationery brands"],
    references: [
      { label: "Sasuke Indigo Studio (Tokushima, Japan)", url: "https://en.wikipedia.org/wiki/Aizome" },
      { label: "Traditional colors of Japan", url: "https://nipponcolors.com/" },
    ],
  },
  {
    slug: "morocco",
    name: "Morocco",
    continent: "africa",
    tagline: "Saffron, terracotta, and Majorelle Blue — the spectrum of an Atlas-edge market.",
    description:
      "Morocco's visual identity moves between two registers: the desert-light terracotta of pisé walls and the mountain-edge saturated blues of Chefchaouen. The signature Majorelle Blue (#6050DC) was patented in 1937 by painter Jacques Majorelle for his Marrakech garden, and has since become inseparable from the country's design exports. Saffron, henna, and indigo dyes — all once traded along trans-Saharan caravans — supply the warm half of the palette.",
    colors: [
      { name: "Majorelle Blue", hex: "#6050DC", source: "Jacques Majorelle's Marrakech garden, 1937" },
      { name: "Pisé Terracotta", hex: "#C75B3D", source: "Sun-dried earth wall construction" },
      { name: "Saffron", hex: "#F4C430", source: "Crocus sativus stigma dye" },
      { name: "Mint Tea Green", hex: "#62A87C", source: "Atlas mountain spearmint" },
      { name: "Henna Red", hex: "#964B00", source: "Lawsonia inermis leaf paste" },
      { name: "Chefchaouen Blue", hex: "#7BAFD4", source: "Painted medina walls (Rif mountains)" },
      { name: "Atlas White", hex: "#F2EAD3", source: "Lime-washed walls" },
    ],
    useCases: ["Hospitality design", "Bohemian interiors", "Travel branding", "Wellness packaging"],
    references: [
      { label: "Jardin Majorelle", url: "https://jardinmajorelle.com/" },
      { label: "Chefchaouen Blue tradition", url: "https://en.wikipedia.org/wiki/Chefchaouen" },
    ],
  },
  {
    slug: "greece",
    name: "Greece (Aegean)",
    continent: "europe",
    tagline: "Whitewashed walls and Aegean blue — the most-photographed two-color palette in tourism.",
    description:
      "The Greek Aegean palette is a near-monochrome study: lime-washed white walls and the deep cobalt blue of shutters and church domes. The blue was originally chemically practical (a copper-based pigment dissolved in lime that resisted humidity) and became politically iconic during the 1967 junta, when island authorities mandated white-and-blue. The supporting palette pulls from olive-grove silver-green, sun-baked terracotta tiles, and the deep wine red of bougainvillea blossoms.",
    colors: [
      { name: "Aegean Blue", hex: "#005EB8", source: "Limewash + copper sulfate, traditional shutter paint" },
      { name: "Limewashed White", hex: "#F8F4EE", source: "Calcium hydroxide on stone" },
      { name: "Olive Silver", hex: "#9CA38F", source: "Olea europaea leaf undersides" },
      { name: "Terracotta Tile", hex: "#B85B40", source: "Fired earthenware roof tiles" },
      { name: "Bougainvillea Magenta", hex: "#C2185B", source: "Bougainvillea spectabilis bracts" },
      { name: "Cypress Green", hex: "#3E6B47", source: "Cupressus sempervirens" },
    ],
    useCases: ["Mediterranean restaurant branding", "Travel editorial", "Coastal real estate", "Summer fashion"],
    references: [
      { label: "Cycladic vernacular architecture", url: "https://en.wikipedia.org/wiki/Cycladic_architecture" },
    ],
  },
  {
    slug: "italy-tuscany",
    name: "Italy (Tuscany)",
    continent: "europe",
    tagline: "Terra rossa and Sienese ochres — the warm half of the Mediterranean palette.",
    description:
      "Tuscany's palette descends from the iron-rich earth of central Italy itself: raw and burnt sienna (named after the city), terra rossa, and Naples yellow have been mined and ground into pigment for over 800 years and supplied the Italian Renaissance with its working colors. The architectural register adds tile rosso, travertine cream, and the muted greens of olive groves and cypresses. Where Tuscany is restrained, Capri and Positano push toward turquoise sea + lemon yellow.",
    colors: [
      { name: "Sienese Ochre", hex: "#C68F58", source: "Iron oxide earth, Siena region" },
      { name: "Terra Rossa", hex: "#9C3E2E", source: "Mediterranean iron-rich clay" },
      { name: "Tuscan Cream", hex: "#EDDFC6", source: "Travertine limestone" },
      { name: "Cypress Green", hex: "#3F5E47", source: "Tuscan hilltop cypresses" },
      { name: "Chianti Wine", hex: "#722F37", source: "Sangiovese grape" },
      { name: "Sunflower Yellow", hex: "#F3C220", source: "Helianthus fields, Val d'Orcia" },
    ],
    useCases: ["Heritage hospitality", "Wine and food packaging", "Editorial photography", "Residential interiors"],
    references: [
      { label: "History of sienna pigment", url: "https://en.wikipedia.org/wiki/Sienna_(pigment)" },
    ],
  },
  {
    slug: "mexico",
    name: "Mexico",
    continent: "americas",
    tagline: "Frida pink, cobalt blue, and marigold — the palette of Mexican modernism and Día de los Muertos.",
    description:
      "Mexican color culture moves from pre-Columbian cochineal red (the dye that funded the Spanish empire) through colonial talavera tile blues to the saturated revolutionary palette of Frida Kahlo, Luis Barragán, and the muralists. The pink-cobalt-marigold-skull combination of Día de los Muertos is one of the most-imitated festival palettes in global design. Barragán's pink walls (Casa Gilardi, Cuadra San Cristóbal) are studied in every contemporary architecture program.",
    colors: [
      { name: "Mexican Pink (rosa mexicano)", hex: "#E4007C", source: "Aniline-derived 'rosa mexicano' textile dye" },
      { name: "Talavera Blue", hex: "#2A52BE", source: "Talavera Poblana tin-glazed pottery" },
      { name: "Marigold (cempasúchil)", hex: "#FF8A1E", source: "Tagetes erecta — Day of the Dead flower" },
      { name: "Cochineal Red", hex: "#A33340", source: "Dactylopius coccus insect dye" },
      { name: "Pulque Cream", hex: "#F4EBD0", source: "Fermented agave drink" },
      { name: "Barragán Earth Pink", hex: "#D77176", source: "Casa Gilardi, Mexico City (1976)" },
      { name: "Volcanic Black", hex: "#1F1A17", source: "Obsidian + Popocatépetl basalt" },
    ],
    useCases: ["Festival branding", "Hospitality color schemes", "Latin-American consumer packaging", "Editorial illustration"],
    references: [
      { label: "Casa Luis Barragán", url: "https://www.casaluisbarragan.org/" },
      { label: "History of Cochineal Dye", url: "https://en.wikipedia.org/wiki/Cochineal" },
    ],
  },
  {
    slug: "india",
    name: "India",
    continent: "asia",
    tagline: "Saffron, marigold, and the Holi powder spectrum — the most chromatically maximalist national palette.",
    description:
      "India's traditional palette is engineered for a high-sun climate that mutes lower saturation: every hue is pushed toward maximum chroma. The flag's saffron-white-green is a starting point, but the working palette spans from Holi festival pinks and yellows to Mughal miniature blues, from Kanchipuram silk magenta to Rajasthani fort indigo. Henna brown, marigold orange, and the spectrum of religious vermilion (sindoor) anchor everyday and ceremonial life. There is no Indian aesthetic of restraint — color is celebration, not background.",
    colors: [
      { name: "Saffron", hex: "#FF9933", source: "Crocus sativus stigma + flag heritage" },
      { name: "India Green", hex: "#138808", source: "Indian flag — Ashoka green" },
      { name: "Holi Pink", hex: "#E91E63", source: "Festival of Colors gulal powder" },
      { name: "Mughal Blue", hex: "#1B4F72", source: "Indo-Persian miniature paintings" },
      { name: "Marigold", hex: "#F2A516", source: "Tagetes — temple offerings" },
      { name: "Kanchipuram Magenta", hex: "#C2185B", source: "South Indian silk weaving tradition" },
      { name: "Sindoor Vermillion", hex: "#D32F2F", source: "Ceremonial vermilion" },
      { name: "Henna Brown", hex: "#8D5524", source: "Lawsonia inermis paste" },
    ],
    useCases: ["Festival design", "South Asian retail branding", "Bollywood-influenced editorial", "Wedding packaging"],
    references: [
      { label: "Holi color tradition", url: "https://en.wikipedia.org/wiki/Holi" },
    ],
  },
  {
    slug: "scandinavia",
    name: "Scandinavia",
    continent: "europe",
    tagline: "Dusty pastels, ash whites, and forest greens — light scarcity made into a design language.",
    description:
      "Scandinavian color culture is shaped by long winters: short daylight pushes interiors toward maximum reflectance (ash whites, oak naturals, dove grey) with carefully placed accents in muted forest green, dusty rose, and dyed wool ochre. The 20th-century icons — Marimekko, Iittala, Carl Hansen — codified a palette where saturation lives in textiles and walls stay quiet. Hygge culture extended the same logic to candle-lit warmth: cream, oat, cocoa.",
    colors: [
      { name: "Snow White", hex: "#F4F0EA", source: "Limewashed plaster, Nordic interiors" },
      { name: "Ash Grey", hex: "#A8AAA5", source: "Birch and ash bark" },
      { name: "Forest Green", hex: "#3D5B49", source: "Spruce / fir forest in winter light" },
      { name: "Iittala Blue", hex: "#A6CEDB", source: "Aalto vase glassware (1936-)" },
      { name: "Oat Beige", hex: "#D5C7A7", source: "Linseed oil-treated pine" },
      { name: "Marimekko Poppy Red", hex: "#D03030", source: "Unikko print, Marimekko 1964" },
      { name: "Faded Rose", hex: "#D3A6A0", source: "Vintage Swedish wallpaper" },
    ],
    useCases: ["Minimal interior design", "Direct-to-consumer home brands", "Wellness packaging", "Editorial layout"],
    references: [
      { label: "Marimekko Unikko archive", url: "https://www.marimekko.com/" },
    ],
  },
  {
    slug: "china-traditional",
    name: "China (Traditional)",
    continent: "asia",
    tagline: "Cinnabar red, imperial yellow, and ink-wash green — five-element color theory across two millennia.",
    description:
      "Traditional Chinese color culture organized hues around the wu xing (five elements) system: blue-green for wood, red for fire, yellow for earth, white for metal, black for water. Imperial yellow (cí huáng) was reserved by sumptuary law for the emperor. Cinnabar (zhū sā) red defined Forbidden City lacquer and seal stamps. Celadon green-gray defined Song Dynasty ceramics. Modern Chinese internet brand color (red as 喜庆 / auspicious) is the descendent of this palette.",
    colors: [
      { name: "Cinnabar Red (朱砂)", hex: "#C0392B", source: "Mercury sulfide pigment, classical seals" },
      { name: "Imperial Yellow (帝王黄)", hex: "#FFB300", source: "Reserved for emperor's robes; Forbidden City roof tiles" },
      { name: "Celadon (青瓷)", hex: "#9CB48F", source: "Song Dynasty Longquan kilns" },
      { name: "Indigo Blue (青)", hex: "#1A4378", source: "Persicaria tinctoria — Han textile dye" },
      { name: "Ink Wash Black (墨)", hex: "#1C1C1C", source: "Pine-soot ink stick (mò)" },
      { name: "Jade Green (碧玉)", hex: "#5F9EA0", source: "Hetian and Burmese jadeite" },
      { name: "Plum Red (梅子)", hex: "#9B2335", source: "Plum blossom, Song poetry" },
    ],
    useCases: ["Premium tea / spirits packaging", "Heritage brand design", "Editorial illustration", "Cultural-tech product UI"],
    references: [
      { label: "Five Elements color theory", url: "https://en.wikipedia.org/wiki/Five_elements_(Chinese_philosophy)" },
      { label: "Forbidden City colors", url: "https://en.wikipedia.org/wiki/Forbidden_City" },
    ],
  },
  {
    slug: "korea",
    name: "Korea (Obangsaek)",
    continent: "asia",
    tagline: "The five Obangsaek directions — the most disciplined ceremonial palette in East Asia.",
    description:
      "Korean traditional color theory codifies the obangsaek (five directional colors): blue (east), red (south), yellow (center), white (west), and black (north). These five hues structure everything from royal silk hanbok to Joseon-era court ceremony to modern saekdong striped patchwork. The everyday domestic palette is more muted — dalbang (pale moon white), eojang (oak grey), sokpaltchi (early-morning blue) — and forms the visual basis of contemporary Korean minimalism.",
    colors: [
      { name: "Obangsaek Blue (청 / cheong)", hex: "#1E68C1", source: "East — wood element, hanbok dyes" },
      { name: "Obangsaek Red (홍 / hong)", hex: "#C8242C", source: "South — fire element, ceremonial silk" },
      { name: "Obangsaek Yellow (황 / hwang)", hex: "#F2C94C", source: "Center — earth element, royal robe" },
      { name: "Obangsaek White (백 / baek)", hex: "#F5F5F2", source: "West — metal element, hemp linen" },
      { name: "Obangsaek Black (흑 / heuk)", hex: "#1F1F1F", source: "North — water element, ink and lacquer" },
      { name: "Hanji Cream", hex: "#EAE0CB", source: "Mulberry-fiber Korean paper" },
      { name: "Celadon-Goryeo Green", hex: "#7CA38E", source: "Goryeo Dynasty ceramics, 12th-13th c." },
    ],
    useCases: ["Heritage food / drink branding", "Modern Korean fashion", "Cultural / film design", "Editorial layout"],
    references: [
      { label: "Obangsaek and traditional Korean color", url: "https://en.wikipedia.org/wiki/Obangsaek" },
    ],
  },
  {
    slug: "egypt",
    name: "Egypt",
    continent: "africa",
    tagline: "Lapis lazuli, gold leaf, and Nile reed green — the oldest organized color system on record.",
    description:
      "Ancient Egyptian palette is documented across 3,000 years of preserved tomb walls and papyri: ground lapis lazuli (imported from Afghanistan and worth its weight in gold) for the blue of the gods' skin, malachite green for fertility and resurrection, ochre yellow as a stand-in for gold leaf, hematite red for the king. The supporting palette includes the cream of Nile linen, the deep black of kohl eye-paint, and the warm brown of papyrus reed. Modern Egyptian design pulls from both this antiquity and the saturated turquoise of the Mediterranean coast.",
    colors: [
      { name: "Lapis Lazuli", hex: "#1F4287", source: "Crushed lapis lazuli, imported via Sinai trade" },
      { name: "Gold Leaf Yellow", hex: "#FCC72E", source: "Hammered gold; Nubian sand" },
      { name: "Malachite Green", hex: "#3D9970", source: "Copper carbonate, Sinai mines" },
      { name: "Hematite Red", hex: "#A8201A", source: "Iron oxide tomb-wall pigment" },
      { name: "Linen Cream", hex: "#EDE0C8", source: "Bleached Nile flax" },
      { name: "Kohl Black", hex: "#0E0E0E", source: "Galena (lead sulfide) eye paint" },
      { name: "Papyrus Tan", hex: "#C1A36F", source: "Cyperus papyrus reed paper" },
    ],
    useCases: ["Heritage brand design", "Museum and exhibition graphics", "Luxury hospitality", "Spice / oil packaging"],
    references: [
      { label: "Pigments of Ancient Egypt", url: "https://en.wikipedia.org/wiki/Egyptian_blue" },
    ],
  },
  {
    slug: "iceland",
    name: "Iceland",
    continent: "europe",
    tagline: "Volcanic black, glacial blue, and lichen green — the palette of a country shaped by basalt and ice.",
    description:
      "Iceland's natural palette is unusually narrow and high-contrast: volcanic basalt black, glacial cyan-blue, sphagnum moss green, and the soft pinks of midnight-sun light at the horizon. The traditional craft palette adds lopapeysa wool — undyed grey, cream, and brown sheep fleece — and the saffron-orange of fishermen's safety gear, the only saturated color most coastal towns ever see.",
    colors: [
      { name: "Basalt Black", hex: "#1A1B1F", source: "Reynisfjara basalt columns" },
      { name: "Glacial Cyan", hex: "#75BBC1", source: "Vatnajökull ice cave light" },
      { name: "Lichen Green", hex: "#9CA577", source: "Cetraria islandica" },
      { name: "Lopapeysa Cream", hex: "#E8DFCC", source: "Undyed Icelandic sheep wool" },
      { name: "Lopapeysa Sheep Brown", hex: "#7C5A3A", source: "Natural-dye Icelandic wool" },
      { name: "Midnight Sun Pink", hex: "#F2AEB5", source: "Horizon light, June" },
      { name: "High-Vis Orange", hex: "#F75900", source: "Fishing fleet safety gear" },
    ],
    useCases: ["Outdoor / adventure brands", "Premium wool fashion", "Tourism branding", "Editorial photography"],
    references: [
      { label: "Icelandic wool tradition", url: "https://en.wikipedia.org/wiki/Lopapeysa" },
    ],
  },
  {
    slug: "vietnam",
    name: "Vietnam",
    continent: "asia",
    tagline: "Áo dài silk, lacquer red, and tropical green — Indochinese color culture in saturated form.",
    description:
      "Vietnamese palette pulls from three sources: the deep red lacquer of pagoda interiors and traditional sơn mài art, the saturated silks of the áo dài (now spanning every imaginable hue but historically rooted in rich pinks, greens, and yellows), and the tropical green of rice paddies and jade rivers. The French-colonial overlay added pastel wash colors visible across Hội An's old town. The supporting palette includes turmeric yellow, clay-pot brown, and the unique Halong Bay green-grey water color.",
    colors: [
      { name: "Sơn Mài Red", hex: "#A52A2A", source: "Vietnamese lacquer art" },
      { name: "Áo Dài Pink", hex: "#E94175", source: "Traditional silk dye" },
      { name: "Rice Paddy Green", hex: "#5F8D4E", source: "Mekong Delta" },
      { name: "Hội An Yellow", hex: "#E8B647", source: "Painted colonial-era walls" },
      { name: "Turmeric", hex: "#D89B2E", source: "Curcuma longa root dye" },
      { name: "Jade River", hex: "#3F8B7E", source: "Halong Bay limestone water" },
      { name: "Pho Broth Brown", hex: "#5C3A21", source: "Anise-and-cinnamon star, slow simmer" },
    ],
    useCases: ["Restaurant branding", "Travel editorial", "Streetwear collaborations", "Spice and tea packaging"],
    references: [
      { label: "Hội An Ancient Town (UNESCO)", url: "https://whc.unesco.org/en/list/948/" },
    ],
  },
  {
    slug: "france-paris",
    name: "France (Paris)",
    continent: "europe",
    tagline: "Limestone facades, slate-grey roofs, and Hermès orange — the most disciplined urban palette in Europe.",
    description:
      "Paris is built from a near-monochrome of cream Lutetian limestone (the buildings are required by law to stay within a defined hue range) and dark zinc roofs, with the Seine reading as cool steel. The fashion tradition adds the controlled chromatic accents — Chanel black, Hermès orange #FF7B00 (a wartime cardboard improvisation that became a brand asset), Yves Klein International Blue, and the deep wine of Bordeaux. The discipline at the architecture level lets the accent colors carry maximum weight.",
    colors: [
      { name: "Lutetian Limestone", hex: "#E5DDC8", source: "Paris facade stone (Haussmannian-era buildings)" },
      { name: "Zinc Roof Grey", hex: "#5E6566", source: "Oxidized zinc roof tiles, central Paris" },
      { name: "Hermès Orange", hex: "#FF7B00", source: "Hermès brand box, since 1942" },
      { name: "Chanel Black", hex: "#0A0A0A", source: "Coco Chanel's 'little black dress' palette anchor" },
      { name: "Bordeaux Wine", hex: "#5C2E2A", source: "Bordeaux region red wine" },
      { name: "Yves Klein Blue (IKB)", hex: "#002FA7", source: "Patented by Yves Klein, 1960" },
      { name: "Seine Steel", hex: "#7E8A93", source: "River reflectivity in winter" },
    ],
    useCases: ["Luxury fashion branding", "Heritage hospitality", "Editorial photography", "Restaurant design"],
    references: [
      { label: "Plan Local d'Urbanisme de Paris (facade rules)", url: "https://www.paris.fr/" },
      { label: "Hermès brand history", url: "https://www.hermes.com/" },
    ],
  },
  {
    slug: "brazil",
    name: "Brazil",
    continent: "americas",
    tagline: "Carnaval saturation against Amazon green — the highest-chroma national palette in the Americas.",
    description:
      "Brazil's color culture moves between the deep ecological greens of the Amazon and Pantanal and the maximalist saturation of Carnaval — feathered samba costumes, Bahia tile blues, and the yellow-green-blue of the flag. The Tropicália movement of the 1960s codified this contrast as a national aesthetic; contemporary Brazilian design (Burle Marx landscapes, Lina Bo Bardi architecture) builds on it. The supporting palette includes açaí purple, dendê palm-oil orange, and the warm terracotta of Salvador's colonial old town.",
    colors: [
      { name: "Amazon Green", hex: "#1B6D3F", source: "Tropical rainforest canopy" },
      { name: "Carnaval Yellow", hex: "#FFCC29", source: "Brazilian flag + samba costumes" },
      { name: "Brazil Blue", hex: "#002776", source: "Brazilian flag — celestial sphere" },
      { name: "Açaí Purple", hex: "#3D1F4D", source: "Euterpe oleracea berry" },
      { name: "Dendê Orange", hex: "#E97132", source: "Palm-oil cooking traditions of Bahia" },
      { name: "Salvador Terracotta", hex: "#B85B40", source: "Colonial Pelourinho district" },
      { name: "Tropical Pink", hex: "#FF1B6B", source: "Bougainvillea + Carnaval costume" },
    ],
    useCases: ["Festival design", "Travel branding", "Fashion swimwear", "Beverage packaging"],
    references: [
      { label: "Brazilian Tropicália movement", url: "https://en.wikipedia.org/wiki/Tropic%C3%A1lia" },
      { label: "Roberto Burle Marx Foundation", url: "https://www.sitio.com.br/" },
    ],
  },
  {
    slug: "turkey-istanbul",
    name: "Turkey (Istanbul)",
    continent: "middle-east",
    tagline: "Iznik tile blue, Bosphorus water, and Turkish red — three civilizations layered into one palette.",
    description:
      "Istanbul's palette absorbs three thousand years of layered civilization: Byzantine gold mosaics, Ottoman Iznik tile blue and tomato red, and the perpetual cool turquoise of the Bosphorus and Marmara Sea. The signature Iznik blue (a cobalt-and-tin-glaze formula perfected in the 16th century) fills the Sultan Ahmed Mosque interior and is now copied globally as 'Ottoman blue'. Turkish red (kırmızı) — the bright tomato red of carpet borders and the modern flag — anchors the warm half. Apple tea amber and saffron round out the working palette.",
    colors: [
      { name: "Iznik Blue", hex: "#1E5599", source: "Ottoman Iznik tile cobalt-glaze, 16th c." },
      { name: "Turkish Red", hex: "#E30A17", source: "Crescent-and-star flag + carpet border" },
      { name: "Bosphorus Turquoise", hex: "#4DA8AC", source: "Marmara strait water" },
      { name: "Byzantine Gold", hex: "#D4AF37", source: "Hagia Sophia mosaic ground" },
      { name: "Apple Tea Amber", hex: "#C77D4D", source: "Çay glass tea, ubiquitous Istanbul tradition" },
      { name: "Saffron Yellow", hex: "#F4C430", source: "Anatolian saffron + spice market color" },
      { name: "Marble White", hex: "#F0EBE0", source: "Marmara marble, used since Roman era" },
    ],
    useCases: ["Hotel and restaurant branding", "Travel publishing", "Cosmetics packaging", "Heritage retail"],
    references: [
      { label: "Iznik pottery tradition", url: "https://en.wikipedia.org/wiki/%C4%B0znik_pottery" },
      { label: "Sultan Ahmed Mosque (Blue Mosque)", url: "https://en.wikipedia.org/wiki/Blue_Mosque,_Istanbul" },
    ],
  },
  {
    slug: "england-london",
    name: "England (London)",
    continent: "europe",
    tagline: "Underground roundel red, royal navy, and pub-tile green — the codified colors of the British capital.",
    description:
      "London is one of the few cities whose palette is partly enforced by transport authority. Underground red (the roundel red, technically Pantone 485), Underground blue, Buckingham red, royal navy and Cambridge blue all appear on official documents. The vernacular layer adds Victorian garden brick (#9F4A3C), London Plane tree green, and the deep enamelled green of pub tile dadoes — all present across Hampstead, Bloomsbury, Marylebone, and the City. Even the typeface (Edward Johnston's, 1916) is owned by Transport for London.",
    colors: [
      { name: "Underground Red", hex: "#DC241F", source: "TfL roundel — Edward Johnston, 1908" },
      { name: "Underground Blue", hex: "#1C3F95", source: "TfL roundel + Piccadilly line" },
      { name: "Royal Navy", hex: "#0A2351", source: "Royal Navy / Royal Mail livery" },
      { name: "Buckingham Red", hex: "#A4262C", source: "Royal guard uniforms + post boxes" },
      { name: "Plane Tree Green", hex: "#5C7A5A", source: "Platanus × hispanica, London street tree" },
      { name: "Pub Tile Green", hex: "#1F4D2E", source: "Victorian pub interior dado tiling" },
      { name: "Garden Brick", hex: "#9F4A3C", source: "London stock brick + clay" },
    ],
    useCases: ["Heritage hospitality", "Editorial publishing", "Menswear / British outfitters", "Gallery branding"],
    references: [
      { label: "Transport for London brand standards", url: "https://tfl.gov.uk/" },
      { label: "Pantone 485 (Underground Red)", url: "https://en.wikipedia.org/wiki/London_Underground" },
    ],
  },
  {
    slug: "ireland",
    name: "Ireland",
    continent: "europe",
    tagline: "Forty shades of green — peat, Atlantic spray, and Aran wool ivory.",
    description:
      "Irish color culture is shaped by the country's notorious chromatic narrowness — over 40 documented shades of green from limestone-pasture sage to peat-bog moss to Atlantic-edge sea. The Celtic cross green of the modern flag (Pantone 347) is one specific reading; the everyday landscape ranges much darker and softer. The supporting palette includes Aran wool ivory, peat brown, Connemara marble grey-green, and the sudden saturated orange of fishing buoys and pub doors that punctuate the green.",
    colors: [
      { name: "Celtic Cross Green", hex: "#169B62", source: "Irish flag — Pantone 347" },
      { name: "Pasture Green", hex: "#7C9A4C", source: "Limestone-base pastureland, the West" },
      { name: "Peat Brown", hex: "#604024", source: "Cut turf bog, Mayo + Connemara" },
      { name: "Aran Cream", hex: "#F0E8D2", source: "Undyed Aran wool sweater tradition" },
      { name: "Connemara Marble", hex: "#8DA48A", source: "Mottled green-grey native marble" },
      { name: "Pub Door Red", hex: "#B4292B", source: "Saturated street accent against grey stone" },
      { name: "Atlantic Slate", hex: "#5A6770", source: "Cliff face + winter sea" },
    ],
    useCases: ["Whiskey and stout packaging", "Premium knitwear", "Travel publishing", "Pub / restaurant design"],
    references: [
      { label: "National Folklore Collection (UCD)", url: "https://www.duchas.ie/" },
    ],
  },
  {
    slug: "australia",
    name: "Australia",
    continent: "oceania",
    tagline: "Uluru ochre, eucalyptus blue-green, and Great Barrier Reef coral — earth at one extreme, sea at the other.",
    description:
      "The Australian palette is as widely separated as the continent itself: the saturated Uluru ochre + Pilbara red of the Outback against the cool eucalyptus blue-green of the bushland and the high-key coral and turquoise of the Great Barrier Reef. Indigenous Australian art, with its dot-painting tradition rooted in iron-oxide ochres, is the country's longest continuous color tradition (40,000+ years). The supporting palette adds the bleached cream of summer beach sand, the warm pink of summer-evening light over Perth and Sydney, and the deep navy of the southern night sky.",
    colors: [
      { name: "Uluru Ochre", hex: "#C9472B", source: "Iron-oxide weathering, Uluru sandstone" },
      { name: "Eucalyptus Blue-Green", hex: "#7EA08C", source: "Eucalyptus regnans / globulus foliage" },
      { name: "Reef Coral", hex: "#FF7E6F", source: "Great Barrier Reef coral — Acropora" },
      { name: "Reef Turquoise", hex: "#3FBFB9", source: "Whitsunday lagoons" },
      { name: "Bush Khaki", hex: "#8E895C", source: "Outback grassland in dry season" },
      { name: "Beach Cream", hex: "#F2EFE1", source: "Western Australian quartz sand" },
      { name: "Southern Sky Navy", hex: "#0C1E3F", source: "Outback night sky" },
    ],
    useCases: ["Outdoor / adventure gear", "Wine and food packaging (Margaret River, Hunter Valley)", "Tourism branding", "Surf-wear"],
    references: [
      { label: "Aboriginal Australian art tradition", url: "https://www.nma.gov.au/explore/topics/art" },
      { label: "Great Barrier Reef Marine Park Authority", url: "https://www2.gbrmpa.gov.au/" },
    ],
  },
];

// ---- Helpers ----

const bySlug = new Map(regionPalettes.map((r) => [r.slug, r]));

export function getRegionBySlug(slug: string): RegionPalette | undefined {
  return bySlug.get(slug);
}

export function regionsByContinent(): Map<RegionContinent, RegionPalette[]> {
  const map = new Map<RegionContinent, RegionPalette[]>();
  for (const r of regionPalettes) {
    if (!map.has(r.continent)) map.set(r.continent, []);
    map.get(r.continent)!.push(r);
  }
  return map;
}
