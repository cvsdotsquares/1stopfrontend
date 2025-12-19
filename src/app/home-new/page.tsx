import Hero from "@/components/home/hero/Hero";
import AboutSection from "@/components/home/about/AboutSection";
import ServicesSection from "@/components/home/services/ServicesSection";
import TrainingSlider from "@/components/home/training-slider/TrainingSlider";
import WhyUsSection from "@/components/home/why-us/WhyUsSection";
import ReviewsSlider from "@/components/home/reviews-slider/ReviewsSlider";
import AccreditationsSection from "@/components/home/accreditations/AccreditationsSection";
import FaqsSection from "@/components/home/faqs/FaqsSection";
import GenericCta from "@/components/home/generic-cta/GenericCta";
import GenericFeature from "@/components/home/generic-feature/GenericFeature";
import homepageData from "@/data/homepage.json";

export default function HomeNewPage() {
  const bannerCta = homepageData.ctas.find(cta => cta.id === "banner")!;
  const courseCta = homepageData.ctas.find(cta => cta.id === "course")!;
  const availabilityCta = homepageData.ctas.find(cta => cta.id === "availability")!;
  
  const mainFeatures = homepageData.features.filter(f => f.id !== "training-site");
  const trainingSiteFeature = homepageData.features.find(f => f.id === "training-site")!;

  return(
    <>
      <Hero data={homepageData.hero} />
      <AboutSection data={homepageData.about} />
      <ServicesSection data={homepageData.services} />
      <GenericFeature features={mainFeatures} />
      <TrainingSlider data={homepageData.trainingSlider} />
      <WhyUsSection data={homepageData.whyUs} />
      <GenericCta {...bannerCta} />
      <GenericFeature features={[trainingSiteFeature]} />
      <GenericCta {...courseCta} />
      <ReviewsSlider data={homepageData.reviews} />
      <AccreditationsSection data={homepageData.accreditations} />
      <GenericCta {...availabilityCta} />
      <FaqsSection data={homepageData.faqs} />
    </>
  );
}
