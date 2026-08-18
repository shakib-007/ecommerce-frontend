'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { CartItem as CartItemType } from '@/types';
import { useAppDispatch } from '@/store/hooks';
import { setCart } from '@/store/slices/cartSlice';
import { cartApi } from '@/lib/api/cart';
import { formatPrice, getImageUrl } from '@/lib/utils';

interface Props {
  item: CartItemType;
}

export default function CartItem({ item }: Props) {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  async function updateQty(newQty: number) {
    if (newQty < 1) return;
    setLoading(true);
    try {
      const res = await cartApi.updateItem(item.id, newQty);
      dispatch(setCart(res.data));
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to update cart';
      alert(message);
    } finally {
      setLoading(false);
    }
  }

  async function remove() {
    setLoading(true);
    try {
      const res = await cartApi.removeItem(item.id);
      dispatch(setCart(res.data));
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to remove item';
      alert(message);
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
      <Link
        href={`/products/${item.variant.product.slug}`}
        className="shrink-0"
      >
        <div className="h-16 w-16 overflow-hidden rounded-lg bg-surface-warm">
          {item.variant.product.image ? (
            <img
              src={getImageUrl(item.variant.product.image)}
              alt={item.variant.product.name}
              className="h-full w-full object-contain p-1"
            />
          ) : (
            <div className="h-full w-full bg-surface-muted" />
          )}
        </div>
      </Link>

      <div className="min-w-0 flex-1">
        <Link href={`/products/${item.variant.product.slug}`}>
          <p className="line-clamp-1 text-sm font-medium leading-snug text-ink hover:underline">
            {item.variant.product.name}
          </p>
        </Link>

        <div className="mb-2 mt-0.5 flex flex-wrap gap-1">
          {item.variant.attributes.map((attr, i) => (
            <span key={i} className="text-xs text-muted">
              {attr.group}: {attr.value}
              {i < item.variant.attributes.length - 1 && ','}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-ink">
            {formatPrice(item.line_total)}
          </span>

          <div className="flex items-center gap-2">
            <div className="flex items-center overflow-hidden rounded-md border border-border">
              <button
                type="button"
                onClick={() => updateQty(item.qty - 1)}
                disabled={loading || item.qty <= 1}
                className="p-1.5 text-ink transition-colors hover:bg-surface-muted disabled:opacity-40"
                aria-label="Decrease quantity"
              >
                <Minus size={12} />
              </button>
              <span className="w-7 text-center text-xs font-medium text-ink">
                {item.qty}
              </span>
              <button
                type="button"
                onClick={() => updateQty(item.qty + 1)}
                disabled={loading || item.qty >= item.variant.stock_qty}
                className="p-1.5 text-ink transition-colors hover:bg-surface-muted disabled:opacity-40"
                aria-label="Increase quantity"
              >
                <Plus size={12} />
              </button>
            </div>

            <button
              type="button"
              onClick={remove}
              disabled={loading}
              className="p-1.5 text-muted transition-colors hover:text-red-600"
              aria-label="Remove item"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
