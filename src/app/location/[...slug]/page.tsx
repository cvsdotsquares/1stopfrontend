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

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

type LocationPage = {
  id: number;
  location_id: number;
  course_id: number;
  page_title: string;
  content: string;
  meta_description: string;
  meta_keywords: string;
  locationPicture: string;
  slug: string;
  dynamic_sections: any[];
  slider_images: any;
  about: any;
  services: any;
  training_slider: any;
  why_us: any;
  cbt_london: any;
  cbt_test_london: any;
  features: any;
  banners: any;
};

async function fetchLocationPage(slug: string): Promise<LocationPage | null> {
  try {
    const encoded = slug.split('/').map(s => encodeURIComponent(s)).join('/');
    const res = await fetch(`${API_BASE}/helper/location/${encoded}`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json.success) return null;
    return json.data as LocationPage;
  } catch (err) {
    console.error('Failed to fetch location page', err);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const { slug } = await params;
  const slugStr = (slug || []).join('/');
  if (!slugStr) return {};

  const page = await fetchLocationPage(slugStr);
  if (!page) return {};

  const stripHtml = (html: string) => {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/<[^>]*>/g, '')
      .trim();
  };
  const title = stripHtml(page.page_title);

  return {
    title,
    description: page.meta_description || undefined,
    keywords: page.meta_keywords || undefined,
    alternates: { canonical: `/location/${slugStr}` },
    openGraph: {
      title,
      description: page.meta_description || undefined,
      url: `/location/${slugStr}`,
      images: page.locationPicture ? [page.locationPicture] : undefined,
    },
  };
}

export default async function LocationPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const slugStr = (slug || []).join('/');
  if (!slugStr) notFound();

  const page = await fetchLocationPage(slugStr);
  if (!page) notFound();

  return (
    <div className="min-h-screen">
      {/* Banner header */}
      {page.locationPicture && (
        <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${process.env.NEXT_PUBLIC_FILES_URL || ''}${page.locationPicture})` }}
          >
            <div className="absolute inset-0 bg-black/40" />
          </div>
          <div className="relative container mx-auto px-4 py-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{page.page_title}</h1>
          </div>
        </div>
      )}

      {/* Dynamic sections */}
      {Array.isArray(page.dynamic_sections) &&
        page.dynamic_sections.map((s, index) => (
          <div className="pt-8 md:pt-16" key={`section-${index}`}>
            <div className="max-w-[1400px] mx-auto">
              <div className="[&_h2]:text-black [&_h2]:mb-5 [&_h2]:text-3xl text-gray-500 [&_a]:underline [&_a:hover]:text-red-500 [&_div]:p-5 [&_div]:bg-blue-100 [&_div]:text-blue-600 [&_div]:border-l-2 [&_div]:border-blue-600">
                {s.section_title && <h2>{s.section_title}</h2>}
                {s.items?.map((item: any, itemIndex: number) => (
                  <span key={itemIndex} dangerouslySetInnerHTML={{ __html: item.item_content || '' }} />
                ))}
              </div>
            </div>
          </div>
        ))}

      {/* Content */}
      {page.content && (
        <section className="mb-8 container mx-auto px-4 py-8 md:py-16 max-w-[1400px]">
          <h1 className="text-4xl font-bold mb-8 text-center">{page.page_title}</h1>
          <PageContent content={page.content} />
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

      {/* Default components */}
      <FeaturedServices />
      <TestimonialsCarousel />
      <AccreditationsSection />
    </div>
  );
}