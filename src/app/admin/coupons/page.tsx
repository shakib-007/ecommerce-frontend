'use client';

import { useEffect, useState, useCallback } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Plus, Tag, Trash2,
  ToggleLeft, ToggleRight, X,
} from 'lucide-react';
import { adminApi } from '@/lib/api/admin';
import { formatPrice, formatDate } from '@/lib/utils';
import Spinner from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const CouponSchema = Yup.object({
  code: Yup
    .string()
    .min(3, 'Code must be at least 3 characters')
    .max(20, 'Code cannot exceed 20 characters')
    .matches(/^[A-Z0-9]+$/, 'Only uppercase letters and numbers allowed')
    .required('Coupon code is required'),

  type: Yup
    .string()
    .oneOf(['flat', 'percentage'], 'Select a valid type')
    .required('Type is required'),

  value: Yup
    .number()
    .min(1, 'Value must be at least 1')
    .when('type', {
      is:        'percentage',
      then:      schema => schema.max(100, 'Percentage cannot exceed 100'),
      otherwise: schema => schema,
    })
    .required('Value is required'),

  min_order_amount: Yup
    .number()
    .min(0, 'Cannot be negative')
    .optional(),

  max_uses: Yup
    .number()
    .min(1, 'Must be at least 1')
    .optional()
    .nullable(),

  expires_at: Yup
    .string()
    .optional()
    .nullable(),

  is_active: Yup
    .boolean()
    .optional(),
});

export default function AdminCouponsPage() {
  const [coupons,   setCoupons]   = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [deleting,  setDeleting]  = useState<string | null>(null);
  const [toggling,  setToggling]  = useState<string | null>(null);
  const [serverError, setServerError] = useState('');

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getCoupons();
      setCoupons(res.data.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const {
    handleSubmit,
    getFieldProps,
    setFieldValue,
    values,
    touched,
    errors,
    isSubmitting,
    resetForm,
  } = useFormik({
    initialValues: {
      code:             '',
      type:             'flat',
      value:            '',
      min_order_amount: '',
      max_uses:         '',
      expires_at:       '',
      is_active:        true,
    },

    validationSchema: CouponSchema,

    onSubmit: async (values) => {
      setServerError('');
      try {
        await adminApi.createCoupon({
          code:             values.code.toUpperCase(),
          type:             values.type,
          value:            Number(values.value),
          min_order_amount: values.min_order_amount
            ? Number(values.min_order_amount)
            : 0,
          max_uses:   values.max_uses   ? Number(values.max_uses)   : null,
          expires_at: values.expires_at ? values.expires_at         : null,
          is_active:  values.is_active,
        });

        resetForm();
        setShowForm(false);
        fetchCoupons();
      } catch (error: any) {
        setServerError(error.message || 'Failed to create coupon.');
      }
    },
  });

  async function handleToggle(id: string) {
    setToggling(id);
    try {
      const res = await adminApi.toggleCouponStatus(id);
      setCoupons(prev =>
        prev.map(c =>
          c.id === id ? { ...c, is_active: res.is_active } : c
        )
      );
    } catch (error: any) {
      alert(error.message || 'Failed to toggle coupon.');
    } finally {
      setToggling(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this coupon? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await adminApi.deleteCoupon(id);
      setCoupons(prev => prev.filter(c => c.id !== id));
    } catch (error: any) {
      alert(error.message || 'Failed to delete coupon.');
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Coupons
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {coupons.length} coupons total
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setShowForm(!showForm);
            setServerError('');
            resetForm();
          }}
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? 'Cancel' : 'Add coupon'}
        </Button>
      </div>

      {/* Create coupon form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
            New Coupon
          </h2>

          {serverError && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-sm text-red-600 dark:text-red-400">
                {serverError}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">

              {/* Code */}
              <Input
                label="Coupon code"
                type="text"
                placeholder="WELCOME10"
                {...getFieldProps('code')}
                invalid={{ errors, touched }}
                className="uppercase"
              />

              {/* Type */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Discount type
                </label>
                <select
                  {...getFieldProps('type')}
                  className="
                    w-full px-4 py-2.5 rounded-xl border text-sm
                    bg-white dark:bg-gray-700
                    text-gray-900 dark:text-gray-100
                    border-gray-300 dark:border-gray-600
                    outline-none focus:border-black dark:focus:border-white
                    transition-colors
                  "
                >
                  <option value="flat">Flat amount (৳)</option>
                  <option value="percentage">Percentage (%)</option>
                </select>
                {touched.type && errors.type && (
                  <p className="text-xs text-red-500">{errors.type}</p>
                )}
              </div>

              {/* Value */}
              <Input
                label={values.type === 'percentage' ? 'Percentage (%)' : 'Amount (৳)'}
                type="number"
                placeholder={values.type === 'percentage' ? '10' : '500'}
                {...getFieldProps('value')}
                invalid={{ errors, touched }}
              />

              {/* Min order amount */}
              <Input
                label="Min order amount (৳)"
                type="number"
                placeholder="0"
                {...getFieldProps('min_order_amount')}
                invalid={{ errors, touched }}
              />

              {/* Max uses */}
              <Input
                label="Max uses (leave empty for unlimited)"
                type="number"
                placeholder="Unlimited"
                {...getFieldProps('max_uses')}
                invalid={{ errors, touched }}
              />

              {/* Expires at */}
              <Input
                label="Expires at (leave empty for no expiry)"
                type="date"
                {...getFieldProps('expires_at')}
                invalid={{ errors, touched }}
              />
            </div>

            {/* Is active toggle */}
            <div className="flex items-center gap-3 mb-5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={values.is_active}
                  onChange={e => setFieldValue('is_active', e.target.checked)}
                  className="w-4 h-4 accent-black"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Active immediately
                </span>
              </label>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                isLoading={isSubmitting}
              >
                Create coupon
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Coupons table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : coupons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Tag size={36} className="text-gray-300 mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No coupons yet.
            </p>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="hidden sm:grid grid-cols-12 gap-4 px-5 py-3 border-b border-gray-100 dark:border-gray-700 text-xs font-medium text-gray-400 uppercase tracking-wider">
              <span className="col-span-2">Code</span>
              <span className="col-span-2">Type</span>
              <span className="col-span-2">Value</span>
              <span className="col-span-2">Min order</span>
              <span className="col-span-1">Uses</span>
              <span className="col-span-2">Expires</span>
              <span className="col-span-1 text-right">Actions</span>
            </div>

            <div className="divide-y divide-gray-50 dark:divide-gray-700">
              {coupons?.map(coupon => (
                <div
                  key={coupon.id}
                  className={`
                    grid grid-cols-12 gap-4 px-5 py-4 items-center
                    hover:bg-gray-50 dark:hover:bg-gray-700/50
                    transition-colors
                    ${!coupon.is_active ? 'opacity-50' : ''}
                  `}
                >
                  {/* Code */}
                  <div className="col-span-2">
                    <span className="
                      text-sm font-mono font-semibold
                      text-gray-900 dark:text-gray-100
                      bg-gray-100 dark:bg-gray-700
                      px-2 py-0.5 rounded-lg
                    ">
                      {coupon.code}
                    </span>
                  </div>

                  {/* Type */}
                  <div className="col-span-2 hidden sm:block">
                    <span className={`
                      text-xs px-2 py-0.5 rounded-full font-medium
                      ${coupon.type === 'percentage'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      }
                    `}>
                      {coupon.type === 'percentage' ? 'Percentage' : 'Flat'}
                    </span>
                  </div>

                  {/* Value */}
                  <div className="col-span-2 hidden sm:block">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {coupon.type === 'percentage'
                        ? `${coupon.value}%`
                        : formatPrice(coupon.value)
                      }
                    </p>
                  </div>

                  {/* Min order */}
                  <div className="col-span-2 hidden sm:block">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {coupon.min_order_amount > 0
                        ? formatPrice(coupon.min_order_amount)
                        : '—'
                      }
                    </p>
                  </div>

                  {/* Uses */}
                  <div className="col-span-1 hidden sm:block">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {coupon.used_count}
                      {coupon.max_uses ? `/${coupon.max_uses}` : ''}
                    </p>
                  </div>

                  {/* Expires */}
                  <div className="col-span-2 hidden sm:block">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {coupon.expires_at
                        ? formatDate(coupon.expires_at)
                        : 'Never'
                      }
                    </p>
                    {coupon.expires_at &&
                      new Date(coupon.expires_at) < new Date() && (
                      <p className="text-xs text-red-500 mt-0.5">Expired</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 flex items-center justify-end gap-1">
                    {/* Toggle active */}
                    <button
                      onClick={() => handleToggle(coupon.id)}
                      disabled={toggling === coupon.id}
                      title={coupon.is_active ? 'Deactivate' : 'Activate'}
                      className="p-1.5 text-gray-400 hover:text-black dark:hover:text-white transition-colors disabled:opacity-40"
                    >
                      {coupon.is_active
                        ? <ToggleRight size={18} className="text-green-500" />
                        : <ToggleLeft size={18} />
                      }
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(coupon.id)}
                      disabled={deleting === coupon.id}
                      title="Delete coupon"
                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-40"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}