'use client';

import { useState, useEffect } from 'react';

interface HeroData {
  backgroundImages: {
    src: string;
    alt: string;
    title: string;
  }[];
  nextCourse: {
    label: string;
    dateText: string;
    ctaText: string;
    ctaLink: string;
  };
  search: {
    title: string;
    placeholder: string;
  };
  promotion: {
    title: string;
    subtitle: string;
    promoCode: string;
    primaryCta: { text: string; link: string };
    secondaryCta: { text: string; link: string };
  };
  footerText: string;
}

export default function Hero({ data }: { data: HeroData }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const hasMultipleImages = data.backgroundImages && data.backgroundImages.length > 1;

  // Auto-slide for multiple images
  useEffect(() => {
    if (!hasMultipleImages) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => 
        prev === data.backgroundImages.length - 1 ? 0 : prev + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [hasMultipleImages, data.backgroundImages?.length]);

  // Get current background image
  const getCurrentBackground = () => {
    if (!data.backgroundImages || data.backgroundImages.length === 0) {
      return '/home/hero-motorbike.jpg';
    }
    const currentImage = data.backgroundImages[currentImageIndex];
    return `${process.env.NEXT_PUBLIC_FILES_URL || ''}${currentImage.src}`;
  };

  return (
    <section className="relative w-full overflow-hidden">
      {/* Background Images */}
      {hasMultipleImages ? (
        <div className="h-[600px] md:h-[700px] relative inset-0">
          {data.backgroundImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                backgroundImage: `url(${process.env.NEXT_PUBLIC_FILES_URL || ''}${image.src})`
              }}
            />
          ))}
        </div>
      ) : (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${getCurrentBackground()})` }}
        />
      )}
      {/* Dark overlay */}
      <div className="absolute top-1 right-0 py-2">
      <div className=" inset-0 bg-black/50" />

      {/* Right-side content */}
      <div className="relative z-10 flex h-full items-start justify-end ">
        <div className="w-11/12 md:w-full sm:max-w-[562px]">

          {/* CBT floating card */}
          <div className="mb-2 bg-white/70 py-6 px-4  md:px-10 md:py-7 text-center radius20-left radius20-left-bottom">
            <div className="text26 text-xl font-semibold text-red-600">
              {data.nextCourse.label} {data.nextCourse.dateText}
            </div>          

            <a
              href={data.nextCourse.ctaLink}
              className="mt-3 radius20-left radius20-right-bottom inline-block bg-red-600 px-10 py-3 text-base md:text-2xl text-white hover:bg-red-700"
            >
              {data.nextCourse.ctaText}
            </a>
          </div>

          {/* Purple panel */}
          <div className="bg-blue-600/50 py-6 px-4 md:px-10 md:py-10 text-white radius20-left radius20-left-bottom">

            {/* Search */}
            <div className="mb-6 md:mb-12">
              <p className="mb-3">
                {data.search.title}
              </p>

              <div className="relative max-w-[400px]">
                <input
                  type="text"
                  placeholder={data.search.placeholder}
                  className="w-full rounded-lg bg-white px-4 py-3 pr-12 text-gray-800 placeholder:text-gray-400 focus:outline-none"
                />

                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-indigo-600">
                  S
                </span>
              </div>
            </div>

            {/* Summer Special */}
            <h2 className="text50 font-bold leading-none">
              {data.promotion.title}
            </h2>

            <p className="mt-4 text-xl md:text-3xl">
              {data.promotion.subtitle}
            </p>

            <p className="mt-5 md:text-xl">
              Use Promo Code{" "}
              <span className="text-xl md:text-2xl font-bold">
                {data.promotion.promoCode}
              </span>
            </p>

            <div className="mt-4 md:mt-10 flex gap-3 md:gap-4 flex-wrap md:flex-nowrap">
              <a
                href={data.promotion.primaryCta.link}
                className="min-w-[210px] radius20-left radius20-right-bottom bg-red-600 px-6 py-3 text-base md:text-lg text-center text-white hover:bg-red-500"
              >
                {data.promotion.primaryCta.text}
              </a>

              <a
                href={data.promotion.secondaryCta.link}
                className="min-w-[210px] radius20-left radius20-right-bottom text-base md:text-lg bg-white px-6 py-3 text-black text-center hover:bg-red-600 hover:text-white"
              >
                {data.promotion.secondaryCta.text}
              </a>
            </div>
          </div>

        </div>
      </div>
      </div>
      {/* Bottom banner */}
      <div className="w-full bg-black py-6 text-center px-3">        
          <p
          className="text-2xl md:text-4xl text-white"
          dangerouslySetInnerHTML={{ __html: data.footerText }}
        />
      </div>
    </section>
  );
}
