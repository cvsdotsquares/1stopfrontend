'use client';

import { useQuery } from '@tanstack/react-query';
import { cmsApi } from '@/services/api';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import DynamicBanner from '@/components/cms/DynamicBanner';
import TestimonialsCarousel from '@/components/testimonials';

export default function Home() {
  // Fetch homepage content from backend using slug "home"
  const { data: pageData, isLoading, error } = useQuery({
    queryKey: ['page', 'home'],
    queryFn: () => cmsApi.getPage('home'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Extract page data
  const pageContent = pageData?.data;

  // Update document title and meta when page data loads
  useEffect(() => {
    if (pageContent?.meta_title) {
      document.title = pageContent.meta_title;
    } else if (pageContent?.page_title) {
      document.title = pageContent.page_title;
    }
    
    if (pageContent?.meta_desc) {
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', pageContent.meta_desc);
      } else {
        const meta = document.createElement('meta');
        meta.name = 'description';
        meta.content = pageContent.meta_desc;
        document.head.appendChild(meta);
      }
    }
  }, [pageContent]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading homepage...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load homepage content</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // If no page content found, show message
  if (!pageContent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Homepage content not found</p>
          <p className="text-sm text-gray-500 mb-4">Please create a page with slug "home" in the CMS</p>
          <Button asChild>
            <Link href="/all-locations">Browse Locations</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Dynamic Banner Section - Based on banner_type */}
      <DynamicBanner
        bannerType={pageContent.banner_type}
        pageTitle={pageContent.page_title}
        staticImage={pageContent.carousel_static_image}
        staticCaption={pageContent.carousel_static_caption}
        overlayCaption={pageContent.overlay_caption}
        overlayText={pageContent.overlay_caption_text}
      />

      {/* Main Content Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          {/* Page Title (if no hero image) */}
          {!pageContent.carousel_static_image && (
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">{pageContent.page_title}</h1>
            </div>
          )}
          
          {/* Dynamic Page Content */}
          <div 
            className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 hover:prose-a:text-blue-800"
            dangerouslySetInnerHTML={{ __html: pageContent.page_content }}
          />
        </div>
      </section>

      {/* Additional sections based on page settings */}
      
      {/* Testimonials section if enabled */}
      {pageContent.testimonial_display === 1 && (
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">What Our Students Say</h2>
            <TestimonialsCarousel limit={10} />
            <div className="text-center mt-8">
              <Button asChild>
                <Link href="/testimonials">View All Testimonials</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Featured Services section if this is marked as featured */}
      {pageContent.featured_display === 1 && (
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-8">Our Services</h2>
            <Button asChild>
              <Link href="/all-locations">Find Training Locations</Link>
            </Button>
          </div>
        </section>
      )}

      {/* Call to Action Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">Book your motorcycle training today</p>
          <div className="space-x-4">
            <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              <Link href="/bookings">Book Now</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              <Link href="/all-locations">Find Locations</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Internal CSS if present */}
      {pageContent.internal_css && (
        <style dangerouslySetInnerHTML={{ __html: pageContent.internal_css }} />
      )}
    </div>
  );
}