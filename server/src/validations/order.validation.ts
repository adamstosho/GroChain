import Joi from 'joi';

// Order CRUD Validation Schemas
export const createOrderSchema = Joi.object({
  customer: Joi.object({
    id: Joi.string().required(),
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    address: Joi.object({
      street: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      country: Joi.string().required(),
      postalCode: Joi.string().optional()
    }).required()
  }).required(),
  items: Joi.array().items(Joi.object({
    productId: Joi.string().required(),
    name: Joi.string().required(),
    quantity: Joi.number().integer().positive().required(),
    unitPrice: Joi.number().positive().required(),
    totalPrice: Joi.number().positive().required(),
    notes: Joi.string().optional()
  })).min(1).required(),
  shipping: Joi.object({
    method: Joi.string().required().valid('standard', 'express', 'overnight', 'pickup'),
    address: Joi.object({
      street: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      country: Joi.string().required(),
      postalCode: Joi.string().optional()
    }).required(),
    cost: Joi.number().positive().required(),
    estimatedDelivery: Joi.date().iso().optional()
  }).required(),
  payment: Joi.object({
    method: Joi.string().required().valid('card', 'bank_transfer', 'mobile_money', 'cash', 'crypto'),
    status: Joi.string().valid('pending', 'processing', 'completed', 'failed', 'refunded').default('pending'),
    transactionId: Joi.string().optional(),
    amount: Joi.number().positive().required(),
    currency: Joi.string().default('NGN')
  }).required(),
  notes: Joi.string().optional(),
  metadata: Joi.object().optional()
});

export const updateOrderSchema = Joi.object({
  customer: Joi.object({
    id: Joi.string(),
    name: Joi.string(),
    email: Joi.string().email(),
    phone: Joi.string(),
    address: Joi.object({
      street: Joi.string(),
      city: Joi.string(),
      state: Joi.string(),
      country: Joi.string(),
      postalCode: Joi.string()
    })
  }),
  items: Joi.array().items(Joi.object({
    productId: Joi.string(),
    name: Joi.string(),
    quantity: Joi.number().integer().positive(),
    unitPrice: Joi.number().positive(),
    totalPrice: Joi.number().positive(),
    notes: Joi.string()
  })),
  shipping: Joi.object({
    method: Joi.string().valid('standard', 'express', 'overnight', 'pickup'),
    address: Joi.object({
      street: Joi.string(),
      city: Joi.string(),
      state: Joi.string(),
      country: Joi.string(),
      postalCode: Joi.string()
    }),
    cost: Joi.number().positive(),
    estimatedDelivery: Joi.date().iso()
  }),
  payment: Joi.object({
    method: Joi.string().valid('card', 'bank_transfer', 'mobile_money', 'cash', 'crypto'),
    status: Joi.string().valid('pending', 'processing', 'completed', 'failed', 'refunded'),
    transactionId: Joi.string(),
    amount: Joi.number().positive(),
    currency: Joi.string()
  }),
  notes: Joi.string(),
  metadata: Joi.object()
});

export const getOrdersSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  status: Joi.string().valid('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded').optional(),
  customerId: Joi.string().optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  sortBy: Joi.string().valid('createdAt', 'updatedAt', 'totalAmount', 'status').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

// Order Status Management Validation Schemas
export const updateOrderStatusSchema = Joi.object({
  status: Joi.string().required().valid('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'),
  reason: Joi.string().optional(),
  notes: Joi.string().optional(),
  estimatedDelivery: Joi.date().iso().optional(),
  trackingNumber: Joi.string().optional()
});

export const bulkStatusUpdateSchema = Joi.object({
  orderIds: Joi.array().items(Joi.string()).min(1).required(),
  status: Joi.string().required().valid('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'),
  reason: Joi.string().optional(),
  notes: Joi.string().optional()
});

// Order Item Management Validation Schemas
export const addOrderItemSchema = Joi.object({
  productId: Joi.string().required(),
  name: Joi.string().required(),
  quantity: Joi.number().integer().positive().required(),
  unitPrice: Joi.number().positive().required(),
  notes: Joi.string().optional()
});

export const updateOrderItemSchema = Joi.object({
  itemId: Joi.string().required(),
  quantity: Joi.number().integer().positive(),
  unitPrice: Joi.number().positive(),
  notes: Joi.string()
});

export const removeOrderItemSchema = Joi.object({
  itemId: Joi.string().required(),
  reason: Joi.string().optional()
});

// Order Fulfillment Validation Schemas
export const createShipmentSchema = Joi.object({
  orderId: Joi.string().required(),
  carrier: Joi.string().required(),
  trackingNumber: Joi.string().required(),
  method: Joi.string().required().valid('standard', 'express', 'overnight'),
  cost: Joi.number().positive().required(),
  estimatedDelivery: Joi.date().iso().required(),
  notes: Joi.string().optional()
});

export const updateShipmentSchema = Joi.object({
  carrier: Joi.string(),
  trackingNumber: Joi.string(),
  method: Joi.string().valid('standard', 'express', 'overnight'),
  cost: Joi.number().positive(),
  estimatedDelivery: Joi.date().iso(),
  notes: Joi.string()
});

export const trackShipmentSchema = Joi.object({
  trackingNumber: Joi.string().required()
});

// Order Payment Validation Schemas
export const processPaymentSchema = Joi.object({
  orderId: Joi.string().required(),
  method: Joi.string().required().valid('card', 'bank_transfer', 'mobile_money', 'cash', 'crypto'),
  amount: Joi.number().positive().required(),
  currency: Joi.string().default('NGN'),
  transactionId: Joi.string().optional(),
  notes: Joi.string().optional()
});

export const refundOrderSchema = Joi.object({
  orderId: Joi.string().required(),
  amount: Joi.number().positive().required(),
  reason: Joi.string().required(),
  method: Joi.string().valid('original_payment', 'store_credit', 'bank_transfer').required(),
  notes: Joi.string().optional()
});

// Order Returns Validation Schemas
export const createReturnSchema = Joi.object({
  orderId: Joi.string().required(),
  items: Joi.array().items(Joi.object({
    itemId: Joi.string().required(),
    quantity: Joi.number().integer().positive().required(),
    reason: Joi.string().required().valid('defective', 'wrong_item', 'size_issue', 'quality_issue', 'other'),
    condition: Joi.string().required().valid('new', 'like_new', 'good', 'fair', 'poor'),
    notes: Joi.string().optional()
  })).min(1).required(),
  returnReason: Joi.string().required(),
  returnMethod: Joi.string().required().valid('pickup', 'drop_off', 'shipping'),
  pickupAddress: Joi.object({
    street: Joi.string().optional(),
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    country: Joi.string().optional(),
    postalCode: Joi.string().optional()
  }).optional(),
  notes: Joi.string().optional()
});

export const updateReturnSchema = Joi.object({
  status: Joi.string().valid('pending', 'approved', 'rejected', 'processing', 'completed'),
  notes: Joi.string(),
  refundAmount: Joi.number().positive(),
  refundMethod: Joi.string().valid('original_payment', 'store_credit', 'bank_transfer')
});

// Order Reviews Validation Schemas
export const createReviewSchema = Joi.object({
  orderId: Joi.string().required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  title: Joi.string().required().min(5).max(100),
  comment: Joi.string().required().min(10).max(1000),
  anonymous: Joi.boolean().default(false)
});

export const updateReviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5),
  title: Joi.string().min(5).max(100),
  comment: Joi.string().min(10).max(1000),
  anonymous: Joi.boolean()
});

// Order Notifications Validation Schemas
export const sendOrderNotificationSchema = Joi.object({
  orderId: Joi.string().required(),
  type: Joi.string().required().valid('confirmation', 'shipping', 'delivery', 'cancellation', 'refund'),
  method: Joi.string().required().valid('email', 'sms', 'push', 'all'),
  message: Joi.string().optional(),
  metadata: Joi.object().optional()
});

// Order Analytics Validation Schemas
export const getOrderAnalyticsSchema = Joi.object({
  timeframe: Joi.string().required().valid('daily', 'weekly', 'monthly', 'quarterly', 'yearly'),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().greater(Joi.ref('startDate')).required(),
  metrics: Joi.array().items(Joi.string().valid(
    'total_orders',
    'total_revenue',
    'average_order_value',
    'conversion_rate',
    'refund_rate',
    'customer_satisfaction'
  )).min(1).required(),
  groupBy: Joi.string().valid('day', 'week', 'month', 'quarter', 'year', 'status', 'payment_method').optional(),
  filters: Joi.object({
    status: Joi.string().valid('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded').optional(),
    paymentMethod: Joi.string().valid('card', 'bank_transfer', 'mobile_money', 'cash', 'crypto').optional(),
    minAmount: Joi.number().positive().optional(),
    maxAmount: Joi.number().positive().optional()
  }).optional()
});

// Order Reports Validation Schemas
export const generateOrderReportSchema = Joi.object({
  reportType: Joi.string().required().valid('sales', 'inventory', 'customer', 'shipping', 'returns', 'custom'),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().greater(Joi.ref('startDate')).required(),
  format: Joi.string().valid('pdf', 'excel', 'csv', 'json').default('pdf'),
  filters: Joi.object({
    status: Joi.string().valid('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded').optional(),
    customerId: Joi.string().optional(),
    paymentMethod: Joi.string().valid('card', 'bank_transfer', 'mobile_money', 'cash', 'crypto').optional(),
    minAmount: Joi.number().positive().optional(),
    maxAmount: Joi.number().positive().optional()
  }).optional(),
  includeCharts: Joi.boolean().default(true),
  metadata: Joi.object().optional()
});

// Order Export Validation Schemas
export const exportOrdersSchema = Joi.object({
  format: Joi.string().required().valid('csv', 'excel', 'json'),
  filters: Joi.object({
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    status: Joi.string().valid('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded').optional(),
    customerId: Joi.string().optional(),
    paymentMethod: Joi.string().valid('card', 'bank_transfer', 'mobile_money', 'cash', 'crypto').optional()
  }).optional(),
  fields: Joi.array().items(Joi.string()).optional(),
  includeItems: Joi.boolean().default(false),
  metadata: Joi.object().optional()
});

// Order Search Validation Schemas
export const searchOrdersSchema = Joi.object({
  query: Joi.string().required().min(2),
  filters: Joi.object({
    status: Joi.string().valid('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded').optional(),
    customerId: Joi.string().optional(),
    paymentMethod: Joi.string().valid('card', 'bank_transfer', 'mobile_money', 'cash', 'crypto').optional(),
    dateRange: Joi.object({
      start: Joi.date().iso().optional(),
      end: Joi.date().iso().optional()
    }).optional()
  }).optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
});

// Order Bulk Operations Validation Schemas
export const bulkOrderOperationsSchema = Joi.object({
  orderIds: Joi.array().items(Joi.string()).min(1).required(),
  operation: Joi.string().required().valid('cancel', 'refund', 'ship', 'update_status', 'send_notification'),
  data: Joi.object().optional(),
  notes: Joi.string().optional()
});

// Export all schemas
export const orderValidation = {
  createOrder: createOrderSchema,
  updateOrder: updateOrderSchema,
  getOrders: getOrdersSchema,
  updateOrderStatus: updateOrderStatusSchema,
  bulkStatusUpdate: bulkStatusUpdateSchema,
  addOrderItem: addOrderItemSchema,
  updateOrderItem: updateOrderItemSchema,
  removeOrderItem: removeOrderItemSchema,
  createShipment: createShipmentSchema,
  updateShipment: updateShipmentSchema,
  trackShipment: trackShipmentSchema,
  processPayment: processPaymentSchema,
  refundOrder: refundOrderSchema,
  createReturn: createReturnSchema,
  updateReturn: updateReturnSchema,
  createReview: createReviewSchema,
  updateReview: updateReviewSchema,
  sendOrderNotification: sendOrderNotificationSchema,
  getOrderAnalytics: getOrderAnalyticsSchema,
  generateOrderReport: generateOrderReportSchema,
  exportOrders: exportOrdersSchema,
  searchOrders: searchOrdersSchema,
  bulkOrderOperations: bulkOrderOperationsSchema
};
