"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface TrainingSliderData {
  title: string;
  titleHighlight: string;
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
      <div className="mb-12 text-center">
        <h2 className="text-4xl font-bold text-gray-900">
          {data.title}{" "}
          <span className="text-indigo-700">{data.titleHighlight}</span>
        </h2>
        <p className="mt-3 text-gray-600">{data.subtitle}</p>
      </div>

      {/* Slider - Full Width */}
      <div className="relative">
        {/* Navigation Buttons */}
        <button
          onClick={handlePrev}
          className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-3 shadow-lg hover:bg-white"
          aria-label="Previous"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-3 shadow-lg hover:bg-white"
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
                <div className="relative h-80">
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <h3 className="absolute bottom-6 left-6 text-2xl font-bold text-white">
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
