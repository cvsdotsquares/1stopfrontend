import { cmsApi } from '@/services/api';
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


// helper for metadata
function stripHtml(html: string) {
  return html
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<[^>]*>/g, "")
    .trim();
}


// SEO metadata (server side)
export async function generateMetadata() {

  const pageData = await cmsApi.getPage("home");

  const pageContent = pageData?.data;
  return {
    title:
      stripHtml(pageContent?.page_title) ||
      "Default Title",

    description:
      pageContent?.meta_desc || "Default description",

    keywords:
      pageContent?.meta_keyword || "default, keywords",

    viewport: "width=device-width, initial-scale=1, user-scalable=no",

    robots: "noindex, nofollow, noarchive, nosnippet"
  };
}



export default async function Home() {

  // fetch both APIs in parallel with caching
  const [apiData, pageData] = await Promise.all([
    cmsApi.getHomepageData(),

    cmsApi.getPage("home")
  ]);


  // fallback to static JSON if API fails
  const homepage = apiData?.success
    ? apiData.data
    : homepageData.data;

  const pageContent = pageData?.data;


  const heroData = homepage.hero;
  const aboutData = homepage.about;
  const servicesData = homepage.services;

  const showServices =
    pageContent?.featured_display === 1;

  const cbtAcrossLondonData =
    homepage.cbtAcrossLondon;

  const cbtTestLondonData =
    homepage.cbtTestLondon;

  const trainingSliderData =
    homepage.trainingSlider;

  const whyUsData =
    homepage.whyUs;

  const featuresData =
    homepage.features || [];

  const showAccreditations =
    pageContent?.accreditation_display === 1;

  const faqsData =
    homepage.faqs;

  const ctasData =
    homepage.ctas || [];

  const showTestimonials =
    pageContent?.testimonial_display === 1;

  const getCTAByPosition = (position:number) =>
    ctasData.find(
      (cta:any) => cta.position === position
    );

  return (
    <>
      {heroData && <Hero data={heroData} />}

      {aboutData && (
        <AboutSection data={aboutData} />
      )}

      {showServices && servicesData && (
        <ServicesSection data={servicesData} />
      )}

      {cbtAcrossLondonData && (
        <FeatureImageLeft data={cbtAcrossLondonData} />
      )}

      {cbtTestLondonData && (
        <FeatureImageRight data={cbtTestLondonData} />
      )}

      {trainingSliderData && (
        <TrainingSlider data={trainingSliderData} />
      )}

      {whyUsData && (
        <WhyUsSection data={whyUsData} />
      )}

      {getCTAByPosition(1) && (
        <GenericCta {...getCTAByPosition(1)} />
      )}

      {featuresData.length > 0 && (
        <FeaturesSection features={featuresData} />
      )}

      {getCTAByPosition(2) && (
        <GenericCta {...getCTAByPosition(2)} />
      )}

      {showTestimonials && (
        <TestimonialsCarousel limit={10} />
      )}

      {showAccreditations && (
        <AccreditationsSection />
      )}

      {getCTAByPosition(3) && (
        <GenericCta {...getCTAByPosition(3)} />
      )}

      {faqsData && (
        <FaqsSection data={faqsData} />
      )}
    </>
  );
}