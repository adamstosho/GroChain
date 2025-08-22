const axios = require('axios');

async function testHarvestFlow() {
  try {
    console.log('🧪 Testing Harvest Creation and Retrieval Flow...');
    
    // Step 1: Login to get a token
    console.log('\n1️⃣ Logging in...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'farmer@example.com',
      password: 'password123'
    });
    
    if (loginResponse.data.status !== 'success') {
      throw new Error('Login failed');
    }
    
    const token = loginResponse.data.accessToken;
    console.log('✅ Login successful, token received');
    
    // Step 2: Create a harvest
    console.log('\n2️⃣ Creating harvest...');
    const harvestData = {
      cropType: 'Test Corn',
      quantity: 100,
      date: new Date().toISOString(),
      geoLocation: { lat: 9.0765, lng: 7.3986 }
    };
    
    const createResponse = await axios.post('http://localhost:5000/api/harvests', harvestData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (createResponse.data.status !== 'success') {
      throw new Error('Harvest creation failed');
    }
    
    const harvest = createResponse.data.harvest;
    console.log('✅ Harvest created successfully');
    console.log('   Batch ID:', harvest.batchId);
    console.log('   Crop Type:', harvest.cropType);
    console.log('   Farmer ID:', harvest.farmer);
    
    // Step 3: Retrieve harvests
    console.log('\n3️⃣ Retrieving harvests...');
    const retrieveResponse = await axios.get('http://localhost:5000/api/harvests', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (retrieveResponse.data.status !== 'success') {
      throw new Error('Harvest retrieval failed');
    }
    
    const harvests = retrieveResponse.data.harvests;
    console.log('✅ Harvests retrieved successfully');
    console.log('   Total harvests:', harvests.length);
    console.log('   Harvests:', harvests.map(h => ({
      id: h._id,
      batchId: h.batchId,
      cropType: h.cropType,
      farmer: h.farmer
    })));
    
    // Step 4: Verify the created harvest is in the list
    const foundHarvest = harvests.find(h => h.batchId === harvest.batchId);
    if (foundHarvest) {
      console.log('✅ Created harvest found in retrieved list');
    } else {
      console.log('❌ Created harvest NOT found in retrieved list');
      console.log('   This indicates a data isolation issue');
    }
    
    console.log('\n🎉 Harvest flow test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Wait for server to start
setTimeout(() => {
  testHarvestFlow();
}, 3000);


