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
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-white relative h-[548px] flex items-center from-blue-600 to-blue-800 text-white"> 
          <div className="z-0 absolute inset-0 transition-opacity bg-black duration-1000 opacity-50"></div>       
          <div className="z-10 sm:max-w-[562px] ml-auto mb-2 bg-white/70 py-6 px-4  md:px-10 md:py-7 text-center radius20-left radius20-left-bottom text-center">
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">{locations.length}</div>
            <div className="border-2 border-red-200 border-w mx-auto w-[60px]"></div>
            <div className="text-lg text-gray-500 mt-4">Training Centers</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">50<span className="text-red-600">+</span></div>
            <div className="border-2 border-red-200 border-w mx-auto w-[60px]"></div>
            <div className="text-lg text-gray-500 mt-4">Qualified Instructors</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">90<span className="text-red-600">% +</span></div>
            <div className="border-2 border-red-200 border-w mx-auto w-[105px]"></div>
            <div className="text-lg text-gray-500 mt-4">Pass Rate</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">15<span className="text-red-600">k +</span></div>
            <div className="border-2 border-red-200 border-w mx-auto w-[96px]"></div>
            <div className="text-lg text-gray-500 mt-4">Students Trained</div>
          </div>
        </div>

        {/* Filter and Search */}
        <div className="mb-14">
          <div className="bg-blue-50 rounded-lg p-8">
            <div className="flex gap-4">
              <div className="grow-1 flex gap-4">
                <div className="w-3/6">
                  <label className="block text-base mb-2">
                    Search Location
                  </label>
                  <input
                    type="text"
                    placeholder="Enter postcode or area..."
                    className="w-full px-4 py-3 text-gray-700 placeholder-gray-500 focus:outline-none bg-white border border-gray-300"
                  />
                </div>
                <div className="w-3/6">
                  <label className="block text-base mb-2">
                    Course Type
                  </label>
                  <select className="w-full px-4 py-3 text-gray-700 placeholder-gray-500 focus:outline-none bg-white border border-gray-300">
                    <option value="">All Courses</option>
                    <option value="cbt">CBT Training</option>
                    <option value="das">DAS Course</option>
                    <option value="module1">Module 1</option>
                    <option value="module2">Module 2</option>
                  </select>
                </div>
              </div>
              <div className="flex items-end">
                <button className="bg-red-600 px-3 py-1 text-lg text-white hover:bg-red-500 text-center cursor-pointer min-w-[240px] h-[50px]">
                  Find Locations
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Locations Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {locations.map((location) => (
            <div key={location.id} className="bg-white rounded-lg border border-gray-300 overflow-hidden hover:shadow-md transition-shadow">
              {/* Location Image */}
              <div className="h-48 relative bg-gray-300">

              </div>

              {/* Location Details */}
              
              <div className="p-6 pb-8">
                <h3 className="text-lg font-bold text-blue-600 uppercase pb-3"><i className="fa-solid fa-location-dot mr-1"></i> {location.name}</h3>
                <p className="text-sm mb-4">{location.description}</p>

                {/* Courses Offer */}
                <div className="pb-7 grow-1">
                  <h4 className="text-lg font-bold text-blue-600 pb-3"><i className="fa-solid fa-person-biking mr-2"></i> Courses Offered</h4>                   
                  <div className="grid grid-cols-1 gap-2">
                    {location.facilities.map((facility, index) => (
                      <div key={index} className="flex items-center text-sm">
                        <i className="fa-solid fa-circle-check mr-2"></i>
                        {facility}
                      </div>
                    ))}
                  </div>                  
                </div>
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
         {/* Featured Services  */}
        <div className="mt-12">
          <div className="p-6">
            <div className="text-center pb-6 m-auto w-9/12">
              <h2 className="mb-2">Featured <span className="text-blue-600">Services</span> </h2>
              <p>Professional training services offered for all types of licence requirements, including advanced training, and assessments for compliance and auditing purposes</p>
            </div>
            <div className="grid grid-cols-6 gap-2">
              <div className="bg-white rounded-lg p-4 border border-gray-300 text-center">
                <i className="fa-solid person-biking text-3x-1"></i>
                <h5 className="text-base font-bold mb-4">Motorcycle Training</h5>
                <Link
                  href="/bookings"
                  className="px-3 py-1 w-full inline-block bg-white text-sm text-red-500 rounded-4xl hover:bg-red-500 hover:text-white transition-colors border border-red-500"
                >
                  More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}