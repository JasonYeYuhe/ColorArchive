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

const CHAPTER_COLORS = CHAPTERS.map((chapter) => ({ ...chapter, color: fromWord(chapter.key) }));

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
