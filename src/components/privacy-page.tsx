const LAST_UPDATED = "March 27, 2026";

const sections = [
  {
    title: "1. Information We Collect",
    content: `When you create an account via magic link or Google OAuth, we store your email address and basic profile information necessary to provide the service. We also collect:

- **Usage data**: Pages visited, features used, and interaction patterns to improve the product.
- **Favorites and preferences**: Colors you save or mark as favorites, synced to your account if logged in, or stored locally in your browser if not.
- **Purchase information**: When you buy a product through our checkout provider, we receive your name, email, and transaction details. We do not store payment card numbers.
- **Cookies**: We use a session cookie to keep you logged in. We do not use third-party tracking cookies. For details, see our [Cookie Policy](/cookie-policy/).`,
  },
  {
    title: "2. How We Use Your Information",
    content: `We use the information we collect to:

- Provide, maintain, and improve ColorArchive and its tools.
- Process purchases and deliver digital products.
- Sync your favorites and preferences across devices.
- Send transactional emails (order confirmations, magic link login).
- Analyze aggregate usage to guide product development.

We do not sell your personal information to third parties.`,
  },
  {
    title: "3. Third-Party Services",
    content: `ColorArchive integrates with the following third-party services:

- **Payment processing** — Purchases are handled by our third-party checkout provider. We do not store payment card details.
- **Google OAuth** — Optional sign-in. Subject to [Google's Privacy Policy](https://policies.google.com/privacy).
- **Vercel** — Hosting and analytics. Subject to [Vercel's Privacy Policy](https://vercel.com/legal/privacy-policy).
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
    title: "5. Data Storage and Security",
    content: `Your data is stored on secure servers. Account data and preferences are stored on our backend server. We use HTTPS for all data transmission and follow industry-standard security practices to protect your information.

If you use ColorArchive without an account, your favorites and recent colors are stored only in your browser's localStorage and never transmitted to our servers.`,
  },
  {
    title: "6. Your Rights",
    content: `You have the right to:

- **Access** the personal data we hold about you.
- **Delete** your account and associated data by contacting us.
- **Export** your data (favorites, preferences) at any time.
- **Opt out** of non-essential communications.

To exercise any of these rights, contact us at the email below.`,
  },
  {
    title: "7. Children's Privacy",
    content:
      "ColorArchive is not directed at children under 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal data, please contact us so we can delete it.",
  },
  {
    title: "8. Changes to This Policy",
    content:
      "We may update this Privacy Policy from time to time. We will notify registered users of material changes via email. The date at the top of this page indicates when the policy was last revised.",
  },
  {
    title: "9. Contact",
    content:
      "If you have questions about this Privacy Policy, please contact us at **privacy@colorarchive.me**.",
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
              href="https://colorarchive.me"
              className="font-medium text-neutral-950 underline decoration-neutral-300 underline-offset-2 hover:decoration-neutral-950"
            >
              colorarchive.me
            </a>{" "}
            and related services. This Privacy Policy explains how we collect,
            use, and protect your information.
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
