'use client';

import type { ReactNode } from 'react';
import { useProductsNav } from './ProductsNavProvider';

export default function ProductsPending({ children }: { children: ReactNode }) {
  const { isPending } = useProductsNav();

  return (
    <div
      className={`transition-opacity duration-150 ${
        isPending ? 'opacity-50 pointer-events-none' : 'opacity-100'
      }`}
      aria-busy={isPending}
    >
      {children}
    </div>
  );
}
