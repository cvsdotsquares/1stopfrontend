import type { Metadata } from "next";

// Temporarily kept out of search indexes for this phase. When ready to expose
// the page, delete this layout, re-add "/all-locations" to STATIC_PUBLIC_ROUTES
// in src/lib/seo.ts, and remove it from DISALLOWED_PATHS.
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default function AllLocationsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
