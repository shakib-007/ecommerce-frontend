// src/app/(store)/products/page.tsx
import { Suspense } from 'react';
import { productsApi } from '@/lib/api/product';

import Spinner from '@/components/ui/Spinner';
import ProductFilters from '@/components/store/ProductFilters';
import ProductSort from '@/components/store/ProductSort';
import ProductGrid from '@/components/store/ProductGrid';

interface SearchParams {
  category?: string;
  brand?:    string;
  search?:   string;
  min_price?:string;
  max_price?:string;
  featured?: string;
  in_stock?: string;
  sort?:     string;
  page?:     string;
  per_page?: string;
}

interface Props {
  searchParams: SearchParams;
}

export async function generateMetadata({ searchParams }: Props) {
  const title = searchParams.category
    ? `${searchParams.category} — Products`
    : searchParams.search
      ? `Search: ${searchParams.search}`
      : 'All Products';

  return { title };
}

export default async function ProductsPage({ searchParams }: Props) {
  const filters = {
    category:  searchParams.category,
    brand:     searchParams.brand,
    search:    searchParams.search,
    min_price: searchParams.min_price ? Number(searchParams.min_price) : undefined,
    max_price: searchParams.max_price ? Number(searchParams.max_price) : undefined,
    featured:  searchParams.featured === 'true' ? true : undefined,
    in_stock:  searchParams.in_stock === 'true' ? true : undefined,
    sort:      searchParams.sort as any,
    page:      searchParams.page ? Number(searchParams.page) : 1,
    per_page:  16,
  };

  const [productsRes, categoriesRes, brandsRes] = await Promise.all([
    productsApi.getAll(filters, { next: { revalidate: 60 } }),
    productsApi.getCategories({ next: { revalidate: 3600 } }),
    productsApi.getBrands({ next: { revalidate: 3600 } }),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          {searchParams.search
            ? `Results for "${searchParams.search}"`
            : searchParams.category
              ? searchParams.category.replace(/-/g, ' ')
              : 'All Products'
          }
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {productsRes.meta.total} products found
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">

        {/* Sidebar filters */}
        <aside className="w-full lg:w-64 shrink-0">
          <ProductFilters
            categories={categoriesRes.data}
            brands={brandsRes.data}
            currentFilters={searchParams}
          />
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Sort bar */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              Page {productsRes.meta.current_page} of {productsRes.meta.last_page}
            </p>
            <ProductSort currentSort={searchParams.sort} />
          </div>

          {/* Product grid */}
          <Suspense fallback={<Spinner />}>
            <ProductGrid
              products={productsRes.data}
              meta={productsRes.meta}
              currentFilters={searchParams}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}