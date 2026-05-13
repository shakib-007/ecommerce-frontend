// src/app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, Heart, MapPin, ArrowRight } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { Order } from '@/types';
import { formatPrice, formatDate, getOrderStatusColor } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import { ordersApi } from '@/lib/api/order';

export default function DashboardPage() {
  const user = useAppSelector(s => s.auth.user);

  const [orders,  setOrders]  = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersApi.getAll(1)
      .then(res => setOrders(res.data.slice(0, 3))) // show last 3 orders
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    {
      label: 'Total Orders',
      value: orders.length,
      icon:  Package,
      href:  '/dashboard/orders',
    },
    {
      label: 'Wishlist Items',
      value: '—',
      icon:  Heart,
      href:  '/dashboard/wishlist',
    },
    {
      label: 'Saved Addresses',
      value: '—',
      icon:  MapPin,
      href:  '/dashboard/profile',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          Welcome back, {user?.name.split(' ')[0]} 👋
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Here&apos;s what&apos;s happening with your account.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map(stat => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="bg-white rounded-2xl border border-gray-100 p-4 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon size={16} className="text-gray-400" />
                <span className="text-xs text-gray-500">{stat.label}</span>
              </div>
              <p className="text-2xl font-semibold text-gray-900">
                {stat.value}
              </p>
            </Link>
          );
        })}
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">
            Recent Orders
          </h2>
          <Link
            href="/dashboard/orders"
            className="text-xs text-gray-500 hover:text-black flex items-center gap-1 transition-colors"
          >
            View all
            <ArrowRight size={12} />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : orders.length === 0 ? (
          <div className="py-10 text-center">
            <Package size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No orders yet.</p>
            <Link
              href="/products"
              className="text-sm text-black font-medium hover:underline mt-1 inline-block"
            >
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {orders.map(order => (
              <Link
                key={order.id}
                href={`/dashboard/orders/${order.id}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {order.order_number}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatDate(order.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-900">
                    {formatPrice(order.total)}
                  </span>
                  <span className={`
                    text-xs px-2.5 py-0.5 rounded-full font-medium
                    ${getOrderStatusColor(order.status)}
                  `}>
                    {order.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}