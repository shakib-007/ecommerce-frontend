import { Suspense } from 'react';
import { productsApi } from '@/lib/api/product';

import ProductFilters from '@/components/store/ProductFilters';
import ProductResults from '@/components/store/ProductResults';
import { ProductsNavProvider } from '@/components/store/ProductsNavProvider';
import {
  ProductsListingSkeleton,
  ProductsPageSkeleton,
} from '@/components/skeletons/StoreSkeletons';

interface SearchParams {
  category?: string;
  brand?: string;
  search?: string;
  min_price?: string;
  max_price?: string;
  featured?: string;
  in_stock?: string;
  sort?: string;
  page?: string;
  per_page?: string;
}

interface Props {
  searchParams: Promise<SearchParams>;
}

export async function generateMetadata({ searchParams }: Props) {
  const params = await searchParams;

  const title =
    params.featured === 'true'
      ? 'Featured Products'
      : params.category
        ? `${params.category} — Products`
        : params.search
          ? `Search: ${params.search}`
          : 'All Products';

  return { title };
}

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams;

  const filters = {
    category: params.category,
    brand: params.brand,
    search: params.search,
    min_price: params.min_price ? Number(params.min_price) : undefined,
    max_price: params.max_price ? Number(params.max_price) : undefined,
    featured: params.featured === 'true' ? true : undefined,
    in_stock: params.in_stock === 'true' ? true : undefined,
    sort: params.sort as
      | 'price_asc'
      | 'price_desc'
      | 'newest'
      | 'popular'
      | undefined,
    page: params.page ? Number(params.page) : 1,
    per_page: 16,
  };

  // Categories/brands change rarely — cache them so filter clicks only wait on products.
  const [categoriesRes, brandsRes] = await Promise.all([
    productsApi.getCategories({ next: { revalidate: 3600 } }).catch(() => ({ data: [] })),
    productsApi.getBrands({ next: { revalidate: 3600 } }).catch(() => ({ data: [] })),
  ]);

  const heading =
    params.featured === 'true'
      ? 'Featured Products'
      : params.search
        ? `Results for "${params.search}"`
        : params.category
          ? params.category.replace(/-/g, ' ')
          : 'All Products';

  const resultsKey = [
    params.category,
    params.brand,
    params.search,
    params.min_price,
    params.max_price,
    params.featured,
    params.in_stock,
    params.sort,
    params.page,
  ].join('|');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">{heading}</h1>
      </div>

      <Suspense fallback={<ProductsPageSkeleton />}>
        <ProductsNavProvider>
          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="w-full lg:w-64 shrink-0">
              <ProductFilters
                categories={categoriesRes.data}
                brands={brandsRes.data}
                currentFilters={params}
              />
            </aside>

            <div className="flex-1 min-w-0">
              <Suspense key={resultsKey} fallback={<ProductsListingSkeleton />}>
                <ProductResults
                  filters={filters}
                  showFeaturedBadge={params.featured !== 'true'}
                  currentSort={params.sort}
                  currentFilters={params}
                />
              </Suspense>
            </div>
          </div>
        </ProductsNavProvider>
      </Suspense>
    </div>
  );
}
