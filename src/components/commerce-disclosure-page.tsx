const LAST_UPDATED = "March 27, 2026";

const rows = [
  { label: "販売業者", value: "ColorArchive（個人事業）" },
  { label: "運営責任者", value: "叶宇和 YE YUHE"},
  {
    label: "所在地",
    value: "請求があった場合は遅滞なく開示いたします。",
  },
  {
    label: "連絡先",
    value:
      "メール: support@colorarchive.me\n請求があった場合は遅滞なく電話番号を開示いたします。",
  },
  {
    label: "販売価格",
    value: "各商品ページに表示された価格（税込）に準じます。",
  },
  {
    label: "商品代金以外の必要料金",
    value:
      "なし（インターネット接続料金はお客様のご負担となります）",
  },
  {
    label: "支払方法",
    value: "クレジットカード（Visa, Mastercard, American Express, JCB）",
  },
  {
    label: "支払時期",
    value: "ご注文時に即時決済されます。",
  },
  {
    label: "商品の引渡し時期",
    value:
      "決済完了後、即時ダウンロードまたはアカウントへの即時反映。",
  },
  {
    label: "返品・交換・キャンセル",
    value:
      "デジタル商品の性質上、購入後の返品・交換・キャンセルはお受けできません。商品に欠陥がある場合は support@colorarchive.me までご連絡ください。",
  },
  {
    label: "動作環境",
    value:
      "最新版の Chrome, Firefox, Safari, Edge 等のモダンブラウザ。",
  },
];

export function CommerceDisclosurePage() {
  return (
    <main id="main-content" className="px-4 pb-20 pt-6 sm:px-6 sm:pt-8">
      <div className="mx-auto max-w-3xl">
        <section className="rounded-[2rem] border border-black/6 bg-white/72 px-6 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-10 sm:py-14">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/85 px-3 py-1 text-xs font-medium tracking-[0.22em] text-neutral-500 uppercase">
            <span className="inline-block h-2 w-2 rounded-full bg-neutral-900" />
            Legal
          </div>

          <h1 className="text-3xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-4xl">
            特定商取引法に基づく表記
          </h1>
          <p className="mt-2 text-lg text-neutral-500">
            Commerce Disclosure
          </p>

          <p className="mt-3 text-sm text-neutral-500">
            Last updated: {LAST_UPDATED}
          </p>

          <div className="mt-10 overflow-hidden rounded-xl border border-black/8">
            {rows.map((row, i) => (
              <div
                key={row.label}
                className={`flex flex-col gap-1 px-5 py-4 sm:flex-row sm:gap-6 ${
                  i !== rows.length - 1
                    ? "border-b border-black/6"
                    : ""
                }`}
              >
                <div className="min-w-[200px] text-sm font-semibold text-neutral-950 shrink-0">
                  {row.label}
                </div>
                <div className="text-sm leading-7 text-neutral-600 whitespace-pre-line">
                  {row.value}
                </div>
              </div>
            ))}
          </div>

          <p className="mt-8 text-sm leading-7 text-neutral-500">
            This page is published in accordance with Japan&apos;s Act on
            Specified Commercial Transactions (特定商取引法). For questions,
            contact{" "}
            <a
              href="mailto:support@colorarchive.me"
              className="font-medium text-neutral-950 underline decoration-neutral-300 underline-offset-2 hover:decoration-neutral-950"
            >
              support@colorarchive.me
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
