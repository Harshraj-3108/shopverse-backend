// backend/src/constants/orderStatus.js

/**
 * Canonical order status values and the valid transitions between them.
 *
 * Transition map:  status  →  set of allowed next statuses
 *
 * Rules:
 *  - 'pending'    → 'processing' | 'cancelled'
 *  - 'processing' → 'shipped'    | 'cancelled'
 *  - 'shipped'    → 'delivered'
 *  - 'delivered'  → (terminal – no further transitions)
 *  - 'cancelled'  → (terminal – no further transitions)
 */
export const ORDER_STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

/**
 * Valid status transitions.
 * Key = current status, Value = Set of statuses the order can move into.
 */
export const VALID_TRANSITIONS = {
  [ORDER_STATUSES.PENDING]: new Set([ORDER_STATUSES.PROCESSING, ORDER_STATUSES.CANCELLED]),
  [ORDER_STATUSES.PROCESSING]: new Set([ORDER_STATUSES.SHIPPED, ORDER_STATUSES.CANCELLED]),
  [ORDER_STATUSES.SHIPPED]: new Set([ORDER_STATUSES.DELIVERED]),
  [ORDER_STATUSES.DELIVERED]: new Set(),
  [ORDER_STATUSES.CANCELLED]: new Set(),
};

/**
 * Statuses from which a customer may request cancellation.
 */
export const CUSTOMER_CANCELLABLE_STATUSES = new Set([
  ORDER_STATUSES.PENDING,
  ORDER_STATUSES.PROCESSING,
]);

/**
 * Human-readable default description for each status used in timeline events.
 */
export const STATUS_DESCRIPTIONS = {
  [ORDER_STATUSES.PENDING]: 'Order placed and awaiting confirmation.',
  [ORDER_STATUSES.PROCESSING]: 'Order is being processed and prepared for dispatch.',
  [ORDER_STATUSES.SHIPPED]: 'Order has been dispatched and is on its way.',
  [ORDER_STATUSES.DELIVERED]: 'Order successfully delivered.',
  [ORDER_STATUSES.CANCELLED]: 'Order has been cancelled.',
};
