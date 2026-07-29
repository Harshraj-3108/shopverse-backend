// src/services/api/authApi.ts

import { baseApi } from './baseApi';
import type { ApiResponse, User } from '../../types';

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    signup: builder.mutation<ApiResponse<User>, SignupRequest>({
      query: (credentials) => ({
        url: '/auth/signup',
        method: 'POST',
        body: credentials,
      }),
    }),
    login: builder.mutation<ApiResponse<LoginResponse>, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    verifyEmail: builder.query<ApiResponse<{ email: string; isEmailVerified: boolean }>, string>({
      query: (token) => `/auth/verify-email?token=${token}`,
    }),
    refreshToken: builder.mutation<ApiResponse<{ accessToken: string }>, void>({
      query: () => ({
        url: '/auth/refresh-token',
        method: 'POST',
      }),
    }),
    logoutUser: builder.mutation<ApiResponse<{ message: string }>, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
    }),
    forgotPassword: builder.mutation<ApiResponse<{ message: string }>, { email: string }>({
      query: (body) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body,
      }),
    }),
    resetPassword: builder.mutation<ApiResponse<{ message: string }>, { token: string; password: string }>({
      query: (body) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useSignupMutation,
  useLoginMutation,
  useVerifyEmailQuery,
  useRefreshTokenMutation,
  useLogoutUserMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;
