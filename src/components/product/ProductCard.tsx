// src/components/product/ProductCard.tsx
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice, getImageUrl } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { openCart, setCart } from '@/store/slices/cartSlice';
import { cartApi } from '@/lib/api/cart';
import { useState } from 'react';

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const dispatch        = useAppDispatch();
  const isAuthenticated = useAppSelector(s => s.auth.isAuthenticated);
  const [adding,        setAdding] = useState(false);

  // Get first available variant id for quick add
  async function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault(); // prevent Link navigation

    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    if (!product.in_stock) return;

    setAdding(true);
    try {
      // Quick add — we need to go to product page to select variant
      // So just navigate to product detail
      window.location.href = `/products/${product.slug}`;
    } finally {
      setAdding(false);
    }
  }

  const hasDiscount = false; // will be true when compare_price > price

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="group"
    >
      <Link href={`/products/${product.slug}`} className="block">
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200">

          {/* Image */}
          <div className="relative aspect-square bg-gray-50 overflow-hidden">
            {product.image ? (
              <img
                src={getImageUrl(product.image)}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <ShoppingCart size={32} />
              </div>
            )}

            {/* Featured badge */}
            {product.is_featured && (
              <span className="absolute top-2 left-2 bg-black text-white text-xs px-2 py-0.5 rounded-full font-medium">
                Featured
              </span>
            )}

            {/* Out of stock overlay */}
            {!product.in_stock && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                <span className="text-sm font-medium text-gray-500">
                  Out of stock
                </span>
              </div>
            )}

            {/* Quick add button — appears on hover */}
            <motion.button
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              onClick={handleQuickAdd}
              disabled={!product.in_stock || adding}
              className="
                absolute bottom-2 right-2
                bg-black text-white
                p-2 rounded-xl
                opacity-0 group-hover:opacity-100
                transition-opacity duration-200
                disabled:opacity-50
              "
              aria-label="View product"
            >
              <ShoppingCart size={16} />
            </motion.button>
          </div>

          {/* Info */}
          <div className="p-3">
            {/* Brand */}
            {product.brand && (
              <p className="text-xs text-gray-400 mb-0.5">
                {product.brand.name}
              </p>
            )}

            {/* Name */}
            <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug mb-2">
              {product.name}
            </p>

            {/* Rating */}
            {product.rating_count > 0 && (
              <div className="flex items-center gap-1 mb-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map(star => (
                    <span
                      key={star}
                      className={`text-xs ${
                        star <= Math.round(product.rating_avg)
                          ? 'text-yellow-400'
                          : 'text-gray-200'
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-xs text-gray-400">
                  ({product.rating_count})
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-900">
                {formatPrice(product.price_from)}
              </p>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}