'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/slices/authSlice';
import { authApi } from '@/lib/api/auth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { RegisterUserData } from '@/types';

const initialValues: RegisterUserData = {
  name: '',
  email: '',
  phone: '',
  password: '',
  password_confirmation: '',
};

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const router   = useRouter();

  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    handleSubmit,
    getFieldProps,
    values,
    touched,
    errors,
    setFieldError,
    isSubmitting,
  } = useFormik({
    initialValues,

    validationSchema: Yup.object({
      name: Yup.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long').required('Full name is required'),

      email: Yup.string().email('Enter a valid email address').required('Email is required'),

      phone: Yup.string().matches(/^(\+?880|0)?1[3-9]\d{8}$/, 'Enter a valid Bangladeshi phone number').optional(),

      password: Yup.string().min(8, 'Password must be at least 8 characters').matches(/[A-Z]/, 'Must contain at least one uppercase letter').matches(/[0-9]/, 'Must contain at least one number').required('Password is required'),

      password_confirmation: Yup.string().oneOf([Yup.ref('password')], 'Passwords do not match').required('Please confirm your password'),
    }),

    validateOnChange: true,
    validateOnBlur:   false,

    onSubmit: async (values) => {
      setServerError('');

      try {
        const response = await authApi.register({
          name:                  values.name,
          email:                 values.email,
          phone:                 values.phone || undefined,
          password:              values.password,
          password_confirmation: values.password_confirmation,
        });

        dispatch(setCredentials({
          token: response.token,
          user:  response.user,
        }));

        router.push('/');

      } catch (error: any) {
        if (error.errors) {
          Object.entries(error.errors).forEach(([field, messages]) => {
            setFieldError(field, (messages as string[])[0]);
          });
        } else {
          setServerError(error.message || 'Registration failed. Please try again.');
        }
      }
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-6 text-center">
        <h1 className="text-xl font-semibold text-gray-900">
          Create your account
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Already have an account?{' '}
          <Link href="/login" className="text-black font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>

      {serverError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-600">{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">

        <Input
          label="Full name"
          type="text"
          showAsterisk={true}
          placeholder="John Doe"
          {...getFieldProps('name')}
          invalid={{ errors, touched }}
          autoFocus
        />

        <Input
          label="Email address"
          type="email"
          showAsterisk={true}
          placeholder="john@example.com"
          {...getFieldProps('email')}
          invalid={{ errors, touched }}
        />

        <Input
          label="Phone number (optional)"
          type="tel"
          placeholder="+880 1700-000000"
          {...getFieldProps('phone')}
          invalid={{ errors, touched }}
        />

        <div className="relative">
          <Input
            label="Password"
            type={showPass ? 'text' : 'password'}
            showAsterisk={true}
            placeholder="Minimum 8 characters"
            {...getFieldProps('password')}
            invalid={{ errors, touched }}
          />
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-9.5 text-gray-400 hover:text-gray-600"
          >
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <div className="relative">
          <Input
            label="Confirm password"
            showAsterisk={true}
            type={showConfirm ? 'text' : 'password'}
            placeholder="Repeat your password"
            {...getFieldProps('password_confirmation')}
            invalid={{ errors, touched }}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-9.5 text-gray-400 hover:text-gray-600"
          >
            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <Button
          type="submit"
          fullWidth
          size="lg"
          isLoading={isSubmitting}
          className="mt-2"
        >
          <UserPlus size={16} />
          Create account
        </Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs text-gray-400 bg-white px-3">
          or continue with
        </div>
      </div>

      <Link
        href={`${process.env.NEXT_PUBLIC_API_URL}/auth/google`}
        className="
          w-full flex items-center justify-center gap-3
          px-4 py-2.5 rounded-xl border border-gray-300
          text-sm font-medium text-gray-700
          hover:bg-gray-50 transition-colors duration-200
        "
      >
        <svg width="18" height="18" viewBox="0 0 18 18">
          <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18Z"/>
          <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17Z"/>
          <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18Z"/>
          <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3Z"/>
        </svg>
        Continue with Google
      </Link>

      <p className="text-xs text-gray-400 text-center mt-6">
        By creating an account you agree to our{' '}
        <Link href="#" className="underline">Terms of Service</Link>
        {' '}and{' '}
        <Link href="#" className="underline">Privacy Policy</Link>.
      </p>
    </motion.div>
  );
}