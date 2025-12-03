import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'All Training Locations | 1Stop Instruction',
  description: 'Find motorcycle training centers across London. CBT, DAS, and test training available at multiple convenient locations.',
  keywords: 'motorcycle training locations London, CBT centers, DAS training locations, motorcycle test centers',
};

// Mock data - In production, this would come from the API
const locations = [
  {
    id: 1,
    name: 'East London Training Center',
    slug: 'east-london-training',
    address: '123 Training Road, Stratford, London E15 4AA',
    phone: '020 8123 4567',
    email: 'eastlondon@1stopinstruction.co.uk',
    coordinates: { lat: 51.5388, lng: -0.0039 },
    image: '/images/locations/east-london.jpg',
    courses: ['CBT', 'DAS', 'Module 1', 'Module 2', 'Enhanced Rider'],
    facilities: [
      'Off-road training area',
      'Modern classroom',
      'Bike storage',
      'Refreshment facilities',
      'DVSA test center nearby'
    ],
    openingHours: {
      monday: '8:00 AM - 6:00 PM',
      tuesday: '8:00 AM - 6:00 PM',
      wednesday: '8:00 AM - 6:00 PM',
      thursday: '8:00 AM - 6:00 PM',
      friday: '8:00 AM - 6:00 PM',
      saturday: '8:00 AM - 5:00 PM',
      sunday: '9:00 AM - 4:00 PM'
    },
    description: 'Our flagship East London center offers comprehensive motorcycle training in a modern facility with dedicated off-road areas.'
  },
  {
    id: 2,
    name: 'North London Training Center',
    slug: 'north-london-training',
    address: '456 Rider Street, Tottenham, London N17 8BB',
    phone: '020 8765 4321',
    email: 'northlondon@1stopinstruction.co.uk',
    coordinates: { lat: 51.5897, lng: -0.0707 },
    image: '/images/locations/north-london.jpg',
    courses: ['CBT', 'DAS', 'Module 1', 'Module 2'],
    facilities: [
      'Large training yard',
      'Climate-controlled classroom',
      'Secure parking',
      'Cafe facilities',
      'Public transport links'
    ],
    openingHours: {
      monday: '8:00 AM - 6:00 PM',
      tuesday: '8:00 AM - 6:00 PM',
      wednesday: '8:00 AM - 6:00 PM',
      thursday: '8:00 AM - 6:00 PM',
      friday: '8:00 AM - 6:00 PM',
      saturday: '8:00 AM - 5:00 PM',
      sunday: 'Closed'
    },
    description: 'Conveniently located in North London with excellent transport links and comprehensive training facilities.'
  },
  {
    id: 3,
    name: 'Ilford Training Center',
    slug: 'ilford-training',
    address: '789 Motorcycle Way, Ilford, Essex IG1 2CC',
    phone: '020 8111 2233',
    email: 'ilford@1stopinstruction.co.uk',
    coordinates: { lat: 51.5590, lng: 0.0741 },
    image: '/images/locations/ilford.jpg',
    courses: ['CBT', 'Module 1', 'Module 2', 'Refresher'],
    facilities: [
      'Dedicated CBT area',
      'Modern training bikes',
      'Classroom with AV equipment',
      'Waiting area',
      'Easy parking'
    ],
    openingHours: {
      monday: '9:00 AM - 5:00 PM',
      tuesday: '9:00 AM - 5:00 PM',
      wednesday: '9:00 AM - 5:00 PM',
      thursday: '9:00 AM - 5:00 PM',
      friday: '9:00 AM - 5:00 PM',
      saturday: '9:00 AM - 4:00 PM',
      sunday: 'Closed'
    },
    description: 'Specialized CBT training center with modern facilities and experienced instructors in the Ilford area.'
  },
  {
    id: 4,
    name: 'Newham Training Center',
    slug: 'newham-training',
    address: '321 Learning Lane, Beckton, London E6 3DD',
    phone: '020 8444 5566',
    email: 'newham@1stopinstruction.co.uk',
    coordinates: { lat: 51.5142, lng: 0.0618 },
    image: '/images/locations/newham.jpg',
    courses: ['CBT', 'DAS', 'Enhanced Rider'],
    facilities: [
      'Large practice area',
      'Multi-purpose classroom',
      'Bike maintenance workshop',
      'Student lounge',
      'On-site parking'
    ],
    openingHours: {
      monday: '8:00 AM - 6:00 PM',
      tuesday: '8:00 AM - 6:00 PM',
      wednesday: '8:00 AM - 6:00 PM',
      thursday: '8:00 AM - 6:00 PM',
      friday: '8:00 AM - 6:00 PM',
      saturday: '8:00 AM - 4:00 PM',
      sunday: '10:00 AM - 3:00 PM'
    },
    description: 'State-of-the-art training facility in Newham offering comprehensive motorcycle courses with flexible scheduling.'
  }
];

export default function AllLocations() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Training Locations Across London
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8">
              Professional motorcycle training at convenient locations throughout London and Essex
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/bookings"
                className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors text-center"
              >
                Book Training Now
              </Link>
              <Link
                href="/contactus.php"
                className="px-6 py-3 border border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors text-center"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{locations.length}</div>
            <div className="text-gray-600">Training Centers</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">50+</div>
            <div className="text-gray-600">Qualified Instructors</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">90%+</div>
            <div className="text-gray-600">Pass Rate</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">15k+</div>
            <div className="text-gray-600">Students Trained</div>
          </div>
        </div>

        {/* Filter and Search */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Location
                </label>
                <input
                  type="text"
                  placeholder="Enter postcode or area..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Type
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">All Courses</option>
                  <option value="cbt">CBT Training</option>
                  <option value="das">DAS Course</option>
                  <option value="module1">Module 1</option>
                  <option value="module2">Module 2</option>
                </select>
              </div>
              <div className="flex items-end">
                <button className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors">
                  Find Locations
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Locations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {locations.map((location) => (
            <div key={location.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              {/* Location Image */}
              <div className="h-48 bg-gradient-to-r from-blue-400 to-blue-600 relative">
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute bottom-4 left-4">
                  <h3 className="text-xl font-bold text-white">{location.name}</h3>
                </div>
              </div>

              {/* Location Details */}
              <div className="p-6">
                <p className="text-gray-600 mb-4">{location.description}</p>

                {/* Contact Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Contact</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22S19 14.25 19 9C19 5.13 15.87 2 12 2M12 11.5C10.62 11.5 9.5 10.38 9.5 9S10.62 6.5 12 6.5 14.5 7.62 14.5 9 13.38 11.5 12 11.5Z"/>
                        </svg>
                        {location.address}
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6.62 10.79C8.06 13.62 10.38 15.94 13.21 17.38L15.41 15.18C15.69 14.9 16.08 14.82 16.43 14.93C17.55 15.3 18.75 15.5 20 15.5C20.55 15.5 21 15.95 21 16.5V20C21 20.55 20.55 21 20 21C10.61 21 3 13.39 3 4C3 3.45 3.45 3 4 3H7.5C8.05 3 8.5 3.45 8.5 4C8.5 5.25 8.7 6.45 9.07 7.57C9.18 7.92 9.1 8.31 8.82 8.59L6.62 10.79Z"/>
                        </svg>
                        {location.phone}
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4M20 8L12 13L4 8V6L12 11L20 6V8Z"/>
                        </svg>
                        {location.email}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Opening Hours</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex justify-between">
                        <span>Mon-Fri:</span>
                        <span>{location.openingHours.monday}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Saturday:</span>
                        <span>{location.openingHours.saturday}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sunday:</span>
                        <span>{location.openingHours.sunday}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Courses Available */}
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Available Courses</h4>
                  <div className="flex flex-wrap gap-2">
                    {location.courses.map((course) => (
                      <span
                        key={course}
                        className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                      >
                        {course}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Facilities */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Facilities</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {location.facilities.map((facility, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 12L11 14L15 10M21 12C21 16.97 16.97 21 12 21C7.03 21 3 16.97 3 12C3 7.03 7.03 3 12 3C16.97 3 21 7.03 21 12Z"/>
                        </svg>
                        {facility}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href={`/cbt-training/${location.slug}`}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors text-center"
                  >
                    View Location Details
                  </Link>
                  <Link
                    href={`/bookings/step2?location=${location.id}`}
                    className="flex-1 px-4 py-2 border border-blue-600 text-blue-600 font-medium rounded-md hover:bg-blue-50 transition-colors text-center"
                  >
                    Book Training Here
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Map Section */}
        <div className="mt-12">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Find Us on the Map</h2>
            <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22S19 14.25 19 9C19 5.13 15.87 2 12 2M12 11.5C10.62 11.5 9.5 10.38 9.5 9S10.62 6.5 12 6.5 14.5 7.62 14.5 9 13.38 11.5 12 11.5Z"/>
                </svg>
                <p className="text-lg font-medium">Interactive Map</p>
                <p className="text-sm">Google Maps integration would be here</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 bg-blue-600 rounded-lg text-white p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Training?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Book your course at any of our convenient locations with instant confirmation
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/bookings"
              className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Book Training Now
            </Link>
            <Link
              href="/contactus.php"
              className="px-8 py-3 border border-white text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get More Information
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}