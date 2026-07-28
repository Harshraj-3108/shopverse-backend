// src/config/environment.js

import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env
dotenv.config();

/**
 * Zod Schema for environment variable validation.
 * Ensures the application is running with valid configurations.
 */
const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGO_URI: z.string().url({ message: 'MONGO_URI must be a valid connection URL' }),
  REDIS_URL: z.string().url({ message: 'REDIS_URL must be a valid Redis connection URL' }),
  JWT_SECRET: z.string().min(10, { message: 'JWT_SECRET must be at least 10 characters long' }),
  JWT_REFRESH_SECRET: z.string().min(10, { message: 'JWT_REFRESH_SECRET must be at least 10 characters long' }),
  RESEND_API_KEY: z.string().min(1, { message: 'RESEND_API_KEY is required' }),
  IMAGEKIT_PUBLIC_KEY: z.string().min(1, { message: 'IMAGEKIT_PUBLIC_KEY is required' }),
  IMAGEKIT_PRIVATE_KEY: z.string().min(1, { message: 'IMAGEKIT_PRIVATE_KEY is required' }),
  IMAGEKIT_URL_ENDPOINT: z.string().url({ message: 'IMAGEKIT_URL_ENDPOINT must be a valid URL' }),
  RAZORPAY_KEY_ID: z.string().min(1, { message: 'RAZORPAY_KEY_ID is required' }),
  RAZORPAY_KEY_SECRET: z.string().min(1, { message: 'RAZORPAY_KEY_SECRET is required' }),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Environment validation failed:');
  console.error(JSON.stringify(_env.error.format(), null, 2));
  process.exit(1);
}

export const env = _env.data;
