export const API_ENDPOINTS = {
  // Auth
  REGISTER:        '/auth/register',
  LOGIN:           '/auth/login',
  LOGOUT:          '/auth/logout',
  ME:              '/me',
  GOOGLE:          '/auth/google',

  // Shop
  PRODUCTS:        '/shop/products',
  FEATURED:        '/shop/products/featured',
  CATEGORIES:      '/shop/categories',
  BRANDS:          '/shop/brands',

  // Cart
  CART:            '/cart',
  CART_ITEMS:      '/cart/items',
  CART_COUNT:      '/cart/count',

  // Orders
  ORDERS:          '/orders',
  ADDRESSES:       '/addresses',

  // Payment
  PAYMENT_INITIATE: '/payment/initiate',

  // Admin
  ADMIN_DASHBOARD:  '/admin/dashboard',
  ADMIN_PRODUCTS:   '/admin/products',
  ADMIN_VARIANTS:   '/admin/variants',
  ADMIN_ORDERS:     '/admin/orders',
  ADMIN_USERS:      '/admin/users',
  ADMIN_COUPONS:    '/admin/coupons',
  ADMIN_BRANDS:     '/admin/brands',
  ADMIN_CATEGORIES: '/admin/categories',
  ADMIN_SETTINGS:   '/admin/settings',
};