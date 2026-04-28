// src/lib/api/admin.ts
import { ApiClient } from './client';
import { API_ENDPOINTS } from './config';

export const adminApi = {
  getDashboard: () =>
    ApiClient.get<any>(API_ENDPOINTS.ADMIN_DASHBOARD),

  // Products
  getProducts: (params?: Record<string, any>) =>
    ApiClient.get<any>(API_ENDPOINTS.ADMIN_PRODUCTS, { params }),

  createProduct: (data: FormData) =>
    ApiClient.post<any>(API_ENDPOINTS.ADMIN_PRODUCTS, data),

  updateProduct: (id: string, data: Record<string, any>) =>
    ApiClient.put<any>(`${API_ENDPOINTS.ADMIN_PRODUCTS}/${id}`, data),

  deleteProduct: (id: string) =>
    ApiClient.delete<any>(`${API_ENDPOINTS.ADMIN_PRODUCTS}/${id}`),

  restoreProduct: (id: string) =>
    ApiClient.post<any>(`${API_ENDPOINTS.ADMIN_PRODUCTS}/${id}/restore`),

  updateVariantStock: (variantId: string, stockQty: number) =>
    ApiClient.patch<any>(`${API_ENDPOINTS.ADMIN_VARIANTS}/${variantId}/stock`, {
      stock_qty: stockQty,
    }),

  // Orders
  getOrders: (params?: Record<string, any>) =>
    ApiClient.get<any>(API_ENDPOINTS.ADMIN_ORDERS, { params }),

  updateOrderStatus: (id: string, status: string) =>
    ApiClient.patch<any>(`${API_ENDPOINTS.ADMIN_ORDERS}/${id}/status`, { status }),

  confirmCod: (id: string) =>
    ApiClient.post<any>(`${API_ENDPOINTS.ADMIN_ORDERS}/${id}/confirm-cod`),

  // Users
  getUsers: (params?: Record<string, any>) =>
    ApiClient.get<any>(API_ENDPOINTS.ADMIN_USERS, { params }),

  toggleUserStatus: (id: string) =>
    ApiClient.patch<any>(`${API_ENDPOINTS.ADMIN_USERS}/${id}/toggle`),

  // Coupons
  getCoupons: () =>
    ApiClient.get<any>(API_ENDPOINTS.ADMIN_COUPONS),

  createCoupon: (data: Record<string, any>) =>
    ApiClient.post<any>(API_ENDPOINTS.ADMIN_COUPONS, data),

  // Settings
  getSettings: () =>
    ApiClient.get<any>(API_ENDPOINTS.ADMIN_SETTINGS),

  updateSettings: (settings: Record<string, string>) =>
    ApiClient.put<any>(API_ENDPOINTS.ADMIN_SETTINGS, { settings }),
};