/**
 * Must stay aligned with backend `src/utils/stripeBookingPayment.js`.
 * Used by deferred-intent Elements so the Pay by Bank tab renders before the
 * PaymentIntent exists.
 */
export const BOOKING_PAYMENT_METHOD_TYPES = ['card', 'link', 'pay_by_bank'] as const;

export function getBookingElementsPaymentOptions(amountPence: number) {
  return {
    mode: 'payment' as const,
    amount: Math.max(50, amountPence),
    currency: 'gbp',
    paymentMethodTypes: [...BOOKING_PAYMENT_METHOD_TYPES],
    appearance: { theme: 'stripe' as const },
  };
}
