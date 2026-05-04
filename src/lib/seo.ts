/**
 * Shared SEO helpers for sitemap.ts, robots.ts and per-page metadata.
 *
 * The site URL and indexability flag come from public env vars so they can
 * differ between staging and production without a code change.
 */

const FALLBACK_SITE_URL = "https://1stopinstruction.com";

/** Absolute origin of this frontend with no trailing slash. */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || FALLBACK_SITE_URL;
  return raw.replace(/\/+$/, "");
}

/**
 * Whether crawlers are allowed to index the site at all.
 * Controlled by NEXT_PUBLIC_INDEXABLE — set to "false" on staging/preview to
 * keep the deploy out of search results regardless of per-page metadata.
 */
export function isSiteIndexable(): boolean {
  return String(process.env.NEXT_PUBLIC_INDEXABLE ?? "true").toLowerCase() !== "false";
}

/** Build an absolute URL by joining the site origin with a relative path. */
export function absoluteUrl(path: string = "/"): string {
  const base = getSiteUrl();
  if (!path) return base;
  if (/^https?:\/\//i.test(path)) return path;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Routes that must never appear in the sitemap or be crawled even when the
 * site is otherwise indexable. Keep in sync with the per-section layout
 * `robots: noindex` declarations.
 */
export const DISALLOWED_PATHS: readonly string[] = [
  "/api/",
  "/auth/",
  "/dashboard",
  "/dashboard/",
  "/users/",
  "/bookings/payment-success",
  "/bookings/payment-cancel",
  "/gift-voucher/success",
  "/gift-voucher/cancel",
  "/longevity/",
  "/search",
  // Temporarily excluded from indexing in this phase.
  "/all-locations",
];

/**
 * Static, publicly indexable routes baked into the app router (i.e. not
 * coming from the CMS). Each entry includes a sitemap priority/frequency
 * hint so we don't have to hard code them inline in sitemap.ts.
 */
export const STATIC_PUBLIC_ROUTES: ReadonlyArray<{
  path: string;
  changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority: number;
}> = [
  { path: "/", changeFrequency: "daily", priority: 1.0 },
  { path: "/contactus", changeFrequency: "monthly", priority: 0.7 },
  { path: "/faq", changeFrequency: "monthly", priority: 0.6 },
  { path: "/gift-voucher", changeFrequency: "monthly", priority: 0.6 },
];
