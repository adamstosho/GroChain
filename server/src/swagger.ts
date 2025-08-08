const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'GroChain API',
    version: '1.0.0',
    description: 'API documentation for GroChain - Digital Trust Platform for Nigeria\'s Agriculture',
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Local server',
    },
  ],
  paths: {
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  phone: { type: 'string' },
                  password: { type: 'string', minLength: 6 },
                  role: { type: 'string', enum: ['farmer', 'partner', 'aggregator', 'admin', 'buyer'] },
                },
                required: ['name', 'email', 'phone', 'password'],
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Registration successful',
          },
          400: {
            description: 'Validation error',
          },
          409: {
            description: 'Email or phone already registered',
          },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login a user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
                required: ['email', 'password'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    accessToken: { type: 'string' },
                    refreshToken: { type: 'string' },
                    user: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        email: { type: 'string' },
                        role: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation error',
          },
          401: {
            description: 'Invalid credentials',
          },
        },
      },
    },
    '/api/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Refresh access token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  refreshToken: { type: 'string' },
                },
                required: ['refreshToken'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'New access token issued',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    accessToken: { type: 'string' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation error',
          },
          401: {
            description: 'Invalid or expired refresh token',
          },
        },
      },
    },
    '/api/referrals/{farmerId}/complete': {
      post: {
        tags: ['Referrals'],
        summary: 'Mark referral as completed for a farmer',
        parameters: [
          {
            name: 'farmerId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'ID of the farmer',
          },
        ],
        responses: {
          200: {
            description: 'Referral marked as completed',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    referral: { type: 'object' },
                  },
                },
              },
            },
          },
          404: {
            description: 'Pending referral not found for this farmer',
          },
          500: {
            description: 'Server error',
          },
        },
      },
    },
    '/api/harvests': {
      post: {
        tags: ['Harvests'],
        summary: 'Create a harvest batch',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  farmer: { type: 'string' },
                  cropType: { type: 'string' },
                  quantity: { type: 'number' },
                  date: { type: 'string', format: 'date' },
                  geoLocation: {
                    type: 'object',
                    properties: {
                      lat: { type: 'number' },
                      lng: { type: 'number' },
                    },
                  },
                },
                required: ['farmer', 'cropType', 'quantity', 'date', 'geoLocation'],
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Harvest created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    harvest: { type: 'object' },
                    qrData: { type: 'string' },
                  },
                },
              },
            },
          },
          400: { description: 'Validation error' },
          500: { description: 'Server error' },
        },
      },
    },
    '/api/harvests/{batchId}': {
      get: {
        tags: ['Harvests'],
        summary: 'Get provenance record for a harvest batch',
        parameters: [
          {
            name: 'batchId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Batch ID of the harvest',
          },
        ],
        responses: {
          200: {
            description: 'Provenance record found',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    provenance: { type: 'object' },
                  },
                },
              },
            },
          },
          404: { description: 'Harvest batch not found' },
          500: { description: 'Server error' },
        },
      },
    },
    '/api/shipments': {
      post: {
        tags: ['Shipments'],
        summary: 'Create a shipment linked to a harvest batch',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  harvestBatch: { type: 'string' },
                  source: { type: 'string' },
                  destination: { type: 'string' },
                  timestamp: { type: 'string', format: 'date-time' },
                },
                required: ['harvestBatch', 'source', 'destination', 'timestamp'],
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Shipment created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    shipment: { type: 'object' },
                  },
                },
              },
            },
          },
          400: { description: 'Validation error' },
          500: { description: 'Server error' },
        },
      },
    },
    '/api/marketplace/listings': {
      get: {
        tags: ['Marketplace'],
        summary: 'Get all active listings',
        responses: {
          200: {
            description: 'List of active listings',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    listings: { type: 'array', items: { type: 'object' } },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Marketplace'],
        summary: 'Create a new listing',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  product: { type: 'string' },
                  price: { type: 'number' },
                  quantity: { type: 'number' },
                  farmer: { type: 'string' },
                  partner: { type: 'string' },
                  images: { type: 'array', items: { type: 'string' } },
                },
                required: ['product', 'price', 'quantity', 'farmer', 'partner'],
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Listing created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    listing: { type: 'object' },
                  },
                },
              },
            },
          },
          400: { description: 'Validation error' },
          500: { description: 'Server error' },
        },
      },
    },
    '/api/marketplace/orders': {
      post: {
        tags: ['Marketplace'],
        summary: 'Place an order',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  buyer: { type: 'string' },
                  items: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        listing: { type: 'string' },
                        quantity: { type: 'number' },
                      },
                    },
                  },
                },
                required: ['buyer', 'items'],
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Order placed',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    order: { type: 'object' },
                  },
                },
              },
            },
          },
          400: { description: 'Validation error' },
          500: { description: 'Server error' },
        },
      },
    },
    '/api/marketplace/orders/{id}/status': {
      patch: {
        tags: ['Marketplace'],
        summary: 'Update order status',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Order ID',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', enum: ['pending', 'paid', 'delivered', 'cancelled'] },
                },
                required: ['status'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Order status updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    order: { type: 'object' },
                  },
                },
              },
            },
          },
          400: { description: 'Invalid status' },
          404: { description: 'Order not found' },
          500: { description: 'Server error' },
        },
      },
    },
    '/api/marketplace/upload-image': {
      post: {
        tags: ['Marketplace'],
        summary: 'Upload product images to Cloudinary',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  images: {
                    type: 'array',
                    items: { type: 'string', format: 'binary' },
                  },
                },
                required: ['images'],
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Images uploaded',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    urls: { type: 'array', items: { type: 'string' } },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/fintech/credit-score/{farmerId}': {
      get: {
        tags: ['Fintech'],
        summary: 'Retrieve a farmer credit score',
        parameters: [
          {
            name: 'farmerId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'ID of the farmer',
          },
        ],
        responses: {
          200: {
            description: 'Credit score found',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    creditScore: { type: 'object' },
                  },
                },
              },
            },
          },
          404: { description: 'Credit score not found' },
          500: { description: 'Server error' },
        },
      },
    },
    '/api/fintech/loan-referrals': {
      post: {
        tags: ['Fintech'],
        summary: 'Create a loan referral',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  farmer: { type: 'string' },
                  amount: { type: 'number' },
                  partner: { type: 'string' },
                },
                required: ['farmer', 'amount', 'partner'],
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Loan referral created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    referral: { type: 'object' },
                  },
                },
              },
            },
          },
          400: { description: 'Validation error' },
          500: { description: 'Server error' },
        },
      },
    },
    '/api/analytics/overview': {
      get: {
        tags: ['Analytics'],
        summary: 'Get system overview statistics',
        responses: {
          200: {
            description: 'System overview statistics',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    overview: {
                      type: 'object',
                      properties: {
                        totalUsers: { type: 'number' },
                        totalFarmers: { type: 'number' },
                        totalPartners: { type: 'number' },
                        totalHarvests: { type: 'number' },
                        totalOrders: { type: 'number' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/analytics/partner/{partnerId}': {
      get: {
        tags: ['Analytics'],
        summary: 'Get partner-specific analytics',
        parameters: [
          {
            name: 'partnerId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'ID of the partner',
          },
        ],
        responses: {
          200: {
            description: 'Partner analytics',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    analytics: {
                      type: 'object',
                      properties: {
                        totalFarmers: { type: 'number' },
                        totalReferrals: { type: 'number' },
                        completedReferrals: { type: 'number' },
                        totalOrders: { type: 'number' },
                        commissionBalance: { type: 'number' },
                      },
                    },
                  },
                },
              },
            },
          },
          404: { description: 'Partner not found' },
        },
      },
    },
    '/api/payments/initialize': {
      post: {
        tags: ['Payments'],
        summary: 'Initialize payment for an order',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  orderId: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                },
                required: ['orderId', 'email'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Payment initialized',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    payment: { type: 'object' },
                  },
                },
              },
            },
          },
          404: { description: 'Order not found' },
          500: { description: 'Payment initialization failed' },
        },
      },
    },
    '/api/payments/verify': {
      post: {
        tags: ['Payments'],
        summary: 'Verify payment webhook from Paystack',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  reference: { type: 'string' },
                },
                required: ['reference'],
              },
            },
          },
        },
        responses: {
          200: { description: 'Payment verified' },
          500: { description: 'Payment verification failed' },
        },
      },
    },
    '/api/notifications/send': {
      post: {
        tags: ['Notifications'],
        summary: 'Send notification to a user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  userId: { type: 'string' },
                  type: { type: 'string', enum: ['sms', 'email', 'ussd'] },
                  message: { type: 'string' },
                },
                required: ['userId', 'type', 'message'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Notification sent',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    notification: { type: 'object' },
                  },
                },
              },
            },
          },
          400: { description: 'Validation error' },
          500: { description: 'Notification failed' },
        },
      },
    },
    '/api/notifications/{userId}': {
      get: {
        tags: ['Notifications'],
        summary: 'Get user notification history',
        parameters: [
          {
            name: 'userId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'ID of the user',
          },
        ],
        responses: {
          200: {
            description: 'User notifications',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    notifications: { type: 'array', items: { type: 'object' } },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

export default swaggerSpec;
