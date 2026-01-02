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
        <div className="h-[700px] relative inset-0">
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
      <div className="absolute top-1 right-1 py-2">
      <div className=" inset-0 bg-black/50" />

      {/* Right-side content */}
      <div className="relative z-10 flex h-full items-start justify-end">
        <div className="w-full max-w-[562px]">

          {/* CBT floating card */}
          <div className="mb-2 bg-white/70 px-10 py-7 text-center radius20-left radius20-left-bottom">
            <div className="text26 font-semibold text-red-600">
              {data.nextCourse.label} {data.nextCourse.dateText}
            </div>

            <a
              href={data.nextCourse.ctaLink}
              className="mt-3 radius20-left radius20-right-bottom inline-block bg-red-600 px-10 py-3 text-2xl text-white hover:bg-red-700"
            >
              {data.nextCourse.ctaText}
            </a>
          </div>

          {/* Purple panel */}
          <div className="bg-blue-600/50 px-10 py-10 text-white radius20-left radius20-left-bottom">

            {/* Search */}
            <div className="mb-12">
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
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search h-5 w-5" aria-hidden="true"><path d="m21 21-4.34-4.34"></path><circle cx="11" cy="11" r="8"></circle></svg>
                </span>
              </div>
            </div>

            {/* Summer Special */}
            <h2 className="text50 font-bold leading-none">
              {data.promotion.title}
            </h2>

            <p className="mt-4 text-3xl font-normal">
              {data.promotion.subtitle}
            </p>

            <p className="mt-5 text-xl font-normal">
              Use Promo Code{" "}
              <span className="text-2xl font-bold">
                {data.promotion.promoCode}
              </span>
            </p>

            <div className="mt-10 flex gap-4">
              <a
                href={data.promotion.primaryCta.link}
                className="radius20-left radius20-right-bottom bg-red-600 px-6 py-3 text-lg text-white hover:bg-red-500"
              >
                {data.promotion.primaryCta.text}
              </a>

              <a
                href={data.promotion.secondaryCta.link}
                className="radius20-left radius20-right-bottom text-lg bg-white px-6 py-3 text-black hover:bg-red-600 hover:text-white"
              >
                {data.promotion.secondaryCta.text}
              </a>
            </div>
          </div>

        </div>
      </div>
      </div>
      {/* Bottom banner */}
      <div className="w-full bg-black py-6 text-center">
          <p
          className="text-4xl text-white"
          dangerouslySetInnerHTML={{ __html: data.footerText }}
        />
      </div>
    </section>
  );
}
