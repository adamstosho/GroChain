const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'GroChain API',
    version: '1.0.0',
    description: 'API documentation for GroChain - Digital Trust Platform for Nigeria’s Agriculture',
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
  },
};

export default swaggerSpec;
