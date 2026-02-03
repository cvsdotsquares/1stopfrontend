import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import PageContent from '@/components/cms/PageContent';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

type CmsItem = {
  id: number;
  section_id: number;
  item_type: 'text' | 'link' | 'image' | string;
  item_title: string;
  item_content: string;
  item_url?: string;
  item_image?: string;
};

type CmsSection = {
  id: number;
  section_title: string;
  items: CmsItem[];
  make_cta?: number;
};

type CmsPage = {
  id: number;
  page_title: string;
  slug: string;
  meta_title?: string;
  meta_keyword?: string;
  meta_desc?: string;
  link_title?: string;
  carousel_static_image?: string;
  carousel_static_caption?: string;
  banner_type?: number;
  overlay_caption?: number;
  overlay_caption_text?: string;
  featured_service?: number;
  featured_icon?: string;
  dynamic_sections?: CmsSection[];
  page_content?: string;
  meta?: { title?: string; description?: string; canonical?: string; ogImage?: string };
};

async function fetchCmsPage(slug: string): Promise<CmsPage | null> {
  try {
    // Encode each segment separately so slashes remain as path separators
    const encoded = slug.split('/').map(s => encodeURIComponent(s)).join('/');
    const res = await fetch(`${API_BASE}/cmspages/${encoded}`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json.success) return null;
    return json.data as CmsPage;
  } catch (err) {
    console.error('Failed to fetch cms page', err);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const { slug } = await params;
  const slugStr = (slug || []).join('/');
  if (!slugStr) return {};

  const page = await fetchCmsPage(slugStr);
  if (!page) return {};

  const title = page.meta_title || page.link_title || page.page_title || undefined;
  const description = page.meta_desc || page.meta?.description || undefined;
  const canonical = page.meta?.canonical || undefined;
  const ogImage = page.meta?.ogImage || page.carousel_static_image || undefined;

  const metadata: Metadata = {
    title,
    description,
    alternates: canonical ? { canonical } : undefined,
    openGraph: ogImage ? { title, description, images: [ogImage] } as any : undefined,
  };

  return metadata;
}

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

export default async function CmsCatchAllPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const slugStr = (slug || []).join('/');
  if (!slugStr) notFound();

  const page = await fetchCmsPage(slugStr);
  if (!page) notFound();

  return (
    <div className="min-h-screen">
      {/* Banner header if present */}
      {page.banner_type == 1 && (page.carousel_static_image || page.overlay_caption == 1) && (
        <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          {page.carousel_static_image && (
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${page.carousel_static_image})` }}
            >
              <div className="absolute inset-0 bg-black/40" />
            </div>
          )}
          <div className="relative container mx-auto px-4 py-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{page.link_title || page.page_title}</h1>
            {page.overlay_caption == 1 && page.overlay_caption_text && (
              <p className="text-xl md:text-2xl text-gray-200 max-w-2xl">{page.overlay_caption_text}</p>
            )}
            {page.carousel_static_caption && <p className="text-lg text-gray-300 mt-4">{page.carousel_static_caption}</p>}
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            {!(page.banner_type == 1 && (page.carousel_static_image || page.overlay_caption == 1)) && (
              <header className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{page.link_title || page.page_title}</h1>
              </header>
            )}
            {/* Dynamic sections */}
            {Array.isArray(page.dynamic_sections) && page.dynamic_sections.map((s) => {
              if (s.make_cta == 1) {
                const links = s.items?.filter(i => i.item_type == 'link') || [];
                const images = s.items?.filter(i => i.item_type == 'image') || [];
                const texts = s.items?.filter(i => i.item_type == 'text') || [];

                return (
                  <section key={s.id} className="mb-8 relative">
                    {/* Full-bleed background */}
                    <div className="absolute left-1/2 -translate-x-1/2 w-screen bg-gray-100 py-8 md:py-16 -z-10" />
                    <div className="max-w-[1400px] mx-auto px-4 relative">
                      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                        {/* Left: title and descriptive text */}
                        <div className="flex-1">
                          {s.section_title && <h2 className="text-3xl font-bold text-black mb-4">{s.section_title}</h2>}
                          <div suppressHydrationWarning={true} className="prose max-w-none text-gray-700">
                            {texts.length > 0 ? texts.map(t => (
                              <p key={t.id} dangerouslySetInnerHTML={{ __html: t.item_content || '' }} />
                            )) : (
                              <div>{s.items && s.items.map((item) => renderItem(item))}</div>
                            )}
                          </div>
                        </div>

                        {/* Center: CTA button and quick links */}
                        <div className="flex flex-col items-center md:items-center md:justify-center gap-4 md:gap-6 md:flex-none">

                          {links.length > 1 && (
                            <ul className="mt-2 flex flex-col md:flex-col text-sm">
                              {links.slice(1).map(l => (
                                <li key={l.id}><a className="text-blue-600 hover:underline" href={l.item_url}>{l.item_title || l.item_url}</a></li>
                              ))}
                            </ul>
                          )}
                        </div>

                        {/* Right: featured image */}
                        {images[0] && (
                          <div className="md:ml-6 md:flex-none">
                            <img src={images[0].item_image?.startsWith('http') ? images[0].item_image : `${process.env.NEXT_PUBLIC_FILES_URL || ''}/uploads/${images[0].item_image}`} alt={images[0].item_title || ''} className="w-40 rounded shadow-md" />
                          </div>
                        )}
                      </div>
                    </div>
                  </section>
                );
              }

              return (
                <section key={s.id} className="mb-8">
                  {s.section_title && <h2 className="text-xl font-semibold mb-3">{s.section_title}</h2>}
                  <div suppressHydrationWarning={true} className="prose max-w-none">
                    {s.items && s.items.map(renderItem)}
                  </div>
                </section>
              );
            })}

            {(!Array.isArray(page.dynamic_sections) || page.dynamic_sections.length === 0) && page.page_content && (
              <section className="mb-8">
                <PageContent content={page.page_content} />
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
