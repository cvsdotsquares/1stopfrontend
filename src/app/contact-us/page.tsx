import React from "react";
import Script from "next/script";
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

export const revalidate = 60; // revalidate data periodically

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

export default async function Page() {
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "") : "";
    const fetchUrl = apiBase ? `${apiBase}/contactus` : "/api/contactus";
    const res = await fetch(fetchUrl, { cache: "no-store" });
    if (!res.ok) throw new Error(`API request failed: ${res.status} ${res.statusText}`);
    const json = await res.json();
    const data = json?.data ?? {};

    return (
      <>
        {RECAPTCHA_SITE_KEY && (
          <Script
            src={`https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`}
            strategy="lazyOnload"
          />
        )}
        {/* Carousel Banner when banner_type is 2 */}
        {data.banner_type == 2 && <CarouselBanner />}

        {/* Page Static Banner when banner_type is 1 */}
        {data.banner_type == 1 && data.carousel_static_image && (
          <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white">
            {data.carousel_static_image && (
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${process.env.NEXT_PUBLIC_FILES_URL || ''}/uploads/${data.carousel_static_image})` }}
              >
                <div className="absolute inset-0 bg-black/40" />
              </div>
            )}
            <div className="relative container mx-auto px-4 py-16">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{data.link_title || data.page_title}</h1>
              {data.overlay_caption == 1 && data.overlay_caption_text && (
                <p className="text-xl md:text-2xl text-gray-200 max-w-2xl" dangerouslySetInnerHTML={{ __html: data.overlay_caption_text }} />
              )}
              {data.carousel_static_caption && <p className="text-lg text-gray-300 mt-4" dangerouslySetInnerHTML={{ __html: data.carousel_static_caption }} />}
            </div>
          </div>
        )}
        <ContactUsClient
          page_title={data.banner_type == 1 ? "" : data.page_title || "Contact Us"}
          page_content={data.page_content || ""}
          contact_offices={data.contact_offices || []}
        />

        {/* Homepage Components */}
        {data.about && <AboutSection data={data.about} />}
        {data.services && <ServicesSection data={data.services} />}
        {data.cbt_london && <FeatureImageLeft data={data.cbt_london} />}
        {data.cbt_test_london && <FeatureImageRight data={data.cbt_test_london} />}
        {data.training_slider && <TrainingSlider data={data.training_slider} />}
        {data.why_us && <WhyUsSection data={data.why_us} />}
        {data.banners && <GenericCta {...data.banners} />}

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
