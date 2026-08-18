'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  User,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  Shield,
  Heart,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { toggleCart } from '@/store/slices/cartSlice';
import { authApi } from '@/lib/api/auth';

export default function Navbar() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, isAuthenticated } = useAppSelector(s => s.auth);
  const cartItemCount = useAppSelector(s => s.cart.cart?.total_items ?? 0);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  async function handleLogout() {
    try {
      await authApi.logout();
    } catch {
      // Silent fail — logout locally regardless
    } finally {
      dispatch(logout());
      router.push('/');
    }
  }

  return (
    <nav className="sticky top-0 z-40 border-b border-white/10 bg-black">
      <div className="container-store">
        <div className="flex h-16 items-center justify-between gap-4 lg:h-[4.25rem]">
          <Link
            href="/"
            className="font-display text-2xl font-semibold tracking-tight text-white transition-colors hover:text-white/80"
          >
            shopora
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <Link
              href="/products"
              className="text-sm text-white/70 transition-colors hover:text-white"
            >
              All products
            </Link>
            <Link
              href="/products?featured=true"
              className="text-sm text-white/70 transition-colors hover:text-white"
            >
              Featured
            </Link>
            <Link
              href="/products?sort=newest"
              className="text-sm text-white/70 transition-colors hover:text-white"
            >
              New arrivals
            </Link>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {isAuthenticated && (
              <Link
                href="/dashboard/wishlist"
                className="hidden rounded-full p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white sm:inline-flex"
                aria-label="Wishlist"
              >
                <Heart size={20} strokeWidth={1.75} />
              </Link>
            )}

            <button
              onClick={() => dispatch(toggleCart())}
              className="relative rounded-full p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Open cart"
            >
              <ShoppingBag size={20} strokeWidth={1.75} />
              {cartItemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-white"
                >
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </motion.span>
              )}
            </button>

            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 rounded-full p-1.5 transition-colors hover:bg-white/10"
                  aria-label="Account menu"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-medium text-black">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setProfileOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-12 z-20 w-56 overflow-hidden rounded-xl border border-border bg-surface py-2 shadow-lg shadow-ink/5"
                      >
                        <div className="border-b border-border px-4 py-3">
                          <p className="truncate text-sm font-medium text-ink">
                            {user.name}
                          </p>
                          <p className="truncate text-xs text-muted">{user.email}</p>
                        </div>

                        <div className="py-1">
                          {user.role === 'admin' && (
                            <Link
                              href="/admin"
                              onClick={() => setProfileOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink/80 hover:bg-surface-muted"
                            >
                              <Shield size={16} />
                              Admin Panel
                            </Link>
                          )}
                          <Link
                            href="/dashboard"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink/80 hover:bg-surface-muted"
                          >
                            <LayoutDashboard size={16} />
                            Dashboard
                          </Link>
                          <Link
                            href="/dashboard/orders"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink/80 hover:bg-surface-muted"
                          >
                            <User size={16} />
                            My Orders
                          </Link>
                          <Link
                            href="/dashboard/wishlist"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink/80 hover:bg-surface-muted"
                          >
                            <Heart size={16} />
                            Wishlist
                          </Link>
                        </div>

                        <div className="border-t border-border py-1">
                          <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                          >
                            <LogOut size={16} />
                            Sign out
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden items-center gap-2 md:flex">
                <Link
                  href="/login"
                  className="px-3 py-2 text-sm text-white/70 transition-colors hover:text-white"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-white/90"
                >
                  Sign up
                </Link>
              </div>
            )}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-full p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white md:hidden"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-white/10 bg-black md:hidden"
          >
            <div className="container-store space-y-1 py-4">
              {[
                { href: '/products', label: 'All products' },
                { href: '/products?featured=true', label: 'Featured' },
                { href: '/products?sort=newest', label: 'New arrivals' },
              ].map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block py-2.5 text-sm text-white"
                >
                  {link.label}
                </Link>
              ))}

              {isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="block py-2.5 text-sm text-white"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/dashboard/wishlist"
                    onClick={() => setMobileOpen(false)}
                    className="block py-2.5 text-sm text-white"
                  >
                    Wishlist
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full py-2.5 text-left text-sm text-red-400"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="block py-2.5 text-sm text-white"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileOpen(false)}
                    className="inline-flex rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
