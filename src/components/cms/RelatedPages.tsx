import Link from 'next/link';

interface RelatedPage {
  id: number;
  page_title: string;
  slug: string;
  link_title?: string;
  content_preview: string;
  featured_icon?: string;
}

interface RelatedPagesProps {
  pages: RelatedPage[];
  title?: string;
}

export default function RelatedPages({ pages, title = "Related Pages" }: RelatedPagesProps) {
  if (!pages || pages.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <svg 
          className="w-5 h-5 mr-2 text-blue-600" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" 
          />
        </svg>
        {title}
      </h3>
      
      <div className="space-y-4">
        {pages.map((page) => (
          <Link
            key={page.id}
            href={`/${page.slug}`}
            className="block group hover:bg-gray-50 rounded-lg p-3 transition-colors border border-transparent hover:border-gray-200"
          >
            <div className="flex items-start space-x-3">
              {page.featured_icon && (
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <img
                    src={page.featured_icon}
                    alt=""
                    className="w-6 h-6"
                  />
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                  {page.link_title || page.page_title}
                </h4>
                
                {page.content_preview && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {/* Strip HTML tags from content preview */}
                    {page.content_preview.replace(/<[^>]*>/g, '').substring(0, 100)}
                    {page.content_preview.length > 100 ? '...' : ''}
                  </p>
                )}
              </div>
              
              <div className="flex-shrink-0">
                <svg 
                  className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 5l7 7-7 7" 
                  />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {pages.length === 5 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Showing {pages.length} related pages
          </p>
        </div>
      )}
    </div>
  );
}