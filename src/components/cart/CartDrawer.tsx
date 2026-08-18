'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { closeCart, setCart, setCartLoading } from '@/store/slices/cartSlice';
import { cartApi } from '@/lib/api/cart';
import { formatPrice } from '@/lib/utils';
import Spinner from '@/components/ui/Spinner';
import CartItem from './CartItem';

export default function CartDrawer() {
  const dispatch = useAppDispatch();
  const { cart, isOpen, isLoading } = useAppSelector(s => s.cart);
  const isAuthenticated = useAppSelector(s => s.auth.isAuthenticated);

  useEffect(() => {
    if (!isOpen || !isAuthenticated) return;

    dispatch(setCartLoading(true));
    cartApi
      .get()
      .then(res => dispatch(setCart(res.data)))
      .catch(() => dispatch(setCartLoading(false)));
  }, [isOpen, isAuthenticated, dispatch]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') dispatch(closeCart());
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dispatch]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const isEmpty = !cart || cart.items.length === 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => dispatch(closeCart())}
            className="fixed inset-0 z-40 bg-ink/35 backdrop-blur-[2px]"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-md flex-col bg-background shadow-2xl shadow-ink/20"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2.5">
                <ShoppingBag size={20} strokeWidth={1.75} className="text-ink" />
                <h2 className="font-display text-lg font-semibold text-ink">
                  Your cart
                </h2>
                {cart && cart.total_items > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[10px] font-semibold text-white">
                    {cart.total_items}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => dispatch(closeCart())}
                className="rounded-full p-2 text-muted transition-colors hover:bg-surface-muted hover:text-ink"
                aria-label="Close cart"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <Spinner />
                </div>
              ) : !isAuthenticated ? (
                <EmptyState
                  title="Sign in to view your cart"
                  body="Your cart items are saved to your account."
                  href="/login"
                  cta="Sign in"
                  onNavigate={() => dispatch(closeCart())}
                />
              ) : isEmpty ? (
                <EmptyState
                  title="Your cart is empty"
                  body="Add some products to get started."
                  href="/products"
                  cta="Browse products"
                  onNavigate={() => dispatch(closeCart())}
                />
              ) : (
                <div className="divide-y divide-border">
                  {cart.items.map(item => (
                    <CartItem key={item.id} item={item} />
                  ))}
                </div>
              )}
            </div>

            {!isEmpty && !isLoading && cart && (
              <div className="space-y-4 border-t border-border bg-surface px-5 py-5">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted">
                      Subtotal ({cart.total_items} items)
                    </span>
                    <span className="font-semibold text-ink">
                      {formatPrice(cart.subtotal)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-light">
                    Shipping and discounts calculated at checkout.
                  </p>
                </div>

                <Link
                  href="/checkout"
                  onClick={() => dispatch(closeCart())}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
                >
                  Checkout
                  <ArrowRight size={16} />
                </Link>

                <button
                  type="button"
                  onClick={() => dispatch(closeCart())}
                  className="w-full text-sm text-muted transition-colors hover:text-ink"
                >
                  Continue shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function EmptyState({
  title,
  body,
  href,
  cta,
  onNavigate,
}: {
  title: string;
  body: string;
  href: string;
  cta: string;
  onNavigate: () => void;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-warm">
        <ShoppingBag size={28} className="text-muted-light" strokeWidth={1.5} />
      </div>
      <div>
        <p className="mb-1 font-medium text-ink">{title}</p>
        <p className="text-sm text-muted">{body}</p>
      </div>
      <Link
        href={href}
        onClick={onNavigate}
        className="rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
      >
        {cta}
      </Link>
    </div>
  );
}
