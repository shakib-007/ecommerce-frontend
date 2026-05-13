// src/lib/api/wishlist.ts
import { ApiClient } from './client';

export const wishlistApi = {
  getAll: () =>
    ApiClient.get<{ data: any[] }>('/wishlist'),

  add: (variantId: string) =>
    ApiClient.post<{ message: string }>('/wishlist', { variant_id: variantId }),

  remove: (variantId: string) =>
    ApiClient.delete<{ message: string }>(`/wishlist/${variantId}`),
};