// src/app/dashboard/wishlist/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';
import { wishlistApi } from '@/lib/api/wishlist';
import { cartApi } from '@/lib/api/cart';
import { useAppDispatch } from '@/store/hooks';
import { setCart, openCart } from '@/store/slices/cartSlice';
import { formatPrice, getImageUrl } from '@/lib/utils';
import Spinner from '@/components/ui/Spinner';

export default function WishlistPage() {
  const dispatch = useAppDispatch();

  const [items,   setItems]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding,  setAdding]  = useState<string | null>(null);

  useEffect(() => {
    wishlistApi.getAll()
      .then(res => setItems(res.data))
      .finally(() => setLoading(false));
  }, []);

  async function removeFromWishlist(variantId: string) {
    await wishlistApi.remove(variantId);
    setItems(prev => prev.filter(i => i.variant_id !== variantId));
  }

  async function addToCart(variantId: string) {
    setAdding(variantId);
    try {
      const res = await cartApi.addItem(variantId, 1);
      dispatch(setCart(res.data));
      dispatch(openCart());
    } catch (error: any) {
      alert(error.message || 'Failed to add to cart');
    } finally {
      setAdding(null);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Wishlist</h1>
        <p className="text-sm text-gray-500 mt-1">
          Products you&apos;ve saved for later.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
          <Heart size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-900 mb-1">
            Your wishlist is empty
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Save products you like and find them here later.
          </p>
          <Link
            href="/products"
            className="text-sm bg-black text-white px-5 py-2.5 rounded-xl hover:bg-gray-800 transition-colors"
          >
            Browse products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map(item => {
            const variant = item.variant;
            const product = variant?.product;
            const image   = product?.images?.find((i: any) => i.is_primary)?.url
                         ?? product?.images?.[0]?.url;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4"
              >
                {/* Image */}
                <Link
                  href={`/products/${product?.slug}`}
                  className="shrink-0"
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50">
                    {image ? (
                      <img
                        src={getImageUrl(image)}
                        alt={product?.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100" />
                    )}
                  </div>
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${product?.slug}`}>
                    <p className="text-sm font-medium text-gray-900 line-clamp-2 hover:underline leading-snug">
                      {product?.name}
                    </p>
                  </Link>

                  {/* Variant attributes */}
                  <p className="text-xs text-gray-400 mt-1">
                    {variant?.attributeValues
                      ?.map((av: any) => av.value)
                      .join(' / ')
                    }
                  </p>

                  {/* Price */}
                  <p className="text-sm font-semibold text-gray-900 mt-1.5">
                    {formatPrice(variant?.price ?? 0)}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => addToCart(variant?.id)}
                      disabled={
                        adding === variant?.id ||
                        !variant?.stock_qty
                      }
                      className="
                        flex items-center gap-1.5 text-xs
                        bg-black text-white px-3 py-1.5
                        rounded-lg hover:bg-gray-800
                        disabled:opacity-40
                        transition-colors
                      "
                    >
                      <ShoppingCart size={12} />
                      {adding === variant?.id
                        ? 'Adding...'
                        : variant?.stock_qty
                          ? 'Add to cart'
                          : 'Out of stock'
                      }
                    </button>

                    <button
                      onClick={() => removeFromWishlist(variant?.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}