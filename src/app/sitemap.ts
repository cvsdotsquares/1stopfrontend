import type { MetadataRoute } from "next";
import {
  STATIC_PUBLIC_ROUTES,
  absoluteUrl,
  isSiteIndexable,
} from "@/lib/seo";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// Re-fetch the dynamic slug list every hour. Tweak via env if needed.
export const revalidate = 3600;

type SitemapEntry = {
  slug: string;
  lastModified: string | null;
};

type SitemapPayload = {
  pages: SitemapEntry[];
  locations: SitemapEntry[];
};

async function fetchSitemapData(): Promise<SitemapPayload> {
  try {
    const res = await fetch(`${API_BASE}/helper/sitemap-data`, {
      next: { revalidate },
    });
    if (!res.ok) {
      console.error("[sitemap] sitemap-data request failed:", res.status);
      return { pages: [], locations: [] };
    }
    const json = await res.json();
    if (!json?.success || !json?.data) {
      return { pages: [], locations: [] };
    }
    return {
      pages: Array.isArray(json.data.pages) ? json.data.pages : [],
      locations: [],
      // locations: Array.isArray(json.data.locations) ? json.data.locations : [],
    };
  } catch (err) {
    console.error("[sitemap] failed to load sitemap data:", err);
    return { pages: [], locations: [] };
  }
}

function toDate(value: string | null | undefined): Date {
  if (!value) return new Date();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function dedupe(entries: MetadataRoute.Sitemap): MetadataRoute.Sitemap {
  const seen = new Set<string>();
  const out: MetadataRoute.Sitemap = [];
  for (const entry of entries) {
    if (seen.has(entry.url)) continue;
    seen.add(entry.url);
    out.push(entry);
  }
  return out;
}

/**
 * Generates /sitemap.xml at the site root using the Next.js metadata route
 * convention. See https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 *
 * The list is composed of:
 *   1. Hand-curated static, public routes from STATIC_PUBLIC_ROUTES.
 *   2. CMS pages exposed via /api/helper/sitemap-data (page_menus rows).
 *   3. Location landing pages exposed via /api/helper/sitemap-data
 *      (location_course_pages rows) under /location/:slug.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!isSiteIndexable()) {
    // Returning just the home page keeps Search Console happy on staging
    // while still respecting the global noindex directive in robots.ts.
    return [
      {
        url: absoluteUrl("/"),
        lastModified: new Date(),
        changeFrequency: "yearly",
        priority: 0.1,
      },
    ];
  }

  const data = await fetchSitemapData();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PUBLIC_ROUTES.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const cmsEntries: MetadataRoute.Sitemap = data.pages.map((entry) => ({
    url: absoluteUrl(`/${entry.slug}`),
    lastModified: toDate(entry.lastModified),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const locationEntries: MetadataRoute.Sitemap = data.locations.map((entry) => ({
    url: absoluteUrl(`/location/${entry.slug}`),
    lastModified: toDate(entry.lastModified),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return dedupe([...staticEntries, ...cmsEntries, ...locationEntries]);
}
