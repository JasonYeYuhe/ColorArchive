import { SITE_URL } from "@/src/lib/site-config";

const LAST_UPDATED = "April 7, 2026";

const sections = [
  {
    title: "1. Information We Collect",
    content: `When you create an account via magic link or Google OAuth, we store your email address and basic profile information necessary to provide the service. We also collect:

- **Usage data**: Pages visited, features used, and interaction patterns to improve the product.
- **Favorites and preferences**: Colors you save or mark as favorites, synced to your account if logged in, or stored locally in your browser if not.
- **Purchase information**: When you buy a product through Stripe (our payment processor), we receive your name, email, and transaction details. We do not store payment card numbers.
- **Cookies**: We use a session cookie to keep you logged in. We do not use third-party tracking cookies. For details, see our [Cookie Policy](/cookie-policy/).
- **Mobile app data**: If you use the ColorArchive iOS app, we may collect device identifiers and purchase data through Apple StoreKit for in-app purchases. We do not collect location data, contacts, or health data.`,
  },
  {
    title: "2. How We Use Your Information",
    content: `We use the information we collect to:

- Provide, maintain, and improve ColorArchive and its tools.
- Process purchases and deliver digital products.
- Sync your favorites and preferences across devices.
- Send transactional emails (order confirmations, magic link login) via Resend, our email delivery provider.
- Analyze aggregate usage to guide product development.

We do not sell your personal information to third parties.`,
  },
  {
    title: "3. Third-Party Services",
    content: `ColorArchive integrates with the following third-party services:

- **Stripe** — Payment processing. We do not store payment card details. Subject to [Stripe's Privacy Policy](https://stripe.com/privacy).
- **Google OAuth** — Optional sign-in. We receive your email and display name. Subject to [Google's Privacy Policy](https://policies.google.com/privacy).
- **Vercel** — Hosting and analytics. Subject to [Vercel's Privacy Policy](https://vercel.com/legal/privacy-policy).
- **DigitalOcean** — Backend server hosting. Subject to [DigitalOcean's Privacy Policy](https://www.digitalocean.com/legal/privacy-policy).
- **Resend** — Transactional email delivery. Subject to [Resend's Privacy Policy](https://resend.com/legal/privacy-policy).
- **Apple App Store** — iOS app distribution and in-app purchases. Subject to [Apple's Privacy Policy](https://www.apple.com/legal/privacy/).
- **Pinterest API** — Optional integration that allows users to save color palettes and pins to their own Pinterest boards. We access only the data explicitly authorized by the user via Pinterest OAuth. We do not store, cache, or retain any Pinterest user data on our servers beyond the active session. We do not sell, share, or transfer Pinterest data to any third party. Subject to [Pinterest's Privacy Policy](https://policy.pinterest.com/privacy-policy) and [Pinterest Developer Guidelines](https://policy.pinterest.com/developer-guidelines).

These services may collect information as described in their respective privacy policies.`,
  },
  {
    title: "4. Pinterest API Data Use",
    content: `If you choose to connect your Pinterest account to ColorArchive, the following applies:

- **Authorization**: We use Pinterest OAuth to request access only to the specific permissions needed (e.g., writing pins to your boards). You can revoke access at any time from your Pinterest account settings.
- **Data accessed**: We may read your board list so you can choose where to save a pin. We do not access your followers, messages, or personal profile beyond what Pinterest provides in the OAuth flow.
- **No data storage**: We do not store, cache, or persist any data retrieved from the Pinterest API on our servers. All Pinterest data is used only during your active session and discarded immediately after.
- **No data sharing**: We never sell, share, license, or transfer any Pinterest user data to third parties, including advertisers or data brokers.
- **No automated actions**: We do not perform bulk or automated actions on your Pinterest account. Every pin or board action is initiated explicitly by you.
- **Compliance**: Our use of the Pinterest API complies with the [Pinterest Developer Guidelines](https://policy.pinterest.com/developer-guidelines) and [Pinterest API Terms](https://developers.pinterest.com/terms/).`,
  },
  {
    title: "5. Legal Basis for Processing (GDPR)",
    content: `If you are located in the European Economic Area (EEA), United Kingdom, or Switzerland, we process your personal data under the following legal bases as defined by GDPR Article 6:

- **Contractual necessity**: To provide the service you signed up for (account management, favorites sync, purchases, Pro subscription delivery).
- **Legitimate interest**: To analyze aggregate usage patterns, improve the product, prevent abuse, and maintain security — where these interests are not overridden by your rights.
- **Consent**: For optional integrations such as Pinterest OAuth, where you explicitly grant permission. You may withdraw consent at any time.
- **Legal obligation**: To retain transaction records as required by tax and commercial laws.`,
  },
  {
    title: "6. International Data Transfers",
    content: `ColorArchive is operated from Japan, with backend infrastructure hosted on servers in the United States (DigitalOcean and Vercel). If you access our service from the EEA, United Kingdom, or other regions with data protection laws, your personal data may be transferred to and processed in the United States.

We rely on the following safeguards for international data transfers:

- Our service providers (Stripe, Vercel, DigitalOcean) maintain Standard Contractual Clauses (SCCs) and/or other approved transfer mechanisms as required by GDPR Chapter V.
- We ensure that all data transfers are subject to appropriate technical and organizational security measures.`,
  },
  {
    title: "7. Data Retention",
    content: `We retain your personal data only for as long as necessary to fulfill the purposes described in this policy:

- **Account data** (email, profile): Retained until you delete your account.
- **Usage analytics**: Aggregated and anonymized; raw data retained for up to 12 months.
- **Purchase and transaction records**: Retained for 7 years to comply with tax and accounting obligations.
- **Favorites and preferences**: Retained until you delete your account or clear your browser localStorage.
- **Pinterest API data**: Not retained — used only during the active session and discarded immediately.
- **Email delivery logs**: Retained by our email provider (Resend) for up to 30 days.`,
  },
  {
    title: "8. Data Storage and Security",
    content: `Your data is stored on secure servers. Account data and preferences are stored on our backend server hosted on DigitalOcean (US). We use HTTPS for all data transmission, encrypt data at rest, and follow industry-standard security practices to protect your information.

If you use ColorArchive without an account, your favorites and recent colors are stored only in your browser's localStorage and never transmitted to our servers.`,
  },
  {
    title: "9. Your Rights (EEA/UK — GDPR)",
    content: `If you are located in the European Economic Area or United Kingdom, you have the following rights under the General Data Protection Regulation:

- **Right of access** (Art. 15): Request a copy of the personal data we hold about you.
- **Right to rectification** (Art. 16): Request correction of inaccurate personal data.
- **Right to erasure** (Art. 17): Request deletion of your personal data ("right to be forgotten").
- **Right to restrict processing** (Art. 18): Request that we limit how we use your data.
- **Right to data portability** (Art. 20): Receive your data in a structured, commonly used, machine-readable format.
- **Right to object** (Art. 21): Object to processing based on legitimate interest.
- **Right to withdraw consent**: Where processing is based on consent, you may withdraw it at any time without affecting the lawfulness of prior processing.
- **Right to lodge a complaint**: You have the right to lodge a complaint with your local data protection supervisory authority.

To exercise any of these rights, contact us at **privacy@colorarchive.org**.`,
  },
  {
    title: "10. Your Rights (California — CCPA)",
    content: `If you are a California resident, you have the following rights under the California Consumer Privacy Act (CCPA):

- **Right to know**: You may request what personal information we collect, use, and disclose about you.
- **Right to delete**: You may request deletion of your personal information, subject to certain exceptions.
- **Right to opt-out of sale**: We do not sell your personal information. No opt-out is necessary.
- **Right to non-discrimination**: We will not discriminate against you for exercising your CCPA rights.

Categories of personal information we collect: identifiers (email, name), commercial information (purchase history), and internet activity (usage data). We collect this information for the business purposes described in Section 2.

To exercise your rights, contact us at **privacy@colorarchive.org**.`,
  },
  {
    title: "11. iOS App",
    content: `The ColorArchive iOS app is available on the Apple App Store. In addition to the data described above, the iOS app may collect:

- **StoreKit purchase data**: Transaction identifiers and subscription status for in-app purchases, processed through Apple's StoreKit framework.
- **Device identifiers**: Anonymous identifiers used by Apple for app analytics (only if you have opted in to share analytics with developers in your iOS settings).

The iOS app does not collect location data, health data, contacts, photos, or any data from other apps. We do not use any third-party advertising or analytics SDKs in the iOS app. All data practices in the iOS app are consistent with our [App Store privacy nutrition labels](https://apps.apple.com).`,
  },
  {
    title: "12. Children's Privacy",
    content:
      "ColorArchive is not directed at children under 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal data, please contact us so we can delete it.",
  },
  {
    title: "13. Changes to This Policy",
    content:
      "We may update this Privacy Policy from time to time. We will notify registered users of material changes via email. The date at the top of this page indicates when the policy was last revised.",
  },
  {
    title: "14. Contact",
    content:
      "If you have questions about this Privacy Policy, please contact us at **privacy@colorarchive.org**.",
  },
];

export function PrivacyPage() {
  return (
    <main id="main-content" className="px-4 pb-20 pt-6 sm:px-6 sm:pt-8">
      <div className="mx-auto max-w-3xl">
        <section className="rounded-[2rem] border border-black/6 bg-white/72 px-6 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-10 sm:py-14">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/85 px-3 py-1 text-xs font-medium tracking-[0.22em] text-neutral-500 uppercase">
            <span className="inline-block h-2 w-2 rounded-full bg-neutral-900" />
            Legal
          </div>

          <h1 className="text-3xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-4xl">
            Privacy Policy
          </h1>

          <p className="mt-3 text-sm text-neutral-500">
            Last updated: {LAST_UPDATED}
          </p>

          <p className="mt-6 text-base leading-7 text-neutral-600">
            ColorArchive (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;)
            operates the website{" "}
            <a
              href={SITE_URL}
              className="font-medium text-neutral-950 underline decoration-neutral-300 underline-offset-2 hover:decoration-neutral-950"
            >
              colorarchive.org
            </a>{" "}
            and related services, including the ColorArchive iOS app. This
            Privacy Policy explains how we collect, use, and protect your
            information.
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
