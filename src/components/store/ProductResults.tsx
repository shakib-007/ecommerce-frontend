import { productsApi } from '@/lib/api/product';
import type { ProductFilters } from '@/lib/api/product';
import ProductSort from '@/components/store/ProductSort';
import ProductGrid from '@/components/store/ProductGrid';
import ProductsPending from '@/components/store/ProductsPending';

interface Props {
  filters: ProductFilters;
  showFeaturedBadge: boolean;
  currentSort?: string;
  currentFilters: Record<string, string | undefined>;
}

export default async function ProductResults({
  filters,
  showFeaturedBadge,
  currentSort,
  currentFilters,
}: Props) {
  let productsRes;

  try {
    productsRes = await productsApi.getAll(filters, {
      next: { revalidate: 30 },
    });
  } catch {
    return (
      <p className="text-sm text-red-600 py-10 text-center">
        Could not load products from the API. Please try again later.
      </p>
    );
  }

  return (
    <ProductsPending>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          Page {productsRes.meta.current_page} of {productsRes.meta.last_page}
          <span className="mx-2 text-gray-300">·</span>
          {productsRes.meta.total} products
        </p>
        <ProductSort currentSort={currentSort} />
      </div>

      <ProductGrid
        products={productsRes.data}
        meta={productsRes.meta}
        currentFilters={currentFilters}
        showFeaturedBadge={showFeaturedBadge}
      />
    </ProductsPending>
  );
}
