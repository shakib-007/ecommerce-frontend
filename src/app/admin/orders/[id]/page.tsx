'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Package,
  MapPin, CreditCard, User,
} from 'lucide-react';
import { adminApi } from '@/lib/api/admin';
import {
  formatPrice, formatDate,
  getImageUrl, getOrderStatusColor,
  getPaymentStatusColor,
} from '@/lib/utils';
import Spinner from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';

// Allowed status transitions — matches backend logic
const TRANSITIONS: Record<string, string[]> = {
  pending:    ['confirmed', 'cancelled'],
  confirmed:  ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped:    ['delivered'],
  delivered:  ['refunded'],
  cancelled:  [],
  refunded:   [],
};

export default function AdminOrderDetailPage() {
  const params  = useParams();
  const router  = useRouter();
  const orderId = params.id as string;

  const [order,    setOrder]    = useState<any>(null);
  const [loading,  setLoading]  = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    adminApi.getOrderById(orderId)
      .then(res => setOrder(res.data))
      .catch(() => router.push('/admin/orders'))
      .finally(() => setLoading(false));
  }, [orderId]);

  async function updateStatus(newStatus: string) {
    setUpdating(true);
    try {
      const res = await adminApi.updateOrderStatus(order.id, newStatus);
      setOrder(res.data);
    } catch (error: any) {
      alert(error.message || 'Failed to update status.');
    } finally {
      setUpdating(false);
    }
  }

  async function confirmCod() {
    setUpdating(true);
    try {
      await adminApi.confirmCod(order.id);
      // Reload order
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/orders/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
            Accept: 'application/json',
          },
        }
      );
      const data = await res.json();
      setOrder(data.data);
    } catch (error: any) {
      alert(error.message || 'Failed to confirm COD payment.');
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (!order) return null;

  const allowedTransitions = TRANSITIONS[order.status] ?? [];
  const isCod = order.payment?.gateway === 'cod';
  const isPaid = order.payment?.status === 'paid';

  return (
    <div className="space-y-5 max-w-4xl">

      {/* Back + header */}
      <div>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-black transition-colors mb-3"
        >
          <ArrowLeft size={15} />
          Back to orders
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 font-mono">
              {order.order_number}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Placed on {formatDate(order.created_at)}
            </p>
          </div>

          <span className={`
            self-start text-sm px-3 py-1.5
            rounded-full font-medium capitalize
            ${getOrderStatusColor(order.status)}
          `}>
            {order.status}
          </span>
        </div>
      </div>

      {/* Status update */}
      {allowedTransitions.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">
            Update Status
          </h2>
          <div className="flex flex-wrap gap-2">
            {allowedTransitions.map(status => (
              <Button
                key={status}
                size="sm"
                variant={status === 'cancelled' ? 'danger' : 'primary'}
                isLoading={updating}
                onClick={() => updateStatus(status)}
                className="capitalize"
              >
                Mark as {status}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* COD confirmation */}
      {isCod && !isPaid && order.status === 'delivered' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-center justify-between">
          <p className="text-sm text-yellow-800">
            This is a COD order. Confirm payment was collected on delivery.
          </p>
          <Button
            size="sm"
            isLoading={updating}
            onClick={confirmCod}
          >
            Confirm COD Payment
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

        {/* Customer info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-3">
            <User size={15} className="text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-900">Customer</h2>
          </div>
          <p className="text-sm font-medium text-gray-900">
            {order.user?.name}
          </p>
          <p className="text-sm text-gray-500 mt-0.5">
            {order.user?.email}
          </p>
          {order.user?.phone && (
            <p className="text-sm text-gray-500">{order.user.phone}</p>
          )}
        </div>

        {/* Delivery address */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={15} className="text-gray-400" />
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
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-400">Not available</p>
          )}
        </div>

        {/* Payment */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard size={15} className="text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-900">Payment</h2>
          </div>
          {order.payment ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Method</span>
                <span className="font-medium text-gray-900 capitalize">
                  {order.payment.gateway === 'cod' ? 'Cash on Delivery' : 'SSLCommerz'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className={`
                  text-xs px-2 py-0.5 rounded-full font-medium capitalize
                  ${getPaymentStatusColor(order.payment.status)}
                `}>
                  {order.payment.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Amount</span>
                <span className="font-semibold text-gray-900">
                  {formatPrice(order.payment.amount)}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400">No payment record</p>
          )}
        </div>
      </div>

      {/* Order items */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Order Items</h2>
        </div>

        <div className="divide-y divide-gray-50">
          {order.items?.map((item: any) => (
            <div key={item.id} className="flex items-center gap-4 px-5 py-4">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                {item.image ? (
                  <img
                    src={getImageUrl(item.image)}
                    alt={item.product_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package size={14} className="text-gray-300" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 line-clamp-1">
                  {item.product_name}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  SKU: {item.sku}
                </p>
                {Object.entries(item.attributes || {}).length > 0 && (
                  <p className="text-xs text-gray-400">
                    {Object.entries(item.attributes)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(' · ')
                    }
                  </p>
                )}
              </div>

              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-gray-900">
                  {formatPrice(item.line_total)}
                </p>
                <p className="text-xs text-gray-400">
                  {formatPrice(item.unit_price)} × {item.qty}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="border-t border-gray-100 px-5 py-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          {order.discount_total > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Discount</span>
              <span className="text-green-600">-{formatPrice(order.discount_total)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Shipping</span>
            <span>
              {order.shipping_fee === 0
                ? <span className="text-green-600">Free</span>
                : formatPrice(order.shipping_fee)
              }
            </span>
          </div>
          <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-100">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}