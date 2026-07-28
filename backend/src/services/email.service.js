// src/services/email.service.js

import { resend } from '../config/resend.js';
import logger from '../config/logger.js';
import { env } from '../config/environment.js';

/**
 * Service to orchestrate outbound SMTP/Email API calls.
 */
export const emailService = {
  /**
   * Dispatch account verification link to user.
   * @param {string} email - Target recipient email
   * @param {string} name - User's name
   * @param {string} token - Cryptographic verification hash
   */
  sendVerificationEmail: async (email, name, token) => {
    const verificationUrl = `http://localhost:${env.PORT}/api/v1/auth/verify-email?token=${token}`;
    
    try {
      if (env.NODE_ENV === 'test') {
        logger.info(`[Test Mode] Verification Link URL: ${verificationUrl}`);
        return;
      }

      const sender = 'onboarding@resend.dev'; // Default Resend test verified sandbox email domain sender
      const response = await resend.emails.send({
        from: `E-Commerce Platform <${sender}>`,
        to: email,
        subject: 'Verify your E-Commerce account',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
            <h2 style="color: #333;">Welcome ${name}!</h2>
            <p>Thank you for registering on our E-Commerce Platform. Please complete your registration by verifying your email address.</p>
            <div style="margin: 30px 0; text-align: center;">
              <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 12px 25px; text-decoration: none; border-radius: 3px; font-weight: bold; display: inline-block;">Verify Email Address</a>
            </div>
            <p>If the button doesn't work, you can copy and paste the following link into your browser:</p>
            <p style="background-color: #f9f9f9; padding: 10px; word-break: break-all; border-radius: 3px;">
              <a href="${verificationUrl}">${verificationUrl}</a>
            </p>
            <hr style="border: 0; border-top: 1px solid #eee;" />
            <p style="font-size: 12px; color: #777;">This email was sent dynamically to verify your account registration. If you did not request this registration, you can safely ignore this mail.</p>
          </div>
        `,
      });

      logger.info(`Verification email dispatched successfully to ${email}. ID: ${response.data?.id}`);
    } catch (error) {
      logger.error(`Resend email dispatch failure to ${email}: ${error.message}`);
    }
  },

  /**
   * Dispatch password recovery link to user.
   * @param {string} email - Target recipient email
   * @param {string} name - User's name
   * @param {string} token - Cryptographic reset hash
   */
  sendPasswordResetEmail: async (email, name, token) => {
    const resetUrl = `http://localhost:${env.PORT}/api/v1/auth/reset-password?token=${token}`;

    try {
      if (env.NODE_ENV === 'test') {
        logger.info(`[Test Mode] Password Reset Link URL: ${resetUrl}`);
        return;
      }

      const sender = 'onboarding@resend.dev';
      const response = await resend.emails.send({
        from: `E-Commerce Platform <${sender}>`,
        to: email,
        subject: 'Reset your E-Commerce Password',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
            <h2 style="color: #333;">Password Reset Request</h2>
            <p>Hello ${name},</p>
            <p>We received a request to reset your password. Please click the button below to establish a new password. This link expires in 1 hour.</p>
            <div style="margin: 30px 0; text-align: center;">
              <a href="${resetUrl}" style="background-color: #f44336; color: white; padding: 12px 25px; text-decoration: none; border-radius: 3px; font-weight: bold; display: inline-block;">Reset Password</a>
            </div>
            <p>If the button doesn't work, you can copy and paste the following link into your browser:</p>
            <p style="background-color: #f9f9f9; padding: 10px; word-break: break-all; border-radius: 3px;">
              <a href="${resetUrl}">${resetUrl}</a>
            </p>
            <hr style="border: 0; border-top: 1px solid #eee;" />
            <p style="font-size: 12px; color: #777;">If you did not request this reset, you can safely ignore this mail. Your credentials remain secure.</p>
          </div>
        `,
      });

      logger.info(`Password reset email dispatched successfully to ${email}. ID: ${response.data?.id}`);
    } catch (error) {
      logger.error(`Resend reset dispatch failure to ${email}: ${error.message}`);
    }
  },
};
