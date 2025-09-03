// Test script to verify cart functionality
const testCartFunctionality = () => {
  console.log('🧪 Testing Add to Cart Functionality...\n');

  // Simulate the cart item format that gets passed from products page
  const mockCartItem = {
    id: "test-product-123",
    listingId: "test-product-123",
    cropName: "Test Cassava",
    quantity: 1,
    unit: "kg",
    price: 2500,
    total: 2500,
    farmer: "Test Farmer",
    location: "Test Location",
    image: "/placeholder.svg",
    availableQuantity: 100
  };

  console.log('📦 Mock Cart Item:', JSON.stringify(mockCartItem, null, 2));

  // Test the data transformation logic from addToCart function
  const itemToAdd = mockCartItem.id ? mockCartItem : {
    id: mockCartItem._id || mockCartItem.id,
    listingId: mockCartItem._id || mockCartItem.listingId || mockCartItem.id,
    cropName: mockCartItem.cropName || mockCartItem.name,
    quantity: 1 || mockCartItem.quantity || 1,
    unit: mockCartItem.unit,
    price: mockCartItem.price || mockCartItem.basePrice,
    total: (mockCartItem.price || mockCartItem.basePrice) * (1 || mockCartItem.quantity || 1),
    farmer: mockCartItem.farmer || 'Unknown Farmer',
    location: mockCartItem.location,
    image: mockCartItem.image || "/placeholder.svg",
    availableQuantity: mockCartItem.availableQuantity || 0
  };

  console.log('🔄 Transformed Item:', JSON.stringify(itemToAdd, null, 2));

  // Test the image handling logic
  const imageTest = (mockCartItem.images && mockCartItem.images.length > 0)
    ? mockCartItem.images[0]
    : "/placeholder.svg";
  console.log('🖼️  Image Handling Result:', imageTest);

  // Test the farmer handling logic
  const farmerTest = mockCartItem.farmer?.name || 'Unknown Farmer';
  console.log('👨‍🌾 Farmer Handling Result:', farmerTest);

  console.log('\n✅ Cart functionality test completed!');
  console.log('If you still get errors, check that the product data structure matches the expected format.');
}

// Run the test
testCartFunctionality();

