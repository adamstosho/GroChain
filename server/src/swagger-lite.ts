const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'GroChain API',
    version: '1.0.0',
    description: 'Temporary lightweight Swagger spec to allow server to run while full spec is being reconciled.'
  },
  servers: [
    { url: 'http://localhost:5000', description: 'Local' }
  ],
  paths: {
    '/health': {
      get: {
        tags: ['System'],
        summary: 'Health check',
        responses: { 200: { description: 'OK' } }
      }
    }
  }
};

export default swaggerSpec;


