// src/services/api/userApi.ts

import { baseApi } from './baseApi';
import type { ApiResponse, User, Address } from '../../types';

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query<ApiResponse<{ user: User }>, void>({
      query: () => '/users/profile',
      providesTags: ['User'],
    }),
    updateProfile: builder.mutation<ApiResponse<{ user: User }>, { name?: string; phone?: string }>({
      query: (body) => ({
        url: '/users/profile',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['User'],
    }),
    getAddresses: builder.query<ApiResponse<{ addresses: Address[] }>, void>({
      query: () => '/users/addresses',
      providesTags: ['User'],
    }),
    addAddress: builder.mutation<ApiResponse<{ addresses: Address[] }>, Address>({
      query: (body) => ({
        url: '/users/addresses',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],
    }),
    updateAddress: builder.mutation<ApiResponse<{ addresses: Address[] }>, { addressId: string; address: Partial<Address> }>({
      query: ({ addressId, address }) => ({
        url: `/users/addresses/${addressId}`,
        method: 'PUT',
        body: address,
      }),
      invalidatesTags: ['User'],
    }),
    deleteAddress: builder.mutation<ApiResponse<{ addresses: Address[] }>, string>({
      query: (addressId) => ({
        url: `/users/addresses/${addressId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useGetAddressesQuery,
  useAddAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
} = userApi;
