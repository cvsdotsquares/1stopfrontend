'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { toast } from 'sonner';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    surname: '',
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    postcode: '',
    contactNumber1: '',
    contactNumber2: '',
    contactNumber3: '',
    email: '',
    confirmEmail: '',
    password: '',
    verifyPassword: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const router = useRouter();

  const registerMutation = useMutation({
    mutationFn: () => authApi.register({
      first_name: formData.firstName,
      last_name: formData.surname,
      email: formData.email,
      password: formData.password,
      phone: formData.contactNumber1
    }),
    onSuccess: () => {
      toast.success('Registration successful! Please login.');
      router.push('/auth/login');
    },
    onError: (error: any) => {
      if (error.response?.data?.errors) {
        const backendErrors: Record<string, string> = {};
        error.response.data.errors.forEach((err: any) => {
          const fieldMap: Record<string, string> = {
            'first_name': 'firstName',
            'sur_name': 'surname',
            'contact1': 'contactNumber1',
            'postcode': 'postcode',
            'password': 'password'
          };
          const frontendField = fieldMap[err.path] || err.path;
          backendErrors[frontendField] = err.msg;
        });
        setErrors(backendErrors);
      } else {
        toast.error(error.response?.data?.message || 'Registration failed');
      }
    },
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2 || formData.firstName.trim().length > 50) {
      newErrors.firstName = 'First name must be between 2 and 50 characters';
    }
    
    if (!formData.surname.trim()) {
      newErrors.surname = 'Surname is required';
    } else if (formData.surname.trim().length < 2 || formData.surname.trim().length > 50) {
      newErrors.surname = 'Surname must be between 2 and 50 characters';
    }
    
    if (!formData.addressLine1.trim()) newErrors.addressLine1 = 'Address line 1 is required';
    
    // UK Postcode validation
    if (!formData.postcode.trim()) {
      newErrors.postcode = 'Postcode is required';
    } else {
      const postcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;
      if (!postcodeRegex.test(formData.postcode.trim())) {
        newErrors.postcode = 'Please provide a valid UK postcode';
      }
    }
    
    // UK Mobile phone validation
    if (!formData.contactNumber1.trim()) {
      newErrors.contactNumber1 = 'Contact number is required';
    } else {
      const phoneRegex = /^(?:(?:\+44)|(?:0))7[0-9]{9}$/;
      const cleanPhone = formData.contactNumber1.replace(/\s/g, '');
      if (!phoneRegex.test(cleanPhone)) {
        newErrors.contactNumber1 = 'Please provide a valid UK mobile phone number';
      }
    }
    
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.confirmEmail.trim()) newErrors.confirmEmail = 'Email confirmation is required';
    
    // Password validation
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else {
      if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters long';
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
        newErrors.password = 'Password must contain at least one lowercase letter, one uppercase letter, and one number';
      }
    }
    
    if (!formData.verifyPassword.trim()) newErrors.verifyPassword = 'Password verification is required';
    
    if (formData.email && formData.confirmEmail && formData.email !== formData.confirmEmail) {
      newErrors.confirmEmail = 'Emails do not match';
    }
    
    if (formData.password && formData.verifyPassword && formData.password !== formData.verifyPassword) {
      newErrors.verifyPassword = 'Passwords do not match';
    }
    
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    registerMutation.mutate();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Create Account</CardTitle>
          <CardDescription className="text-center">
            Join 1Stop Instruction today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Details */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    className={errors.firstName ? 'border-red-500' : ''}
                    required
                  />
                  {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <Label htmlFor="surname">Surname *</Label>
                  <Input
                    id="surname"
                    value={formData.surname}
                    onChange={(e) => handleChange('surname', e.target.value)}
                    className={errors.surname ? 'border-red-500' : ''}
                    required
                  />
                  {errors.surname && <p className="text-red-500 text-sm mt-1">{errors.surname}</p>}
                </div>
              </div>
              
              <div className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="addressLine1">Address Line 1 *</Label>
                  <Input
                    id="addressLine1"
                    value={formData.addressLine1}
                    onChange={(e) => handleChange('addressLine1', e.target.value)}
                    className={errors.addressLine1 ? 'border-red-500' : ''}
                    required
                  />
                  {errors.addressLine1 && <p className="text-red-500 text-sm mt-1">{errors.addressLine1}</p>}
                </div>
                <div>
                  <Label htmlFor="addressLine2">Address Line 2</Label>
                  <Input
                    id="addressLine2"
                    value={formData.addressLine2}
                    onChange={(e) => handleChange('addressLine2', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="addressLine3">Address Line 3</Label>
                  <Input
                    id="addressLine3"
                    value={formData.addressLine3}
                    onChange={(e) => handleChange('addressLine3', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="postcode">Postcode *</Label>
                    <Input
                      id="postcode"
                      value={formData.postcode}
                      onChange={(e) => handleChange('postcode', e.target.value)}
                      className={errors.postcode ? 'border-red-500' : ''}
                      required
                    />
                    {errors.postcode && <p className="text-red-500 text-sm mt-1">{errors.postcode}</p>}
                  </div>
                  <div>
                    <Label htmlFor="contactNumber1">Contact Number 1 *</Label>
                    <Input
                      id="contactNumber1"
                      type="tel"
                      value={formData.contactNumber1}
                      onChange={(e) => handleChange('contactNumber1', e.target.value)}
                      className={errors.contactNumber1 ? 'border-red-500' : ''}
                      required
                    />
                    {errors.contactNumber1 && <p className="text-red-500 text-sm mt-1">{errors.contactNumber1}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contactNumber2">Contact Number 2</Label>
                    <Input
                      id="contactNumber2"
                      type="tel"
                      value={formData.contactNumber2}
                      onChange={(e) => handleChange('contactNumber2', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactNumber3">Contact Number 3</Label>
                    <Input
                      id="contactNumber3"
                      type="tel"
                      value={formData.contactNumber3}
                      onChange={(e) => handleChange('contactNumber3', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Login Details */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Login Details</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className={errors.email ? 'border-red-500' : ''}
                    required
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
                <div>
                  <Label htmlFor="confirmEmail">Confirm Email *</Label>
                  <Input
                    id="confirmEmail"
                    type="email"
                    value={formData.confirmEmail}
                    onChange={(e) => handleChange('confirmEmail', e.target.value)}
                    className={errors.confirmEmail ? 'border-red-500' : ''}
                    required
                  />
                  {errors.confirmEmail && <p className="text-red-500 text-sm mt-1">{errors.confirmEmail}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      className={errors.password ? 'border-red-500' : ''}
                      required
                    />
                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                  </div>
                  <div>
                    <Label htmlFor="verifyPassword">Verify Password *</Label>
                    <Input
                      id="verifyPassword"
                      type="password"
                      value={formData.verifyPassword}
                      onChange={(e) => handleChange('verifyPassword', e.target.value)}
                      className={errors.verifyPassword ? 'border-red-500' : ''}
                      required
                    />
                    {errors.verifyPassword && <p className="text-red-500 text-sm mt-1">{errors.verifyPassword}</p>}
                  </div>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-blue-600 hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}