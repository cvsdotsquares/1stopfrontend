'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface FeaturedService {
  id: number;
  service_title: string;
  service_file: string;
  service_link: string;
  service_icon?: string;
}

interface FeaturedServicesProps {
  data?: FeaturedService[];
}

export default function FeaturedServices({ data }: FeaturedServicesProps) {
  const [services, setServices] = useState<FeaturedService[]>([]);

  useEffect(() => {
    if (!data) {
      const apiEndpoint = process.env.NEXT_PUBLIC_API_URL;
      if (!apiEndpoint) return;

      fetch(`${apiEndpoint}/get-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tables: ['featured_services'] })
      })
      .then(res => res.json())
      .then(response => {
        if (response.success && response.data.featured_services) {
          setServices(response.data.featured_services);
        }
      })
      .catch(error => console.warn('Failed to load featured services:', error));
    } else {
      setServices(data);
    }
  }, [data]);

  if (!services.length) return null;

  return (
    <div className="mt-12">
      <div className="py-6">
        <div className="text-center pb-6 m-auto md:w-9/12">
          <h2 className="mb-2">Featured <span className="text-blue-600">Services</span></h2>
          <p>Professional training services offered for all types of licence requirements, including advanced training, and assessments for compliance and auditing purposes</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {services.map((service) => (
            <div key={service.id} className="bg-white rounded-lg p-4 border border-gray-300 text-center">
              <div className="h-[66px] mt-4">
                <Image
                  src={`${process.env.NEXT_PUBLIC_FILES_URL || ''}/uploads/featured_services/${service.service_file}`}
                  alt={service.service_title}
                  width={120}
                  height={80}
                  className="max-h-20 w-auto object-contain"
                />
              </div>
              <h5 className="text-base font-bold mb-5">{service.service_title}</h5>
              <Link
                href={service.service_link}
                className="px-3 py-1 w-full inline-block bg-white text-sm text-red-500 rounded-4xl hover:bg-red-500 hover:text-white transition-colors border border-red-500"
              >
                More <i className="fa-solid fa-arrow-right"></i>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}