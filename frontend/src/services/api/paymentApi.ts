// src/services/api/paymentApi.ts

import { baseApi } from './baseApi';
import type { ApiResponse } from '../../types';

export interface RazorpayOrderResponse {
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  orderNumber: string;
}

export interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  orderId: string;
}

export const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createRazorpayOrder: builder.mutation<ApiResponse<RazorpayOrderResponse>, { orderId: string }>({
      query: (body) => ({
        url: '/payments/create-order',
        method: 'POST',
        body,
      }),
    }),
    verifyPayment: builder.mutation<ApiResponse<{ message: string }>, VerifyPaymentRequest>({
      query: (body) => ({
        url: '/payments/verify',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Orders'],
    }),
  }),
});

export const {
  useCreateRazorpayOrderMutation,
  useVerifyPaymentMutation,
} = paymentApi;
