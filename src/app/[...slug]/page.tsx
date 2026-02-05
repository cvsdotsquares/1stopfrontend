import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import PageContent from '@/components/cms/PageContent';
import CarouselBanner from '@/components/cms/CarouselBanner';
import FeaturedServices from '@/components/ui/FeaturedServices'
import TestimonialsCarousel from "@/components/testimonials";
import AccreditationsSection from "@/components/accreditations/AccreditationsSection";
import AboutSection from "@/components/home/about/AboutSection";
import ServicesSection from "@/components/home/services/ServicesSection";
import FeatureImageLeft from "@/components/home/generic-feature/FeatureImageLeft";
import FeatureImageRight from "@/components/home/generic-feature/FeatureImageRight";
import TrainingSlider from "@/components/home/training-slider/TrainingSlider";
import WhyUsSection from "@/components/home/why-us/WhyUsSection";
import GenericCta from "@/components/home/generic-cta/GenericCta";
import Link from 'next/link';
import Image from 'next/image';

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
  testimonial_display?: number;
  accreditation_display?: number;
  featured_icon?: string;
  dynamic_sections?: CmsSection[];
  page_content?: string;
  meta?: { title?: string; description?: string; canonical?: string; ogImage?: string };
  about_data?: any;
  services_data?: any;
  feature_left_data?: any;
  feature_right_data?: any;
  training_slider_data?: any;
  why_us_data?: any;
  generic_cta_data?: any;
  slider_images?: any;
  about?: any;
  services?: any;
  training_slider?: any;
  why_us?: any;
  cbt_london?: any;
  cbt_test_london?: any;
  features?: any;
  banners?: any;
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



export default async function CmsCatchAllPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const slugStr = (slug || []).join('/');
  if (!slugStr) notFound();

  const page = await fetchCmsPage(slugStr);
  if (!page) notFound();

  return (
    <div className="min-h-screen">
      {/* Carousel Banner when banner_type is 1 */}
      {page.banner_type == 2 && <CarouselBanner />}

      {/* Banner header if present */}
      {page.banner_type == 1 && (page.carousel_static_image || page.overlay_caption == 1) && (
          <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white">
            {page.carousel_static_image && (
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${process.env.NEXT_PUBLIC_FILES_URL || ''}/uploads/${page.carousel_static_image})` }}
              >
                <div className="absolute inset-0 bg-black/40" />
              </div>
            )}
            <div className="relative container mx-auto px-4 py-16">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{page.link_title || page.page_title}</h1>
              {page.overlay_caption == 1 && page.overlay_caption_text && (
                <p className="text-xl md:text-2xl text-gray-200 max-w-2xl" dangerouslySetInnerHTML={{ __html: page.overlay_caption_text }} />
              )}
              {page.carousel_static_caption && <p className="text-lg text-gray-300 mt-4" dangerouslySetInnerHTML={{ __html: page.carousel_static_caption }} />}
            </div>
          </div>
      )}
      {/* Dynamic sections */}
      {Array.isArray(page.dynamic_sections) &&
        page.dynamic_sections.map((s) => {
          if (s.make_cta == 1) {
            return (
              <div className="bg-gray-100 pt-8 md:pt-16" key={`section-${s.id}`}>
                <div className="max-w-[1400px] mx-auto">
                  <div className="[&_h2]:text-black [&_h2]:mb-5 [&_h2]:text-3xl text-gray-500 [&_a]:underline [&_a:hover]:text-red-500 [&_div]:p-5 [&_div]:bg-blue-100 [&_div]:text-blue-600 [&_div]:border-l-2 [&_div]:border-blue-600">
                    <h2 className="text-center">{s.section_title}</h2>
                    <span className="flex justify-center items-center gap-8 flex-wrap">
                      {s.items.map((item) => (
                        <span key={item.id} className="text-center">
                          {item.item_image && <img src={`${process.env.NEXT_PUBLIC_FILES_URL || ''}/uploads/dynamic_content/${item.item_image}`} alt={item.item_title} className="max-w-sm h-auto rounded-lg mb-4" />}
                          {item.item_content && <span className="block text-lg text-gray-700 mb-4" dangerouslySetInnerHTML={{ __html: item.item_content }} />}
                          {item.item_url && <Link className="inline-block text-white bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg font-semibold transition-colors" href={item.item_url}>{item.item_title}</Link>}
                        </span>
                      ))}
                    </span>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div className="pt-8 md:pt-16" key={`section-${s.id}`}>
              <div className="max-w-[1400px] mx-auto">
                <div className="[&_h2]:text-black [&_h2]:mb-5 [&_h2]:text-3xl text-gray-500 [&_a]:underline [&_a:hover]:text-red-500 [&_div]:p-5 [&_div]:bg-blue-100  [&_div]:text-blue-600 [&_div]:border-l-2 [&_div]:border-blue-600">
                  <h2>{s.section_title}</h2>
                  {s.items.map((item) => (
                    <span key={item.id} dangerouslySetInnerHTML={{ __html: item.item_content || '' }} />
                  ))}
                </div>
              </div>
            </div>
          );
        })}

      {/* Fallback content */}
      {(!Array.isArray(page.dynamic_sections) || page.dynamic_sections.length === 0) &&
        page.page_content && (
          <section className="mb-8 container mx-auto px-4 py-8 md:py-16 max-w-[1400px]">
            <PageContent content={page.page_content} />
          </section>
      )}

      {/* Homepage Components */}
      {page.about && <AboutSection data={page.about} />}
      {page.services && <ServicesSection data={page.services} />}
      {page.cbt_london && <FeatureImageLeft data={page.cbt_london} />}
      {page.cbt_test_london && <FeatureImageRight data={page.cbt_test_london} />}
      {page.training_slider && <TrainingSlider data={page.training_slider} />}
      {page.why_us && <WhyUsSection data={page.why_us} />}
      {page.banners && <GenericCta {...page.banners} />}

      {/* Conditional components */}
      {page.featured_service == 1 && <FeaturedServices />}
      {page.testimonial_display == 1 && <TestimonialsCarousel />}
      {page.accreditation_display == 1 && <AccreditationsSection />}
    </div>
  );
}
