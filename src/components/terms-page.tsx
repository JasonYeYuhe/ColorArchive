const LAST_UPDATED = "March 27, 2026";

const sections = [
  {
    title: "1. Acceptance of Terms",
    content:
      "By accessing or using ColorArchive, you agree to be bound by these Terms of Service and our [Privacy Policy](/privacy/). If you do not agree to these terms, please do not use our services.",
  },
  {
    title: "2. Description of Service",
    content: `ColorArchive provides a curated color reference library, palette tools, and related digital products. The service includes:

- **Free tools**: Color browsing, palette generation, brand color tools, WCAG audit, and gradient creation.
- **Digital products**: Downloadable palette packs available for purchase.
- **API access**: Programmatic access to color data for developers.
- **Account features**: Favorites sync, preferences, and purchase history when signed in.`,
  },
  {
    title: "3. User Accounts",
    content: `You may create an account using a magic link or Google OAuth. You are responsible for maintaining the security of your account. You agree to:

- Provide accurate information when creating your account.
- Notify us immediately of any unauthorized use of your account.
- Not share your account credentials with others.

We reserve the right to suspend or terminate accounts that violate these terms.`,
  },
  {
    title: "4. Purchases and Refunds",
    content: `Digital products are sold through our checkout provider. All purchases are subject to the applicable provider's terms of service.

- **Digital products**: All sales of digital downloads are final. Due to the nature of digital goods, refunds are generally not available once the product has been delivered.
- **Exceptions**: If you experience a technical issue preventing you from accessing a purchased product, contact us and we will work to resolve it or issue a refund at our discretion.
- **Pricing**: We reserve the right to change pricing at any time. Price changes do not affect previously completed purchases.
- **Subscriptions**: Pro subscriptions (monthly or yearly) renew automatically. You may cancel at any time through your account's billing portal — go to Account → Manage Subscription. Cancellation takes effect at the end of the current billing period; you retain access until then. No partial refunds are issued for the remaining period.

For full details, see our [Refund Policy](/refund-policy/).`,
  },
  {
    title: "5. Intellectual Property",
    content: `All content on ColorArchive — including but not limited to text, graphics, logos, design, code, and digital products — is the property of ColorArchive or its content creators and is protected by applicable intellectual property laws.

- You may use our free tools for personal and commercial projects.
- Purchased palette packs are licensed for your personal and commercial use, but may not be resold or redistributed as standalone products.
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
- Resell or redistribute our digital products without authorization.`,
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
    title: "10. Changes to These Terms",
    content:
      "We may update these Terms of Service from time to time. We will notify registered users of material changes via email. Continued use of the service after changes are posted constitutes acceptance of the updated terms.",
  },
  {
    title: "11. Governing Law",
    content:
      "These Terms of Service shall be governed by and construed in accordance with the laws of the United States, without regard to conflict of law principles.",
  },
  {
    title: "12. Contact",
    content:
      "If you have questions about these Terms of Service, please contact us at **support@colorarchive.me**.",
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
              href="https://colorarchive.me"
              className="font-medium text-neutral-950 underline decoration-neutral-300 underline-offset-2 hover:decoration-neutral-950"
            >
              colorarchive.me
            </a>{" "}
            and all related services, tools, and products provided by
            ColorArchive (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;).
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
