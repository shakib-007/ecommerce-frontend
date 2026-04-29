// src/components/store/ProductFilters.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react';
import { Category, Brand } from '@/types';

interface Props {
  categories:     Category[];
  brands:         Brand[];
  currentFilters: any;
}

export default function ProductFilters({
  categories,
  brands,
  currentFilters,
}: Props) {
  const router     = useRouter();
  const params     = useSearchParams();

  const [priceMin,      setPriceMin]      = useState(currentFilters.min_price ?? '');
  const [priceMax,      setPriceMax]      = useState(currentFilters.max_price ?? '');
  const [showCats,      setShowCats]      = useState(true);
  const [showBrands,    setShowBrands]    = useState(true);
  const [showPrice,     setShowPrice]     = useState(true);
  const [mobileOpen,    setMobileOpen]    = useState(false);

  // Build new URL with updated filter
  function updateFilter(key: string, value: string | undefined) {
    const current = new URLSearchParams(params.toString());

    if (value) {
      current.set(key, value);
    } else {
      current.delete(key);
    }

    // Reset to page 1 when filter changes
    current.set('page', '1');

    router.push(`/products?${current.toString()}`);
  }

  function applyPriceFilter() {
    const current = new URLSearchParams(params.toString());
    if (priceMin) current.set('min_price', priceMin);
    else current.delete('min_price');
    if (priceMax) current.set('max_price', priceMax);
    else current.delete('max_price');
    current.set('page', '1');
    router.push(`/products?${current.toString()}`);
  }

  function clearAllFilters() {
    router.push('/products');
  }

  const hasActiveFilters = !!(
    currentFilters.category ||
    currentFilters.brand ||
    currentFilters.min_price ||
    currentFilters.max_price ||
    currentFilters.in_stock
  );

  const FilterContent = () => (
    <div className="space-y-6">

      {/* Active filters header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-gray-500" />
          <span className="text-sm font-semibold text-gray-900">Filters</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-xs text-red-500 hover:text-red-700"
          >
            Clear all
          </button>
        )}
      </div>

      {/* In stock toggle */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">In stock only</span>
        <button
          onClick={() => updateFilter(
            'in_stock',
            currentFilters.in_stock === 'true' ? undefined : 'true'
          )}
          className={`
            relative w-10 h-5 rounded-full transition-colors duration-200
            ${currentFilters.in_stock === 'true' ? 'bg-black' : 'bg-gray-200'}
          `}
        >
          <span className={`
            absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full
            transition-transform duration-200
            ${currentFilters.in_stock === 'true' ? 'translate-x-5' : ''}
          `} />
        </button>
      </div>

      {/* Categories */}
      <div>
        <button
          onClick={() => setShowCats(!showCats)}
          className="flex items-center justify-between w-full mb-3"
        >
          <span className="text-sm font-semibold text-gray-900">Category</span>
          {showCats ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showCats && (
          <div className="space-y-1">
            <button
              onClick={() => updateFilter('category', undefined)}
              className={`
                w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors
                ${!currentFilters.category
                  ? 'bg-black text-white'
                  : 'text-gray-600 hover:bg-gray-100'
                }
              `}
            >
              All categories
            </button>

            {categories
              .filter(c => !c.parent)
              .map(cat => (
                <div key={cat.id}>
                  <button
                    onClick={() => updateFilter('category', cat.slug)}
                    className={`
                      w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors
                      ${currentFilters.category === cat.slug
                        ? 'bg-black text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                      }
                    `}
                  >
                    {cat.name}
                    {cat.products_count !== undefined && (
                      <span className="ml-1 text-xs opacity-60">
                        ({cat.products_count})
                      </span>
                    )}
                  </button>

                  {/* Subcategories */}
                  {cat.children?.map(sub => (
                    <button
                      key={sub.id}
                      onClick={() => updateFilter('category', sub.slug)}
                      className={`
                        w-full text-left text-sm pl-6 pr-3 py-1 rounded-lg transition-colors
                        ${currentFilters.category === sub.slug
                          ? 'bg-gray-100 text-black font-medium'
                          : 'text-gray-500 hover:bg-gray-50'
                        }
                      `}
                    >
                      {sub.name}
                    </button>
                  ))}
                </div>
              ))
            }
          </div>
        )}
      </div>

      {/* Brands */}
      <div>
        <button
          onClick={() => setShowBrands(!showBrands)}
          className="flex items-center justify-between w-full mb-3"
        >
          <span className="text-sm font-semibold text-gray-900">Brand</span>
          {showBrands ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showBrands && (
          <div className="space-y-1">
            {brands.map(brand => (
              <label
                key={brand.id}
                className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={currentFilters.brand === brand.slug}
                  onChange={() => updateFilter(
                    'brand',
                    currentFilters.brand === brand.slug ? undefined : brand.slug
                  )}
                  className="w-3.5 h-3.5 accent-black"
                />
                <span className="text-sm text-gray-700">{brand.name}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price range */}
      <div>
        <button
          onClick={() => setShowPrice(!showPrice)}
          className="flex items-center justify-between w-full mb-3"
        >
          <span className="text-sm font-semibold text-gray-900">Price range</span>
          {showPrice ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showPrice && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min ৳"
                value={priceMin}
                onChange={e => setPriceMin(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl outline-none focus:border-black"
              />
              <span className="text-gray-400 shrink-0">—</span>
              <input
                type="number"
                placeholder="Max ৳"
                value={priceMax}
                onChange={e => setPriceMax(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl outline-none focus:border-black"
              />
            </div>
            <button
              onClick={applyPriceFilter}
              className="w-full py-2 text-sm font-medium bg-black text-white rounded-xl hover:bg-gray-800"
            >
              Apply
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile filter toggle */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex items-center gap-2 text-sm font-medium border border-gray-300 px-4 py-2 rounded-xl"
        >
          <SlidersHorizontal size={16} />
          {mobileOpen ? 'Hide filters' : 'Show filters'}
          {hasActiveFilters && (
            <span className="bg-black text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              !
            </span>
          )}
        </button>

        {mobileOpen && (
          <div className="mt-4 p-4 bg-white rounded-2xl border border-gray-100">
            <FilterContent />
          </div>
        )}
      </div>

      {/* Desktop filters */}
      <div className="hidden lg:block bg-white rounded-2xl border border-gray-100 p-5">
        <FilterContent />
      </div>
    </>
  );
}