"use client";
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const ref = searchParams.get('ref');

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Payment Successful!</h1>
          <p className="text-slate-600">Your gift voucher has been created and sent to the email address provided.</p>
        </div>

        {ref && (
          <div className="bg-slate-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-slate-600 mb-1">Voucher Reference</p>
            <p className="text-lg font-semibold text-slate-900">{ref}</p>
          </div>
        )}

        <div className="space-y-3">
          <p className="text-sm text-slate-600">
            The gift voucher has been emailed to the purchaser. Please check your inbox and spam folder.
          </p>
          <Link
            href="/"
            className="block w-full px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-semibold"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function GiftVoucherSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
