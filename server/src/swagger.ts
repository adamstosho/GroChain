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
  },
};

export default swaggerSpec;
