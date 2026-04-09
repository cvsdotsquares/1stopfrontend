"use client";
import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { toast } from 'sonner';
import { trackAddPaymentInfo } from '@/lib/gtm';

interface StripePaymentFormProps {
  onSuccess: (bookingRefs: string[]) => void;
  onCancel: (bookingRef?: string) => void;
  bookingRef?: string;
  itemVariant?: string;
  amount: number;
  billingDetails?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  onCreatePaymentIntent: () => Promise<{ clientSecret?: string; bookingRef: string; bookingRefs: string[]; paymentRequired: boolean } | undefined>;
  paymentDisabled?: boolean;
}

export default function StripePaymentForm({ onSuccess, onCancel, bookingRef, itemVariant, amount, billingDetails, onCreatePaymentIntent, paymentDisabled = false }: Readonly<StripePaymentFormProps>) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const creationResult = await onCreatePaymentIntent();

      if (!creationResult) {
        setIsProcessing(false);
        return;
      }

      if (!creationResult.paymentRequired) {
        toast.success('Booking created successfully!');
        onSuccess(creationResult.bookingRefs);
        return;
      }

      if (!creationResult.clientSecret) {
        throw new Error('Payment client secret missing');
      }

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card details are not available');
      }

      // GTM: add_payment_info
      trackAddPaymentInfo(
        {
          item_id: creationResult.bookingRef ?? 'unknown',
          item_name: 'Course Booking',
          item_category: 'Booking',
          item_variant: itemVariant,
          price: amount / 100,
        },
        amount / 100,
      );

      const { error } = await stripe.confirmCardPayment(creationResult.clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: billingDetails?.name,
            email: billingDetails?.email,
            phone: billingDetails?.phone,
          }
        },
      }, {
        handleActions: true,
      });

      if (error) {
        toast.error(error.message || 'Payment failed');
        setIsProcessing(false);
        return;
      }

      // Store purchase payload and fire purchase only from success page.
      // This avoids counting failed payment attempts as purchases.
      try {
        const purchaseTransactionId =
          creationResult.bookingRefs?.filter(Boolean).join(',')
          || creationResult.bookingRef
          || bookingRef
          || 'pending-booking';

        const pendingPurchasePayload = {
          transactionId: purchaseTransactionId,
          item: {
            item_id: creationResult.bookingRef ?? 'unknown',
            item_name: 'Course Booking',
            item_category: 'Booking',
            item_variant: itemVariant,
            price: amount / 100,
            quantity: 1,
          },
          value: amount / 100,
          createdAt: Date.now(),
        };

        sessionStorage.setItem('gtm_purchase_pending', JSON.stringify(pendingPurchasePayload));
      } catch {
        // Non-blocking: continue redirect flow even if storage is unavailable
      }

      toast.success('Payment successful!');
      onSuccess(creationResult.bookingRefs);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment processing failed';
      toast.error(errorMessage);
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center pb-4 border-b">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Complete Payment</h2>
        <p className="text-slate-600">Booking Reference: <span className="font-semibold text-slate-900">{bookingRef || 'Pending'}</span></p>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600 mb-1">Total Amount</p>
            <p className="text-3xl font-bold text-slate-900">£{(amount / 100).toFixed(2)}</p>
          </div>
          <div className="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Secure Payment Details
          </h3>
          <CardElement
            options={{
              hidePostalCode: true,
              style: {
                base: {
                  fontSize: '16px',
                  color: '#0f172a',
                  '::placeholder': { color: '#94a3b8' },
                },
              },
            }}
          />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => onCancel(bookingRef)}
            disabled={isProcessing}
            className="flex-1 px-6 py-3.5 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!stripe || isProcessing || paymentDisabled}
            className="flex-1 px-6 py-3.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg shadow-green-600/30 transition-all"
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              `Pay £${(amount / 100).toFixed(2)}`
            )}
          </button>
        </div>
      </form>

      <div className="flex items-center justify-center gap-4 text-xs text-slate-500 pt-2">
        <div className="flex items-center gap-1">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <span>Secured by Stripe</span>
        </div>
        <span>•</span>
        <span>256-bit SSL encryption</span>
      </div>
    </div>
  );
}
