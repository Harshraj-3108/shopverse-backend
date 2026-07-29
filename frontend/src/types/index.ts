// src/types/index.ts

export type Role = 'customer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  isEmailVerified: boolean;
  addresses?: Address[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Address {
  _id?: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string | Category | null;
  isActive: boolean;
  children?: Category[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductImage {
  url: string;
  fileId: string;
  isPrimary: boolean;
  _id?: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  price: number;
  salePrice?: number | null;
  stockQuantity: number;
  categoryId: Category | string;
  images: ProductImage[];
  attributes?: Record<string, string>;
  averageRating: number;
  reviewsCount: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  productId: Product;
  quantity: number;
  price: number;
  _id?: string;
}

export interface Cart {
  _id?: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  updatedAt?: string;
}

export interface WishlistItem {
  productId: Product;
  addedAt?: string;
}

export interface Review {
  _id: string;
  userId: User | string;
  productId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'razorpay' | 'cod';

export interface TimelineEvent {
  status: OrderStatus;
  description: string;
  actor: 'customer' | 'admin' | 'system';
  timestamp: string;
  _id?: string;
}

export interface ShippingInfo {
  trackingId?: string;
  courier?: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
}

export interface OrderItem {
  productId: string | Product;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  _id?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  userId: User | string;
  items: OrderItem[];
  shippingAddress: Address;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  couponCode?: string;
  cancellationReason?: string;
  shippingInfo?: ShippingInfo;
  timeline: TimelineEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  _id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderValue?: number;
  maxDiscount?: number;
  expiryDate: string;
  usageLimit: number;
  usedCount: number;
  perUserLimit?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginationMeta {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  statusCode?: number;
  errorCode?: string;
  details?: any;
}

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
}
