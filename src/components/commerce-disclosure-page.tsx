import { refundPolicy, proSubscriptionConfig } from "@/src/lib/checkout-config";
import { SUPPORT_EMAIL } from "@/src/lib/site-config";

// Bump this whenever a row above changes substantively. A 特定商取引法 notice
// carrying a stale date is its own kind of misstatement — 2026-08-18 changed
// the refund row from "digital goods are non-refundable" to the 7-day guarantee
// /support had been advertising all along.
//
// 2026-09-06: five rows were saying things the checkout does not do. Every
// correction below was MEASURED against the live Lemon Squeezy checkout
// (isTestMode: false) or the source, not reasoned about:
//
//   販売価格          claimed 税込. Fetching the no-trial variant with a JP billing
//                     address returns subtotal 1999900, tax 199990 (JCT 10.00%),
//                     total 2199890 — tax is added ON TOP, and cart.tax_inclusive
//                     is false. The listed price is 税抜. (The trial variants show
//                     tax 0 only because their subtotal is 0, which is why the
//                     one-time variant is the honest instrument here.)
//   商品代金以外の必要料金 claimed なし, while JP customers pay that 10%.
//   支払時期          claimed "即時決済". Both sellable plans carry
//                     has_free_trial: true, trial_interval_count: 3, cart.total 0.
//                     Nobody is charged at order time.
//   商品の引渡し時期   claimed delivery follows payment. Access is granted at signup,
//                     during the free trial, BEFORE any charge.
//   支払方法          claimed credit card only. The checkout ships PayPal
//                     (paypalSubscriptionsEnabled: true, live client id,
//                     paypal-plan wiring present in the page).
//   動作環境          claimed iOS 16+. IPHONEOS_DEPLOYMENT_TARGET = 17.0.
const LAST_UPDATED = "September 6, 2026";

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
      `メール: ${SUPPORT_EMAIL}\n請求があった場合は遅滞なく電話番号を開示いたします。`,
    en: `Email: ${SUPPORT_EMAIL}. Phone number disclosed upon request.`,
  },
  {
    label: "販売価格",
    value:
      "各商品ページに表示された価格（税抜）に準じます。日本国内のお客様には、決済時に消費税（JCT）10% が加算されます。加算後の総額は決済画面でご確認いただけます。",
    en: "Pricing: As displayed on each product page, exclusive of tax. For customers in Japan, 10% Japanese Consumption Tax (JCT) is added at checkout; the tax-inclusive total is shown on the payment screen.",
  },
  {
    label: "商品代金以外の必要料金",
    value:
      "消費税（日本国内のお客様は 10%）。その他の手数料はありません。インターネット接続料金はお客様のご負担となります。",
    en: "Additional charges: Consumption tax (10% for customers in Japan). No other fees. Internet connection costs are borne by the customer.",
  },
  {
    label: "支払方法",
    value:
      "クレジットカード（Visa, Mastercard, American Express, JCB）および PayPal。ウェブでのご購入は Lemon Squeezy, Inc. が販売事業者（Merchant of Record）として販売・課金・請求書発行および消費税の取扱いを行います。iOS アプリ内でのご購入は Apple Inc. が同じ立場で処理します。ご利用いただける決済手段は決済画面に表示されるものが最新です。",
    en: "Payment: Credit card (Visa, Mastercard, Amex, JCB) and PayPal. For web purchases Lemon Squeezy, Inc. is the Merchant of Record — the seller — and handles billing, invoicing and consumption tax. In-app purchases on iOS are handled the same way by Apple Inc. The methods shown on the payment screen are authoritative.",
  },
  {
    label: "支払時期",
    value:
      `Pro プラン（月額・年額）には ${proSubscriptionConfig.monthly.trialDays} 日間の無料トライアルが付きます。お申し込み時には課金されず、トライアル終了時に初回のお支払いが発生し、以後は解約されるまで各請求期間の初日に自動更新・自動課金されます。買い切り商品および iOS アプリ内課金は、ご注文時に即時決済されます。`,
    en: `Payment timing: Pro monthly and yearly plans include a ${proSubscriptionConfig.monthly.trialDays}-day free trial. Nothing is charged at signup; the first payment is taken when the trial ends, and the plan then renews and charges automatically at the start of each billing period until cancelled. One-time purchases and iOS in-app purchases are charged immediately upon order.`,
  },
  {
    label: "商品の引渡し時期",
    value:
      "お申し込み完了後、直ちにアカウントへ反映されます（無料トライアル期間中を含み、初回のお支払い前からご利用いただけます）。ダウンロード商品は決済完了後すぐにご利用いただけます。",
    en: "Delivery: Access is activated on your account immediately after signup — including during the free trial, before the first payment. Downloadable items are available immediately after payment completes.",
  },
  {
    label: "返品・交換・キャンセル",
    value:
      `デジタル商品の性質上、原則として購入後の返品・交換はお受けできません。ただし Pro プランについては、初回のお支払いから ${refundPolicy.moneyBackDays} 日以内に ${SUPPORT_EMAIL} までご連絡いただいた場合、全額を返金いたします。${refundPolicy.moneyBackDays} 日経過後の返金はいたしかねます。商品に欠陥がある場合は期間を問わずご連絡ください。\nサブスクリプション（Pro プラン）はアカウントの請求ポータルからいつでも解約可能です。無料トライアル期間中（お申し込みから ${proSubscriptionConfig.monthly.trialDays} 日間）に解約された場合、課金は一切発生しません。トライアル終了後に解約された場合、解約は現在の請求期間終了時に有効となり、それまでは引き続きご利用いただけます。残存期間の日割り返金はいたしません。サブスクリプションは自動更新されます。\n【iOS アプリ内課金でご購入の場合】販売事業者は Apple Inc. となるため、当社では返金処理および解約手続きを行うことができません。返金は Apple の返金ポリシーに従い Apple へご請求いただき、解約は iOS の「設定 → Apple ID → サブスクリプション」からお手続きください。`,
    en: `Returns: Digital goods are generally non-refundable, but Pro purchases carry a ${refundPolicy.moneyBackDays}-day money-back guarantee — email ${SUPPORT_EMAIL} within ${refundPolicy.moneyBackDays} days of your first payment for a full refund. After that, sales are final. Contact support at any time for defective products. Pro subscriptions auto-renew and can be cancelled anytime from the account billing portal. Cancel during the ${proSubscriptionConfig.monthly.trialDays}-day free trial and you are never charged at all; cancel after it and cancellation takes effect at the end of the current billing period, with access retained until then. The unused remainder is not prorated. For purchases made through the iOS app, Apple Inc. is the seller — we cannot issue those refunds or cancel those subscriptions: request refunds from Apple under Apple's refund policy, and cancel via Settings → Apple ID → Subscriptions.`,
  },
  {
    label: "動作環境",
    value:
      "最新版の Chrome, Firefox, Safari, Edge 等のモダンブラウザ。iOS アプリは iOS 17 以降対応。",
    en: "Requirements: Modern browsers (Chrome, Firefox, Safari, Edge). iOS app requires iOS 17 or later.",
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
