// src/app/(store)/products/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { productsApi } from '@/lib/api/product';

import ProductCard from '@/components/product/ProductCard';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import ProductGallery from '@/components/product/ProductGallery';
import VariantSelector from '@/components/product/VariantSelector';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props) {
  try {
    const res = await productsApi.getBySlug(params.slug);
    return {
      title:       res.data.name,
      description: res.data.description?.slice(0, 160) ?? '',
    };
  } catch {
    return { title: 'Product not found' };
  }
}

export default async function ProductDetailPage({ params }: Props) {
  let product, related;

  try {
    const res = await productsApi.getBySlug(
      params.slug,
      { next: { revalidate: 30 } }
    );
    product = res.data;
    related = res.related ?? [];
  } catch {
    notFound();
  }

  const avgRating   = product.rating_avg ?? 0;
  const ratingCount = product.rating_count ?? 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <a href="/" className="hover:text-black transition-colors">Home</a>
        <span>/</span>
        <a href="/products" className="hover:text-black transition-colors">Products</a>
        {product.category && (
          <>
            <span>/</span>
            <Link
              href={`/products?category=${product.category.slug}`}
              className="hover:text-black transition-colors"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-gray-700 truncate max-w-[200px]">
          {product.name}
        </span>
      </nav>

      {/* Main product section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">

        {/* Left — Gallery */}
        <ProductGallery images={product.images} productName={product.name} />

        {/* Right — Info + Variant selector */}
        <div className="flex flex-col">

          {/* Brand */}
          {product.brand && (
            <Link
              href={`/products?brand=${product.brand.slug}`}
              className="text-sm text-gray-400 hover:text-black mb-1 transition-colors w-fit"
            >
              {product.brand.name}
            </Link>
          )}

          {/* Name */}
          <h1 className="text-2xl font-semibold text-gray-900 mb-3">
            {product.name}
          </h1>

          {/* Rating */}
          {ratingCount > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map(star => (
                  <span
                    key={star}
                    className={`text-base ${
                      star <= Math.round(avgRating)
                        ? 'text-yellow-400'
                        : 'text-gray-200'
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="text-sm text-gray-500">
                {avgRating.toFixed(1)} ({ratingCount} reviews)
              </span>
            </div>
          )}

          {/* Base price */}
          <div className="mb-6">
            <span className="text-3xl font-bold text-gray-900">
              {formatPrice(product.price_from)}
            </span>
            <span className="text-sm text-gray-400 ml-2">
              Starting price
            </span>
          </div>

          {/* Variant selector — client component */}
          <VariantSelector product={product} />

          {/* Description */}
          {product.description && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                Description
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      {product.reviews && product.reviews.length > 0 && (
        <section className="mb-16">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Customer Reviews
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {product.reviews.map((review: any) => (
              <div
                key={review.id}
                className="bg-white border border-gray-100 rounded-2xl p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">
                    {review.user_name}
                  </span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(star => (
                      <span
                        key={star}
                        className={`text-xs ${
                          star <= review.rating
                            ? 'text-yellow-400'
                            : 'text-gray-200'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                {review.title && (
                  <p className="text-sm font-medium text-gray-800 mb-1">
                    {review.title}
                  </p>
                )}
                {review.body && (
                  <p className="text-sm text-gray-500 line-clamp-3">
                    {review.body}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related products */}
      {related.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            You might also like
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {related.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}