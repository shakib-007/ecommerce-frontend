// src/app/dashboard/profile/page.tsx
'use client';

import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { User, Lock } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setUser } from '@/store/slices/authSlice';
import { ApiClient } from '@/lib/api/client';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const user     = useAppSelector(s => s.auth.user);

  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError,   setProfileError]   = useState('');
  const [passSuccess,    setPassSuccess]    = useState('');
  const [passError,      setPassError]      = useState('');

  // ── Profile form ──────────────────────────────────────────────
  const profileFormik = useFormik({
    initialValues: {
      name:  user?.name  ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
    },

    validationSchema: Yup.object({
      name:  Yup.string().min(2).required('Name is required'),
      email: Yup.string().email('Invalid email').required('Email is required'),
      phone: Yup.string().optional(),
    }),

    onSubmit: async (values, { setFieldError }) => {
      setProfileError('');
      setProfileSuccess('');

      try {
        const res = await ApiClient.put<{ data: any }>('/me', values);
        dispatch(setUser(res.data));
        setProfileSuccess('Profile updated successfully.');
      } catch (error: any) {
        if (error.errors) {
          Object.entries(error.errors).forEach(([field, messages]) => {
            setFieldError(field, (messages as string[])[0]);
          });
        } else {
          setProfileError(error.message || 'Failed to update profile.');
        }
      }
    },
  });

  // ── Change password form ──────────────────────────────────────
  const passwordFormik = useFormik({
    initialValues: {
      current_password:      '',
      password:              '',
      password_confirmation: '',
    },

    validationSchema: Yup.object({
      current_password: Yup.string().required('Current password is required'),
      password: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .required('New password is required'),
      password_confirmation: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords do not match')
        .required('Please confirm your password'),
    }),

    onSubmit: async (values, { resetForm, setFieldError }) => {
      setPassError('');
      setPassSuccess('');

      try {
        await ApiClient.put('/me/password', values);
        setPassSuccess('Password changed successfully.');
        resetForm();
      } catch (error: any) {
        if (error.errors) {
          Object.entries(error.errors).forEach(([field, messages]) => {
            setFieldError(field, (messages as string[])[0]);
          });
        } else {
          setPassError(error.message || 'Failed to change password.');
        }
      }
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Profile</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your account details and password.
        </p>
      </div>

      {/* Profile info */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-5">
          <User size={18} className="text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-900">
            Personal Information
          </h2>
        </div>

        {profileSuccess && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-sm text-green-700">{profileSuccess}</p>
          </div>
        )}

        {profileError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600">{profileError}</p>
          </div>
        )}

        <form
          onSubmit={profileFormik.handleSubmit}
          noValidate
          className="space-y-4"
        >
          <Input
            label="Full name"
            type="text"
            {...profileFormik.getFieldProps('name')}
            invalid={{
              errors:  profileFormik.errors,
              touched: profileFormik.touched,
            }}
          />

          <Input
            label="Email address"
            type="email"
            {...profileFormik.getFieldProps('email')}
            invalid={{
              errors:  profileFormik.errors,
              touched: profileFormik.touched,
            }}
          />

          <Input
            label="Phone number"
            type="tel"
            placeholder="+880 1700-000000"
            {...profileFormik.getFieldProps('phone')}
            invalid={{
              errors:  profileFormik.errors,
              touched: profileFormik.touched,
            }}
          />

          <div className="flex justify-end">
            <Button
              type="submit"
              isLoading={profileFormik.isSubmitting}
            >
              Save changes
            </Button>
          </div>
        </form>
      </div>

      {/* Change password */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-5">
          <Lock size={18} className="text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-900">
            Change Password
          </h2>
        </div>

        {passSuccess && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-sm text-green-700">{passSuccess}</p>
          </div>
        )}

        {passError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600">{passError}</p>
          </div>
        )}

        <form
          onSubmit={passwordFormik.handleSubmit}
          noValidate
          className="space-y-4"
        >
          <Input
            label="Current password"
            type="password"
            {...passwordFormik.getFieldProps('current_password')}
            invalid={{
              errors:  passwordFormik.errors,
              touched: passwordFormik.touched,
            }}
          />

          <Input
            label="New password"
            type="password"
            {...passwordFormik.getFieldProps('password')}
            invalid={{
              errors:  passwordFormik.errors,
              touched: passwordFormik.touched,
            }}
          />

          <Input
            label="Confirm new password"
            type="password"
            {...passwordFormik.getFieldProps('password_confirmation')}
            invalid={{
              errors:  passwordFormik.errors,
              touched: passwordFormik.touched,
            }}
          />

          <div className="flex justify-end">
            <Button
              type="submit"
              isLoading={passwordFormik.isSubmitting}
            >
              Change password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}