"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface TrainingSliderData {
  title: string;
  subtitle: string;
  slides: Array<{
    id: number;
    title: string;
    image: string;
    link: string;
  }>;
}

export default function TrainingSlider({ data }: { data: TrainingSliderData }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [slidesPerView, setSlidesPerView] = useState(4);

  const extendedSlides = [...data.slides, ...data.slides, ...data.slides];
  const startIndex = data.slides.length;

  /* Responsive slides per view */
  useEffect(() => {
    const updateSlidesPerView = () => {
      const width = window.innerWidth;

      if (width < 640) setSlidesPerView(1);
      else if (width < 1024) setSlidesPerView(2);
      else if (width < 1280) setSlidesPerView(3);
      else setSlidesPerView(4);
    };

    updateSlidesPerView();
    window.addEventListener("resize", updateSlidesPerView);
    return () => window.removeEventListener("resize", updateSlidesPerView);
  }, []);

  useEffect(() => {
    setCurrentIndex(startIndex);
  }, [startIndex, slidesPerView]);

  useEffect(() => {
    if (!isTransitioning) return;

    const timer = setTimeout(() => {
      setIsTransitioning(false);

      if (currentIndex >= startIndex + data.slides.length) {
        setCurrentIndex(startIndex);
      } else if (currentIndex < startIndex) {
        setCurrentIndex(startIndex + data.slides.length - 1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [currentIndex, isTransitioning, startIndex, data.slides.length]);

  const handlePrev = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  };

  return (
    <section className="bg-white py-8 md:py-16">
      {/* Heading */}
      <div className="mb-8 text-center px-3">
        <div
          className="[&_h2]:mb-3"
          dangerouslySetInnerHTML={{ __html: data.title }}
        />
        <p className="text-gray-600">{data.subtitle}</p>
      </div>

      {/* Slider */}
      <div className="relative">
        {/* Navigation */}
        <button
          onClick={handlePrev}
          className="absolute left-0 top-1/2 z-10 -translate-y-1/2 bg-black text-white p-2 shadow-lg hover:bg-white hover:text-black block cursor-pointer"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /> </svg>
        </button>

        <button
          onClick={handleNext}
          className="absolute right-0 top-1/2 z-10 -translate-y-1/2 bg-black text-white p-2 shadow-lg hover:bg-white hover:text-black block cursor-pointer"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /> </svg>
        </button>

        {/* Slides */}
        <div className="overflow-hidden">
          <div
            className="flex"
            style={{
              transform: `translateX(-${currentIndex * (100 / slidesPerView)}%)`,
              transition: isTransitioning ? "transform 500ms ease-out" : "none",
            }}
          >
            {extendedSlides.map((slide, index) => (
              <Link
                key={`${slide.id}-${index}`}
                href={slide.link}
                className="group flex-shrink-0"
                style={{ width: `${100 / slidesPerView}%` }}
              >
                <div className="relative h-64 sm:h-72 md:h-80 overflow-hidden">
                  <img
                    src={`${process.env.NEXT_PUBLIC_FILES_URL || ""}${slide.image}`}
                    alt={slide.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <h3 className="absolute bottom-0 left-0 right-0 bg-black/70 text-center text-lg sm:text-xl md:text-2xl font-bold text-white p-3">
                    {slide.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
