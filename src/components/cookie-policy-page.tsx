"use client";

import { SITE_URL } from "@/src/lib/site-config";

// 2026-07-26: section 3 claimed localStorage data "never leaves your device unless
// you are logged in", which stopped being true when PostHog shipped — its anonymous
// id lives there and rides on every analytics event. Also removed Stripe, which
// this still listed months after it was replaced by Lemon Squeezy.
const LAST_UPDATED = "July 26, 2026";

const sections = [
  {
    title: "1. What Are Cookies",
    content:
      "Cookies are small text files stored on your device by your web browser when you visit a website. They are widely used to make websites work efficiently and to provide information to site operators.",
  },
  {
    title: "2. Cookies We Use",
    content: `ColorArchive uses a minimal set of cookies, limited to what is strictly necessary for the service to function:

- **Session cookie** (\`ca_session\`): A single authentication cookie that keeps you logged in after signing in via magic link or Google OAuth. Type: first-party, httpOnly. Duration: 7 days. This cookie is essential for account features such as favorites sync, purchase history, and API key management.
- **No tracking cookies**: We do not use third-party tracking cookies, advertising cookies, or analytics cookies that identify individual users.

The **cookies** we set are limited to what is strictly necessary. We do not display a cookie consent banner.

To be accurate rather than convenient about why: the ePrivacy Directive's Article 5(3) is technology-neutral — it covers storing or reading information in your device generally, not cookies specifically — so localStorage and sessionStorage are not exempt from it just because they are not cookies. Our position rests on the analytics storage described in section 3 being first-party, containing no personal data, setting no advertising identifier, and involving no session recording, not on a technicality about the word "cookie". If you would rather not have it, clearing site data removes all of it and the site continues to work.`,
  },
  {
    title: "3. Local Storage",
    content: `In addition to cookies, ColorArchive uses your browser's localStorage to store non-sensitive preferences locally on your device:

- **Favorites**: Colors you mark as favorites (if not logged in, these are stored only in your browser).
- **Recent colors**: A list of recently viewed colors for quick access.
- **UI preferences**: Theme preference and other display settings.
- **Pinterest token**: If you connect your Pinterest account, the OAuth access token is stored in localStorage for the duration of your session.
- **Analytics identifier**: PostHog stores a random anonymous id here instead of setting a cookie. It is sent with product-analytics events so we can tell whether people come back, and it contains nothing about you — clearing localStorage resets it.
- **First-touch source (\`ca_attr_v1\`)**: how you first arrived — the referring URL, the first page you landed on, any campaign parameters in the link, and the date. Stored once and kept, so that if you later subscribe or buy we can tell which channel earned it rather than crediting whatever page you happened to be on. Sent with analytics events.
- **Analytics session id (\`ca_sid\`)**: a random per-tab id kept in sessionStorage (not localStorage), sent with analytics events so we can count *visits* instead of clicks — one person scrolling past the same card ten times should count once. It is discarded when you close the tab, is never linked to your identity, and cannot connect one visit to another.

Favorites, recent colors and UI preferences stay on your device unless you are logged in, in which case favorites are synced to your account on our server. The analytics identifier above is the exception: it is transmitted with analytics events by design.`,
  },
  {
    title: "4. Third-Party Services",
    content: `The following third-party services may set their own cookies or collect data when you interact with them:

- **Google OAuth**: If you sign in with Google, Google may set cookies as part of the authentication flow. See [Google's Privacy Policy](https://policies.google.com/privacy).
- **Vercel**: Our hosting provider may collect anonymous performance metrics. See [Vercel's Privacy Policy](https://vercel.com/legal/privacy-policy).
- **Lemon Squeezy**: When you are redirected to the checkout page for a purchase, our payment processor may set cookies for fraud prevention and payment processing. See [Lemon Squeezy's Privacy Policy](https://www.lemonsqueezy.com/privacy). (This entry previously named Stripe, which we no longer use.)
- **PostHog**: Product analytics. Configured to be cookieless — it uses the localStorage identifier described in section 3 rather than setting a cookie. See [PostHog's Privacy Policy](https://posthog.com/privacy).
- **Pinterest**: If you use the Pinterest integration, Pinterest may set cookies during the OAuth authorization flow. See [Pinterest's Privacy Policy](https://policy.pinterest.com/privacy-policy).

We do not control the cookies set by third-party services. Please refer to their respective privacy policies for more information.`,
  },
  {
    title: "5. Managing Cookies",
    content: `You can control and manage cookies through your browser settings. Most browsers allow you to:

- View what cookies are stored and delete them individually.
- Block third-party cookies.
- Block all cookies from specific sites.
- Clear all cookies when you close the browser.

Please note that disabling the session cookie will prevent you from staying logged in, and clearing localStorage will remove your locally saved favorites and preferences.`,
  },
  {
    title: "6. Do Not Track (DNT)",
    content:
      "ColorArchive does not currently respond to Do Not Track (DNT) browser signals, as there is no industry-standard implementation. However, we do not engage in cross-site tracking or serve targeted advertisements, so the practical effect is the same regardless of your DNT setting.",
  },
  {
    title: "7. Changes to This Policy",
    content:
      "We may update this Cookie Policy from time to time to reflect changes in our practices or for legal or regulatory reasons. The updated policy will be posted on this page with a revised date.",
  },
  {
    title: "8. Contact",
    content:
      "If you have questions about our use of cookies, please contact us at **support@colorarchive.org**.",
  },
];

export function CookiePolicyPage() {
  return (
    <main id="main-content" className="px-4 pb-20 pt-6 sm:px-6 sm:pt-8">
      <div className="mx-auto max-w-3xl">
        <section className="rounded-[2rem] border border-black/6 bg-white/72 px-6 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-10 sm:py-14">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/85 px-3 py-1 text-xs font-medium tracking-[0.22em] text-neutral-500 uppercase">
            <span className="inline-block h-2 w-2 rounded-full bg-neutral-900" />
            Legal
          </div>

          <h1 className="text-3xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-4xl">
            Cookie Policy
          </h1>

          <p className="mt-3 text-sm text-neutral-500">
            Last updated: {LAST_UPDATED}
          </p>

          <p className="mt-6 text-base leading-7 text-neutral-600">
            This Cookie Policy explains how ColorArchive uses cookies and
            similar technologies when you visit{" "}
            <a
              href={SITE_URL}
              className="font-medium text-neutral-950 underline decoration-neutral-300 underline-offset-2 hover:decoration-neutral-950"
            >
              colorarchive.org
            </a>
            .
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
                      .replace(
                        /`([^`]+)`/g,
                        '<code style="background:#f5f5f5;padding:1px 4px;border-radius:3px;font-size:0.9em">$1</code>',
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
