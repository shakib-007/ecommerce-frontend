'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, ChevronRight } from 'lucide-react';
import { Order, PaginationMeta } from '@/types';
import { formatPrice, formatDate, getOrderStatusColor } from '@/lib/utils';
import Spinner from '@/components/ui/Spinner';
import { ordersApi } from '@/lib/api/order';

export default function OrdersPage() {
  const [orders,  setOrders]  = useState<Order[]>([]);
  const [meta,    setMeta]    = useState<PaginationMeta | null>(null);
  const [page,    setPage]    = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    ordersApi.getAll(page)
      .then(res => {
        setOrders(res.data);
        setMeta(res.meta);
      })
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">My Orders</h1>
        <p className="text-sm text-gray-500 mt-1">
          Track and manage all your orders.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
          <Package size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-900 mb-1">
            No orders yet
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Your order history will appear here.
          </p>
          <Link
            href="/products"
            className="text-sm bg-black text-white px-5 py-2.5 rounded-xl hover:bg-gray-800 transition-colors"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {/* Table header */}
            <div className="hidden sm:grid grid-cols-5 gap-4 px-5 py-3 border-b border-gray-100 text-xs font-medium text-gray-400 uppercase tracking-wider">
              <span className="col-span-2">Order</span>
              <span>Date</span>
              <span>Total</span>
              <span>Status</span>
            </div>

            {/* Order rows */}
            <div className="divide-y divide-gray-50">
              {orders.map(order => (
                <Link
                  key={order.id}
                  href={`/dashboard/orders/${order.id}`}
                  className="
                    flex sm:grid sm:grid-cols-5 sm:gap-4
                    items-center px-5 py-4
                    hover:bg-gray-50 transition-colors
                    group
                  "
                >
                  {/* Order number + items count */}
                  <div className="col-span-2 min-w-0">
                    <p className="text-sm font-medium text-gray-900 font-mono">
                      {order.order_number}
                    </p>
                    {order.total_items !== undefined && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {order.total_items} item{order.total_items !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>

                  {/* Date */}
                  <div className="hidden sm:block">
                    <p className="text-sm text-gray-600">
                      {formatDate(order.created_at)}
                    </p>
                  </div>

                  {/* Total */}
                  <div className="hidden sm:block">
                    <p className="text-sm font-semibold text-gray-900">
                      {formatPrice(order.total)}
                    </p>
                  </div>

                  {/* Status + arrow */}
                  <div className="flex items-center justify-between sm:justify-start gap-3 ml-auto sm:ml-0">
                    <span className={`
                      text-xs px-2.5 py-1 rounded-full font-medium capitalize
                      ${getOrderStatusColor(order.status)}
                    `}>
                      {order.status}
                    </span>
                    <ChevronRight
                      size={16}
                      className="text-gray-400 group-hover:text-black transition-colors"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Pagination */}
          {meta && meta.last_page > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm border border-gray-300 rounded-xl disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                ← Prev
              </button>
              <span className="text-sm text-gray-500">
                Page {meta.current_page} of {meta.last_page}
              </span>
              <button
                onClick={() => setPage(p => Math.min(meta.last_page, p + 1))}
                disabled={page === meta.last_page}
                className="px-4 py-2 text-sm border border-gray-300 rounded-xl disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}