// src/services/api/couponApi.ts

import { baseApi } from './baseApi';
import type { ApiResponse, Coupon } from '../../types';

export const couponApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCoupons: builder.query<ApiResponse<{ coupons: Coupon[] }>, void>({
      query: () => '/coupons',
      providesTags: ['Coupons'],
    }),
    createCoupon: builder.mutation<ApiResponse<{ coupon: Coupon }>, Partial<Coupon>>({
      query: (body) => ({
        url: '/coupons',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Coupons'],
    }),
    validateCoupon: builder.mutation<ApiResponse<{ discountAmount: number; finalTotal: number; coupon: Coupon }>, { code: string; orderTotal: number }>({
      query: (body) => ({
        url: '/coupons/validate',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useGetCouponsQuery,
  useCreateCouponMutation,
  useValidateCouponMutation,
} = couponApi;
