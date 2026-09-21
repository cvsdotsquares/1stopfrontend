import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import CmsPageView, { type CmsPage } from '@/components/cms/CmsPageView';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

type PageProps = {
  params: Promise<{ pageId: string }>;
  searchParams: Promise<{ token?: string }>;
};

async function fetchPreviewPage(pageId: string, token: string): Promise<CmsPage | null> {
  try {
    const res = await fetch(
      `${API_BASE}/cmspages/preview/${encodeURIComponent(pageId)}?token=${encodeURIComponent(token)}`,
      { cache: 'no-store' }
    );
    if (!res.ok) return null;
    const json = await res.json();
    if (!json.success) return null;
    return json.data as CmsPage;
  } catch (err) {
    console.error('Failed to fetch cms preview page', err);
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Page preview',
    robots: { index: false, follow: false },
  };
}

export default async function CmsPreviewPage({ params, searchParams }: PageProps) {
  const { pageId } = await params;
  const { token } = await searchParams;

  if (!pageId || !token) notFound();

  const page = await fetchPreviewPage(pageId, token);
  if (!page) notFound();

  const counterRes = await fetch(`${API_BASE}/helper/counter-data`);
  const counterJson = await counterRes.json();
  const counterData = counterJson.success ? counterJson.data : {};

  return (
    <CmsPageView
      page={page}
      counterData={counterData}
      banner={
        <div
          role="status"
          className="sticky top-0 z-50 border-b border-amber-300 bg-amber-100 px-4 py-2 text-center text-sm text-amber-950"
        >
          Preview Mode
        </div>
      }
    />
  );
}
