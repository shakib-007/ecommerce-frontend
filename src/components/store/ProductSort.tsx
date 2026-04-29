// src/components/store/ProductSort.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest first' },
  { value: 'price_asc',  label: 'Price: Low to high' },
  { value: 'price_desc', label: 'Price: High to low' },
  { value: 'popular',    label: 'Most popular' },
];

export default function ProductSort({
  currentSort,
}: {
  currentSort?: string;
}) {
  const router = useRouter();
  const params = useSearchParams();

  function handleSort(value: string) {
    const current = new URLSearchParams(params.toString());
    current.set('sort', value);
    current.set('page', '1');
    router.push(`/products?${current.toString()}`);
  }

  return (
    <select
      value={currentSort ?? 'newest'}
      onChange={e => handleSort(e.target.value)}
      className="text-sm border border-gray-300 rounded-xl px-3 py-2 outline-none focus:border-black bg-white"
    >
      {SORT_OPTIONS.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}