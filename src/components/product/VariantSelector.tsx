// src/components/product/VariantSelector.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShoppingCart, Minus, Plus, Check } from 'lucide-react';
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
  const dispatch        = useAppDispatch();
  const router          = useRouter();
  const isAuthenticated = useAppSelector(s => s.auth.isAuthenticated);

  // Track selected attribute values: { "Color": "valueId", "Storage": "valueId" }
  const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string>>({});
  const [qty,           setQty]           = useState(1);
  const [isAdding,      setIsAdding]      = useState(false);
  const [addedToCart,   setAddedToCart]   = useState(false);

  // Find the variant that matches ALL currently selected attributes
  const selectedVariant: ProductVariant | undefined = product.variants.find(variant =>
    product.attribute_groups.every(group => {
      const selectedValueId = selectedAttrs[group.name];
      if (!selectedValueId) return false;
      return variant.attributes.some(a =>
        a.group_name === group.name && a.value_id === selectedValueId
      );
    })
  );

  // Check if all attribute groups have been selected
  const allSelected = product.attribute_groups.length > 0
    ? product.attribute_groups.every(g => selectedAttrs[g.name])
    : true;

  // Check if a specific attribute value is available
  // (has at least one in-stock variant with that value + current other selections)
  function isValueAvailable(groupName: string, valueId: string): boolean {
    return product.variants.some(variant => {
      const hasValue = variant.attributes.some(
        a => a.group_name === groupName && a.value_id === valueId
      );
      if (!hasValue) return false;

      // Check other already-selected attributes still match
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

      // Reset added state after 2 seconds
      setTimeout(() => setAddedToCart(false), 2000);
    } catch (error: any) {
      alert(error.message || 'Failed to add to cart');
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <div className="space-y-5">

      {/* Attribute groups */}
      {product.attribute_groups.map(group => (
        <div key={group.id}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-gray-900">
              {group.name}
            </span>
            {selectedAttrs[group.name] && (
              <span className="text-sm text-gray-500">
                — {group.values.find(v => v.id === selectedAttrs[group.name])?.value}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {group.values.map(val => {
              const isSelected  = selectedAttrs[group.name] === val.id;
              const isAvailable = isValueAvailable(group.name, val.id);

              // Color swatch type
              if (group.type === 'color' && val.meta) {
                return (
                  <motion.button
                    key={val.id}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => isAvailable && selectAttribute(group.name, val.id)}
                    disabled={!isAvailable}
                    title={val.value}
                    className={`
                      w-8 h-8 rounded-full border-2 transition-all relative
                      ${isSelected
                        ? 'border-black scale-110'
                        : 'border-transparent hover:border-gray-400'
                      }
                      ${!isAvailable ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
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

              // Button type (size, storage, etc.)
              return (
                <motion.button
                  key={val.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => isAvailable && selectAttribute(group.name, val.id)}
                  disabled={!isAvailable}
                  className={`
                    px-3 py-1.5 rounded-xl border text-sm
                    transition-all duration-150
                    ${isSelected
                      ? 'border-black bg-black text-white'
                      : isAvailable
                        ? 'border-gray-300 text-gray-700 hover:border-gray-500'
                        : 'border-gray-200 text-gray-300 cursor-not-allowed line-through'
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

      {/* Selected variant price + stock */}
      {selectedVariant && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between py-3 border-t border-gray-100"
        >
          <div>
            <span className="text-2xl font-bold text-gray-900">
              {formatPrice(selectedVariant.price)}
            </span>
            {selectedVariant.compare_price &&
              selectedVariant.compare_price > selectedVariant.price && (
              <span className="ml-2 text-sm text-gray-400 line-through">
                {formatPrice(selectedVariant.compare_price)}
              </span>
            )}
          </div>

          <span className={`text-sm font-medium ${
            selectedVariant.in_stock ? 'text-green-600' : 'text-red-500'
          }`}>
            {selectedVariant.in_stock
              ? `${selectedVariant.stock_qty} in stock`
              : 'Out of stock'
            }
          </span>
        </motion.div>
      )}

      {/* Qty selector + Add to cart */}
      <div className="flex items-center gap-3">
        {/* Qty */}
        <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
          <button
            onClick={() => setQty(q => Math.max(1, q - 1))}
            className="px-3 py-2.5 hover:bg-gray-50 transition-colors"
          >
            <Minus size={14} />
          </button>
          <span className="w-10 text-center text-sm font-medium">
            {qty}
          </span>
          <button
            onClick={() => setQty(q =>
              selectedVariant
                ? Math.min(selectedVariant.stock_qty, q + 1)
                : q + 1
            )}
            className="px-3 py-2.5 hover:bg-gray-50 transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>

        {/* Add to cart button */}
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
          className={addedToCart ? 'bg-green-600 hover:bg-green-700' : ''}
        >
          {addedToCart ? (
            <>
              <Check size={16} />
              Added to cart
            </>
          ) : (
            <>
              <ShoppingCart size={16} />
              {!allSelected
                ? 'Select options'
                : !selectedVariant?.in_stock
                  ? 'Out of stock'
                  : 'Add to cart'
              }
            </>
          )}
        </Button>
      </div>
    </div>
  );
}