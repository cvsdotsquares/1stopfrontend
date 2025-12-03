import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Book Training Course | 1Stop Instruction',
  description: 'Book your motorcycle training course. CBT, DAS, Module 1 & 2 tests available with instant confirmation.',
};

export default function BookingsIndex() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Book Your Training Course
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose from our comprehensive range of motorcycle training courses. 
            All courses are delivered by fully qualified instructors with instant online booking.
          </p>
        </div>

        {/* Course Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {/* CBT Training */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-48 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <div className="text-center text-white">
                <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
                </svg>
                <h3 className="text-2xl font-bold">CBT Training</h3>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Compulsory Basic Training - Your first step to riding. Required for all new riders.
              </p>
              <ul className="text-sm text-gray-600 mb-6 space-y-1">
                <li>• Valid for 2 years</li>
                <li>• No test required</li>
                <li>• Ride up to 125cc</li>
                <li>• L-plates required</li>
              </ul>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-blue-600">From £120</span>
                <Link
                  href="/bookings/step2?course=cbt"
                  className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Book Now
                </Link>
              </div>
            </div>
          </div>

          {/* DAS Course */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-48 bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
              <div className="text-center text-white">
                <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 16V8C21 6.89 20.11 6 19 6H17.5L15.5 4H8.5L6.5 6H5C3.89 6 3 6.89 3 8V16C3 17.11 3.89 18 5 18H19C20.11 18 21 17.11 21 16M19 16H5V8H19V16M12 9C10.34 9 9 10.34 9 12S10.34 15 12 15 15 13.66 15 12 13.66 9 12 9Z"/>
                </svg>
                <h3 className="text-2xl font-bold">DAS Course</h3>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Direct Access Scheme - Full motorcycle license for any size bike.
              </p>
              <ul className="text-sm text-gray-600 mb-6 space-y-1">
                <li>• Age 24+ or 21+ with A2</li>
                <li>• Unlimited cc</li>
                <li>• No L-plates</li>
                <li>• Theory + practical tests</li>
              </ul>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-green-600">From £650</span>
                <Link
                  href="/bookings/step2?course=das"
                  className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  Book Now
                </Link>
              </div>
            </div>
          </div>

          {/* Module Tests */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-48 bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
              <div className="text-center text-white">
                <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12L11 14L15 10M21 12C21 16.97 16.97 21 12 21C7.03 21 3 16.97 3 12C3 7.03 7.03 3 12 3C16.97 3 21 7.03 21 12Z"/>
                </svg>
                <h3 className="text-2xl font-bold">Module Tests</h3>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Module 1 & 2 practical tests for full motorcycle license.
              </p>
              <ul className="text-sm text-gray-600 mb-6 space-y-1">
                <li>• Module 1: Off-road skills</li>
                <li>• Module 2: On-road riding</li>
                <li>• DVSA approved</li>
                <li>• Professional instruction</li>
              </ul>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-purple-600">From £200</span>
                <Link
                  href="/bookings/step2?course=module"
                  className="px-6 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Book Now
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Services */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Additional Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link
              href="/bookings/step2?course=enhanced"
              className="text-center p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors group"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-200">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L15.09 8.26L22 9L15.09 9.74L12 16L8.91 9.74L2 9L8.91 8.26L12 2Z"/>
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">Enhanced Rider</h3>
              <p className="text-sm text-gray-600 mt-1">Advanced skills training</p>
            </Link>

            <Link
              href="/bookings/step2?course=refresher"
              className="text-center p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors group"
            >
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-green-200">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 4V1L8 5L12 9V6C15.31 6 18 8.69 18 12C18 15.31 15.31 18 12 18C8.69 18 6 15.31 6 12H4C4 16.42 7.58 20 12 20C16.42 20 20 16.42 20 12C20 7.58 16.42 4 12 4Z"/>
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">Refresher Course</h3>
              <p className="text-sm text-gray-600 mt-1">Brush up your skills</p>
            </Link>

            <Link
              href="/bookings/create_voucher"
              className="text-center p-4 border border-gray-200 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition-colors group"
            >
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-yellow-200">
                <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1L13.5 2.5L16.17 5.17L10.59 10.75C10.21 11.13 10.21 11.75 10.59 12.13L11.46 13L7.41 17.05C7.05 17.41 7.05 18.06 7.41 18.42L8.58 19.58C8.94 19.94 9.59 19.94 9.95 19.58L14 15.54L14.87 16.41C15.25 16.79 15.87 16.79 16.25 16.41L21.83 10.83L19.08 8.08L21 9Z"/>
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">Gift Voucher</h3>
              <p className="text-sm text-gray-600 mt-1">Perfect gift idea</p>
            </Link>

            <Link
              href="/all-locations"
              className="text-center p-4 border border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition-colors group"
            >
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-red-200">
                <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22S19 14.25 19 9C19 5.13 15.87 2 12 2M12 11.5C10.62 11.5 9.5 10.38 9.5 9S10.62 6.5 12 6.5 14.5 7.62 14.5 9 13.38 11.5 12 11.5Z"/>
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">All Locations</h3>
              <p className="text-sm text-gray-600 mt-1">Find training centers</p>
            </Link>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="bg-blue-50 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Why Choose 1Stop Instruction?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12L11 14L15 10M21 12C21 16.97 16.97 21 12 21C7.03 21 3 16.97 3 12C3 7.03 7.03 3 12 3C16.97 3 21 7.03 21 12Z"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">DVSA Approved</h3>
              <p className="text-gray-600">All our instructors are fully qualified and DVSA approved</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2M12 20C7.59 20 4 16.41 4 12S7.59 4 12 4 20 7.59 20 12 16.41 20 12 20M15.5 11C15.78 11 16 11.22 16 11.5S15.78 12 15.5 12 15 11.78 15 11.5 15.22 11 15.5 11M9.5 11C9.78 11 10 11.22 10 11.5S9.78 12 9.5 12 9 11.78 9 11.5 9.22 11 9.5 11M12 17.5C14.33 15.67 14.33 12.33 12 10.5C9.67 12.33 9.67 15.67 12 17.5Z"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">High Pass Rates</h3>
              <p className="text-gray-600">Over 90% pass rate with our comprehensive training programs</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Instant Booking</h3>
              <p className="text-gray-600">Book online with instant confirmation and flexible dates</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}