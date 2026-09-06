"use client";

import { SITE_URL } from "@/src/lib/site-config";
import { isPlanTemporarilyUnavailable } from "@/src/lib/checkout-config";

const LAST_UPDATED = "April 7, 2026";

const sections = [
  {
    title: "1. Pro Subscriptions",
    content: `Pro subscriptions (monthly or yearly) renew automatically at the end of each billing period.

- **Cancellation**: You may cancel your subscription at any time through your account's billing portal (Account → Manage Subscription). Cancellation takes effect at the end of the current billing period — you retain full access until then.
- **No partial refunds**: We do not issue prorated refunds for the remaining portion of a billing period after cancellation.
- **7-day guarantee**: If you are not satisfied with Pro within 7 days of your first subscription payment, contact us for a full refund.

This is consistent with the consumer protection provisions under Japan's Act on Specified Commercial Transactions (特定商取引法). For full details, see our [Commerce Disclosure](/commerce-disclosure/).`,
  },
  {
    title: "2. Pro Lifetime",
    content: `The Pro Lifetime option is a one-time purchase granting permanent Pro access.\n\n${isPlanTemporarilyUnavailable("lifetime") ? "> **Currently unavailable.** New Lifetime purchases are switched off while we fix a defect that could revoke a Lifetime entitlement when an earlier subscription ends. Monthly and yearly are unaffected." : ""}

- **7-day guarantee**: If you are not satisfied within 7 days of purchase, contact us for a full refund.
- **After 7 days**: All lifetime purchases are final. Since Pro features are accessible immediately upon purchase, refunds are not available after the 7-day window.`,
  },
  {
    title: "3. Apple App Store Purchases",
    content: `If you purchased Pro through the ColorArchive iOS app, your transaction was processed by Apple, not directly by us.

- **Refund requests**: All refund requests for App Store purchases must be submitted to Apple directly through [reportaproblem.apple.com](https://reportaproblem.apple.com) or by contacting Apple Support.
- **We cannot process refunds** for purchases made through the App Store, as Apple controls the billing relationship.
- **Subscription management**: You can manage or cancel App Store subscriptions in your iPhone Settings → Apple ID → Subscriptions.`,
  },
  {
    title: "4. Exceptions",
    content: `We will consider a refund or resolution in the following cases:

- **Technical issues**: If a technical problem on our end prevents you from accessing Pro features, contact us and we will work to resolve the issue or issue a full refund.
- **Duplicate purchase**: If you accidentally purchased the same plan twice, contact us for a refund of the duplicate.`,
  },
  {
    title: "5. EU Consumer Rights",
    content: `If you are a consumer in the European Union, you may have a 14-day cooling-off period under the Consumer Rights Directive (2011/83/EU) for online purchases.

By purchasing Pro and immediately accessing digital content, you acknowledge that the digital content is delivered immediately upon purchase and that you thereby waive your right of withdrawal under Article 16(m) of the Directive, to the extent permitted by law.

If you did not receive access or the product is defective, your statutory rights under EU consumer protection law remain unaffected. In such cases, please contact us for a resolution.`,
  },
  {
    title: "6. How to Request a Refund",
    content: `To request a refund for a web purchase (processed by Lemon Squeezy), please contact us at **support@colorarchive.org** with:

- Your order confirmation email or order ID.
- A description of the issue you experienced.
- Any relevant screenshots or error messages.

For iOS in-app purchases, refunds must be requested directly through Apple at [reportaproblem.apple.com](https://reportaproblem.apple.com) — we cannot process App Store refunds on your behalf.

We aim to respond to all web refund requests within 2 business days.`,
  },
  {
    title: "7. Payment Provider",
    content:
      "Web purchases are processed through Lemon Squeezy (our Merchant of Record). Refunds are returned to the same payment method used for the original purchase. Depending on your card issuer and bank, it may take 5–10 business days for the refund to appear on your statement. iOS in-app purchases are handled by Apple under Apple's refund policy.",
  },
  {
    title: "8. Changes to This Policy",
    content:
      "We may update this Refund Policy from time to time. The updated policy will be posted on this page with a revised date. Material changes will be communicated to registered users via email.",
  },
  {
    title: "9. Contact",
    content:
      "If you have questions about our refund policy, please contact us at **support@colorarchive.org**.",
  },
];

export function RefundPolicyPage() {
  return (
    <main id="main-content" className="px-4 pb-20 pt-6 sm:px-6 sm:pt-8">
      <div className="mx-auto max-w-3xl">
        <section className="rounded-[2rem] border border-black/6 bg-white/72 px-6 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-10 sm:py-14">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/85 px-3 py-1 text-xs font-medium tracking-[0.22em] text-neutral-500 uppercase">
            <span className="inline-block h-2 w-2 rounded-full bg-neutral-900" />
            Legal
          </div>

          <h1 className="text-3xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-4xl">
            Refund Policy
          </h1>

          <p className="mt-3 text-sm text-neutral-500">
            Last updated: {LAST_UPDATED}
          </p>

          <p className="mt-6 text-base leading-7 text-neutral-600">
            This Refund Policy outlines the terms for refunds and cancellations
            for products and services purchased on{" "}
            <a
              href={SITE_URL}
              className="font-medium text-neutral-950 underline decoration-neutral-300 underline-offset-2 hover:decoration-neutral-950"
            >
              colorarchive.org
            </a>{" "}
            and the ColorArchive iOS app.
          </p>

          <div className="mt-10 space-y-8">
            {sections.map((section) => (
              <div key={section.title}>
                <h2 className="text-lg font-semibold text-neutral-950">
                  {section.title}
                </h2>
                <div
                  className="mt-3 space-y-3 text-sm leading-7 text-neutral-600 [&_strong]:font-semibold [&_strong]:text-neutral-800 [&_a]:font-medium [&_a]:text-neutral-950 [&_a]:underline [&_a]:decoration-neutral-300 [&_a]:underline-offset-2 hover:[&_a]:decoration-neutral-950 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1"
                  dangerouslySetInnerHTML={{
                    __html: section.content
                      .replace(
                        /\*\*(.*?)\*\*/g,
                        "<strong>$1</strong>",
                      )
                      .replace(
                        /\[(.*?)\]\((.*?)\)/g,
                        '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
                      )
                      .replace(/^- (.*)/gm, "<li>$1</li>")
                      .replace(
                        /(<li>.*<\/li>\n?)+/g,
                        (match) => `<ul>${match}</ul>`,
                      )
                      .replace(/\n\n/g, "</p><p>")
                      .replace(/^(?!<)/, "<p>")
                      .replace(/(?!>)$/, "</p>"),
                  }}
                />
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
