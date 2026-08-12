'use client';

import { Package } from 'lucide-react';
import { Product, PaginationMeta } from '@/types';
import ProductCard from '@/components/product/ProductCard';
import { useProductsNav } from './ProductsNavProvider';

interface Props {
  products: Product[];
  meta: PaginationMeta;
  currentFilters: Record<string, string | undefined>;
  showFeaturedBadge?: boolean;
}

export default function ProductGrid({
  products,
  meta,
  showFeaturedBadge = true,
}: Props) {
  const { navigate, isPending } = useProductsNav();

  function goToPage(page: number) {
    navigate({ page: String(page) }, { scroll: true, keepPage: true });
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
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            showFeaturedBadge={showFeaturedBadge}
          />
        ))}
      </div>

      {meta.last_page > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button
            onClick={() => goToPage(meta.current_page - 1)}
            disabled={isPending || meta.current_page === 1}
            className="px-4 py-2 text-sm border border-gray-300 rounded-xl disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            ← Prev
          </button>

          {getPageNumbers(meta.current_page, meta.last_page).map((page, i) =>
            page === '...' ? (
              <span key={`ellipsis-${i}`} className="px-2 text-gray-400">
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => goToPage(Number(page))}
                disabled={isPending}
                className={`
                  w-9 h-9 text-sm rounded-xl transition-colors disabled:opacity-60
                  ${
                    page === meta.current_page
                      ? 'bg-black text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                {page}
              </button>
            )
          )}

          <button
            onClick={() => goToPage(meta.current_page + 1)}
            disabled={isPending || meta.current_page === meta.last_page}
            className="px-4 py-2 text-sm border border-gray-300 rounded-xl disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            Next →
          </button>
        </div>
      )}

      <p className="text-center text-xs text-gray-400 mt-4">
        Showing {meta.from}–{meta.to} of {meta.total} products
      </p>
    </div>
  );
}

function getPageNumbers(
  current: number,
  total: number
): (number | '...')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | '...')[] = [1];

  if (current > 3) pages.push('...');

  for (
    let i = Math.max(2, current - 1);
    i <= Math.min(total - 1, current + 1);
    i++
  ) {
    pages.push(i);
  }

  if (current < total - 2) pages.push('...');

  pages.push(total);

  return pages;
}
