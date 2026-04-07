'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Attendee {
  id: number;
  first_name: string;
  sur_name: string;
  email: string;
  vehicle_type: string | number;
  primary: number;
}

interface BookingDetail {
  id: number;
  course_name: string;
  course_abb: string;
  description: string;
  event_date: string;
  event_start_time: string;
  location_name: string;
  address1: string;
  address2: string;
  postcode: string;
  location_phone: string;
  location_email: string;
  total_amount: number;
  admin_payment_received: number;
  payment_due: number;
  type_of_book: string;
  status: number;
  status_text: string;
  timing_status: string;
  transaction_id: string | null;
  created: string;
  modified: string;
  customer_notes: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  spaces: number;
  first_name: string;
  sur_name: string;
  email: string;
  mobile: string;
  attendees: Attendee[];
}

const statusConfig: Record<number, { label: string; className: string }> = {
  0: { label: 'Pending Payment', className: 'bg-yellow-100 text-yellow-800' },
  1: { label: 'Confirmed', className: 'bg-green-100 text-green-800' },
  2: { label: 'Completed', className: 'bg-blue-100 text-blue-800' },
  3: { label: 'Cancelled', className: 'bg-red-100 text-red-800' },
  4: { label: 'No Show', className: 'bg-gray-100 text-gray-800' },
};

const vehicleTypes: Record<string, string> = {
  '0': 'School vehicle (Manual)',
  '1': 'School vehicle (Automatic)',
  '3': 'Own vehicle'
};

function getVehicleTypeLabel(vehicleType: string | number | null | undefined) {
  if (vehicleType === null || vehicleType === undefined) return '';

  const raw = String(vehicleType).trim();
  if (!raw) return '';

  if (vehicleTypes[raw]) return vehicleTypes[raw];

  const numericCode = Number(raw);
  if (!Number.isNaN(numericCode) && vehicleTypes[String(numericCode)]) {
    return vehicleTypes[String(numericCode)];
  }

  return raw;
}

function InfoRow({ label, value }: Readonly<{ label: string; value?: string | number | null }>) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex justify-between items-start py-2 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500 shrink-0 mr-4">{label}</span>
      <span className="text-sm font-medium text-right">{value}</span>
    </div>
  );
}

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading, token, user } = useAuthStore();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCourseInfo, setShowCourseInfo] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmationHtml, setConfirmationHtml] = useState('');
  const [confirmationSubject, setConfirmationSubject] = useState('Booking confirmation');
  const [loadingConfirmation, setLoadingConfirmation] = useState(false);
  const [forwardEmail, setForwardEmail] = useState('');
  const [sendingConfirmation, setSendingConfirmation] = useState(false);
  const [sendStatusMessage, setSendStatusMessage] = useState<string | null>(null);
  const [sendStatusError, setSendStatusError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && token && params.id) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setBooking(data.data);
          } else {
            setError(data.message || 'Booking not found');
          }
        })
        .catch(() => setError('Failed to load booking details'))
        .finally(() => setLoading(false));
    }
  }, [isAuthenticated, token, params.id]);

  const openConfirmationPreview = async () => {
    if (!token || !params.id) return;
    setLoadingConfirmation(true);
    setSendStatusError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/${params.id}/confirmation/preview`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to load confirmation preview');
      }

      setConfirmationHtml(data.data?.html || '');
      setConfirmationSubject(data.data?.subject || 'Booking confirmation');
      setShowConfirmationModal(true);
    } catch (previewError) {
      setSendStatusError(previewError instanceof Error ? previewError.message : 'Failed to load confirmation preview');
    } finally {
      setLoadingConfirmation(false);
    }
  };

  const sendConfirmationEmail = async (email?: string) => {
    if (!token || !params.id) return;
    setSendingConfirmation(true);
    setSendStatusMessage(null);
    setSendStatusError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/${params.id}/confirmation/send`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(email ? { email } : {})
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to send confirmation email');
      }

      setSendStatusMessage(data.message || 'Booking confirmation sent');
      if (email) setForwardEmail('');
    } catch (sendError) {
      setSendStatusError(sendError instanceof Error ? sendError.message : 'Failed to send confirmation email');
    } finally {
      setSendingConfirmation(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mx-auto mb-4" />
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }
  if (error || !booking) {
    return (
      <div className="container mx-auto p-6 max-w-3xl">
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">{error || 'Booking not found'}</p>
          <Link href="/dashboard">
            <Button variant="outline">← Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const statusInfo = statusConfig[booking.status] ?? { label: `Status ${booking.status}`, className: 'bg-gray-100 text-gray-800' };
  const bookingRef = `${booking.type_of_book ? '1SRC' : '1SGV'}${booking.id}`;
  const isInactiveBooking = booking.status === 3 || booking.status === 4;
  const courseDate = booking.event_date ? new Date(booking.event_date).toLocaleDateString('en-GB') : '—';
  const bookedOn = booking.created ? new Date(booking.created).toLocaleDateString('en-GB') : '—';
  let resendButtonLabel = 'Re-send to me';
  if (user?.email) {
    resendButtonLabel = `Re-send to me`;
  }
  if (sendingConfirmation) {
    resendButtonLabel = 'Sending...';
  }

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <Link href="/dashboard">
          <Button variant="outline" className="text-sm">
            ← Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* Course title */}
      <div className="mb-6">
        <div className="flex items-baseline gap-2">
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">{booking.course_name}</h1>
          {booking.description && (
            <button
              type="button"
              onClick={() => setShowCourseInfo(true)}
              className="inline-flex items-center justify-center w-5 h-5 rounded-full text-indigo-500 hover:text-indigo-700 transition-colors shrink-0 translate-y-px"
              title="Course information"
            >
              <svg fill="currentColor" viewBox="0 0 488.484 488.484" className="w-5 h-5">
                <path d="M244.236,0.002C109.562,0.002,0,109.565,0,244.238c0,134.679,109.563,244.244,244.236,244.244c134.684,0,244.249-109.564,244.249-244.244C488.484,109.566,378.92,0.002,244.236,0.002z M244.236,413.619c-93.4,0-169.38-75.979-169.38-169.379c0-93.396,75.979-169.375,169.38-169.375s169.391,75.979,169.391,169.375C413.627,337.641,337.637,413.619,244.236,413.619z" />
                <path d="M244.236,206.816c-14.757,0-26.619,11.962-26.619,26.73v118.709c0,14.769,11.862,26.735,26.619,26.735c14.769,0,26.62-11.967,26.62-26.735V233.546C270.855,218.778,259.005,206.816,244.236,206.816z" />
                <path d="M244.236,107.893c-19.949,0-36.102,16.158-36.102,36.091c0,19.934,16.152,36.092,36.102,36.092c19.929,0,36.081-16.158,36.081-36.092C280.316,124.051,264.165,107.893,244.236,107.893z" />
              </svg>
            </button>
          )}
        </div>
        <p className="text-gray-500 mt-1">Booking Ref: <span className="font-medium text-gray-700">{bookingRef}</span></p>
      </div>

      {/* Booking summary banner */}
      <div className={`rounded-xl p-6 mb-6 ${isInactiveBooking ? 'bg-gray-100' : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'}`}>
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <p className={`text-sm font-medium ${isInactiveBooking ? 'text-gray-500' : 'text-indigo-100'}`}>Total Amount</p>
            <p className={`text-4xl font-bold mt-1 ${isInactiveBooking ? 'text-gray-500' : 'text-white'}`}>
              £{Number(booking.total_amount).toFixed(2)}
            </p>
            <p className={`text-sm mt-2 ${isInactiveBooking ? 'text-gray-500' : 'text-indigo-100'}`}>
              Course date: {courseDate} {booking.event_start_time ? `at ${booking.event_start_time}` : ''}
            </p>
          </div>

          <div className="md:text-right">
            <p className={`text-sm font-medium mb-2 ${isInactiveBooking ? 'text-gray-500' : 'text-indigo-100'}`}>
              Attendee{booking.attendees?.length > 1 ? 's' : ''}
            </p>
            <div className="space-y-1">
              {booking.attendees?.map(att => (
                <div key={att.id} className={`${isInactiveBooking ? 'text-gray-600' : 'text-white'}`}>
                  <p className="text-sm font-medium">
                    {att.first_name} {att.sur_name}
                    {att.primary === 1 ? ' (Primary)' : ''}
                  </p>
                  {att.vehicle_type !== null && att.vehicle_type !== undefined && (
                    <p className={`text-xs ${isInactiveBooking ? 'text-gray-500' : 'text-indigo-100'}`}>
                      {getVehicleTypeLabel(att.vehicle_type)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Course & Event */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-700">Course Details</CardTitle>
          </CardHeader>
          <CardContent>
            <InfoRow label="Course" value={booking.course_name} />
            {booking.course_abb && <InfoRow label="Abbreviation" value={booking.course_abb} />}
            <InfoRow
              label="Course Date"
              value={courseDate}
            />
            <InfoRow label="Start Time" value={booking.event_start_time} />
            <InfoRow label="Spaces" value={booking.spaces} />
            <InfoRow label="Booked On" value={bookedOn} />
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-700">Location</CardTitle>
          </CardHeader>
          <CardContent>
            <InfoRow label="Venue" value={booking.location_name} />
            <div className='py-2 border-b border-gray-50 last:border-0'>
                <div className='flex justify-between items-start'>
                    <span className='text-sm text-gray-500 shrink-0 mr-4'>Address</span>
                    <span className='text-sm font-medium text-right'>{booking.address1}</span>
                </div>
                <p className='text-sm font-medium text-right'>{booking.address2}</p>
            </div>
            <InfoRow label="Postcode" value={booking.postcode} />
            {booking.location_phone && <InfoRow label="Phone" value={booking.location_phone} />}
            {booking.location_email && <InfoRow label="Email" value={booking.location_email} />}
          </CardContent>
        </Card>

        {/* Payment */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-700">Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <InfoRow label="Total Price" value={`£${Number(booking.total_amount).toFixed(2)}`} />
            <InfoRow label="Amount Paid" value={`£${Number(booking.admin_payment_received ?? 0).toFixed(2)}`} />
            <InfoRow label="Balance Due" value={`£${Number(booking.payment_due ?? 0).toFixed(2)}`} />
            {booking.transaction_id && (<InfoRow label="Transaction Id" value={booking.transaction_id} />)}

          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-700">Booking Confirmation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col md:flex-row gap-2 md:items-center">
                <Button type="button" variant="outline" onClick={openConfirmationPreview} disabled={loadingConfirmation || sendingConfirmation}>
                  {loadingConfirmation ? 'Loading Preview...' : 'View Confirmation'}
                </Button>
                <Button
                  type="button"
                  onClick={() => sendConfirmationEmail()}
                  disabled={sendingConfirmation || loadingConfirmation}
                >
                  {resendButtonLabel}
                </Button>
              </div>

              <div className="flex flex-col md:flex-row gap-2 md:items-center">
                <input
                  type="email"
                  value={forwardEmail}
                  onChange={(e) => setForwardEmail(e.target.value)}
                  placeholder="Forward confirmation to email@example.com"
                  className="w-full md:flex-1 h-10 rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={sendingConfirmation || loadingConfirmation || !forwardEmail.trim()}
                  onClick={() => sendConfirmationEmail(forwardEmail.trim())}
                >
                  Forward
                </Button>
              </div>

              {sendStatusMessage && <p className="text-sm text-green-600">{sendStatusMessage}</p>}
              {sendStatusError && <p className="text-sm text-red-600">{sendStatusError}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        {(booking.customer_notes || booking.emergency_contact_name || booking.emergency_contact_phone) && (
          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-gray-700">Additional Information</CardTitle>
            </CardHeader>
            <CardContent>
              {booking.customer_notes && <InfoRow label="Notes" value={booking.customer_notes} />}
              {booking.emergency_contact_name && <InfoRow label="Emergency Contact" value={booking.emergency_contact_name} />}
              {booking.emergency_contact_phone && <InfoRow label="Emergency Phone" value={booking.emergency_contact_phone} />}
            </CardContent>
          </Card>
        )}
      </div>

      {showCourseInfo && booking.description && (
        <>
          <button
            type="button"
            aria-label="Close course info"
            className="fixed inset-0 bg-black/50 z-50 w-full h-full cursor-default"
            onClick={() => setShowCourseInfo(false)}
          />
          <dialog
            open
            className="fixed inset-0 bg-transparent z-50 flex items-center justify-center p-4 w-screen h-screen max-w-none m-0"
          >
            <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="flex items-start justify-between p-6 border-b border-slate-200">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-slate-900">{booking.course_name}</h3>
                  <p className="text-sm text-slate-500 mt-1">Course Information</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCourseInfo(false)}
                  className="ml-4 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <div
                  className="prose prose-sm sm:prose max-w-none prose-headings:text-slate-900 prose-headings:font-semibold prose-p:text-slate-700 prose-p:leading-relaxed prose-ul:text-slate-700 prose-ol:text-slate-700 prose-li:text-slate-700 prose-strong:text-slate-900 prose-strong:font-semibold prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5"
                  dangerouslySetInnerHTML={{ __html: booking.description }}
                />
              </div>
            </div>
          </dialog>
        </>
      )}

      {showConfirmationModal && (
        <>
          <button
            type="button"
            aria-label="Close confirmation preview"
            className="fixed inset-0 bg-black/50 z-50 w-full h-full cursor-default"
            onClick={() => setShowConfirmationModal(false)}
          />
          <dialog
            open
            className="fixed inset-0 bg-transparent z-50 flex items-center justify-center p-4 w-screen h-screen max-w-none m-0"
          >
            <div className="bg-white rounded-2xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="flex items-start justify-between p-6 border-b border-slate-200">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-slate-900">{confirmationSubject}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowConfirmationModal(false)}
                  className="ml-4 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto bg-gray-100 p-4">
                <iframe
                  title="Booking confirmation preview"
                  srcDoc={confirmationHtml}
                  className="w-full h-[70vh] rounded-lg bg-white border border-gray-200"
                />
              </div>
            </div>
          </dialog>
        </>
      )}
    </div>
  );
}
