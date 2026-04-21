'use client';

// Helper to format date as dd/mm/yyyy, treating '0000-00-00' and similar as empty
function formatDateOfBirth(dateString?: string) {
  if (!dateString || dateString === '0000-00-00' || dateString.startsWith('0000')) return '';
  // Also treat 1899-11-30 and similar as empty (Excel/JS epoch bug)
  if (dateString === '1899-11-30' || dateString === '30/11/1899') return '';
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime()) || d.getFullYear() < 1900) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { encryptPassword } from '@/lib/encryption';

interface UserProfile {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  phone2?: string;
  phone3?: string;
  date_of_birth?: string;
  license_number?: string;
  license_type?: string | number;
  theory_number?: string;
  address?: {
    street?: string;
    city?: string;
    postcode?: string;
    country?: string;
  };
  created_at: string;
}
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const LICENSE_TYPE_API = `${BASE_URL}/booking/license-types`;

export default function MyAccount() {

  const { isAuthenticated, isLoading, token, logout, setUser } = useAuthStore();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [licenseTypes, setLicenseTypes] = useState<Record<string, string>>({});
    // Fetch license types for mapping
    useEffect(() => {
      fetch(LICENSE_TYPE_API)
        .then(res => res.json())
        .then(data => {
          if (data.licenseTypes) setLicenseTypes(data.licenseTypes);
        });
    }, []);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(result => {
          if (result.success) {
            setProfile(result.data);
            setFormData(result.data);
          } else {
            toast.error('Failed to load profile');
          }
        })
        .catch(() => toast.error('Error loading profile'))
        .finally(() => setLoading(false));
    }
  }, [isAuthenticated, token]);

  const handleSave = async () => {
    // Validate UK phone number (must start with 07 and be exactly 11 digits)
    if (formData.phone && !/^07\d{9}$/.test(formData.phone)) {
      toast.error('Phone number must start with 07 and be exactly 11 digits');
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      const result = await res.json();
      if (result.success) {
        setProfile(result.data);
        setEditing(false);
        // Update Zustand store to reflect changes in Header and other components
        setUser(result.data);
        toast.success('Profile updated successfully');
      } else {
        toast.error(result.message || 'Failed to update profile');
      }
    } catch {
      toast.error('Error updating profile');
    }
  };

  const handlePasswordUpdate = async () => {
    if (!currentPassword.trim()) {
      toast.error('Password cannot be empty or contain only spaces');
      return;
    }
    if (!newPassword.trim()) {
      toast.error('Password cannot be empty or contain only spaces');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: encryptPassword(currentPassword),
          newPassword: encryptPassword(newPassword)
        })
      });
      const result = await res.json();
      if (result.success) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        toast.success('Password updated successfully');
      } else {
        toast.error(result.message || 'Failed to update password');
      }
    } catch {
      toast.error('Error updating password');
    }
  };

  if (isLoading || loading || !profile) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
          <p className="mt-2 text-gray-600">
            Manage your account settings and view your training progress
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="bg-white rounded-lg shadow-sm overflow-hidden">
              <ul className="divide-y divide-gray-200">
                <li>
                  <Link
                    href="/users/myaccount"
                    className="block px-4 py-3 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                  >
                    Account Overview
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard"
                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => {
                      logout();
                      router.push('/');
                    }}
                    className="block w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Logout
                  </button>
                </li>
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Details */}
            <Card>

                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Profile Information</CardTitle>
                  {editing ? (
                    <div className="space-x-2">
                      <Button onClick={handleSave}>Save</Button>
                      <Button onClick={() => { setEditing(false); setFormData(profile || {}); }} variant="outline">Cancel</Button>
                    </div>
                  ) : (
                    <Button onClick={() => setEditing(true)} variant="outline">Edit Profile</Button>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className='mb-1'>First Name</Label>
                    <Input
                      value={editing ? (formData.first_name || '') : (profile.first_name || '')}
                      onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                      disabled={!editing}
                    />
                  </div>
                  <div>
                    <Label className='mb-1'>Last Name</Label>
                    <Input
                      value={editing ? (formData.last_name || '') : (profile.last_name || '')}
                      onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                      disabled={!editing}
                    />
                  </div>
                  <div>
                    <Label className='mb-1'>Email</Label>
                    <Input value={profile.email || ''} disabled />
                  </div>
                  <div>
                    <Label className='mb-1'>Phone</Label>
                    <Input
                      value={editing ? (formData.phone || '') : (profile.phone || '')}
                      maxLength={11}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      disabled={!editing}
                    />
                  </div>
                  <div>
                    <Label className='mb-1'>Alternative Phone</Label>
                    <Input
                      value={editing ? (formData.phone2 || '') : (profile.phone2 || '')}
                      maxLength={11}
                      onChange={(e) => setFormData({...formData, phone2: e.target.value})}
                      disabled={!editing}
                    />
                  </div>
                  {/* Date of Birth */}
                  <div>
                    <Label className='mb-1'>Date of Birth</Label>
                    {(() => {
                      let dobValue = '';
                      if (editing) {
                        dobValue = formData.date_of_birth ? formData.date_of_birth.slice(0, 10) : '';
                      } else {
                        dobValue = formatDateOfBirth(profile.date_of_birth);
                      }
                      return (
                        <Input
                          type={editing ? 'date' : 'text'}
                          value={dobValue}
                          onChange={editing ? (e) => setFormData({ ...formData, date_of_birth: e.target.value }) : undefined}
                          disabled={!editing}
                        />
                      );
                    })()}
                  </div>
                  {/* Driving Licence Number */}
                  <div>
                    <Label className='mb-1'>Driving Licence Number</Label>
                    <Input
                      value={editing ? (formData.license_number || '') : (profile.license_number || '')}
                      onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                      disabled={!editing}
                    />
                  </div>
                  {/* Driving Licence Type */}
                  <div>
                    <Label className='mb-1'>Driving Licence Type</Label>
                    {editing ? (
                      <select
                        className="block w-full border rounded px-3 py-2"
                        value={formData.license_type ? String(formData.license_type) : ''}
                        onChange={e => setFormData({ ...formData, license_type: e.target.value })}
                      >
                        <option value="">Select Licence Type</option>
                        {Object.entries(licenseTypes).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    ) : (
                      <Input
                        value={licenseTypes[String(profile.license_type ?? '')] || profile.license_type || ''}
                        disabled
                      />
                    )}
                  </div>
                </div>

                {/* <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-semibold">Address</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label className='mb-1'>Street</Label>
                      <Input
                        value={editing ? (formData.address?.street || '') : (profile.address?.street || '')}
                        onChange={(e) => setFormData({...formData, address: {...(formData.address || {}), street: e.target.value}})}
                        disabled={!editing}
                      />
                    </div>
                    <div>
                      <Label className='mb-1'>City</Label>
                      <Input
                        value={editing ? (formData.address?.city || '') : (profile.address?.city || '')}
                        onChange={(e) => setFormData({...formData, address: {...(formData.address || {}), city: e.target.value}})}
                        disabled={!editing}
                      />
                    </div>
                    <div>
                      <Label className='mb-1'>Postcode</Label>
                      <Input
                        value={editing ? (formData.address?.postcode || '') : (profile.address?.postcode || '')}
                        onChange={(e) => setFormData({...formData, address: {...(formData.address || {}), postcode: e.target.value}})}
                        disabled={!editing}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label className='mb-1'>Country</Label>
                      <Input
                        value={editing ? (formData.address?.country || '') : (profile.address?.country || '')}
                        onChange={(e) => setFormData({...formData, address: {...(formData.address || {}), country: e.target.value}})}
                        disabled={!editing}
                      />
                    </div>
                  </div>
                </div> */}
              </CardContent>
            </Card>

            {/* Change Password */}
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className='mb-1'>Current Password</Label>
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                  />
                </div>
                <div>
                  <Label className='mb-1'>New Password</Label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 8 characters)"
                  />
                </div>
                <div>
                  <Label className='mb-1'>Confirm New Password</Label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>
                <Button onClick={handlePasswordUpdate} className='rounded-tl-lg rounded-br-lg'>Update Password</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}