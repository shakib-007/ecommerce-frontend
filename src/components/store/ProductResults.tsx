import { productsApi } from '@/lib/api/product';
import type { ProductFilters } from '@/lib/api/product';
import ProductSort from '@/components/store/ProductSort';
import ProductGrid from '@/components/store/ProductGrid';
import ProductsPending from '@/components/store/ProductsPending';
import ActiveFilterTags from '@/components/store/ActiveFilterTags';
import type { Brand, Category } from '@/types';

interface Props {
  filters: ProductFilters;
  showFeaturedBadge: boolean;
  currentSort?: string;
  currentFilters: Record<string, string | undefined>;
  categories: Category[];
  brands: Brand[];
  /** When false, omit the meta/sort row (parent already renders it). */
  showToolbar?: boolean;
}

export default async function ProductResults({
  filters,
  showFeaturedBadge,
  currentSort,
  currentFilters,
  categories,
  brands,
  showToolbar = true,
}: Props) {
  let productsRes;

  try {
    productsRes = await productsApi.getAll(filters, {
      next: { revalidate: 30 },
    });
  } catch {
    return (
      <p className="py-10 text-center text-sm text-red-600">
        Could not load products from the API. Please try again later.
      </p>
    );
  }

  return (
    <ProductsPending>
      {showToolbar && (
        <div className="mb-4 flex items-center justify-between gap-4">
          <p className="text-sm text-muted">
            {productsRes.meta.total.toLocaleString('en-BD')} items
            <span className="mx-1.5 text-muted-light">·</span>
            updated hourly
          </p>
          <ProductSort currentSort={currentSort} />
        </div>
      )}

      <ActiveFilterTags
        currentFilters={currentFilters}
        categories={categories}
        brands={brands}
      />

      <ProductGrid
        products={productsRes.data}
        meta={productsRes.meta}
        currentFilters={currentFilters}
        showFeaturedBadge={showFeaturedBadge}
      />
    </ProductsPending>
  );
}
