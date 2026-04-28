import { ApiClient } from './client';
import { Product, ProductDetail, Category, Brand, PaginatedResponse } from '@/types';
import { API_ENDPOINTS } from './config';

export interface ProductFilters {
  category?: string;
  brand?: string;
  search?: string;
  min_price?: number;
  max_price?: number;
  featured?: boolean;
  in_stock?: boolean;
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
  per_page?: number;
  page?: number;
  attributes?: Record<string, string>;
}

export const productsApi = {
  getAll: (filters: ProductFilters = {}, fetchOptions?: RequestInit) => {
    // Flatten attribute filters for query params
    const params: Record<string, string | number | boolean | undefined> = {
      ...filters,
      attributes: undefined,
    };

    if (filters.attributes) {
      Object.entries(filters.attributes).forEach(([key, value]) => {
        params[`attributes[${key}]`] = value;
      });
    }

    return ApiClient.get<PaginatedResponse<Product>>(
      API_ENDPOINTS.PRODUCTS,
      { params, ...fetchOptions }
    );
  },

  getFeatured: (fetchOptions?: RequestInit) =>
    ApiClient.get<{ data: Product[] }>(
      API_ENDPOINTS.FEATURED,
      fetchOptions
    ),

  getBySlug: (slug: string, fetchOptions?: RequestInit) =>
    ApiClient.get<{ data: ProductDetail; related: Product[] }>(
      `${API_ENDPOINTS.PRODUCTS}/${slug}`,
      fetchOptions
    ),

  getCategories: (fetchOptions?: RequestInit) =>
    ApiClient.get<{ data: Category[] }>(
      API_ENDPOINTS.CATEGORIES,
      fetchOptions
    ),

  getBrands: (fetchOptions?: RequestInit) =>
    ApiClient.get<{ data: Brand[] }>(
      API_ENDPOINTS.BRANDS,
      fetchOptions
    ),
};