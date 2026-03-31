'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { cmsApi } from '@/services/api';
import styles from './TestimonialsCarousel.module.css';

interface TestimonialsCarouselProps {
  limit?: number;
  className?: string;
}

interface Testimonial {
  id: number;
  review: string;
  review_name: string;
  status: number;
  created: string;
}

interface TestimonialsApiResponse {
  success: boolean;
  data: Testimonial[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function TestimonialsCarousel({ limit = 13, className = '' }: TestimonialsCarouselProps) {
  // Carousel state
  const [currentSlide, setCurrentSlide] = useState(0);
  // Responsive slides per view (mobile:1, desktop/tablet:4)
  const [slidesPerView, setSlidesPerView] = useState<number>(4);

  // Fetch testimonials data
  const { data: testimonials, isLoading, error } = useQuery({
    queryKey: ['testimonials', limit],
    queryFn: () => cmsApi.getTestimonials({ limit, status: 'active' }),
  });

  // Get testimonials data (API or fallback)
  const testimonialsData = testimonials || []; // Use empty array if API fails or returns no data

  // Update slidesPerView on resize / media change
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const update = () => setSlidesPerView(mq.matches ? 1 : 4);
    update();
    if (mq.addEventListener) mq.addEventListener('change', update);
    else mq.addListener(update);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', update);
      else mq.removeListener(update);
    };
  }, []);

  // For sliding carousel: total possible positions is (total items - visible items + 1)
  const maxSlideIndex = Math.max(0, testimonialsData.length - slidesPerView);

  // Clamp currentSlide when slidesPerView or testimonialsData change
  useEffect(() => {
    setCurrentSlide((prev) => Math.min(prev, Math.max(0, testimonialsData.length - slidesPerView)));
  }, [slidesPerView, testimonialsData.length]);

  // Carousel navigation functions - slide 1 testimonial at a time
  const nextSlide = () => {
    setCurrentSlide((prev) => Math.min(prev + 1, maxSlideIndex));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  };

  // Get testimonial text
  const getTestimonialText = (testimonial: Testimonial): string => {
    return testimonial.review || "Excellent training experience! Professional instructors and great results.";
  };

  // Get testimonial author
  const getTestimonialAuthor = (testimonial: Testimonial): string => {
    return testimonial.review_name || 'Verified Student';
  };

  // Create testimonial cards - show 4 at a time, slide 1 at a time
  const renderTestimonialCard = (testimonial: Testimonial, index: number) => (
    <div key={testimonial.id || index} className={styles.testimonialCard}>
      <div className={styles.card}>
        {/* Quote Icon */}
        <div className={styles.quoteIcon}>
          <i className="fa-solid fa-quote-right"></i>
        </div>

        {/* 5 Star Rating */}
        <div className={styles.starRating}>
          {[...Array(5)].map((_, starIndex) => (
           <i key={starIndex} className="fa-solid fa-star"></i>
          ))}
        </div>

        {/* Testimonial Text */}
        <p className={styles.testimonialText}>
          "{getTestimonialText(testimonial)}"
        </p>

        {/* Author Name */}
        <p className={styles.authorName}>
          by {getTestimonialAuthor(testimonial)}
        </p>
      </div>
    </div>
  );

  // Show loading or error states
  if (isLoading) {
    return (
      <section className={`${styles.loading} ${className}`}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingHeader}>
            <h2 className={styles.loadingTitle}>
              What Our <span className={styles.studentsText}>Students Say </span>
            </h2>
            <p className={styles.loadingText}>Loading testimonials...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    console.error('Testimonials API Error:', error);
  }

  return (
    <section className={`${styles.section} ${className}`}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            What Our <span className={styles.studentsText}>Students</span> Say
          </h2>
          <p className={styles.subtitle}>
            Don't take our word for it - hear from our successful students
            {/* Debug info */}
            {/* <br />
            <small className={styles.debugInfo}>
              Showing {testimonialsData?.length} testimonials (Position {currentSlide + 1}/{maxSlideIndex + 1})
            </small> */}
          </p>
        </div>

        {/* Testimonials Sliding Carousel */}
        <div className={styles.carouselWrapper}>
          <div
            className={styles.carouselContainer}
            style={{
              transform: `translateX(-${currentSlide * (100 / slidesPerView)}%)`,
            }}
          >
            {testimonialsData.map((testimonial, index) =>
              renderTestimonialCard(testimonial, index)
            )}
          </div>
        </div>

        {/* Navigation Controls - Arrows with Line */}
        <div className={styles.navigation}>
          {/* Left Arrow */}
          <button
            onClick={prevSlide}
            className={styles.arrowButton}
            aria-label="Previous testimonial"
            disabled={currentSlide === 0}
          >
           <i className="fa-solid fa-arrow-left"></i>
          </button>

          {/* Straight Line */}
          <div className={styles.dividerLine}></div>

          {/* Right Arrow */}
          <button
            onClick={nextSlide}
            className={styles.arrowButton}
            aria-label="Next testimonial"
            disabled={currentSlide >= maxSlideIndex}
          >
            <i className="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </div>
    </section>
  );
}