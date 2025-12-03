import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'All Bookings | 1Stop Instruction',
  description: 'View and manage all your training bookings and course history.',
};

export default async function AllBookings({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  const bookingId = slug?.[0];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
            <p className="mt-2 text-gray-600">
              View and manage your training course bookings
            </p>
          </div>
          <Link
            href="/bookings"
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            New Booking
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Bookings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">All Bookings</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Range
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button className="w-full px-4 py-2 bg-gray-600 text-white font-medium rounded-md hover:bg-gray-700 transition-colors">
                  Apply Filters
                </button>
              </div>
            </div>
          </div>

          {/* Bookings List */}
          <div className="lg:col-span-3">
            <div className="space-y-4">
              {/* Booking Item */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        CBT Training Course
                      </h3>
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        Confirmed
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Date & Time</p>
                        <p className="text-sm text-gray-900">December 15, 2024</p>
                        <p className="text-sm text-gray-900">9:00 AM - 5:00 PM</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Location</p>
                        <p className="text-sm text-gray-900">East London Training Center</p>
                        <p className="text-sm text-gray-900">123 Training Road, E1 4AA</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Booking ID</p>
                        <p className="text-sm text-gray-900">#BK001234</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-500">
                    Booked on: November 20, 2024
                  </div>
                  <div className="flex space-x-3">
                    <Link
                      href="/users/view_booking_details/BK001234"
                      className="text-sm font-medium text-blue-600 hover:text-blue-500"
                    >
                      View Details
                    </Link>
                    <Link
                      href="/users/edit_student_details/BK001234"
                      className="text-sm font-medium text-gray-600 hover:text-gray-500"
                    >
                      Edit Details
                    </Link>
                  </div>
                </div>
              </div>

              {/* Another Booking Item */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Module 1 Test
                      </h3>
                      <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                        Pending
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Date & Time</p>
                        <p className="text-sm text-gray-900">January 10, 2025</p>
                        <p className="text-sm text-gray-900">2:00 PM - 3:00 PM</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Location</p>
                        <p className="text-sm text-gray-900">North London Test Center</p>
                        <p className="text-sm text-gray-900">456 Test Avenue, N1 2BB</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Booking ID</p>
                        <p className="text-sm text-gray-900">#BK001235</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-500">
                    Booked on: November 25, 2024
                  </div>
                  <div className="flex space-x-3">
                    <Link
                      href="/users/view_booking_details/BK001235"
                      className="text-sm font-medium text-blue-600 hover:text-blue-500"
                    >
                      View Details
                    </Link>
                    <button className="text-sm font-medium text-red-600 hover:text-red-500">
                      Cancel Booking
                    </button>
                  </div>
                </div>
              </div>

              {/* Completed Booking */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        DAS Course (Direct Access)
                      </h3>
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        Completed
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Date & Time</p>
                        <p className="text-sm text-gray-900">November 5, 2024</p>
                        <p className="text-sm text-gray-900">8:00 AM - 6:00 PM</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Location</p>
                        <p className="text-sm text-gray-900">East London Training Center</p>
                        <p className="text-sm text-gray-900">123 Training Road, E1 4AA</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Booking ID</p>
                        <p className="text-sm text-gray-900">#BK001233</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-500">
                    Completed on: November 5, 2024
                  </div>
                  <div className="flex space-x-3">
                    <Link
                      href="/users/view_booking_details/BK001233"
                      className="text-sm font-medium text-blue-600 hover:text-blue-500"
                    >
                      View Certificate
                    </Link>
                    <Link
                      href="/users/feedback/BK001233"
                      className="text-sm font-medium text-green-600 hover:text-green-500"
                    >
                      Leave Feedback
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-500">
                Showing 1 to 3 of 12 bookings
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                  Previous
                </button>
                <button className="px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md">
                  1
                </button>
                <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                  2
                </button>
                <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                  3
                </button>
                <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}