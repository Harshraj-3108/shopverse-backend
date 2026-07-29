// src/services/api/cartApi.ts

import { baseApi } from './baseApi';
import type { ApiResponse, Cart } from '../../types';

export const cartApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCart: builder.query<ApiResponse<{ cart: Cart }>, void>({
      query: () => '/cart',
      providesTags: ['Cart'],
    }),
    addToCart: builder.mutation<ApiResponse<{ cart: Cart }>, { productId: string; quantity?: number }>({
      query: (body) => ({
        url: '/cart',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Cart'],
    }),
    updateCartItemQuantity: builder.mutation<ApiResponse<{ cart: Cart }>, { productId: string; quantity: number }>({
      query: (body) => ({
        url: '/cart',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Cart'],
    }),
    removeFromCart: builder.mutation<ApiResponse<{ cart: Cart }>, string>({
      query: (productId) => ({
        url: `/cart/${productId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),
    clearCart: builder.mutation<ApiResponse<{ cart: Cart }>, void>({
      query: () => ({
        url: '/cart',
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemQuantityMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
} = cartApi;
