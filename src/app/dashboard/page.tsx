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
      <div>
        <h2 className="font-display text-2xl font-semibold text-ink">
          Welcome back, {user?.name.split(' ')[0]}
        </h2>
        <p className="mt-1 text-sm text-muted">
          Here&apos;s what&apos;s happening with your account.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {stats.map(stat => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-border-strong"
            >
              <div className="mb-2 flex items-center gap-2">
                <Icon size={16} className="text-accent" />
                <span className="text-xs text-muted">{stat.label}</span>
              </div>
              <p className="text-2xl font-semibold text-ink">
                {stat.value}
              </p>
            </Link>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold text-ink">
            Recent Orders
          </h2>
          <Link
            href="/dashboard/orders"
            className="flex items-center gap-1 text-xs text-accent transition-colors hover:text-accent-hover"
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
            <Package size={32} className="mx-auto mb-3 text-muted-light" />
            <p className="text-sm text-muted">No orders yet.</p>
            <Link
              href="/products"
              className="mt-1 inline-block text-sm font-medium text-accent hover:text-accent-hover"
            >
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {orders.map(order => (
              <Link
                key={order.id}
                href={`/dashboard/orders/${order.id}`}
                className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-surface-muted"
              >
                <div>
                  <p className="text-sm font-medium text-ink">
                    {order.order_number}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-light">
                    {formatDate(order.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-ink">
                    {formatPrice(order.total)}
                  </span>
                  <span className={`
                    rounded-full px-2.5 py-0.5 text-xs font-medium
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