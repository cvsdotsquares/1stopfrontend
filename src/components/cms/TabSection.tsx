'use client';

import { useState } from 'react';

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

  const activeTabData = data.tabs.find(tab => tab.id === activeTab);

  return (
    <section className="bg-gray-50 py-10 md:py-16">
      <div className="max-w-[1400px] mx-auto px-4">
        {/* Title — data.title may already contain an <h2> tag from the CMS,
              so we render into a <div> to avoid invalid nested heading markup
              which would cause a React hydration mismatch. */}
        <div
          className="text-center [&_h1]:text-3xl [&_h1]:mb-6 [&_h2]:text-3xl [&_h2]:mb-6 [&_h3]:text-3xl [&_h3]:mb-6"
          dangerouslySetInnerHTML={{ __html: data.title || '' }}
        />

        <div className={`grid grid-cols-1 gap-6 ${data.image ? 'lg:grid-cols-2' : ''}`}>
          {/* Tabs and Content */}
          <div>
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
                    className="flex flex-col gap-1 text-center"
                  >
                    <img
                      src={`${process.env.NEXT_PUBLIC_FILES_URL || ''}/${tab.icon}`}
                      alt={tab.label}
                      className={`text-lg w-5 h-5 mx-auto ${activeTab === tab.id ? 'brightness-0 invert' : ''}`}
                    />
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
            <div>
              <img
                src={`${process.env.NEXT_PUBLIC_FILES_URL || ''}/uploads/dynamic_content/${data.image}`}
                alt="Directions Map"
                className="rounded-lg w-full object-cover"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
