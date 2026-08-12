import type { Metadata } from "next";
import { Birthday20040303Page } from "@/src/components/birthday-20040303-page";

/**
 * An easter egg for one person.
 *
 * BE CLEAR ABOUT WHAT THIS IS NOT. It is not hidden. An earlier version of this
 * comment called it "a URL you have to know to reach", which is false: Next 16
 * emits a client route manifest listing every static route, and that chunk is
 * loaded by all ~4,400 prerendered pages. `/20040303` sits in it next to `/about`
 * and `/admin/orders`. Anyone reading the site's JavaScript has the address
 * without guessing a date, and nothing in this directory can change that.
 *
 * What IS true: noindex, and absent from the sitemap (app/sitemap.ts lists its
 * routes by hand, so new routes are excluded until someone adds them). Between
 * them those keep it out of search results, which is the realistic threat — not a
 * determined reader of webpack chunks.
 *
 * Deliberately NOT added to robots.txt. Disallow would stop crawlers fetching the
 * page, which stops them SEEING the noindex, and a blocked URL can still surface
 * as a bare link. It would also publish the path in a file written to be read.
 * Allow the crawl, refuse the index.
 *
 * So: a public page that search engines are told to ignore. Nothing on it should
 * be anything she would mind a stranger reading, and it should stay that way.
 */
export const metadata: Metadata = {
  title: { absolute: "2004.03.03" },
  description: "The colour of one particular day.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/20040303/" },
};

export default function BirthdayRoute() {
  return <Birthday20040303Page />;
}
