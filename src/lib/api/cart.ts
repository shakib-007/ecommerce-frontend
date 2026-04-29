import { ApiClient } from './client';
import { Cart } from '@/types';
import { API_ENDPOINTS } from './config';

interface CartResponse {
  data: Cart;
  message?: string;
}

export const cartApi = {
  get: () =>
    ApiClient.get<CartResponse>(API_ENDPOINTS.CART),

  getCount: () =>
    ApiClient.get<{ count: number }>(API_ENDPOINTS.CART_COUNT),

  addItem: (variantId: string, qty: number) =>
    ApiClient.post<CartResponse>(API_ENDPOINTS.CART_ITEMS, { variant_id: variantId, qty }),

  updateItem: (cartItemId: string, qty: number) =>
    ApiClient.put<CartResponse>(`${API_ENDPOINTS.CART_ITEMS}/${cartItemId}`, { qty }),

  removeItem: (cartItemId: string) =>
    ApiClient.delete<CartResponse>(`${API_ENDPOINTS.CART_ITEMS}/${cartItemId}`),

  clear: () =>
    ApiClient.delete<{ message: string }>(API_ENDPOINTS.CART),
};