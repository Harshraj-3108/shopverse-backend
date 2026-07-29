// src/services/api/wishlistApi.ts

import { baseApi } from './baseApi';
import type { ApiResponse, WishlistItem } from '../../types';

export const wishlistApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWishlist: builder.query<ApiResponse<{ items: WishlistItem[] }>, void>({
      query: () => '/wishlist',
      providesTags: ['Wishlist'],
    }),
    addToWishlist: builder.mutation<ApiResponse<{ items: WishlistItem[] }>, { productId: string }>({
      query: (body) => ({
        url: '/wishlist',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Wishlist'],
    }),
    moveToCart: builder.mutation<ApiResponse<{ message: string }>, { productId: string }>({
      query: (body) => ({
        url: '/wishlist/move-to-cart',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Wishlist', 'Cart'],
    }),
    removeFromWishlist: builder.mutation<ApiResponse<{ items: WishlistItem[] }>, string>({
      query: (productId) => ({
        url: `/wishlist/${productId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Wishlist'],
    }),
  }),
});

export const {
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useMoveToCartMutation,
  useRemoveFromWishlistMutation,
} = wishlistApi;
