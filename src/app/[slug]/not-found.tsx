import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Page not found
          </h1>
          <p className="mt-4 text-base text-gray-500">
            Sorry, we couldn't find the page you're looking for.
          </p>
          <div className="mt-6 flex items-center justify-center gap-x-6">
            <Link
              href="/"
              className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
            >
              Go back home
            </Link>
            <Link
              href="/contactus.php"
              className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors"
            >
              Contact support <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>
        
        {/* Quick Navigation */}
        <div className="mt-10 border-t border-gray-200 pt-8">
          <h3 className="text-sm font-medium text-gray-900">Popular pages</h3>
          <ul className="mt-4 space-y-2">
            <li>
              <Link
                href="/home"
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/contactus.php"
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                Contact Us
              </Link>
            </li>
            <li>
              <Link
                href="/faq"
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                Frequently Asked Questions
              </Link>
            </li>
            <li>
              <Link
                href="/testimonials-reviews.php"
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                Testimonials & Reviews
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}