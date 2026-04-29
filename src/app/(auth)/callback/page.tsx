'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/slices/authSlice';
import { authApi } from '@/lib/api/auth';
import Spinner from '@/components/ui/Spinner';

export default function CallbackPage() {
  const dispatch    = useAppDispatch();
  const router      = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      router.push('/login');
      return;
    }

    // Save token temporarily to fetch user data
    localStorage.setItem('auth_token', token);

    // Fetch user profile with this token
    authApi.me()
      .then((response) => {
        dispatch(setCredentials({
          token,
          user: response.data,
        }));

        if (response.data.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/');
        }
      })
      .catch(() => {
        localStorage.removeItem('auth_token');
        router.push('/login');
      });
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <Spinner size="lg" />
      <p className="text-gray-500 text-sm">Signing you in...</p>
    </div>
  );
}