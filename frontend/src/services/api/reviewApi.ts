// src/services/api/reviewApi.ts

import { baseApi } from './baseApi';
import type { ApiResponse, Review, PaginationMeta } from '../../types';

export const reviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProductReviews: builder.query<ApiResponse<{ reviews: Review[]; pagination: PaginationMeta }>, { productId: string; page?: number; limit?: number }>({
      query: ({ productId, page = 1, limit = 10 }) => `/reviews/product/${productId}?page=${page}&limit=${limit}`,
      providesTags: ['Reviews'],
    }),
    createReview: builder.mutation<ApiResponse<{ review: Review }>, { productId: string; rating: number; comment?: string }>({
      query: (body) => ({
        url: '/reviews',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Reviews', 'Products'],
    }),
    updateReview: builder.mutation<ApiResponse<{ review: Review }>, { id: string; rating?: number; comment?: string }>({
      query: ({ id, ...body }) => ({
        url: `/reviews/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Reviews', 'Products'],
    }),
    deleteReview: builder.mutation<ApiResponse<{ message: string }>, string>({
      query: (id) => ({
        url: `/reviews/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Reviews', 'Products'],
    }),
  }),
});

export const {
  useGetProductReviewsQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
} = reviewApi;
