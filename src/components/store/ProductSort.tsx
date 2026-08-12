'use client';

import { useProductsNav } from './ProductsNavProvider';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price_asc', label: 'Price: Low to high' },
  { value: 'price_desc', label: 'Price: High to low' },
  { value: 'popular', label: 'Most popular' },
];

export default function ProductSort({
  currentSort,
}: {
  currentSort?: string;
}) {
  const { navigate, isPending } = useProductsNav();

  return (
    <select
      value={currentSort ?? 'newest'}
      disabled={isPending}
      onChange={e => navigate({ sort: e.target.value })}
      className="text-sm border border-gray-300 rounded-xl px-3 py-2 outline-none focus:border-black bg-white text-gray-700 disabled:opacity-60"
    >
      {SORT_OPTIONS.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
