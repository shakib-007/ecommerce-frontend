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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
      </div>
    );
  }

  const Sidebar = () => (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <Shield size={18} className="text-accent" />
          <span className="font-display text-base font-semibold text-ink">Admin</span>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="rounded-lg p-1.5 hover:bg-surface-muted lg:hidden"
        >
          <X size={16} />
        </button>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {NAV_ITEMS.map(item => {
          const Icon   = item.icon;
          const active = isActive(item);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`
                flex items-center gap-3 rounded-lg px-3 py-2.5
                text-sm font-medium transition-colors duration-150
                ${active
                  ? 'bg-accent text-white'
                  : 'text-muted hover:bg-surface-muted hover:text-ink'
                }
              `}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-border p-3">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted transition-colors hover:bg-surface-muted hover:text-ink"
        >
          <ChevronLeft size={16} />
          Back to store
        </Link>

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50"
        >
          <LogOut size={16} />
          Sign out
        </button>

        <div className="mt-1 flex items-center gap-2 px-3 py-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-semibold text-white">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-ink">
              {user.name}
            </p>
            <p className="truncate text-xs text-muted-light">
              Administrator
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-56 flex-col border-r border-border bg-surface lg:flex">
        <Sidebar />
      </aside>

      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-ink/35 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-56 flex-col border-r border-border bg-surface lg:hidden">
            <Sidebar />
          </aside>
        </>
      )}

      <div className="flex min-h-screen flex-1 flex-col lg:ml-56">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-surface/90 px-4 py-3 backdrop-blur-md sm:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 transition-colors hover:bg-surface-muted lg:hidden"
          >
            <Menu size={18} />
          </button>

          <div className="flex items-center gap-2 text-sm text-muted">
            <span>Admin</span>
            {pathname !== '/admin' && (
              <>
                <span>/</span>
                <span className="font-medium capitalize text-ink">
                  {pathname.split('/')[2]}
                </span>
              </>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}