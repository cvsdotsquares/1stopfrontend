import React from "react";
import Script from "next/script";
import { cmsApi } from '@/services/api';
import ContactUsClient from "./ContactUsClient";
import CarouselBanner from '@/components/cms/CarouselBanner';
import AccreditationsSection from "@/components/accreditations/AccreditationsSection";
import FeaturedServices from "@/components/ui/FeaturedServices";
import TestimonialsCarousel from "@/components/testimonials/TestimonialsCarousel";
import AboutSection from "@/components/home/about/AboutSection";
import ServicesSection from "@/components/home/services/ServicesSection";
import FeatureImageLeft from "@/components/home/generic-feature/FeatureImageLeft";
import FeatureImageRight from "@/components/home/generic-feature/FeatureImageRight";
import TrainingSlider from "@/components/home/training-slider/TrainingSlider";
import WhyUsSection from "@/components/home/why-us/WhyUsSection";
import GenericCta from "@/components/home/generic-cta/GenericCta";
import Hero from "@/components/home/hero/Hero";
import TabSection from '@/components/cms/TabSection';
import InfoCardsSection from '@/components/home/info-cards/InfoCardsSection';
import PriceCardSection from '@/components/home/price-cards/PriceCardSection';
import ServiceAreasSection from '@/components/home/service-areas/ServiceAreasSection';
import AccordionSection from '@/components/home/accordion/AccordionSection';
import ContentCardsSection from '@/components/home/content-cards/ContentCardsSection';
import ProcessStepsSection from '@/components/home/process-steps/ProcessStepsSection';

export const revalidate = 60; // revalidate data periodically

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

const stripHtml = (html?: string) => {
  if (!html) return "";

  return html
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll(/<[^>]*>/g, "")
    .replaceAll("&ndash;", "-")
    .replaceAll("&mdash;", "—")
    .replaceAll("&pound;", "£")
    .trim();
};

export async function generateMetadata() {
  const pageData = await cmsApi.getPage("contact-us");
  const pageContent = pageData?.data;

  return {
    title: stripHtml(pageContent?.meta_title),
    description: stripHtml(pageContent?.meta_desc),
    keywords: stripHtml(pageContent?.meta_keyword),
    viewport: "width=device-width, initial-scale=1, user-scalable=no",
  };
}

export default async function Page() {
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "") : "";
    const fetchUrl = apiBase ? `${apiBase}/contactus` : "/api/contactus";
    const res = await fetch(fetchUrl, { cache: "no-store" });
    if (!res.ok) throw new Error(`API request failed: ${res.status} ${res.statusText}`);
    const json = await res.json();
    const data = json?.data ?? {};

    // Sort sections by order if available
    const sortedSections = data.sections ? [...data.sections].sort((a: any, b: any) => a.order - b.order) : [];

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
          return <ServiceAreasSection key={`section-${index}`} data={section.data} />;
        case 'accordion_section':
          return <AccordionSection key={`section-${index}`} data={section.data} order={section.order} />;
        case 'content_cards_section':
          return <ContentCardsSection key={`section-${index}`} data={section.data} />;
        case 'process_steps':
          return <ProcessStepsSection key={`section-${index}`} data={section.data} sidebar={{ hasSidebar: false }} />;
        default:
          return null;
      }
    };

    return (
      <>
        {RECAPTCHA_SITE_KEY && (
          <Script
            src={`https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`}
            strategy="lazyOnload"
          />
        )}
        {/* Carousel Banner when banner_type is 2
        {data.banner_type == 2 && <CarouselBanner />}

        {data.banner_type == 1 && data.carousel_static_image && (
          <div className="flex items-center relative bg-gradient-to-r from-blue-600 to-blue-800 text-white min-h-[300px] md:min-h-[400px] xl:min-h-[550px]">
            {data.carousel_static_image && (
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat "
                style={{ backgroundImage: `url(${process.env.NEXT_PUBLIC_FILES_URL || ''}/uploads/${data.carousel_static_image})` }}
              >
                <div className="absolute inset-0 bg-black/40" />
              </div>
            )}
            <div className="relative w-full max-w-[1400px] mx-auto px-4 py-8 md:py-16">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{data.link_title || data.page_title}</h1>
              {data.overlay_caption == 1 && data.overlay_caption_text && (
                <p className="text-xl md:text-2xl text-gray-200 max-w-2xl" dangerouslySetInnerHTML={{ __html: data.overlay_caption_text }} />
              )}
              {data.carousel_static_caption && <p className="text-lg text-white mt-4 [&_span]:p-2 [&_span]:text-black" dangerouslySetInnerHTML={{ __html: data.carousel_static_caption }} />}
            </div>
          </div>
        )} */}

        {/* Render all sections above the form and locations */}
        <div>
          {sortedSections.map((section: any, index: number) => renderSection(section, index))}
        </div>

        {/* Contact Form and Location Offices below sections */}
        <ContactUsClient
          page_title={data.banner_type == 1 ? "" : data.page_title || "Contact Us"}
          page_content={data.page_content || ""}
          contact_offices={data.contact_offices || []}
        />

        {/* Conditional components based on page settings */}
        {data.featured_service == 1 && <FeaturedServices />}
        {data.testimonial_display == 1 && <TestimonialsCarousel />}
        {data.accreditation_display == 1 && <AccreditationsSection />}
      </>
    );
  } catch (err) {
    console.error("Failed to load contact us data", err);
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold">Contact Us</h1>
        <p>Unable to load page content at the moment.</p>
      </div>
    );
  }
}
