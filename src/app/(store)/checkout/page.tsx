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
import { CheckoutSkeleton } from '@/components/skeletons/StoreSkeletons';

const initialValues = {
  address_id: '',
  payment_method: 'cod',
  coupon_code: '',
  notes: '',
};


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
    initialValues,

    validationSchema: Yup.object({
      address_id: Yup.string().required('Please select a delivery address'),
      payment_method: Yup.string().oneOf(['sslcommerz', 'cod']).required('Please select a payment method'),
      coupon_code: Yup.string().optional(),
      notes: Yup.string().max(500, 'Notes cannot exceed 500 characters').optional(),
    }),

    onSubmit: async (values: any) => {
      setServerError('');

      try {
        const orderRes = await ordersApi.place({ ...values });

        const order = orderRes.data;

        const paymentRes = await ordersApi.initiatePayment(order.id);

        dispatch(clearCart());
        if (values.payment_method === 'sslcommerz' && paymentRes.redirect_url) {
          window.location.href = paymentRes.redirect_url;
        } else {
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
    return <CheckoutSkeleton />;
  }

  return (
    <div className="container-store max-w-6xl py-8 md:py-10">
      <p className="section-eyebrow mb-2">Secure checkout</p>
      <h1 className="mb-8 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        Checkout
      </h1>

      {serverError && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600">{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

          <div className="space-y-6 lg:col-span-2">

            <CheckoutSection
              icon={<MapPin size={18} />}
              title="Delivery Address"
            >
              {addresses.length === 0 ? (
                <p className="mb-4 text-sm text-muted">
                  No saved addresses. Add one below.
                </p>
              ) : (
                <div className="mb-4 space-y-2">
                  {addresses.map(addr => (
                    <label
                      key={addr.id}
                      className={`
                        flex cursor-pointer items-start gap-3 rounded-xl border p-4
                        transition-colors duration-150
                        ${values.address_id === addr.id
                          ? 'border-ink bg-surface-muted'
                          : 'border-border hover:border-border-strong'
                        }
                      `}
                    >
                      <input
                        type="radio"
                        name="address_id"
                        value={addr.id}
                        checked={values.address_id === addr.id}
                        onChange={() => setFieldValue('address_id', addr.id)}
                        className="mt-0.5 accent-accent"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-ink">
                            {addr.label}
                          </span>
                          {addr.is_default && (
                            <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs text-ink">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-sm text-muted">
                          {addr.line1}
                          {addr.line2 && `, ${addr.line2}`}
                        </p>
                        <p className="text-sm text-muted">
                          {addr.city}{addr.state && `, ${addr.state}`} {addr.postal_code}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {touched.address_id && errors.address_id && (
                <p className="mb-3 text-xs text-red-500">{errors.address_id as string}</p>
              )}

              <button
                type="button"
                onClick={() => setShowNewAddress(!showNewAddress)}
                className="flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-hover"
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
                <label className={`
                  flex cursor-pointer items-center gap-3 rounded-xl border p-4
                  transition-colors duration-150
                  ${values.payment_method === 'sslcommerz'
                    ? 'border-ink bg-surface-muted'
                    : 'border-border hover:border-border-strong'
                  }
                `}>
                  <input
                    type="radio"
                    name="payment_method"
                    value="sslcommerz"
                    checked={values.payment_method === 'sslcommerz'}
                    onChange={() => setFieldValue('payment_method', 'sslcommerz')}
                    className="accent-accent"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-ink">
                      Online Payment
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      Pay securely via SSLCommerz — cards, mobile banking, net banking
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {['bKash', 'Nagad', 'VISA'].map(m => (
                      <span
                        key={m}
                        className="rounded bg-surface-warm px-1.5 py-0.5 text-xs text-muted"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </label>

                <label className={`
                  flex cursor-pointer items-center gap-3 rounded-xl border p-4
                  transition-colors duration-150
                  ${values.payment_method === 'cod'
                    ? 'border-ink bg-surface-muted'
                    : 'border-border hover:border-border-strong'
                  }
                `}>
                  <input
                    type="radio"
                    name="payment_method"
                    value="cod"
                    checked={values.payment_method === 'cod'}
                    onChange={() => setFieldValue('payment_method', 'cod')}
                    className="accent-accent"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-ink">
                        Cash on Delivery
                      </p>
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">
                        Recommended
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted">
                      Pay with cash when your order arrives
                    </p>
                  </div>
                  <Truck size={18} className="text-muted-light" />
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
                  className="shrink-0 rounded-lg bg-surface-muted px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-surface-warm"
                >
                  Apply
                </button>
              </div>

              {couponApplied && values.coupon_code && (
                <p className="mt-2 flex items-center gap-1 text-xs text-emerald-700">
                  <ShieldCheck size={12} />
                  Coupon &quot;{values.coupon_code.toUpperCase()}&quot; will be applied at checkout.
                </p>
              )}

              {couponError && (
                <p className="mt-2 text-xs text-red-500">{couponError}</p>
              )}
            </CheckoutSection>

            <CheckoutSection
              icon={<Truck size={18} />}
              title="Order Notes (Optional)"
            >
              <textarea
                {...getFieldProps('notes')}
                placeholder="Special instructions for delivery, e.g. ring the bell twice..."
                rows={3}
                className="
                  w-full resize-none rounded-lg border border-border-strong px-4 py-3
                  text-sm text-ink placeholder:text-muted-light
                  outline-none transition-all focus:border-ink focus:ring-2 focus:ring-accent-soft
                "
              />
              {touched.notes && errors.notes && (
                <p className="mt-1 text-xs text-red-500">{errors.notes as string}</p>
              )}
            </CheckoutSection>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-border bg-surface p-5">
              <h3 className="mb-4 font-display text-lg font-semibold text-ink">
                Order Summary
              </h3>

              <button
                type="button"
                onClick={() => setShowOrderSummary(!showOrderSummary)}
                className="mb-3 flex w-full items-center justify-between lg:hidden"
              >
                <span className="text-sm text-muted">
                  {cart?.total_items} items
                </span>
                {showOrderSummary
                  ? <ChevronUp size={16} />
                  : <ChevronDown size={16} />
                }
              </button>

              <div className={`mb-4 space-y-3 ${showOrderSummary ? 'block' : 'hidden lg:block'}`}>
                {cart?.items.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-surface-warm">
                      {item.variant.product.image && (
                        <img
                          src={getImageUrl(item.variant.product.image)}
                          alt={item.variant.product.name}
                          className="h-full w-full object-contain p-0.5"
                        />
                      )}
                      <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] text-white">
                        {item.qty}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-xs font-medium text-ink">
                        {item.variant.product.name}
                      </p>
                      <p className="text-xs text-muted-light">
                        {item.variant.attributes.map(a => a.value).join(' / ')}
                      </p>
                    </div>

                    <span className="shrink-0 text-xs font-semibold text-ink">
                      {formatPrice(item.line_total)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t border-border pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Subtotal</span>
                  <span className="font-medium text-ink">{formatPrice(subtotal)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted">Shipping</span>
                  <span className={shippingFee === 0 ? 'font-medium text-emerald-700' : 'font-medium text-ink'}>
                    {shippingFee === 0 ? 'Free' : formatPrice(shippingFee)}
                  </span>
                </div>

                {shippingFee > 0 && (
                  <p className="text-xs text-muted-light">
                    Add {formatPrice(freeThreshold - subtotal)} more for free shipping
                  </p>
                )}

                <div className="flex justify-between border-t border-border pt-2 text-base font-semibold text-ink">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
                <ShieldCheck size={16} className="shrink-0 text-emerald-600" />
                <p className="text-xs text-muted">
                  Secure checkout. Your data is protected.
                </p>
              </div>

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

              <p className="mt-3 text-center text-xs text-muted-light">
                By placing your order you agree to our{' '}
                <a href="#" className="underline hover:text-ink">Terms of Service</a>.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

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
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-accent">{icon}</span>
        <h2 className="text-base font-semibold text-ink">{title}</h2>
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