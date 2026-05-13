'use client';

import { useEffect, useState } from 'react';
import {
  TrendingUp, ShoppingBag,
  Users, Package, ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { adminApi } from '@/lib/api/admin';
import { formatPrice, formatDate, getOrderStatusColor } from '@/lib/utils';
import Spinner from '@/components/ui/Spinner';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const [data,    setData]    = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getDashboard()
      .then(res => setData(res))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (!data) return null;

  const { stats, recent_orders, top_products, revenue_chart } = data;

  const statCards = [
    {
      label:    'Total Revenue',
      value:    formatPrice(stats.revenue.total),
      sub:      `${stats.revenue.growth >= 0 ? '+' : ''}${stats.revenue.growth}% this month`,
      positive: stats.revenue.growth >= 0,
      icon:     TrendingUp,
      color:    'bg-green-50 text-green-600',
    },
    {
      label:    'Total Orders',
      value:    stats.orders.total,
      sub:      `${stats.orders.this_month} this month`,
      positive: true,
      icon:     ShoppingBag,
      color:    'bg-blue-50 text-blue-600',
    },
    {
      label:    'Customers',
      value:    stats.customers.total,
      sub:      `${stats.customers.this_month} new this month`,
      positive: true,
      icon:     Users,
      color:    'bg-purple-50 text-purple-600',
    },
    {
      label:    'Products',
      value:    stats.products.total,
      sub:      `${stats.products.out_of_stock} out of stock`,
      positive: stats.products.out_of_stock === 0,
      icon:     Package,
      color:    'bg-orange-50 text-orange-600',
    },
  ];

  return (
    <div className="space-y-6">

      {/* Page title */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Welcome back. Here&apos;s what&apos;s happening today.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-2xl border border-gray-100 p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-500 font-medium">
                  {card.label}
                </span>
                <div className={`p-2 rounded-xl ${card.color}`}>
                  <Icon size={14} />
                </div>
              </div>

              <p className="text-2xl font-bold text-gray-900 mb-1">
                {card.value}
              </p>

              <div className="flex items-center gap-1">
                {card.positive
                  ? <ArrowUpRight size={12} className="text-green-500" />
                  : <ArrowDownRight size={12} className="text-red-500" />
                }
                <span className={`text-xs ${card.positive ? 'text-green-600' : 'text-red-500'}`}>
                  {card.sub}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pending orders alert */}
      {stats.orders.pending > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingBag size={18} className="text-yellow-600" />
            <p className="text-sm text-yellow-800">
              <span className="font-semibold">{stats.orders.pending} orders</span> are
              waiting for confirmation.
            </p>
          </div>
          <Link
            href="/admin/orders?status=pending"
            className="text-xs font-medium text-yellow-700 hover:underline shrink-0"
          >
            View →
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">
              Recent Orders
            </h2>
            <Link
              href="/admin/orders"
              className="text-xs text-gray-500 hover:text-black transition-colors"
            >
              View all →
            </Link>
          </div>

          <div className="divide-y divide-gray-50">
            {recent_orders?.map((order: any) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900 font-mono">
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
                    text-xs px-2 py-0.5 rounded-full font-medium capitalize
                    ${getOrderStatusColor(order.status)}
                  `}>
                    {order.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Top products */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">
              Top Products
            </h2>
          </div>

          <div className="divide-y divide-gray-50">
            {top_products?.map((product: any, index: number) => (
              <div
                key={product.id}
                className="flex items-center gap-3 px-5 py-3.5"
              >
                <span className="text-xs font-bold text-gray-400 w-4 shrink-0">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 line-clamp-1">
                    {product.name}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {product.total_sold} sold
                  </p>
                </div>
                <span className="text-xs font-semibold text-gray-900 shrink-0">
                  {formatPrice(product.total_revenue)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}