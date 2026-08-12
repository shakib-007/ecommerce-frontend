'use client';

import Skeleton from 'react-loading-skeleton';

const baseColor = '#e5e7eb';
const highlightColor = '#f3f4f6';

function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 overflow-hidden bg-white">
      <Skeleton
        height={220}
        className="!rounded-none !leading-none"
        baseColor={baseColor}
        highlightColor={highlightColor}
      />
      <div className="p-3 space-y-2">
        <Skeleton width="40%" height={10} baseColor={baseColor} highlightColor={highlightColor} />
        <Skeleton width="75%" height={14} baseColor={baseColor} highlightColor={highlightColor} />
        <Skeleton width="30%" height={14} baseColor={baseColor} highlightColor={highlightColor} />
        <Skeleton height={36} borderRadius={12} baseColor={baseColor} highlightColor={highlightColor} />
      </div>
    </div>
  );
}

export function ProductsListingSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Skeleton width={160} height={16} baseColor={baseColor} highlightColor={highlightColor} />
        <Skeleton width={176} height={36} borderRadius={12} baseColor={baseColor} highlightColor={highlightColor} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function ProductsPageSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="rounded-2xl border border-gray-100 p-5 space-y-4 bg-white">
          <Skeleton width={80} height={16} baseColor={baseColor} highlightColor={highlightColor} />
          <Skeleton height={20} baseColor={baseColor} highlightColor={highlightColor} />
          <Skeleton count={6} height={28} className="mb-2" baseColor={baseColor} highlightColor={highlightColor} />
          <Skeleton width={60} height={16} baseColor={baseColor} highlightColor={highlightColor} />
          <Skeleton count={4} height={24} className="mb-2" baseColor={baseColor} highlightColor={highlightColor} />
        </div>
      </aside>
      <div className="flex-1 min-w-0">
        <ProductsListingSkeleton />
      </div>
    </div>
  );
}

export function ProductsRouteSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Skeleton width={180} height={28} baseColor={baseColor} highlightColor={highlightColor} />
      </div>
      <ProductsPageSkeleton />
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 py-8">
      <div className="mb-6">
        <Skeleton width={280} height={14} baseColor={baseColor} highlightColor={highlightColor} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
        <div>
          <Skeleton
            height={480}
            borderRadius={16}
            baseColor={baseColor}
            highlightColor={highlightColor}
          />
          <div className="flex gap-2 mt-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton
                key={i}
                width={72}
                height={72}
                borderRadius={12}
                baseColor={baseColor}
                highlightColor={highlightColor}
              />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Skeleton width={100} height={14} baseColor={baseColor} highlightColor={highlightColor} />
          <Skeleton width="80%" height={28} baseColor={baseColor} highlightColor={highlightColor} />
          <Skeleton width={140} height={16} baseColor={baseColor} highlightColor={highlightColor} />
          <Skeleton width={160} height={36} baseColor={baseColor} highlightColor={highlightColor} />
          <div className="pt-2 space-y-3">
            <Skeleton width={80} height={14} baseColor={baseColor} highlightColor={highlightColor} />
            <div className="flex gap-2">
              <Skeleton width={64} height={36} borderRadius={10} baseColor={baseColor} highlightColor={highlightColor} />
              <Skeleton width={64} height={36} borderRadius={10} baseColor={baseColor} highlightColor={highlightColor} />
              <Skeleton width={64} height={36} borderRadius={10} baseColor={baseColor} highlightColor={highlightColor} />
            </div>
          </div>
          <Skeleton height={48} borderRadius={12} baseColor={baseColor} highlightColor={highlightColor} />
          <Skeleton count={3} baseColor={baseColor} highlightColor={highlightColor} />
        </div>
      </div>

      <div>
        <Skeleton width={180} height={22} className="mb-4" baseColor={baseColor} highlightColor={highlightColor} />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function CheckoutSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Skeleton width={140} height={28} className="mb-8" baseColor={baseColor} highlightColor={highlightColor} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-gray-100 p-5 space-y-4"
            >
              <Skeleton width={160} height={18} baseColor={baseColor} highlightColor={highlightColor} />
              <Skeleton height={72} borderRadius={12} baseColor={baseColor} highlightColor={highlightColor} />
              <Skeleton height={72} borderRadius={12} baseColor={baseColor} highlightColor={highlightColor} />
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-gray-100 p-5 space-y-4 h-fit">
          <Skeleton width={120} height={18} baseColor={baseColor} highlightColor={highlightColor} />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton width={56} height={56} borderRadius={10} baseColor={baseColor} highlightColor={highlightColor} />
              <div className="flex-1 space-y-2">
                <Skeleton width="80%" height={12} baseColor={baseColor} highlightColor={highlightColor} />
                <Skeleton width="40%" height={12} baseColor={baseColor} highlightColor={highlightColor} />
              </div>
            </div>
          ))}
          <Skeleton height={1} baseColor={baseColor} highlightColor={highlightColor} />
          <Skeleton height={14} baseColor={baseColor} highlightColor={highlightColor} />
          <Skeleton height={14} baseColor={baseColor} highlightColor={highlightColor} />
          <Skeleton height={20} baseColor={baseColor} highlightColor={highlightColor} />
          <Skeleton height={48} borderRadius={12} baseColor={baseColor} highlightColor={highlightColor} />
        </div>
      </div>
    </div>
  );
}
