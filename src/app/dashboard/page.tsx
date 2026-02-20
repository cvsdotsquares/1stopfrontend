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
    date: string;
    status: string;
    amount: number;
    locationName: string;
    address1: string;
    address2: string;
    postcode: string;
    transactionId: string | null;
    created: string;
  }>;
  upcomingCourses: Array<{ id: string; title: string; date: string; location: string }>;
  giftVouchers: Array<{ id: number; voucherRef: string; value: number; courseName: string; recipientName: string; validTill: string; status: string }>;
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
                emergency_contact_name: profileData.emergency_contact_name,
                emergency_contact_phone: profileData.emergency_contact_phone,
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
                emergency_contact_name: apiData.user.emergency_contact_name,
                emergency_contact_phone: apiData.user.emergency_contact_phone,
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
                totalSpent: apiData.stats.total_spent
              },
              recentBookings: (apiData.recent_bookings || []).map((b: any) => ({
                id: b.id,
                courseTitle: b.course_name,
                date: b.event_date,
                status: b.status,
                amount: b.total_amount,
                locationName: b.location_name,
                address1: b.address1,
                address2: b.address2,
                postcode: b.postcode,
                transactionId: b.transaction_id,
                created: b.created
              })),
              upcomingCourses: (apiData.upcoming_courses || []).map((c: any) => ({
                id: c.booking_id,
                title: c.course_name,
                date: c.event_date,
                location: `${c.location_name || ''}, ${c.postcode || ''}`.trim().replace(/^,\s*|,\s*$/g, '')
              })),
              giftVouchers: (apiData.gift_vouchers || []).map((v: any) => ({
                id: v.id,
                voucherRef: v.voucher_ref,
                value: v.voucher_value,
                courseName: v.course_name,
                recipientName: v.recipient_name,
                validTill: v.valid_till,
                status: v.status
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
      </div>

      {/* Recent Bookings & Upcoming Courses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 relative">
        <div className="overflow-visible">
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {data.recentBookings.map(booking => (
                <div key={booking.id} className="group relative flex justify-between items-center border-b pb-2 hover:bg-gray-50 p-2 rounded transition-colors cursor-pointer">
                  <div>
                    <p className="text-sm font-medium">{booking.courseTitle}</p>
                    <p className="text-xs text-gray-500">{new Date(booking.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">£{booking.amount}</p>
                    <p className="text-xs text-gray-500">{booking.status === 1 ? 'Confirmed' : booking.status === 3 ? 'Pending' : 'Status ' + booking.status}</p>
                  </div>

                  {/* Tooltip - using fixed positioning */}
                  <div className="fixed w-80 bg-white border border-gray-200 rounded-lg shadow-2xl p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none group-hover:pointer-events-auto" style={{ zIndex: 9999, transform: 'translateY(10px)' }}>
                    <h4 className="font-semibold text-sm mb-2 border-b pb-2">Booking Details</h4>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Booking ID:</span>
                        <span className="font-medium">#{booking.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Course:</span>
                        <span className="font-medium">{booking.courseTitle}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Event Date:</span>
                        <span className="font-medium">{new Date(booking.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Location:</span>
                        <span className="font-medium">{booking.locationName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Address:</span>
                        <span className="font-medium text-right">{booking.address1}, {booking.address2}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Postcode:</span>
                        <span className="font-medium">{booking.postcode}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-medium">£{booking.amount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className="font-medium">{booking.status === 1 ? 'Confirmed' : booking.status === 3 ? 'Pending' : 'Status ' + booking.status}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Booked On:</span>
                        <span className="font-medium">{new Date(booking.created).toLocaleDateString()}</span>
                      </div>
                      {booking.transactionId && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Transaction:</span>
                          <span className="font-medium text-xs truncate max-w-[180px]" title={booking.transactionId}>{booking.transactionId}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {data.upcomingCourses.map(course => (
                <div key={course.id} className="border-b pb-2">
                  <p className="text-sm font-medium">{course.title}</p>
                  <p className="text-xs text-gray-500">{new Date(course.date).toLocaleDateString()} - {course.location}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gift Vouchers */}
      {data.giftVouchers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Gift Vouchers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {data.giftVouchers.map(voucher => (
                <div key={voucher.id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="text-sm font-medium">{voucher.voucherRef}</p>
                    <p className="text-xs text-gray-500">{voucher.courseName} - {voucher.recipientName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">£{voucher.value}</p>
                    <p className="text-xs text-gray-500">Valid till: {new Date(voucher.validTill).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}