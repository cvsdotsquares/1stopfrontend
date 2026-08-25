import type { ReactNode } from 'react';
import PageContent from '@/components/cms/PageContent';
import FeaturedServices from '@/components/ui/FeaturedServices';
import TestimonialsCarousel from '@/components/testimonials';
import AccreditationsSection from '@/components/accreditations/AccreditationsSection';
import AboutSection from '@/components/home/about/AboutSection';
import ServicesSection from '@/components/home/services/ServicesSection';
import FeatureImageLeft from '@/components/home/generic-feature/FeatureImageLeft';
import FeatureImageRight from '@/components/home/generic-feature/FeatureImageRight';
import TrainingSlider from '@/components/home/training-slider/TrainingSlider';
import WhyUsSection from '@/components/home/why-us/WhyUsSection';
import GenericCta from '@/components/home/generic-cta/GenericCta';
import Link from 'next/link';
import Hero from '@/components/home/hero/Hero';
import TabSection from '@/components/cms/TabSection';
import InfoCardsSection from '@/components/home/info-cards/InfoCardsSection';
import PriceCardSection from '@/components/home/price-cards/PriceCardSection';
import ServiceAreasSection from '@/components/home/service-areas/ServiceAreasSection';
import AccordionSection from '@/components/home/accordion/AccordionSection';
import ContentCardsSection from '@/components/home/content-cards/ContentCardsSection';
import ProcessStepsSection from '@/components/home/process-steps/ProcessStepsSection';
import CounterAnimation from '@/components/ui/CounterAnimation';

export type CmsItem = {
  id: number;
  section_id: number;
  item_type: 'text' | 'link' | 'image' | string;
  item_title: string;
  item_content: string;
  item_url?: string;
  item_image?: string;
  sort_order?: number;
};

export type CmsSection = {
  id: number;
  section_title: string;
  items: CmsItem[];
  make_cta?: number;
};

export type CmsPage = {
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
  display_counter?: string | number;
  preview?: boolean;
};

type CounterData = {
  taining_centers?: number;
  qualified_instructors?: number;
  passing_rate?: string | number;
  student_tainined?: number;
};

type Props = {
  page: CmsPage;
  counterData?: CounterData;
  /** Optional banner shown above the page (e.g. preview mode). */
  banner?: ReactNode;
};

export default function CmsPageView({ page, counterData = {}, banner }: Props) {
  const sortedSections = page.sections ? [...page.sections].sort((a, b) => a.order - b.order) : [];

  const heroSection = sortedSections.find((section) => section.type === 'hero');
  const sidebarSection = sortedSections.find((section) => section.type === 'cms_sidebar');
  const contentSections = sortedSections.filter(
    (section) => section.type !== 'cms_sidebar' && section.type !== 'hero'
  );
  const hasSidebar = !!sidebarSection;

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
        return <ServiceAreasSection key={`section-${index}`} data={section.data} />;
      case 'accordion_section':
        return <AccordionSection key={`section-${index}`} data={section.data} order={section.order} />;
      case 'content_cards_section':
        return <ContentCardsSection key={`section-${index}`} data={section.data} />;
      case 'process_steps':
        return (
          <ProcessStepsSection
            key={`section-${index}`}
            data={section.data}
            sidebar={{ hasSidebar }}
          />
        );
      case 'dynamic_content':
        if (section.data.make_cta == '1') {
          return (
            <div className="bg-gray-100 py-8 md:py-16 px-6" key={`section-${index}`}>
              <div className="max-w-[1400px] mx-auto">
                <div className="[&_h2]:text-black [&_h2]:mb-5 [&_h2]:text-3xl text-gray-500 [&_a]:underline [&_a:hover]:text-red-500 [&_div]:p-5 [&_div]:bg-blue-100 [&_div]:text-blue-600 [&_div]:border-l-2 [&_div]:border-blue-600">
                  <h2 className="text-center">{section.data.section_title}</h2>
                  <span className="flex justify-center items-center gap-8 flex-wrap">
                    {[...section.data.items]
                      .sort((a: CmsItem, b: CmsItem) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
                      .map((item: CmsItem) => (
                        <span key={item.id}>
                          {item.item_image && (
                            <img
                              src={`${process.env.NEXT_PUBLIC_FILES_URL || ''}/uploads/dynamic_content/${item.item_image}`}
                              alt={item.item_title}
                              className="max-w-sm h-auto rounded-lg mb-4"
                            />
                          )}
                          {item.item_content && (
                            <span
                              className="block text-lg text-gray-700 mb-4"
                              dangerouslySetInnerHTML={{ __html: item.item_content }}
                            />
                          )}
                          {item.item_url && (
                            <Link
                              className="inline-block text-white bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg font-semibold transition-colors"
                              href={item.item_url}
                            >
                              {item.item_title}
                            </Link>
                          )}
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
              <div className="grid grid-cols-1 [&_ul]:pb-3 [&_ul]:space-y-2 custom-list [&_a]:underline">
                <h2 className="text-3xl mb-4 text-black">{section.data.section_title}</h2>
                {[...section.data.items]
                  .sort((a: CmsItem, b: CmsItem) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
                  .map((item: CmsItem) => (
                    <span key={item.id}>
                      <div
                        className="[&_p]:text-gray-700 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-2"
                        dangerouslySetInnerHTML={{ __html: item.item_content || '' }}
                      />
                      <div className="pt-6">
                        {item.item_image && (
                          <img
                            className="rounded-lg w-full object-cover"
                            src={`${process.env.NEXT_PUBLIC_FILES_URL || ''}/uploads/dynamic_content/${item.item_image}`}
                            alt={item.item_title}
                          />
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
      {banner}

      {heroSection && renderSection(heroSection, -1)}

      {hasSidebar ? (
        <section className="py-10 lg:py-16">
          <div className="max-w-[1400px] mx-auto px-4">
            <div className="flex flex-wrap lg:flex-nowrap gap-6">
              <div className="w-full lg:w-3/4">
                <div className="grid grid-cols-1 gap-6">
                  {contentSections.map((section, index) => renderSection(section, index))}

                  {(!contentSections || contentSections.length === 0) && page.page_content && (
                    <div className="mb-8">
                      <PageContent content={page.page_content} />
                    </div>
                  )}
                </div>
              </div>

              <div className="w-full lg:w-1/4">
                {sidebarSection && renderSidebar(sidebarSection.data)}
              </div>
            </div>
          </div>
        </section>
      ) : (
        <>
          {contentSections.map((section, index) => renderSection(section, index))}

          {(!contentSections || contentSections.length === 0) && page.page_content && (
            <section className="mb-8 px-4 py-8 md:py-16 max-w-[1400px] mx-auto">
              <PageContent content={page.page_content} />
            </section>
          )}
        </>
      )}

      {page.display_counter == 1 && (
        <div className="max-w-[1400px] mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-12">
            <div className="bg-white rounded-lg border border-gray-200 px-3 py-5 sm:p-6 text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {counterData.taining_centers ? (
                  <CounterAnimation end={counterData.taining_centers} />
                ) : (
                  '13'
                )}
              </div>
              <div className="border-2 border-red-200 border-w mx-auto w-[60px]"></div>
              <div className="text-lg text-gray-500 mt-4">Training Centers</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 px-3 py-5 sm:p-6 text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {counterData.qualified_instructors ? (
                  <CounterAnimation end={counterData.qualified_instructors} suffix="+" />
                ) : (
                  '50+'
                )}
              </div>
              <div className="border-2 border-red-200 border-w mx-auto w-[60px]"></div>
              <div className="text-lg text-gray-500 mt-4">Qualified Instructors</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 px-3 py-5 sm:p-6 text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {counterData.passing_rate ? (
                  <>
                    <CounterAnimation end={parseFloat(String(counterData.passing_rate))} />
                    <span className="text-red-600">% +</span>
                  </>
                ) : (
                  <>
                    90<span className="text-red-600">% +</span>
                  </>
                )}
              </div>
              <div className="border-2 border-red-200 border-w mx-auto w-[105px]"></div>
              <div className="text-lg text-gray-500 mt-4">Pass Rate</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 px-3 py-5 sm:p-6 text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {counterData.student_tainined ? (
                  <CounterAnimation end={counterData.student_tainined} suffix="k +" />
                ) : (
                  '15k +'
                )}
              </div>
              <div className="border-2 border-red-200 border-w mx-auto w-[96px]"></div>
              <div className="text-lg text-gray-500 mt-4">Students Trained</div>
            </div>
          </div>
        </div>
      )}

      {page.featured_display == 1 && <FeaturedServices />}
      {page.testimonial_display == 1 && <TestimonialsCarousel />}
      {page.accreditation_display == 1 && <AccreditationsSection />}
    </div>
  );
}
