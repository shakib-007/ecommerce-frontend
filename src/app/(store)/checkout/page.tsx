'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Formik, useFormik } from 'formik';
import * as Yup from 'yup';
import {
  MapPin, CreditCard, Truck,
  Tag, ChevronDown, ChevronUp,
  ShieldCheck,
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { clearCart } from '@/store/slices/cartSlice';
import { cartApi } from '@/lib/api/cart';
import { Address, Cart } from '@/types';
import { formatPrice, getImageUrl } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { ordersApi } from '@/lib/api/order';

// ── Validation Schema ─────────────────────────────────────────────
const CheckoutSchema = Yup.object({
  address_id: Yup
    .string()
    .required('Please select a delivery address'),

  payment_method: Yup
    .string()
    .oneOf(['sslcommerz', 'cod'])
    .required('Please select a payment method'),

  coupon_code: Yup
    .string()
    .optional(),

  notes: Yup
    .string()
    .max(500, 'Notes cannot exceed 500 characters')
    .optional(),
});

export default function CheckoutPage() {
  const dispatch = useAppDispatch();
  const router   = useRouter();

  const isAuthenticated = useAppSelector(s => s.auth.isAuthenticated);

  const [cart,       setCart]       = useState<Cart | null>(null);
  const [addresses,  setAddresses]  = useState<Address[]>([]);
  const [cartLoading, setCartLoading] = useState(true);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [couponApplied,  setCouponApplied]  = useState(false);
  const [couponError,    setCouponError]    = useState('');
  const [serverError,    setServerError]    = useState('');
  const [showOrderSummary, setShowOrderSummary] = useState(false);

  // Load cart and addresses on mount
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    Promise.all([
      cartApi.get(),
      ordersApi.getAddresses(),
    ]).then(([cartRes, addrRes]) => {
      setCart(cartRes.data);
      setAddresses(addrRes.data);
      // Auto-select default address
      const defaultAddr = addrRes.data.find(a => a.is_default);
      if (defaultAddr) {
        setFieldValue('address_id', defaultAddr.id);
      }
    }).finally(() => setCartLoading(false));
  }, [isAuthenticated]);

  // Redirect if cart is empty
  useEffect(() => {
    if (!cartLoading && cart && cart.items.length === 0) {
      router.push('/products');
    }
  }, [cart, cartLoading]);

  const {
    handleSubmit,
    getFieldProps,
    setFieldValue,
    setFieldError,
    values,
    touched,
    errors,
    isSubmitting,
  } = useFormik({
    initialValues: {
      address_id:     '',
      payment_method: 'cod',
      coupon_code:    '',
      notes:          '',
    },

    validationSchema: CheckoutSchema,

    onSubmit: async (values) => {
      setServerError('');

      try {
        // 1. Place order
        const orderRes = await ordersApi.place({
          address_id:     values.address_id,
          payment_method: values.payment_method as 'sslcommerz' | 'cod',
          coupon_code:    values.coupon_code || undefined,
          notes:          values.notes || undefined,
        });

        const order = orderRes.data;

        // 2. Initiate payment
        const paymentRes = await ordersApi.initiatePayment(order.id);

        // 3. Clear cart from Redux
        dispatch(clearCart());

        // 4. Handle payment method
        if (values.payment_method === 'sslcommerz' && paymentRes.redirect_url) {
          // Redirect to SSLCommerz payment page
          window.location.href = paymentRes.redirect_url;
        } else {
          // COD — redirect to success page
          router.push(`/payment/success?order=${order.order_number}`);
        }

      } catch (error: any) {
        if (error.errors) {
          Object.entries(error.errors).forEach(([field, messages]) => {
            setFieldError(field, (messages as string[])[0]);
          });
        } else {
          setServerError(error.message || 'Failed to place order. Please try again.');
        }
      }
    },
  });

  // Calculate totals with free shipping logic
  const subtotal     = cart?.subtotal ?? 0;
  const freeThreshold = 2000;
  const shippingFee  = subtotal >= freeThreshold ? 0 : 120;
  const total        = subtotal + shippingFee;

  if (cartLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-8">Checkout</h1>

      {serverError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-600">{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left column — form */}
          <div className="lg:col-span-2 space-y-6">

            {/* ── Section 1: Delivery address ──────────────────── */}
            <CheckoutSection
              icon={<MapPin size={18} />}
              title="Delivery Address"
            >
              {addresses.length === 0 ? (
                <p className="text-sm text-gray-500 mb-4">
                  No saved addresses. Add one below.
                </p>
              ) : (
                <div className="space-y-2 mb-4">
                  {addresses.map(addr => (
                    <label
                      key={addr.id}
                      className={`
                        flex items-start gap-3 p-4 rounded-xl border cursor-pointer
                        transition-colors duration-150
                        ${values.address_id === addr.id
                          ? 'border-black bg-gray-50'
                          : 'border-gray-200 hover:border-gray-400'
                        }
                      `}
                    >
                      <input
                        type="radio"
                        name="address_id"
                        value={addr.id}
                        checked={values.address_id === addr.id}
                        onChange={() => setFieldValue('address_id', addr.id)}
                        className="mt-0.5 accent-black"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">
                            {addr.label}
                          </span>
                          {addr.is_default && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {addr.line1}
                          {addr.line2 && `, ${addr.line2}`}
                        </p>
                        <p className="text-sm text-gray-500">
                          {addr.city}{addr.state && `, ${addr.state}`} {addr.postal_code}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {touched.address_id && errors.address_id && (
                <p className="text-xs text-red-500 mb-3">{errors.address_id}</p>
              )}

              {/* Add new address toggle */}
              <button
                type="button"
                onClick={() => setShowNewAddress(!showNewAddress)}
                className="flex items-center gap-1.5 text-sm text-black font-medium hover:underline"
              >
                {showNewAddress ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {showNewAddress ? 'Cancel' : '+ Add new address'}
              </button>

              {/* New address form */}
              {showNewAddress && (
                <NewAddressForm
                  onSaved={(newAddr) => {
                    setAddresses(prev => [...prev, newAddr]);
                    setFieldValue('address_id', newAddr.id);
                    setShowNewAddress(false);
                  }}
                />
              )}
            </CheckoutSection>

            {/* ── Section 2: Payment method ─────────────────────── */}
            <CheckoutSection
              icon={<CreditCard size={18} />}
              title="Payment Method"
            >
              <div className="space-y-2">
                {/* SSLCommerz */}
                <label className={`
                  flex items-center gap-3 p-4 rounded-xl border cursor-pointer
                  transition-colors duration-150
                  ${values.payment_method === 'sslcommerz'
                    ? 'border-black bg-gray-50'
                    : 'border-gray-200 hover:border-gray-400'
                  }
                `}>
                  <input
                    type="radio"
                    name="payment_method"
                    value="sslcommerz"
                    checked={values.payment_method === 'sslcommerz'}
                    onChange={() => setFieldValue('payment_method', 'sslcommerz')}
                    className="accent-black"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Online Payment
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Pay securely via SSLCommerz — cards, mobile banking, net banking
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {['bKash', 'Nagad', 'VISA'].map(m => (
                      <span
                        key={m}
                        className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </label>

                {/* Cash on Delivery */}
                <label className={`
                  flex items-center gap-3 p-4 rounded-xl border cursor-pointer
                  transition-colors duration-150
                  ${values.payment_method === 'cod'
                    ? 'border-black bg-gray-50'
                    : 'border-gray-200 hover:border-gray-400'
                  }
                `}>
                  <input
                    type="radio"
                    name="payment_method"
                    value="cod"
                    checked={values.payment_method === 'cod'}
                    onChange={() => setFieldValue('payment_method', 'cod')}
                    className="accent-black"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900">
                        Cash on Delivery
                      </p>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        Recommended
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Pay with cash when your order arrives
                    </p>
                  </div>
                  <Truck size={18} className="text-gray-400" />
                </label>
              </div>
            </CheckoutSection>

            {/* ── Section 3: Coupon ─────────────────────────────── */}
            <CheckoutSection
              icon={<Tag size={18} />}
              title="Coupon Code"
            >
              <div className="flex gap-2">
                <Input
                  placeholder="Enter coupon code (e.g. WELCOME10)"
                  {...getFieldProps('coupon_code')}
                  invalid={{ errors, touched }}
                  className="uppercase placeholder:normal-case"
                />
                <button
                  type="button"
                  onClick={() => {
                    // Coupon will be applied on order submission
                    // Just show a pending state here
                    if (values.coupon_code) {
                      setCouponApplied(true);
                      setCouponError('');
                    }
                  }}
                  className="shrink-0 px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Apply
                </button>
              </div>

              {couponApplied && values.coupon_code && (
                <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                  <ShieldCheck size={12} />
                  Coupon &quot;{values.coupon_code.toUpperCase()}&quot; will be applied at checkout.
                </p>
              )}

              {couponError && (
                <p className="text-xs text-red-500 mt-2">{couponError}</p>
              )}
            </CheckoutSection>

            {/* ── Section 4: Order notes ────────────────────────── */}
            <CheckoutSection
              icon={<Truck size={18} />}
              title="Order Notes (Optional)"
            >
              <textarea
                {...getFieldProps('notes')}
                placeholder="Special instructions for delivery, e.g. ring the bell twice..."
                rows={3}
                className="
                  w-full px-4 py-3 rounded-xl border border-gray-300
                  text-sm text-gray-700 placeholder:text-gray-400
                  outline-none focus:border-black focus:ring-2 focus:ring-gray-100
                  resize-none transition-all
                "
              />
              {touched.notes && errors.notes && (
                <p className="text-xs text-red-500 mt-1">{errors.notes}</p>
              )}
            </CheckoutSection>
          </div>

          {/* Right column — order summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-24">
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                Order Summary
              </h3>

              {/* Mobile toggle */}
              <button
                type="button"
                onClick={() => setShowOrderSummary(!showOrderSummary)}
                className="lg:hidden flex items-center justify-between w-full mb-3"
              >
                <span className="text-sm text-gray-600">
                  {cart?.total_items} items
                </span>
                {showOrderSummary
                  ? <ChevronUp size={16} />
                  : <ChevronDown size={16} />
                }
              </button>

              {/* Cart items */}
              <div className={`space-y-3 mb-4 ${showOrderSummary ? 'block' : 'hidden lg:block'}`}>
                {cart?.items.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    {/* Thumbnail */}
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                      {item.variant.product.image && (
                        <img
                          src={getImageUrl(item.variant.product.image)}
                          alt={item.variant.product.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                      {/* Qty badge */}
                      <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {item.qty}
                      </span>
                    </div>

                    {/* Name + attrs */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 line-clamp-1">
                        {item.variant.product.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {item.variant.attributes.map(a => a.value).join(' / ')}
                      </p>
                    </div>

                    {/* Line total */}
                    <span className="text-xs font-semibold text-gray-900 shrink-0">
                      {formatPrice(item.line_total)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-2 border-t border-gray-100 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span className={shippingFee === 0 ? 'text-green-600 font-medium' : 'font-medium'}>
                    {shippingFee === 0 ? 'Free' : formatPrice(shippingFee)}
                  </span>
                </div>

                {shippingFee > 0 && (
                  <p className="text-xs text-gray-400">
                    Add {formatPrice(freeThreshold - subtotal)} more for free shipping
                  </p>
                )}

                <div className="flex justify-between text-base font-semibold text-gray-900 pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              {/* Trust badges */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                <ShieldCheck size={16} className="text-green-600 shrink-0" />
                <p className="text-xs text-gray-500">
                  Secure checkout. Your data is protected.
                </p>
              </div>

              {/* Place order button */}
              <Button
                type="submit"
                fullWidth
                size="lg"
                isLoading={isSubmitting}
                className="mt-4"
              >
                {values.payment_method === 'cod'
                  ? 'Place Order'
                  : 'Proceed to Payment'
                }
              </Button>

              <p className="text-xs text-gray-400 text-center mt-3">
                By placing your order you agree to our{' '}
                <a href="#" className="underline">Terms of Service</a>.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

// ── Reusable section wrapper ──────────────────────────────────────
function CheckoutSection({
  icon,
  title,
  children,
}: {
  icon:     React.ReactNode;
  title:    string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-gray-500">{icon}</span>
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      </div>
      {children}
    </div>
  );
}

// ── New address inline form ───────────────────────────────────────
function NewAddressForm({ onSaved }: { onSaved: (addr: Address) => void }) {
  const [serverError, setServerError] = useState('');

  const {
    handleSubmit,
    getFieldProps,
    touched,
    errors,
    isSubmitting,
  } = useFormik({
    initialValues: {
      label:       'Home',
      line1:       '',
      line2:       '',
      city:        '',
      state:       '',
      postal_code: '',
      country:     'BD',
      is_default:  false,
    },

    validationSchema: Yup.object({
      label: Yup.string().required('Label is required'),
      line1: Yup.string().required('Address line 1 is required'),
      city:  Yup.string().required('City is required'),
    }),

    onSubmit: async (values) => {
      setServerError('');
      try {
        const res = await ordersApi.addAddress(values as any);
        // Last item in the returned array is the newly added address
        const newAddr = res.data[res.data.length - 1];
        onSaved(newAddr);
      } catch (error: any) {
        setServerError(error.message || 'Failed to save address.');
      }
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="mt-4 pt-4 border-t border-gray-100 space-y-3"
    >
      {serverError && (
        <p className="text-sm text-red-500">{serverError}</p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Label"
          placeholder="Home / Office"
          {...getFieldProps('label')}
          invalid={{ errors, touched }}
        />
        <Input
          label="Country"
          placeholder="BD"
          {...getFieldProps('country')}
          invalid={{ errors, touched }}
        />
      </div>

      <Input
        label="Address line 1"
        placeholder="House, Road, Area"
        {...getFieldProps('line1')}
        invalid={{ errors, touched }}
      />

      <Input
        label="Address line 2 (optional)"
        placeholder="Apartment, floor, etc."
        {...getFieldProps('line2')}
        invalid={{ errors, touched }}
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="City"
          placeholder="Dhaka"
          {...getFieldProps('city')}
          invalid={{ errors, touched }}
        />
        <Input
          label="Postal code"
          placeholder="1200"
          {...getFieldProps('postal_code')}
          invalid={{ errors, touched }}
        />
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          {...getFieldProps('is_default')}
          className="accent-black w-4 h-4"
        />
        <span className="text-sm text-gray-700">Set as default address</span>
      </label>

      <Button
        type="button"
        onClick={() => handleSubmit()}
        isLoading={isSubmitting}
        size="sm"
        variant="outline"
      >
        Save address
      </Button>
    </motion.div>
  );
}