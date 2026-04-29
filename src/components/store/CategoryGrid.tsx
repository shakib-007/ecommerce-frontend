'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Category } from '@/types';

interface Props {
  categories: Category[];
}

// Assign a background color per category for visual variety
const categoryColors = [
  'bg-blue-50   hover:bg-blue-100',
  'bg-purple-50 hover:bg-purple-100',
  'bg-green-50  hover:bg-green-100',
  'bg-orange-50 hover:bg-orange-100',
  'bg-pink-50   hover:bg-pink-100',
  'bg-yellow-50 hover:bg-yellow-100',
];

export default function CategoryGrid({ categories }: Props) {
  // Only show root categories (no parent)
  const rootCategories = categories.filter(c => !c.parent);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {rootCategories.map((category, index) => (
        <motion.div
          key={category.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Link
            href={`/products?category=${category.slug}`}
            className={`
              flex flex-col items-center justify-center
              p-4 rounded-2xl text-center
              transition-colors duration-200 cursor-pointer
              ${categoryColors[index % categoryColors.length]}
            `}
          >
            <span className="text-2xl mb-2">
              {getCategoryEmoji(category.name)}
            </span>
            <span className="text-sm font-medium text-gray-800 leading-tight">
              {category.name}
            </span>
            {category.products_count !== undefined && (
              <span className="text-xs text-gray-400 mt-0.5">
                {category.products_count} items
              </span>
            )}
          </Link>
        </motion.div>
      ))}
    </div>
  );
}

// Simple emoji mapping for categories
function getCategoryEmoji(name: string): string {
  const map: Record<string, string> = {
    'electronics':      '📱',
    'clothing':         '👕',
    'home & living':    '🏠',
    'sports & outdoors':'⚽',
    'books':            '📚',
    'beauty':           '💄',
    'toys':             '🧸',
    'food':             '🍔',
  };

  const key = name.toLowerCase();
  for (const [k, v] of Object.entries(map)) {
    if (key.includes(k)) return v;
  }
  return '🛍️';
}