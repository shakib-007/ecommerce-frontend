// src/app/dashboard/orders/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Package, MapPin,
  CreditCard, CheckCircle, Circle,
  Truck, Home, ClipboardList,
} from 'lucide-react';
import { OrderDetail } from '@/types';
import { formatPrice, formatDate, getImageUrl, getOrderStatusColor, getPaymentStatusColor } from '@/lib/utils';
import Spinner from '@/components/ui/Spinner';
import { ordersApi } from '@/lib/api/order';

// Status steps for the tracking timeline
const ORDER_STEPS = [
  { status: 'pending',    label: 'Order Placed',  icon: ClipboardList },
  { status: 'confirmed',  label: 'Confirmed',     icon: CheckCircle   },
  { status: 'processing', label: 'Processing',    icon: Package       },
  { status: 'shipped',    label: 'Shipped',       icon: Truck         },
  { status: 'delivered',  label: 'Delivered',     icon: Home          },
];

const STATUS_ORDER = [
  'pending', 'confirmed', 'processing', 'shipped', 'delivered'
];

export default function OrderDetailPage() {
  const params  = useParams();
  const router  = useRouter();
  const orderId = params.id as string;

  const [order,   setOrder]   = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersApi.getById(orderId)
      .then(res => setOrder(res.data))
      .catch(() => router.push('/dashboard/orders'))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (!order) return null;

  // Determine current step index for tracking
  const currentStepIndex = STATUS_ORDER.indexOf(order.status);
  const isCancelled  = order.status === 'cancelled';
  const isRefunded   = order.status === 'refunded';
  const showTimeline = !isCancelled && !isRefunded;

  return (
    <div className="space-y-5">
      {/* Back button + header */}
      <div>
        <Link
          href="/dashboard/orders"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-black transition-colors mb-3"
        >
          <ArrowLeft size={15} />
          Back to orders
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 font-mono">
              {order.order_number}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Placed on {formatDate(order.created_at)}
            </p>
          </div>

          <span className={`
            self-start sm:self-auto
            text-sm px-3 py-1.5 rounded-full font-medium capitalize
            ${getOrderStatusColor(order.status)}
          `}>
            {order.status}
          </span>
        </div>
      </div>

      {/* Status timeline */}
      {showTimeline && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-5">
            Order Tracking
          </h2>

          <div className="relative">
            {/* Progress line */}
            <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-100" />
            <div
              className="absolute top-4 left-4 h-0.5 bg-black transition-all duration-500"
              style={{
                width: currentStepIndex <= 0
                  ? '0%'
                  : `${(currentStepIndex / (ORDER_STEPS.length - 1)) * 100}%`,
              }}
            />

            {/* Steps */}
            <div className="relative flex justify-between">
              {ORDER_STEPS.map((step, index) => {
                const isCompleted = index <= currentStepIndex;
                const isCurrent   = index === currentStepIndex;
                const Icon        = step.icon;

                return (
                  <div
                    key={step.status}
                    className="flex flex-col items-center gap-2"
                  >
                    {/* Circle */}
                    <motion.div
                      initial={false}
                      animate={{
                        backgroundColor: isCompleted ? '#000' : '#f3f4f6',
                        scale: isCurrent ? 1.1 : 1,
                      }}
                      className={`
                        w-8 h-8 rounded-full flex items-center justify-center
                        border-2 transition-colors
                        ${isCompleted
                          ? 'border-black bg-black'
                          : 'border-gray-200 bg-gray-100'
                        }
                      `}
                    >
                      <Icon
                        size={14}
                        className={isCompleted ? 'text-white' : 'text-gray-400'}
                      />
                    </motion.div>

                    {/* Label */}
                    <span className={`
                      text-xs text-center leading-tight
                      ${isCompleted ? 'text-gray-900 font-medium' : 'text-gray-400'}
                    `}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Cancelled / Refunded banner */}
      {(isCancelled || isRefunded) && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700">
          This order was {order.status}.
          {order.payment?.status === 'refunded' && ' A refund has been initiated.'}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

        {/* Delivery address */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={16} className="text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-900">
              Delivery Address
            </h2>
          </div>
          {order.address ? (
            <div className="text-sm text-gray-600 space-y-0.5">
              <p className="font-medium text-gray-900">{order.address.label}</p>
              <p>{order.address.line1}</p>
              {order.address.line2 && <p>{order.address.line2}</p>}
              <p>
                {order.address.city}
                {order.address.state && `, ${order.address.state}`}
                {order.address.postal_code && ` ${order.address.postal_code}`}
              </p>
              <p>{order.address.country}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-400">Address not available</p>
          )}
        </div>

        {/* Payment info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard size={16} className="text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-900">
              Payment
            </h2>
          </div>
          {order.payment ? (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Method</span>
                <span className="font-medium capitalize text-gray-900">
                  {order.payment.gateway === 'cod'
                    ? 'Cash on Delivery'
                    : 'SSLCommerz'
                  }
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Status</span>
                <span className={`
                  text-xs px-2 py-0.5 rounded-full font-medium capitalize
                  ${getPaymentStatusColor(order.payment.status)}
                `}>
                  {order.payment.status}
                </span>
              </div>
              {order.payment.paid_at && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Paid on</span>
                  <span className="text-gray-900">
                    {formatDate(order.payment.paid_at)}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-400">Payment info not available</p>
          )}
        </div>
      </div>

      {/* Order items */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">
            Order Items
          </h2>
        </div>

        <div className="divide-y divide-gray-50">
          {order.items.map(item => (
            <div key={item.id} className="flex items-center gap-4 px-5 py-4">
              {/* Image */}
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                {item.image ? (
                  <img
                    src={getImageUrl(item.image)}
                    alt={item.product_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <Package size={16} className="text-gray-300" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 line-clamp-1">
                  {item.product_name}
                </p>

                {/* Attributes from snapshot */}
                {Object.entries(item.attributes).length > 0 && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {Object.entries(item.attributes)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(' · ')
                    }
                  </p>
                )}

                <p className="text-xs text-gray-400 mt-0.5">
                  SKU: {item.sku}
                </p>
              </div>

              {/* Qty + price */}
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-gray-900">
                  {formatPrice(item.line_total)}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {formatPrice(item.unit_price)} × {item.qty}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Order totals */}
        <div className="border-t border-gray-100 px-5 py-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span className="font-medium">{formatPrice(order.subtotal)}</span>
          </div>

          {order.discount_total > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">
                Discount
                {order.coupons?.length > 0 && (
                  <span className="ml-1 text-xs text-green-600">
                    ({order.coupons.map(c => c.code).join(', ')})
                  </span>
                )}
              </span>
              <span className="text-green-600 font-medium">
                -{formatPrice(order.discount_total)}
              </span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Shipping</span>
            <span className="font-medium">
              {order.shipping_fee === 0
                ? <span className="text-green-600">Free</span>
                : formatPrice(order.shipping_fee)
              }
            </span>
          </div>

          <div className="flex justify-between text-base font-semibold text-gray-900 pt-2 border-t border-gray-100">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Order notes */}
      {order.notes && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-2">
            Order Notes
          </h2>
          <p className="text-sm text-gray-600">{order.notes}</p>
        </div>
      )}
    </div>
  );
}