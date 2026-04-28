// src/types/index.ts

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: 'admin' | 'customer';
  is_active: boolean;
  email_verified_at: string | null;
  created_at: string;
  addresses?: Address[];
}

export interface RegisterUserData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface Address {
  id: string;
  label: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string | null;
  postal_code: string | null;
  country: string;
  is_default: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  children?: Category[];
  parent?: Category;
  products_count?: number;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  website: string | null;
  products_count?: number;
}

export interface AttributeValue {
  id: string;
  value: string;
  meta: string | null; // hex code for colors
}

export interface AttributeGroup {
  id: string;
  name: string;
  type: 'color' | 'button' | 'select';
  values: AttributeValue[];
}

export interface ProductVariant {
  id: string;
  sku: string;
  price: number;
  compare_price: number | null;
  stock_qty: number;
  in_stock: boolean;
  is_active: boolean;
  attributes: {
    group_id: string;
    group_name: string;
    group_type: string;
    value_id: string;
    value: string;
    meta: string | null;
  }[];
}

export interface ProductImage {
  id: string;
  url: string;
  is_primary: boolean;
  variant_id: string | null;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  price_from: number;
  is_featured: boolean;
  in_stock: boolean;
  image: string | null;
  category: Category;
  brand: Brand | null;
  rating_avg: number;
  rating_count: number;
}

export interface ProductDetail extends Product {
  description: string | null;
  images: ProductImage[];
  variants: ProductVariant[];
  attribute_groups: AttributeGroup[];
  reviews: Review[];
}

export interface Review {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  user_name: string;
  created_at: string;
}

export interface CartItem {
  id: string;
  qty: number;
  line_total: number;
  variant: {
    id: string;
    sku: string;
    price: number;
    compare_price: number | null;
    stock_qty: number;
    in_stock: boolean;
    attributes: { group: string; value: string; meta: string | null }[];
    product: {
      id: string;
      name: string;
      slug: string;
      image: string | null;
    };
  };
}

export interface Cart {
  id: string;
  total_items: number;
  subtotal: number;
  items: CartItem[];
}

export interface Order {
  id: string;
  order_number: string;
  status: OrderStatus;
  subtotal: number;
  discount_total: number;
  shipping_fee: number;
  total: number;
  total_items?: number;
  payment_status?: string;
  created_at: string;
}

export interface OrderDetail extends Order {
  notes: string | null;
  address: Address;
  items: {
    id: string;
    qty: number;
    unit_price: number;
    line_total: number;
    product_name: string;
    sku: string;
    attributes: Record<string, string>;
    image: string | null;
  }[];
  payment: {
    gateway: string;
    status: string;
    amount: number;
    paid_at: string | null;
  } | null;
  coupons: {
    code: string;
    discount_applied: number;
  }[];
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
  links?: {
    next: string | null;
    prev: string | null;
  };
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}