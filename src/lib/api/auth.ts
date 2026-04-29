import { ApiClient } from './client';
import { API_ENDPOINTS } from './config';
import { User, RegisterUserData, LoginData } from '@/types';

interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export const authApi = {
  register: (data: RegisterUserData) => ApiClient.post<AuthResponse>(API_ENDPOINTS.REGISTER, data),

  login: (data: LoginData) =>
    ApiClient.post<AuthResponse>(API_ENDPOINTS.LOGIN, data),

  logout: () =>
    ApiClient.post<{ message: string }>(API_ENDPOINTS.LOGOUT),

  me: () =>
    ApiClient.get<{ data: User }>(API_ENDPOINTS.ME),

  googleRedirectUrl: () =>
    `${process.env.NEXT_PUBLIC_API_URL}/auth/google`,
};