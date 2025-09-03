// Test script to verify cart persistence functionality
const testCartPersistence = () => {
  console.log('🧪 Testing Cart Persistence...\n');

  const CART_STORAGE_KEY = 'grochain-buyer-cart';

  // Simulate cart data
  const mockCart = [
    {
      id: "test-product-123",
      listingId: "test-product-123",
      cropName: "Test Cassava",
      quantity: 2,
      unit: "kg",
      price: 2500,
      total: 5000,
      farmer: "Test Farmer",
      location: "Test Location",
      image: "/placeholder.svg",
      availableQuantity: 100
    },
    {
      id: "test-product-456",
      listingId: "test-product-456",
      cropName: "Test Maize",
      quantity: 1,
      unit: "kg",
      price: 3000,
      total: 3000,
      farmer: "Another Farmer",
      location: "Another Location",
      image: "/placeholder.svg",
      availableQuantity: 50
    }
  ];

  console.log('📦 Mock Cart Data:', JSON.stringify(mockCart, null, 2));

  // Test saving to localStorage
  console.log('\n💾 Testing localStorage save...');
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(mockCart));
    console.log('✅ Successfully saved cart to localStorage');
  } catch (error) {
    console.log('❌ Failed to save cart to localStorage:', error.message);
  }

  // Test loading from localStorage
  console.log('\n📖 Testing localStorage load...');
  try {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (storedCart) {
      const parsedCart = JSON.parse(storedCart);
      console.log('✅ Successfully loaded cart from localStorage');
      console.log('📦 Loaded Cart:', JSON.stringify(parsedCart, null, 2));

      // Verify data integrity
      const isDataIntact = JSON.stringify(mockCart) === JSON.stringify(parsedCart);
      console.log(`🔍 Data Integrity Check: ${isDataIntact ? '✅ PASS' : '❌ FAIL'}`);
    } else {
      console.log('❌ No cart data found in localStorage');
    }
  } catch (error) {
    console.log('❌ Failed to load cart from localStorage:', error.message);
  }

  // Test clearing cart
  console.log('\n🗑️  Testing cart clear...');
  try {
    localStorage.removeItem(CART_STORAGE_KEY);
    const clearedCart = localStorage.getItem(CART_STORAGE_KEY);
    console.log(`🗑️  Cart cleared: ${clearedCart === null ? '✅ SUCCESS' : '❌ FAILED'}`);
  } catch (error) {
    console.log('❌ Failed to clear cart from localStorage:', error.message);
  }

  console.log('\n🎉 Cart Persistence Test Complete!');
  console.log('=============================================');
  console.log('Expected Results:');
  console.log('✅ Save: Cart data should be stored in localStorage');
  console.log('✅ Load: Cart data should be retrieved from localStorage');
  console.log('✅ Clear: Cart data should be removed from localStorage');
  console.log('✅ Persistence: Cart should survive page refresh');
}

// Run the test
testCartPersistence();

