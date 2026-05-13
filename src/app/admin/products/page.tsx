'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Plus, Search, Edit, Trash2,
  RotateCcw, Package, ChevronDown,
} from 'lucide-react';
import { adminApi } from '@/lib/api/admin';
import { formatPrice, getImageUrl } from '@/lib/utils';
import Spinner from '@/components/ui/Spinner';
import Badge from '@/components/ui/Badge';

export default function AdminProductsPage() {
  const [products,  setProducts]  = useState<any[]>([]);
  const [meta,      setMeta]      = useState<any>(null);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [page,      setPage]      = useState(1);
  const [deleting,  setDeleting]  = useState<string | null>(null);
  const [restoring, setRestoring] = useState<string | null>(null);

  async function fetchProducts() {
    setLoading(true);
    try {
      const res = await adminApi.getProducts({ search, page, per_page: 15 });
      setProducts(res.data);
      setMeta(res.meta);
    } finally {
      setLoading(false);
    }
  }

  // useEffect(() => {
  //   const timer = setTimeout(fetchProducts, 300);
  //   return () => clearTimeout(timer);
  // }, [search, page]);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm('Soft delete this product? It can be restored later.')) return;
    setDeleting(id);
    try {
      await adminApi.deleteProduct(id);
      fetchProducts();
    } finally {
      setDeleting(null);
    }
  }

  async function handleRestore(id: string) {
    setRestoring(id);
    try {
      await adminApi.restoreProduct(id);
      fetchProducts();
    } finally {
      setRestoring(null);
    }
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {meta?.total ?? 0} products total
          </p>
        </div>
        <Link
          href="/admin/products/create"
          className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <Plus size={16} />
          Add product
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:border-black transition-colors"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Package size={36} className="text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">No products found.</p>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="hidden sm:grid grid-cols-12 gap-4 px-5 py-3 border-b border-gray-100 text-xs font-medium text-gray-400 uppercase tracking-wider">
              <span className="col-span-5">Product</span>
              <span className="col-span-2">Category</span>
              <span className="col-span-2">Price</span>
              <span className="col-span-1">Variants</span>
              <span className="col-span-1">Status</span>
              <span className="col-span-1 text-right">Actions</span>
            </div>

            {/* Rows */}
            <div className="divide-y divide-gray-50">
              {products.map(product => {
                const isDeleted = !!product.deleted_at;
                const image     = product.images?.find((i: any) => i.is_primary)?.url
                               ?? product.images?.[0]?.url;

                return (
                  <div
                    key={product.id}
                    className={`
                      grid grid-cols-12 gap-4 px-5 py-4 items-center
                      ${isDeleted ? 'opacity-50 bg-gray-50' : 'hover:bg-gray-50'}
                      transition-colors
                    `}
                  >
                    {/* Product name + image */}
                    <div className="col-span-5 flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                        {image ? (
                          <img
                            src={getImageUrl(image)}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package size={14} className="text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-400 font-mono truncate">
                          {product.slug}
                        </p>
                      </div>
                    </div>

                    {/* Category */}
                    <div className="col-span-2 hidden sm:block">
                      <p className="text-sm text-gray-600 truncate">
                        {product.category?.name ?? '—'}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="col-span-2 hidden sm:block">
                      <p className="text-sm font-medium text-gray-900">
                        {formatPrice(product.base_price)}
                      </p>
                    </div>

                    {/* Variants count */}
                    <div className="col-span-1 hidden sm:block">
                      <span className="text-sm text-gray-600">
                        {product.variants_count ?? product.variants?.length ?? 0}
                      </span>
                    </div>

                    {/* Status */}
                    <div className="col-span-1 hidden sm:block">
                      {isDeleted ? (
                        <Badge variant="danger">Deleted</Badge>
                      ) : product.is_active ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="default">Inactive</Badge>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="col-span-1 flex items-center justify-end gap-1">
                      {isDeleted ? (
                        <button
                          onClick={() => handleRestore(product.id)}
                          disabled={restoring === product.id}
                          title="Restore product"
                          className="p-1.5 text-gray-400 hover:text-green-600 transition-colors disabled:opacity-40"
                        >
                          <RotateCcw size={15} />
                        </button>
                      ) : (
                        <>
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            title="Edit product"
                            className="p-1.5 text-gray-400 hover:text-black transition-colors"
                          >
                            <Edit size={15} />
                          </Link>
                          <button
                            onClick={() => handleDelete(product.id)}
                            disabled={deleting === product.id}
                            title="Delete product"
                            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-40"
                          >
                            <Trash2 size={15} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-sm border border-gray-300 rounded-xl disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            ← Prev
          </button>
          <span className="text-sm text-gray-500">
            {meta.current_page} / {meta.last_page}
          </span>
          <button
            onClick={() => setPage(p => Math.min(meta.last_page, p + 1))}
            disabled={page === meta.last_page}
            className="px-4 py-2 text-sm border border-gray-300 rounded-xl disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}