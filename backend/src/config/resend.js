// src/config/resend.js

import { Resend } from 'resend';
import { env } from './environment.js';

/**
 * Configure Resend email client instance using validation configurations.
 */
export const resend = new Resend(env.RESEND_API_KEY);
