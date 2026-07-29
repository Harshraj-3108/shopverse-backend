// src/services/api/baseApi.ts

import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../app/store';
import { setCredentials, logout } from '../../features/auth/authSlice';
import type { ApiResponse } from '../../types';

// Define base URL using relative path for proxy or env variable
const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

// Standard fetchBaseQuery with auth header injection
const rawBaseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
  credentials: 'include', // Includes HTTP-only cookies for refresh token
});

/**
 * Base query wrapper handling automatic refresh token rotation on 401 Unauthorized.
 */
const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Attempt token refresh via cookie
    const refreshResult = await rawBaseQuery(
      {
        url: '/auth/refresh-token',
        method: 'POST',
      },
      api,
      extraOptions
    );

    if (refreshResult.data) {
      const responseData = refreshResult.data as ApiResponse<{ accessToken: string }>;
      if (responseData.data?.accessToken) {
        // Store new access token in Redux
        api.dispatch(setCredentials({ token: responseData.data.accessToken }));

        // Retry original request with new token
        result = await rawBaseQuery(args, api, extraOptions);
      } else {
        api.dispatch(logout());
      }
    } else {
      // Refresh failed or session expired
      api.dispatch(logout());
    }
  }

  return result;
};

/**
 * Central RTK Query API Slice
 */
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Products', 'Categories', 'Cart', 'Wishlist', 'Orders', 'Reviews', 'Coupons', 'Homepage', 'CacheStats'],
  endpoints: () => ({}),
});
