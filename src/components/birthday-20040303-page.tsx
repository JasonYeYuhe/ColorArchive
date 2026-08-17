import { colors } from "@/src/data/colors";
import { findClosestArchiveColor } from "@/src/lib/color-relationships";
import { deltaE2000Hex, interpretDeltaE } from "@/src/lib/color-difference";
import { generateColorFromWord } from "@/src/lib/word-color";

/**
 * A private page for one person. Reachable only by typing the date.
 *
 * Every colour here is DERIVED, not chosen. Each comes from a word in her story,
 * put through the same deterministic hash that powers /word-to-color/, then
 * snapped to its nearest neighbour in the 5,446-colour archive. So the palette is
 * not a designer's idea of what her life looked like — it is what this site,
 * given her own words, actually returns. Run it in ten years and it returns the
 * same colours.
 *
 * The story text is hers, kept exactly as written. Not repunctuated, not tidied.
 *
 * TYPOGRAPHY. The site's display face is Fraunces, which has no CJK glyphs, so
 * on this page it silently never applied — the headings were falling through to
 * whatever the OS offered. `font-cjk` below declares that stack explicitly
 * instead of leaving it to chance, because "it looks right on my Mac" is not the
 * same as "it looks right".
 */

function fromWord(word: string) {
  const generated = generateColorFromWord(word)!;
  const nearest = findClosestArchiveColor(colors, generated.hex)!;
  return {
    word,
    // what the hash returns, before the archive gets involved
    generatedHex: generated.hex,
    name: nearest.name,
    hex: nearest.hex,
    id: nearest.id,
    family: nearest.family,
  };
}

const DATE_COLOR = fromWord("20040303");
const HER = fromWord("小猫");
const JUE = fromWord("觉觉");
const QIANG = fromWord("锵锵");
const AMS = fromWord("阿姆斯特丹");

// The honest number, not a flattering one. At ΔE 13.96 the site's own reading is
// 「明显不同的两种颜色」, and the page says so rather than rounding it towards
// something more sentimental — an earlier draft claimed the two kittens were "the
// same colour", which this very number contradicts.
const KITTEN_DELTA = deltaE2000Hex(JUE.generatedHex, QIANG.generatedHex)!;
const KITTEN_READING = interpretDeltaE(KITTEN_DELTA).zh.replace(/。$/, "");

// These resemblances fell out of the hash on its own. They are re-checked at build
// time below so the page cannot go on claiming them if a future change to the
// palette or the hash makes them untrue.
//
// Parsing the id needs care. The 5,376 chromatic ids are `{root}-{lightness}-{chroma}`
// (`moss-tone-soft`) and the 70 neutral ids are `{root}-gray-{lightness}`
// (`warm-gray-whisper`) — BOTH are three tokens, so token count cannot tell them
// apart. The second token can: no lightness band is named "gray" — verified against
// all 5,446 ids, where that one test partitions them 70 / 5,376 exactly. Reading a neutral
// as if it were chromatic would let the guard fire on two greys that differ in
// LIGHTNESS and print "same lightness band, differing only in chroma" — precisely
// the false claim it exists to prevent.
type ChromaticId = { root: string; lightness: string; chroma: string };

function parseChromaticId(id: string): ChromaticId | null {
  const t = id.split("-");
  if (t.length !== 3 || t[1] === "gray") return null;
  return { root: t[0], lightness: t[1], chroma: t[2] };
}

function rootOf(id: string): string {
  const t = id.split("-");
  return t[1] === "gray" ? `${t[0]}-gray` : t[0];
}

const HER_ID = parseChromaticId(HER.id);
const QIANG_ID = parseChromaticId(QIANG.id);

// Same hue root, same lightness band, different chroma band.
//
// The sentence this guards deliberately does NOT say how many chroma bands apart
// they are. An earlier draft said "只差一档彩度" — Soft and Vivid are two apart
// (Faint · Muted · Dust · Soft · Clear · Vivid · Bright · Pure), so that was simply
// false, and false in the flattering direction, which is the one this project's
// editorial rule exists to catch. Saying "they differ in chroma" needs no count and
// is true for as long as the guard holds.
const SAME_ROOT_AND_LIGHTNESS =
  HER_ID !== null &&
  QIANG_ID !== null &&
  HER_ID.root === QIANG_ID.root &&
  HER_ID.lightness === QIANG_ID.lightness &&
  HER_ID.chroma !== QIANG_ID.chroma;

const DATE_SHARES_ROOT_WITH_AMS = rootOf(DATE_COLOR.id) === rootOf(AMS.id);

// The comment above the block used to promise that all three resemblances were
// checked at build time while only two of them actually were. This is the third.
const ALL_THREE_IN_GREEN = [HER, JUE, QIANG].every((c) => c.family === "Green");

const CHAPTERS: { key: string; text: string }[] = [
  {
    key: "上海",
    text: "从前有一只神奇小猫 她出生在上海 她一出生就发现自己和别的小猫不一样 她会说话 还长得像人",
  },
  {
    key: "坏哥哥",
    text: "她快快乐乐聪聪明明可可爱爱 长到了十几岁 突然有一段时间 她被一个坏哥哥骗到了手 经常和坏哥哥玩 她也不知道自己的心意 所以和坏哥哥玩一段 不玩一段过了好几年",
  },
  {
    key: "分开",
    text: "她又长到了十六七岁 又喜欢上了另外一个坏哥哥 和坏哥哥相处了大半年之后 就分开了 后来知道 这个哥哥已经和别的姐姐结婚了",
  },
  {
    key: "日本",
    text: "在十八岁漂洋过海来到日本那一年 终于碰到了 陪伴她最久的一个好哥哥 好哥哥照顾她 爱护她 给她做饭 帮她收拾 过了两年",
  },
  {
    key: "阿姆斯特丹",
    text: "在第三年 她一只小猫 去到了荷兰的阿姆斯特丹 在她到的第二个月 她感觉身体不太对 好像有一只小生命被她孕育了出来 在十一月的时候 她的第一只小小猫 来到了她爱的小窝 她给这只小猫取名为觉觉 从此她成为了一只猫妈妈 承担起了奶大小猫的责任 她一直都是一只合格的猫妈妈 觉觉健健康康快快乐乐地长大了 后面好哥哥也来到了比利时 经常和小猫出去玩 就把觉觉放在家里一只小小猫 但是觉觉很乖 不吵也不闹 慢慢也就长大了 最后小猫回了上海 小小猫被好哥哥带回了日本",
  },
  {
    key: "锵锵",
    text: "再后来 她再次踏上了日本的土地 这一次她搬进了好哥哥给她布置好的小窝 并且还有一件好事 第二只小小猫也来到了小猫的身边 和她生活在了一起 她又担负起了奶小猫的重大责任 有了上一只小小猫的经验 她轻轻松松就把这只被命名为锵锵的二少小猫奶大了 这只小小猫 很粘人 可能从小就一直生活在妈妈小猫和好哥哥的身边 喜欢在他们身边蹭蹭睡觉 叫叫求摸摸",
  },
  {
    key: "小猫的故事",
    text: "小猫的故事还在继续 好哥哥也会继续照顾她爱护她 两只小小猫也在他们的周围快快乐乐健健康康幸福生活",
  },
];

// Characters, spaces removed. Her text uses spaces where punctuation would go, and
// counting them would make every number on this page slightly wrong.
const chars = (s: string) => s.replace(/\s/g, "").length;

const CHAPTER_COLORS = CHAPTERS.map((chapter, index) => ({
  ...chapter,
  index,
  length: chars(chapter.text),
  color: fromWord(chapter.key),
}));

const STORY_LENGTH = CHAPTER_COLORS.reduce((sum, c) => sum + c.length, 0);
const LONGEST_TWO = [...CHAPTER_COLORS].sort((a, b) => b.length - a.length).slice(0, 2);
const LONGEST_TWO_SHARE = (LONGEST_TWO[0].length + LONGEST_TWO[1].length) / STORY_LENGTH;

/**
 * Where she went, in the order she wrote it.
 *
 * NOT a map. A map would need coordinates, and coordinates are not in her story —
 * the moment this page reaches for a fact she did not write, it stops being made of
 * her words. This is the sequence of place names as they appear, nothing more.
 *
 * The repeats are the point and are not decoration: 上海 and 日本 each occur twice
 * because she returned to both, so two pairs of swatches come out byte-identical.
 * JOURNEY_RETURNS below re-checks that at build time rather than trusting the eye.
 */
const JOURNEY = ["上海", "日本", "阿姆斯特丹", "比利时", "上海", "日本"].map((place, index) => ({
  place,
  index,
  color: fromWord(place),
}));

// What this guards is that the route still REPEATS — that stops 1 and 5 are the same
// place, and 2 and 6 are. Comparing the two hexes instead would be theatre: both come
// from fromWord("上海"), so a hex check can never fail and would prove only that the
// hash is a function. The place names are the part a future edit could change.
const JOURNEY_RETURNS =
  JOURNEY[0].place === JOURNEY[4].place &&
  JOURNEY[1].place === JOURNEY[5].place &&
  JOURNEY[0].color.hex === JOURNEY[4].color.hex &&
  JOURNEY[1].color.hex === JOURNEY[5].color.hex;

// The two places she has lived longest, and the distance between their colours.
const HOME_DELTA = deltaE2000Hex(
  JOURNEY[0].color.generatedHex,
  JOURNEY[1].color.generatedHex,
)!;
const HOME_READING = interpretDeltaE(HOME_DELTA).zh.replace(/。$/, "");

/**
 * Who appears, and how often.
 *
 * Longest match first, no overlaps. A naive substring count says 小猫 appears 19
 * times, but seven of those are inside 小小猫 — the kittens, not her. An outside
 * reviewer proposed baking 19 into an assertion, which would have made the page
 * permanently, confidently wrong about the person it is for.
 *
 * 坏哥哥 stays in this list. It is her story and she wrote them into it; dropping
 * them would be editing her. It is only counted, though — the ΔE between 好哥哥 and
 * 坏哥哥 is a real number and a birthday page is not the place to feature it.
 */
const CAST_NAMES = ["小小猫", "猫妈妈", "好哥哥", "坏哥哥", "小猫", "觉觉", "锵锵"];

function countCast(text: string) {
  const byLongest = [...CAST_NAMES].sort((a, b) => b.length - a.length);
  const counts = new Map(CAST_NAMES.map((name) => [name, 0]));
  let i = 0;
  while (i < text.length) {
    const hit = byLongest.find((name) => text.startsWith(name, i));
    if (hit) {
      counts.set(hit, counts.get(hit)! + 1);
      i += hit.length;
    } else {
      i += 1;
    }
  }
  return counts;
}

const CAST_COUNTS = countCast(CHAPTERS.map((c) => c.text).join("").replace(/\s/g, ""));
const CAST = CAST_NAMES.map((name) => ({ name, count: CAST_COUNTS.get(name)! }))
  .filter((entry) => entry.count > 0)
  .sort((a, b) => b.count - a.count);
const CAST_TOTAL = CAST.reduce((sum, entry) => sum + entry.count, 0);

/**
 * The whole story as a single input.
 *
 * The page hashes the date, the chapter titles and the names — every fragment except
 * the 627 characters they are fragments OF. Feeding the joined text in as one string
 * is the one input that is unambiguously hers rather than something someone chose to
 * extract, so it closes the page instead of opening it.
 *
 * It is called what it is: the colour of these 627 characters. Not "her real colour".
 */
const STORY_TEXT = CHAPTERS.map((c) => c.text).join("").replace(/\s/g, "");
const WHOLE_STORY = fromWord(STORY_TEXT);

// Her palette as the site would actually export it — the same custom-property shape
// the Complete Archive ships. Nothing bespoke; this is the product, pointed at her.
// Derived from what the page actually shows, not hand-listed — the export and the
// page cannot disagree about which colours exist. Deduped by archive id, because two
// different words can land on the same square (上海 appears twice in the route).
// Named by archive id, which is how the Complete Archive names its tokens; the word
// that produced each one rides along as a comment.
const PALETTE_SOURCES: { color: ReturnType<typeof fromWord>; label: string }[] = [
  { color: DATE_COLOR, label: "20040303" },
  ...CHAPTER_COLORS.map((c) => ({ color: c.color, label: c.key })),
  { color: HER, label: "小猫" },
  { color: JUE, label: "觉觉" },
  { color: QIANG, label: "锵锵" },
  ...JOURNEY.map((stop) => ({ color: stop.color, label: stop.place })),
  // Not `.word` — that is all 627 characters, and it would run into the CSS comment.
  { color: WHOLE_STORY, label: "整篇故事" },
];

const PALETTE_TOKENS = PALETTE_SOURCES.filter(
  (entry, index) =>
    PALETTE_SOURCES.findIndex((other) => other.color.id === entry.color.id) === index,
);

const PALETTE_CSS = [
  ":root {",
  ...PALETTE_TOKENS.map((e) => `  --ca-${e.color.id}: ${e.color.hex}; /* ${e.label} */`),
  "}",
].join("\n");

// text-neutral-600 / dark:text-neutral-400 — the caption tier started at
// neutral-400 on light, which measured 2.3:1. Small type needs the same 4.5:1 as
// body text, and this pairing gives ~7:1 in both themes.
const CAPTION = "text-neutral-600 dark:text-neutral-400";

// The house eyebrow style is a Latin idiom — `uppercase` does nothing to Han
// characters, and the wide `tracking` it pairs with prises them apart into
// unrelated glyphs. Every label on this page is Chinese, so there is only the one
// style here, with spacing a Han face can take. The date line above sets its own
// wider tracking because "2004 · 03 · 03" really is Latin-ish.
const EYEBROW_CJK = `text-xs font-medium tracking-[0.08em] ${CAPTION}`;

function Swatch({
  color,
  label,
  size = "h-24",
}: {
  color: { name: string; hex: string; word: string };
  label?: string;
  size?: string;
}) {
  return (
    <div className="min-w-0">
      <div
        className={`${size} w-full rounded-[1.2rem] border border-black/6 dark:border-white/10`}
        style={{ backgroundColor: color.hex }}
        aria-hidden="true"
      />
      <div className={`mt-3 ${EYEBROW_CJK}`}>{label ?? color.word}</div>
      <div className="font-cjk mt-1 text-sm font-medium text-neutral-950 dark:text-white">
        {color.name}
      </div>
      <div className={`mt-0.5 font-mono text-xs ${CAPTION}`}>{color.hex}</div>
    </div>
  );
}

export function Birthday20040303Page() {
  return (
    <main lang="zh-Hans" className="font-cjk px-4 py-12 sm:px-6 sm:py-20">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-16">
        {/* The date itself, as a colour */}
        <header className="text-center">
          <div className={`text-[11px] font-medium uppercase tracking-[0.3em] ${CAPTION}`}>
            2004 · 03 · 03
          </div>
          <div
            className="mx-auto mt-8 h-40 w-full max-w-md rounded-[2rem] border border-black/6 shadow-[0_24px_80px_rgba(15,23,42,0.10)] dark:border-white/10 dark:shadow-none sm:h-52"
            style={{ backgroundColor: DATE_COLOR.hex }}
            aria-hidden="true"
          />
          <h1 className="mt-8 text-3xl font-normal leading-relaxed tracking-[0.02em] text-neutral-950 dark:text-white sm:text-5xl">
            这一天的颜色
          </h1>
          {/* Both hexes, because they are not the same one. The hash returns
              generatedHex; the block above shows the nearest colour in the archive,
              which is a hair away (ΔE ~3.8). Printing only the archive hex under a
              line saying "this is what it computed" would be a small lie. */}
          <p className={`mt-4 font-mono text-sm ${CAPTION}`}>
            {DATE_COLOR.generatedHex} → {DATE_COLOR.name} · {DATE_COLOR.hex}
          </p>
          <p className="mx-auto mt-7 max-w-lg text-[15px] leading-8 text-neutral-700 dark:text-neutral-200">
            把 20040303 交给这个网站,算出来是 {DATE_COLOR.generatedHex}
            ;档案里离它最近的一格,就是上面这个。不是挑的,是算的——十年后再算一次,还是它。
          </p>
        </header>

        {/* Her story */}
        <section className="flex flex-col gap-11">
          <h2 className={`text-center ${EYEBROW_CJK}`}>一只神奇小猫的故事</h2>

          {CHAPTER_COLORS.map((chapter) => (
            <article key={chapter.key} className="flex flex-col gap-4 sm:flex-row sm:gap-7">
              <div className="flex shrink-0 items-center gap-3 sm:w-24 sm:flex-col sm:items-start sm:gap-2">
                <div
                  className="h-9 w-9 shrink-0 rounded-full border border-black/6 dark:border-white/10"
                  style={{ backgroundColor: chapter.color.hex }}
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <h3 className="text-sm font-medium text-neutral-950 dark:text-white">
                    {chapter.key}
                  </h3>
                  <div className={`mt-0.5 font-mono text-[11px] ${CAPTION}`}>{chapter.color.hex}</div>
                </div>
              </div>

              {/* max-w-[34em] — CJK reads best around 34-38 characters a line; the
                  full 3xl column ran to 44 and left orphans. */}
              <p className="min-w-0 max-w-[34em] flex-1 text-[15px] leading-9 tracking-[0.02em] text-neutral-700 dark:text-neutral-200">
                {chapter.text}
              </p>
            </article>
          ))}
        </section>

        {/* What the hash noticed on its own */}
        <section className="rounded-[1.75rem] border border-black/6 bg-white/82 p-6 shadow-[0_18px_48px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-neutral-900/80 dark:shadow-none sm:p-8">
          <h2 className={EYEBROW_CJK}>算出来的巧合</h2>

          <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3">
            <Swatch color={HER} label="小猫" />
            <Swatch color={JUE} label="觉觉" />
            <Swatch color={QIANG} label="锵锵" />
          </div>

          <div className="mt-7 flex flex-col gap-4 text-[15px] leading-8 text-neutral-700 dark:text-neutral-200">
            {ALL_THREE_IN_GREEN ? (
              <p>三个互不相干的名字,分别去算,全都落进了绿色族。</p>
            ) : null}

            {SAME_ROOT_AND_LIGHTNESS ? (
              <p>
                小猫是 <span className="font-mono text-sm">{HER.id}</span>,锵锵是{" "}
                <span className="font-mono text-sm">{QIANG.id}</span>
                ——同一个色根,同一档明度,分开的只是浓淡。
              </p>
            ) : null}

            <p>
              但她们并不是同一个颜色。觉觉和锵锵之间的色差是 ΔE {KITTEN_DELTA.toFixed(1)},按这个网站
              自己的判读,那是「{KITTEN_READING}」。同一个族里,谁也不是谁的影子。
            </p>

            {DATE_SHARES_ROOT_WITH_AMS ? (
              <p>
                还有一个:<span className="font-mono text-sm">{DATE_COLOR.id}</span> 和{" "}
                <span className="font-mono text-sm">{AMS.id}</span>
                ——她出生的那一天,和她成为妈妈的那一章,算出来是同一个色根。
              </p>
            ) : null}
          </div>
        </section>

        {/* Where she went — the order she wrote, nothing added */}
        <section>
          <h2 className={EYEBROW_CJK}>她走过的地方</h2>
          <p className={`mt-3 text-[15px] leading-8 text-neutral-700 dark:text-neutral-200`}>
            按她写下的先后,一共 {JOURNEY.length} 站。
          </p>

          <ol className="mt-6 flex flex-wrap gap-x-2 gap-y-4">
            {JOURNEY.map((stop) => (
              <li key={stop.index} className="flex min-w-0 flex-1 basis-24 flex-col gap-2">
                <div
                  className="h-14 w-full rounded-[0.9rem] border border-black/6 dark:border-white/10"
                  style={{ backgroundColor: stop.color.hex }}
                  aria-hidden="true"
                />
                <div className="text-[13px] font-medium text-neutral-950 dark:text-white">
                  {stop.place}
                </div>
                <div className={`font-mono text-[10px] ${CAPTION}`}>{stop.color.hex}</div>
              </li>
            ))}
          </ol>

          <div className="mt-6 flex flex-col gap-4 text-[15px] leading-8 text-neutral-700 dark:text-neutral-200">
            {JOURNEY_RETURNS ? (
              <p>
                第 1 站和第 5 站是同一个 <span className="font-mono text-sm">{JOURNEY[0].color.hex}</span>
                ,第 2 站和第 6 站是同一个{" "}
                <span className="font-mono text-sm">{JOURNEY[1].color.hex}</span>
                ——不是排版重复,是她真的回去了,同样的字算出同样的颜色。
              </p>
            ) : null}
            <p>
              上海和日本之间的色差是 ΔE {HOME_DELTA.toFixed(1)},按这个网站自己的判读,那是「
              {HOME_READING}」。她住得最久的两个地方,算出来几乎在色轮的两端。
            </p>
          </div>
        </section>

        {/* The shape of the story — its own proportions, shown rather than evened out */}
        <section>
          <h2 className={EYEBROW_CJK}>这个故事的形状</h2>
          <p className="mt-3 text-[15px] leading-8 text-neutral-700 dark:text-neutral-200">
            {CHAPTER_COLORS.length} 章,{STORY_LENGTH} 个字。
            {LONGEST_TWO.map((c) => c.key).join("和")}两章占了{" "}
            {(LONGEST_TWO_SHARE * 100).toFixed(1)}%——她在那两段里写得最多。
          </p>

          {/* Segment widths are the real proportions; the bar IS the data */}
          <div
            className="mt-6 flex h-10 w-full overflow-hidden rounded-[0.6rem] border border-black/6 dark:border-white/10"
            role="img"
            aria-label={`七章篇幅比例:${CHAPTER_COLORS.map((c) => `${c.key} ${c.length} 字`).join("、")}`}
          >
            {CHAPTER_COLORS.map((chapter) => (
              <div
                key={chapter.key}
                style={{
                  backgroundColor: chapter.color.hex,
                  width: `${(chapter.length / STORY_LENGTH) * 100}%`,
                }}
              />
            ))}
          </div>

          <ul className={`mt-4 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[11px] ${CAPTION}`}>
            {CHAPTER_COLORS.map((chapter) => (
              <li key={chapter.key}>
                {String(chapter.index + 1).padStart(2, "0")} · {chapter.key} · {chapter.length} 字
              </li>
            ))}
          </ul>
        </section>

        {/* How often each name is written */}
        <section>
          <h2 className={EYEBROW_CJK}>称呼,和它们出现的次数</h2>
          {/* "称呼" not "角色" on purpose: 小猫 and 猫妈妈 are plainly the same person
              in two states, and deciding how many people this story contains is not
              something a word count can do — nor something this page should do for her. */}
          <p className="mt-3 text-[15px] leading-8 text-neutral-700 dark:text-neutral-200">
            {CAST.length} 个称呼,一共写了 {CAST_TOTAL} 次。
          </p>

          <ul className="mt-6 flex flex-col gap-2.5">
            {CAST.map((entry) => {
              const color = fromWord(entry.name);
              return (
                <li key={entry.name} className="flex items-center gap-3">
                  <span className="w-16 shrink-0 text-[13px] font-medium text-neutral-950 dark:text-white">
                    {entry.name}
                  </span>
                  <span
                    className="h-3.5 rounded-full border border-black/6 dark:border-white/10"
                    style={{
                      backgroundColor: color.hex,
                      width: `${(entry.count / CAST[0].count) * 72}%`,
                      minWidth: "0.875rem",
                    }}
                    aria-hidden="true"
                  />
                  <span className={`font-mono text-[11px] ${CAPTION}`}>{entry.count}</span>
                </li>
              );
            })}
          </ul>

          <p className="mt-5 text-[15px] leading-8 text-neutral-700 dark:text-neutral-200">
            「小猫」写了 {CAST_COUNTS.get("小猫")} 次,「小小猫」写了 {CAST_COUNTS.get("小小猫")}{" "}
            次。按字面去数会把后者也算进前者,那样「小猫」会变成{" "}
            {CAST_COUNTS.get("小猫")! + CAST_COUNTS.get("小小猫")!} 次——她们是分开数的。
          </p>
        </section>

        {/* The 627 characters themselves, as one input */}
        <section className="rounded-[1.75rem] border border-black/6 bg-white/82 p-6 shadow-[0_18px_48px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-neutral-900/80 dark:shadow-none sm:p-8">
          <h2 className={EYEBROW_CJK}>这 {STORY_LENGTH} 个字的颜色</h2>
          <div
            className="mt-5 h-24 w-full rounded-[1.2rem] border border-black/6 dark:border-white/10"
            style={{ backgroundColor: WHOLE_STORY.hex }}
            aria-hidden="true"
          />
          <p className={`mt-4 font-mono text-sm ${CAPTION}`}>
            {WHOLE_STORY.generatedHex} → {WHOLE_STORY.name} · {WHOLE_STORY.hex}
          </p>
          <p className="mt-4 text-[15px] leading-8 text-neutral-700 dark:text-neutral-200">
            上面每一格颜色都来自故事里的一个词。这一格不一样——它的输入是整篇,一个字都没挑。
          </p>

          <details className="mt-6">
            <summary className={`cursor-pointer ${EYEBROW_CJK}`}>
              这一页用到的 {PALETTE_TOKENS.length} 个颜色
            </summary>
            <pre className="mt-4 overflow-x-auto rounded-[0.9rem] bg-neutral-950/4 p-4 font-mono text-[11px] leading-6 text-neutral-700 dark:bg-white/5 dark:text-neutral-300">
              {PALETTE_CSS}
            </pre>
          </details>
        </section>

        <section className="text-center">
          <p className="mx-auto max-w-md text-[15px] leading-9 text-neutral-700 dark:text-neutral-200">
            生日快乐。
            <br />
            故事还在继续,颜色也是。
          </p>
        </section>

        <footer className="pb-2 text-center">
          <div className={`font-mono text-[11px] ${CAPTION}`}>
            colorarchive.org/20040303
          </div>
        </footer>
      </div>
    </main>
  );
}
