import Link from 'next/link';
import { productsApi } from '@/lib/api/product';
import HeroSection from '@/components/store/HeroSection';
import CategoryGrid from '@/components/store/CategoryGrid';
import ProductCard from '@/components/product/ProductCard';

export const revalidate = 3600;

export default async function HomePage() {
  const [featuredRes, categoriesRes] = await Promise.all([
    productsApi.getFeatured({ next: { revalidate: 3600 } }),
    productsApi.getCategories({ next: { revalidate: 3600 } }),
  ]);

  const featured   = featuredRes.data   ?? [];
  const categories = categoriesRes.data ?? [];

  return (
    <div>
      {/* Hero */}
      <HeroSection />

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Shop by Category
          </h2>
        </div>
        <CategoryGrid categories={categories} />
      </section>

      {/* Featured Products */}
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
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}