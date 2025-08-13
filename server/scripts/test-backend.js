#!/usr/bin/env node

/**
 * Simple backend test script
 * Run with: node scripts/test-backend.js
 */

const http = require('http');

const testEndpoints = [
  { path: '/health', method: 'GET', expectedStatus: 200 },
  { path: '/api/docs', method: 'GET', expectedStatus: 200 },
];

function testEndpoint(hostname, port, endpoint) {
  return new Promise((resolve) => {
    const options = {
      hostname,
      port,
      path: endpoint.path,
      method: endpoint.method,
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        const success = res.statusCode === endpoint.expectedStatus;
        console.log(
          `${success ? '✅' : '❌'} ${endpoint.method} ${endpoint.path} - ${res.statusCode}`
        );
        if (!success) {
          console.log(`   Expected: ${endpoint.expectedStatus}, Got: ${res.statusCode}`);
        }
        resolve(success);
      });
    });

    req.on('error', (err) => {
      console.log(`❌ ${endpoint.method} ${endpoint.path} - Error: ${err.message}`);
      resolve(false);
    });

    req.setTimeout(5000, () => {
      console.log(`❌ ${endpoint.method} ${endpoint.path} - Timeout`);
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

async function runTests() {
  const hostname = 'localhost';
  const port = process.env.PORT || 5000;

  console.log(`🧪 Testing GroChain Backend at ${hostname}:${port}\n`);

  let passed = 0;
  let total = testEndpoints.length;

  for (const endpoint of testEndpoints) {
    const success = await testEndpoint(hostname, port, endpoint);
    if (success) passed++;
  }

  console.log(`\n📊 Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! Backend is working correctly.');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Check the backend logs.');
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };
