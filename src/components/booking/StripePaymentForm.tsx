"use client";
import React, { useState, useCallback } from 'react';
import {
  PaymentElement,
  ExpressCheckoutElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import type {
  StripeExpressCheckoutElementConfirmEvent,
  StripeExpressCheckoutElementReadyEvent,
} from '@stripe/stripe-js';
import { toast } from 'sonner';
import { trackAddPaymentInfo } from '@/lib/gtm';

interface StripePaymentFormProps {
  onSuccess: (bookingRefs: string[]) => void;
  onCancel: (bookingRef?: string) => void;
  bookingRef?: string;
  courseEventId?: number | string;
  itemVariant?: string;
  attendeeCount?: number;
  amount: number;
  billingDetails?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  onCreatePaymentIntent: () => Promise<{ clientSecret?: string; bookingRef: string; bookingRefs: string[]; paymentRequired: boolean } | undefined>;
  paymentDisabled?: boolean;
  /**
   * Optional return_url override for redirect-based payment methods (e.g. Klarna,
   * some 3DS flows). For card / Apple Pay / Google Pay this is unused because we
   * pass `redirect: 'if_required'`. Defaults to the current origin's payment-success
   * page so refreshes after redirects land somewhere reasonable.
   */
  returnUrl?: string;
}

export default function StripePaymentForm({ onSuccess, onCancel, bookingRef, courseEventId, itemVariant, attendeeCount = 1, amount, billingDetails, onCreatePaymentIntent, paymentDisabled = false, returnUrl }: Readonly<StripePaymentFormProps>) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  // null = ECE hasn't reported yet (avoids flash of "no wallets")
  // true/false = wallet buttons available on this device + dashboard config
  const [walletsAvailable, setWalletsAvailable] = useState<boolean | null>(null);

  const persistPendingPurchase = (bookingRefs: string[], primaryRef: string | undefined) => {
    try {
      const purchaseTransactionId =
        bookingRefs?.filter(Boolean).join(',')
        || primaryRef
        || bookingRef
        || 'pending-booking';

      const totalValue = amount / 100;

      const pendingItems = [{
        item_id: courseEventId ?? 'unknown',
        item_name: 'Course Booking',
        item_category: 'Booking',
        item_variant: itemVariant,
        quantity: Math.max(1, attendeeCount),
        price: Number(totalValue.toFixed(2)),
      }];

      const pendingPurchasePayload = {
        transactionId: purchaseTransactionId,
        courseEventId: courseEventId ?? null,
        items: pendingItems,
        value: Number(totalValue.toFixed(2)),
        createdAt: Date.now(),
      };

      sessionStorage.setItem('gtm_purchase_pending', JSON.stringify(pendingPurchasePayload));
    } catch {
      // Non-blocking: continue redirect flow even if storage is unavailable
    }
  };

  /**
   * Shared confirm flow used by both the card-form submit AND the Express
   * Checkout (Apple Pay / Google Pay) onConfirm. Always validates Elements,
   * creates the PaymentIntent, then calls stripe.confirmPayment with
   * redirect:'if_required'. Returns true on success so callers can decide
   * what to do (close wallet sheet, navigate, etc.).
   */
  const confirmPaymentFlow = useCallback(async (): Promise<boolean> => {
    if (!stripe || !elements) return false;

    const { error: submitError } = await elements.submit();
    if (submitError) {
      toast.error(submitError.message || 'Please check your payment details');
      return false;
    }

    const creationResult = await onCreatePaymentIntent();
    if (!creationResult) return false;

    if (!creationResult.paymentRequired) {
      toast.success('Booking created successfully!');
      onSuccess(creationResult.bookingRefs);
      return true;
    }

    if (!creationResult.clientSecret) {
      throw new Error('Payment client secret missing');
    }

    trackAddPaymentInfo(
      {
        item_id: courseEventId ?? 'unknown',
        item_name: 'Course Booking',
        item_category: 'Booking',
        item_variant: itemVariant,
        quantity: Math.max(1, attendeeCount),
        price: amount / 100,
      },
      amount / 100,
    );

    // Pre-thread booking refs into the return URL so redirect-based methods
    // (Klarna etc.) land on a success page that can resolve them.
    const refsQuery = encodeURIComponent((creationResult.bookingRefs || []).filter(Boolean).join(','));
    const fallbackReturnUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/bookings/payment-success${refsQuery ? `?refs=${refsQuery}` : ''}`
      : undefined;

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      clientSecret: creationResult.clientSecret,
      confirmParams: {
        return_url: returnUrl || fallbackReturnUrl || '',
        payment_method_data: {
          billing_details: {
            name: billingDetails?.name,
            email: billingDetails?.email,
            phone: billingDetails?.phone,
          },
        },
      },
      // Card / Apple Pay / Google Pay finish in-page; only redirect for methods
      // that genuinely require it (Klarna, some 3DS, etc.).
      redirect: 'if_required',
    });

    if (error) {
      toast.error(error.message || 'Payment failed');
      return false;
    }

    if (paymentIntent?.status === 'succeeded' || paymentIntent?.status === 'processing') {
      persistPendingPurchase(creationResult.bookingRefs, creationResult.bookingRef);
      toast.success(paymentIntent.status === 'succeeded' ? 'Payment successful!' : 'Payment is being processed');
      onSuccess(creationResult.bookingRefs);
      return true;
    }

    toast.error('Payment could not be completed. Please try again.');
    return false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stripe, elements, onCreatePaymentIntent, onSuccess, amount, attendeeCount, billingDetails?.email, billingDetails?.name, billingDetails?.phone, courseEventId, itemVariant, returnUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    try {
      await confirmPaymentFlow();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment processing failed';
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExpressReady = (event: any) => {
    console.log('=== ECE READY ===');
    console.log(event);
    console.log('keys:', Object.keys(event || {}));
    console.log('availablePaymentMethods:', event?.availablePaymentMethods);
  
    setWalletsAvailable(true); // TEMPORARY FOR DEBUGGING
  };
    // Temporary diagnostic for stage: surface exactly what Stripe reports so we
    // can tell whether wallets are blocked by domain verification, account
    // config, browser support, etc. Safe to remove once Apple Pay / Google Pay
    // are confirmed working on stage + prod.
    console.info('[ECE] availablePaymentMethods', {
      methods,
      anyAvailable,
      origin: typeof window !== 'undefined' ? window.location.origin : null,
      protocol: typeof window !== 'undefined' ? window.location.protocol : null,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    });
    setWalletsAvailable(anyAvailable);
  };

  const handleExpressConfirm = async (_event: StripeExpressCheckoutElementConfirmEvent) => {
    if (!stripe || !elements) return;
    setIsProcessing(true);
    try {
      await confirmPaymentFlow();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment processing failed';
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  // Express checkout (Apple Pay / Google Pay) only makes sense when there's an
  // actual amount to authorize. Free bookings (amount === 0) skip ECE entirely
  // since the wallet sheet would quote the floored Stripe minimum (50p) which
  // doesn't match the real charge.
  const showExpressCheckout = amount > 0 && walletsAvailable !== false;

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
        {/*
          Express Checkout Element renders dedicated Apple Pay / Google Pay (and
          optionally Link / PayPal / Amazon Pay) buttons at the top. Stripe shows
          only the wallets that the buyer's device + browser actually support
          AND that are enabled in your Stripe Dashboard. When nothing is
          available, ECE renders an empty container and we hide the divider.
        */}
        {amount > 0 && (
          <div
            className="bg-white rounded-xl border border-slate-200 p-6"
          >
            <h3 className="text-base font-semibold text-slate-900 mb-4">Express Checkout</h3>
            <ExpressCheckoutElement
              onReady={handleExpressReady}
              onLoadError={(e) => {
                console.error('ECE LOAD ERROR', e);
              }}
              onConfirm={handleExpressConfirm}
              options={{
                paymentMethods: {
                  applePay: 'always',
                  googlePay: 'always',
                  amazonPay: 'never',
                  paypal: 'never',
                  link: 'auto',
                },
                buttonType: {
                  // Apple Pay button types differ from Google Pay's. 'buy' is the
                  // closest analogue to "Pay" for one-off purchases.
                  applePay: 'buy',
                  googlePay: 'pay',
                },
                buttonTheme: {
                  applePay: 'black',
                  googlePay: 'black',
                },
                layout: { maxColumns: 2, maxRows: 1, overflow: 'auto' },
              }}
            />
          </div>
        )}

        {showExpressCheckout && (
          <div className="relative flex items-center justify-center" aria-hidden>
            <div className="absolute inset-x-0 top-1/2 h-px bg-slate-200" />
            <span className="relative bg-white px-3 text-xs uppercase tracking-wider text-slate-400">
              Or pay with card
            </span>
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Secure Payment Details
          </h3>
          {/* PaymentElement handles the regular card form. Wallets are turned
              off here so they don't duplicate the ECE row above. */}
          <PaymentElement
            options={{
              layout: 'tabs',
              wallets: {
                applePay: 'auto',
                googlePay: 'auto',
              },
              defaultValues: {
                billingDetails: {
                  name: billingDetails?.name,
                  email: billingDetails?.email,
                  phone: billingDetails?.phone,
                },
              },
            }}
            onChange={(event) => {
              setCardComplete(event.complete);
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
            disabled={!stripe || isProcessing || paymentDisabled || !cardComplete}
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
