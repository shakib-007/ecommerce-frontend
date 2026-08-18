'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductImage } from '@/types';
import { getImageUrl } from '@/lib/utils';

interface Props {
  images: ProductImage[];
  productName: string;
}

export default function ProductGallery({ images, productName }: Props) {
  const primaryIndex = images.findIndex(img => img.is_primary);
  const [active, setActive] = useState(primaryIndex >= 0 ? primaryIndex : 0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-2xl bg-surface-warm">
        <span className="text-sm text-muted-light">No image</span>
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
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-surface-warm">
        <AnimatePresence mode="wait">
          <motion.img
            key={active}
            src={getImageUrl(images[active].url)}
            alt={`${productName} — image ${active + 1}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full w-full object-contain p-6 sm:p-10"
          />
        </AnimatePresence>

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-border bg-surface/90 p-2 text-ink shadow-sm transition-colors hover:bg-surface"
              aria-label="Previous image"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-border bg-surface/90 p-2 text-ink shadow-sm transition-colors hover:bg-surface"
              aria-label="Next image"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}

        {images.length > 1 && (
          <div className="absolute bottom-3 right-3 rounded-full bg-ink/70 px-2.5 py-0.5 text-xs text-white">
            {active + 1} / {images.length}
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, index) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActive(index)}
              className={`
                h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 bg-surface-warm transition-colors
                ${
                  active === index
                    ? 'border-accent'
                    : 'border-transparent hover:border-border-strong'
                }
              `}
            >
              <img
                src={getImageUrl(img.url)}
                alt={`Thumbnail ${index + 1}`}
                className="h-full w-full object-contain p-1"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
