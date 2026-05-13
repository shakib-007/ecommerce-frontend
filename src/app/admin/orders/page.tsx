'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, ShoppingBag } from 'lucide-react';
import { adminApi } from '@/lib/api/admin';
import { formatPrice, formatDate, getOrderStatusColor } from '@/lib/utils';
import Spinner from '@/components/ui/Spinner';

const STATUS_TABS = [
  { label: 'All',        value: ''           },
  { label: 'Pending',    value: 'pending'    },
  { label: 'Confirmed',  value: 'confirmed'  },
  { label: 'Processing', value: 'processing' },
  { label: 'Shipped',    value: 'shipped'    },
  { label: 'Delivered',  value: 'delivered'  },
  { label: 'Cancelled',  value: 'cancelled'  },
];

export default function AdminOrdersPage() {
  const searchParams = useSearchParams();
  const router       = useRouter();

  const [orders,  setOrders]  = useState<any[]>([]);
  const [meta,    setMeta]    = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [page,    setPage]    = useState(1);

  const status = searchParams.get('status') ?? '';

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getOrders({
        search,
        status: status || undefined,
        page,
        per_page: 15,
      });
      setOrders(res.data);
      setMeta(res.meta);
    } finally {
      setLoading(false);
    }
  }, [search, status, page]);

  useEffect(() => {
    const timer = setTimeout(fetchOrders, 300);
    return () => clearTimeout(timer);
  }, [fetchOrders]);

  function setStatus(val: string) {
    const params = new URLSearchParams();
    if (val) params.set('status', val);
    router.push(`/admin/orders?${params.toString()}`);
    setPage(1);
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Orders</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {meta?.total ?? 0} orders total
        </p>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setStatus(tab.value)}
            className={`
              shrink-0 px-3 py-1.5 rounded-xl text-sm font-medium
              transition-colors duration-150
              ${status === tab.value
                ? 'bg-black text-white'
                : 'text-gray-600 hover:bg-gray-100'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="Search by order number or customer..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:border-black transition-colors"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <ShoppingBag size={36} className="text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">No orders found.</p>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="hidden sm:grid grid-cols-12 gap-4 px-5 py-3 border-b border-gray-100 text-xs font-medium text-gray-400 uppercase tracking-wider">
              <span className="col-span-3">Order</span>
              <span className="col-span-3">Customer</span>
              <span className="col-span-2">Date</span>
              <span className="col-span-2">Total</span>
              <span className="col-span-1">Payment</span>
              <span className="col-span-1">Status</span>
            </div>

            <div className="divide-y divide-gray-50">
              {orders.map(order => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-gray-50 transition-colors"
                >
                  {/* Order number */}
                  <div className="col-span-3">
                    <p className="text-sm font-medium text-gray-900 font-mono">
                      {order.order_number}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {order.items_count} item{order.items_count !== 1 ? 's' : ''}
                    </p>
                  </div>

                  {/* Customer */}
                  <div className="col-span-3 hidden sm:block min-w-0">
                    <p className="text-sm text-gray-900 truncate">
                      {order.user?.name ?? '—'}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {order.user?.email}
                    </p>
                  </div>

                  {/* Date */}
                  <div className="col-span-2 hidden sm:block">
                    <p className="text-sm text-gray-600">
                      {formatDate(order.created_at)}
                    </p>
                  </div>

                  {/* Total */}
                  <div className="col-span-2 hidden sm:block">
                    <p className="text-sm font-semibold text-gray-900">
                      {formatPrice(order.total)}
                    </p>
                  </div>

                  {/* Payment status */}
                  <div className="col-span-1 hidden sm:block">
                    <span className={`
                      text-xs px-2 py-0.5 rounded-full font-medium capitalize
                      ${order.latest_payment?.status === 'paid'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                      }
                    `}>
                      {order.latest_payment?.status ?? 'pending'}
                    </span>
                  </div>

                  {/* Order status */}
                  <div className="col-span-1">
                    <span className={`
                      text-xs px-2 py-0.5 rounded-full font-medium capitalize
                      ${getOrderStatusColor(order.status)}
                    `}>
                      {order.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
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
            {meta.current_page} / {meta.last_page}
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
    </div>
  );
}