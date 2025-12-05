'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface ConfirmedBooking {
  location: number;
  course: string;
  date: string;
  time: string;
  instructor?: number;
  personalDetails: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    [key: string]: any;
  };
  bookingReference: string;
  paymentMethod: string;
  paymentStatus: string;
  bookingDate: string;
  status: string;
}

const locations = [
  { id: 1, name: 'East London Training Center', address: '123 Training Road, Stratford, London E15 4AA', phone: '020 8123 4567' },
  { id: 2, name: 'North London Training Center', address: '456 Rider Street, Tottenham, London N17 8BB', phone: '020 8765 4321' },
  { id: 3, name: 'Ilford Training Center', address: '789 Motorcycle Way, Ilford, Essex IG1 2CC', phone: '020 8111 2233' },
  { id: 4, name: 'Newham Training Center', address: '321 Learning Lane, Beckton, London E6 3DD', phone: '020 8444 5566' },
];

const courses: Record<string, { name: string; price: number; duration: string }> = {
  cbt: { name: 'CBT Training', price: 120, duration: '6-8 hours' },
  das: { name: 'DAS Course (Complete)', price: 899, duration: '5 days' },
  module1: { name: 'Module 1 Training', price: 299, duration: '2 days' },
  module2: { name: 'Module 2 Training', price: 199, duration: '1 day' },
  'enhanced-rider': { name: 'Enhanced Rider Course', price: 149, duration: '1 day' }
};

function BookingConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [bookingData, setBookingData] = useState<ConfirmedBooking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    const bookingRef = searchParams.get('ref');
    const storedBooking = sessionStorage.getItem('confirmedBooking');

    if (bookingRef && storedBooking) {
      const booking = JSON.parse(storedBooking);
      if (booking.bookingReference === bookingRef) {
        setBookingData(booking);
        
        // Simulate sending confirmation email
        setTimeout(() => {
          setEmailSent(true);
        }, 2000);
      } else {
        router.push('/bookings');
      }
    } else {
      router.push('/bookings');
    }
    
    setIsLoading(false);
  }, [searchParams, router]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCalendar = () => {
    if (!bookingData) return;

    const startDate = new Date(bookingData.date + 'T08:00:00'); // Assuming 8 AM start
    const endDate = new Date(startDate.getTime() + 8 * 60 * 60 * 1000); // 8 hours later
    
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//1Stop Instruction//Booking System//EN',
      'BEGIN:VEVENT',
      `UID:${bookingData.bookingReference}@1stopinstruction.co.uk`,
      `DTSTART:${formatDate(startDate)}`,
      `DTEND:${formatDate(endDate)}`,
      `SUMMARY:${courses[bookingData.course]?.name} - 1Stop Instruction`,
      `DESCRIPTION:Booking Reference: ${bookingData.bookingReference}\\nCourse: ${courses[bookingData.course]?.name}\\nLocation: ${locations.find(l => l.id === bookingData.location)?.name}`,
      `LOCATION:${locations.find(l => l.id === bookingData.location)?.address}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `1stop-training-${bookingData.bookingReference}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your booking confirmation...</p>
        </div>
      </div>
    );
  }

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Found</h1>
          <p className="text-gray-600 mb-6">We couldn't find your booking confirmation.</p>
          <Link
            href="/bookings"
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Make New Booking
          </Link>
        </div>
      </div>
    );
  }

  const selectedLocation = locations.find(loc => loc.id === bookingData.location);
  const selectedCourse = courses[bookingData.course];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 text-white rounded-full mb-4">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 12L11 14L15 10M21 12C21 16.97 16.97 21 12 21C7.03 21 3 16.97 3 12C3 7.03 7.03 3 12 3C16.97 3 21 7.03 21 12Z"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-xl text-gray-600">
            Thank you for booking with 1Stop Instruction
          </p>
        </div>

        {/* Email Status */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-center space-x-3">
            {emailSent ? (
              <>
                <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12L11 14L15 10M21 12C21 16.97 16.97 21 12 21C7.03 21 3 16.97 3 12C3 7.03 7.03 3 12 3C16.97 3 21 7.03 21 12Z"/>
                  </svg>
                </div>
                <span className="text-green-700 font-medium">Confirmation email sent to {bookingData.personalDetails.email}</span>
              </>
            ) : (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="text-gray-600">Sending confirmation email...</span>
              </>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-green-50 border-b border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Booking Reference</h2>
                <p className="text-2xl font-mono font-bold text-green-600">{bookingData.bookingReference}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Booked on</p>
                <p className="font-medium">
                  {new Date(bookingData.bookingDate).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Training Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Training Details</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-600">Course:</span>
                    <div className="font-medium text-gray-900">{selectedCourse?.name}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Duration:</span>
                    <div className="font-medium text-gray-900">{selectedCourse?.duration}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Date:</span>
                    <div className="font-medium text-gray-900">
                      {new Date(bookingData.date + 'T00:00:00').toLocaleDateString('en-GB', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Time:</span>
                    <div className="font-medium text-gray-900">{bookingData.time}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Price:</span>
                    <div className="font-medium text-green-600">£{selectedCourse?.price}</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Location Details</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-600">Training Center:</span>
                    <div className="font-medium text-gray-900">{selectedLocation?.name}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Address:</span>
                    <div className="font-medium text-gray-900">{selectedLocation?.address}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Phone:</span>
                    <div className="font-medium text-gray-900">{selectedLocation?.phone}</div>
                  </div>
                  <div className="pt-2">
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(selectedLocation?.address || '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:underline text-sm"
                    >
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22S19 14.25 19 9C19 5.13 15.87 2 12 2M12 11.5C10.62 11.5 9.5 10.38 9.5 9S10.62 6.5 12 6.5 14.5 7.62 14.5 9 13.38 11.5 12 11.5Z"/>
                      </svg>
                      View on Google Maps
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Student Details */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600">Name:</span>
                  <div className="font-medium text-gray-900">
                    {bookingData.personalDetails.firstName} {bookingData.personalDetails.lastName}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Email:</span>
                  <div className="font-medium text-gray-900">{bookingData.personalDetails.email}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Phone:</span>
                  <div className="font-medium text-gray-900">{bookingData.personalDetails.phone}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Payment Status:</span>
                  <div className="font-medium text-green-600 capitalize">{bookingData.paymentStatus}</div>
                </div>
              </div>
            </div>

            {/* Important Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-3">Important Information</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Please arrive 15 minutes early for registration and safety briefing
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Bring your provisional driving license and any glasses/contact lenses if required
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Wear suitable clothing - long sleeves, long trousers, and covered shoes
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  All safety equipment (helmet, gloves, jacket) will be provided
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Cancellation must be made at least 48 hours in advance for a full refund
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={handlePrint}
                className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 3H6V7H18V3M19 12V19H5V12H19M17 8H5A2 2 0 0 0 3 10V17H5V21H19V17H21V10A2 2 0 0 0 19 8Z"/>
                </svg>
                Print Booking
              </button>

              <button
                onClick={handleDownloadCalendar}
                className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H18V1H16V3H8V1H6V3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3M19 19H5V8H19V19Z"/>
                </svg>
                Add to Calendar
              </button>

              <Link
                href="/users/all-bookings"
                className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center text-center"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2M21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.1 3.89 23 5 23H19C20.1 23 21 22.1 21 21V9M19 21H5V3H13V9H19V21Z"/>
                </svg>
                My Bookings
              </Link>

              <Link
                href="/bookings"
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
                </svg>
                Book Another Course
              </Link>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">
            Have questions about your booking? Our team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href={`tel:${selectedLocation?.phone}`}
              className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              📞 Call {selectedLocation?.phone}
            </a>
            <Link
              href="/contactus.php"
              className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              ✉️ Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookingConfirmation() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading confirmation...</p>
        </div>
      </div>
    }>
      <BookingConfirmationContent />
    </Suspense>
  );
}