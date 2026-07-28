// src/repositories/user.repository.js

import { BaseRepository } from './base.repository.js';
import { User } from '../models/User.js';

/**
 * Repository interface mapping specific queries for User documents.
 */
export class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  /**
   * Find a user record by email address.
   * @param {string} email - Email address lookup
   * @returns {Promise<Object|null>}
   */
  async findByEmail(email) {
    return await this.findOne({ email: email.toLowerCase() });
  }

  /**
   * Find a user record by verification token.
   * @param {string} token - Email verification token lookup
   * @returns {Promise<Object|null>}
   */
  async findByVerificationToken(token) {
    return await this.findOne({ emailVerificationToken: token });
  }
}
