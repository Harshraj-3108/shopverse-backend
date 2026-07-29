// src/services/api/homepageApi.ts

import { baseApi } from './baseApi';
import type { ApiResponse, Product, Category } from '../../types';

export interface HomepageData {
  newestProducts: Product[];
  topRatedProducts: Product[];
  featuredCategories: Category[];
}

export const homepageApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getHomepageData: builder.query<ApiResponse<HomepageData>, void>({
      query: () => '/homepage',
      providesTags: ['Homepage'],
    }),
  }),
});

export const { useGetHomepageDataQuery } = homepageApi;
