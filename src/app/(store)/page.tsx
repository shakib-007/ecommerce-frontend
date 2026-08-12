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

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Shop by Category
          </h2>
        </div>
        {categories.length === 0 ? (
          <p className="text-gray-400 text-sm">Categories unavailable right now.</p>
        ) : (
          <CategoryGrid categories={categories} />
        )}
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Featured Products
          </h2>
          <Link
            href="/products?featured=true"
            className="text-sm text-gray-500 hover:text-black transition-colors"
          >
            View all →
          </Link>
        </div>

        {featured.length === 0 ? (
          <p className="text-gray-400 text-sm">No featured products yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featured.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                showFeaturedBadge={false}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
