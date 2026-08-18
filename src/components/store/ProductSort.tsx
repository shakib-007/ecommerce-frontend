'use client';

import { useProductsNav } from './ProductsNavProvider';

const SORT_OPTIONS = [
  { value: '', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most popular' },
  { value: 'price_asc', label: 'Price: Low to high' },
  { value: 'price_desc', label: 'Price: High to low' },
];

export default function ProductSort({
  currentSort,
}: {
  currentSort?: string;
}) {
  const { navigate, isPending } = useProductsNav();

  return (
    <div className="flex items-center gap-2">
      <span className="hidden text-sm text-muted sm:inline">Sort</span>
      <select
        value={currentSort ?? ''}
        disabled={isPending}
        onChange={e =>
          navigate({ sort: e.target.value || undefined })
        }
        className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-ink disabled:opacity-60"
      >
        {SORT_OPTIONS.map(opt => (
          <option key={opt.value || 'featured'} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
