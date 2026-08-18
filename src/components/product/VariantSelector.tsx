'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShoppingBag, Minus, Plus, Check, Heart } from 'lucide-react';
import { ProductDetail, ProductVariant } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setCart, openCart } from '@/store/slices/cartSlice';
import { cartApi } from '@/lib/api/cart';
import Button from '@/components/ui/Button';

interface Props {
  product: ProductDetail;
}

export default function VariantSelector({ product }: Props) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const isAuthenticated = useAppSelector(s => s.auth.isAuthenticated);

  const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string>>(
    {}
  );
  const [qty, setQty] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const selectedVariant: ProductVariant | undefined = product.variants.find(
    variant =>
      product.attribute_groups.every(group => {
        const selectedValueId = selectedAttrs[group.name];
        if (!selectedValueId) return false;
        return variant.attributes.some(
          a => a.group_name === group.name && a.value_id === selectedValueId
        );
      })
  );

  const allSelected =
    product.attribute_groups.length > 0
      ? product.attribute_groups.every(g => selectedAttrs[g.name])
      : true;

  function isValueAvailable(groupName: string, valueId: string): boolean {
    return product.variants.some(variant => {
      const hasValue = variant.attributes.some(
        a => a.group_name === groupName && a.value_id === valueId
      );
      if (!hasValue) return false;

      return Object.entries(selectedAttrs).every(([gName, vId]) => {
        if (gName === groupName) return true;
        return variant.attributes.some(
          a => a.group_name === gName && a.value_id === vId
        );
      });
    });
  }

  function selectAttribute(groupName: string, valueId: string) {
    setSelectedAttrs(prev => ({ ...prev, [groupName]: valueId }));
    setAddedToCart(false);
  }

  async function handleAddToCart() {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!selectedVariant) return;

    setIsAdding(true);
    try {
      const response = await cartApi.addItem(selectedVariant.id, qty);
      dispatch(setCart(response.data));
      dispatch(openCart());
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to add to cart';
      alert(message);
    } finally {
      setIsAdding(false);
    }
  }

  function handleWishlist() {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    router.push('/dashboard/wishlist');
  }

  return (
    <div className="space-y-6">
      {product.attribute_groups.map(group => (
        <div key={group.id}>
          <div className="mb-2.5 flex items-center gap-2">
            <span className="text-sm font-semibold text-ink">{group.name}</span>
            {selectedAttrs[group.name] && (
              <span className="text-sm text-muted">
                —{' '}
                {
                  group.values.find(v => v.id === selectedAttrs[group.name])
                    ?.value
                }
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {group.values.map(val => {
              const isSelected = selectedAttrs[group.name] === val.id;
              const isAvailable = isValueAvailable(group.name, val.id);

              if (group.type === 'color' && val.meta) {
                return (
                  <motion.button
                    key={val.id}
                    type="button"
                    whileTap={{ scale: 0.9 }}
                    onClick={() =>
                      isAvailable && selectAttribute(group.name, val.id)
                    }
                    disabled={!isAvailable}
                    title={val.value}
                    className={`
                      relative h-9 w-9 rounded-full border-2 transition-all
                      ${
                        isSelected
                          ? 'border-accent scale-110'
                          : 'border-transparent hover:border-border-strong'
                      }
                      ${!isAvailable ? 'cursor-not-allowed opacity-30' : 'cursor-pointer'}
                    `}
                    style={{ backgroundColor: val.meta }}
                  >
                    {isSelected && (
                      <Check
                        size={12}
                        className="absolute inset-0 m-auto text-white drop-shadow"
                      />
                    )}
                  </motion.button>
                );
              }

              return (
                <motion.button
                  key={val.id}
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    isAvailable && selectAttribute(group.name, val.id)
                  }
                  disabled={!isAvailable}
                  className={`
                    rounded-lg border px-3.5 py-2 text-sm transition-all duration-150
                    ${
                      isSelected
                        ? 'border-ink bg-ink text-white'
                        : isAvailable
                          ? 'border-border-strong text-ink hover:border-ink'
                          : 'cursor-not-allowed border-border text-muted-light line-through'
                    }
                  `}
                >
                  {val.value}
                </motion.button>
              );
            })}
          </div>
        </div>
      ))}

      {selectedVariant && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between border-t border-border py-4"
        >
          <div>
            <span className="text-2xl font-bold text-ink">
              {formatPrice(selectedVariant.price)}
            </span>
            {selectedVariant.compare_price &&
              selectedVariant.compare_price > selectedVariant.price && (
                <span className="ml-2 text-sm text-muted line-through">
                  {formatPrice(selectedVariant.compare_price)}
                </span>
              )}
          </div>

          <span
            className={`text-sm font-medium ${
              selectedVariant.in_stock ? 'text-emerald-700' : 'text-red-600'
            }`}
          >
            {selectedVariant.in_stock
              ? `${selectedVariant.stock_qty} in stock`
              : 'Out of stock'}
          </span>
        </motion.div>
      )}

      <div className="flex items-center gap-3">
        <div className="flex items-center overflow-hidden rounded-lg border border-border-strong text-ink">
          <button
            type="button"
            onClick={() => setQty(q => Math.max(1, q - 1))}
            className="px-3 py-3.5 transition-colors hover:bg-surface-muted"
            aria-label="Decrease quantity"
          >
            <Minus size={14} />
          </button>
          <span className="w-10 text-center text-sm font-semibold">{qty}</span>
          <button
            type="button"
            onClick={() =>
              setQty(q =>
                selectedVariant
                  ? Math.min(selectedVariant.stock_qty, q + 1)
                  : q + 1
              )
            }
            className="px-3 py-3.5 transition-colors hover:bg-surface-muted"
            aria-label="Increase quantity"
          >
            <Plus size={14} />
          </button>
        </div>

        <Button
          fullWidth
          size="lg"
          onClick={handleAddToCart}
          isLoading={isAdding}
          disabled={
            !allSelected ||
            !selectedVariant ||
            !selectedVariant.in_stock ||
            isAdding
          }
          className={
            addedToCart ? '!bg-emerald-600 hover:!bg-emerald-700' : ''
          }
        >
          {addedToCart ? (
            <>
              <Check size={16} />
              Added to cart
            </>
          ) : (
            <>
              <ShoppingBag size={16} />
              {!allSelected
                ? 'Select options'
                : !selectedVariant?.in_stock
                  ? 'Out of stock'
                  : 'Add to cart'}
            </>
          )}
        </Button>

        <button
          type="button"
          onClick={handleWishlist}
          className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-lg border border-border-strong text-muted transition-colors hover:border-accent hover:text-accent"
          aria-label="Wishlist"
        >
          <Heart size={18} strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}
