"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
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
  const slidesPerView = 4;
  const extendedSlides = [...data.slides, ...data.slides, ...data.slides];
  const startIndex = data.slides.length;

  useEffect(() => {
    setCurrentIndex(startIndex);
  }, [startIndex]);

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
  }, [currentIndex, isTransitioning, startIndex]);

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
    <section className="bg-white py-16">
      {/* Heading */}
      <div className="mb-8 text-center">
        <div 
          className="[&_h2]:text-4xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:mb-3"
          dangerouslySetInnerHTML={{ __html: data.title }}
        />
        <p className="text-gray-600">{data.subtitle}</p>
      </div>

      {/* Slider - Full Width */}
      <div className="relative">
        {/* Navigation Buttons */}
        <button
          onClick={handlePrev}
          className="absolute left-0 top-1/2 z-10 -translate-y-1/2 bg-black text-white p-2 shadow-lg hover:bg-white hover:text-black"
          aria-label="Previous"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={handleNext}
          className="absolute right-0 top-1/2 z-10 -translate-y-1/2 bg-black text-white p-2 shadow-lg hover:bg-white hover:text-black"
          aria-label="Next"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Slides Container */}
        <div className="overflow-hidden">
          <div
            className="flex"
            style={{
              transform: `translateX(-${currentIndex * (100 / slidesPerView)}%)`,
              transition: isTransitioning ? 'transform 500ms ease-out' : 'none'
            }}
          >
            {extendedSlides.map((slide, index) => (
              <Link
                key={`${slide.id}-${index}`}
                href={slide.link}
                className="group w-1/4 flex-shrink-0"
              >
                <div className="relative h-80 overflow-hidden">
                  <img
                    src={`${process.env.NEXT_PUBLIC_FILES_URL || ''}${slide.image}`}
                    alt={slide.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <h3 className="absolute bg-black/70 bottom-0 left-0 right-0 text-2xl text-center px-3 p-3 font-bold text-white">
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
