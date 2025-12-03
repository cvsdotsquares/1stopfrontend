import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PageContent from '@/components/cms/PageContent';
import Breadcrumbs from '@/components/cms/Breadcrumbs';
import RelatedPages from '@/components/cms/RelatedPages';

// API base URL
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Types for the CMS page data
interface PageData {
  id: number;
  page_title: string;
  slug: string;
  page_content: string;
  meta_title?: string;
  meta_keyword?: string;
  meta_desc?: string;
  is_parent: number;
  parent_level: number;
  link_title?: string;
  banner_type: number;
  overlay_caption: number;
  overlay_caption_text?: string;
  carousel_static_image?: string;
  carousel_static_caption?: string;
  featured_service: number;
  featured_icon?: string;
  created: string;
  updated: string;
  relatedPages?: Array<{
    id: number;
    page_title: string;
    slug: string;
    link_title?: string;
    content_preview: string;
    featured_icon?: string;
  }>;
  navigation?: {
    prev: {
      id: number;
      page_title: string;
      slug: string;
      link_title?: string;
    } | null;
    next: {
      id: number;
      page_title: string;
      slug: string;
      link_title?: string;
    } | null;
  };
  meta: {
    title: string;
    description: string;
    keywords?: string;
    canonical: string;
    ogTitle: string;
    ogDescription: string;
    ogImage?: string;
  };
}

interface ApiResponse {
  success: boolean;
  data: PageData;
}

// Fetch page data by slug
async function getPageData(slug: string): Promise<PageData | null> {
  try {
    const response = await fetch(`${API_BASE}/cms/page/slug/${slug}`, {
      next: { revalidate: 300 }, // Revalidate every 5 minutes
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch page data: ${response.status}`);
    }

    const result: ApiResponse = await response.json();
    return result.success ? result.data : null;
  } catch (error) {
    console.error('Error fetching page data:', error);
    return null;
  }
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const pageData = await getPageData(slug);

  if (!pageData) {
    return {
      title: 'Page Not Found | 1Stop Instruction',
      description: 'The requested page could not be found.',
    };
  }

  const meta = pageData.meta;

  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    openGraph: {
      title: meta.ogTitle,
      description: meta.ogDescription,
      images: meta.ogImage ? [{ url: meta.ogImage }] : undefined,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.ogTitle,
      description: meta.ogDescription,
      images: meta.ogImage ? [meta.ogImage] : undefined,
    },
    alternates: {
      canonical: meta.canonical,
    },
  };
}

// Generate static paths for common pages (optional - for better performance)
export async function generateStaticParams() {
  try {
    // Fetch common pages for static generation
    const response = await fetch(`${API_BASE}/cms/pages?limit=50`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    if (!response.ok) {
      return [];
    }

    const result = await response.json();
    const pages = result.data || [];

    return pages.map((page: { slug: string }) => ({
      slug: page.slug,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// Page component
export default async function SlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pageData = await getPageData(slug);

  if (!pageData) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner Section */}
      {pageData.banner_type === 1 && (pageData.carousel_static_image || pageData.overlay_caption === 1) && (
        <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          {pageData.carousel_static_image && (
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${pageData.carousel_static_image})`,
              }}
            >
              <div className="absolute inset-0 bg-black/40" />
            </div>
          )}
          <div className="relative container mx-auto px-4 py-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {pageData.link_title || pageData.page_title}
            </h1>
            {pageData.overlay_caption === 1 && pageData.overlay_caption_text && (
              <p className="text-xl md:text-2xl text-gray-200 max-w-2xl">
                {pageData.overlay_caption_text}
              </p>
            )}
            {pageData.carousel_static_caption && (
              <p className="text-lg text-gray-300 mt-4">
                {pageData.carousel_static_caption}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs pageData={pageData} />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Page Title (if no banner) */}
            {!(pageData.banner_type === 1 && (pageData.carousel_static_image || pageData.overlay_caption === 1)) && (
              <header className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {pageData.link_title || pageData.page_title}
                </h1>
              </header>
            )}

            {/* Page Content */}
            <PageContent content={pageData.page_content} />

            {/* Navigation (Previous/Next) */}
            {pageData.navigation && (pageData.navigation.prev || pageData.navigation.next) && (
              <nav className="flex justify-between items-center pt-8 mt-8 border-t border-gray-200">
                {pageData.navigation.prev ? (
                  <a
                    href={`/${pageData.navigation.prev.slug}`}
                    className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <div>
                      <div className="text-sm text-gray-500">Previous</div>
                      <div className="font-semibold">
                        {pageData.navigation.prev.link_title || pageData.navigation.prev.page_title}
                      </div>
                    </div>
                  </a>
                ) : (
                  <div />
                )}

                {pageData.navigation.next ? (
                  <a
                    href={`/${pageData.navigation.next.slug}`}
                    className="flex items-center text-blue-600 hover:text-blue-800 transition-colors text-right"
                  >
                    <div>
                      <div className="text-sm text-gray-500">Next</div>
                      <div className="font-semibold">
                        {pageData.navigation.next.link_title || pageData.navigation.next.page_title}
                      </div>
                    </div>
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                ) : (
                  <div />
                )}
              </nav>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Related Pages */}
            {pageData.relatedPages && pageData.relatedPages.length > 0 && (
              <RelatedPages pages={pageData.relatedPages} />
            )}

            {/* Featured Service Info */}
            {pageData.featured_service === 1 && pageData.featured_icon && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex items-center mb-4">
                  {pageData.featured_icon && (
                    <img
                      src={pageData.featured_icon}
                      alt=""
                      className="w-8 h-8 mr-3"
                    />
                  )}
                  <h3 className="text-lg font-semibold text-gray-900">
                    Featured Service
                  </h3>
                </div>
                <p className="text-gray-600 text-sm">
                  This is one of our most popular training programs.
                </p>
              </div>
            )}

            {/* Contact CTA */}
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Need Help?
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Have questions about our courses? Get in touch with our expert team.
              </p>
              <a
                href="/contactus.php"
                className="inline-flex items-center justify-center w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}