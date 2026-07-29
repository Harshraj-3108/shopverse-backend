// backend/src/repositories/order.repository.js

import mongoose from 'mongoose';
import { BaseRepository } from './base.repository.js';
import { Order } from '../models/Order.js';

/**
 * Repository that encapsulates all database interactions for Order documents.
 * Extends BaseRepository with order-domain–specific query helpers.
 */
export class OrderRepository extends BaseRepository {
  constructor() {
    super(Order);
  }

  // ---------------------------------------------------------------------------
  // Customer-facing queries
  // ---------------------------------------------------------------------------

  /**
   * Paginated list of orders for a single user, newest first.
   * @param {string} userId
   * @param {number} page
   * @param {number} limit
   */
  async findByUserId(userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      this.model
        .find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.model.countDocuments({ userId }),
    ]);
    return { orders, total };
  }

  /**
   * Find an order by its unique ORD-XXXXXX tracking number.
   * @param {string} orderNumber
   */
  async findByOrderNumber(orderNumber) {
    return await this.model.findOne({ orderNumber });
  }

  // ---------------------------------------------------------------------------
  // Admin queries
  // ---------------------------------------------------------------------------

  /**
   * Paginated, filterable, searchable list of all orders (admin view).
   *
   * @param {Object} filters
   * @param {string} [filters.status]        - Filter by order status
   * @param {string} [filters.paymentStatus] - Filter by payment status
   * @param {string} [filters.userId]        - Filter by customer ID
   * @param {string} [filters.startDate]     - ISO date string (createdAt >=)
   * @param {string} [filters.endDate]       - ISO date string (createdAt <=)
   * @param {string} [filters.search]        - Partial match on orderNumber
   * @param {number} [filters.page=1]
   * @param {number} [filters.limit=10]
   */
  async findAllWithFilters(filters = {}) {
    const {
      status,
      paymentStatus,
      userId,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 10,
    } = filters;

    const query = {};

    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      query.userId = new mongoose.Types.ObjectId(userId);
    }

    // Date range on createdAt
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // include full end day
        query.createdAt.$lte = end;
      }
    }

    // Partial text search on orderNumber using regex (fast due to index)
    if (search && search.trim()) {
      query.orderNumber = { $regex: search.trim(), $options: 'i' };
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.model
        .find(query)
        .populate('userId', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.model.countDocuments(query),
    ]);

    return { orders, total };
  }

  // ---------------------------------------------------------------------------
  // Mutation helpers
  // ---------------------------------------------------------------------------

  /**
   * Append a timeline event to the order's audit trail and optionally update
   * the top-level status field — all in a single atomic update.
   *
   * @param {string} orderId
   * @param {Object} eventPayload - { status, description, actor }
   * @param {Object} [extraUpdate] - Additional $set fields (e.g. shippingInfo)
   * @param {Object} [session]    - Mongoose session for transactions
   */
  async pushTimelineEvent(orderId, eventPayload, extraUpdate = {}, session = null) {
    const update = {
      $push: { timeline: { ...eventPayload, timestamp: new Date() } },
      $set: { status: eventPayload.status, ...extraUpdate },
    };

    const opts = { new: true, runValidators: true };
    if (session) opts.session = session;

    return await this.model.findByIdAndUpdate(orderId, update, opts);
  }

  /**
   * Update admin-managed shipping/courier info without touching the status.
   * @param {string} orderId
   * @param {Object} shippingInfo - { trackingId, courier, trackingUrl, estimatedDelivery }
   */
  async updateShippingInfo(orderId, shippingInfo) {
    const setFields = {};
    for (const [key, value] of Object.entries(shippingInfo)) {
      setFields[`shippingInfo.${key}`] = value;
    }
    return await this.model.findByIdAndUpdate(
      orderId,
      { $set: setFields },
      { new: true, runValidators: true }
    );
  }
}
