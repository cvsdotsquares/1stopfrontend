'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import TestimonialsCarousel from "@/components/testimonials";
import AccreditationsSection from "@/components/accreditations/AccreditationsSection";
import FeaturedServices from '@/components/ui/FeaturedServices';

interface Location {
  id: string;
  locationName: string;
  locationPicture?: string;
  address: string[];
  courses?: Array<Record<string, string>>;
  slug: string;
}

interface Course {
  [key: string]: string;
}

async function fetchLocations(): Promise<[Course[], Location[]] | []> {
  try {
    //Get api base endpoint from env variable
    const apiEndpoint = process.env.NEXT_PUBLIC_API_URL;
    const response = await fetch(`${apiEndpoint}/all-locations`);

    if (!response.ok) {
      throw new Error("Request failed");
    }

    const data = await response.json();
    console.log('API Response:', data);

    if (Array.isArray(data.locationData)) {
      return [data.courseData , data.locationData];
    }
  } catch (error) {
    console.error('Error fetching locations:', error);
    return [];
  }
  return [];
}

export default function AllLocations() {

  const [allLocations, setAllLocations] = useState<Location[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Scroll to locations grid when page changes
  useEffect(() => {
    if (currentPage > 1) {
      const locationsGrid = document.querySelector('.grid.md\\:grid-cols-2.lg\\:grid-cols-3');
      if (locationsGrid) {
        locationsGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [currentPage]);

  useEffect(() => {
    fetchLocations().then(data => {
      const [coursesData, locationsData] = data || [[], []];
      setAllLocations(locationsData || []);
      setCourses(coursesData || []);
      setFilteredLocations(locationsData || []);
    });
  }, []);

  const handleFilter = () => {
    let filtered = allLocations.filter(location => {
      const addressMatch = searchTerm === '' ||
        (Array.isArray(location.address) ?
          location.address.some(line => line.toLowerCase().includes(searchTerm.toLowerCase())) :
          Object.values(location.address || {}).some(line =>
            typeof line === 'string' && line.toLowerCase().includes(searchTerm.toLowerCase())
          )
        ) ||
        location.locationName.toLowerCase().includes(searchTerm.toLowerCase());

      const courseMatch = selectedCourse === '' ||
        (location.courses && location.courses.some(course =>
          Object.keys(course)[0] === selectedCourse
        ));

      return addressMatch && courseMatch;
    });

    setFilteredLocations(filtered);
    setCurrentPage(1);
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredLocations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLocations = filteredLocations.slice(startIndex, startIndex + itemsPerPage);

  const safeLocations = Array.isArray(paginatedLocations) ? paginatedLocations : [];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-white relative h-[400px] md:h-[548px] flex items-center from-blue-600 to-blue-800 text-white">
          <div className="z-0 absolute inset-0 transition-opacity bg-black duration-1000 opacity-50">
            <img src="/all-location/location-banner.png" alt="All Locations Hero" className="w-full h-full object-cover object-center" />
          </div>
          <div className="z-10 w-11/12 sm:max-w-[562px] ml-auto mb-2 bg-white/70 py-6 px-4  md:px-10 md:py-7 text-center radius20-left radius20-left-bottom text-center">
            <div className="text26 text-xl font-semibold text-red-600">
              Our Next Available CBT Course Is TOMORROW
            </div>
            <div className="text-center">
              <Link
                href="/bookings"
                className="mt-3 radius20-left radius20-right-bottom inline-block bg-red-600 px-10 py-3 text-base md:text-2xl text-white hover:bg-red-700"
              >
                Book Now!
              </Link>
            </div>
          </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 py-12">
        <h1>Our Locations</h1>
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-12">
          <div className="bg-white rounded-lg border border-gray-200 px-3 py-5 sm:p-6 text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">{filteredLocations.length}</div>
            <div className="border-2 border-red-200 border-w mx-auto w-[60px]"></div>
            <div className="text-lg text-gray-500 mt-4">Training Centers</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 px-3 py-5 sm:p-6 text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">50<span className="text-red-600">+</span></div>
            <div className="border-2 border-red-200 border-w mx-auto w-[60px]"></div>
            <div className="text-lg text-gray-500 mt-4">Qualified Instructors</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 px-3 py-5 sm:p-6 text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">90<span className="text-red-600">% +</span></div>
            <div className="border-2 border-red-200 border-w mx-auto w-[105px]"></div>
            <div className="text-lg text-gray-500 mt-4">Pass Rate</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 px-3 py-5 sm:p-6 text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">15<span className="text-red-600">k +</span></div>
            <div className="border-2 border-red-200 border-w mx-auto w-[96px]"></div>
            <div className="text-lg text-gray-500 mt-4">Students Trained</div>
          </div>
        </div>

        {/* Filter and Search */}
        <div className="mb-14">
          <div className="bg-blue-50 rounded-lg px-5 py-7 md:p-8">
            <div className="flex flex-wrap md:flex-nowrap gap-4">
              <div className="grow-1 flex flex-wrap md:flex-nowrap  gap-4">
                <div className="w-full md:w-3/6">
                  <label className="block text-base mb-2">
                    Search Location
                  </label>
                  <input
                    type="text"
                    placeholder="Enter postcode or area..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 text-gray-700 placeholder-gray-500 focus:outline-none bg-white border border-gray-300"
                  />
                </div>
                <div className="w-full md:w-3/6">
                  <label className="block text-base mb-2">
                    Course Type
                  </label>
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="w-full px-4 py-3 text-gray-700 placeholder-gray-500 focus:outline-none bg-white border border-gray-300"
                  >
                    <option value="">All Courses</option>
                    {courses && courses.map((course: any, index: number) => {
                      const courseId = Object.keys(course)[0];
                      const courseName = course[courseId];
                      return (
                        <option key={courseId} value={courseId}>
                          {courseName}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
              <div className="flex items-end w-full md:w-auto">
                <button
                  onClick={handleFilter}
                  className="bg-red-600 px-3 py-1 text-lg text-white hover:bg-red-500 text-center cursor-pointer w-full md:w-auto md:min-w-[240px] h-[50px]"
                >
                  Find Locations
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Locations Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {safeLocations.map((location, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-300 overflow-hidden hover:shadow-md transition-shadow">
              {/* Location Image */}
              <div className="h-48 relative bg-gray-300">
                { !location.locationPicture ? (
                  <img src="/all-location/location-banner.png" alt="Default Location" className="w-full h-full object-cover" />
                ) : (
                  <img src={ `${process.env.NEXT_PUBLIC_FILES_URL || ''}${location.locationPicture}`} alt={location.locationName} className="w-full h-full object-cover" />
                )}
              </div>

              {/* Location Details */}

              <div className="p-6 pb-8">
                <h3 className="text-lg font-bold text-blue-600 uppercase pb-3"><i className="fa-solid fa-location-dot mr-1"></i> {location.locationName}</h3>
                <p className="text-sm mb-4">
                  {location.address.map((line, idx) => (
                    <span key={idx}>
                      {line}<br />
                    </span>
                  ))}
                </p>

                {/* Courses Offer */}
                {location.courses && location.courses.length > 0 && (
                  <div className="pb-7 grow-1">
                    <h4 className="text-lg font-bold text-blue-600 pb-3"><i className="fa-solid fa-person-biking mr-2"></i> Courses Offered</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {location.courses.map((course, index) => {
                        const courseId = Object.keys(course)[0];
                        const courseName = course[courseId];
                        return (
                          <div key={courseId} className="flex items-center text-sm" data-course-id={courseId}>
                            <i className="fa-solid fa-circle-check mr-2"></i>
                            {courseName}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 lg:gap-5 xl:gap-8">
                  <Link
                    href={`/cbt-training/${location.slug}`}
                    className="flex-1 rounded-md bg-blue-600 px-6 py-3 text-base text-center text-white hover:bg-blue-700 text-center"
                  >
                    View Location
                  </Link>
                  <Link
                    href={`/bookings/step2?location=${location.id}`}
                    className="flex-1 rounded-md bg-red-600 px-6 py-3 text-base  text-center text-white hover:bg-red-500 text-center"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mb-8 mt-12">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-300"
            >
              Previous
            </button>
            <span className="px-4 py-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-300"
            >
              Next
            </button>
          </div>
        )}
         {/* Featured Services  */}
         <FeaturedServices />

        {/* Testimonials */}
      </div>
        <TestimonialsCarousel />
        <AccreditationsSection/>
      </div>
  );
}