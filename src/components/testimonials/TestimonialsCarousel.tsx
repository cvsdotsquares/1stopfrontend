'use client';

import { useState } from 'react';
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

  // Fetch testimonials data
  const { data: testimonials, isLoading, error } = useQuery({
    queryKey: ['testimonials', limit],
    queryFn: () => cmsApi.getTestimonials({ limit, status: 'active' }),
  });

  // Default testimonials for fallback
  const defaultTestimonials: Testimonial[] = [
    {
      id: 1,
      review: "Having never ridden a bike before, these guys have turned me into a fully fledged biker. Thank you so much!",
      review_name: "J Mitchell",
      status: 1,
      created: "2017-01-17T11:38:02.000Z"
    },
    {
      id: 2,
      review: "The only place to get professional training!",
      review_name: "Tyrone J",
      status: 1,
      created: "2017-04-19T16:02:17.000Z"
    },
    {
      id: 3,
      review: "Did my bike and LGV training here...superb!",
      review_name: "Alison Williams",
      status: 1,
      created: "2017-04-21T11:39:08.000Z"
    },
    {
      id: 4,
      review: "Don't hesitate...let these guys educate.",
      review_name: "6west",
      status: 1,
      created: "2017-04-21T11:42:20.000Z"
    },
    {
      id: 5,
      review: "Excellent instructors and great facilities. Highly recommend!",
      review_name: "Sarah Johnson",
      status: 1,
      created: "2017-04-23T07:41:19.000Z"
    },
    {
      id: 6,
      review: "Professional service from start to finish. Passed first time!",
      review_name: "Mike Davis",
      status: 1,
      created: "2017-04-23T07:42:42.000Z"
    },
    {
      id: 7,
      review: "Best motorcycle training school in London. Worth every penny!",
      review_name: "Emma Thompson",
      status: 1,
      created: "2017-08-25T16:21:34.000Z"
    },
    {
      id: 8,
      review: "The instructors are patient and knowledgeable. Great experience!",
      review_name: "James Wilson",
      status: 1,
      created: "2017-08-25T16:22:20.000Z"
    }
  ];

  // Get testimonials data (API or fallback)
  const testimonialsData = testimonials || defaultTestimonials;

  // For sliding carousel: total possible positions is (total items - visible items + 1)
  const maxSlideIndex = Math.max(0, testimonialsData.length - 4);

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
              transform: `translateX(-${currentSlide * 25}%)`,
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