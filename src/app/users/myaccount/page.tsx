import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'My Account | 1Stop Instruction',
  description: 'Manage your account, view bookings, and access your training records.',
};

export default function MyAccount() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
          <p className="mt-2 text-gray-600">
            Manage your account settings and view your training progress
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="bg-white rounded-lg shadow-sm overflow-hidden">
              <ul className="divide-y divide-gray-200">
                <li>
                  <Link
                    href="/users/myaccount"
                    className="block px-4 py-3 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                  >
                    Account Overview
                  </Link>
                </li>
                <li>
                  <Link
                    href="/users/all-bookings"
                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    My Bookings
                  </Link>
                </li>
                <li>
                  <Link
                    href="/users/edit-profile"
                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Edit Profile
                  </Link>
                </li>
                <li>
                  <Link
                    href="/bookings/my-gift-vouchers"
                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Gift Vouchers
                  </Link>
                </li>
                <li>
                  <Link
                    href="/users/logout"
                    className="block px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Logout
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="text-lg font-medium text-blue-900">Active Bookings</h3>
                  <p className="text-2xl font-bold text-blue-600">2</p>
                  <p className="text-sm text-blue-700">Upcoming courses</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="text-lg font-medium text-green-900">Completed</h3>
                  <p className="text-2xl font-bold text-green-600">5</p>
                  <p className="text-sm text-green-700">Training sessions</p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div>
                    <p className="font-medium text-gray-900">CBT Training Completed</p>
                    <p className="text-sm text-gray-500">East London Training Center</p>
                  </div>
                  <span className="text-sm text-gray-500">2 days ago</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div>
                    <p className="font-medium text-gray-900">Booking Confirmed</p>
                    <p className="text-sm text-gray-500">Module 1 Test - December 15</p>
                  </div>
                  <span className="text-sm text-gray-500">1 week ago</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-gray-900">Profile Updated</p>
                    <p className="text-sm text-gray-500">Contact information changed</p>
                  </div>
                  <span className="text-sm text-gray-500">2 weeks ago</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  href="/bookings"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors group"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium text-gray-900">Book Training</h3>
                    <p className="text-sm text-gray-500">Schedule new course</p>
                  </div>
                </Link>

                <Link
                  href="/bookings/create_voucher"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors group"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium text-gray-900">Gift Voucher</h3>
                    <p className="text-sm text-gray-500">Purchase gift voucher</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}