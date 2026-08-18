import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { productsApi } from '@/lib/api/product';
import ProductCard from '@/components/product/ProductCard';
import ProductGallery from '@/components/product/ProductGallery';
import VariantSelector from '@/components/product/VariantSelector';
import { formatPrice, getDiscountPercent } from '@/lib/utils';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;

  try {
    const res = await productsApi.getBySlug(slug);
    return {
      title: res.data.name,
      description: res.data.description?.slice(0, 160) ?? '',
    };
  } catch {
    return { title: 'Product not found' };
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  let product, related;

  try {
    const res = await productsApi.getBySlug(slug, {
      next: { revalidate: 30 },
    });
    product = res.data;
    related = res.related ?? [];
  } catch {
    notFound();
  }

  const avgRating = product.rating_avg ?? 0;
  const ratingCount = product.rating_count ?? 0;
  const compareAt =
    product.base_price > product.price_from ? product.base_price : null;
  const discount = getDiscountPercent(product.price_from, compareAt);

  return (
    <div className="container-store py-8 md:py-10">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-muted" aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="transition-colors hover:text-ink">
              Home
            </Link>
          </li>
          <li className="text-muted-light" aria-hidden>
            /
          </li>
          <li>
            <Link href="/products" className="transition-colors hover:text-ink">
              Products
            </Link>
          </li>
          {product.category && (
            <>
              <li className="text-muted-light" aria-hidden>
                /
              </li>
              <li>
                <Link
                  href={`/products?category=${product.category.slug}`}
                  className="transition-colors hover:text-ink"
                >
                  {product.category.name}
                </Link>
              </li>
            </>
          )}
          <li className="text-muted-light" aria-hidden>
            /
          </li>
          <li className="max-w-[200px] truncate text-ink">{product.name}</li>
        </ol>
      </nav>

      {/* Main */}
      <div className="mb-16 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14">
        <ProductGallery images={product.images} productName={product.name} />

        <div className="flex flex-col">
          {product.brand && (
            <Link
              href={`/products?brand=${product.brand.slug}`}
              className="mb-2 w-fit text-[11px] font-semibold uppercase tracking-[0.14em] text-muted transition-colors hover:text-accent"
            >
              {product.brand.name}
            </Link>
          )}

          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink text-balance sm:text-4xl">
            {product.name}
          </h1>

          {ratingCount > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    size={14}
                    className={
                      star <= Math.round(avgRating)
                        ? 'fill-accent text-accent'
                        : 'fill-transparent text-border-strong'
                    }
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-ink">
                {avgRating.toFixed(1)}
              </span>
              <span className="text-sm text-muted">
                ({ratingCount} reviews)
              </span>
            </div>
          )}

          <div className="mt-5 flex flex-wrap items-baseline gap-3">
            <span className="text-3xl font-bold text-ink">
              {formatPrice(product.price_from)}
            </span>
            {compareAt !== null && (
              <span className="text-base text-muted line-through">
                {formatPrice(compareAt)}
              </span>
            )}
            {discount !== null && (
              <span className="rounded-md bg-accent px-2 py-0.5 text-xs font-semibold text-white">
                −{discount}%
              </span>
            )}
            <span className="w-full text-sm text-muted sm:w-auto">
              Starting price
            </span>
          </div>

          <div className="mt-8">
            <VariantSelector product={product} />
          </div>

          {product.description && (
            <div className="mt-8 border-t border-border pt-6">
              <h3 className="mb-2 text-sm font-semibold text-ink">Description</h3>
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      {product.reviews && product.reviews.length > 0 && (
        <section className="mb-16">
          <p className="section-eyebrow mb-2">Reviews</p>
          <h2 className="mb-6 font-display text-2xl font-semibold text-ink sm:text-3xl">
            Customer reviews
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {product.reviews.map(review => (
              <div
                key={review.id}
                className="rounded-xl border border-border bg-surface p-5"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-ink">
                    {review.user_name}
                  </span>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        size={12}
                        className={
                          star <= review.rating
                            ? 'fill-accent text-accent'
                            : 'fill-transparent text-border-strong'
                        }
                      />
                    ))}
                  </div>
                </div>
                {review.title && (
                  <p className="mb-1 text-sm font-medium text-ink">
                    {review.title}
                  </p>
                )}
                {review.body && (
                  <p className="line-clamp-3 text-sm text-muted">{review.body}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related */}
      {related.length > 0 && (
        <section className="pb-8">
          <p className="section-eyebrow mb-2">More to explore</p>
          <h2 className="mb-6 font-display text-2xl font-semibold text-ink sm:text-3xl">
            You might also like
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item: (typeof related)[number]) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
