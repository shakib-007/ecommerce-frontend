'use client';

import { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Settings, Globe, Truck,
  CreditCard, Mail, Save,
} from 'lucide-react';
import { adminApi } from '@/lib/api/admin';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';

const SettingsSchema = Yup.object({
  site_name:    Yup.string().required('Site name is required'),
  site_tagline: Yup.string().optional(),
  site_email:   Yup.string().email('Invalid email').required('Email is required'),
  site_phone:   Yup.string().optional(),
  site_address: Yup.string().optional(),
  currency:     Yup.string().required('Currency is required'),
  currency_symbol: Yup.string().required('Currency symbol is required'),

  free_shipping_threshold: Yup
    .number()
    .min(0, 'Cannot be negative')
    .required('Free shipping threshold is required'),

  default_shipping_fee: Yup
    .number()
    .min(0, 'Cannot be negative')
    .required('Default shipping fee is required'),

  payment_gateway: Yup
    .string()
    .oneOf(['sslcommerz', 'manual'])
    .required('Payment gateway is required'),

  meta_description: Yup.string().optional(),
});

// Section wrapper for settings groups
function SettingsSection({
  icon,
  title,
  children,
}: {
  icon:     React.ReactNode;
  title:    string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
      <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-100 dark:border-gray-700">
        <span className="text-gray-400">{icon}</span>
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

export default function AdminSettingsPage() {
  const [loading,       setLoading]       = useState(true);
  const [saveSuccess,   setSaveSuccess]   = useState(false);
  const [serverError,   setServerError]   = useState('');

  const {
    handleSubmit,
    getFieldProps,
    setFieldValue,
    setValues,
    values,
    touched,
    errors,
    isSubmitting,
  } = useFormik({
    initialValues: {
      // General
      site_name:       '',
      site_tagline:    '',
      site_email:      '',
      site_phone:      '',
      site_address:    '',
      currency:        'BDT',
      currency_symbol: '৳',

      // Shipping
      free_shipping_threshold: '',
      default_shipping_fee:    '',

      // Payment
      payment_gateway: 'sslcommerz',

      // SEO
      meta_description: '',
    },

    validationSchema: SettingsSchema,

    onSubmit: async (values) => {
      setSaveSuccess(false);
      setServerError('');

      try {
        // Convert all values to strings for the API
        await adminApi.updateSettings({
          site_name:               values.site_name,
          site_tagline:            values.site_tagline,
          site_email:              values.site_email,
          site_phone:              values.site_phone,
          site_address:            values.site_address,
          currency:                values.currency,
          currency_symbol:         values.currency_symbol,
          free_shipping_threshold: String(values.free_shipping_threshold),
          default_shipping_fee:    String(values.default_shipping_fee),
          payment_gateway:         values.payment_gateway,
          meta_description:        values.meta_description,
        });

        setSaveSuccess(true);

        // Hide success message after 3 seconds
        setTimeout(() => setSaveSuccess(false), 3000);

      } catch (error: any) {
        setServerError(error.message || 'Failed to save settings.');
      }
    },
  });

  // Load current settings on mount
  useEffect(() => {
    adminApi.getSettings()
      .then(res => {
        const s = res.data;

        // Flatten grouped settings into form values
        const general  = s.general  ?? {};
        const shipping = s.shipping ?? {};
        const payment  = s.payment  ?? {};
        const seo      = s.seo      ?? {};

        setValues({
          site_name:               general.site_name         ?? '',
          site_tagline:            general.site_tagline       ?? '',
          site_email:              general.site_email         ?? '',
          site_phone:              general.site_phone         ?? '',
          site_address:            general.site_address       ?? '',
          currency:                general.currency           ?? 'BDT',
          currency_symbol:         general.currency_symbol    ?? '৳',
          free_shipping_threshold: shipping.free_shipping_threshold ?? '',
          default_shipping_fee:    shipping.default_shipping_fee    ?? '',
          payment_gateway:         payment.payment_gateway    ?? 'sslcommerz',
          meta_description:        seo.meta_description       ?? '',
        });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-3xl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Settings
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Configure your store settings.
          </p>
        </div>
      </div>

      {/* Success message */}
      {saveSuccess && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl flex items-center gap-2">
          <Save size={16} className="text-green-600 dark:text-green-400" />
          <p className="text-sm text-green-700 dark:text-green-400">
            Settings saved successfully.
          </p>
        </div>
      )}

      {/* Server error */}
      {serverError && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl">
          <p className="text-sm text-red-600 dark:text-red-400">
            {serverError}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">

        {/* ── General settings ─────────────────────────────────── */}
        <SettingsSection
          icon={<Globe size={16} />}
          title="General"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Site name"
              type="text"
              placeholder="MyShop"
              {...getFieldProps('site_name')}
              invalid={{ errors, touched }}
            />

            <Input
              label="Tagline"
              type="text"
              placeholder="Best deals every day"
              {...getFieldProps('site_tagline')}
              invalid={{ errors, touched }}
            />

            <Input
              label="Support email"
              type="email"
              placeholder="support@myshop.com"
              {...getFieldProps('site_email')}
              invalid={{ errors, touched }}
            />

            <Input
              label="Phone number"
              type="tel"
              placeholder="+880 1700-000000"
              {...getFieldProps('site_phone')}
              invalid={{ errors, touched }}
            />

            <div className="sm:col-span-2">
              <Input
                label="Address"
                type="text"
                placeholder="Dhaka, Bangladesh"
                {...getFieldProps('site_address')}
                invalid={{ errors, touched }}
              />
            </div>

            <Input
              label="Currency code"
              type="text"
              placeholder="BDT"
              {...getFieldProps('currency')}
              invalid={{ errors, touched }}
            />

            <Input
              label="Currency symbol"
              type="text"
              placeholder="৳"
              {...getFieldProps('currency_symbol')}
              invalid={{ errors, touched }}
            />
          </div>
        </SettingsSection>

        {/* ── Shipping settings ─────────────────────────────────── */}
        <SettingsSection
          icon={<Truck size={16} />}
          title="Shipping"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Free shipping threshold (৳)"
              type="number"
              placeholder="2000"
              helperText="Orders above this amount get free shipping"
              {...getFieldProps('free_shipping_threshold')}
              invalid={{ errors, touched }}
            />

            <Input
              label="Default shipping fee (৳)"
              type="number"
              placeholder="120"
              helperText="Applied when order is below the free threshold"
              {...getFieldProps('default_shipping_fee')}
              invalid={{ errors, touched }}
            />
          </div>
        </SettingsSection>

        {/* ── Payment settings ──────────────────────────────────── */}
        <SettingsSection
          icon={<CreditCard size={16} />}
          title="Payment"
        >
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Default payment gateway
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* SSLCommerz option */}
              <label className={`
                flex items-center gap-3 p-4 rounded-xl border cursor-pointer
                transition-colors duration-150
                ${values.payment_gateway === 'sslcommerz'
                  ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-700'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }
              `}>
                <input
                  type="radio"
                  name="payment_gateway"
                  value="sslcommerz"
                  checked={values.payment_gateway === 'sslcommerz'}
                  onChange={() => setFieldValue('payment_gateway', 'sslcommerz')}
                  className="accent-black"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    SSLCommerz
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Cards, mobile banking, net banking
                  </p>
                </div>
              </label>

              {/* Manual option */}
              <label className={`
                flex items-center gap-3 p-4 rounded-xl border cursor-pointer
                transition-colors duration-150
                ${values.payment_gateway === 'manual'
                  ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-700'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }
              `}>
                <input
                  type="radio"
                  name="payment_gateway"
                  value="manual"
                  checked={values.payment_gateway === 'manual'}
                  onChange={() => setFieldValue('payment_gateway', 'manual')}
                  className="accent-black"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Manual
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Admin confirms payments manually
                  </p>
                </div>
              </label>
            </div>

            {touched.payment_gateway && errors.payment_gateway && (
              <p className="text-xs text-red-500">{errors.payment_gateway}</p>
            )}
          </div>
        </SettingsSection>

        {/* ── SEO settings ─────────────────────────────────────── */}
        <SettingsSection
          icon={<Mail size={16} />}
          title="SEO"
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Meta description
            </label>
            <textarea
              {...getFieldProps('meta_description')}
              placeholder="Shop the best products at MyShop."
              rows={3}
              className="
                w-full px-4 py-3 rounded-xl border text-sm
                bg-white dark:bg-gray-700
                text-gray-900 dark:text-gray-100
                border-gray-300 dark:border-gray-600
                outline-none focus:border-black dark:focus:border-white
                focus:ring-2 focus:ring-gray-100 dark:focus:ring-gray-700
                placeholder:text-gray-400 dark:placeholder:text-gray-500
                resize-none transition-all
              "
            />
            {touched.meta_description && errors.meta_description && (
              <p className="text-xs text-red-500">{errors.meta_description}</p>
            )}
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Used for search engine previews. Keep under 160 characters.
            </p>
          </div>
        </SettingsSection>

        {/* Save button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            size="lg"
            isLoading={isSubmitting}
          >
            <Save size={16} />
            Save all settings
          </Button>
        </div>
      </form>
    </div>
  );
}