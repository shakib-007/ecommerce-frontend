import { Suspense } from 'react';
import Link from 'next/link';
import { productsApi } from '@/lib/api/product';

import ProductFilters from '@/components/store/ProductFilters';
import ProductResults from '@/components/store/ProductResults';
import ProductSort from '@/components/store/ProductSort';
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
    per_page: 12,
  };

  const [categoriesRes, brandsRes] = await Promise.all([
    productsApi.getCategories({ next: { revalidate: 3600 } }).catch(() => ({ data: [] as Awaited<ReturnType<typeof productsApi.getCategories>>['data'] })),
    productsApi.getBrands({ next: { revalidate: 3600 } }).catch(() => ({ data: [] as Awaited<ReturnType<typeof productsApi.getBrands>>['data'] })),
  ]);

  const heading =
    params.featured === 'true'
      ? 'Featured products'
      : params.search
        ? `Results for “${params.search}”`
        : params.category
          ? (
              categoriesRes.data.find(c => c.slug === params.category)?.name ??
              params.category.replace(/-/g, ' ')
            )
          : 'All products';

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
    <div className="container-store py-8 md:py-10">
      {/* Breadcrumb */}
      <nav className="mb-4 text-sm text-muted" aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="transition-colors hover:text-ink">
              Home
            </Link>
          </li>
          <li aria-hidden className="text-muted-light">
            /
          </li>
          <li className="text-ink">All products</li>
        </ol>
      </nav>

      <Suspense fallback={<ProductsPageSkeleton />}>
        <ProductsNavProvider>
          {/* Title + sort */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                {heading}
              </h1>
              <p className="mt-2 text-sm text-muted">
                Browse the full catalog · updated hourly
              </p>
            </div>
            <ProductSort currentSort={params.sort} />
          </div>

          <div className="flex flex-col gap-8 lg:flex-row">
            <aside className="w-full shrink-0 lg:w-64 xl:w-72">
              <ProductFilters
                categories={categoriesRes.data}
                brands={brandsRes.data}
                currentFilters={params}
              />
            </aside>

            <div className="min-w-0 flex-1">
              <Suspense key={resultsKey} fallback={<ProductsListingSkeleton />}>
                <ProductResults
                  filters={filters}
                  showFeaturedBadge={params.featured !== 'true'}
                  currentSort={params.sort}
                  currentFilters={params}
                  categories={categoriesRes.data}
                  brands={brandsRes.data}
                  showToolbar={false}
                />
              </Suspense>
            </div>
          </div>
        </ProductsNavProvider>
      </Suspense>
    </div>
  );
}
