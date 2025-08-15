const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'GroChain API',
    version: '1.0.0',
    description: 'API documentation for GroChain - Digital Trust Platform for Nigeria\'s Agriculture',
    contact: {
      name: 'GroChain Support',
      email: 'support@grochain.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Local development server',
    },
    {
      url: 'https://api.grochain.com',
      description: 'Production server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
          role: { type: 'string', enum: ['farmer', 'partner', 'aggregator', 'admin', 'buyer'] },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Harvest: {
        type: 'object',
        properties: {
          id: { type: 'string' },
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
          batchId: { type: 'string' },
          qrData: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Order: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          buyer: { type: 'string' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                listing: { type: 'string' },
                quantity: { type: 'number' },
                price: { type: 'number' },
              },
            },
          },
          total: { type: 'number' },
          status: { type: 'string', enum: ['pending', 'paid', 'delivered', 'cancelled'] },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      ApiResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['success', 'error'] },
          message: { type: 'string' },
          data: { type: 'object' },
        },
      },
      Shipment: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          harvestBatch: { type: 'string' },
          source: { type: 'string' },
          destination: { type: 'string' },
          timestamp: { type: 'string', format: 'date-time' },
          carrier: { type: 'string' },
          trackingNumber: { type: 'string' },
          status: { type: 'string', enum: ['pending', 'in_transit', 'delivered'] },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Listing: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          product: { type: 'string' },
          price: { type: 'number' },
          quantity: { type: 'number' },
          farmer: { type: 'string' },
          partner: { type: 'string' },
          images: { type: 'array', items: { type: 'string' } },
          description: { type: 'string' },
          category: { type: 'string' },
          status: { type: 'string', enum: ['active', 'sold', 'inactive'] },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Partner: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
          organizationType: { type: 'string' },
          location: { type: 'string' },
          commissionRate: { type: 'number' },
          totalCommissionEarned: { type: 'number' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Referral: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          farmer: { type: 'string' },
          partner: { type: 'string' },
          status: { type: 'string', enum: ['pending', 'completed', 'cancelled'] },
          commissionAmount: { type: 'number' },
          completedAt: { type: 'string', format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      CreditScore: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          farmer: { type: 'string' },
          score: { type: 'number', minimum: 0, maximum: 850 },
          factors: {
            type: 'object',
            properties: {
              transactionHistory: { type: 'number' },
              paymentReliability: { type: 'number' },
              harvestConsistency: { type: 'number' },
              partnerRatings: { type: 'number' },
            },
          },
          lastUpdated: { type: 'string', format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      LoanReferral: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          farmer: { type: 'string' },
          partner: { type: 'string' },
          amount: { type: 'number' },
          status: { type: 'string', enum: ['pending', 'approved', 'rejected', 'disbursed'] },
          interestRate: { type: 'number' },
          loanTerm: { type: 'number' },
          purpose: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Notification: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          userId: { type: 'string' },
          type: { type: 'string', enum: ['sms', 'email', 'ussd', 'push'] },
          message: { type: 'string' },
          status: { type: 'string', enum: ['pending', 'sent', 'failed'] },
          sentAt: { type: 'string', format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['error'] },
          message: { type: 'string' },
          code: { type: 'number' },
        },
      },
      IoTSensor: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          farmer: { type: 'string' },
          sensorType: { type: 'string', enum: ['soil_moisture', 'temperature', 'humidity', 'ph', 'nutrient'] },
          location: {
            type: 'object',
            properties: {
              lat: { type: 'number' },
              lng: { type: 'number' },
            },
          },
          status: { type: 'string', enum: ['active', 'inactive', 'maintenance'] },
          lastReading: { type: 'string', format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      CropAnalysis: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          farmer: { type: 'string' },
          cropType: { type: 'string' },
          imageUrl: { type: 'string' },
          analysisResult: { type: 'string' },
          riskLevel: { type: 'string', enum: ['low', 'medium', 'high'] },
          recommendations: { type: 'array', items: { type: 'string' } },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Product: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          category: { type: 'string' },
          description: { type: 'string' },
          unit: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Transaction: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          order: { type: 'string' },
          amount: { type: 'number' },
          status: { type: 'string', enum: ['pending', 'completed', 'failed'] },
          paymentMethod: { type: 'string' },
          reference: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['System'],
        summary: 'Health check',
        responses: {
          200: {
            description: 'Service is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    uptime: { type: 'number' },
                    database: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/public/farmers-template.csv': {
      get: {
        tags: ['Files'],
        summary: 'Download CSV template for bulk farmer onboarding',
        description: 'Download a CSV template file with the correct format for bulk farmer onboarding',
        responses: {
          200: {
            description: 'CSV template file',
            content: {
              'text/csv': {
                schema: {
                  type: 'string',
                  format: 'binary',
                },
                example: 'name,email,phone,password\nJohn Doe,john@example.com,+2348012345678,password123',
              },
            },
          },
          404: {
            description: 'Template file not found',
          },
        },
      },
    },
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
    '/api/auth/send-sms-otp': {
      post: {
        tags: ['Auth'],
        summary: 'Send SMS OTP for phone verification',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  phone: { type: 'string' },
                },
                required: ['phone'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'SMS OTP sent successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    message: { type: 'string' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation error',
          },
          404: {
            description: 'User not found',
          },
          429: {
            description: 'Too many OTP attempts',
          },
        },
      },
    },
    '/api/auth/verify-sms-otp': {
      post: {
        tags: ['Auth'],
        summary: 'Verify SMS OTP for phone verification',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  phone: { type: 'string' },
                  otp: { type: 'string', minLength: 6, maxLength: 6 },
                },
                required: ['phone', 'otp'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Phone number verified successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    message: { type: 'string' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation error or OTP expired',
          },
          404: {
            description: 'User not found',
          },
        },
      },
    },
    '/api/auth/forgot-password': {
      post: {
        tags: ['Auth'],
        summary: 'Request password reset',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email' },
                },
                required: ['email'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Password reset email sent',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    message: { type: 'string' },
                  },
                },
              },
            },
          },
          404: {
            description: 'Email not found',
          },
          500: {
            description: 'Server error',
          },
        },
      },
    },
    '/api/auth/reset-password': {
      post: {
        tags: ['Auth'],
        summary: 'Reset password with token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  token: { type: 'string' },
                  password: { type: 'string', minLength: 6 },
                },
                required: ['token', 'password'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Password reset successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    message: { type: 'string' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Invalid or expired token',
          },
          500: {
            description: 'Server error',
          },
        },
      },
    },
    '/api/auth/verify-email': {
      post: {
        tags: ['Auth'],
        summary: 'Verify email address',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  token: { type: 'string' },
                },
                required: ['token'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Email verified successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    message: { type: 'string' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Invalid or expired token',
          },
          500: {
            description: 'Server error',
          },
        },
      },
    },
    '/api/auth/protected': {
      get: {
        tags: ['Auth'],
        summary: 'Example protected route',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Access granted',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    message: { type: 'string' },
                  },
                },
              },
            },
          },
          401: {
            description: 'Unauthorized',
          },
          403: {
            description: 'Forbidden - insufficient permissions',
          },
        },
      },
    },
    '/api/partners/bulk-onboard': {
      post: {
        tags: ['Partners'],
        summary: 'Bulk onboard farmers',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  farmers: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: { type: 'string' },
                        email: { type: 'string', format: 'email' },
                        phone: { type: 'string' },
                        location: { type: 'string' },
                      },
                      required: ['name', 'phone'],
                    },
                  },
                },
                required: ['farmers'],
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Farmers onboarded successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    onboarded: { type: 'number' },
                    failed: { type: 'number' },
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
    '/api/partners/upload-csv': {
      post: {
        tags: ['Partners'],
        summary: 'Upload CSV file to onboard farmers',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  csvFile: { type: 'string', format: 'binary' },
                },
                required: ['csvFile'],
              },
            },
          },
        },
        responses: {
          201: {
            description: 'CSV processed and farmers onboarded',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    onboarded: { type: 'number' },
                    failed: { type: 'number' },
                    errors: { type: 'array', items: { type: 'string' } },
                  },
                },
              },
            },
          },
          400: { description: 'Invalid CSV file' },
          500: { description: 'Server error' },
        },
      },
    },
    '/api/partners/{id}/metrics': {
      get: {
        tags: ['Partners'],
        summary: 'Get partner performance metrics',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Partner ID',
          },
        ],
        responses: {
          200: {
            description: 'Partner metrics retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    metrics: {
                      type: 'object',
                      properties: {
                        totalFarmers: { type: 'number' },
                        activeFarmers: { type: 'number' },
                        totalReferrals: { type: 'number' },
                        completedReferrals: { type: 'number' },
                        commissionEarned: { type: 'number' },
                      },
                    },
                  },
                },
              },
            },
          },
          404: { description: 'Partner not found' },
          500: { description: 'Server error' },
        },
      },
    },
    '/api/commissions/summary': {
      get: {
        tags: ['Commission'],
        summary: 'Get commission summary for authenticated partner',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'period',
            in: 'query',
            schema: { type: 'string', enum: ['month', 'quarter', 'year'] },
            description: 'Time period for summary',
          },
        ],
        responses: {
          200: {
            description: 'Commission summary retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    summary: {
                      type: 'object',
                      properties: {
                        totalEarned: { type: 'number' },
                        pendingAmount: { type: 'number' },
                        withdrawnAmount: { type: 'number' },
                        transactionCount: { type: 'number' },
                      },
                    },
                  },
                },
              },
            },
          },
          500: { description: 'Server error' },
        },
      },
    },
    '/api/commissions/history': {
      get: {
        tags: ['Commission'],
        summary: 'Get commission history with pagination',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'number', default: 1 },
            description: 'Page number',
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'number', default: 10 },
            description: 'Items per page',
          },
        ],
        responses: {
          200: {
            description: 'Commission history retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    history: {
                      type: 'object',
                      properties: {
                        transactions: { type: 'array', items: { type: 'object' } },
                        pagination: {
                          type: 'object',
                          properties: {
                            currentPage: { type: 'number' },
                            totalPages: { type: 'number' },
                            totalItems: { type: 'number' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          500: { description: 'Server error' },
        },
      },
    },
    '/api/commissions/withdraw': {
      post: {
        tags: ['Commission'],
        summary: 'Request commission withdrawal',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  amount: { type: 'number', minimum: 0.01 },
                },
                required: ['amount'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Withdrawal request processed',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    message: { type: 'string' },
                  },
                },
              },
            },
          },
          400: { description: 'Insufficient balance or invalid amount' },
          500: { description: 'Server error' },
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
      get: {
        tags: ['Harvests'],
        summary: 'Get all harvests for authenticated user',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'number', default: 1 },
            description: 'Page number',
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'number', default: 10 },
            description: 'Items per page',
          },
        ],
        responses: {
          200: {
            description: 'Harvests retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    harvests: { type: 'array', items: { $ref: '#/components/schemas/Harvest' } },
                    pagination: {
                      type: 'object',
                      properties: {
                        currentPage: { type: 'number' },
                        totalPages: { type: 'number' },
                        totalItems: { type: 'number' },
                      },
                    },
                  },
                },
              },
            },
          },
          500: { description: 'Server error' },
        },
      },
      post: {
        tags: ['Harvests'],
        summary: 'Create a harvest batch',
        security: [{ bearerAuth: [] }],
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
                    harvest: { $ref: '#/components/schemas/Harvest' },
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
    '/api/harvests/provenance/{batchId}': {
      get: {
        tags: ['Harvests'],
        summary: 'Get provenance record for a harvest batch (authenticated)',
        security: [{ bearerAuth: [] }],
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
    '/api/harvests/verify/{batchId}': {
      get: {
        tags: ['Harvests'],
        summary: 'Verify QR code and get harvest details (public endpoint)',
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
            description: 'QR code verified successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    harvest: { $ref: '#/components/schemas/Harvest' },
                    farmer: { type: 'object' },
                    provenance: { type: 'object' },
                  },
                },
              },
            },
          },
          404: { description: 'Invalid QR code or harvest not found' },
          500: { description: 'Server error' },
        },
      },
    },

    '/api/shipments': {
      post: {
        tags: ['Shipments'],
        summary: 'Create a shipment linked to a harvest batch',
        security: [{ bearerAuth: [] }],
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
                  carrier: { type: 'string' },
                  trackingNumber: { type: 'string' },
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
                    shipment: { $ref: '#/components/schemas/Shipment' },
                  },
                },
              },
            },
          },
          400: { description: 'Validation error' },
          401: { description: 'Unauthorized' },
          500: { description: 'Server error' },
        },
      },
    },
    '/api/marketplace/listings': {
      get: {
        tags: ['Marketplace'],
        summary: 'Get all active listings',
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'number', default: 1 },
            description: 'Page number',
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'number', default: 10 },
            description: 'Items per page',
          },
          {
            name: 'search',
            in: 'query',
            schema: { type: 'string' },
            description: 'Search term for product name',
          },
          {
            name: 'category',
            in: 'query',
            schema: { type: 'string' },
            description: 'Product category filter',
          },
        ],
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
                    pagination: {
                      type: 'object',
                      properties: {
                        currentPage: { type: 'number' },
                        totalPages: { type: 'number' },
                        totalItems: { type: 'number' },
                      },
                    },
                  },
                },
              },
            },
          },
          500: { description: 'Server error' },
        },
      },
      post: {
        tags: ['Marketplace'],
        summary: 'Create a new listing',
        security: [{ bearerAuth: [] }],
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
                  description: { type: 'string' },
                  category: { type: 'string' },
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
    '/api/marketplace/search-suggestions': {
      get: {
        tags: ['Marketplace'],
        summary: 'Get search suggestions for products',
        parameters: [
          {
            name: 'q',
            in: 'query',
            required: true,
            schema: { type: 'string' },
            description: 'Search query',
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'number', default: 5 },
            description: 'Maximum number of suggestions',
          },
        ],
        responses: {
          200: {
            description: 'Search suggestions retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    suggestions: { type: 'array', items: { type: 'string' } },
                  },
                },
              },
            },
          },
          400: { description: 'Invalid query parameter' },
          500: { description: 'Server error' },
        },
      },
    },
    '/api/marketplace/orders': {
      post: {
        tags: ['Marketplace'],
        summary: 'Place an order',
        security: [{ bearerAuth: [] }],
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
                    order: { $ref: '#/components/schemas/Order' },
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
        security: [{ bearerAuth: [] }],
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
                    order: { $ref: '#/components/schemas/Order' },
                  },
                },
              },
            },
          },
          400: { description: 'Invalid status' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden - insufficient permissions' },
          404: { description: 'Order not found' },
          500: { description: 'Server error' },
        },
      },
    },
    '/api/marketplace/upload-image': {
      post: {
        tags: ['Marketplace'],
        summary: 'Upload product images to Cloudinary',
        security: [{ bearerAuth: [] }],
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
          400: { description: 'Invalid file format or size' },
          401: { description: 'Unauthorized' },
          500: { description: 'Upload failed' },
        },
      },
    },
    '/api/fintech/credit-score/{farmerId}': {
      get: {
        tags: ['Fintech'],
        summary: 'Retrieve a farmer credit score',
        security: [{ bearerAuth: [] }],
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
        security: [{ bearerAuth: [] }],
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
        security: [{ bearerAuth: [] }],
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
                    notifications: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Notification' },
                    },
                  },
                },
              },
            },
          },
          404: { description: 'User not found' },
        },
      },
    },
    '/api/verify/{batchId}': {
      get: {
        tags: ['Verification'],
        summary: 'Public QR code verification endpoint',
        description: 'Verify harvest batch provenance without authentication',
        parameters: [
          {
            name: 'batchId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Harvest batch ID to verify',
          },
        ],
        responses: {
          200: {
            description: 'QR code verified successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    message: { type: 'string' },
                    data: {
                      type: 'object',
                      properties: {
                        verified: { type: 'boolean' },
                        batchId: { type: 'string' },
                        harvest: {
                          type: 'object',
                          properties: {
                            cropType: { type: 'string' },
                            quantity: { type: 'number' },
                            date: { type: 'string', format: 'date-time' },
                            geoLocation: {
                              type: 'object',
                              properties: {
                                lat: { type: 'number' },
                                lng: { type: 'number' },
                              },
                            },
                          },
                        },
                        farmer: {
                          type: 'object',
                          properties: {
                            name: { type: 'string' },
                            location: {
                              type: 'object',
                              properties: {
                                lat: { type: 'number' },
                                lng: { type: 'number' },
                              },
                            },
                          },
                        },
                        verification: {
                          type: 'object',
                          properties: {
                            timestamp: { type: 'string', format: 'date-time' },
                            verifiedBy: { type: 'string' },
                            verificationUrl: { type: 'string' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          400: { description: 'Batch ID is required' },
          404: { description: 'Harvest batch not found' },
          500: { description: 'Verification failed' },
        },
      },
    },
    '/api/ai/crop-recommendations': {
      post: {
        tags: ['AI'],
        summary: 'Get AI-powered crop recommendations',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  location: { type: 'string' },
                  season: { type: 'string' },
                  soilType: { type: 'string' },
                  previousCrops: { type: 'array', items: { type: 'string' } },
                },
                required: ['location', 'season'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Crop recommendations generated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    recommendations: { type: 'array', items: { type: 'object' } },
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
    '/api/ai/yield-prediction': {
      post: {
        tags: ['AI'],
        summary: 'Get AI-powered yield prediction',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  cropType: { type: 'string' },
                  location: { type: 'string' },
                  season: { type: 'string' },
                  weatherData: { type: 'object' },
                },
                required: ['cropType', 'location', 'season'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Yield prediction generated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    prediction: { type: 'object' },
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
    '/api/ai/market-insights': {
      get: {
        tags: ['AI'],
        summary: 'Get AI-powered market insights',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Market insights retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    insights: { type: 'object' },
                  },
                },
              },
            },
          },
          500: { description: 'Server error' },
        },
      },
    },
    '/api/iot/sensors': {
      post: {
        tags: ['IoT'],
        summary: 'Register a new IoT sensor',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  sensorType: { type: 'string', enum: ['soil_moisture', 'temperature', 'humidity', 'ph', 'nutrient'] },
                  location: {
                    type: 'object',
                    properties: {
                      lat: { type: 'number' },
                      lng: { type: 'number' },
                    },
                  },
                },
                required: ['sensorType', 'location'],
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Sensor registered successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    sensor: { $ref: '#/components/schemas/IoTSensor' },
                  },
                },
              },
            },
          },
          400: { description: 'Validation error' },
          500: { description: 'Server error' },
        },
      },
      get: {
        tags: ['IoT'],
        summary: 'Get all sensors for authenticated farmer',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Sensors retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    sensors: { type: 'array', items: { $ref: '#/components/schemas/IoTSensor' } },
                  },
                },
              },
            },
          },
          500: { description: 'Server error' },
        },
      },
    },
    '/api/image-recognition/analyze': {
      post: {
        tags: ['Image Recognition'],
        summary: 'Analyze crop image for disease detection',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  image: { type: 'string', format: 'binary' },
                  cropType: { type: 'string' },
                },
                required: ['image', 'cropType'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Image analysis completed',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    analysis: { $ref: '#/components/schemas/CropAnalysis' },
                  },
                },
              },
            },
          },
          400: { description: 'Invalid image or crop type' },
          500: { description: 'Analysis failed' },
        },
      },
    },
    '/api/languages': {
      get: {
        tags: ['Languages'],
        summary: 'Get supported languages',
        responses: {
          200: {
            description: 'Supported languages retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    languages: { type: 'array', items: { type: 'object' } },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/languages/translations': {
      post: {
        tags: ['Languages'],
        summary: 'Get translations for specific keys',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  keys: { type: 'array', items: { type: 'string' } },
                  targetLanguage: { type: 'string' },
                },
                required: ['keys', 'targetLanguage'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Translations retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    translations: { type: 'object' },
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
    '/api/sync/offline-data': {
      post: {
        tags: ['Sync'],
        summary: 'Queue offline data for synchronization',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  dataType: { type: 'string' },
                  data: { type: 'object' },
                  timestamp: { type: 'string', format: 'date-time' },
                },
                required: ['dataType', 'data'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Data queued for sync',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    message: { type: 'string' },
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
    '/api/pwa/manifest': {
      get: {
        tags: ['PWA'],
        summary: 'Get PWA manifest file',
        responses: {
          200: {
            description: 'PWA manifest retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    short_name: { type: 'string' },
                    start_url: { type: 'string' },
                    display: { type: 'string' },
                    theme_color: { type: 'string' },
                    background_color: { type: 'string' },
                    icons: { type: 'array', items: { type: 'object' } },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/advanced-ml/sensors/{sensorId}/maintenance': {
      get: {
        tags: ['Advanced ML'],
        summary: 'Get predictive maintenance for IoT sensor',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'sensorId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Sensor ID',
          },
        ],
        responses: {
          200: {
            description: 'Predictive maintenance data retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    maintenance: { type: 'object' },
                  },
                },
              },
            },
          },
          404: { description: 'Sensor not found' },
          500: { description: 'Server error' },
        },
      },
    },
    '/api/advanced-ml/optimize/irrigation': {
      get: {
        tags: ['Advanced ML'],
        summary: 'Get irrigation optimization recommendations',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Irrigation optimization data retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    optimization: { type: 'object' },
                  },
                },
              },
            },
          },
          500: { description: 'Server error' },
        },
      },
    },
    '/api/ai/farming-insights': {
      get: {
        tags: ['AI'],
        summary: 'Get AI-powered farming insights',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Farming insights retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    insights: { type: 'object' },
                  },
                },
              },
            },
          },
          500: { description: 'Server error' },
        },
      },
    },
    '/api/ai/farming-recommendations': {
      get: {
        tags: ['AI'],
        summary: 'Get AI-powered farming recommendations',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Farming recommendations retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    recommendations: { type: 'object' },
                  },
                },
              },
            },
          },
          500: { description: 'Server error' },
        },
      },
    },
    '/api/ai/analytics-dashboard': {
      get: {
        tags: ['AI'],
        summary: 'Get AI analytics dashboard data',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Analytics dashboard data retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    dashboard: { type: 'object' },
                  },
                },
              },
            },
          },
          500: { description: 'Server error' },
        },
      },
    },
    '/api/ai/seasonal-calendar': {
      get: {
        tags: ['AI'],
        summary: 'Get AI-powered seasonal farming calendar',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Seasonal calendar retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    calendar: { type: 'object' },
                  },
                },
              },
            },
          },
          500: { description: 'Server error' },
        },
      },
    },
    '/api/ai/weather-prediction': {
      get: {
        tags: ['AI'],
        summary: 'Get AI-powered weather prediction',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Weather prediction retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    prediction: { type: 'object' },
                  },
                },
              },
            },
          },
          500: { description: 'Server error' },
        },
      },
    },
    '/api/ai/market-trends': {
      get: {
        tags: ['AI'],
        summary: 'Get AI-powered market trend analysis',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Market trends retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    trends: { type: 'object' },
                  },
                },
              },
            },
          },
          500: { description: 'Server error' },
        },
      },
    },
    '/api/ai/risk-assessment': {
      post: {
        tags: ['AI'],
        summary: 'Get AI-powered risk assessment',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  cropType: { type: 'string' },
                  location: { type: 'string' },
                  season: { type: 'string' },
                  riskFactors: { type: 'array', items: { type: 'string' } },
                },
                required: ['cropType', 'location', 'season'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Risk assessment completed',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    assessment: { type: 'object' },
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
    '/api/ai/predictive-insights': {
      post: {
        tags: ['AI'],
        summary: 'Get comprehensive AI predictive insights',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  farmerId: { type: 'string' },
                  cropType: { type: 'string' },
                  location: { type: 'string' },
                  season: { type: 'string' },
                },
                required: ['farmerId', 'cropType', 'location', 'season'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Predictive insights generated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    insights: { type: 'object' },
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
    '/api/iot/sensors/{sensorId}': {
      get: {
        tags: ['IoT'],
        summary: 'Get specific sensor details',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'sensorId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Sensor ID',
          },
        ],
        responses: {
          200: {
            description: 'Sensor details retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    sensor: { $ref: '#/components/schemas/IoTSensor' },
                  },
                },
              },
            },
          },
          404: { description: 'Sensor not found' },
          500: { description: 'Server error' },
        },
      },
      put: {
        tags: ['IoT'],
        summary: 'Update sensor data',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'sensorId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Sensor ID',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  readings: { type: 'object' },
                  status: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Sensor data updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    sensor: { $ref: '#/components/schemas/IoTSensor' },
                  },
                },
              },
            },
          },
          404: { description: 'Sensor not found' },
          500: { description: 'Server error' },
        },
      },
    },
    '/api/image-recognition/analyses': {
      get: {
        tags: ['Image Recognition'],
        summary: 'Get all crop analyses for authenticated farmer',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Crop analyses retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    analyses: { type: 'array', items: { $ref: '#/components/schemas/CropAnalysis' } },
                  },
                },
              },
            },
          },
          500: { description: 'Server error' },
        },
      },
    },
    '/api/sync/sync-user': {
      post: {
        tags: ['Sync'],
        summary: 'Sync user offline data',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'User data synced successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    message: { type: 'string' },
                    syncedItems: { type: 'number' },
                  },
                },
              },
            },
          },
          500: { description: 'Sync failed' },
        },
      },
    },
    '/api/sync/status/{userId}': {
      get: {
        tags: ['Sync'],
        summary: 'Get sync status for a user',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'userId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'User ID',
          },
        ],
        responses: {
          200: {
            description: 'Sync status retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    syncStatus: { type: 'object' },
                  },
                },
              },
            },
          },
          404: { description: 'User not found' },
          500: { description: 'Server error' },
        },
      },
    },
    '/api/iot/sensors/{sensorId}/readings': {
      get: {
        tags: ['IoT'],
        summary: 'Get sensor readings',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'sensorId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Sensor ID',
          },
        ],
        responses: {
          200: {
            description: 'Sensor readings retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    readings: { type: 'array', items: { type: 'object' } },
                  },
                },
              },
            },
          },
          404: { description: 'Sensor not found' },
          500: { description: 'Server error' },
        },
      },
    },
    '/api/iot/sensors/{sensorId}/alerts': {
      get: {
        tags: ['IoT'],
        summary: 'Get sensor alerts',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'sensorId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Sensor ID',
          },
        ],
        responses: {
          200: {
            description: 'Sensor alerts retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    alerts: { type: 'array', items: { type: 'object' } },
                  },
                },
              },
            },
          },
          404: { description: 'Sensor not found' },
          500: { description: 'Server error' },
        },
      },
    },
    '/api/iot/sensors/health/summary': {
      get: {
        tags: ['IoT'],
        summary: 'Get sensor health summary',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Sensor health summary retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    summary: { type: 'object' },
                  },
                },
              },
            },
          },
          500: { description: 'Server error' },
        },
      },
    },
    '/api/advanced-ml/sensors/{sensorId}/anomalies': {
      get: {
        tags: ['Advanced ML'],
        summary: 'Detect anomalies in sensor data',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'sensorId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Sensor ID',
          },
        ],
        responses: {
          200: {
            description: 'Anomalies detected',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    anomalies: { type: 'array', items: { type: 'object' } },
                  },
                },
              },
            },
          },
          404: { description: 'Sensor not found' },
          500: { description: 'Server error' },
        },
      },
    },
    '/api/advanced-ml/optimize/fertilizer': {
      get: {
        tags: ['Advanced ML'],
        summary: 'Get fertilizer optimization recommendations',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Fertilizer optimization data retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    optimization: { type: 'object' },
                  },
                },
              },
            },
          },
          500: { description: 'Server error' },
        },
      },
    },
    '/api/advanced-ml/optimize/harvest': {
      get: {
        tags: ['Advanced ML'],
        summary: 'Get harvest optimization recommendations',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Harvest optimization data retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    optimization: { type: 'object' },
                  },
                },
              },
            },
          },
          500: { description: 'Server error' },
        },
      },
    },
    '/api/advanced-ml/insights/sensor-health': {
      get: {
        tags: ['Advanced ML'],
        summary: 'Get sensor health insights',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Sensor health insights retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    insights: { type: 'object' },
                  },
                },
              },
            },
          },
          500: { description: 'Server error' },
        },
      },
    },
    '/api/advanced-ml/insights/efficiency-score': {
      get: {
        tags: ['Advanced ML'],
        summary: 'Get farming efficiency score',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Efficiency score retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    score: { type: 'object' },
                  },
                },
              },
            },
          },
          500: { description: 'Server error' },
        },
      },
    },
    '/api/advanced-ml/models/performance': {
      get: {
        tags: ['Advanced ML'],
        summary: 'Get ML model performance metrics',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Model performance metrics retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    metrics: { type: 'object' },
                  },
                },
              },
            },
          },
          500: { description: 'Server error' },
        },
      },
    },
    '/api/image-recognition/analyses/{analysisId}': {
      get: {
        tags: ['Image Recognition'],
        summary: 'Get specific crop analysis',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'analysisId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Analysis ID',
          },
        ],
        responses: {
          200: {
            description: 'Crop analysis retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    analysis: { $ref: '#/components/schemas/CropAnalysis' },
                  },
                },
              },
            },
          },
          404: { description: 'Analysis not found' },
          500: { description: 'Server error' },
        },
      },
    },
    '/api/image-recognition/analyses/crop/{cropType}': {
      get: {
        tags: ['Image Recognition'],
        summary: 'Get analyses by crop type',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'cropType',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Crop type',
          },
        ],
        responses: {
          200: {
            description: 'Crop analyses retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    analyses: { type: 'array', items: { $ref: '#/components/schemas/CropAnalysis' } },
                  },
                },
              },
            },
          },
          500: { description: 'Server error' },
        },
      },
    },
    '/api/image-recognition/analyses/risk/high': {
      get: {
        tags: ['Image Recognition'],
        summary: 'Get high-risk analyses',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'High-risk analyses retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    analyses: { type: 'array', items: { $ref: '#/components/schemas/CropAnalysis' } },
                  },
                },
              },
            },
          },
          500: { description: 'Server error' },
        },
      },
    },
    '/api/languages/translations/{language}': {
      get: {
        tags: ['Languages'],
        summary: 'Get all translations for a specific language',
        parameters: [
          {
            name: 'language',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Language code',
          },
        ],
        responses: {
          200: {
            description: 'Translations retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    translations: { type: 'object' },
                  },
                },
              },
            },
          },
          400: { description: 'Invalid language' },
          500: { description: 'Server error' },
        },
      },
    },
    '/api/languages/{language}': {
      get: {
        tags: ['Languages'],
        summary: 'Get language information',
        parameters: [
          {
            name: 'language',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Language code',
          },
        ],
        responses: {
          200: {
            description: 'Language information retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    language: { type: 'object' },
                  },
                },
              },
            },
          },
          400: { description: 'Invalid language' },
          500: { description: 'Server error' },
        },
      },
    },
    '/api/languages/preference': {
      put: {
        tags: ['Languages'],
        summary: 'Update user language preference',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  language: { type: 'string' },
                },
                required: ['language'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Language preference updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    message: { type: 'string' },
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
    '/api/languages/stats': {
      get: {
        tags: ['Languages'],
        summary: 'Get language statistics',
        responses: {
          200: {
            description: 'Language statistics retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    stats: { type: 'object' },
                  },
                },
              },
            },
          },
          500: { description: 'Server error' },
        },
      },
    },
    '/api/sync/force-sync': {
      post: {
        tags: ['Sync'],
        summary: 'Force sync for specific data',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  dataType: { type: 'string' },
                  dataIds: { type: 'array', items: { type: 'string' } },
                },
                required: ['dataType', 'dataIds'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Force sync completed',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    message: { type: 'string' },
                    syncedItems: { type: 'number' },
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
    '/api/sync/history/{userId}': {
      get: {
        tags: ['Sync'],
        summary: 'Get sync history for a user',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'userId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'User ID',
          },
        ],
        responses: {
          200: {
            description: 'Sync history retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    history: { type: 'array', items: { type: 'object' } },
                  },
                },
              },
            },
          },
          404: { description: 'User not found' },
          500: { description: 'Server error' },
        },
      },
    },
    '/api/sync/stats': {
      get: {
        tags: ['Sync'],
        summary: 'Get sync statistics (admin only)',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Sync statistics retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    stats: { type: 'object' },
                  },
                },
              },
            },
          },
          500: { description: 'Server error' },
        },
      },
    },
    '/api/pwa/service-worker': {
      get: {
        tags: ['PWA'],
        summary: 'Get service worker script',
        responses: {
          200: {
            description: 'Service worker script retrieved',
            content: {
              'application/javascript': {
                schema: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
    '/api/pwa/offline': {
      get: {
        tags: ['PWA'],
        summary: 'Get offline page',
        responses: {
          200: {
            description: 'Offline page retrieved',
            content: {
              'text/html': {
                schema: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
    '/api/pwa/install': {
      get: {
        tags: ['PWA'],
        summary: 'Get installation instructions',
        responses: {
          200: {
            description: 'Installation instructions retrieved',
            content: {
              'text/html': {
                schema: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
    '/api/websocket/status': {
      get: {
        tags: ['WebSocket'],
        summary: 'Get WebSocket connection status',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'WebSocket status retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    data: {
                      type: 'object',
                      properties: {
                        connectedClients: { type: 'number' },
                        websocketEnabled: { type: 'boolean' }
                      }
                    }
                  }
                }
              }
            }
          },
          401: { description: 'Unauthorized' }
        }
      }
    },
    '/api/websocket/notify-user': {
      post: {
        tags: ['WebSocket'],
        summary: 'Send real-time notification to specific user',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  userId: { type: 'string' },
                  event: { type: 'string' },
                  data: { type: 'object' }
                },
                required: ['userId', 'event']
              }
            }
          }
        },
        responses: {
          200: { description: 'Notification sent successfully' },
          400: { description: 'Bad request' },
          401: { description: 'Unauthorized' }
        }
      }
    },
    '/api/websocket/notify-partner-network': {
      post: {
        tags: ['WebSocket'],
        summary: 'Send real-time notification to partner network',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  partnerId: { type: 'string' },
                  event: { type: 'string' },
                  data: { type: 'object' }
                },
                required: ['partnerId', 'event']
              }
            }
          }
        },
        responses: {
          200: { description: 'Notification sent successfully' },
          400: { description: 'Bad request' },
          401: { description: 'Unauthorized' }
        }
      }
    },
  },
};

export default swaggerSpec;
