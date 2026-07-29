// src/services/api/cacheAdminApi.ts

import { baseApi } from './baseApi';
import type { ApiResponse } from '../../types';

export interface CacheStats {
  connected: boolean;
  totalKeys?: number;
  memoryInfo?: string;
}

export const cacheAdminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCacheStats: builder.query<ApiResponse<{ cache: CacheStats }>, void>({
      query: () => '/admin/cache/stats',
      providesTags: ['CacheStats'],
    }),
    invalidateProductCache: builder.mutation<ApiResponse<{ message: string }>, void>({
      query: () => ({
        url: '/admin/cache/products',
        method: 'DELETE',
      }),
      invalidatesTags: ['Products', 'Homepage', 'CacheStats'],
    }),
    invalidateCategoryCache: builder.mutation<ApiResponse<{ message: string }>, void>({
      query: () => ({
        url: '/admin/cache/categories',
        method: 'DELETE',
      }),
      invalidatesTags: ['Categories', 'Homepage', 'CacheStats'],
    }),
    invalidateAllCache: builder.mutation<ApiResponse<{ message: string }>, void>({
      query: () => ({
        url: '/admin/cache/all',
        method: 'DELETE',
      }),
      invalidatesTags: ['Products', 'Categories', 'Homepage', 'CacheStats'],
    }),
  }),
});

export const {
  useGetCacheStatsQuery,
  useInvalidateProductCacheMutation,
  useInvalidateCategoryCacheMutation,
  useInvalidateAllCacheMutation,
} = cacheAdminApi;
