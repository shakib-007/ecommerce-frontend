// src/components/store/ProductGrid.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Package } from 'lucide-react';
import { Product, PaginationMeta } from '@/types';
import ProductCard from '@/components/product/ProductCard';

interface Props {
  products:       Product[];
  meta:           PaginationMeta;
  currentFilters: any;
}

export default function ProductGrid({ products, meta, currentFilters }: Props) {
  const router = useRouter();
  const params = useSearchParams();

  function goToPage(page: number) {
    const current = new URLSearchParams(params.toString());
    current.set('page', String(page));
    router.push(`/products?${current.toString()}`);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Package size={48} className="text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No products found
        </h3>
        <p className="text-sm text-gray-500">
          Try adjusting your filters or search terms.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Grid */}
      <motion.div
        layout
        className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4"
      >
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </motion.div>

      {/* Pagination */}
      {meta.last_page > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          {/* Prev */}
          <button
            onClick={() => goToPage(meta.current_page - 1)}
            disabled={meta.current_page === 1}
            className="px-4 py-2 text-sm border border-gray-300 rounded-xl disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            ← Prev
          </button>

          {/* Page numbers */}
          {getPageNumbers(meta.current_page, meta.last_page).map((page, i) =>
            page === '...' ? (
              <span key={`ellipsis-${i}`} className="px-2 text-gray-400">
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => goToPage(Number(page))}
                className={`
                  w-9 h-9 text-sm rounded-xl transition-colors
                  ${page === meta.current_page
                    ? 'bg-black text-white'
                    : 'border border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                {page}
              </button>
            )
          )}

          {/* Next */}
          <button
            onClick={() => goToPage(meta.current_page + 1)}
            disabled={meta.current_page === meta.last_page}
            className="px-4 py-2 text-sm border border-gray-300 rounded-xl disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            Next →
          </button>
        </div>
      )}

      {/* Result count */}
      <p className="text-center text-xs text-gray-400 mt-4">
        Showing {meta.from}–{meta.to} of {meta.total} products
      </p>
    </div>
  );
}

// Generate smart page number array like [1, 2, '...', 8, 9, 10]
function getPageNumbers(
  current: number,
  total: number
): (number | '...')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | '...')[] = [1];

  if (current > 3) pages.push('...');

  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i);
  }

  if (current < total - 2) pages.push('...');

  pages.push(total);

  return pages;
}