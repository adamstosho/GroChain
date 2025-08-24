import Joi from 'joi';

// Base order schema
const orderBaseSchema = Joi.object({
  buyer: Joi.string().required(),
  items: Joi.array().items(
    Joi.object({
      listing: Joi.string().required(),
      quantity: Joi.number().positive().required(),
      unitPrice: Joi.number().positive().required(),
    })
  ).min(1).required(),
  shippingAddress: Joi.object({
    street: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    postalCode: Joi.string().required(),
    country: Joi.string().default('Nigeria'),
  }).required(),
  paymentMethod: Joi.string().valid('paystack', 'bank_transfer', 'cash').required(),
  notes: Joi.string().optional(),
});

// Order status schema
const orderStatusSchema = Joi.object({
  status: Joi.string().valid(
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'refunded'
  ).required(),
  reason: Joi.string().optional(),
});

// Order item schema
const orderItemSchema = Joi.object({
  listing: Joi.string().required(),
  quantity: Joi.number().positive().required(),
  unitPrice: Joi.number().positive().required(),
});

// Payment schema
const paymentSchema = Joi.object({
  amount: Joi.number().positive().required(),
  method: Joi.string().valid('paystack', 'bank_transfer', 'cash').required(),
  reference: Joi.string().optional(),
  notes: Joi.string().optional(),
});

// Shipping schema
const shippingSchema = Joi.object({
  carrier: Joi.string().required(),
  trackingNumber: Joi.string().required(),
  estimatedDelivery: Joi.date().optional(),
  notes: Joi.string().optional(),
});

// Return schema
const returnSchema = Joi.object({
  reason: Joi.string().required(),
  description: Joi.string().optional(),
  items: Joi.array().items(
    Joi.object({
      itemId: Joi.string().required(),
      quantity: Joi.number().positive().required(),
      reason: Joi.string().required(),
    })
  ).min(1).required(),
});

// Review schema
const reviewSchema = Joi.object({
  rating: Joi.number().min(1).max(5).required(),
  comment: Joi.string().optional(),
  images: Joi.array().items(Joi.string()).optional(),
});

// Export the validation schemas
export const orderValidation = {
  // Basic CRUD operations
  getOrders: Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(20),
    status: Joi.string().valid('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'),
    buyer: Joi.string(),
    seller: Joi.string(),
    startDate: Joi.date(),
    endDate: Joi.date(),
  }),

  getOrder: Joi.object({
    orderId: Joi.string().required(),
  }),

  createOrder: orderBaseSchema,

  updateOrder: orderBaseSchema.keys({
    orderId: Joi.string().required(),
  }),

  deleteOrder: Joi.object({
    orderId: Joi.string().required(),
  }),

  // Order status management
  updateOrderStatus: orderStatusSchema.keys({
    orderId: Joi.string().required(),
  }),

  confirmOrder: Joi.object({
    orderId: Joi.string().required(),
    confirmedBy: Joi.string().required(),
    notes: Joi.string().optional(),
  }),

  cancelOrder: Joi.object({
    orderId: Joi.string().required(),
    reason: Joi.string().required(),
    cancelledBy: Joi.string().required(),
  }),

  refundOrder: Joi.object({
    orderId: Joi.string().required(),
    amount: Joi.number().positive().required(),
    reason: Joi.string().required(),
    refundedBy: Joi.string().required(),
  }),

  // Order items management
  getOrderItems: Joi.object({
    orderId: Joi.string().required(),
  }),

  addOrderItem: orderItemSchema.keys({
    orderId: Joi.string().required(),
  }),

  updateOrderItem: orderItemSchema.keys({
    orderId: Joi.string().required(),
    itemId: Joi.string().required(),
  }),

  removeOrderItem: Joi.object({
    orderId: Joi.string().required(),
    itemId: Joi.string().required(),
  }),

  // Order fulfillment
  fulfillOrder: Joi.object({
    orderId: Joi.string().required(),
    fulfilledBy: Joi.string().required(),
    notes: Joi.string().optional(),
  }),

  partialFulfillment: Joi.object({
    orderId: Joi.string().required(),
    items: Joi.array().items(
      Joi.object({
        itemId: Joi.string().required(),
        quantity: Joi.number().positive().required(),
      })
    ).min(1).required(),
    fulfilledBy: Joi.string().required(),
    notes: Joi.string().optional(),
  }),

  shipOrder: shippingSchema.keys({
    orderId: Joi.string().required(),
  }),

  deliverOrder: Joi.object({
    orderId: Joi.string().required(),
    deliveredBy: Joi.string().required(),
    deliveryDate: Joi.date().default(Date.now),
    notes: Joi.string().optional(),
  }),

  // Payment management
  getOrderPayment: Joi.object({
    orderId: Joi.string().required(),
  }),

  processPayment: paymentSchema.keys({
    orderId: Joi.string().required(),
  }),

  refundPayment: Joi.object({
    orderId: Joi.string().required(),
    paymentId: Joi.string().required(),
    amount: Joi.number().positive().required(),
    reason: Joi.string().required(),
    refundedBy: Joi.string().required(),
  }),

  partialRefund: Joi.object({
    orderId: Joi.string().required(),
    paymentId: Joi.string().required(),
    amount: Joi.number().positive().required(),
    reason: Joi.string().required(),
    refundedBy: Joi.string().required(),
  }),

  // Shipping management
  getOrderShipping: Joi.object({
    orderId: Joi.string().required(),
  }),

  createShipping: shippingSchema.keys({
    orderId: Joi.string().required(),
  }),

  updateShipping: shippingSchema.keys({
    orderId: Joi.string().required(),
    shippingId: Joi.string().required(),
  }),

  trackShipping: Joi.object({
    orderId: Joi.string().required(),
    trackingNumber: Joi.string().required(),
  }),

  // Returns management
  createReturn: returnSchema.keys({
    orderId: Joi.string().required(),
  }),

  getOrderReturns: Joi.object({
    orderId: Joi.string().required(),
  }),

  approveReturn: Joi.object({
    orderId: Joi.string().required(),
    returnId: Joi.string().required(),
    approvedBy: Joi.string().required(),
    notes: Joi.string().optional(),
  }),

  rejectReturn: Joi.object({
    orderId: Joi.string().required(),
    returnId: Joi.string().required(),
    rejectedBy: Joi.string().required(),
    reason: Joi.string().required(),
  }),

  // Reviews management
  getOrderReviews: Joi.object({
    orderId: Joi.string().required(),
  }),

  createReview: reviewSchema.keys({
    orderId: Joi.string().required(),
  }),

  updateReview: reviewSchema.keys({
    orderId: Joi.string().required(),
    reviewId: Joi.string().required(),
  }),

  deleteReview: Joi.object({
    orderId: Joi.string().required(),
    reviewId: Joi.string().required(),
  }),

  // Notifications
  getOrderNotifications: Joi.object({
    orderId: Joi.string().required(),
  }),

  sendNotification: Joi.object({
    orderId: Joi.string().required(),
    type: Joi.string().valid('status_update', 'payment', 'shipping', 'delivery').required(),
    message: Joi.string().required(),
    recipient: Joi.string().required(),
  }),

  // Reports and analytics
  getOrderReports: Joi.object({
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
    groupBy: Joi.string().valid('day', 'week', 'month', 'quarter', 'year').default('month'),
    status: Joi.string().valid('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'),
    buyer: Joi.string(),
    seller: Joi.string(),
  }),

  getDetailedReports: Joi.object({
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
    filters: Joi.object({
      status: Joi.array().items(Joi.string()),
      buyer: Joi.array().items(Joi.string()),
      seller: Joi.array().items(Joi.string()),
      paymentMethod: Joi.array().items(Joi.string()),
      region: Joi.array().items(Joi.string()),
    }).optional(),
  }),

  exportOrders: Joi.object({
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
    format: Joi.string().valid('csv', 'excel', 'pdf').default('csv'),
    filters: Joi.object({
      status: Joi.array().items(Joi.string()),
      buyer: Joi.array().items(Joi.string()),
      seller: Joi.array().items(Joi.string()),
    }).optional(),
  }),

  // Bulk operations
  bulkCreateOrders: Joi.object({
    orders: Joi.array().items(orderBaseSchema).min(1).max(100).required(),
  }),

  bulkUpdateOrders: Joi.object({
    orders: Joi.array().items(
      Joi.object({
        orderId: Joi.string().required(),
        updates: Joi.object().keys({
          status: Joi.string().valid('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'),
          notes: Joi.string(),
          shippingAddress: Joi.object({
            street: Joi.string(),
            city: Joi.string(),
            state: Joi.string(),
            postalCode: Joi.string(),
            country: Joi.string(),
          }),
        }).min(1).required(),
      })
    ).min(1).max(50).required(),
  }),

  bulkStatusUpdate: Joi.object({
    orderIds: Joi.array().items(Joi.string()).min(1).max(100).required(),
    status: Joi.string().valid('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded').required(),
    reason: Joi.string().optional(),
    updatedBy: Joi.string().required(),
  }),

  // Search and filtering
  searchOrders: Joi.object({
    query: Joi.string().min(1).required(),
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(20),
    filters: Joi.object({
      status: Joi.array().items(Joi.string()),
      buyer: Joi.array().items(Joi.string()),
      seller: Joi.array().items(Joi.string()),
      dateRange: Joi.object({
        start: Joi.date(),
        end: Joi.date(),
      }),
    }).optional(),
  }),

  filterOrders: Joi.object({
    filters: Joi.object({
      status: Joi.array().items(Joi.string()),
      buyer: Joi.array().items(Joi.string()),
      seller: Joi.array().items(Joi.string()),
      paymentMethod: Joi.array().items(Joi.string()),
      region: Joi.array().items(Joi.string()),
      dateRange: Joi.object({
        start: Joi.date(),
        end: Joi.date(),
      }),
      amountRange: Joi.object({
        min: Joi.number().min(0),
        max: Joi.number().min(0),
      }),
    }).min(1).required(),
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(20),
    sortBy: Joi.string().valid('createdAt', 'updatedAt', 'amount', 'status').default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  }),

  // Order templates
  getOrderTemplate: Joi.object({
    templateId: Joi.string().required(),
  }),

  createOrderTemplate: Joi.object({
    name: Joi.string().required(),
    description: Joi.string().optional(),
    items: Joi.array().items(
      Joi.object({
        product: Joi.string().required(),
        defaultQuantity: Joi.number().positive().required(),
        defaultUnitPrice: Joi.number().positive().required(),
      })
    ).min(1).required(),
    shippingAddress: Joi.object({
      street: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      postalCode: Joi.string().required(),
      country: Joi.string().default('Nigeria'),
    }).required(),
    paymentMethod: Joi.string().valid('paystack', 'bank_transfer', 'cash').required(),
    notes: Joi.string().optional(),
  }),

  updateOrderTemplate: Joi.object({
    templateId: Joi.string().required(),
    updates: Joi.object().keys({
      name: Joi.string(),
      description: Joi.string(),
      items: Joi.array().items(
        Joi.object({
          product: Joi.string().required(),
          defaultQuantity: Joi.number().positive().required(),
          defaultUnitPrice: Joi.number().positive().required(),
        })
      ).min(1),
      shippingAddress: Joi.object({
        street: Joi.string(),
        city: Joi.string(),
        state: Joi.string(),
        postalCode: Joi.string(),
        country: Joi.string(),
      }),
      paymentMethod: Joi.string().valid('paystack', 'bank_transfer', 'cash'),
      notes: Joi.string(),
    }).min(1).required(),
  }),

  deleteOrderTemplate: Joi.object({
    templateId: Joi.string().required(),
  }),
};
