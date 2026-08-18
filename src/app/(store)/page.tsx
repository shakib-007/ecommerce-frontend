import Link from 'next/link';
import { productsApi } from '@/lib/api/product';
import HeroSection from '@/components/store/HeroSection';
import CategoryGrid from '@/components/store/CategoryGrid';
import ProductCard from '@/components/product/ProductCard';
import type { Category, Product } from '@/types';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let featured: Product[] = [];
  let categories: Category[] = [];

  try {
    const [featuredRes, categoriesRes] = await Promise.all([
      productsApi.getFeatured({ cache: 'no-store' }),
      productsApi.getCategories({ cache: 'no-store' }),
    ]);
    featured = featuredRes.data ?? [];
    categories = categoriesRes.data ?? [];
  } catch {
    // Keep homepage rendering even when the API/DB is down.
    try {
      const categoriesRes = await productsApi.getCategories({ cache: 'no-store' });
      categories = categoriesRes.data ?? [];
    } catch {
      categories = [];
    }
  }

  return (
    <div>
      <HeroSection />

      {/* Shop by category — Lovable */}
      <section className="bg-background py-14 md:py-20">
        <div className="container-store">
          <div className="mb-8 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="section-eyebrow mb-2">Shop by category</p>
              <h2 className="font-display text-3xl font-semibold tracking-tight text-ink text-balance sm:text-4xl lg:text-[2.75rem]">
                Four aisles, zero clutter
              </h2>
            </div>
            <Link
              href="/products"
              className="text-sm font-medium text-accent transition-colors hover:text-accent-hover"
            >
              Browse all
            </Link>
          </div>

          {categories.length === 0 ? (
            <p className="text-sm text-muted">Categories unavailable right now.</p>
          ) : (
            <CategoryGrid categories={categories} />
          )}
        </div>
      </section>

      {/* Featured products — Lovable */}
      <section className="border-t border-border bg-background py-14 md:py-20">
        <div className="container-store">
          <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="section-eyebrow mb-2">Featured this week</p>
              <h2 className="font-display text-3xl font-semibold tracking-tight text-ink text-balance sm:text-4xl lg:text-[2.75rem]">
                Picked for value, kept for quality
              </h2>
            </div>
            <Link
              href="/products?featured=true"
              className="inline-flex items-center justify-center rounded-lg border border-border-strong bg-surface px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-surface-muted"
            >
              All products
            </Link>
          </div>

          {featured.length === 0 ? (
            <p className="text-sm text-muted">No featured products yet.</p>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {featured.slice(0, 6).map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  showFeaturedBadge={false}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
