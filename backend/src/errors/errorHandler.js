// src/errors/errorHandler.js

import logger from '../config/logger.js';

/**
 * Centered error processor.
 * Performs log formatting and handles state validation checks.
 */
export const errorHandler = {
  /**
   * Log standard details of the thrown error instance using the Winston logger.
   * @param {Error} error - The error to log
   */
  handleError: (error) => {
    logger.error(
      `${error.name || 'Error'} - ${error.message} \nStack: ${error.stack}`
    );
  },

  /**
   * Evaluates if the error is trusted (operational) or untrusted (bug/crash).
   * @param {Error} error
   * @returns {boolean}
   */
  isTrustedError: (error) => {
    return error.isOperational === true;
  },
};
