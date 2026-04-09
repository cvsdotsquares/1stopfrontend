'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface VoucherDetail {
  id: number;
  voucher_ref: string;
  voucher_date: string;
  course_name: string;
  recipient_name: string;
  message: string;
  value: number;
  purchased_by: string;
  contact_number: string;
  email: string;
  user_id: number;
  created: string;
  valid_till: string;
  voucher_type: 'purchased' | 'received';
  status: 'active' | 'redeemed' | 'expired';
}

const statusConfig: Record<string, { label: string; className: string }> = {
  active: { label: 'Active', className: 'bg-green-100 text-green-800' },
  redeemed: { label: 'Redeemed', className: 'bg-blue-100 text-blue-800' },
  expired: { label: 'Expired', className: 'bg-red-100 text-red-800' },
};

function InfoRow({ label, value }: Readonly<{ label: string; value?: string | number | null }>) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex justify-between items-start py-2 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500 shrink-0 mr-4">{label}</span>
      <span className="text-sm font-medium text-right">{value}</span>
    </div>
  );
}

export default function GiftVoucherDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading, token, user } = useAuthStore();
  const [voucher, setVoucher] = useState<VoucherDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmationHtml, setConfirmationHtml] = useState('');
  const [confirmationSubject, setConfirmationSubject] = useState('Gift voucher confirmation');
  const [loadingConfirmation, setLoadingConfirmation] = useState(false);
  const [sendingConfirmation, setSendingConfirmation] = useState(false);
  const [forwardEmail, setForwardEmail] = useState('');
  const [sendStatusMessage, setSendStatusMessage] = useState<string | null>(null);
  const [sendStatusError, setSendStatusError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && token && params.id) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/vouchers/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setVoucher(data.data);
          } else {
            setError(data.error || 'Voucher not found');
          }
        })
        .catch(() => setError('Failed to load voucher details'))
        .finally(() => setLoading(false));
    }
  }, [isAuthenticated, token, params.id]);

  const openConfirmationPreview = async () => {
    if (!token || !params.id) return;
    setLoadingConfirmation(true);
    setSendStatusError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vouchers/${params.id}/confirmation/preview`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to load confirmation preview');
      }

      setConfirmationHtml(data.data?.html || '');
      setConfirmationSubject(data.data?.subject || 'Gift voucher confirmation');
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vouchers/${params.id}/confirmation/send`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(email ? { email } : {})
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to send confirmation email');
      }

      setSendStatusMessage(data.message || 'Gift voucher confirmation sent');
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
          <p className="text-gray-600">Loading voucher details...</p>
        </div>
      </div>
    );
  }

  if (error || !voucher) {
    return (
      <div className="container mx-auto p-6 max-w-3xl">
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">{error || 'Voucher not found'}</p>
          <Link href="/dashboard">
            <Button variant="outline">← Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const statusInfo = statusConfig[voucher.status] ?? { label: voucher.status, className: 'bg-gray-100 text-gray-800' };
  const isExpired = voucher.status === 'expired';
  const validTillDate = voucher.valid_till ? new Date(voucher.valid_till).toLocaleDateString('en-GB') : '—';
  const purchasedDate = voucher.created ? new Date(voucher.created).toLocaleDateString('en-GB') : '—';
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

      {/* Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gift Voucher</h1>
        <p className="text-gray-500 mt-1">
          Ref: <span className="font-medium text-gray-700">{voucher.voucher_ref}</span>
        </p>
      </div>

      {/* Voucher value banner */}
      <div className={`rounded-xl p-6 mb-6 flex items-center justify-between ${isExpired ? 'bg-gray-100' : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'}`}>
        <div>
          <p className={`text-sm font-medium ${isExpired ? 'text-gray-500' : 'text-indigo-100'}`}>Voucher Value</p>
          <p className={`text-4xl font-bold mt-1 ${isExpired ? 'text-gray-400' : 'text-white'}`}>
            £{Number(voucher.value).toFixed(2)}
          </p>
        </div>
        <div className="text-right">
          <p className={`text-sm ${isExpired ? 'text-gray-500' : 'text-indigo-100'}`}>
            {voucher.voucher_type === 'purchased' ? 'Purchased by you' : 'Received'}
          </p>
          <p className={`text-sm mt-1 ${isExpired ? 'text-red-500 font-medium' : 'text-indigo-100'}`}>
            {isExpired ? 'Expired' : `Valid until ${validTillDate}`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Voucher Info */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-700">Voucher Details</CardTitle>
          </CardHeader>
          <CardContent>
            <InfoRow label="Reference" value={voucher.voucher_ref} />
            <InfoRow label="Course / Subject" value={voucher.course_name} />
            <InfoRow label="Purchased On" value={purchasedDate} />
            <InfoRow label="Valid Until" value={validTillDate} />
            {voucher.message && <InfoRow label="Personal Message" value={voucher.message} />}
          </CardContent>
        </Card>

        {/* Recipient */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-700">Recipient</CardTitle>
          </CardHeader>
          <CardContent>
            <InfoRow label="Recipient Name" value={voucher.recipient_name} />
            <InfoRow label="Recipient Email" value={voucher.email} />
          </CardContent>
        </Card>

        {/* Purchaser */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-700">Purchaser Details</CardTitle>
          </CardHeader>
          <CardContent>
            <InfoRow label="Purchased By" value={voucher.purchased_by} />
            {voucher.contact_number && (
              <InfoRow label="Contact Number" value={voucher.contact_number} />
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-700">Gift Voucher Confirmation</CardTitle>
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
      </div>

      {showConfirmationModal && (
        <>
          <button
            type="button"
            aria-label="Close gift voucher confirmation preview"
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
                  title="Gift voucher confirmation preview"
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
