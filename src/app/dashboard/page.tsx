'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface DashboardData {
  user: { id: string; name: string; email: string };
  stats: { totalBookings: number; completed: number; pending: number; totalSpent: number };
  recentBookings: Array<{
    id: string;
    courseTitle: string;
    type_of_book: any;
    first_name: string;
    sur_name: string;
    event_start_time: string;
    payment_due: any;
    admin_payment_received: any;
    date: string;
    status: number;
    amount: number;
    locationName: string;
    address1: string;
    address2: string;
    postcode: string;
    transactionId: string | null;
    created: string;
    booking_id: number;
    secondary_attendees?: Array<{
      booking_id: number;
      booking_ref: string;
      first_name: string;
      sur_name: string;
      email: string;
      payment_due: number;
      admin_payment_received: number;
      total_fees: number;
    }>;
  }>;
  upcomingCourses: Array<{
    id: string;
    title: string;
    booking_id: number;
    first_name: string;
    sur_name: string;
    date: string;
    location: string;
    secondary_attendees?: Array<{
      booking_id: number;
      booking_ref: string;
      first_name: string;
      sur_name: string;
      email: string;
      payment_due: number;
      admin_payment_received: number;
      total_fees: number;
    }>;
  }>;
  giftVouchers: Array<{ id: number; voucherRef: string; value: number; courseName: string; recipientName: string; validTill: string; status: string; redeemed: string }>;
}

export default function Dashboard() {
  const { isAuthenticated, isLoading, token, logout, setUser } = useAuthStore();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && token) {
      // Fetch both dashboard data and user profile to get accurate first_name/last_name
      Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        }).then(res => res.json()),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        }).then(res => res.json())
      ])
        .then(([dashboardResult, profileResult]) => {
          if (dashboardResult.success === false || dashboardResult.error) {
            logout();
            router.push('/auth/login');
          } else {
            const apiData = dashboardResult.data || dashboardResult;
            const profileData = profileResult.success ? profileResult.data : null;

            // Update Zustand store with latest user data from profile API (more accurate)
            if (profileData) {
              const userForStore = {
                id: profileData.id,
                first_name: profileData.first_name || '',
                last_name: profileData.last_name || '',
                email: profileData.email,
                phone: profileData.phone || '',
                date_of_birth: profileData.date_of_birth,
                license_number: profileData.license_number,
                license_type: profileData.license_type,
                theory_number: profileData.theory_number,
                address_line1: profileData.address_line1,
                address_line2: profileData.address_line2,
                city: profileData.city,
                postcode: profileData.postcode,
                created: profileData.created || profileData.created_at || '',
                updated: profileData.updated || profileData.updated_at || ''
              };
              setUser(userForStore);
            } else if (apiData.user) {
              // Fallback to dashboard API if profile fetch fails
              const userForStore = {
                id: apiData.user.id,
                first_name: apiData.user.first_name || apiData.user.name?.split(' ')[0] || '',
                last_name: apiData.user.last_name || apiData.user.name?.split(' ').slice(1).join(' ') || '',
                email: apiData.user.email,
                phone: apiData.user.phone || '',
                date_of_birth: apiData.user.date_of_birth,
                license_number: apiData.user.license_number,
                license_type: apiData.user.license_type,
                theory_number: apiData.user.theory_number,
                address_line1: apiData.user.address_line1,
                address_line2: apiData.user.address_line2,
                city: apiData.user.city,
                postcode: apiData.user.postcode,
                created: apiData.user.created || apiData.user.created_at || '',
                updated: apiData.user.updated || apiData.user.updated_at || ''
              };
              setUser(userForStore);
            }

            setData({
              user: profileData ? {
                id: profileData.id,
                name: `${profileData.first_name} ${profileData.last_name}`.trim(),
                email: profileData.email
              } : apiData.user,
              stats: {
                totalBookings: apiData.stats.total_bookings,
                completed: apiData.stats.completed_bookings,
                pending: apiData.stats.pending_bookings,
                totalSpent: apiData.stats.total_spent
              },
              recentBookings: (apiData.recent_bookings || []).map((b: any) => ({
                id: b.id,
                first_name: b.first_name || '',
                last_name: b.last_name || b.sur_name || '',
                sur_name: b.last_name || b.sur_name || '',
                booking_ref: b.booking_ref || '',
                courseTitle: b.course_name,
                type_of_book: b.type_of_book,
                date: b.event_date,
                status: b.status,
                amount: b.total_amount,
                admin_payment_received: b.admin_payment_received,
                payment_due: b.payment_due,
                event_start_time: b.event_start_time,
                locationName: b.location_name,
                address1: b.address1,
                address2: b.address2,
                postcode: b.postcode,
                transactionId: b.transaction_id,
                created: b.created,
                booking_id: b.booking_id,
                secondary_attendees: b.secondary_attendees || []
              })),
              upcomingCourses: (apiData.upcoming_courses || []).map((c: any) => ({
                id: c.booking_id,
                title: c.course_name,
                first_name: c.first_name || '',
                last_name: c.last_name || c.sur_name || '',
                sur_name: c.last_name || c.sur_name || '',
                booking_ref: c.booking_ref || '',
                booking_id: c.booking_id,
                date: c.event_date,
                location: `${c.location_name || ''}, ${c.postcode || ''}`.trim().replaceAll(/^,\s*|,\s*$/g, ''),
                secondary_attendees: c.secondary_attendees || []
              })),
              giftVouchers: (apiData.gift_vouchers || []).map((v: any) => ({
                id: v.id,
                voucherRef: v.voucher_ref,
                value: v.voucher_value,
                courseName: v.course_name,
                recipientName: v.recipient_name,
                validTill: v.valid_till,
                status: v.status,
                redeemed: v.redeemed
              }))
            });
          }
        })
        .catch(err => {
          console.error('Dashboard fetch error:', err);
          logout();
          router.push('/auth/login');
        })
        .finally(() => setLoading(false));
    } else if (!isLoading && !isAuthenticated) {
      setLoading(false);
    }
  }, [isAuthenticated, token, isLoading, logout, router]);

  if (isLoading || loading || !data) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  const currentGiftVouchers = data.giftVouchers.filter(voucher =>
    String(voucher.redeemed || '').trim().toLowerCase() !== 'yes'
  );
  const expiredGiftVouchers = data.giftVouchers.filter(voucher =>
    String(voucher.redeemed || '').trim().toLowerCase() === 'yes'
  );

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {data.user.name}</h1>
          <p className="text-gray-600 mt-2">{data.user.email}</p>
        </div>
        <Link href="/users/myaccount">
          <Button>My Account</Button>
        </Link>
      </div>

      {/* Stats Cards */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.totalBookings}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.completed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{data.stats.totalSpent}</div>
          </CardContent>
        </Card>
      </div> */}

      {/* Recent Bookings & Upcoming Courses */}
      <h2 className="text-2xl font-semibold mb-4">Courses</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 relative items-stretch">
        <div className="overflow-visible h-full">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle>Previous Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {!data.recentBookings || data.recentBookings.length === 0 ? (
              <p className="text-sm text-gray-500">No previous bookings found.</p>
            ) : (
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {data.recentBookings.map(booking => (
                <Link key={booking.id} href={`/dashboard/bookings/${booking.id}`} className="block">
                  <div className="flex justify-between items-center border-b pb-2 hover:bg-gray-50 p-2 rounded transition-colors cursor-pointer">
                    <div>
                      <p className="text-sm font-medium">{booking.courseTitle}</p>
                      <p className="text-xs text-gray-500">{`${booking.first_name} ${booking.sur_name}`} <span className="text-gray-400">•</span> {` 1SRC${booking.id}`}</p>
                      <p className="text-xs text-gray-500">{new Date(booking.date).toLocaleDateString('en-GB')}</p>
                      {booking.secondary_attendees && booking.secondary_attendees.length > 0 && (
                        <div className="mt-1 space-y-1">
                          {booking.secondary_attendees.map((secondary) => (
                            <div key={`${booking.id}-${secondary.booking_id}`} className="text-xs text-gray-600 flex flex-wrap items-center gap-1">
                              <span className="inline-flex items-center rounded-full bg-purple-100 text-purple-700 px-2 py-0.5 text-[10px] font-medium">Secondary</span>
                              <span>{secondary.first_name} {secondary.sur_name}</span>
                              <span className="text-gray-400">•</span>
                              <span>{secondary.booking_ref || `1SRC${secondary.booking_id}`}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-bold">£{booking.amount}</p>
                        {/* <p className="text-xs text-gray-500">{booking.status === 1 ? 'Confirmed' : booking.status === 3 ? 'Pending' : 'Status ' + booking.status}</p> */}
                      </div>
                      <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            )}
          </CardContent>
        </Card>
        </div>

        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle>Upcoming Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {!data.upcomingCourses || data.upcomingCourses.length === 0 ? (
              <p className="text-sm text-gray-500">No upcoming bookings found.</p>
            ) : (
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {data.upcomingCourses.map(course => (
                <Link key={course.id} href={`/dashboard/bookings/${course.id}`} className="block">
                  <div className="flex justify-between items-center border-b pb-2 hover:bg-gray-50 p-2 rounded transition-colors cursor-pointer">
                    <div>
                      <p className="text-sm font-medium">{course.title}</p>
                      <p className="text-xs text-gray-500">{`${course.first_name} ${course.sur_name}`} <span className="text-gray-400">•</span> {` 1SRC${course.booking_id}`}</p>
                      <p className="text-xs text-gray-500">{new Date(course.date).toLocaleDateString('en-GB')} - {course.location}</p>
                      {course.secondary_attendees && course.secondary_attendees.length > 0 && (
                        <div className="mt-1 space-y-1">
                          {course.secondary_attendees.map((secondary) => (
                            <div key={`${course.id}-${secondary.booking_id}`} className="text-xs text-gray-600 flex flex-wrap items-center gap-1">
                              <span className="inline-flex items-center rounded-full bg-purple-100 text-purple-700 px-2 py-0.5 text-[10px] font-medium">Secondary</span>
                              <span>{secondary.first_name} {secondary.sur_name}</span>
                              <span className="text-gray-400">•</span>
                              <span>{secondary.booking_ref || `1SRC${secondary.booking_id}`}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gift Vouchers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle>Current Gift Vouchers</CardTitle>
          </CardHeader>
          <CardContent>
            {currentGiftVouchers.length === 0 ? (
              <p className="text-sm text-gray-500">No current gift vouchers.</p>
            ) : (
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {currentGiftVouchers.map(voucher => (
                  <Link key={voucher.id} href={`/dashboard/gift-vouchers/${voucher.id}`} className="block">
                    <div className="flex justify-between items-center border-b pb-2 hover:bg-gray-50 p-2 rounded transition-colors cursor-pointer">
                      <div>
                        <p className="text-sm font-medium">{voucher.voucherRef}</p>
                        <p className="text-xs text-gray-500">{voucher.courseName} - {voucher.recipientName}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-bold">£{voucher.value}</p>
                        </div>
                        <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle>Expired Gift Vouchers</CardTitle>
          </CardHeader>
          <CardContent>
            {expiredGiftVouchers.length === 0 ? (
              <p className="text-sm text-gray-500">No expired gift vouchers.</p>
            ) : (
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {expiredGiftVouchers.map(voucher => (
                  <Link key={voucher.id} href={`/dashboard/gift-vouchers/${voucher.id}`} className="block">
                    <div className="flex justify-between items-center border-b pb-2 hover:bg-gray-50 p-2 rounded transition-colors cursor-pointer">
                      <div>
                        <p className="text-sm font-medium">{voucher.voucherRef}</p>
                        <p className="text-xs text-gray-500">{voucher.courseName} - {voucher.recipientName}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-bold">£{voucher.value}</p>
                        </div>
                        <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}