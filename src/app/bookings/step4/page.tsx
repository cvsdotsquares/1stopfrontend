'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface CompleteBookingData {
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
}

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: string;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'card',
    name: 'Credit/Debit Card',
    description: 'Visa, Mastercard, American Express',
    icon: '💳'
  },
  {
    id: 'paypal',
    name: 'PayPal',
    description: 'Pay securely with your PayPal account',
    icon: '🅿️'
  },
  {
    id: 'bank',
    name: 'Bank Transfer',
    description: 'Direct bank transfer (payment within 24 hours)',
    icon: '🏦'
  }
];

const locations = [
  { id: 1, name: 'East London Training Center' },
  { id: 2, name: 'North London Training Center' },
  { id: 3, name: 'Ilford Training Center' },
  { id: 4, name: 'Newham Training Center' },
];

const courses: Record<string, { name: string; price: number }> = {
  cbt: { name: 'CBT Training', price: 120 },
  das: { name: 'DAS Course (Complete)', price: 899 },
  module1: { name: 'Module 1 Training', price: 299 },
  module2: { name: 'Module 2 Training', price: 199 },
  'enhanced-rider': { name: 'Enhanced Rider Course', price: 149 }
};

export default function BookingStep4() {
  const router = useRouter();
  const [bookingData, setBookingData] = useState<CompleteBookingData | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('card');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });
  const [billingAddress, setBillingAddress] = useState({
    sameAsPersonal: true,
    address: '',
    city: '',
    postcode: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const storedBookingData = sessionStorage.getItem('completeBookingData');
    if (storedBookingData) {
      const data = JSON.parse(storedBookingData);
      setBookingData(data);
      
      // Pre-fill billing address if same as personal
      if (billingAddress.sameAsPersonal && data.personalDetails) {
        setBillingAddress(prev => ({
          ...prev,
          address: data.personalDetails.address || '',
          city: data.personalDetails.city || '',
          postcode: data.personalDetails.postcode || ''
        }));
      }
    } else {
      router.push('/bookings/step3');
    }
  }, [router, billingAddress.sameAsPersonal]);

  const validatePayment = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (selectedPaymentMethod === 'card') {
      if (!cardDetails.number.trim()) newErrors.cardNumber = 'Card number is required';
      else if (cardDetails.number.replace(/\s/g, '').length < 16) newErrors.cardNumber = 'Invalid card number';
      
      if (!cardDetails.expiry.trim()) newErrors.expiry = 'Expiry date is required';
      else if (!/^\d{2}\/\d{2}$/.test(cardDetails.expiry)) newErrors.expiry = 'Invalid expiry date (MM/YY)';
      
      if (!cardDetails.cvc.trim()) newErrors.cvc = 'CVC is required';
      else if (cardDetails.cvc.length < 3) newErrors.cvc = 'Invalid CVC';
      
      if (!cardDetails.name.trim()) newErrors.cardName = 'Cardholder name is required';
    }

    if (!billingAddress.sameAsPersonal) {
      if (!billingAddress.address.trim()) newErrors.billingAddress = 'Billing address is required';
      if (!billingAddress.city.trim()) newErrors.billingCity = 'Billing city is required';
      if (!billingAddress.postcode.trim()) newErrors.billingPostcode = 'Billing postcode is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardDetails(prev => ({ ...prev, number: formatted }));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiry(e.target.value);
    setCardDetails(prev => ({ ...prev, expiry: formatted }));
  };

  const handleProcessPayment = async () => {
    if (!validatePayment()) return;

    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generate booking reference
      const bookingRef = 'SI' + Date.now().toString().slice(-6);
      
      // Store final booking data with payment info
      const finalBookingData = {
        ...bookingData,
        bookingReference: bookingRef,
        paymentMethod: selectedPaymentMethod,
        paymentStatus: 'completed',
        bookingDate: new Date().toISOString(),
        status: 'confirmed'
      };

      sessionStorage.setItem('confirmedBooking', JSON.stringify(finalBookingData));
      sessionStorage.removeItem('bookingData');
      sessionStorage.removeItem('completeBookingData');

      // Redirect to confirmation page
      router.push(`/bookings/confirmation?ref=${bookingRef}`);
    } catch (error) {
      console.error('Payment processing error:', error);
      alert('Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  const selectedLocation = locations.find(loc => loc.id === bookingData.location);
  const selectedCourse = courses[bookingData.course];
  const subTotal = selectedCourse?.price || 0;
  const processingFee = selectedPaymentMethod === 'card' ? Math.round(subTotal * 0.029) : 0; // 2.9% card fee
  const total = subTotal + processingFee;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                  ✓
                </div>
                <span className="ml-2 text-sm font-medium text-gray-500">Choose Course</span>
              </div>
              <div className="w-16 h-1 bg-green-500"></div>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                  ✓
                </div>
                <span className="ml-2 text-sm font-medium text-gray-500">Select Date & Location</span>
              </div>
              <div className="w-16 h-1 bg-green-500"></div>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                  ✓
                </div>
                <span className="ml-2 text-sm font-medium text-gray-500">Personal Details</span>
              </div>
              <div className="w-16 h-1 bg-blue-600"></div>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  4
                </div>
                <span className="ml-2 text-sm font-medium text-gray-900">Payment</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Payment Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h1 className="text-2xl font-bold text-gray-900">Payment Details</h1>
                <p className="text-gray-600 mt-1">Secure payment processing</p>
              </div>

              <div className="p-6 space-y-6">
                {/* Payment Method Selection */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h2>
                  <div className="space-y-3">
                    {paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        onClick={() => setSelectedPaymentMethod(method.id)}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedPaymentMethod === method.id
                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="text-2xl mr-3">{method.icon}</span>
                            <div>
                              <h3 className="font-semibold text-gray-900">{method.name}</h3>
                              <p className="text-sm text-gray-600">{method.description}</p>
                            </div>
                          </div>
                          {selectedPaymentMethod === method.id && (
                            <span className="text-blue-600 font-medium">✓</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Payment Form */}
                {selectedPaymentMethod === 'card' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Card Information</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Card Number *
                      </label>
                      <input
                        type="text"
                        value={cardDetails.number}
                        onChange={handleCardNumberChange}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.cardNumber ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.cardNumber && <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Expiry Date *
                        </label>
                        <input
                          type="text"
                          value={cardDetails.expiry}
                          onChange={handleExpiryChange}
                          placeholder="MM/YY"
                          maxLength={5}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.expiry ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.expiry && <p className="text-red-500 text-sm mt-1">{errors.expiry}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CVC *
                        </label>
                        <input
                          type="text"
                          value={cardDetails.cvc}
                          onChange={(e) => setCardDetails(prev => ({ ...prev, cvc: e.target.value.replace(/\D/g, '') }))}
                          placeholder="123"
                          maxLength={4}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.cvc ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.cvc && <p className="text-red-500 text-sm mt-1">{errors.cvc}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cardholder Name *
                      </label>
                      <input
                        type="text"
                        value={cardDetails.name}
                        onChange={(e) => setCardDetails(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Full name as on card"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.cardName ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.cardName && <p className="text-red-500 text-sm mt-1">{errors.cardName}</p>}
                    </div>
                  </div>
                )}

                {/* PayPal */}
                {selectedPaymentMethod === 'paypal' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                    <div className="text-4xl mb-4">🅿️</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">PayPal Payment</h3>
                    <p className="text-gray-600 mb-4">
                      You will be redirected to PayPal to complete your payment securely.
                    </p>
                    <p className="text-sm text-gray-500">
                      Click "Complete Payment" below to proceed to PayPal.
                    </p>
                  </div>
                )}

                {/* Bank Transfer */}
                {selectedPaymentMethod === 'bank' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <div className="text-4xl mb-4 text-center">🏦</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Bank Transfer Details</h3>
                    <p className="text-gray-600 mb-4">
                      Please transfer the exact amount to the following bank account within 24 hours:
                    </p>
                    <div className="bg-white p-4 rounded border text-sm space-y-2">
                      <div><strong>Account Name:</strong> 1Stop Instruction Ltd</div>
                      <div><strong>Sort Code:</strong> 12-34-56</div>
                      <div><strong>Account Number:</strong> 12345678</div>
                      <div><strong>Reference:</strong> {bookingData.personalDetails.lastName.toUpperCase()}-{Date.now().toString().slice(-4)}</div>
                    </div>
                    <p className="text-sm text-gray-600 mt-4">
                      Your booking will be confirmed once payment is received.
                    </p>
                  </div>
                )}

                {/* Billing Address */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Address</h3>
                  
                  <div className="mb-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={billingAddress.sameAsPersonal}
                        onChange={(e) => setBillingAddress(prev => ({ ...prev, sameAsPersonal: e.target.checked }))}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Same as personal address</span>
                    </label>
                  </div>

                  {!billingAddress.sameAsPersonal && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Billing Address *
                        </label>
                        <input
                          type="text"
                          value={billingAddress.address}
                          onChange={(e) => setBillingAddress(prev => ({ ...prev, address: e.target.value }))}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.billingAddress ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.billingAddress && <p className="text-red-500 text-sm mt-1">{errors.billingAddress}</p>}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            City *
                          </label>
                          <input
                            type="text"
                            value={billingAddress.city}
                            onChange={(e) => setBillingAddress(prev => ({ ...prev, city: e.target.value }))}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              errors.billingCity ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          {errors.billingCity && <p className="text-red-500 text-sm mt-1">{errors.billingCity}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Postcode *
                          </label>
                          <input
                            type="text"
                            value={billingAddress.postcode}
                            onChange={(e) => setBillingAddress(prev => ({ ...prev, postcode: e.target.value }))}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              errors.billingPostcode ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          {errors.billingPostcode && <p className="text-red-500 text-sm mt-1">{errors.billingPostcode}</p>}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Button */}
              <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
                <Link
                  href="/bookings/step3"
                  className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back to Details
                </Link>
                
                <button
                  onClick={handleProcessPayment}
                  disabled={isProcessing}
                  className={`px-8 py-2 font-medium rounded-lg transition-colors flex items-center ${
                    isProcessing
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    `Complete Payment - £${total}`
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm sticky top-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
              </div>

              <div className="p-6 space-y-4">
                {/* Booking Details */}
                <div className="space-y-3">
                  <div>
                    <h3 className="font-medium text-gray-900">{selectedCourse?.name}</h3>
                    <p className="text-sm text-gray-600">{selectedLocation?.name}</p>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Date:</span> {' '}
                      {new Date(bookingData.date + 'T00:00:00').toLocaleDateString('en-GB', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </div>
                    <div>
                      <span className="font-medium">Time:</span> {bookingData.time}
                    </div>
                  </div>

                  <div className="text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Student:</span> {' '}
                      {bookingData.personalDetails.firstName} {bookingData.personalDetails.lastName}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span> {bookingData.personalDetails.email}
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Course fee:</span>
                    <span>£{subTotal}</span>
                  </div>
                  
                  {processingFee > 0 && (
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Processing fee:</span>
                      <span>£{processingFee}</span>
                    </div>
                  )}
                  
                  <div className="border-t border-gray-200 pt-2">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total:</span>
                      <span className="text-green-600">£{total}</span>
                    </div>
                  </div>
                </div>

                {/* Security Info */}
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl mb-2">🔒</div>
                  <p className="text-sm text-gray-600">
                    Your payment is secured with 256-bit SSL encryption
                  </p>
                </div>

                {/* Support */}
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Need help?</p>
                  <Link
                    href="/contactus.php"
                    className="text-blue-600 text-sm font-medium hover:underline"
                  >
                    Contact Support
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}