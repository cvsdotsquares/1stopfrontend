"use client";
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function CancelContent() {
  const searchParams = useSearchParams();
  const ref = searchParams.get('ref');

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Payment Cancelled</h1>
          <p className="text-slate-600">Your gift voucher payment was cancelled. No charges have been made.</p>
        </div>

        {ref && (
          <div className="bg-slate-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-slate-600 mb-1">Voucher Reference</p>
            <p className="text-lg font-semibold text-slate-900">{ref}</p>
          </div>
        )}

        <div className="space-y-3">
          <p className="text-sm text-slate-600">
            You can try again or contact us if you need assistance.
          </p>
          <div className="flex gap-3">
            <Link
              href="/gift-voucher"
              className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-semibold"
            >
              Try Again
            </Link>
            <Link
              href="/"
              className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition font-medium"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GiftVoucherCancelPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>}>
      <CancelContent />
    </Suspense>
  );
}
