// components/layout/Footer.tsx
'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { cmsApi } from '@/services/api';
import NewsLetter from '@/components/ui/newsLetter';

export default function Footer() {
  // Fetch footer data
  const { data: footerData } = useQuery({
    queryKey: ['footer'],
    queryFn: () => cmsApi.getFooterData(),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
  return (
    <footer className="bg-blue-800 text-white">
      <div className="max-w-[1400px] mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-8">
          {/* Company Info (LHS) */}
          <div>
            {footerData?.success && footerData.data.lhs_block ? (
              <div dangerouslySetInnerHTML={{ __html: footerData.data.lhs_block }} />
            ) : (
              // Fallback content
              <>
                <h3 className="text-xl font-bold mb-5">1Stop Instruction</h3>
                <p className="text-gray-400 mb-8">
                  Leading motorcycle training school in London offering CBT, DAS, and advanced riding courses.
                </p>
                <div className="pt-8">
                  <a href="tel:0800 848 8418" className="text-lg font-bold text-red-500 hover:text-white">
                    0800 848 8418
                  </a>
                </div>
              </>
            )}
          </div>
          {/* Dynamic Menu Columns */}
          {footerData?.success && footerData.data.menu?.map((menuGroup: any, index: number) => (
            <div key={index}>
              <h3 className="text-xl font-semibold mb-5">{menuGroup.name}</h3>
              <ul className="space-y-3">
                {menuGroup.items
                  ?.sort((a: any, b: any) => a.weight - b.weight)
                  ?.map((item: any, itemIndex: number) => (
                    <li key={itemIndex}>
                      <Link
                        href={item.footer_link_url.startsWith('/') ? item.footer_link_url : `/${item.footer_link_url}`}
                        className="text-gray-400 hover:text-white"
                      >
                        {item.footer_link_title}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          ))}

          {/* Fallback menu columns */}
          {!footerData?.success && (
            <>
              <div>
                <h3 className="text-xl font-semibold mb-5">Our Services</h3>
                <ul className="space-y-3">
                  <li><Link href="/motorcycle-training" className="text-gray-400 hover:text-white">Motorcycle Training</Link></li>
                  <li><Link href="/driving-lessons" className="text-gray-400 hover:text-white">Driving Lessons</Link></li>
                  <li><Link href="/lgv-training" className="text-gray-400 hover:text-white">LGV Training</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-5">Quick Links</h3>
                <ul className="space-y-3">
                  <li><Link href="/testimonials" className="text-gray-400 hover:text-white">Testimonials</Link></li>
                  <li><Link href="/contact" className="text-gray-400 hover:text-white">Contact Us</Link></li>
                  <li><Link href="/terms" className="text-gray-400 hover:text-white">Terms & Conditions</Link></li>
                </ul>
              </div>
            </>
          )}

          {/* Contact Info (RHS) */}
          <div>
            {footerData?.success && footerData.data.rhs_block ? (
              <div dangerouslySetInnerHTML={{ __html: footerData.data.rhs_block }} />
            ) : (
              // Fallback contact info
              <>
                <h3 className="text-xl font-semibold mb-5">Contact Us</h3>
                <div className="space-y-4">
                  <div className="text-gray-400">
                    <div>1 Stop Instruction Roadcraft Ltd</div>
                    <div>18 Regent Gardens, Ilford, Essex IG3 8UL</div>
                  </div>
                  <div>
                    <a href="tel:+442085977333" className="text-gray-400 hover:text-white">
                      +44 (0)208 597 7333
                    </a>
                  </div>
                  <div>
                    <a href="mailto:info@1stopinstruction.com" className="text-gray-400 hover:text-white">
                      info@1stopinstruction.com
                    </a>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-blue-700">
        <div className="max-w-[1400px] mx-auto px-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="uppercase pb-2">Approved Instructors</div>
              <div className="flex flex-wrap gap-4">
                <img width="280" height="75" src="/DVSA-approved-motorcycle-training-body-white.png" alt="DVSA Approved" className="inline-block"/>
                <img width="280" height="75" src="/DVSA-ADI-white-no-bg.png" alt="DVSA ADI" className="inline-block"/>
              </div>
            </div>
            <div className="lg:pl-24">
              <div className="uppercase text-xl pb-2">Subscribe to Our Newsletter</div>
              <div className="flex gap-4">
                <NewsLetter />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}