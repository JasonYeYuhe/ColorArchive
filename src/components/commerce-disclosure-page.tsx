import { refundPolicy } from "@/src/lib/checkout-config";

// Bump this whenever a row above changes substantively. A 特定商取引法 notice
// carrying a stale date is its own kind of misstatement — 2026-08-18 changed
// the refund row from "digital goods are non-refundable" to the 7-day guarantee
// /support had been advertising all along.
const LAST_UPDATED = "August 18, 2026";

const rows = [
  {
    label: "販売業者",
    value: "ColorArchive（個人事業）",
    en: "Business name: ColorArchive (sole proprietorship)",
  },
  {
    label: "運営責任者",
    value: "叶宇和 YE YUHE",
    en: "Operator: Ye Yuhe",
  },
  {
    label: "所在地",
    value: "請求があった場合は遅滞なく開示いたします。",
    en: "Address: Disclosed upon request without delay.",
  },
  {
    label: "連絡先",
    value:
      "メール: support@colorarchive.org\n請求があった場合は遅滞なく電話番号を開示いたします。",
    en: "Email: support@colorarchive.org. Phone number disclosed upon request.",
  },
  {
    label: "販売価格",
    value: "各商品ページに表示された価格（税込）に準じます。",
    en: "Pricing: As displayed on each product page (tax included).",
  },
  {
    label: "商品代金以外の必要料金",
    value:
      "なし（インターネット接続料金はお客様のご負担となります）",
    en: "Additional fees: None (internet connection costs borne by the customer).",
  },
  {
    label: "支払方法",
    value:
      "クレジットカード（Visa, Mastercard, American Express, JCB）— 決済代行: Lemon Squeezy, Inc.（Merchant of Record）。iOS アプリ内課金は Apple Inc. が処理します。",
    en: "Payment: Credit card (Visa, Mastercard, Amex, JCB) via Lemon Squeezy, Inc. (Merchant of Record). iOS in-app purchases are processed by Apple Inc.",
  },
  {
    label: "支払時期",
    value: "ご注文時に即時決済されます。",
    en: "Payment timing: Charged immediately upon order.",
  },
  {
    label: "商品の引渡し時期",
    value:
      "決済完了後、即時ダウンロードまたはアカウントへの即時反映。",
    en: "Delivery: Instant download or immediate account activation after payment.",
  },
  {
    label: "返品・交換・キャンセル",
    value:
      `デジタル商品の性質上、原則として購入後の返品・交換はお受けできません。ただし Pro プランについては、購入日から ${refundPolicy.moneyBackDays} 日以内に support@colorarchive.org までご連絡いただいた場合、全額を返金いたします。${refundPolicy.moneyBackDays} 日経過後の返金はいたしかねます。商品に欠陥がある場合は期間を問わずご連絡ください。\nサブスクリプション（Pro プラン）はアカウントの請求ポータルからいつでも解約可能です。解約は現在の請求期間終了時に有効となり、それまでは引き続きご利用いただけます。残存期間の日割り返金はいたしません。サブスクリプションは自動更新されます。`,
    en: `Returns: Digital goods are generally non-refundable, but Pro purchases carry a ${refundPolicy.moneyBackDays}-day money-back guarantee — email support within ${refundPolicy.moneyBackDays} days of purchase for a full refund. After that, sales are final. Contact support at any time for defective products. Pro subscriptions auto-renew and can be cancelled anytime; cancellation takes effect at the end of the current billing period and you keep access until then. The unused remainder is not prorated.`,
  },
  {
    label: "動作環境",
    value:
      "最新版の Chrome, Firefox, Safari, Edge 等のモダンブラウザ。iOS アプリは iOS 16 以降対応。",
    en: "Requirements: Modern browsers (Chrome, Firefox, Safari, Edge). iOS app requires iOS 16+.",
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
                <div className="text-sm leading-7 text-neutral-600">
                  <div className="whitespace-pre-line">{row.value}</div>
                  <div className="mt-1 text-xs text-neutral-400 italic">
                    {row.en}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-8 text-sm leading-7 text-neutral-500">
            This page is published in accordance with Japan&apos;s Act on
            Specified Commercial Transactions (特定商取引法). For questions,
            contact{" "}
            <a
              href="mailto:support@colorarchive.org"
              className="font-medium text-neutral-950 underline decoration-neutral-300 underline-offset-2 hover:decoration-neutral-950"
            >
              support@colorarchive.org
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
