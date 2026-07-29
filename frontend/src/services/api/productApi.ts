// src/services/api/productApi.ts

import { baseApi } from './baseApi';
import type { ApiResponse, Product, PaginationMeta, ProductQueryParams } from '../../types';

export const productApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<
      ApiResponse<{ products: Product[]; pagination: PaginationMeta }>,
      ProductQueryParams | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params) {
          if (params.page) queryParams.append('page', params.page.toString());
          if (params.limit) queryParams.append('limit', params.limit.toString());
          if (params.sort) queryParams.append('sort', params.sort);
          if (params.search) queryParams.append('search', params.search);
          if (params.categoryId) queryParams.append('categoryId', params.categoryId);
          if (params.minPrice !== undefined) queryParams.append('minPrice', params.minPrice.toString());
          if (params.maxPrice !== undefined) queryParams.append('maxPrice', params.maxPrice.toString());
        }
        return `/products?${queryParams.toString()}`;
      },
      providesTags: (result) =>
        result?.data?.products
          ? [
              ...result.data.products.map(({ _id }) => ({ type: 'Products' as const, id: _id })),
              { type: 'Products', id: 'LIST' },
            ]
          : [{ type: 'Products', id: 'LIST' }],
    }),
    getProductBySlug: builder.query<ApiResponse<{ product: Product }>, string>({
      query: (slug) => `/products/slug/${slug}`,
      providesTags: (result, error, slug) => [{ type: 'Products', id: slug }],
    }),
    createProduct: builder.mutation<ApiResponse<{ product: Product }>, Partial<Product>>({
      query: (body) => ({
        url: '/products',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Products', id: 'LIST' }, 'Homepage'],
    }),
    updateProduct: builder.mutation<ApiResponse<{ product: Product }>, { id: string; data: Partial<Product> }>({
      query: ({ id, data }) => ({
        url: `/products/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Products', id }, { type: 'Products', id: 'LIST' }, 'Homepage'],
    }),
    deleteProduct: builder.mutation<ApiResponse<{ id: string }>, string>({
      query: (id) => ({
        url: `/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Products', id: 'LIST' }, 'Homepage'],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductBySlugQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productApi;
