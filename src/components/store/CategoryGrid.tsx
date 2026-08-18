'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Category } from '@/types';
import { getImageUrl } from '@/lib/utils';

interface Props {
  categories: Category[];
}

/** Lifestyle fallbacks when API has no category image — matches Lovable mood. */
const FALLBACK_IMAGES: Record<string, string> = {
  electronics:
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80',
  apparel:
    'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=900&q=80',
  clothing:
    'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=900&q=80',
  home: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=80',
  essentials:
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80',
  default:
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=900&q=80',
};

function fallbackFor(name: string, slug: string): string {
  const key = `${slug} ${name}`.toLowerCase();
  for (const [k, url] of Object.entries(FALLBACK_IMAGES)) {
    if (k !== 'default' && key.includes(k)) return url;
  }
  return FALLBACK_IMAGES.default;
}

export default function CategoryGrid({ categories }: Props) {
  const rootCategories = categories.filter(c => !c.parent).slice(0, 4);

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
      {rootCategories.map((category, index) => {
        const src = category.image_url
          ? getImageUrl(category.image_url)
          : fallbackFor(category.name, category.slug);

        return (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ delay: index * 0.06, duration: 0.45 }}
          >
            <Link
              href={`/products?category=${category.slug}`}
              className="group relative block aspect-[4/5] overflow-hidden rounded-2xl"
            >
              <img
                src={src}
                alt={category.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                <h3 className="font-display text-xl font-semibold text-white sm:text-2xl">
                  {category.name}
                </h3>
                {category.products_count !== undefined && (
                  <p className="mt-1 text-sm text-white/75">
                    {category.products_count.toLocaleString('en-BD')} products
                  </p>
                )}
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
