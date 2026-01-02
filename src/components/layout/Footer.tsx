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
    <footer className="bg-blue-800 text-white">
      <div className="max-w-[1400px] mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-5">1Stop Instruction</h3>
            <p className="text-gray-400 mb-8">
              Leading motorcycle training school in London offering CBT, DAS, and advanced riding courses.
            </p>
            <div className="pb-3 uppercase">Connect with us</div>
            <div className="flex space-x-3">
              <a className="w-[42px] h-[42px] rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600" href="https://www.facebook.com/1stopinstruction" target="_blank" rel="noopener noreferrer">                
                <i className="fa-brands fa-facebook-f"></i>
              </a>
              <a className="w-[42px] h-[42px] rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600" href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                <i className="fa-brands fa-x-twitter"></i>
              </a>
              <a className="w-[42px] h-[42px] rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600" href="https://youtube.com/1stopinstruction" target="_blank" rel="noopener noreferrer">
                <i className="fa-brands fa-linkedin-in"></i>
              </a>
              <a className="w-[42px] h-[42px] rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600" href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                <i className="fa-brands fa-instagram"></i>
              </a>
            </div>
             <div className="pt-8">
                <a href="tel:0800 848 8418" className="text-lg font-bold text-red-500 hover:text-white">
                  <i className="fa-solid fa-square-phone"></i> 0800 848 8418
                </a> 
              </div>
          </div>
          {/* Services */}
          <div>
            <h3 className="text-xl font-semibold mb-5">Our Services</h3>
            <ul className="space-y-3">
              {menuData?.featured_services
                ?.sort((a, b) => a.weight - b.weight)
                ?.slice(0, 6) // Limit to 6 items for layout
                ?.map((service) => (
                  <li key={service.id}>
                    <Link 
                      href={getPageUrl(service.slug)} 
                      className="text-gray-400 hover:text-white"
                    >
                      {service.link_title}
                    </Link>
                  </li>
                )) || (
                  // Fallback static services
                  <>
                    <li className="text-gray-400">Motorcycle CBT Training</li>
                    <li className="text-gray-400">Direct Access Scheme</li>
                    <li className="text-gray-400">A2 Restricted Licence</li>
                    <li className="text-gray-400">Module 1 & 2 Tests</li>
                    <li className="text-gray-400">Advanced Riding Courses</li>
                    <li className="text-gray-400">Refresher Training</li>
                  </>
                )}
            </ul>
          </div>
          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-semibold mb-5">Quick Links</h3>
            <ul className="space-y-3">
              {menuData?.footer_pages
                ?.filter(page => page.parent_level === 0) // Only show main footer pages
                ?.sort((a, b) => a.weight - b.weight)
                ?.slice(0, 6) // Limit to 6 items for layout
                ?.map((page) => (
                  <li key={page.id}>
                    <Link 
                      href={getPageUrl(page.slug)} 
                      className="text-gray-400 hover:text-white"
                    >
                      {page.link_title}
                    </Link>
                  </li>
                )) || (
                  // Fallback static links
                  <>
                    <li><Link href="/courses" className="text-gray-400 hover:text-white">Courses</Link></li>
                    <li><Link href="/locations" className="text-gray-400 hover:text-white">Training Locations</Link></li>
                    <li><Link href="/booking" className="text-gray-400 hover:text-white">Book Online</Link></li>
                    <li><Link href="/testimonials" className="text-gray-400 hover:text-white">Customer Reviews</Link></li>
                    <li><Link href="/faq" className="text-gray-400 hover:text-white">FAQ</Link></li>
                    <li><Link href="/contact" className="text-gray-400 hover:text-white">Contact</Link></li>
                    
                  </>
                )}
                <li><Link href="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</Link></li>
                    <li><Link href="/terms" className="text-gray-400 hover:text-white">Terms of Service</Link></li>
                    <li> <Link href="/cookies" className="text-gray-400 hover:text-white">Cookie Policy</Link></li>
            </ul>
          </div>

          

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-semibold mb-5">Contact Us</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <i className="fa-solid fa-location-dot mr-3  mt-1"></i>
                <div className="text-gray-400">
                  <div>1 Stop Instruction Roadcraft Ltd</div>
                  <div>18 Regent Gardens</div>
                  <div>Ilford, Essex IG3 8UL</div>
                </div>
              </div>
              <div className="flex items-start">
                <i className="fa-solid fa-phone mr-3 mt-1"></i>
                <div className="space-y-2">
                  <div>
                    <a href="tel:+442085977333" className="text-gray-400 hover:text-white">
                      +44 (0)208 597 7333
                    </a> 
                  </div>
                  <div>
                    <a href="tel:+448008488418" className="text-gray-400 hover:text-white">
                      +44 (0)800 848 8418
                    </a>
                  </div>
                </div>

              </div>
             
              <div className="flex items-center">
                <i className="fa-solid fa-envelope mr-3"></i>
                <a href="mailto:info@1stopinstruction.com" className="text-gray-400 hover:text-white">
                  info@1stopinstruction.com
                </a>
              </div>
                <div className="text-white pt-3">Company Registration No: 7907644</div>

            </div>
          </div>
        </div>        
      </div>
      <div className="border-t border-blue-700">
        <div className="max-w-[1400px] mx-auto px-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="">
            <div className="uppercase">Approved Instructors</div> 
            <div className="space-x-4">
                  
                </div>
           </div>
           <div className="">
                <div className="uppercase text-xl">Subscribe to Our Newsletter</div>
                <div className="space-x-4">
                  Input Form
                </div>
           </div>
        </div>
        
        <div className=" mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              Copyright 2025, All Right Reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              <div className="ssl"></div>
              <div className="payment"></div>
            </div>
          </div>
        </div>
        </div>

      </div>





    </footer>
  );
}