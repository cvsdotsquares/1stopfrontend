'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authApi } from '@/services/api';
import { bookingApi, type LicenseType } from '@/services/bookingApi';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { toast } from 'sonner';
import { getRetryAfterSeconds, formatRetryClock } from '@/hooks/useRetryTimer';

const DOB_DIGIT_POSITIONS = [0, 1, 3, 4, 6, 7, 8, 9] as const;
const DOB_MASK_CHARS = ['_', '_', '/', '_', '_', '/', '_', '_', '_', '_'] as const;

function buildDobDisplay(digits: string): string {
  let di = 0;
  return DOB_MASK_CHARS.map(ch => (ch === '/' ? '/' : di < digits.length ? digits[di++] : ch)).join('');
}

function charPosToDigitIdx(charPos: number): number {
  for (let i = 0; i < DOB_DIGIT_POSITIONS.length; i++) {
    if (DOB_DIGIT_POSITIONS[i] >= charPos) return i;
  }
  return DOB_DIGIT_POSITIONS.length;
}

function formatDobInput(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function isValidDob(dob: string) {
  const match = dob.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return false;
  const [, dayStr, monthStr, yearStr] = match;
  const day = Number(dayStr);
  const month = Number(monthStr);
  const year = Number(yearStr);
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export default function RegisterPage() {
  const routerNav = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      routerNav.push('/dashboard');
    }
  }, [isAuthenticated, routerNav]);
  const [formData, setFormData] = useState({
    firstName: '',
    surname: '',
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    postcode: '',
    contactNumber1: '',
    contactNumber2: '',
    date_of_birth: '',
    license_number: '',
    license_type: '',
    theory_number: '',
    email: '',
    confirmEmail: '',
    password: '',
    verifyPassword: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [licenseTypes, setLicenseTypes] = useState<LicenseType[]>([]);
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [pendingEmail, setPendingEmail] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const resendTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startResendCooldown = (seconds = 60) => {
    setResendCooldown(seconds);
    if (resendTimerRef.current) clearInterval(resendTimerRef.current);
    resendTimerRef.current = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          clearInterval(resendTimerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => () => { if (resendTimerRef.current) clearInterval(resendTimerRef.current); }, []);

  const { login: authLogin } = useAuthStore();

  const dobInputRef = useRef<HTMLInputElement>(null);
  const pendingDobCursorPosRef = useRef<number | null>(null);
  const dobDigits = (formData.date_of_birth || '').replace(/[^0-9]/g, '').slice(0, 8);
  const dobDisplay = dobDigits.length > 0 ? buildDobDisplay(dobDigits) : '';

  useLayoutEffect(() => {
    if (!dobInputRef.current || pendingDobCursorPosRef.current === null) return;
    const pos = pendingDobCursorPosRef.current;
    dobInputRef.current.setSelectionRange(pos, pos);
    pendingDobCursorPosRef.current = null;
  }, [dobDisplay]);

  useEffect(() => {
    const loadLicenseTypes = async () => {
      const data = await bookingApi.getLicenseTypes().catch(() => []);
      setLicenseTypes(Array.isArray(data) ? data : []);
    };

    loadLicenseTypes();
  }, []);

  const registerMutation = useMutation({
    mutationFn: () => authApi.register({
      firstName: formData.firstName,
      surname: formData.surname,
      addressLine1: formData.addressLine1,
      addressLine2: formData.addressLine2,
      addressLine3: formData.addressLine3,
      postcode: formData.postcode,
      contactNumber1: formData.contactNumber1,
      contactNumber2: formData.contactNumber2,
      date_of_birth: formData.date_of_birth,
      license_number: formData.license_number,
      license_type: formData.license_type,
      theory_number: formData.theory_number,
      email: formData.email,
      confirmEmail: formData.confirmEmail,
      password: formData.password,
      verifyPassword: formData.verifyPassword
    }),
    onSuccess: (data: any) => {
      if (data?.requiresVerification) {
        setPendingEmail(formData.email);
        setOtpValue('');
        startResendCooldown(120);
        setStep('otp');
        toast.success('Account created! Check your email for the verification code.');
      } else {
        toast.success('Registration successful! Please login.');
        routerNav.push('/auth/login');
      }
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
            'password': 'password',
            'license_number': 'license_number'
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

  const verifyOtpMutation = useMutation({
    mutationFn: () => authApi.verifyRegistrationOtp(pendingEmail, otpValue.trim()),
    onSuccess: (data: any) => {
      if (data?.data?.token) {
        authLogin(data.data.token, data.data.user);
        toast.success('Email verified! Welcome aboard.');
        routerNav.push('/dashboard');
      } else {
        toast.success('Email verified! Please log in.');
        routerNav.push('/auth/login');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Invalid or expired OTP');
    },
  });

  const resendOtpMutation = useMutation({
    mutationFn: () => authApi.resendRegistrationOtp(pendingEmail),
    onSuccess: () => {
      toast.success('A new verification code has been sent to your email.');
      startResendCooldown(120);
    },
    onError: (error: any) => {
      const wait = getRetryAfterSeconds(error, 120);
      if (wait > 0) startResendCooldown(wait);
      toast.error(error.response?.data?.message || 'Failed to resend code');
    },
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleDobChange = (value: string) => {
    handleChange('date_of_birth', value);
  };

  const snapDobCursor = (input: HTMLInputElement, afterDigitIdx: number, immediate = false) => {
    const clamped = Math.min(afterDigitIdx, DOB_DIGIT_POSITIONS.length);
    const pos = clamped >= DOB_DIGIT_POSITIONS.length ? 10 : DOB_DIGIT_POSITIONS[clamped];
    if (immediate) {
      input.setSelectionRange(pos, pos);
      return;
    }
    pendingDobCursorPosRef.current = pos;
  };

  const handleDobKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    if (e.ctrlKey || e.metaKey || e.key === 'Tab') return;
    e.preventDefault();

    const selStart = input.selectionStart ?? 0;
    const digitIdx = charPosToDigitIdx(selStart);

    if (e.key === 'ArrowLeft') {
      const prev = Math.max(0, Math.min(digitIdx, dobDigits.length) - 1);
      input.setSelectionRange(DOB_DIGIT_POSITIONS[prev], DOB_DIGIT_POSITIONS[prev]);
      return;
    }
    if (e.key === 'ArrowRight') {
      snapDobCursor(input, Math.min(dobDigits.length, digitIdx + 1), true);
      return;
    }
    if (e.key === 'Home') {
      input.setSelectionRange(0, 0);
      return;
    }
    if (e.key === 'End') {
      snapDobCursor(input, dobDigits.length, true);
      return;
    }

    if (e.key === 'Backspace') {
      if (dobDigits.length === 0) return;
      const deleteIdx = Math.min(digitIdx, dobDigits.length) - 1;
      if (deleteIdx < 0) return;
      const newDigits = dobDigits.slice(0, deleteIdx) + dobDigits.slice(deleteIdx + 1);
      handleDobChange(formatDobInput(newDigits));
      snapDobCursor(input, deleteIdx);
      return;
    }
    if (e.key === 'Delete') {
      if (dobDigits.length === 0) return;
      const deleteIdx = Math.min(digitIdx, dobDigits.length - 1);
      const newDigits = dobDigits.slice(0, deleteIdx) + dobDigits.slice(deleteIdx + 1);
      handleDobChange(formatDobInput(newDigits));
      snapDobCursor(input, deleteIdx);
      return;
    }

    if (!/^\d$/.test(e.key)) return;

    const insertAt = Math.min(digitIdx, dobDigits.length);
    if (insertAt > 7) return;
    const newDigits = (dobDigits.slice(0, insertAt) + e.key + dobDigits.slice(insertAt + 1)).slice(0, 8);
    handleDobChange(formatDobInput(newDigits));
    snapDobCursor(input, insertAt + 1);
  };

  const handleDobPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 8);
    if (!digits) return;
    handleDobChange(formatDobInput(digits));
    snapDobCursor(e.currentTarget, digits.length);
  };

  const handleDobFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    snapDobCursor(e.currentTarget, dobDigits.length, true);
  };

  const handleDobClick = (e: React.MouseEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const clickPos = input.selectionStart ?? 0;
    const snapIdx = Math.min(charPosToDigitIdx(clickPos), dobDigits.length);
    snapDobCursor(input, snapIdx, true);
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

    // Optional postcode validation (address fields are not displayed on this form)
    if (formData.postcode.trim()) {
      const postcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;
      if (!postcodeRegex.test(formData.postcode.trim())) {
        newErrors.postcode = 'Please provide a valid UK postcode';
      }
    }

    // General phone validation (matches booking form behavior)
    if (!formData.contactNumber1.trim()) {
      newErrors.contactNumber1 = 'Contact number is required';
    } else {
      const phoneRegex = /^\+?[0-9\s()-]+$/;
      const cleanPhone = formData.contactNumber1.replace(/[\s()-]/g, '');
      if (!phoneRegex.test(formData.contactNumber1) || !/^\+?[0-9]+$/.test(cleanPhone)) {
        newErrors.contactNumber1 = 'Please enter a valid phone number';
      }
    }

    if (!formData.date_of_birth.trim()) newErrors.date_of_birth = 'Date of birth is required';
    else if (!isValidDob(formData.date_of_birth.trim())) newErrors.date_of_birth = 'Use a valid date of birth in dd/mm/yyyy format';

    if (!formData.license_number.trim()) {
      newErrors.license_number = 'Driving licence number is required';
    } else if (
      formData.license_number.trim().length !== 16 ||
      !/^[A-Za-z9]{5}\d{6}[A-Za-z9]{2}[A-Za-z0-9]{1}[A-Za-z]{2}$/.test(formData.license_number.trim())
    ) {
      newErrors.license_number = 'Use a valid 16-character driving licence number';
    }

    if (!formData.license_type.trim()) {
      newErrors.license_type = 'Driving licence type is required';
    }

    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.confirmEmail.trim()) newErrors.confirmEmail = 'Email confirmation is required';

    // Password validation
    if (!formData.password.trim()) {
      newErrors.password = 'Password cannot be empty or contain only spaces';
    } else {
      if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters long';
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
        newErrors.password = 'Password must contain at least one lowercase letter, one uppercase letter, and one number';
      }
    }

    if (!formData.verifyPassword.trim()) newErrors.verifyPassword = 'Password cannot be empty or contain only spaces';

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
    <div className=" flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 login-bg">
      <Card className="w-full max-w-2xl bg-white/90 border-0">
        {step === 'otp' ? (
          <>
            <CardHeader>
              <CardTitle className="text-2xl text-center">Verify Your Email</CardTitle>
              <CardDescription className="text-center">
                We sent a 6-digit code to <strong>{pendingEmail}</strong>. Enter it below to activate your account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="otp">Verification Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    value={otpValue}
                    onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="text-center text-2xl tracking-[0.5em] font-mono"
                    autoFocus
                  />
                </div>
                <Button
                  className="w-full radius20-left radius20-right-bottom text-center text-white hover:bg-red-500"
                  disabled={otpValue.length !== 6 || verifyOtpMutation.isPending}
                  onClick={() => verifyOtpMutation.mutate()}
                >
                  {verifyOtpMutation.isPending ? 'Verifying...' : 'Verify Email'}
                </Button>
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Didn&apos;t receive the code?{' '}
                    {resendCooldown > 0 ? (
                      <span className="text-gray-400">Resend in {formatRetryClock(resendCooldown)}</span>
                    ) : (
                      <button
                        type="button"
                        className="text-blue-600 underline hover:text-red-600 disabled:opacity-50"
                        disabled={resendOtpMutation.isPending}
                        onClick={() => resendOtpMutation.mutate()}
                      >
                        {resendOtpMutation.isPending ? 'Sending...' : 'Resend code'}
                      </button>
                    )}
                  </p>
                </div>
                <div className="text-center">
                  <button
                    type="button"
                    className="text-sm text-gray-400 hover:text-gray-600 underline"
                    onClick={() => { setStep('form'); setOtpValue(''); }}
                  >
                    &larr; Back to registration
                  </button>
                </div>
              </div>
            </CardContent>
          </>
        ) : (
        <>
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
              <h3 className="text-lg text-gray-900 font-bold mb-4">Personal Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
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
                <div className="space-y-2">
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
                {/* <div className="space-y-2">
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
                <div className="space-y-2">
                  <Label htmlFor="addressLine2">Address Line 2</Label>
                  <Input
                    id="addressLine2"
                    value={formData.addressLine2}
                    onChange={(e) => handleChange('addressLine2', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addressLine3">Address Line 3</Label>
                  <Input
                    id="addressLine3"
                    value={formData.addressLine3}
                    onChange={(e) => handleChange('addressLine3', e.target.value)}
                  />
                </div> */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* <div className="space-y-2">
                    <Label htmlFor="postcode">Postcode *</Label>
                    <Input
                      id="postcode"
                      value={formData.postcode}
                      onChange={(e) => handleChange('postcode', e.target.value)}
                      className={errors.postcode ? 'border-red-500' : ''}
                      required
                    />
                    {errors.postcode && <p className="text-red-500 text-sm mt-1">{errors.postcode}</p>}
                  </div> */}
                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth">Date of Birth *</Label>
                    <Input
                      ref={dobInputRef}
                      id="date_of_birth"
                      type="text"
                      placeholder="dd/mm/yyyy"
                      value={dobDisplay}
                      onKeyDown={handleDobKeyDown}
                      onPaste={handleDobPaste}
                      onFocus={handleDobFocus}
                      onClick={handleDobClick}
                      onChange={() => { /* controlled by keydown/paste handlers */ }}
                      inputMode="numeric"
                      className={errors.date_of_birth ? 'border-red-500' : ''}
                      required
                    />
                    {errors.date_of_birth && <p className="text-red-500 text-sm mt-1">{errors.date_of_birth}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactNumber1">Phone *</Label>
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
                  <div className="space-y-2">
                    <Label htmlFor="contactNumber2">Alternative Phone</Label>
                    <Input
                      id="contactNumber2"
                      type="tel"
                      value={formData.contactNumber2}
                      onChange={(e) => handleChange('contactNumber2', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="license_number">Driving Licence Number *</Label>
                    <Input
                      id="license_number"
                      value={formData.license_number}
                      onChange={(e) => handleChange('license_number', e.target.value.toUpperCase())}
                      className={errors.license_number ? 'border-red-500' : ''}
                      required
                    />
                    {errors.license_number && <p className="text-red-500 text-sm mt-1">{errors.license_number}</p>}
                  </div>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className="space-y-2">
                    <Label htmlFor="license_type">Driving Licence Type *</Label>
                    <div className="relative">
                      <select
                        id="license_type"
                        value={formData.license_type}
                        onChange={(e) => handleChange('license_type', e.target.value)}
                        className={`w-full h-12 appearance-none rounded-md border bg-white px-3 pr-10 text-sm ${errors.license_type ? 'border-red-500' : 'border-input'}`}
                        required
                      >
                        <option value="">Please select</option>
                        {licenseTypes.map((license) => (
                          <option key={license.id} value={String(license.id)}>{license.licence_type}</option>
                        ))}
                      </select>
                      <svg
                        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    {errors.license_type && <p className="text-red-500 text-sm mt-1">{errors.license_type}</p>}
                  </div>
                  {/* <div className="space-y-2">
                    <Label htmlFor="theory_number">Theory Number (If Applicable)</Label>
                    <Input
                      id="theory_number"
                      value={formData.theory_number}
                      onChange={(e) => handleChange('theory_number', e.target.value)}
                    />
                  </div> */}
                </div>
              </div>
            </div>

            {/* Login Details */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Login Details</h3>
              <div className="space-y-4">
                <div className="space-y-2">
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
                <div className="space-y-2">
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
                  <div className="space-y-2">
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
                  <div className="space-y-2">
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
                <p className='text-sm text-slate-700 opacity-60'>Password must contain at least one lowercase letter, one uppercase letter, and one number and be at least 8 characters long</p>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full radius20-left radius20-right-bottom text-center text-white hover:bg-red-500"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-blue-600 underline hover:text-red-600">
                Sign in here
              </Link>
            </p>
          </div>
        </CardContent>
        </>
        )}
      </Card>
    </div>
  );
}