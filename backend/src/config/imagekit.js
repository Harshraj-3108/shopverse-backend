// backend/src/config/imagekit.js

import ImageKit from 'imagekit';
import { env } from './environment.js';

/**
 * Configure ImageKit client instance using validated environment variables.
 */
export const imagekit = new ImageKit({
  publicKey: env.IMAGEKIT_PUBLIC_KEY,
  privateKey: env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: env.IMAGEKIT_URL_ENDPOINT,
});
