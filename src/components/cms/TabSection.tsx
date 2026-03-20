'use client';

import { useState, useRef, useEffect } from 'react';

interface Tab {
  id: string;
  label: string;
  icon: string;
  content: string;
}

interface TabSectionData {
  title: string;
  image?: string;
  tabs: Tab[];
}

export default function TabSection({ data }: Readonly<{ data: TabSectionData }>) {
  const [activeTab, setActiveTab] = useState(data.tabs[0]?.id || '');
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number | null>(null);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.offsetHeight);
    }
  }, [activeTab]);

  const activeTabData = data.tabs.find(tab => tab.id === activeTab);
  const titleText = (data.title || '')
    .replaceAll(/<[^>]*>/g, ' ')
    .replaceAll('&nbsp;', ' ')
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll(/\s+/g, ' ')
    .trim();

  return (
    <section className="bg-gray-50 py-10 md:py-16">
      <div className="max-w-[1400px] mx-auto px-4">
        {/* Title */}
        <div className="text-center">
          <div dangerouslySetInnerHTML={{ __html: data.title }} />
        </div>

        <div className={`grid grid-cols-1 gap-6 ${data.image ? 'lg:grid-cols-2' : ''}`}>
          {/* Tabs and Content */}
          <div ref={contentRef} className="flex flex-col">
            {/* Tab Buttons */}
            <ul className="inline-flex flex-wrap w-full bg-white border rounded p-3">
              {data.tabs.map((tab) => (
                <li
                  key={tab.id}
                  className={`px-4 font-semibold py-2 rounded text-sm ${
                    activeTab === tab.id
                      ? 'text-white bg-blue-600'
                      : 'text-gray-500'
                  }`}
                >
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className="flex flex-col gap-1 cursor-pointer text-center"
                  >
                    {tab.icon && (
                      <img
                        src={`${process.env.NEXT_PUBLIC_FILES_URL || ''}/${tab.icon}`}
                        alt={tab.label}
                        className={`text-lg w-5 h-5 mx-auto ${activeTab === tab.id ? 'brightness-0 invert' : ''}`}
                      />
                    )}
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>

            {/* Tab Content */}
            {activeTabData && (
              <div className="rounded border mt-3 text-gray-500 bg-white">
                <div className="p-4">
                  <h3 className="text-lg font-bold mb-3 text-black">
                    {activeTabData.label}
                  </h3>
                  <div
                    className="[&_p]:mb-0 [&_b]:font-bold [&_b]:text-black"
                    dangerouslySetInnerHTML={{ __html: activeTabData.content }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Image */}
          {data.image && (
            <div className="flex items-center justify-center" style={contentHeight ? { height: contentHeight } : {}}>
              <img
                src={`${process.env.NEXT_PUBLIC_FILES_URL || ''}/${data.image}`}
                alt="Directions Map"
                className="rounded-lg w-full h-full object-contain"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}