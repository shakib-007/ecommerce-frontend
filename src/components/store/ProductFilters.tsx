'use client';

import { useEffect, useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { Category, Brand } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useProductsNav } from './ProductsNavProvider';

interface Props {
  categories: Category[];
  brands: Brand[];
  currentFilters: Record<string, string | undefined>;
}

function CheckboxRow({
  checked,
  label,
  count,
  onChange,
}: {
  checked: boolean;
  label: string;
  count?: number;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 py-1.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="peer sr-only"
      />
      <span
        className={`
          flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border transition-colors
          ${
            checked
              ? 'border-ink bg-ink text-white'
              : 'border-border-strong bg-surface'
          }
        `}
        aria-hidden
      >
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path
              d="M1 4L3.5 6.5L9 1"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      <span className="flex-1 text-sm text-ink">{label}</span>
      {count !== undefined && (
        <span className="text-xs text-muted-light">{count}</span>
      )}
    </label>
  );
}

export default function ProductFilters({
  categories,
  brands,
  currentFilters,
}: Props) {
  const { navigate, clearAll, isPending } = useProductsNav();
  const [priceMin, setPriceMin] = useState(currentFilters.min_price ?? '');
  const [priceMax, setPriceMax] = useState(currentFilters.max_price ?? '');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setPriceMin(currentFilters.min_price ?? '');
    setPriceMax(currentFilters.max_price ?? '');
  }, [currentFilters.min_price, currentFilters.max_price]);

  function updateFilter(key: string, value: string | undefined) {
    navigate({ [key]: value });
  }

  function applyPriceFilter() {
    navigate({
      min_price: priceMin || undefined,
      max_price: priceMax || undefined,
    });
  }

  const rootCategories = categories.filter(c => !c.parent);

  const hasActiveFilters = !!(
    currentFilters.category ||
    currentFilters.brand ||
    currentFilters.min_price ||
    currentFilters.max_price ||
    currentFilters.in_stock ||
    currentFilters.featured
  );

  const content = (
    <div className={`space-y-0 ${isPending ? 'opacity-70' : ''}`}>
      {/* Category */}
      <div className="border-b border-border py-5 first:pt-0">
        <h3 className="mb-3 text-sm font-semibold text-ink">Category</h3>
        <div className="space-y-0.5">
          {rootCategories.map(cat => (
            <CheckboxRow
              key={cat.id}
              checked={currentFilters.category === cat.slug}
              label={cat.name}
              count={cat.products_count}
              onChange={() =>
                updateFilter(
                  'category',
                  currentFilters.category === cat.slug ? undefined : cat.slug
                )
              }
            />
          ))}
        </div>
      </div>

      {/* Price */}
      <div className="border-b border-border py-5">
        <h3 className="mb-3 text-sm font-semibold text-ink">Price (৳)</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={priceMin}
            onChange={e => setPriceMin(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-ink"
          />
          <span className="shrink-0 text-muted-light">–</span>
          <input
            type="number"
            placeholder="Max"
            value={priceMax}
            onChange={e => setPriceMax(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-ink"
          />
        </div>
        {(priceMin || priceMax) && (
          <p className="mt-2 text-xs text-muted">
            {formatPrice(Number(priceMin || 0))} –{' '}
            {priceMax ? formatPrice(Number(priceMax)) : '∞'}
          </p>
        )}
        <button
          type="button"
          onClick={applyPriceFilter}
          className="mt-3 w-full rounded-lg border border-ink py-2 text-sm font-medium text-ink transition-colors hover:bg-ink hover:text-white"
        >
          Apply price
        </button>
      </div>

      {/* Brand */}
      <div className="border-b border-border py-5">
        <h3 className="mb-3 text-sm font-semibold text-ink">Brand</h3>
        <div className="max-h-48 space-y-0.5 overflow-y-auto pr-1">
          {brands.map(brand => (
            <CheckboxRow
              key={brand.id}
              checked={currentFilters.brand === brand.slug}
              label={brand.name}
              count={brand.products_count}
              onChange={() =>
                updateFilter(
                  'brand',
                  currentFilters.brand === brand.slug ? undefined : brand.slug
                )
              }
            />
          ))}
        </div>
      </div>

      {/* Availability */}
      <div className="border-b border-border py-5">
        <h3 className="mb-3 text-sm font-semibold text-ink">Availability</h3>
        <CheckboxRow
          checked={currentFilters.in_stock === 'true'}
          label="In stock only"
          onChange={() =>
            updateFilter(
              'in_stock',
              currentFilters.in_stock === 'true' ? undefined : 'true'
            )
          }
        />
        <CheckboxRow
          checked={currentFilters.featured === 'true'}
          label="Featured"
          onChange={() =>
            updateFilter(
              'featured',
              currentFilters.featured === 'true' ? undefined : 'true'
            )
          }
        />
      </div>

      {hasActiveFilters && (
        <div className="pt-5">
          <button
            type="button"
            onClick={clearAll}
            className="w-full rounded-lg border border-ink py-2.5 text-sm font-medium text-ink transition-colors hover:bg-ink hover:text-white"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="mb-4 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex items-center gap-2 rounded-lg border border-border-strong bg-surface px-4 py-2.5 text-sm font-medium text-ink"
        >
          <SlidersHorizontal size={16} />
          {mobileOpen ? 'Hide filters' : 'Filters'}
          {hasActiveFilters && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[10px] font-semibold text-white">
              !
            </span>
          )}
          {mobileOpen && <X size={16} className="ml-1" />}
        </button>

        {mobileOpen && (
          <div className="mt-4 rounded-xl border border-border bg-surface p-5">
            {content}
          </div>
        )}
      </div>

      <div className="hidden rounded-xl border border-border bg-surface p-5 lg:block">
        {content}
      </div>
    </>
  );
}
