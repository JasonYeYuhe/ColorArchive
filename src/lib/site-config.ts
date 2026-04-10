export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://colorarchive.me";

/** Bare domain for display text (e.g. "colorarchive.org") */
export const SITE_DOMAIN = SITE_URL.replace(/^https?:\/\//, "").replace(
  /\/$/,
  "",
);

/** Contact email shown in structured data and public pages */
export const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@colorarchive.me";

/** Support email */
export const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@colorarchive.me";
