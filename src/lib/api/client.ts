// src/lib/api/client.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

// Get token from localStorage (client side only)
function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

export class ApiClient {

  private static buildUrl(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined>
  ): string {
    const url = new URL(`${API_URL}${endpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  private static getHeaders(isFormData = false): HeadersInit {
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };

    // Don't set Content-Type for FormData
    // Browser sets it automatically with boundary
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Handle response — parse JSON and throw on error.
   */
  private static async handleResponse<T>(response: Response): Promise<T> {
    const json = await response.json().catch(() => ({}));

    if (!response.ok) {
      // Throw the error object so components can read .message and .errors
      throw {
        message: json.message || 'Something went wrong.',
        errors: json.errors || {},
        status: response.status,
      };
    }

    return json as T;
  }

  /**
   * GET request — used in Server Components with Next.js caching.
   */
  static async get<T>(
    endpoint: string,
    options: FetchOptions = {}
  ): Promise<T> {
    const { params, ...fetchOptions } = options;
    const url = this.buildUrl(endpoint, params);

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
      ...fetchOptions,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * POST request.
   */
  static async post<T>(
    endpoint: string,
    body?: unknown,
    options: FetchOptions = {}
  ): Promise<T> {
    const isFormData = body instanceof FormData;
    const url = this.buildUrl(endpoint);

    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(isFormData),
      body: isFormData ? body : JSON.stringify(body),
      ...options,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * PUT request.
   */
  static async put<T>(
    endpoint: string,
    body?: unknown,
    options: FetchOptions = {}
  ): Promise<T> {
    const isFormData = body instanceof FormData;
    const url = this.buildUrl(endpoint);

    const response = await fetch(url, {
      method: 'PUT',
      headers: this.getHeaders(isFormData),
      body: isFormData ? body : JSON.stringify(body),
      ...options,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * PATCH request.
   */
  static async patch<T>(
    endpoint: string,
    body?: unknown,
    options: FetchOptions = {}
  ): Promise<T> {
    const url = this.buildUrl(endpoint);

    const response = await fetch(url, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
      ...options,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * DELETE request.
   */
  static async delete<T>(
    endpoint: string,
    options: FetchOptions = {}
  ): Promise<T> {
    const url = this.buildUrl(endpoint);

    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.getHeaders(),
      ...options,
    });

    return this.handleResponse<T>(response);
  }
}