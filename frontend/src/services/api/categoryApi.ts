// src/services/api/categoryApi.ts

import { baseApi } from './baseApi';
import type { ApiResponse, Category } from '../../types';

export const categoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<ApiResponse<Category[]>, { format?: 'flat' | 'tree' } | void>({
      query: (params) => {
        const format = params?.format || 'flat';
        return `/categories?format=${format}`;
      },
      providesTags: ['Categories'],
    }),
    getCategoryBySlug: builder.query<ApiResponse<Category>, string>({
      query: (slug) => `/categories/${slug}`,
      providesTags: ['Categories'],
    }),
    createCategory: builder.mutation<ApiResponse<Category>, Partial<Category>>({
      query: (body) => ({
        url: '/categories',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Categories', 'Homepage'],
    }),
    updateCategory: builder.mutation<ApiResponse<Category>, { id: string; data: Partial<Category> }>({
      query: ({ id, data }) => ({
        url: `/categories/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Categories', 'Homepage'],
    }),
    deleteCategory: builder.mutation<ApiResponse<{ id: string }>, string>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Categories', 'Homepage'],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetCategoryBySlugQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApi;
