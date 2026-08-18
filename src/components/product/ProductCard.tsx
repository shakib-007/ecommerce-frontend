'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShoppingBag, Heart, Star } from 'lucide-react';
import { Product } from '@/types';
import {
  formatPrice,
  getDiscountPercent,
  getImageUrl,
} from '@/lib/utils';
import { useAppSelector } from '@/store/hooks';
import { useState } from 'react';

interface Props {
  product: Product;
  /** Hide badge inside sections that are already titled "Featured". */
  showFeaturedBadge?: boolean;
}

export default function ProductCard({
  product,
  showFeaturedBadge = true,
}: Props) {
  const router = useRouter();
  const isAuthenticated = useAppSelector(s => s.auth.isAuthenticated);
  const [adding, setAdding] = useState(false);

  const compareAt =
    product.base_price > product.price_from ? product.base_price : null;
  const discount = getDiscountPercent(product.price_from, compareAt);

  async function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!product.in_stock) return;

    setAdding(true);
    try {
      router.push(`/products/${product.slug}`);
    } finally {
      setAdding(false);
    }
  }

  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    router.push(`/products/${product.slug}`);
  }

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.22 }}
      className="group h-full"
    >
      <Link
        href={`/products/${product.slug}`}
        className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-[0_1px_2px_rgba(28,25,23,0.04)] transition-shadow duration-200 hover:shadow-[0_8px_24px_rgba(28,25,23,0.06)]"
      >
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-surface-warm">
          {product.image ? (
            <img
              src={getImageUrl(product.image)}
              alt={product.name}
              className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-[1.04] sm:p-6"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-light">
              <ShoppingBag size={36} strokeWidth={1.25} />
            </div>
          )}

          {/* Badges */}
          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {!product.in_stock ? (
              <span className="rounded-md bg-ink px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                Out of stock
              </span>
            ) : discount !== null ? (
              <span className="rounded-md bg-accent px-2 py-1 text-[10px] font-semibold text-white">
                −{discount}%
              </span>
            ) : showFeaturedBadge && product.is_featured ? (
              <span className="rounded-md bg-ink px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                Featured
              </span>
            ) : null}
          </div>

          <button
            type="button"
            onClick={handleWishlist}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-muted shadow-sm transition-colors hover:border-accent hover:text-accent"
            aria-label="Add to wishlist"
          >
            <Heart size={16} strokeWidth={1.75} />
          </button>
        </div>

        {/* Info */}
        <div className="flex flex-1 flex-col p-4">
          {product.brand && (
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
              {product.brand.name}
            </p>
          )}

          <p className="line-clamp-2 text-sm font-semibold leading-snug text-ink">
            {product.name}
          </p>

          {product.rating_count > 0 && (
            <div className="mt-2 flex items-center gap-1.5">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    size={12}
                    className={
                      star <= Math.round(product.rating_avg)
                        ? 'fill-accent text-accent'
                        : 'fill-transparent text-border-strong'
                    }
                  />
                ))}
              </div>
              <span className="text-xs font-medium text-ink">
                {product.rating_avg.toFixed(1)}
              </span>
              <span className="text-xs text-muted">
                ({product.rating_count})
              </span>
            </div>
          )}

          <div className="mt-auto flex items-end justify-between gap-3 pt-3">
            <div className="min-w-0">
              <p className="text-base font-bold text-ink">
                {formatPrice(product.price_from)}
              </p>
              {compareAt !== null && (
                <p className="text-xs text-muted line-through">
                  {formatPrice(compareAt)}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handleQuickAdd}
              disabled={!product.in_stock || adding}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="View product"
            >
              <ShoppingBag size={16} strokeWidth={2} />
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
