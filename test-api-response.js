// Simple script to test the API response
async function testAPI() {
  try {
    console.log('🧪 Testing Marketplace API...\n');

    const response = await fetch('http://localhost:5000/api/marketplace/listings?page=1&limit=10');
    const data = await response.json();

    console.log('📊 API Response Status:', response.status);

    if (data.status === 'success' && data.data?.listings) {
      console.log('\n✅ PRODUCTS FOUND!');
      console.log(`📦 Total products: ${data.data.listings.length}`);
      console.log(`📄 Pagination: ${data.data.pagination?.currentPage || 1} of ${data.data.pagination?.totalPages || 1}`);

      data.data.listings.forEach((product, index) => {
        console.log(`\n--- 🥕 Product ${index + 1} ---`);
        console.log(`🆔 ID: ${product._id}`);
        console.log(`🌾 Name: ${product.cropName}`);
        console.log(`🏷️  Category: ${product.category}`);
        console.log(`💰 Price: ₦${product.basePrice}/${product.unit}`);
        console.log(`📊 Status: ${product.status}`);
        console.log(`👨‍🌾 Farmer: ${product.farmer?.name || 'Unknown'}`);
        console.log(`📍 Location: ${product.farmer?.location || 'Unknown'}`);
        console.log(`📝 Description: ${product.description?.substring(0, 50)}...`);
        console.log(`⭐ Rating: ${product.rating || 'N/A'}`);
        console.log(`🖼️  Images: ${product.images?.length || 0} images`);
      });

      console.log('\n🎉 Marketplace API is working correctly!');
      console.log('The farmer\'s products should now be visible in the buyer dashboard.');

    } else {
      console.log('❌ No products found or API error');
      console.log('Response:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
}

testAPI();
