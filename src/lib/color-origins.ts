/**
 * Color Origins — narrative content for the 5,446 color detail pages.
 *
 * Strategy: don't write 5,446 individual articles (impossible). Instead:
 *
 *   1. Write one rich "family heritage" piece for each of the 10 color
 *      families (the 9 ColorFamily values + Neutral). Each piece has 4
 *      sections: Heritage / Across cultures / In the wild / How it reads.
 *
 *   2. Generate per-color modifier prose at runtime from the color's
 *      lightness band and effective saturation. Combined with the family
 *      heritage, every color page gets ~600+ words of unique narrative
 *      content for SEO + reader value.
 *
 * Source discipline: psychology claims are limited to associations
 * supported by repeated cross-cultural research (e.g. red→arousal,
 * blue→calm). Where research is contested or culture-specific, we
 * frame as "in [region]" rather than universal claims.
 */

import type { ColorFamily, ColorRecord } from "@/src/types/color";

export type OriginFamily = ColorFamily | "Neutral";

export interface FamilyHeritage {
  family: OriginFamily;
  /** One-line tagline for the section header. */
  tagline: string;
  /** Paragraph: pigment lineage, etymology, classical use. */
  heritage: string;
  /** Paragraph: 2-3 cultural readings, named by region. */
  cultures: string;
  /** Paragraph: famous applications in design, cinema, brand. */
  inTheWild: string;
  /** Paragraph: how this hue tends to read on a page or screen. */
  howItReads: string;
}

export const FAMILY_HERITAGES: FamilyHeritage[] = [
  {
    family: "Red",
    tagline: "The first pigment, the loudest signal.",
    heritage:
      "Red is the oldest pigment in the human visual record. Ochre reds appear in burial sites from 75,000+ years ago; Roman red lead (minium) lit Pompeian walls; cinnabar drove a millennium of trade across Asia and the Mediterranean. Madder, kermes, and cochineal — the three classical reds — built fortunes and emptied empires before synthetic alizarin arrived in 1869 and collapsed the price overnight.",
    cultures:
      "In China red signals fortune and weddings, painted on doors and lanterns and given in money envelopes. In much of South Asia red is the bridal color (saris, sindoor) for the same reason. Western traditions split red between love (Valentine's) and danger (stoplights, balance sheets). Across the Christian liturgy red marks martyrdom and Pentecost; across cinema it has long marked the femme fatale.",
    inTheWild:
      "Coca-Cola has used essentially the same red since 1886. Netflix and YouTube engineered their reds to pop maximally on dark UI. Christian Louboutin trademarked a single red — Pantone 18-1663 — on the soles of his shoes. Ferrari's racing red began as the Italian national racing color (Rosso Corsa). Nearly every emergency stop button on every machine ever made is red, and the convention is so universal it functions as international iconography.",
    howItReads:
      "Red advances. On a page it draws the eye first; in a UI it implies destructive action or urgent state. Increasing saturation pushes it toward warning; reducing saturation moves it toward earthen, terra-cotta, comfort. Pairing red with white reads as energetic and consumer-facing; pairing it with black reads cinematic and luxurious; pairing it with cream reads as heritage or hospitality.",
  },
  {
    family: "Orange",
    tagline: "Citrus, fire, and the only color named after a fruit.",
    heritage:
      "Orange is unusual: in English the color was named after the fruit, not the other way around — before the fruit reached Europe in the 16th century, this hue was simply 'yellow-red'. Earlier pigments included realgar (toxic), saffron (priceless), and orpiment. Cadmium orange, introduced in the 19th century, gave painters from the Impressionists onward a stable, brilliant orange that didn't fade or poison.",
    cultures:
      "In Hindu and Buddhist tradition saffron orange marks renunciation — the robe of monks across Theravada and Tibetan lineages. The Dutch House of Orange-Nassau gave the Netherlands a national identity color, still worn at football matches and on King's Day. In Ireland, orange is the Protestant counterpart to green's Catholic association — the country's flag literally encodes the divide. Halloween's orange-and-black is a 20th-century American invention that has since gone global.",
    inTheWild:
      "Hermès orange is a brand asset traceable to a 1942 wartime cardboard shortage. Penguin Books used orange-and-white spines as a class signal — fiction was always orange. Nickelodeon, Fanta, and easyJet all chose orange for the same reason: it reads playful and consumer-friendly while staying outside the more crowded red and yellow lanes. NASA flight suits use International Orange specifically because nothing in nature matches it, making astronauts maximally visible against any background.",
    howItReads:
      "Orange is warm without the urgency of red. It signals appetite (used heavily in fast food), creativity, and approachability. At low saturation it becomes terracotta, rust, or apricot — earthy palettes for hospitality and craft. At high saturation it reads as a sport, energy drink, or warning hazard. Orange and teal is the most common modern film-grade pairing; the contrast between warm skin tones and cool shadows is engineered for it.",
  },
  {
    family: "Yellow",
    tagline: "The color of attention, sunlight, and contradiction.",
    heritage:
      "Yellow ochre is, with red ochre, one of the two pigments humans have used continuously for the longest time. Indian Yellow — historically made from the urine of cows fed only mango leaves — reached its peak in 17th–18th century Mughal painting before falling out of use. Cadmium yellow, introduced in the 1840s, gave Van Gogh his sunflowers; chrome yellow gave him the wheat fields he died in. Modern PY83 (a hansa yellow) is the durable workhorse of contemporary printing.",
    cultures:
      "In Imperial China yellow was the emperor's color, off-limits to commoners. In medieval Europe yellow was simultaneously sacred (gold halos) and stigmatized (forced-yellow garments imposed on Jews and 'heretics' — the precedent the Nazis revived). In Japan yellow is courage; in Egypt it was the color of mourning. Few colors carry such contradictory meanings across regions.",
    inTheWild:
      "McDonald's golden arches were calibrated for highway visibility — the M is yellow because yellow is the most-recognized color at distance. The Yellow Pages, the New York taxi, the school bus, and the Post-it note are all the same engineered yellow (PMS 116) for the same reason: maximum legibility at minimum cost. Coldplay's 'Yellow' put the color into the cultural mood vocabulary in 2000. IKEA pairs yellow with blue in a deliberate echo of the Swedish flag.",
    howItReads:
      "Yellow demands attention more aggressively than any other color — the eye's L-cones and M-cones both peak nearby, so yellow appears bright at lower luminance than other hues. It works as an accent, a warning, or a child-friendly primary; it almost never works as a body-text color (contrast against white is too low). At low saturation yellow becomes cream, butter, parchment — quiet and warm; at high saturation it becomes a hazard sign or a sport drink.",
  },
  {
    family: "Lime",
    tagline: "Half spring leaf, half pop-art neon.",
    heritage:
      "Lime — the yellow-green region of the spectrum — has no classical pigment of its own; painters historically achieved it by mixing yellow ochre with terre verte or lead-tin yellow with verdigris. The brilliant phthalo greens and arylide yellows of the 20th century made saturated lime achievable for the first time, which is why lime feels visually 'modern' even though grass and leaves have always lived there.",
    cultures:
      "In Japan, the moss greens of traditional gardens (yamabuki, moegi) sit at the muted edge of lime. In American pop culture lime exploded with the 1960s — the 'Day-Glo' palette of psychedelic posters depended on it, and Mountain Dew commercialized it. In sportswear lime carries 'high-visibility' connotations (running gear, safety vests) that have lately come back into fashion as a deliberate aesthetic.",
    inTheWild:
      "Tennis balls have been lime-yellow ('optic yellow') since 1972, when Wimbledon found it most visible on color TV. Spotify's #1DB954 and the Xbox brand green both sit at the lime end. Lacoste and BP both run on saturated lime greens. Mountain Dew owns the brilliant supersaturated lime in beverage. In film, The Matrix's coded rain is lime-on-black — the choice was originally about the look of phosphor CRT terminals.",
    howItReads:
      "Lime is the youngest-feeling green: it reads as fresh, citric, energetic, and slightly synthetic. At low saturation it becomes olive or moss, both heavily associated with craft, sustainability, and slow design. At high saturation it reads as sport, beverage, or technology. Lime is one of the harder hues to use as a primary brand color without trending toward 'energy drink' — many brands therefore use it as an accent against deep neutrals.",
  },
  {
    family: "Green",
    tagline: "The color of growth, currency, and the longest-running brands.",
    heritage:
      "Verdigris (copper acetate) gave medieval manuscripts their greens; it was unstable, eating through parchment over centuries. Terre verte (green earth) was used for under-painting flesh in the Italian tradition. Scheele's green and Paris green, both 19th-century arsenic compounds, killed an unknown number of wallpaper-makers and Victorian children before viridian and phthalo greens replaced them. Modern green pigments are remarkably stable; the iconic Brunswick green that became British Racing Green dates to the same chemistry.",
    cultures:
      "Green is the dominant color of Islam — the Prophet's banner, the flags of many Muslim-majority nations, the domes of mosques. In Ireland green is national identity, partly through the shamrock and partly through the political binary with orange. In Japan, green and blue (ao/midori) were a single concept until recently; traffic 'green lights' there are still a deeper teal-ish shade. Across many cultures green simultaneously means growth, fertility, envy, and the supernatural.",
    inTheWild:
      "Starbucks' green has barely changed since 1971. John Deere has used essentially the same green since 1837 — the longest continuous brand color in commerce. The U.S. dollar is green because of the chemistry of camphor and copper sulfate, not branding. Whatsapp, Spotify, and Heineken all anchor on green; each chose it for a different reason (community, sound, Dutch heritage). Hospital scrubs were originally white but switched to green/teal because surgeons were getting after-image fatigue.",
    howItReads:
      "Green is the hue the eye is most efficient at parsing — half of all our cone cells are tuned near 555nm. That makes green the easiest color to look at for long periods, which is why it dominates productivity software, 'go' indicators, and reading-friendly UI. At low saturation it reads as natural, calm, premium (sage, olive). At high saturation it reads as urgent or playful (Mountain Dew, Slack notifications). It carries one of the strongest semantic loads in product design: 'success', 'go', 'natural', 'safe'.",
  },
  {
    family: "Teal",
    tagline: "The hue of patina, lagoons, and modern surgery.",
    heritage:
      "Teal — the blue-green range — is named after the Eurasian teal duck, whose wing patches sit at exactly this hue. Egyptian blue and Egyptian green, both made from copper-calcium silicate around 2,500 BCE, sit in this region. The patina of weathered copper (the Statue of Liberty's color) is teal because copper carbonate forms there; Bacon's verdigris is the same chemistry. Phthalo turquoise and cobalt teal are 20th-century pigments.",
    cultures:
      "In Persian and Central Asian Islamic architecture, teal-turquoise tile work is iconic — the domes of Samarkand and Isfahan are unmistakable. In ancient Egypt, faience (a kind of glazed ceramic in this color) was associated with the Nile, fertility, and rebirth. In the American Southwest, teal-turquoise is so deeply associated with Navajo and Pueblo silverwork that the color reads 'desert' there.",
    inTheWild:
      "Hospital scrubs are teal because it's the perceptual complement of red blood — staring at red and then looking away produces a green-teal afterimage, and matching the scrubs to that afterimage reduces eye fatigue. Tiffany's blue is a calibrated teal, trademarked as PMS 1837 (their founding year). Most Pixar films grade their shadows toward teal because warm skin against cool shadow is the most legible cinematographic combination. The Apple Watch SE, the Surface Pro, and the new Macs all use teal as a 'calming-but-modern' accent.",
    howItReads:
      "Teal sits at one of the visually quietest points of the spectrum — it neither advances (like red) nor recedes (like blue). It reads as competent, calm, and slightly clinical; it's the dominant accent color in healthcare and trust-led fintech for that reason. At low saturation it becomes a duck-egg or seafoam, soft and Scandinavian. At high saturation it becomes electric or tropical. Teal pairs particularly well with warm earth tones (terracotta, clay, beige).",
  },
  {
    family: "Blue",
    tagline: "The most-loved color on the planet, and the most overused.",
    heritage:
      "Blue is the rarest pigment in the natural world — and so, historically, the most expensive. Ultramarine, ground from lapis lazuli mined only in Afghanistan, was worth more than gold in Renaissance Europe; Vermeer's bills were enormous because of how much he used. Egyptian blue (the first synthetic pigment, ~3000 BCE) was lost for centuries and rediscovered in the 19th. Prussian blue (1704) democratized blue overnight; Yves Klein's IKB (1960) re-aristocratized it.",
    cultures:
      "In ancient Egypt blue was the color of the Nile and the heavens — sacred, protective. In China blue-and-white porcelain (qinghua) defined export ceramics for 600 years. In Mediterranean traditions blue wards off the evil eye. In post-WWII America, blue became the corporate default ('IBM blue'); in Japan, indigo (ai) is the centuries-old workwear dye that became the ground tone of an entire textile tradition. Across the world blue is consistently rated the most-liked color — sometimes by 35% margins.",
    inTheWild:
      "Facebook is blue because Mark Zuckerberg is red-green colorblind. IBM's blue dates to 1947. Levi's blue is the natural color of indigo on cotton. Twitter Blue (#1DA1F2) defined social-media blue for a decade before X scrapped it. Pixar's Up famously runs on a single complementary palette built on blue. The blue checkmark, the blue link, the blue 'send' button — blue has become the default color of digital trust, to the point of being a UX cliché.",
    howItReads:
      "Blue recedes — physically, the eye focuses blue light slightly behind the retina, which makes blue elements feel deep or distant. It reads as trustworthy, calm, corporate, and (at the cool end) cold. Light blues read airy and clinical; mid blues are the default for tech and finance; deep blues read as luxurious or naval. The omnipresence of blue in software is real: most enterprise UIs reach for it because it offends the fewest stakeholders, which is also the reason it can feel like the absence of a real choice.",
  },
  {
    family: "Purple",
    tagline: "The color of empire, twilight, and tech-luxury.",
    heritage:
      "Tyrian purple, extracted from the murex snail in Phoenicia, took 12,000 snails to dye one toga and was the literal definition of expense — Roman law restricted who could wear it. Mauve, the world's first synthetic dye, was discovered by accident in 1856 by an 18-year-old chemistry student trying to make quinine — the discovery launched the chemical-dye industry that funded the modern pharmaceutical industry. Quinacridone violet is the modern fade-resistant standard.",
    cultures:
      "In Catholic liturgy purple marks Lent and Advent — penance and preparation. In Japan murasaki (a deep violet) was the highest court color in the Heian period; The Tale of Genji's Lady Murasaki takes her name from it. In Thailand purple is the mourning color for widows. Across Western culture purple is associated with royalty (because of Tyrian's cost), creativity (because of its rarity), and from the 1960s onward with rock and psychedelia.",
    inTheWild:
      "Cadbury's purple has been trademarked since 2008 (and hard-fought in court). Yahoo, Twitch, Discord, and Linear all use saturated purples as primary brand colors — the choice signals creative-tech where blue would signal corporate-tech. Prince's purple was so associated with him that his estate has trademark issues with the broader color. Stripe's signature indigo (#635BFF) helped redefine fintech away from trust-blue. The Lakers, the Vikings, and most NBA teams' second jerseys use purple to claim a color lane that no other major team owns.",
    howItReads:
      "Purple sits at the boundary of warm and cool — biologically, our eyes process it as a blend rather than a single hue, which is why it can feel slightly unstable or magical. It reads as premium, creative, slightly counterculture. Light purples (lavender, lilac) read as gentle and feminine in Western convention. Saturated purples read as luxurious, electronic, or theatrical. Deep purples read as nocturnal, regal, or somber. It is one of the colors most commonly avoided by traditional finance and most embraced by creative tools.",
  },
  {
    family: "Pink",
    tagline: "From cheap cosmetic to feminist reclamation to gender-neutral comeback.",
    heritage:
      "Pink, as a named color, is recent in English (only since the late 17th century, originally referring to the Dianthus flower). The hue itself is even more recent in widespread use — most historical 'reds' that we'd now call pink were either faded cochineal or madder mixed with white lead. The classical Persian rosé and Venetian pink are old, but the cultural identity of 'pink' as its own thing is essentially a 20th-century construction.",
    cultures:
      "Pink-as-girl is a marketing invention from the 1940s; before WWII pink was often suggested for boys ('a stronger, more decided color') and blue for girls. In Japanese culture, sakura pink carries seasonal and nostalgic weight without gender association. In Latin American culture, hot pink is a celebratory color; in much of South Asia, pink is one of the auspicious wedding palette colors. The Pink Triangle was reclaimed from a Nazi badge into a 1970s LGBTQ+ symbol.",
    inTheWild:
      "T-Mobile's magenta is a hard-trademarked, hard-defended brand color. Barbie pink (Pantone 219 C) became its own cultural force in 2023. Owens Corning trademarked the color of its insulation. The Pepto-Bismol pink is calibrated for medicine-cabinet recognizability. Wes Anderson built a career making heritage pinks (The Grand Budapest Hotel) feel deeply specific. Millennial Pink (~2014–2018) was a rebranding effort to make pink read as gender-neutral, sophisticated, and salable to adults.",
    howItReads:
      "Pink reads softer and warmer than red; biologically it's still a long-wavelength color, but the white in it dampens the arousal response. Light pinks (blush, dusty rose) read as romantic, gentle, premium-feminine. Hot pinks read as energetic, queer-coded, or counterculture. Salmon and coral pinks read as healthy, beachy, or hospitality-friendly. Pink is having a sustained moment in adult-targeted brand design (skincare, DTC, beverage) precisely because it stopped being read as exclusively a children's color.",
  },
  {
    family: "Neutral",
    tagline: "Not a color, but the canvas every color lives on.",
    heritage:
      "Bone black, lamp black, ivory black, and Mars black are the classical pigment lineage of black; lead white (now banned), zinc white, and titanium white are the whites; and every gray sits between them. Charcoal and graphite extend the lineage. Painters historically built warm and cool grays from full-spectrum colors mixed to neutralize, not from a tube — Vermeer's grays are blue-and-orange, not black-and-white. Scandinavian and Japanese design traditions have refined the use of pure neutrals to the point of philosophy.",
    cultures:
      "In Western culture black is mourning (since the Roman Empire), formal (since the Spanish Habsburg court), and rebellious (since 20th-century counterculture). In Japan and many East Asian cultures white is the funeral color. Black-and-white photography defined visual journalism for a century. Concrete gray, since Brutalism, has come to read as both serious-civic and dystopian, depending on context. The Scandinavian 'lagom' aesthetic depends almost entirely on the calibration of warm vs cool grays.",
    inTheWild:
      "Apple's restraint is essentially a religion of neutrals — black hardware, white packaging, the long disciplined refusal to pick a brand color beyond System Blue. Chanel built a fashion empire on black-and-white. Muji's identity is the absence of identity — an exercise in cool grays. Vercel, Linear, GitHub, and most modern developer tools dial the saturation way down to make their content shine. The film noir aesthetic, the Bauhaus visual language, and modern minimalist branding all converge on neutrals.",
    howItReads:
      "Pure neutrals (true gray) are eye-rest colors — the brain processes them with the least chromatic effort. Warm neutrals (taupe, warm gray) read as inviting, hospitality-friendly, soft. Cool neutrals (cool gray, slate) read as technical, premium, slightly distant. Off-whites and creams are heritage-luxury colors; near-blacks (charcoal, ink) read as serious without the harshness of pure black. Designers often choose a slightly warm or slightly cool neutral over true gray because it feels more deliberate and human.",
  },
];

const heritageByFamily = new Map<OriginFamily, FamilyHeritage>(
  FAMILY_HERITAGES.map((h) => [h.family, h]),
);

/**
 * Effective family for the origins module — collapses Neutral grays
 * (saturation < 10) into a single Neutral entry.
 */
export function getOriginFamily(color: ColorRecord): OriginFamily {
  if (color.saturation < 10) return "Neutral";
  return color.family;
}

export function getFamilyHeritage(family: OriginFamily): FamilyHeritage | undefined {
  return heritageByFamily.get(family);
}

// ---- Modifier prose ----

export interface ModifierProse {
  /** Lightness band reading: airy / mid-range / deep. */
  lightness: string;
  /** Saturation band reading: muted / clear / electric. */
  saturation: string;
  /** Composite single-sentence "how this specific tone reads". */
  composite: string;
}

function lightnessBand(l: number): "airy" | "mid" | "deep" {
  if (l >= 70) return "airy";
  if (l >= 35) return "mid";
  return "deep";
}

function saturationBand(s: number): "muted" | "clear" | "electric" {
  if (s < 30) return "muted";
  if (s < 70) return "clear";
  return "electric";
}

const LIGHTNESS_PROSE: Record<"airy" | "mid" | "deep", string> = {
  airy:
    "At this lightness the hue almost recedes into the surface around it — useful for backgrounds, hover states, and any surface where the color should suggest a mood without competing with content.",
  mid:
    "At mid-lightness the hue carries its full character. This is the band where most identity colors live: bright enough to be distinctive at small sizes, deep enough to sit cleanly on a white canvas.",
  deep:
    "At this depth the hue starts behaving like a neutral — it can substitute for black in many contexts while still carrying a faint chromatic temperature. It pairs especially well with off-whites and warm metallics.",
};

const SATURATION_PROSE: Record<"muted" | "clear" | "electric", string> = {
  muted:
    "The low saturation pulls this color toward earthen, vintage, or editorial palettes. It reads as confident and grown-up rather than playful, and it tolerates being used in large blocks without becoming visually noisy.",
  clear:
    "The clear, mid-saturation register is the most common identity sweet spot — saturated enough to register as a 'real' color, restrained enough not to fight typography or photography placed over it.",
  electric:
    "At this saturation the color is doing work. It reads as a brand statement, a sport accessory, or a UI signal. It should be used in small, deliberate doses against quieter neighbors; large fields at this saturation will exhaust the eye.",
};

export function getModifierProse(color: ColorRecord): ModifierProse {
  const lBand = lightnessBand(color.lightness);
  const sBand = saturationBand(color.saturation);

  const compositeMap: Record<"airy" | "mid" | "deep", Record<"muted" | "clear" | "electric", string>> = {
    airy: {
      muted:
        "A pale, gentle tone — pastel territory, where the hue acts more like a tinted neutral than a stated color.",
      clear:
        "A bright, airy reading of the hue — clean and approachable, the kind of color that holds up well in product photography and on light backgrounds.",
      electric:
        "An almost luminous high-key tone — at this saturation and brightness, the color borders on neon. Use sparingly; it overpowers most companions.",
    },
    mid: {
      muted:
        "A grounded mid-tone — sober, considered, well-suited to body text accents, editorial layouts, or any context where restraint reads as quality.",
      clear:
        "A confident mid-tone — this is the workhorse register of the hue, and the band where most successful brand colors live.",
      electric:
        "A vivid mid-tone — distinctive enough to anchor an identity, saturated enough to demand a quiet supporting palette.",
    },
    deep: {
      muted:
        "A dim, atmospheric reading — closer to a colored shadow than a stated hue. Excellent as a near-black on dark UI or as a moody background.",
      clear:
        "A deep, weighted version of the hue — formal, considered, and pairs especially well with off-white and warm metallic accents.",
      electric:
        "A jewel tone — saturated and dark at once. This is the register of velvet, deep enamel, and old-world luxury.",
    },
  };

  return {
    lightness: LIGHTNESS_PROSE[lBand],
    saturation: SATURATION_PROSE[sBand],
    composite: compositeMap[lBand][sBand],
  };
}
