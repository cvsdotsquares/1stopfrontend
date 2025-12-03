interface PageContentProps {
  content: string;
}

export default function PageContent({ content }: PageContentProps) {
  return (
    <div
      className="prose prose-gray max-w-none 
        prose-headings:font-bold prose-headings:text-gray-900 prose-headings:mb-4
        prose-h1:text-3xl prose-h1:md:text-4xl
        prose-h2:text-2xl prose-h2:md:text-3xl prose-h2:mt-8
        prose-h3:text-xl prose-h3:md:text-2xl prose-h3:mt-6
        prose-h4:text-lg prose-h4:md:text-xl prose-h4:mt-4
        prose-h5:text-base prose-h5:md:text-lg prose-h5:mt-4
        prose-h6:text-base prose-h6:md:text-lg prose-h6:mt-4
        prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
        prose-ul:text-gray-700 prose-ul:mb-4 prose-ul:pl-6 prose-ul:list-disc
        prose-ol:text-gray-700 prose-ol:mb-4 prose-ol:pl-6 prose-ol:list-decimal
        prose-li:text-gray-700
        prose-a:text-blue-600 prose-a:hover:text-blue-800 prose-a:underline
        prose-table:min-w-full prose-table:divide-y prose-table:divide-gray-200 prose-table:shadow prose-table:ring-1 prose-table:ring-black prose-table:ring-opacity-5 prose-table:rounded-lg prose-table:overflow-hidden
        prose-th:px-6 prose-th:py-3 prose-th:text-left prose-th:text-xs prose-th:font-medium prose-th:text-gray-500 prose-th:uppercase prose-th:tracking-wider prose-th:bg-gray-50
        prose-td:px-6 prose-td:py-4 prose-td:whitespace-nowrap prose-td:text-sm prose-td:text-gray-900
        prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600 prose-blockquote:my-4 prose-blockquote:bg-blue-50 prose-blockquote:py-2
        prose-pre:bg-gray-100 prose-pre:rounded-lg prose-pre:p-4 prose-pre:overflow-x-auto prose-pre:text-sm prose-pre:my-4
        prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:font-mono
        prose-strong:font-semibold prose-strong:text-gray-900
        prose-em:italic prose-em:text-gray-600
        prose-img:rounded-lg prose-img:shadow-md prose-img:my-4"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}