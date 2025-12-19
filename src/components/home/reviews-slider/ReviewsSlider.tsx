"use client";

import { useState } from "react";

interface ReviewsData {
  title: string;
  titleHighlight: string;
  subtitle: string;
  reviews: Array<{
    id: number;
    rating: number;
    text: string;
    author: string;
  }>;
}

export default function ReviewsSlider({ data }: { data: ReviewsData }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const slidesPerView = 4;
  const maxIndex = Math.max(0, data.reviews.length - slidesPerView);

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? "text-orange-400" : "text-gray-300"}>
        ★
      </span>
    ));
  };

  return (
    <section className="bg-gray-50 py-16">
      <div className="mx-auto max-w-7xl px-6">
        {/* Title */}
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold text-gray-900">
            {data.title}{" "}
            <span className="text-indigo-700">{data.titleHighlight}</span>
          </h2>
          <p className="mt-3 text-gray-600">{data.subtitle}</p>
        </div>

        {/* Reviews Container */}
        <div className="relative">
          {/* Reviews Grid */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(-${currentIndex * (100 / slidesPerView)}%)`
              }}
            >
              {data.reviews.map((review) => (
                <div
                  key={review.id}
                  className="w-1/4 flex-shrink-0 px-3"
                >
                  <div className="rounded-lg bg-white p-6 shadow-sm h-80 flex flex-col">
                    {/* Quote Icon */}
                    <div className="mb-4 text-3xl text-indigo-700">
                      <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
                      </svg>
                    </div>
                    
                    {/* Stars */}
                    <div className="mb-4 flex text-lg">
                      {renderStars(review.rating)}
                    </div>

                    {/* Review Text */}
                    <p className="mb-6 text-gray-700 leading-relaxed flex-grow">
                      "{review.text}"
                    </p>

                    {/* Author */}
                    <p className="font-semibold text-gray-900 mt-auto">
                      by {review.author}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons - Bottom Positioned with Line */}
          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="text-indigo-700 hover:text-indigo-800 disabled:text-gray-300 disabled:cursor-not-allowed"
              aria-label="Previous reviews"
            >
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="h-px flex-1 mx-8 bg-gray-300"></div>

            <button
              onClick={handleNext}
              disabled={currentIndex === maxIndex}
              className="text-indigo-700 hover:text-indigo-800 disabled:text-gray-300 disabled:cursor-not-allowed"
              aria-label="Next reviews"
            >
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}