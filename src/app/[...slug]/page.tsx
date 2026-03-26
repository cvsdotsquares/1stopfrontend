import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import PageContent from '@/components/cms/PageContent';
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
import Hero from "@/components/home/hero/Hero";
import TabSection from '@/components/cms/TabSection';
import InfoCardsSection from '@/components/home/info-cards/InfoCardsSection';
import PriceCardSection from '@/components/home/price-cards/PriceCardSection';
import ServiceAreasSection from '@/components/home/service-areas/ServiceAreasSection';
import AccordionSection from '@/components/home/accordion/AccordionSection';
import ContentCardsSection from '@/components/home/content-cards/ContentCardsSection';
import ProcessStepsSection from '@/components/home/process-steps/ProcessStepsSection';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

type CmsItem = {
  id: number;
  section_id: number;
  item_type: 'text' | 'link' | 'image' | string;
  item_title: string;
  item_content: string;
  item_url?: string;
  item_image?: string;
  sort_order?: number;
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
  featured_display?: number;
  testimonial_display?: number;
  accreditation_display?: number;
  featured_icon?: string;
  dynamic_sections?: CmsSection[];
  page_content?: string;
  meta?: { title?: string; description?: string; canonical?: string; ogImage?: string };
  sections?: Array<{
    type: string;
    order: number;
    data: any;
  }>;
  // Legacy fields (kept for backward compatibility)
  about_data?: any;
  services_data?: any;
  feature_left_data?: any;
  feature_right_data?: any;
  training_slider_data?: any;
  why_us_data?: any;
  generic_cta_data?: any;
  slider_images?: any;
  hero?: any;
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

  const stripHtml = (html: string) => {
    return html
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/<[^>]*>/g, '')
      .trim();
  };

  const rawTitle = page.meta_title || page.link_title || page.page_title || '';
  const title = stripHtml(rawTitle);
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

  // Sort sections by order
  const sortedSections = page.sections ? [...page.sections].sort((a, b) => a.order - b.order) : [];

  // Separate hero, sidebar and content sections
  const heroSection = sortedSections.find(section => section.type === 'hero');
  const sidebarSection = sortedSections.find(section => section.type === 'cms_sidebar');
  const contentSections = sortedSections.filter(section => section.type !== 'cms_sidebar' && section.type !== 'hero');
  const hasSidebar = !!sidebarSection;

  // Render component based on section type
  const renderSection = (section: { type: string; order: number; data: any }, index: number) => {
    switch (section.type) {
      case 'hero':
        return <Hero key={`section-${index}`} data={section.data} />;
      case 'about':
        return <AboutSection key={`section-${index}`} data={section.data} />;
      case 'services':
        return <ServicesSection key={`section-${index}`} data={section.data} />;
      case 'cbt_london':
        return <FeatureImageLeft key={`section-${index}`} data={section.data} />;
      case 'cbt_test_london':
        return <FeatureImageRight key={`section-${index}`} data={section.data} />;
      case 'training_slider':
        return <TrainingSlider key={`section-${index}`} data={section.data} />;
      case 'why_us':
        return <WhyUsSection key={`section-${index}`} data={section.data} />;
      case 'banner':
      case 'banners':
        return <GenericCta key={`section-${index}`} {...section.data} />;
      case 'tab_section':
        return <TabSection key={`section-${index}`} data={section.data} />;
      case 'info_card_section':
        return <InfoCardsSection key={`section-${index}`} data={section.data} />;
      case 'price_card_section':
        return <PriceCardSection key={`section-${index}`} data={section.data} />;
      case 'service_areas_section':
        if (!hasSidebar) {
          return (
              <ServiceAreasSection key={`section-${index}`} data={section.data} />
          );
        }
        return <ServiceAreasSection key={`section-${index}`} data={section.data} />;
      case 'accordion_section':
        return <AccordionSection key={`section-${index}`} data={section.data} order={section.order} />;
      case 'content_cards_section':
        return <ContentCardsSection key={`section-${index}`} data={section.data} />;
      case 'process_steps':
        return <ProcessStepsSection key={`section-${index}`} data={section.data} sidebar={{ hasSidebar }}/>;
      case 'dynamic_content':
        // Render dynamic_content section
        if (section.data.make_cta == '1') {
          return (
            <div className="bg-gray-100 py-8 md:py-16 px-6" key={`section-${index}`}>
              <div className="max-w-[1400px] mx-auto">
                <div className="[&_h2]:text-black [&_h2]:mb-5 [&_h2]:text-3xl text-gray-500 [&_a]:underline [&_a:hover]:text-red-500 [&_div]:p-5 [&_div]:bg-blue-100 [&_div]:text-blue-600 [&_div]:border-l-2 [&_div]:border-blue-600">
                  <h2 className="text-center">{section.data.section_title}</h2>
                  <span className="flex justify-center items-center gap-8 flex-wrap">
                    {[...section.data.items].sort((a: CmsItem, b: CmsItem) => (a.sort_order ?? 0) - (b.sort_order ?? 0)).map((item: CmsItem) => (
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
          <section className="py-10 md:py-16" key={`section-${index}`}>
            <div className="max-w-[1400px] mx-auto px-4">
              <div className="grid grid-cols-1">
                <h2 className='text-3xl mb-4 text-black'>{section.data.section_title}</h2>
                {[...section.data.items].sort((a: CmsItem, b: CmsItem) => (a.sort_order ?? 0) - (b.sort_order ?? 0)).map((item: CmsItem) => (
                  <span key={item.id}>
                    <div className='[&_p]:text-gray-700 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-2' dangerouslySetInnerHTML={{ __html: item.item_content || '' }} />
                    <div className='pt-6'>
                      {item.item_image && (
                        <img className="rounded-lg w-full object-cover" src={`${process.env.NEXT_PUBLIC_FILES_URL || ''}/uploads/dynamic_content/${item.item_image}`} alt={item.item_title} />
                      )}
                      {item.item_url && <Link href={item.item_url}>{item.item_title}</Link>}
                    </div>
                  </span>
                ))}
              </div>
            </div>
          </section>
        );
      default:
        return null;
    }
  };

  // Render sidebar items
  const renderSidebar = (sidebarData: any) => {
    if (!sidebarData?.items || sidebarData.items.length === 0) return null;

    return (
      <div className="space-y-8">
        {sidebarData.items.map((item: any, index: number) => (
          <div
            key={`sidebar-item-${index}`}
            dangerouslySetInnerHTML={{ __html: item.text || '' }}
            className="[&_.sidebar-gradient]:bg-gradient-to-br [&_.sidebar-gradient]:from-blue-800 [&_.sidebar-gradient]:to-blue-900 [&_.radius20-left]:rounded-tl-2xl [&_.radius20-right-bottom]:rounded-br-2xl"
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      {/* Hero section - always full width */}
      {heroSection && renderSection(heroSection, -1)}

      {hasSidebar ? (
        /* Layout with sidebar */
        <section className="py-10 lg:py-16">
          <div className="max-w-[1400px] mx-auto px-4">
            <div className="flex flex-wrap lg:flex-nowrap gap-6">
              {/* Main content area - 3/4 width */}
              <div className="w-full lg:w-3/4">
                <div className="grid grid-cols-1 gap-6">
                  {contentSections.map((section, index) => renderSection(section, index))}

                  {/* Fallback: render page_content if no content sections */}
                  {(!contentSections || contentSections.length === 0) && page.page_content && (
                    <div className="mb-8">
                      <PageContent content={page.page_content} />
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar - 1/4 width */}
              <div className="w-full lg:w-1/4">
                {sidebarSection && renderSidebar(sidebarSection.data)}
              </div>
            </div>
          </div>
        </section>
      ) : (
        /* Standard full-width layout without sidebar */
        <>
          {contentSections.map((section, index) => renderSection(section, index))}

          {/* Fallback: render page_content if no sections */}
          {(!contentSections || contentSections.length === 0) && page.page_content && (
            <section className="mb-8 px-4 py-8 md:py-16 max-w-[1400px] mx-auto">
              <PageContent content={page.page_content} />
            </section>
          )}
        </>
      )}

      {/* Static bottom components - always at full width */}
      {page.featured_display == 1 && <FeaturedServices />}
      {page.testimonial_display == 1 && <TestimonialsCarousel />}
      {page.accreditation_display == 1 && <AccreditationsSection />}
    </div>
  );
}
