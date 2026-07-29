// src/services/api/orderApi.ts

import { baseApi } from './baseApi';
import type { ApiResponse, Order, PaginationMeta, OrderStatus, ShippingInfo } from '../../types';

export interface PlaceOrderRequest {
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: 'razorpay' | 'cod';
  couponCode?: string;
}

export interface AdminOrderQueryParams {
  status?: string;
  paymentStatus?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    placeOrder: builder.mutation<ApiResponse<{ order: Order }>, PlaceOrderRequest>({
      query: (body) => ({
        url: '/orders',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Orders', 'Cart', 'Products'],
    }),
    getOrders: builder.query<ApiResponse<{ orders: Order[]; pagination: PaginationMeta }>, { page?: number; limit?: number } | void>({
      query: (params) => {
        const page = params?.page || 1;
        const limit = params?.limit || 10;
        return `/orders?page=${page}&limit=${limit}`;
      },
      providesTags: ['Orders'],
    }),
    getOrderDetails: builder.query<ApiResponse<{ order: Order }>, string>({
      query: (id) => `/orders/${id}`,
      providesTags: (result, error, id) => [{ type: 'Orders', id }],
    }),
    getOrderTimeline: builder.query<ApiResponse<{ orderId: string; orderNumber: string; currentStatus: string; timeline: any[] }>, string>({
      query: (id) => `/orders/${id}/timeline`,
      providesTags: (result, error, id) => [{ type: 'Orders', id }],
    }),
    cancelOrder: builder.mutation<ApiResponse<{ order: Order }>, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({
        url: `/orders/${id}/cancel`,
        method: 'PATCH',
        body: { reason },
      }),
      invalidatesTags: ['Orders', 'Products'],
    }),

    // Admin endpoints
    getAllOrdersAdmin: builder.query<ApiResponse<{ orders: Order[]; pagination: PaginationMeta }>, AdminOrderQueryParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params) {
          if (params.status) queryParams.append('status', params.status);
          if (params.paymentStatus) queryParams.append('paymentStatus', params.paymentStatus);
          if (params.userId) queryParams.append('userId', params.userId);
          if (params.startDate) queryParams.append('startDate', params.startDate);
          if (params.endDate) queryParams.append('endDate', params.endDate);
          if (params.search) queryParams.append('search', params.search);
          if (params.page) queryParams.append('page', params.page.toString());
          if (params.limit) queryParams.append('limit', params.limit.toString());
        }
        return `/orders/admin/all?${queryParams.toString()}`;
      },
      providesTags: ['Orders'],
    }),
    updateOrderStatusAdmin: builder.mutation<ApiResponse<{ order: Order }>, { id: string; status: OrderStatus }>({
      query: ({ id, status }) => ({
        url: `/orders/admin/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Orders', id }, 'Orders'],
    }),
    adminCancelOrder: builder.mutation<ApiResponse<{ order: Order }>, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({
        url: `/orders/admin/${id}/cancel`,
        method: 'PATCH',
        body: { reason },
      }),
      invalidatesTags: ['Orders', 'Products'],
    }),
    updateShippingInfoAdmin: builder.mutation<ApiResponse<{ order: Order }>, { id: string; shippingInfo: ShippingInfo }>({
      query: ({ id, shippingInfo }) => ({
        url: `/orders/admin/${id}/shipping`,
        method: 'PATCH',
        body: shippingInfo,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Orders', id }, 'Orders'],
    }),
    updateDeliveryTimelineAdmin: builder.mutation<ApiResponse<{ order: Order }>, { id: string; estimatedDelivery: string }>({
      query: ({ id, estimatedDelivery }) => ({
        url: `/orders/admin/${id}/delivery-timeline`,
        method: 'PATCH',
        body: { estimatedDelivery },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Orders', id }, 'Orders'],
    }),
  }),
});

export const {
  usePlaceOrderMutation,
  useGetOrdersQuery,
  useGetOrderDetailsQuery,
  useGetOrderTimelineQuery,
  useCancelOrderMutation,
  useGetAllOrdersAdminQuery,
  useUpdateOrderStatusAdminMutation,
  useAdminCancelOrderMutation,
  useUpdateShippingInfoAdminMutation,
  useUpdateDeliveryTimelineAdminMutation,
} = orderApi;
