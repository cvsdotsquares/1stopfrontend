'use client';

import { useQuery } from '@tanstack/react-query';
import { cmsApi } from '@/services/api';
import { useEffect } from 'react';
import Hero from "@/components/home/hero/Hero";
import AboutSection from "@/components/home/about/AboutSection";
import ServicesSection from "@/components/home/services/ServicesSection";
import FeatureImageLeft from "@/components/home/generic-feature/FeatureImageLeft";
import FeatureImageRight from "@/components/home/generic-feature/FeatureImageRight";
import TrainingSlider from "@/components/home/training-slider/TrainingSlider";
import WhyUsSection from "@/components/home/why-us/WhyUsSection";
import AccreditationsSection from "@/components/accreditations/AccreditationsSection";
import FaqsSection from "@/components/home/faqs/FaqsSection";
import GenericCta from "@/components/home/generic-cta/GenericCta";
import TestimonialsCarousel from "@/components/testimonials";
import FeaturesSection from "@/components/home/features/FeaturesSection";
import homepageData from "@/data/homepage.json";


export default function Home() {

    // Fetch homepage data from API
    const { data: apiData, isLoading, error } = useQuery({
      queryKey: ['homepage'],
      queryFn: () => cmsApi.getHomepageData(),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Fetch page settings for testimonial display
    const { data: pageData } = useQuery({
      queryKey: ['page', 'home'],
      queryFn: () => cmsApi.getPage('home'),
      staleTime: 5 * 60 * 1000,
    });

  const pageContent = pageData?.data;

  // Update document title and meta when page data loads
  useEffect(() => {
    if (pageContent?.meta_title) {
      document.title = pageContent.meta_title;
    } else if (pageContent?.page_title) {
      document.title = pageContent.page_title;
    }

    if (pageContent?.meta_desc) {
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', pageContent.meta_desc);
      } else {
        const meta = document.createElement('meta');
        meta.name = 'description';
        meta.content = pageContent.meta_desc;
        document.head.appendChild(meta);
      }
    }
  }, [pageContent]);

    // Use API data for hero, about, services, cbtAcrossLondon, cbtTestLondon, trainingSlider, whyUs, features, accreditations, faqs, and ctas sections, fallback to static data for other sections
    const heroData = apiData?.success ? apiData.data.hero : homepageData.data.hero;
    const aboutData = apiData?.success ? apiData.data.about : homepageData.data.about;
    const servicesData = apiData?.success ? apiData.data.services : homepageData.data.services;
    const showServices = pageData?.data?.featured_display === 1;
    const cbtAcrossLondonData = apiData?.success ? apiData.data.cbtAcrossLondon : null;
    const cbtTestLondonData = apiData?.success ? apiData.data.cbtTestLondon : null;
    const trainingSliderData = apiData?.success ? apiData.data.trainingSlider : homepageData.data.trainingSlider;
    const whyUsData = apiData?.success ? apiData.data.whyUs : homepageData.data.whyUs;
    const featuresData = apiData?.success ? apiData.data.features : [];
    const showAccreditations = pageData?.data?.accreditation_display === 1;
    const faqsData = apiData?.success ? apiData.data.faqs : null;
    const ctasData = apiData?.success ? apiData.data.ctas : [];
    const showTestimonials = pageData?.data?.testimonial_display === 1;


    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (error) {
      console.error('Failed to load homepage data:', error);
      // Fallback to static data on error
    }

    // Get CTAs by position
    const getCTAByPosition = (position: number) => {
      return ctasData.find((cta: any) => cta.position === position);
    };

    return(
      <>
        {heroData && <Hero data={heroData} />}
        {aboutData && <AboutSection data={aboutData} />}
        {showServices && servicesData && <ServicesSection data={servicesData} />}
        {cbtAcrossLondonData && <FeatureImageLeft data={cbtAcrossLondonData} />}
        {cbtTestLondonData && <FeatureImageRight data={cbtTestLondonData} />}
        {trainingSliderData && <TrainingSlider data={trainingSliderData} />}
        {whyUsData && <WhyUsSection data={whyUsData} />}
        {getCTAByPosition(1) && <GenericCta {...getCTAByPosition(1)} />}
        {featuresData.length > 0 && <FeaturesSection features={featuresData} />}
        {getCTAByPosition(2) && <GenericCta {...getCTAByPosition(2)} />}
        {showTestimonials && <TestimonialsCarousel limit={10} />}
        {showAccreditations &&<AccreditationsSection />}
        {getCTAByPosition(3) && <GenericCta {...getCTAByPosition(3)} />}
        {faqsData && <FaqsSection data={faqsData} />}
      </>
    );
}