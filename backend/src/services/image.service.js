// backend/src/services/image.service.js

import { imagekit } from '../config/imagekit.js';
import logger from '../config/logger.js';
import { AppError } from '../errors/AppError.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

/**
 * Service to manage cloud media asset uploads and purges using ImageKit.
 */
export const imageService = {
  /**
   * Upload an image buffer to ImageKit.
   * @param {Buffer} fileBuffer - Express/Multer file buffer
   * @param {string} fileName - Destination name
   * @param {string} folder - Destination folder on ImageKit
   * @returns {Promise<Object>} Image URL and fileId
   */
  uploadImage: async (fileBuffer, fileName, folder = 'products') => {
    try {
      const response = await imagekit.upload({
        file: fileBuffer,
        fileName: fileName,
        folder: folder,
      });

      return {
        url: response.url,
        fileId: response.fileId,
      };
    } catch (error) {
      logger.error(`ImageKit Upload Error: ${error.message}`);
      throw AppError.internal('Image upload processing failed.', ERROR_CODES.INTERNAL_SERVER_ERROR);
    }
  },

  /**
   * Delete an image from ImageKit.
   * @param {string} fileId - Image identifier to delete
   */
  deleteImage: async (fileId) => {
    try {
      await imagekit.deleteFile(fileId);
      logger.info(`Image successfully deleted from ImageKit. ID: ${fileId}`);
    } catch (error) {
      logger.error(`ImageKit Deletion Error for ID ${fileId}: ${error.message}`);
      // Log error but do not throw to prevent transaction abort on metadata adjustments
    }
  },
};
