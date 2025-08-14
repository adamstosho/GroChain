import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Product } from '../src/models/product.model';
import { Listing } from '../src/models/listing.model';

// Load environment variables
dotenv.config();

// Sample crop data for AI recommendations
const sampleCrops = [
  {
    cropName: 'Cassava',
    category: 'tubers',
    variety: 'TMS 419',
    description: 'High-yielding cassava variety suitable for both food and industrial use',
    basePrice: 150,
    unit: 'kg',
    seasonality: ['all-year'],
    region: ['Nigeria', 'South'],
    qualityGrade: 'premium',
    organic: false,
    certifications: ['GAP'],
    storageLife: 7,
    nutritionalValue: {
      calories: 160,
      protein: 1.4,
      carbs: 38,
      fiber: 1.8,
      vitamins: ['Vitamin C', 'Vitamin B6'],
      minerals: ['Potassium', 'Magnesium']
    },
    farmingPractices: ['Intercropping', 'Crop rotation'],
    pestResistance: ['Cassava mealybug', 'Green mite'],
    diseaseResistance: ['Cassava mosaic disease'],
    yieldPotential: 25000,
    maturityDays: 270,
    waterRequirement: 'medium',
    soilType: ['Sandy loam', 'Clay loam'],
    climateZone: ['Tropical', 'Subtropical'],
    marketDemand: 'high',
    exportPotential: true,
    processingRequirements: ['Peeling', 'Washing', 'Drying'],
    packagingOptions: ['50kg bags', '25kg bags'],
    transportationRequirements: ['Ventilated containers']
  },
  {
    cropName: 'Yam',
    category: 'tubers',
    variety: 'White Yam',
    description: 'Traditional yam variety with excellent taste and texture',
    basePrice: 300,
    unit: 'kg',
    seasonality: ['rainy'],
    region: ['Nigeria', 'North'],
    qualityGrade: 'standard',
    organic: true,
    certifications: ['Organic'],
    storageLife: 180,
    nutritionalValue: {
      calories: 118,
      protein: 1.5,
      carbs: 28,
      fiber: 4.1,
      vitamins: ['Vitamin C', 'Vitamin B6'],
      minerals: ['Potassium', 'Manganese']
    },
    farmingPractices: ['Staking', 'Mulching'],
    pestResistance: ['Yam beetle'],
    diseaseResistance: ['Yam mosaic virus'],
    yieldPotential: 15000,
    maturityDays: 240,
    waterRequirement: 'high',
    soilType: ['Loamy soil', 'Well-drained'],
    climateZone: ['Tropical'],
    marketDemand: 'high',
    exportPotential: true,
    processingRequirements: ['Sorting', 'Grading'],
    packagingOptions: ['30kg baskets', '20kg bags'],
    transportationRequirements: ['Cool storage']
  },
  {
    cropName: 'Maize',
    category: 'grains',
    variety: 'Hybrid Maize',
    description: 'High-yielding hybrid maize for both human consumption and animal feed',
    basePrice: 200,
    unit: 'kg',
    seasonality: ['rainy'],
    region: ['Nigeria', 'North'],
    qualityGrade: 'standard',
    organic: false,
    certifications: ['GAP'],
    storageLife: 365,
    nutritionalValue: {
      calories: 86,
      protein: 3.2,
      carbs: 19,
      fiber: 2.7,
      vitamins: ['Vitamin B1', 'Vitamin B5'],
      minerals: ['Phosphorus', 'Zinc']
    },
    farmingPractices: ['Row planting', 'Fertilization'],
    pestResistance: ['Fall armyworm', 'Stem borer'],
    diseaseResistance: ['Maize streak virus'],
    yieldPotential: 3000,
    maturityDays: 120,
    waterRequirement: 'medium',
    soilType: ['Sandy loam', 'Clay'],
    climateZone: ['Tropical', 'Temperate'],
    marketDemand: 'medium',
    exportPotential: false,
    processingRequirements: ['Shelling', 'Drying'],
    packagingOptions: ['100kg bags', '50kg bags'],
    transportationRequirements: ['Dry storage']
  },
  {
    cropName: 'Rice',
    category: 'grains',
    variety: 'Ofada Rice',
    description: 'Local aromatic rice variety with unique taste and aroma',
    basePrice: 400,
    unit: 'kg',
    seasonality: ['rainy'],
    region: ['Nigeria', 'South'],
    qualityGrade: 'premium',
    organic: true,
    certifications: ['Organic', 'Local'],
    storageLife: 730,
    nutritionalValue: {
      calories: 130,
      protein: 2.7,
      carbs: 28,
      fiber: 0.4,
      vitamins: ['Vitamin B1', 'Vitamin B3'],
      minerals: ['Iron', 'Selenium']
    },
    farmingPractices: ['Paddy cultivation', 'Water management'],
    pestResistance: ['Rice weevil', 'Stem borer'],
    diseaseResistance: ['Rice blast'],
    yieldPotential: 4000,
    maturityDays: 150,
    waterRequirement: 'high',
    soilType: ['Clay soil', 'Paddy soil'],
    climateZone: ['Tropical'],
    marketDemand: 'high',
    exportPotential: true,
    processingRequirements: ['Milling', 'Polishing'],
    packagingOptions: ['25kg bags', '10kg bags'],
    transportationRequirements: ['Moisture control']
  },
  {
    cropName: 'Tomatoes',
    category: 'vegetables',
    variety: 'Roma Tomatoes',
    description: 'Plum tomatoes perfect for processing and fresh consumption',
    basePrice: 250,
    unit: 'kg',
    seasonality: ['dry'],
    region: ['Nigeria', 'North'],
    qualityGrade: 'standard',
    organic: false,
    certifications: ['GAP'],
    storageLife: 14,
    nutritionalValue: {
      calories: 18,
      protein: 0.9,
      carbs: 3.9,
      fiber: 1.2,
      vitamins: ['Vitamin C', 'Vitamin K'],
      minerals: ['Potassium', 'Lycopene']
    },
    farmingPractices: ['Staking', 'Pruning'],
    pestResistance: ['Tomato fruit worm'],
    diseaseResistance: ['Early blight'],
    yieldPotential: 25000,
    maturityDays: 75,
    waterRequirement: 'medium',
    soilType: ['Sandy loam', 'Well-drained'],
    climateZone: ['Tropical', 'Subtropical'],
    marketDemand: 'high',
    exportPotential: false,
    processingRequirements: ['Sorting', 'Grading'],
    packagingOptions: ['15kg crates', '10kg baskets'],
    transportationRequirements: ['Refrigerated']
  }
];

// Sample listing data
const sampleListings = [
  {
    product: 'Cassava',
    price: 180,
    quantity: 500,
    farmer: '507f1f77bcf86cd799439011', // Placeholder ObjectId
    partner: '507f1f77bcf86cd799439012', // Placeholder ObjectId
    images: [],
    status: 'active'
  },
  {
    product: 'Yam',
    price: 350,
    quantity: 300,
    farmer: '507f1f77bcf86cd799439011',
    partner: '507f1f77bcf86cd799439012',
    images: [],
    status: 'active'
  },
  {
    product: 'Maize',
    price: 220,
    quantity: 400,
    farmer: '507f1f77bcf86cd799439011',
    partner: '507f1f77bcf86cd799439012',
    images: [],
    status: 'active'
  },
  {
    product: 'Rice',
    price: 450,
    quantity: 200,
    farmer: '507f1f77bcf86cd799439011',
    partner: '507f1f77bcf86cd799439012',
    images: [],
    status: 'active'
  },
  {
    product: 'Tomatoes',
    price: 280,
    quantity: 150,
    farmer: '507f1f77bcf86cd799439011',
    partner: '507f1f77bcf86cd799439012',
    images: [],
    status: 'active'
  }
];

async function seedAIData() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/grochain';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Product.deleteMany({});
    await Listing.deleteMany({});
    console.log('Cleared existing AI data');

    // Insert sample crops
    const createdProducts = await Product.insertMany(sampleCrops);
    console.log(`Created ${createdProducts.length} sample crops`);

    // Insert sample listings
    const createdListings = await Listing.insertMany(sampleListings);
    console.log(`Created ${createdListings.length} sample listings`);

    console.log('AI data seeding completed successfully!');
    console.log('\nSample crops created:');
    createdProducts.forEach(product => {
      console.log(`- ${product.cropName} (${product.category}) - ₦${product.basePrice}/${product.unit}`);
    });

    console.log('\nSample listings created:');
    createdListings.forEach(listing => {
      console.log(`- ${listing.product} - ₦${listing.price} for ${listing.quantity}kg`);
    });

  } catch (error) {
    console.error('Error seeding AI data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeding function
if (require.main === module) {
  seedAIData();
}

export default seedAIData;
