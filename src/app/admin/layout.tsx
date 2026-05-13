'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, Package, ShoppingBag,
  Users, Tag, Settings, LogOut,
  ChevronLeft, Menu, X, Shield,
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { authApi } from '@/lib/api/auth';

const NAV_ITEMS = [
  {
    href:  '/admin',
    label: 'Dashboard',
    icon:  LayoutDashboard,
    exact: true,
  },
  {
    href:  '/admin/products',
    label: 'Products',
    icon:  Package,
    exact: false,
  },
  {
    href:  '/admin/orders',
    label: 'Orders',
    icon:  ShoppingBag,
    exact: false,
  },
  {
    href:  '/admin/users',
    label: 'Users',
    icon:  Users,
    exact: false,
  },
  {
    href:  '/admin/coupons',
    label: 'Coupons',
    icon:  Tag,
    exact: false,
  },
  {
    href:  '/admin/settings',
    label: 'Settings',
    icon:  Settings,
    exact: false,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router   = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();

  const { user, isAuthenticated, isLoading } = useAppSelector(s => s.auth);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Protect admin routes
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'admin')) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, user]);

  async function handleLogout() {
    try { await authApi.logout(); } catch {}
    dispatch(logout());
    router.push('/');
  }

  function isActive(item: typeof NAV_ITEMS[0]): boolean {
    return item.exact
      ? pathname === item.href
      : pathname.startsWith(item.href);
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Shield size={18} className="text-black" />
          <span className="font-bold text-gray-900">Admin Panel</span>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100"
        >
          <X size={16} />
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(item => {
          const Icon   = item.icon;
          const active = isActive(item);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`
                flex items-center gap-3 px-3 py-2.5
                rounded-xl text-sm font-medium
                transition-colors duration-150
                ${active
                  ? 'bg-black text-white'
                  : 'text-gray-600 hover:bg-gray-100'
                }
              `}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: user info + links */}
      <div className="border-t border-gray-100 p-3 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft size={16} />
          Back to store
        </Link>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut size={16} />
          Sign out
        </button>

        {/* Admin user info */}
        <div className="flex items-center gap-2 px-3 py-2 mt-1">
          <div className="w-7 h-7 bg-black text-white rounded-full flex items-center justify-center text-xs font-semibold shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-900 truncate">
              {user.name}
            </p>
            <p className="text-xs text-gray-400 truncate">
              Administrator
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 bg-white border-r border-gray-100 fixed inset-y-0 left-0 z-30">
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-56 bg-white border-r border-gray-100 lg:hidden flex flex-col">
            <Sidebar />
          </aside>
        </>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-56 flex flex-col min-h-screen">

        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3 flex items-center gap-3 sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <Menu size={18} />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Admin</span>
            {pathname !== '/admin' && (
              <>
                <span>/</span>
                <span className="text-gray-900 font-medium capitalize">
                  {pathname.split('/')[2]}
                </span>
              </>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}