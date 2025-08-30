const axios = require('axios');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

const checkHealth = async () => {
  console.log('🏥 GroChain Backend Health Check');
  console.log(`📍 Checking: ${BASE_URL}`);
  console.log('='.repeat(50));
  
  try {
    // Check root endpoint
    console.log('\n🔍 Checking root endpoint...');
    const rootResponse = await axios.get(`${BASE_URL}/`, { timeout: 5000 });
    console.log(`✅ Root endpoint: ${rootResponse.status} - ${rootResponse.data.message}`);
    
    // Check health endpoint
    console.log('\n🔍 Checking health endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/api/health`, { timeout: 5000 });
    console.log(`✅ Health endpoint: ${healthResponse.status} - ${healthResponse.data.message}`);
    console.log(`   Environment: ${healthResponse.data.environment}`);
    console.log(`   Timestamp: ${healthResponse.data.timestamp}`);
    
    // Check metrics endpoint
    console.log('\n🔍 Checking metrics endpoint...');
    try {
      const metricsResponse = await axios.get(`${BASE_URL}/metrics`, { timeout: 5000 });
      console.log(`✅ Metrics endpoint: ${metricsResponse.status} - Prometheus metrics available`);
    } catch (error) {
      console.log(`⚠️ Metrics endpoint: ${error.response?.status || 'unavailable'} - ${error.message}`);
    }
    
    // Check API routes
    console.log('\n🔍 Checking API routes...');
    const routes = [
      { path: '/api/auth', test: '/api/auth/register', method: 'POST' },
      { path: '/api/users', test: '/api/users', method: 'GET' },
      { path: '/api/partners', test: '/api/partners', method: 'GET' },
      { path: '/api/farmers', test: '/api/farmers', method: 'GET' },
      { path: '/api/harvests', test: '/api/harvests', method: 'GET' },
      { path: '/api/marketplace', test: '/api/marketplace/listings', method: 'GET' },
      { path: '/api/fintech', test: '/api/fintech/loan-stats', method: 'GET' },
      { path: '/api/weather', test: '/api/weather/current/Lagos', method: 'GET' },
      { path: '/api/analytics', test: '/api/analytics/dashboard', method: 'GET' },
      { path: '/api/notifications', test: '/api/notifications', method: 'GET' },
      { path: '/api/payments', test: '/api/payments', method: 'GET' },
      { path: '/api/qr-codes', test: '/api/qr-codes', method: 'GET' },
      { path: '/api/verify', test: '/api/verify/test-batch-123', method: 'GET' },
      { path: '/api/referrals', test: '/api/referrals', method: 'GET' },
      { path: '/api/shipments', test: '/api/shipments', method: 'GET' },
      { path: '/api/export-import', test: '/api/export-import/formats', method: 'GET' }
    ];
    
    for (const route of routes) {
      try {
        const config = {
          method: route.method || 'GET',
          url: `${BASE_URL}${route.test}`,
          timeout: 3000,
          validateStatus: () => true // Accept any status code
        };
        
        // Add data for POST requests
        if (route.method === 'POST') {
          config.data = { test: true };
        }
        
        const response = await axios(config);
        
        if (response.status === 200) {
          console.log(`✅ ${route.path}: ${response.status} - Accessible`);
        } else if (response.status === 401) {
          console.log(`🔒 ${route.path}: ${response.status} - Requires authentication`);
        } else if (response.status === 404) {
          console.log(`❌ ${route.path}: ${response.status} - Not found`);
        } else {
          console.log(`⚠️ ${route.path}: ${response.status} - ${response.statusText}`);
        }
      } catch (error) {
        console.log(`❌ ${route.path}: Error - ${error.message}`);
      }
    }
    
    console.log('\n🎉 Health check completed successfully!');
    console.log('✅ Backend is running and accessible');
    
  } catch (error) {
    console.error('\n❌ Health check failed!');
    console.error(`Error: ${error.message}`);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Possible solutions:');
      console.error('   1. Make sure the backend server is running');
      console.error('   2. Check if the port is correct (default: 5000)');
      console.error('   3. Verify no firewall is blocking the connection');
    } else if (error.code === 'ENOTFOUND') {
      console.error('\n💡 Possible solutions:');
      console.error('   1. Check if the BASE_URL is correct');
      console.error('   2. Verify the backend server is accessible');
    }
    
    process.exit(1);
  }
};

// Handle command line arguments
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
GroChain Backend Health Check

Usage: node test-health-check.js [options]

Options:
  --base-url <url>    Base URL for checking (default: http://localhost:5000)
  --help, -h          Show this help message

Environment Variables:
  BASE_URL            Base URL for checking

Examples:
  node test-health-check.js
  node test-health-check.js --base-url http://localhost:3000
  BASE_URL=http://localhost:3000 node test-health-check.js
    `);
    process.exit(0);
  }
  
  const baseUrlIndex = args.indexOf('--base-url');
  if (baseUrlIndex !== -1 && args[baseUrlIndex + 1]) {
    process.env.BASE_URL = args[baseUrlIndex + 1];
  }
  
  checkHealth();
}

module.exports = { checkHealth };
