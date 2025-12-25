'use client';

import { useQuery } from '@tanstack/react-query';
import { cmsApi } from '@/services/api';
import Hero from "@/components/home/hero/Hero";
import AboutSection from "@/components/home/about/AboutSection";
import ServicesSection from "@/components/home/services/ServicesSection";
import FeatureImageLeft from "@/components/home/generic-feature/FeatureImageLeft";
import FeatureImageRight from "@/components/home/generic-feature/FeatureImageRight";
import TrainingSlider from "@/components/home/training-slider/TrainingSlider";
import WhyUsSection from "@/components/home/why-us/WhyUsSection";
import ReviewsSlider from "@/components/home/reviews-slider/ReviewsSlider";
import AccreditationsSection from "@/components/home/accreditations/AccreditationsSection";
import FaqsSection from "@/components/home/faqs/FaqsSection";
import GenericCta from "@/components/home/generic-cta/GenericCta";
import GenericFeature from "@/components/home/generic-feature/GenericFeature";
import homepageData from "@/data/homepage.json";

export default function HomeNewPage() {
  // Fetch homepage data from API
  const { data: apiData, isLoading, error } = useQuery({
    queryKey: ['homepage'],
    queryFn: () => cmsApi.getHomepageData(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Use API data for hero, about, services, cbtAcrossLondon, cbtTestLondon, and trainingSlider sections, fallback to static data for other sections
  const heroData = apiData?.success ? apiData.data.hero : homepageData.data.hero;
  const aboutData = apiData?.success ? apiData.data.about : homepageData.data.about;
  const servicesData = apiData?.success ? apiData.data.services : homepageData.data.services;
  const cbtAcrossLondonData = apiData?.success ? apiData.data.cbtAcrossLondon : null;
  const cbtTestLondonData = apiData?.success ? apiData.data.cbtTestLondon : null;
  const trainingSliderData = apiData?.success ? apiData.data.trainingSlider : homepageData.data.trainingSlider;
  const staticData = homepageData.data;

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

  return(
    <>
      {heroData && <Hero data={heroData} />}
      {aboutData && <AboutSection data={aboutData} />}
      {servicesData && <ServicesSection data={servicesData} />}
      {cbtAcrossLondonData && <FeatureImageLeft data={cbtAcrossLondonData} />}
      {cbtTestLondonData && <FeatureImageRight data={cbtTestLondonData} />}
      {trainingSliderData && <TrainingSlider data={trainingSliderData} />}
      {staticData.whyUs && <WhyUsSection data={staticData.whyUs} />}
      {staticData.reviews && <ReviewsSlider data={staticData.reviews} />}
    </>
  );
}