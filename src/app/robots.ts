import type { MetadataRoute } from "next";
import {
  DISALLOWED_PATHS,
  absoluteUrl,
  isSiteIndexable,
} from "@/lib/seo";

/**
 * Generates /robots.txt at the site root using the Next.js metadata route
 * convention. See https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */
export default function robots(): MetadataRoute.Robots {
  const sitemap = absoluteUrl("/sitemap.xml");
  const host = absoluteUrl("/");

  if (!isSiteIndexable()) {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
      sitemap,
      host,
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [...DISALLOWED_PATHS],
      },
    ],
    sitemap,
    host,
  };
}
