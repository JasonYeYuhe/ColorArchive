import { SITE_URL } from "@/src/lib/site-config";

const LAST_UPDATED = "April 7, 2026";

const sections = [
  {
    title: "1. Acceptance of Terms",
    content:
      "By accessing or using ColorArchive, you agree to be bound by these Terms of Service and our [Privacy Policy](/privacy/). If you do not agree to these terms, please do not use our services.",
  },
  {
    title: "2. Description of Service",
    content: `ColorArchive is a design productivity platform offering color tools and a curated color reference library. The service includes:

- **Free tools**: Color browsing, palette generation, brand color tools, WCAG audit, contrast checker, gradient builder, and more.
- **Pro subscription**: Unlimited AI palette generations, unmetered exports in all formats (free accounts get 3 per day), and WCAG audit report downloads.
- **API access**: Programmatic access to color data for developers.
- **iOS app**: A mobile companion app available on the Apple App Store.
- **Account features**: Favorites sync, preferences, usage stats, and subscription management when signed in.`,
  },
  {
    title: "3. Eligibility and User Accounts",
    content: `You must be at least 13 years old to use ColorArchive or create an account. By using the service, you represent that you meet this age requirement.

You may create an account using a magic link or Google OAuth. You are responsible for maintaining the security of your account. You agree to:

- Provide accurate information when creating your account.
- Notify us immediately of any unauthorized use of your account.
- Not share your account credentials with others.

We reserve the right to suspend or terminate accounts that violate these terms.`,
  },
  {
    title: "4. Purchases and Refunds",
    content: `Pro subscriptions and products on the web are sold through Lemon Squeezy, our Merchant of Record and payment processor. iOS in-app purchases are processed by Apple. All web purchases are subject to Lemon Squeezy's terms of service; iOS purchases are subject to Apple's.

- **Subscriptions**: Pro subscriptions (monthly or yearly) renew automatically. You may cancel at any time through your account's billing portal — go to Account → Manage Subscription. Cancellation takes effect at the end of the current billing period; you retain access until then. No partial refunds are issued for the remaining period.
- **Lifetime purchase**: The Pro Lifetime option is a one-time purchase that grants permanent Pro access. No recurring charges apply. "Lifetime" refers to the lifetime of the ColorArchive product/service.
- **Exceptions**: If you experience a technical issue preventing you from accessing Pro features, contact us and we will work to resolve it or issue a refund at our discretion.
- **Pricing**: We reserve the right to change pricing at any time. Price changes do not affect active subscriptions or completed purchases.
- **Apple App Store purchases**: If you purchase Pro through the ColorArchive iOS app, the transaction is processed by Apple. App Store purchases are governed by Apple's terms and conditions, including Apple's refund policies. To request a refund for an App Store purchase, please contact Apple Support directly.

For full details, see our [Refund Policy](/refund-policy/).`,
  },
  {
    title: "5. Intellectual Property",
    content: `All content on ColorArchive — including but not limited to text, graphics, logos, design, code, and color data — is the property of ColorArchive and is protected by applicable intellectual property laws.

- You may use our free tools for personal and commercial projects.
- Colors and palettes exported via Pro are licensed for your personal and commercial use. Exported assets remain yours even after cancellation.
- You may not reproduce, distribute, or create derivative works from the ColorArchive platform itself.`,
  },
  {
    title: "6. API Usage",
    content: `Access to the ColorArchive API is subject to the following conditions:

- API access may require authentication and is subject to rate limits.
- You may not use the API to scrape, replicate, or build a competing service.
- We reserve the right to revoke API access for misuse or excessive usage.
- API availability is provided on an "as is" basis and we do not guarantee uptime or response times.`,
  },
  {
    title: "7. Prohibited Conduct",
    content: `You agree not to:

- Use the service for any illegal purpose or in violation of any applicable laws.
- Attempt to gain unauthorized access to our systems or other users' accounts.
- Interfere with or disrupt the service or its infrastructure.
- Use automated scripts to access the service in a way that exceeds reasonable usage.
- Upload or transmit malicious code, viruses, or harmful data.
- Use the service to build a competing product or scrape data for commercial redistribution.`,
  },
  {
    title: "8. Disclaimer of Warranties",
    content:
      'ColorArchive is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not warrant that the service will be uninterrupted, error-free, or free of harmful components. Your use of the service is at your sole risk.',
  },
  {
    title: "9. Limitation of Liability",
    content:
      "To the maximum extent permitted by law, ColorArchive and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use the service, including but not limited to loss of data, revenue, or profits.",
  },
  {
    title: "10. Indemnification",
    content:
      "You agree to indemnify, defend, and hold harmless ColorArchive and its operator from any claims, damages, losses, liabilities, and expenses (including reasonable legal fees) arising out of or related to your use of the service, your violation of these Terms, or your violation of any third-party rights.",
  },
  {
    title: "11. Dispute Resolution",
    content: `In the event of any dispute arising from these Terms or your use of ColorArchive, you agree to first attempt to resolve the dispute informally by contacting us at **support@colorarchive.org**. We will attempt to resolve the dispute within 30 days.

If the dispute is not resolved informally, both parties agree to submit the dispute to binding arbitration administered under the rules of the Japan Commercial Arbitration Association (JCAA), with the seat of arbitration in Tokyo, Japan. The language of arbitration shall be English or Japanese at the claimant's election.

Notwithstanding the above, either party may seek injunctive or equitable relief in any court of competent jurisdiction. Nothing in this section limits your right to bring claims in small claims court if eligible.`,
  },
  {
    title: "12. Changes to These Terms",
    content:
      "We may update these Terms of Service from time to time. We will notify registered users of material changes via email. Continued use of the service after changes are posted constitutes acceptance of the updated terms.",
  },
  {
    title: "13. Governing Law",
    content:
      "These Terms of Service shall be governed by and construed in accordance with the laws of Japan. For consumers in the European Union, nothing in these Terms shall affect your mandatory consumer protection rights under the laws of your country of residence.",
  },
  {
    title: "14. General Provisions",
    content: `- **Severability**: If any provision of these Terms is found to be unenforceable, the remaining provisions shall remain in full force and effect.
- **Force Majeure**: We shall not be liable for any failure to perform due to causes beyond our reasonable control, including natural disasters, war, terrorism, pandemics, power outages, or internet disruptions.
- **Entire Agreement**: These Terms, together with the Privacy Policy and Refund Policy, constitute the entire agreement between you and ColorArchive.
- **No Waiver**: Our failure to enforce any provision of these Terms shall not be deemed a waiver of that provision.`,
  },
  {
    title: "15. Contact",
    content:
      "If you have questions about these Terms of Service, please contact us at **support@colorarchive.org**.",
  },
];

export function TermsPage() {
  return (
    <main id="main-content" className="px-4 pb-20 pt-6 sm:px-6 sm:pt-8">
      <div className="mx-auto max-w-3xl">
        <section className="rounded-[2rem] border border-black/6 bg-white/72 px-6 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-10 sm:py-14">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/85 px-3 py-1 text-xs font-medium tracking-[0.22em] text-neutral-500 uppercase">
            <span className="inline-block h-2 w-2 rounded-full bg-neutral-900" />
            Legal
          </div>

          <h1 className="text-3xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-4xl">
            Terms of Service
          </h1>

          <p className="mt-3 text-sm text-neutral-500">
            Last updated: {LAST_UPDATED}
          </p>

          <p className="mt-6 text-base leading-7 text-neutral-600">
            Welcome to ColorArchive. These Terms of Service (&quot;Terms&quot;)
            govern your access to and use of the website{" "}
            <a
              href={SITE_URL}
              className="font-medium text-neutral-950 underline decoration-neutral-300 underline-offset-2 hover:decoration-neutral-950"
            >
              colorarchive.org
            </a>
            , the ColorArchive iOS app, and all related services, tools, and
            products provided by ColorArchive (&quot;we&quot;, &quot;us&quot;,
            &quot;our&quot;).
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
