'use client';

import { useEffect } from 'react';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authApi } from '@/services/api';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { toast } from 'sonner';

type LoginStep = 'email' | 'password' | 'otp' | 'set-password';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, login } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const [step, setStep] = useState<LoginStep>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [requiresVerification, setRequiresVerification] = useState(false);

  const checkEmailMutation = useMutation({
    mutationFn: () => authApi.checkEmail(email),
    onSuccess: (data: any) => {
      if (data.action === 'register') {
        toast.error('Email not found. Please register first.');
        router.push('/auth/register');
      } else if (data.action === 'reset_password') {
        setRequiresVerification(data.requiresVerification);
        if (data.requiresVerification) {
          sendOtpMutation.mutate();
        } else {
          toast.info('Please reset your password');
          setStep('set-password');
        }
      } else if (data.action === 'enter_password') {
        setStep('password');
      }
    },
    onError: () => toast.error('Failed to check email'),
  });

  const sendOtpMutation = useMutation({
    mutationFn: () => authApi.sendOtp(email),
    onSuccess: () => {
      toast.success('OTP sent to your email');
      setStep('otp');
    },
    onError: () => toast.error('Failed to send OTP'),
  });

  const verifyOtpMutation = useMutation({
    mutationFn: () => authApi.verifyOtp(email, otp),
    onSuccess: () => {
      toast.success('Email verified');
      setStep('set-password');
    },
    onError: () => toast.error('Invalid or expired OTP'),
  });

  const setPasswordMutation = useMutation({
    mutationFn: () => authApi.setPassword(email, password),
    onSuccess: () => {
      toast.success('Password set successfully');
      loginMutation.mutate();
    },
    onError: () => toast.error('Failed to set password'),
  });

  const loginMutation = useMutation({
    mutationFn: () => authApi.login(email, password),
    onSuccess: (data) => {
      login(data.token, data.user);
      toast.success('Login successful!');
      router.push('/dashboard');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Login failed');
    },
  });

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    checkEmailMutation.mutate();
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate();
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyOtpMutation.mutate();
  };

  const handleSetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setPasswordMutation.mutate();
  };

  return (
    <div className="min-h-64 flex items-center justify-center bg-gray-50 py-12 lg:py-20 px-4 sm:px-6 lg:px-8 login-bg">
      <Card className="w-full max-w-md bg-white/90 border-0">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Sign In</CardTitle>
          <CardDescription className="text-center">
            {step === 'email' && 'Welcome back to 1Stop Instruction'}
            {step === 'password' && 'Enter your password'}
            {step === 'otp' && 'Verify your email'}
            {step === 'set-password' && 'Set a new password'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className='space-y-2'>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your.email@example.com"
                />
              </div>
              <Button
                type="submit"
                className="w-full radius20-left radius20-right-bottom text-center text-white hover:bg-red-500"
                disabled={checkEmailMutation.isPending}
              >
                {checkEmailMutation.isPending ? 'Checking...' : 'Continue'}
              </Button>
            </form>
          )}

          {step === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className='space-y-2'>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} disabled />
              </div>
              <div className='space-y-2'>
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Password</Label>
                  <button
                    type="button"
                    onClick={() => { setStep('otp'); sendOtpMutation.mutate(); }}
                    className="text-sm text-blue-600 hover:text-red-600 underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                />
              </div>
              <Button
                type="submit"
                className="w-full radius20-left radius20-right-bottom text-center text-white hover:bg-red-500"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setStep('email')}
              >
                Back
              </Button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div className='space-y-2'>
                <Label htmlFor="otp">Enter OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  placeholder="123456"
                  maxLength={6}
                />
                <p className="text-sm text-gray-500">Check your email for the verification code</p>
              </div>
              <Button
                type="submit"
                className="w-full radius20-left radius20-right-bottom text-center text-white hover:bg-red-500"
                disabled={verifyOtpMutation.isPending}
              >
                {verifyOtpMutation.isPending ? 'Verifying...' : 'Verify'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => sendOtpMutation.mutate()}
                disabled={sendOtpMutation.isPending}
              >
                Resend OTP
              </Button>
            </form>
          )}

          {step === 'set-password' && (
            <form onSubmit={handleSetPasswordSubmit} className="space-y-4">
              <div className='space-y-2'>
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter new password"
                  minLength={8}
                />
                <p className="text-sm text-gray-500">Minimum 8 characters</p>
              </div>
              <div className='space-y-2'>
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirm new password"
                  minLength={8}
                />
              </div>
              <Button
                type="submit"
                className="w-full radius20-left radius20-right-bottom text-center text-white hover:bg-red-500"
                disabled={setPasswordMutation.isPending}
              >
                {setPasswordMutation.isPending ? 'Setting...' : 'Set Password & Login'}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/auth/register" className="text-blue-600 underline hover:text-red-600">
                Sign up here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
