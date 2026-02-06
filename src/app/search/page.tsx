'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

type SearchResult = {
  type: 'course' | 'location' | 'page';
  id: number;
  title: string;
  description?: string;
  image?: string;
  url: string;
  location?: string | null;
};

type SearchResponse = {
  success: boolean;
  data: {
    results: SearchResult[];
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  };
};

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const typeParam = searchParams.get('type') || 'all';
  const pageParam = parseInt(searchParams.get('page') || '1');

  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState(typeParam);
  const [currentPage, setCurrentPage] = useState(pageParam);

  useEffect(() => {
    if (!query) return;

    setLoading(true);
    const fetchResults = async () => {
      try {
        const params = new URLSearchParams({
          q: query,
          type: selectedType,
          page: currentPage.toString(),
          limit: '20'
        });
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/search?${params}`);
        const data: SearchResponse = await res.json();
        if (data.success) {
          setResults(data.data.results);
          setTotal(data.data.total);
          setTotalPages(data.data.totalPages);
        }
      } catch (err) {
        console.error('Failed to fetch search results:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, selectedType, currentPage]);

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'course': return 'bg-blue-100 text-blue-800';
      case 'location': return 'bg-green-100 text-green-800';
      case 'page': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const highlightQuery = (text: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Search Results</h1>
        <p className="text-gray-600 mb-6">
          {total} results for &quot;<span className="font-semibold">{query}</span>&quot;
        </p>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          {['all', 'course', 'location', 'page'].map((type) => (
            <button
              key={type}
              onClick={() => {
                setSelectedType(type);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 font-medium capitalize ${
                selectedType === type
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {type === 'all' ? 'All' : `${type}s`}
            </button>
          ))}
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : results.length > 0 ? (
          <>
            <div className="space-y-4">
              {results.map((result) => (
                <Link
                  key={`${result.type}-${result.id}`}
                  href={result.url}
                  className="block bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-4">
                    {result.image && (
                      <div className="flex-shrink-0 w-24 h-24 relative rounded overflow-hidden bg-gray-100">
                        <Image
                          src={`${process.env.NEXT_PUBLIC_FILES_URL || ''}${result.image}`}
                          alt={result.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${getTypeBadgeColor(result.type)}`}>
                          {result.type.toUpperCase()}
                        </span>
                        {result.location && (
                          <span className="text-sm text-gray-500">{result.location}</span>
                        )}
                      </div>
                      <h3
                        className="text-lg font-semibold text-blue-600 hover:text-blue-800 mb-1"
                        dangerouslySetInnerHTML={{ __html: highlightQuery(result.title) }}
                      />
                      {result.description && (
                        <p
                          className="text-sm text-gray-600 line-clamp-2"
                          dangerouslySetInnerHTML={{ __html: highlightQuery(result.description) }}
                        />
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-4 py-2">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-semibold mb-2">No results found</h2>
            <p className="text-gray-600">Try adjusting your search terms or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}