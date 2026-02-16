'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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

  // Router + postcode state
  const router = useRouter();
  const [postcode, setPostcode] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [nextCBT, setNextCBT] = useState<any>(null);

  // Fetch next CBT availability
  useEffect(() => {
    const fetchNextCBT = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/booking/next-availability-cbt`);
        const data = await response.json();
        if (data.success) {
          setNextCBT(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch next CBT availability:', error);
      }
    };
    fetchNextCBT();
  }, []);

  // Fetch postcode suggestions
  useEffect(() => {
    if (postcode.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/helper/suggest-postal-codes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: postcode }),
        });
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setSuggestions(data.data);
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error('Failed to fetch postcode suggestions:', error);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [postcode]);

  // Format date display
  const getDateDisplay = () => {
    if (!nextCBT?.next_available?.date) return '';

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const nextDate = new Date(nextCBT.next_available.date);

    if (nextDate.toDateString() === tomorrow.toDateString()) {
      return 'TOMORROW';
    }

    return nextCBT.next_available.date;
  };

  // Generate booking URL
  const getBookingURL = () => {
    if (!nextCBT) return '/bookings';

    const params = new URLSearchParams({
      course_id: nextCBT.course_id.toString(),
      location_id: nextCBT.location_id.toString(),
      date: nextCBT.next_available.date,
      course_event_id: nextCBT.next_available.course_event_id.toString()
    });

    return `/bookings?${params.toString()}`;
  };

  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative flex flex-wrap lg:flex-nowrap">
      {/* Background Images */}
      {hasMultipleImages ? (
        <div className="min-h-[300px] md:min-h-[400px] lg:min-h-[700px] relative inset-0 w-full lg:w-2/3">
          <div className="inset-0 bg-black/50" />
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
      <div className="bg-blue-600 py-6 px-2 md:px-9  w-full lg:w-1/3">
      

      {/* Right-side content */}
      <div className="relative z-10 flex h-full items-start justify-center">
        <div className="w-11/12 md:w-full sm:max-w-[562px]">

          {/* CBT floating card */}
          <div className="mb-2 bg-white/70 py-6 px-4  md:px-10 md:py-7 text-center rounded-lg">
            <div className="text26 text-xl font-semibold text-red-600">
              Our Next Available CBT Course Is {getDateDisplay()}
            </div>
            <a
              href={getBookingURL()}
              className="mt-3 radius20-left radius20-right-bottom inline-block bg-red-600 px-10 py-3 text-base md:text-2xl text-white hover:bg-red-700"
            >
              Book Now
            </a>
          </div>

          {/* Purple panel */}
          <div className="pt-6 md:py-10 text-white">

            {/* Search */}
            <div className="mb-6 md:mb-5">
              <p className="mb-3">
                {data.search.title}
              </p>

              <div className="relative max-w-[400px]">
                <input
                  type="text"
                  placeholder={data.search.placeholder}
                  aria-label={data.search.placeholder}
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const term = postcode.trim();
                      router.push(`/all-locations${term ? `?postcode=${encodeURIComponent(term)}` : ''}`);
                      setShowSuggestions(false);
                    }
                    if (e.key === 'Escape') {
                      setShowSuggestions(false);
                    }
                  }}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="w-full  bg-white px-4 py-3 pr-12 text-gray-800  focus:outline-none"
                />

                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-md shadow-lg z-50 max-h-48 overflow-y-auto">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          setPostcode(suggestion);
                          setShowSuggestions(false);
                          router.push(`/all-locations?postcode=${encodeURIComponent(suggestion)}`);
                        }}
                        className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  aria-label="Search locations by postcode"
                  onClick={() => {
                    const term = postcode.trim();
                    router.push(`/all-locations${term ? `?postcode=${encodeURIComponent(term)}` : ''}`);
                    setShowSuggestions(false);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-600 hover:text-indigo-800 hover:scale-105 transform transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search h-5 w-5" aria-hidden="true"><path d="m21 21-4.34-4.34"></path><circle cx="11" cy="11" r="8"></circle></svg>
                </button>
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

            <div className="mt-4 md:mt-10 flex gap-3 md:gap-4 flex-wrap ">
              <a
                href={data.promotion.primaryCta.link}
                className="min-w-[210px] radius20-left radius20-right-bottom bg-red-600 px-6 py-3 text-base md:text-lg text-center text-white hover:bg-red-500"
              >
                {data.promotion.primaryCta.text}
              </a>

              <a
                href="/bookings?course_id=1&location_id=18"
                className="min-w-[210px] radius20-left radius20-right-bottom text-base md:text-lg bg-white px-6 py-3 text-black text-center hover:bg-red-600 hover:text-white"
              >
                Find a CBT Training
              </a>
            </div>
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
