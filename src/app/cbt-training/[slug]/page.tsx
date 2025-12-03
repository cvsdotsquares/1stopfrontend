import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface LocationData {
  id: number;
  name: string;
  slug: string;
  address: string;
  phone: string;
  email: string;
  coordinates: { lat: number; lng: number };
  image: string;
  courses: string[];
  facilities: string[];
  openingHours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  description: string;
  detailedDescription: string;
  instructors: {
    name: string;
    qualifications: string[];
    experience: string;
  }[];
  pricing: {
    course: string;
    price: string;
    duration: string;
    includes: string[];
  }[];
  testimonials: {
    name: string;
    rating: number;
    comment: string;
    course: string;
  }[];
  nearbyTestCenters: {
    name: string;
    distance: string;
    address: string;
  }[];
}

// Mock data - In production, this would come from the API
const locationsData: Record<string, LocationData> = {
  'east-london-training': {
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
    description: 'Our flagship East London center offers comprehensive motorcycle training in a modern facility with dedicated off-road areas.',
    detailedDescription: 'Located in the heart of Stratford, our East London Training Center is our flagship facility, purpose-built for motorcycle training excellence. With over 10 years of operation, we have trained thousands of successful riders in a safe, controlled environment. Our center features extensive off-road training areas, perfect for CBT and Module 1 preparation, alongside modern classroom facilities equipped with the latest teaching technology. The center is strategically located near major transport links and the Olympic Park, making it easily accessible from across East London and Essex.',
    instructors: [
      {
        name: 'Mark Thompson',
        qualifications: ['DVSA Approved Instructor', 'CBT Specialist', '15+ Years Experience'],
        experience: 'Senior instructor with over 15 years in motorcycle training, specializing in nervous riders and CBT courses.'
      },
      {
        name: 'Sarah Williams',
        qualifications: ['DVSA Approved Instructor', 'DAS Expert', 'Module 1 & 2 Specialist'],
        experience: 'Expert in full license training with a 95% first-time pass rate for Module 1 and 2 tests.'
      },
      {
        name: 'James Parker',
        qualifications: ['DVSA Approved Instructor', 'Enhanced Rider Trainer', '10+ Years Experience'],
        experience: 'Specializes in advanced riding techniques and post-test training for experienced riders.'
      }
    ],
    pricing: [
      {
        course: 'CBT Training',
        price: '£120',
        duration: '1 Day (6-8 hours)',
        includes: ['Theory session', 'Practical training', 'On-road riding', 'CBT certificate', 'All safety equipment', 'Refreshments']
      },
      {
        course: 'DAS Course (Complete)',
        price: '£899',
        duration: '5 Days',
        includes: ['Theory test training', 'Module 1 preparation', 'Module 2 preparation', 'Test fees included', 'Bike and equipment', 'Instructor support']
      },
      {
        course: 'Module 1 Training',
        price: '£299',
        duration: '2 Days',
        includes: ['Off-road maneuvers', 'Test preparation', 'Practice sessions', 'Bike and equipment', 'Test booking assistance']
      },
      {
        course: 'Module 2 Training',
        price: '£199',
        duration: '1 Day',
        includes: ['On-road training', 'Test routes', 'Independent riding', 'Final preparation', 'Test day support']
      }
    ],
    testimonials: [
      {
        name: 'Alex Chen',
        rating: 5,
        comment: 'Excellent training center! Mark was patient and professional. Passed my CBT first time and felt confident throughout.',
        course: 'CBT Training'
      },
      {
        name: 'Emma Johnson',
        rating: 5,
        comment: 'Sarah helped me pass both Module 1 and 2 on my first attempts. The facilities are top-notch and the instruction is outstanding.',
        course: 'DAS Course'
      },
      {
        name: 'David Mitchell',
        rating: 5,
        comment: 'Great location, easy to find and well-equipped. The off-road area is perfect for practicing maneuvers.',
        course: 'Module 1'
      }
    ],
    nearbyTestCenters: [
      {
        name: 'Enfield Test Center',
        distance: '8 miles',
        address: 'Great Cambridge Road, Enfield EN1 3RN'
      },
      {
        name: 'Hornchurch Test Center',
        distance: '12 miles',
        address: 'Civic Centre, The Broadway, Hornchurch RM12 4QX'
      }
    ]
  },
  'north-london-training': {
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
    description: 'Conveniently located in North London with excellent transport links and comprehensive training facilities.',
    detailedDescription: 'Our North London Training Center in Tottenham offers exceptional motorcycle training in a modern, purpose-built facility. With excellent public transport connections and ample parking, the center is easily accessible from across North London. The large training yard provides plenty of space for CBT training and Module 1 practice, while our climate-controlled classroom ensures comfortable learning year-round. The center features on-site cafe facilities and secure parking for students arriving by car or motorcycle.',
    instructors: [
      {
        name: 'Michael Roberts',
        qualifications: ['DVSA Approved Instructor', 'CBT Specialist', '12+ Years Experience'],
        experience: 'Experienced instructor specializing in CBT and beginner training with excellent student feedback.'
      },
      {
        name: 'Lisa Davies',
        qualifications: ['DVSA Approved Instructor', 'DAS Expert', 'Module 2 Specialist'],
        experience: 'Expert in full license training with extensive knowledge of North London test routes.'
      }
    ],
    pricing: [
      {
        course: 'CBT Training',
        price: '£120',
        duration: '1 Day (6-8 hours)',
        includes: ['Theory session', 'Practical training', 'On-road riding', 'CBT certificate', 'All safety equipment', 'Refreshments']
      },
      {
        course: 'DAS Course (Complete)',
        price: '£899',
        duration: '5 Days',
        includes: ['Theory test training', 'Module 1 preparation', 'Module 2 preparation', 'Test fees included', 'Bike and equipment', 'Instructor support']
      }
    ],
    testimonials: [
      {
        name: 'Tom Wilson',
        rating: 5,
        comment: 'Michael was an excellent instructor. The facilities are great and the location is perfect for me.',
        course: 'CBT Training'
      }
    ],
    nearbyTestCenters: [
      {
        name: 'Enfield Test Center',
        distance: '6 miles',
        address: 'Great Cambridge Road, Enfield EN1 3RN'
      }
    ]
  }
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return Object.keys(locationsData).map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const location = locationsData[resolvedParams.slug];
  
  if (!location) {
    return {
      title: 'Location Not Found | 1Stop Instruction',
    };
  }

  return {
    title: `${location.name} | CBT & Motorcycle Training | 1Stop Instruction`,
    description: `Professional motorcycle training at ${location.name}. CBT, DAS, Module 1 & 2 training available. Book your course today!`,
    keywords: `${location.name}, motorcycle training ${location.address}, CBT training ${location.slug}`,
  };
}

export default async function LocationPage({ params }: PageProps) {
  const resolvedParams = await params;
  const location = locationsData[resolvedParams.slug];

  if (!location) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <nav className="text-sm text-blue-200 mb-4">
                <Link href="/" className="hover:text-white">Home</Link>
                <span className="mx-2">/</span>
                <Link href="/all-locations" className="hover:text-white">All Locations</Link>
                <span className="mx-2">/</span>
                <span>{location.name}</span>
              </nav>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {location.name}
              </h1>
              <p className="text-xl text-gray-200 mb-6">
                {location.detailedDescription.substring(0, 150)}...
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href={`/bookings/step2?location=${location.id}`}
                  className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors text-center"
                >
                  Book Training Now
                </Link>
                <a
                  href={`tel:${location.phone}`}
                  className="px-6 py-3 border border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors text-center"
                >
                  Call {location.phone}
                </a>
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-video bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg shadow-2xl flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">🏍️</div>
                  <p className="text-lg font-medium">Professional Training Facility</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Quick Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 -mt-8 relative z-10">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-3">
              <svg className="w-8 h-8 text-blue-600 mr-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22S19 14.25 19 9C19 5.13 15.87 2 12 2M12 11.5C10.62 11.5 9.5 10.38 9.5 9S10.62 6.5 12 6.5 14.5 7.62 14.5 9 13.38 11.5 12 11.5Z"/>
              </svg>
              <h3 className="font-bold text-gray-900">Location</h3>
            </div>
            <p className="text-gray-600 text-sm">{location.address}</p>
            <a 
              href={`https://maps.google.com/?q=${encodeURIComponent(location.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 text-sm mt-2 inline-block hover:underline"
            >
              View on Maps →
            </a>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-3">
              <svg className="w-8 h-8 text-green-600 mr-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6.62 10.79C8.06 13.62 10.38 15.94 13.21 17.38L15.41 15.18C15.69 14.9 16.08 14.82 16.43 14.93C17.55 15.3 18.75 15.5 20 15.5C20.55 15.5 21 15.95 21 16.5V20C21 20.55 20.55 21 20 21C10.61 21 3 13.39 3 4C3 3.45 3.45 3 4 3H7.5C8.05 3 8.5 3.45 8.5 4C8.5 5.25 8.7 6.45 9.07 7.57C9.18 7.92 9.1 8.31 8.82 8.59L6.62 10.79Z"/>
              </svg>
              <h3 className="font-bold text-gray-900">Contact</h3>
            </div>
            <p className="text-gray-600 text-sm mb-1">{location.phone}</p>
            <p className="text-gray-600 text-sm">{location.email}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-3">
              <svg className="w-8 h-8 text-purple-600 mr-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
              </svg>
              <h3 className="font-bold text-gray-900">Rating</h3>
            </div>
            <div className="flex items-center">
              <div className="flex text-yellow-400 mr-2">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z"/>
                  </svg>
                ))}
              </div>
              <span className="text-sm text-gray-600">5.0 ({location.testimonials.length} reviews)</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About This Location */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Location</h2>
              <p className="text-gray-600 leading-relaxed">{location.detailedDescription}</p>
            </div>

            {/* Courses & Pricing */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Courses & Pricing</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {location.pricing.map((course, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{course.course}</h3>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{course.price}</div>
                        <div className="text-sm text-gray-500">{course.duration}</div>
                      </div>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-2">Includes:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {course.includes.map((item, idx) => (
                        <li key={idx} className="flex items-center">
                          <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 12L11 14L15 10M21 12C21 16.97 16.97 21 12 21C7.03 21 3 16.97 3 12C3 7.03 7.03 3 12 3C16.97 3 21 7.03 21 12Z"/>
                          </svg>
                          {item}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={`/bookings/step2?location=${location.id}&course=${course.course.toLowerCase().replace(/ /g, '-')}`}
                      className="mt-4 block w-full px-4 py-2 bg-blue-600 text-white text-center font-medium rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Book This Course
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Our Instructors */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Instructors</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {location.instructors.map((instructor, index) => (
                  <div key={index} className="flex space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {instructor.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{instructor.name}</h3>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {instructor.qualifications.map((qual, idx) => (
                          <span key={idx} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {qual}
                          </span>
                        ))}
                      </div>
                      <p className="text-sm text-gray-600">{instructor.experience}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Student Reviews */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Student Reviews</h2>
              <div className="space-y-6">
                {location.testimonials.map((testimonial, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                        <p className="text-sm text-gray-500">{testimonial.course}</p>
                      </div>
                      <div className="flex text-yellow-400">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z"/>
                          </svg>
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 italic">"{testimonial.comment}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Book Widget */}
            <div className="bg-blue-600 text-white rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Quick Booking</h3>
              <p className="mb-4">Book your training at this location</p>
              <Link
                href={`/bookings/step2?location=${location.id}`}
                className="block w-full px-4 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors text-center"
              >
                Start Booking Process
              </Link>
              <div className="mt-4 pt-4 border-t border-blue-500">
                <p className="text-sm text-blue-100 mb-2">Need help choosing?</p>
                <a
                  href={`tel:${location.phone}`}
                  className="block w-full px-4 py-2 border border-white text-white font-medium rounded-lg hover:bg-white hover:text-blue-600 transition-colors text-center"
                >
                  Call {location.phone}
                </a>
              </div>
            </div>

            {/* Opening Hours */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Opening Hours</h3>
              <div className="space-y-2">
                {Object.entries(location.openingHours).map(([day, hours]) => (
                  <div key={day} className="flex justify-between">
                    <span className="capitalize text-gray-600">{day}:</span>
                    <span className="font-medium text-gray-900">{hours}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Facilities */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Facilities</h3>
              <div className="space-y-2">
                {location.facilities.map((facility, index) => (
                  <div key={index} className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 12L11 14L15 10M21 12C21 16.97 16.97 21 12 21C7.03 21 3 16.97 3 12C3 7.03 7.03 3 12 3C16.97 3 21 7.03 21 12Z"/>
                    </svg>
                    <span className="text-gray-700">{facility}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Nearby Test Centers */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Nearby Test Centers</h3>
              <div className="space-y-3">
                {location.nearbyTestCenters.map((center, index) => (
                  <div key={index} className="border-l-4 border-green-500 pl-3">
                    <h4 className="font-medium text-gray-900">{center.name}</h4>
                    <p className="text-sm text-gray-600">{center.address}</p>
                    <p className="text-sm text-green-600 font-medium">{center.distance} away</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Other Locations */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Other Locations</h3>
              <Link
                href="/all-locations"
                className="block w-full px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-center"
              >
                View All Locations
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}