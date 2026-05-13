// src/app/dashboard/layout.tsx
'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, Package,
  Heart, User, LogOut,
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { authApi } from '@/lib/api/auth';
import Button from '@/components/ui/Button';

const NAV_ITEMS = [
  { href: '/dashboard',         label: 'Overview',   icon: LayoutDashboard },
  { href: '/dashboard/orders',  label: 'My Orders',  icon: Package         },
  { href: '/dashboard/wishlist',label: 'Wishlist',   icon: Heart           },
  { href: '/dashboard/profile', label: 'Profile',    icon: User            },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router          = useRouter();
  const pathname        = usePathname();
  const dispatch        = useAppDispatch();
  const { user, isAuthenticated, isLoading } = useAppSelector(s => s.auth);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading]);

  async function handleLogout() {
    try {
      await authApi.logout();
    } catch {}
    dispatch(logout());
    router.push('/');
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">

        {/* Sidebar */}
        <aside className="w-full lg:w-60 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">

            {/* User info */}
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-semibold text-sm shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Nav */}
            <nav className="p-2">
              {NAV_ITEMS.map(item => {
                const Icon     = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-xl
                      text-sm font-medium transition-colors duration-150
                      ${isActive
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

              {/* Logout */}
              <Button
                onClick={handleLogout}
                className="
                  flex items-center gap-3 w-full px-3 py-2.5
                  rounded-xl text-sm font-medium
                  text-red-500 hover:bg-red-50
                  transition-colors duration-150 mt-1
                "
              >
                <LogOut size={16} />
                Sign out
              </Button>
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}