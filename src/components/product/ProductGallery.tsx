// src/components/product/ProductGallery.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductImage } from '@/types';
import { getImageUrl } from '@/lib/utils';

interface Props {
  images:      ProductImage[];
  productName: string;
}

export default function ProductGallery({ images, productName }: Props) {
  const primaryIndex = images.findIndex(img => img.is_primary);
  const [active, setActive] = useState(primaryIndex >= 0 ? primaryIndex : 0);

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-gray-100 rounded-2xl flex items-center justify-center">
        <span className="text-gray-300 text-sm">No image</span>
      </div>
    );
  }

  function prev() {
    setActive(i => (i === 0 ? images.length - 1 : i - 1));
  }

  function next() {
    setActive(i => (i === images.length - 1 ? 0 : i + 1));
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img
            key={active}
            src={getImageUrl(images[active].url)}
            alt={`${productName} — image ${active + 1}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full object-cover"
          />
        </AnimatePresence>

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1.5 rounded-xl shadow-sm transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1.5 rounded-xl shadow-sm transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}

        {/* Image counter */}
        {images.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
            {active + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, index) => (
            <button
              key={img.id}
              onClick={() => setActive(index)}
              className={`
                shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors
                ${active === index
                  ? 'border-black'
                  : 'border-transparent hover:border-gray-300'
                }
              `}
            >
              <img
                src={getImageUrl(img.url)}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}