import Link from 'next/link';

interface BreadcrumbItem {
  title: string;
  slug: string;
  url: string;
  current?: boolean;
}

interface PageData {
  page_title: string;
  slug: string;
  link_title?: string;
  parent_level: number;
}

interface BreadcrumbsProps {
  pageData: PageData;
  customBreadcrumbs?: BreadcrumbItem[];
}

export default function Breadcrumbs({ pageData, customBreadcrumbs }: BreadcrumbsProps) {
  // Build breadcrumb trail
  const breadcrumbs: BreadcrumbItem[] = customBreadcrumbs || [
    {
      title: 'Home',
      slug: 'home',
      url: '/',
    },
    {
      title: pageData.link_title || pageData.page_title,
      slug: pageData.slug,
      url: `/${pageData.slug}`,
      current: true,
    },
  ];

  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav className="flex mb-6" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        {breadcrumbs.map((item, index) => (
          <li key={item.slug} className="inline-flex items-center">
            {index > 0 && (
              <svg
                className="w-3 h-3 text-gray-400 mx-1"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {item.current ? (
              <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                {item.title}
              </span>
            ) : (
              <Link
                href={item.url}
                className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2 transition-colors"
              >
                {item.title}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}