"use client";
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const [bookingRef, setBookingRef] = useState('');
  const [transactionId, setTransactionId] = useState('');

  useEffect(() => {
    // Get payment details from URL params
    const cartId = searchParams.get('cartId') || '';
    const transId = searchParams.get('transId') || '';
    
    setBookingRef(cartId);
    setTransactionId(transId);

    // Clear any stored booking data
    localStorage.removeItem('booking_lock');
    localStorage.removeItem('booking_form_data');
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
          {/* Success Icon */}
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Success Message */}
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Payment Successful!</h1>
          <p className="text-slate-600 mb-6">
            Your booking has been confirmed and payment processed successfully.
          </p>

          {/* Booking Details */}
          {bookingRef && (
            <div className="bg-slate-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-slate-900 mb-2">Booking Details</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Booking Reference:</span>
                  <span className="font-medium text-slate-900">{bookingRef}</span>
                </div>
                {transactionId && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Transaction ID:</span>
                    <span className="font-medium text-slate-900">{transactionId}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="text-left mb-6">
            <h3 className="font-semibold text-slate-900 mb-2">What happens next?</h3>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• You'll receive a confirmation email shortly</li>
              <li>• Course joining instructions will be sent 24-48 hours before your course</li>
              <li>• Remember to bring your photocard driving licence on the day</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link 
              href="/bookings" 
              className="w-full inline-flex items-center justify-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
            >
              View My Bookings
            </Link>
            <Link 
              href="/" 
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}