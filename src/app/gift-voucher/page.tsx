"use client";
import React, { useState, useEffect, useRef } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { toast } from 'sonner';
import StripePaymentForm from '@/components/booking/StripePaymentForm';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface TemplateData {
  template: {
    details: string;
  };
  options: string[];
}

export default function GiftVoucherPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    recipientName: '',
    subject: '',
    fieldText: '',
    voucherValue: '',
    purchasedBy: '',
    contactNumber: '',
    emailAddress: '',
  });
  const [clientSecret, setClientSecret] = useState('');
  const [voucherRef, setVoucherRef] = useState('');
  const [templateData, setTemplateData] = useState<TemplateData | null>(null);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(true);
  const pageWrapperRef = useRef<HTMLDivElement | null>(null);

  // Fetch template data on component mount
  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vouchers/template`);
        const data = await response.json();
        if (data.success && data.data) {
          setTemplateData(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch template data:', error);
      } finally {
        setIsLoadingTemplate(false);
      }
    };

    fetchTemplate();
  }, []);

  useEffect(() => {
    if (step !== 2) {
      return;
    }

    const scrollPageWrapperIntoView = () => {
      const target = pageWrapperRef.current;
      if (!target) {
        return;
      }

      const absoluteTop = globalThis.scrollY + target.getBoundingClientRect().top - 24;
      globalThis.scrollTo({
        top: Math.max(0, absoluteTop),
        behavior: 'smooth',
      });
    };

    const immediateTimer = globalThis.setTimeout(scrollPageWrapperIntoView, 0);
    const followUpTimer = globalThis.setTimeout(scrollPageWrapperIntoView, 250);

    return () => {
      globalThis.clearTimeout(immediateTimer);
      globalThis.clearTimeout(followUpTimer);
    };
  }, [step]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePreview = async () => {
    const errors = [];
    if (!formData.recipientName.trim()) errors.push('Recipient name');
    if (!formData.voucherValue || parseFloat(formData.voucherValue) <= 0) errors.push('Valid voucher value');
    if (!formData.purchasedBy.trim()) errors.push('Purchaser name');
    if (!formData.contactNumber.trim()) errors.push('Contact number');
    if (!formData.emailAddress.trim()) errors.push('Email address');

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.emailAddress.trim() && !emailRegex.test(formData.emailAddress.trim())) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (errors.length > 0) {
      toast.error(`Please provide: ${errors.join(', ')}`);
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vouchers/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient_name: formData.recipientName,
          voucher_value: parseFloat(formData.voucherValue),
          purchased_by: formData.purchasedBy,
          contact_number: formData.contactNumber,
          email_address: formData.emailAddress,
          subject: formData.subject,
          field_text: formData.fieldText,
        }),
      });

      const data = await response.json();

      if (data.success && data.client_secret) {
        setClientSecret(data.client_secret);
        setVoucherRef(data.voucher_ref);
        setStep(2);
        toast.success(`Voucher created! Reference: ${data.voucher_ref}`);
      } else {
        toast.error(data.message || 'Failed to create voucher');
      }
    } catch (error) {
      toast.error('Failed to create voucher');
    }
  };



  const voucherTotal = parseFloat(formData.voucherValue || '0');
  // No VAT required for gift vouchers
  const total = voucherTotal;

  return (
    <div ref={pageWrapperRef} className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Gift Voucher</h1>
          {step === 1 && (
            <p className="text-slate-600">Please fill in the fields below to create your personalised gift voucher</p>
          )}
        </div>

        {step === 1 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Gift Voucher Details</h2>
              <p className="text-sm text-slate-600">Fill in the details below to create a gift voucher</p>
            </div>

            <div className="space-y-5">
              {/* Recipient Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Person Who The Gift Voucher Is For (Recipients Name): <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.recipientName}
                  onChange={(e) => handleInputChange('recipientName', e.target.value)}
                  placeholder="Enter the name of the person who this gift voucher is for"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Please tell us what the gift voucher is for</label>
                {isLoadingTemplate ? (
                  <input
                    type="text"
                    disabled
                    placeholder="Loading options..."
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30 bg-gray-50"
                  />
                ) : (
                  <select
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    style={{ WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none' }}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30 bg-white"
                  >
                    {templateData?.options?.map((option) => (
                      <option key={option} value={option}>
                        {'Gift Voucher For ' + option}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Field Text */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                <textarea
                  value={formData.fieldText}
                  onChange={(e) => handleInputChange('fieldText', e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                  placeholder="Enter a personal message that you would like to appear on your Gift Voucher"
                />
              </div>

              {/* Voucher Value */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Value Of Voucher (£): <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="textfield"
                    value={formData.voucherValue}
                    onChange={(e) => handleInputChange('voucherValue', e.target.value)}
                    className="w-24 rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Purchased By */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Purchased By: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.purchasedBy}
                  onChange={(e) => handleInputChange('purchasedBy', e.target.value)}
                  placeholder="Enter YOUR Full name here"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                />
              </div>

              {/* Contact Number */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Purchaser's Contact Number: <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.contactNumber}
                  onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                  placeholder="Enter YOUR contact number here"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                />
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Purchaser's Email Address (This Is The Address We Will Send The Gift Voucher To): <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.emailAddress}
                  onChange={(e) => handleInputChange('emailAddress', e.target.value)}
                  placeholder="Enter YOUR email address here"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                />
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
              {isLoadingTemplate ? (
                <div className="text-sm text-slate-600">Loading terms and conditions...</div>
              ) : templateData?.template?.details ? (
                <div
                  className="text-sm text-slate-700"
                  dangerouslySetInnerHTML={{ __html: templateData.template.details }}
                />
              ) : (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">TERMS AND CONDITIONS</h3>
                  <div className="space-y-2 text-sm text-slate-700">
                    <p>The gift voucher is valid for 12 months from the date stated above. The recipient will be required to use this gift voucher by booking and attending a course with 1 Stop Instruction within this period.</p>
                    <p>The gift voucher is for the monetary value of the purchaser's choice. This gift voucher strictly represents a value towards a training course of the recipients choice. Our course prices may increase, in which case, the recipient will be required to pay a top up payment to attend the course of their choice.</p>
                    <p>This voucher has no part redemption value, and no refunds or credits will be given if the full value of the voucher is not used.</p>
                    <p>Upon contacting us, the recipient should provide us with the booking reference number on the top of their voucher, and verify their/her name. We will at this stage, update the client file with the recipients contact telephone number and email address for future correspondence regarding the course they are booking.</p>
                    <p>Once a convenient date has been agreed and booked, we will then send the recipient a booking confirmation via email, which will contain full details of your respective course.</p>
                    <p>Please contact us on the telephone number provided below as soon as possible to book your place in on your chosen course as soon as possible.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handlePreview}
                className="px-6 py-3 cursor-pointer bg-red-600 text-white rounded-lg hover:bg-blue-600 transition font-semibold shadow-sm"
              >
                Proceed
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Complete Payment</h2>
              <p className="text-sm text-slate-600">Voucher Reference: {voucherRef}</p>
            </div>

            {/* Voucher Summary */}
            <div className="bg-slate-50 rounded-lg p-4 mb-6">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Recipient:</span>
                  <span className="font-medium text-slate-900">{formData.recipientName}</span>
                </div>
                {formData.subject && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Gift Voucher For:</span>
                    <span className="font-medium text-slate-900">{formData.subject}</span>
                  </div>
                )}
                {formData.fieldText && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Message:</span>
                    <span className="font-medium text-slate-900">{formData.fieldText}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-600">Voucher Value:</span>
                  <span className="font-medium text-slate-900">£{voucherTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Voucher will be emailed to:</span>
                  <span className="font-medium text-slate-900">{formData.emailAddress}</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-base font-semibold">
                  <span className="text-slate-900">Total:</span>
                  <span className="text-slate-900">£{total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <Elements stripe={stripePromise}>
              <StripePaymentForm
                onCreatePaymentIntent={async () => {
                  if (!clientSecret || !voucherRef) {
                    return undefined;
                  }
                  return { clientSecret, bookingRef: voucherRef, bookingRefs: [voucherRef], paymentRequired: true };
                }}
                onSuccess={(refs) => {
                  window.location.href = `/gift-voucher/success?ref=${refs[0]}`;
                }}
                onCancel={(ref) => {
                  window.location.href = `/gift-voucher/cancel?ref=${ref || voucherRef}`;
                }}
                bookingRef={voucherRef}
                amount={Math.round(total * 100)}
              />
            </Elements>
          </div>
        )}
      </div>
    </div>
  );
}
