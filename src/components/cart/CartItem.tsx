// src/components/cart/CartItem.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { CartItem as CartItemType } from '@/types';
import { useAppDispatch } from '@/store/hooks';
import { setCart } from '@/store/slices/cartSlice';
import { cartApi } from '@/lib/api/cart';
import { formatPrice, getImageUrl } from '@/lib/utils';
import Link from 'next/link';

interface Props {
  item: CartItemType;
}

export default function CartItem({ item }: Props) {
  const dispatch  = useAppDispatch();
  const [loading, setLoading] = useState(false);

  async function updateQty(newQty: number) {
    if (newQty < 1) return;
    setLoading(true);
    try {
      const res = await cartApi.updateItem(item.id, newQty);
      dispatch(setCart(res.data));
    } catch (error: any) {
      alert(error.message || 'Failed to update cart');
    } finally {
      setLoading(false);
    }
  }

  async function remove() {
    setLoading(true);
    try {
      const res = await cartApi.removeItem(item.id);
      dispatch(setCart(res.data));
    } catch (error: any) {
      alert(error.message || 'Failed to remove item');
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`flex gap-3 px-5 py-4 transition-opacity ${loading ? 'opacity-50' : ''}`}
    >
      {/* Image */}
      <Link
        href={`/products/${item.variant.product.slug}`}
        className="shrink-0"
      >
        <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50">
          {item.variant.product.image ? (
            <img
              src={getImageUrl(item.variant.product.image)}
              alt={item.variant.product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-100" />
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link href={`/products/${item.variant.product.slug}`}>
          <p className="text-sm font-medium text-gray-900 leading-snug line-clamp-1 hover:underline">
            {item.variant.product.name}
          </p>
        </Link>

        {/* Variant attributes */}
        <div className="flex flex-wrap gap-1 mt-0.5 mb-2">
          {item.variant.attributes.map((attr, i) => (
            <span key={i} className="text-xs text-gray-400">
              {attr.group}: {attr.value}
              {i < item.variant.attributes.length - 1 && ','}
            </span>
          ))}
        </div>

        {/* Price + qty controls */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-900">
            {formatPrice(item.line_total)}
          </span>

          <div className="flex items-center gap-2">
            {/* Qty controls */}
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => updateQty(item.qty - 1)}
                disabled={loading || item.qty <= 1}
                className="p-1.5 hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                <Minus size={12} />
              </button>
              <span className="w-7 text-center text-xs font-medium">
                {item.qty}
              </span>
              <button
                onClick={() => updateQty(item.qty + 1)}
                disabled={loading || item.qty >= item.variant.stock_qty}
                className="p-1.5 hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                <Plus size={12} />
              </button>
            </div>

            {/* Remove */}
            <button
              onClick={remove}
              disabled={loading}
              className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}