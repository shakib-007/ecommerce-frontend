'use client';

import { X } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useProductsNav } from './ProductsNavProvider';

interface Props {
  currentFilters: Record<string, string | undefined>;
  categories?: { slug: string; name: string }[];
  brands?: { slug: string; name: string }[];
}

export default function ActiveFilterTags({
  currentFilters,
  categories = [],
  brands = [],
}: Props) {
  const { navigate } = useProductsNav();

  const tags: { key: string; label: string; clear: () => void }[] = [];

  if (currentFilters.category) {
    const cat = categories.find(c => c.slug === currentFilters.category);
    tags.push({
      key: 'category',
      label: (cat?.name ?? currentFilters.category).toUpperCase(),
      clear: () => navigate({ category: undefined }),
    });
  }

  if (currentFilters.brand) {
    const brand = brands.find(b => b.slug === currentFilters.brand);
    tags.push({
      key: 'brand',
      label: (brand?.name ?? currentFilters.brand).toUpperCase(),
      clear: () => navigate({ brand: undefined }),
    });
  }

  if (currentFilters.in_stock === 'true') {
    tags.push({
      key: 'in_stock',
      label: 'IN STOCK',
      clear: () => navigate({ in_stock: undefined }),
    });
  }

  if (currentFilters.featured === 'true') {
    tags.push({
      key: 'featured',
      label: 'FEATURED',
      clear: () => navigate({ featured: undefined }),
    });
  }

  if (currentFilters.min_price || currentFilters.max_price) {
    const min = currentFilters.min_price
      ? formatPrice(Number(currentFilters.min_price))
      : '৳0';
    const max = currentFilters.max_price
      ? formatPrice(Number(currentFilters.max_price))
      : '∞';
    tags.push({
      key: 'price',
      label: `${min} – ${max}`,
      clear: () => navigate({ min_price: undefined, max_price: undefined }),
    });
  }

  if (currentFilters.search) {
    tags.push({
      key: 'search',
      label: `“${currentFilters.search}”`,
      clear: () => navigate({ search: undefined }),
    });
  }

  if (tags.length === 0) return null;

  return (
    <div className="mb-5 flex flex-wrap gap-2">
      {tags.map(tag => (
        <button
          key={tag.key}
          type="button"
          onClick={tag.clear}
          className="inline-flex items-center gap-1.5 rounded-lg bg-accent-soft px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink transition-colors hover:bg-surface-warm"
        >
          {tag.label}
          <X size={12} strokeWidth={2.25} className="opacity-60" />
        </button>
      ))}
    </div>
  );
}
