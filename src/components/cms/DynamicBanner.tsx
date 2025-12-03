'use client';

import CarouselBanner from './CarouselBanner';
import StaticBanner from './StaticBanner';

interface DynamicBannerProps {
  bannerType: number;
  pageTitle: string;
  staticImage?: string;
  staticCaption?: string;
  overlayCaption?: number;
  overlayText?: string;
  className?: string;
}

export default function DynamicBanner({
  bannerType,
  pageTitle,
  staticImage,
  staticCaption,
  overlayCaption,
  overlayText,
  className = ''
}: DynamicBannerProps) {
  // Banner Type 0 = No Banner
  if (bannerType === 0) {
    return null;
  }

  // Banner Type 1 = Static Banner
  if (bannerType === 1) {
    // Construct full URL for static image
    const fullImageUrl = staticImage 
      ? `https://1stopinstruction.com/uploads/${staticImage}`
      : undefined;
      
    return (
      <StaticBanner
        backgroundImage={fullImageUrl}
        title={pageTitle}
        caption={staticCaption}
        overlayText={overlayText}
        showOverlay={overlayCaption === 1}
        className={className}
      />
    );
  }

  // Banner Type 2 = Carousel
  if (bannerType === 2) {
    return (
      <CarouselBanner
        autoPlay={true}
        interval={5000}
        showControls={true}
        showIndicators={true}
        className={className}
      />
    );
  }

  // Default to no banner for unknown types
  return null;
}