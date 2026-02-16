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
  recentBookings: Array<{ id: string; courseTitle: string; date: string; status: string; amount: number }>;
  upcomingCourses: Array<{ id: string; title: string; date: string; location: string }>;
  giftVouchers: Array<{ id: number; voucherRef: string; value: number; courseName: string; recipientName: string; validTill: string; status: string }>;
}

export default function Dashboard() {
  const { isAuthenticated, isLoading, token, logout } = useAuthStore();
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
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(result => {
          if (result.success === false || result.error) {
            logout();
            router.push('/auth/login');
          } else {
            const apiData = result.data || result;
            setData({
              user: apiData.user,
              stats: {
                totalBookings: apiData.stats.total_bookings,
                completed: apiData.stats.completed_bookings,
                pending: apiData.stats.pending_bookings,
                totalSpent: apiData.stats.total_spent
              },
              recentBookings: (apiData.recent_bookings || []).map((b: any) => ({
                id: b.id,
                courseTitle: b.course_name,
                date: b.event_date,
                status: b.status,
                amount: b.total_amount
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
            <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.pending}</div>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {data.recentBookings.map(booking => (
                <div key={booking.id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="text-sm font-medium">{booking.courseTitle}</p>
                    <p className="text-xs text-gray-500">{new Date(booking.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">£{booking.amount}</p>
                    <p className="text-xs text-gray-500">{booking.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

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