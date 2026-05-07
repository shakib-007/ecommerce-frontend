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
import Button from '@/components/ui/Button';
import CartItem from './CartItem';

export default function CartDrawer() {
  const dispatch        = useAppDispatch();
  const { cart, isOpen, isLoading } = useAppSelector(s => s.cart);
  const isAuthenticated = useAppSelector(s => s.auth.isAuthenticated);

  // Fetch cart when drawer opens
  useEffect(() => {
    if (!isOpen || !isAuthenticated) return;

    dispatch(setCartLoading(true));
    cartApi.get()
      .then(res => dispatch(setCart(res.data)))
      .catch(() => dispatch(setCartLoading(false)));
  }, [isOpen, isAuthenticated]);

  // Close on Escape key
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') dispatch(closeCart());
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const isEmpty = !cart || cart.items.length === 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => dispatch(closeCart())}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="
              fixed right-0 top-0 bottom-0 z-50
              w-full max-w-md
              bg-white shadow-2xl
              flex flex-col
            "
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} />
                <h2 className="text-base font-semibold text-gray-900">
                  Your Cart
                </h2>
                {cart && cart.total_items > 0 && (
                  <span className="bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                    {cart.total_items}
                  </span>
                )}
              </div>
              <button
                onClick={() => dispatch(closeCart())}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Spinner />
                </div>
              ) : !isAuthenticated ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center">
                  <ShoppingBag size={40} className="text-gray-300" />
                  <div>
                    <p className="font-medium text-gray-900 mb-1">
                      Sign in to view your cart
                    </p>
                    <p className="text-sm text-gray-500">
                      Your cart items are saved to your account.
                    </p>
                  </div>
                  <Link
                    href="/login"
                    onClick={() => dispatch(closeCart())}
                    className="bg-black text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
                  >
                    Sign in
                  </Link>
                </div>
              ) : isEmpty ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center">
                  <ShoppingBag size={40} className="text-gray-300" />
                  <div>
                    <p className="font-medium text-gray-900 mb-1">
                      Your cart is empty
                    </p>
                    <p className="text-sm text-gray-500">
                      Add some products to get started.
                    </p>
                  </div>
                  <Link
                    href="/products"
                    onClick={() => dispatch(closeCart())}
                    className="bg-black text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
                  >
                    Browse products
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {cart.items.map(item => (
                    <CartItem key={item.id} item={item} />
                  ))}
                </div>
              )}
            </div>

            {/* Footer — subtotal + checkout */}
            {!isEmpty && !isLoading && cart && (
              <div className="border-t border-gray-100 px-5 py-4 space-y-4">
                {/* Subtotal */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      Subtotal ({cart.total_items} items)
                    </span>
                    <span className="font-semibold text-gray-900">
                      {formatPrice(cart.subtotal)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Shipping and discounts calculated at checkout.
                  </p>
                </div>

                {/* Checkout button */}
                <Link
                  href="/checkout"
                  onClick={() => dispatch(closeCart())}
                  className="
                    flex items-center justify-center gap-2
                    w-full bg-black text-white
                    py-3 rounded-xl
                    font-medium text-sm
                    hover:bg-gray-800
                    transition-colors duration-200
                  "
                >
                  Checkout
                  <ArrowRight size={16} />
                </Link>

                {/* Continue shopping */}
                <button
                  onClick={() => dispatch(closeCart())}
                  className="w-full text-sm text-gray-500 hover:text-black transition-colors"
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