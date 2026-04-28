// src/lib/api/orders.ts
import { ApiClient } from './client';
import { Order, OrderDetail, Address, PaginatedResponse } from '@/types';
import { API_ENDPOINTS } from './config';

export const ordersApi = {
  getAll: (page = 1) =>
    ApiClient.get<PaginatedResponse<Order>>(API_ENDPOINTS.ORDERS, {
      params: { page }
    }),

  getById: (id: string) =>
    ApiClient.get<{ data: OrderDetail }>(`${API_ENDPOINTS.ORDERS}/${id}`),

  place: (data: {
    address_id: string;
    payment_method: 'sslcommerz' | 'cod';
    coupon_code?: string;
    notes?: string;
  }) => ApiClient.post<{ message: string; data: OrderDetail }>(API_ENDPOINTS.ORDERS, data),

  initiatePayment: (orderId: string) =>
    ApiClient.post<{
      payment_method: string;
      redirect_url?: string;
      message?: string;
      order_number?: string;
    }>(`/payment/initiate/${orderId}`),

  getAddresses: () =>
    ApiClient.get<{ data: Address[] }>(API_ENDPOINTS.ADDRESSES),

  addAddress: (data: Omit<Address, 'id'>) =>
    ApiClient.post<{ message: string; data: Address[] }>(API_ENDPOINTS.ADDRESSES, data),

  updateAddress: (id: string, data: Partial<Address>) =>
    ApiClient.put<{ message: string; data: Address }>(`${API_ENDPOINTS.ADDRESSES}/${id}`, data),

  deleteAddress: (id: string) =>
    ApiClient.delete<{ message: string }>(`${API_ENDPOINTS.ADDRESSES}/${id}`),
};