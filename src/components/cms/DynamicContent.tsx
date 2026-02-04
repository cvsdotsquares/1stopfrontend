'use client';

import { useEffect, useState } from 'react';

type CmsItem = {
  id: number;
  section_id: number;
  item_type: 'text' | 'link' | 'image' | string;
  item_title: string;
  item_content: string;
  item_url?: string;
  item_image?: string;
};

function renderItem(item: CmsItem) {
  switch (item.item_type) {
    case 'text':
      return <div key={item.id} dangerouslySetInnerHTML={{ __html: item.item_content || '' }} />;
    case 'link':
      return (
        <div key={item.id} className="my-2">
          <a href={item.item_url} className="text-blue-600 hover:underline" target="_blank" rel="noreferrer">
            {item.item_title || item.item_url}
          </a>
        </div>
      );
    case 'image':
      const src = item.item_image
        ? item.item_image.startsWith('http')
          ? item.item_image
          : `${process.env.NEXT_PUBLIC_FILES_URL || ''}/uploads/${item.item_image}`
        : '';
      return (
        <div key={item.id} className="my-4">
          {src ? <img src={src} alt={item.item_title || ''} className="max-w-full h-auto rounded" /> : null}
        </div>
      );
    default:
      return <div key={item.id}>{item.item_content}</div>;
  }
}

export default function DynamicContent({ texts, items }: { texts: CmsItem[]; items?: CmsItem[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="prose max-w-none text-gray-700">Loading...</div>;
  }

  return (
    <div className="prose max-w-none text-gray-700">
      {texts.length > 0 ? texts.map(t => (
        <p key={t.id} dangerouslySetInnerHTML={{ __html: t.item_content || '' }} />
      )) : (
        <div>{items && items.map((item) => renderItem(item))}</div>
      )}
    </div>
  );
}