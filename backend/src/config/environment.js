// src/config/environment.js

import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env
dotenv.config();

/**
 * Zod Schema for environment variable validation.
 * Supports local execution without Docker by supplying sensible defaults.
 */
const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGO_URI: z.string().default('mongodb://localhost:27017/shopverse'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  JWT_SECRET: z.string().min(10, { message: 'JWT_SECRET must be at least 10 characters long' }),
  JWT_REFRESH_SECRET: z.string().min(10, { message: 'JWT_REFRESH_SECRET must be at least 10 characters long' }),
  RESEND_API_KEY: z.string().default('re_placeholder_dev_key'),
  IMAGEKIT_PUBLIC_KEY: z.string().default('public_placeholder_dev_key'),
  IMAGEKIT_PRIVATE_KEY: z.string().default('private_placeholder_dev_key'),
  IMAGEKIT_URL_ENDPOINT: z.string().url().default('https://ik.imagekit.io/shopverse'),
  RAZORPAY_KEY_ID: z.string().default('rzp_test_placeholder_key'),
  RAZORPAY_KEY_SECRET: z.string().default('razorpay_secret_placeholder'),
  CORS_ALLOWED_ORIGINS: z.string().optional(),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Environment validation failed:');
  console.error(JSON.stringify(_env.error.format(), null, 2));
  process.exit(1);
}

export const env = _env.data;
