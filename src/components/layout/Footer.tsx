// components/layout/Footer.tsx
'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Phone, Mail, MapPin, Facebook, Twitter, Youtube, Linkedin } from 'lucide-react';
import { cmsApi } from '@/services/api';

// Helper function to convert slug to proper URL
const getPageUrl = (slug: string) => {
  if (slug.includes('.php')) {
    if (slug.includes('contactus')) return '/contact';
    if (slug.includes('testimonials')) return '/testimonials';
    if (slug.includes('booking')) return '/booking';
    if (slug.includes('terms')) return '/terms';
    return `/${slug}`;
  }
  return `/${slug}`;
};

export default function Footer() {
  // Fetch dynamic menu data
  const { data: menuData } = useQuery({
    queryKey: ['menu'],
    queryFn: () => cmsApi.getMenu(),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">1Stop Instruction</h3>
            <p className="text-gray-300 mb-4">
              Leading motorcycle training school in London offering CBT, DAS, and advanced riding courses.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/1stopinstruction" target="_blank" rel="noopener noreferrer">
                <Facebook className="h-5 w-5 hover:text-blue-400" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                <Twitter className="h-5 w-5 hover:text-blue-400" />
              </a>
              <a href="https://youtube.com/1stopinstruction" target="_blank" rel="noopener noreferrer">
                <Youtube className="h-5 w-5 hover:text-red-400" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                <Linkedin className="h-5 w-5 hover:text-blue-400" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {menuData?.footer_pages
                ?.filter(page => page.parent_level === 0) // Only show main footer pages
                ?.sort((a, b) => a.weight - b.weight)
                ?.slice(0, 6) // Limit to 6 items for layout
                ?.map((page) => (
                  <li key={page.id}>
                    <Link 
                      href={getPageUrl(page.slug)} 
                      className="text-gray-300 hover:text-white"
                    >
                      {page.link_title}
                    </Link>
                  </li>
                )) || (
                  // Fallback static links
                  <>
                    <li><Link href="/courses" className="text-gray-300 hover:text-white">Courses</Link></li>
                    <li><Link href="/locations" className="text-gray-300 hover:text-white">Training Locations</Link></li>
                    <li><Link href="/booking" className="text-gray-300 hover:text-white">Book Online</Link></li>
                    <li><Link href="/testimonials" className="text-gray-300 hover:text-white">Customer Reviews</Link></li>
                    <li><Link href="/faq" className="text-gray-300 hover:text-white">FAQ</Link></li>
                    <li><Link href="/contact" className="text-gray-300 hover:text-white">Contact</Link></li>
                  </>
                )}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Our Services</h3>
            <ul className="space-y-2">
              {menuData?.featured_services
                ?.sort((a, b) => a.weight - b.weight)
                ?.slice(0, 6) // Limit to 6 items for layout
                ?.map((service) => (
                  <li key={service.id}>
                    <Link 
                      href={getPageUrl(service.slug)} 
                      className="text-gray-300 hover:text-white"
                    >
                      {service.link_title}
                    </Link>
                  </li>
                )) || (
                  // Fallback static services
                  <>
                    <li className="text-gray-300">Motorcycle CBT Training</li>
                    <li className="text-gray-300">Direct Access Scheme</li>
                    <li className="text-gray-300">A2 Restricted Licence</li>
                    <li className="text-gray-300">Module 1 & 2 Tests</li>
                    <li className="text-gray-300">Advanced Riding Courses</li>
                    <li className="text-gray-300">Refresher Training</li>
                  </>
                )}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <MapPin className="h-5 w-5 mr-3 mt-0.5" />
                <div className="text-gray-300">
                  <div>1 Stop Instruction Roadcraft Ltd</div>
                  <div>18 Regent Gardens</div>
                  <div>Ilford, Essex IG3 8UL</div>
                </div>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 mr-3" />
                <a href="tel:+442085977333" className="text-gray-300 hover:text-white">
                  +44 (0)208 597 7333
                </a>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 mr-3" />
                <a href="tel:+448008488418" className="text-gray-300 hover:text-white">
                  +44 (0)800 848 8418
                </a>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 mr-3" />
                <a href="mailto:info@1stopinstruction.com" className="text-gray-300 hover:text-white">
                  info@1stopinstruction.com
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2025 1Stop Instruction Roadcraft Ltd. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              <Link href="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</Link>
              <Link href="/terms" className="text-gray-400 hover:text-white">Terms of Service</Link>
              <Link href="/cookies" className="text-gray-400 hover:text-white">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}