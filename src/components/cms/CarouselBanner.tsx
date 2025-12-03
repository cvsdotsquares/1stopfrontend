'use client';

import { useQuery } from '@tanstack/react-query';
import { cmsApi } from '@/services/api';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface CarouselItem {
  id: number;
  carousel_banner: string;
  caption: string;
  weight: number;
  created: string;
}

interface CarouselProps {
  autoPlay?: boolean;
  interval?: number;
  showControls?: boolean;
  showIndicators?: boolean;
  className?: string;
}

export default function CarouselBanner({
  autoPlay = true,
  interval = 5000,
  showControls = true,
  showIndicators = true,
  className = ''
}: CarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Fetch carousel data
  const { data: carouselData, isLoading, error } = useQuery({
    queryKey: ['carousels'],
    queryFn: () => cmsApi.getCarousels(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const carousels: CarouselItem[] = carouselData?.data || [];

  // Auto-play functionality
  useEffect(() => {
    if (autoPlay && carousels.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % carousels.length);
      }, interval);

      return () => clearInterval(timer);
    }
  }, [autoPlay, interval, carousels.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + carousels.length) % carousels.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % carousels.length);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="relative h-[400px] bg-gray-200 animate-pulse flex items-center justify-center">
        <div className="text-gray-400">Loading banner...</div>
      </div>
    );
  }

  // Error or no data
  if (error || !carousels || carousels.length === 0) {
    return null; // Don't show anything if no carousel data
  }

  // Single item - no need for controls
  if (carousels.length === 1) {
    const item = carousels[0];
    return (
      <div className={`relative overflow-hidden ${className}`}>
        {/* Image Section */}
        <div className="relative h-[400px]">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url('https://1stopinstruction.com/uploads/${item.carousel_banner}')` }}
          >
            <div className="absolute inset-0 bg-black/40"></div>
          </div>

          {/* Caption Overlay - Desktop: Bottom Right, Mobile: Hidden */}
          {item.caption && (
            <div
              className="absolute bottom-4 right-4 w-[30%] p-4 rounded-lg hidden md:block"
              style={{ backgroundColor: 'rgba(56, 48, 146, 0.8)' }}
            >
              <div
                className="text-white text-sm lg:text-base font-bold leading-tight mb-4"
                dangerouslySetInnerHTML={{ __html: item.caption }}
              />
              {/* Action Buttons */}
              <div className="flex space-x-2">
                <Button asChild className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs lg:text-sm py-2 rounded-tl-2xl rounded-tr-none rounded-bl-none rounded-br-2xl">
                  <Link href="/bookings">Book Online Now</Link>
                </Button>
                <Button asChild variant="outline" className="flex-1 bg-white hover:bg-gray-100 text-black border-white text-xs lg:text-sm py-2 rounded-tl-2xl rounded-tr-none rounded-bl-none rounded-br-2xl">
                  <Link href="/all-locations">Find a CBT Training</Link>
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Caption Section Below Image - Mobile Only */}
        {item.caption && (
          <div
            className="py-6 md:hidden"
            style={{ backgroundColor: 'rgba(56, 48, 146, 0.8)' }}
          >
            <div className="container mx-auto px-4 text-center">
              <div
                className="text-2xl font-bold text-white mb-6"
                dangerouslySetInnerHTML={{ __html: item.caption }}
              />
              {/* Action Buttons */}
              <div className="flex space-x-4">
                <Button asChild className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-tl-2xl rounded-br-2xl">
                  <Link href="/bookings">Book Online Now</Link>
                </Button>
                <Button asChild variant="outline" className="flex-1 bg-white hover:bg-gray-100 text-black border-white py-3 rounded-tl-2xl rounded-br-2xl">
                  <Link href="/all-locations">Find a CBT Training</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden group ${className}`}>
      {/* Carousel Images */}
      <div className="relative h-[400px] overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out h-full"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {carousels.map((item, index) => (
            <div
              key={item.id}
              className="min-w-full relative"
            >
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url('https://1stopinstruction.com/uploads/${item.carousel_banner}')` }}
              >
                <div className="absolute inset-0 bg-black/40"></div>
              </div>

              {/* Caption Overlay - Desktop: Bottom Right, Mobile: Hidden */}
              {item.caption && index === currentSlide && (
                <div
                  className="absolute bottom-4 right-4 w-[30%] p-4 rounded-lg hidden md:block"
                  style={{ backgroundColor: 'rgba(56, 48, 146, 0.8)' }}
                >
                  <div
                    className="text-white text-sm lg:text-base font-bold leading-tight animate-fade-in mb-4"
                    dangerouslySetInnerHTML={{ __html: item.caption }}
                  />
                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <Button asChild className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs lg:text-sm py-2 rounded-tl-2xl rounded-tr-none rounded-bl-none rounded-br-2xl">
                      <Link href="/bookings">Book Online Now</Link>
                    </Button>
                    <Button asChild variant="outline" className="flex-1 bg-white hover:bg-gray-100 text-black border-white text-xs lg:text-sm py-2 rounded-tl-2xl rounded-tr-none rounded-bl-none rounded-br-2xl">
                      <Link href="/all-locations">Find a CBT Training</Link>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Navigation Controls */}
        {showControls && carousels.length > 1 && (
          <>
            <Button
              variant="outline"
              size="sm"
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 border-white/30 text-white hover:bg-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              onClick={goToPrevious}
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 border-white/30 text-white hover:bg-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              onClick={goToNext}
              aria-label="Next slide"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Indicators */}
        {showIndicators && carousels.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {carousels.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? 'bg-white scale-110'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Slide Counter */}
        <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
          {currentSlide + 1} / {carousels.length}
        </div>
      </div>

      {/* Caption Section Below Images - Mobile Only */}
      {carousels.length > 0 && carousels[currentSlide]?.caption && (
        <div
          className="py-6 md:hidden"
          style={{ backgroundColor: 'rgba(56, 48, 146, 0.8)' }}
        >
          <div className="container mx-auto px-4 text-center">
            <div
              className="text-2xl font-bold text-white animate-fade-in mb-6"
              dangerouslySetInnerHTML={{ __html: carousels[currentSlide].caption }}
            />
            {/* Action Buttons */}
            <div className="flex space-x-4">
              <Button asChild className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-tl-2xl rounded-tr-none rounded-bl-none rounded-br-2xl">
                <Link href="/bookings">Book Online Now</Link>
              </Button>
              <Button asChild variant="outline" className="flex-1 bg-white hover:bg-gray-100 text-black border-white py-3 rounded-tl-2xl rounded-tr-none rounded-bl-none rounded-br-2xl">
                <Link href="/all-locations">Find a CBT Training</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}