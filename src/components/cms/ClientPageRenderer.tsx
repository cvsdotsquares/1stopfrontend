'use client';

import { usePageBySlug } from '@/hooks/usePage';
import PageContent from '@/components/cms/PageContent';
import Breadcrumbs from '@/components/cms/Breadcrumbs';
import RelatedPages from '@/components/cms/RelatedPages';

interface ClientPageProps {
  slug: string;
}

export default function ClientPageRenderer({ slug }: ClientPageProps) {
  const { 
    data: pageData, 
    isLoading, 
    error,
    isError 
  } = usePageBySlug(slug);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Loading Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div className="container mx-auto px-4 py-16">
            <div className="animate-pulse">
              <div className="h-8 bg-white/20 rounded w-1/3 mb-4"></div>
              <div className="h-6 bg-white/10 rounded w-2/3"></div>
            </div>
          </div>
        </div>

        {/* Loading Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6 mb-6"></div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/5"></div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !pageData) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-md text-center">
          <div className="text-red-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {error?.message === 'Page not found' ? 'Page Not Found' : 'Error Loading Page'}
          </h1>
          <p className="text-gray-600 mb-4">
            {error?.message || 'There was an error loading this page. Please try again.'}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
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