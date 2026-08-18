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
        <Package size={48} className="mb-4 text-muted-light" strokeWidth={1.25} />
        <h3 className="mb-2 font-display text-xl font-semibold text-ink">
          No products found
        </h3>
        <p className="text-sm text-muted">
          Try adjusting your filters or search terms.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {products.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            showFeaturedBadge={showFeaturedBadge}
          />
        ))}
      </div>

      {meta.last_page > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          <button
            onClick={() => goToPage(meta.current_page - 1)}
            disabled={isPending || meta.current_page === 1}
            className="rounded-lg border border-border px-4 py-2 text-sm text-ink transition-colors hover:bg-surface-muted disabled:opacity-40"
          >
            ← Prev
          </button>

          {getPageNumbers(meta.current_page, meta.last_page).map((page, i) =>
            page === '...' ? (
              <span key={`ellipsis-${i}`} className="px-2 text-muted-light">
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => goToPage(Number(page))}
                disabled={isPending}
                className={`
                  flex h-9 w-9 items-center justify-center rounded-lg text-sm transition-colors disabled:opacity-60
                  ${
                    page === meta.current_page
                      ? 'bg-accent text-white'
                      : 'border border-border text-ink hover:bg-surface-muted'
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
            className="rounded-lg border border-border px-4 py-2 text-sm text-ink transition-colors hover:bg-surface-muted disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}

      <p className="mt-4 text-center text-xs text-muted-light">
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
