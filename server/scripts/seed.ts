import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../src/models/user.model';
import { Partner } from '../src/models/partner.model';
import { Harvest } from '../src/models/harvest.model';
import { Listing } from '../src/models/listing.model';
import dotenv from 'dotenv';

dotenv.config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/grochain';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Partner.deleteMany({});
    await Harvest.deleteMany({});
    await Listing.deleteMany({});
    console.log('Cleared existing data');

    // Create sample users
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const users = await User.create([
      {
        name: 'John Farmer',
        email: 'john@example.com',
        phone: '+2348012345678',
        password: hashedPassword,
        role: 'farmer',
        status: 'active'
      },
      {
        name: 'Sarah Partner',
        email: 'sarah@example.com',
        phone: '+2348023456789',
        password: hashedPassword,
        role: 'partner',
        status: 'active'
      },
      {
        name: 'Mike Aggregator',
        email: 'mike@example.com',
        phone: '+2348034567890',
        password: hashedPassword,
        role: 'aggregator',
        status: 'active'
      },
      {
        name: 'Admin User',
        email: 'admin@grochain.com',
        phone: '+2348045678901',
        password: hashedPassword,
        role: 'admin',
        status: 'active'
      },
      {
        name: 'Buyer User',
        email: 'buyer@example.com',
        phone: '+2348056789012',
        password: hashedPassword,
        role: 'buyer',
        status: 'active'
      }
    ]);
    console.log('Created sample users');

    // Create sample partners
    const partners = await Partner.create([
      {
        name: 'Agricultural Extension Agency',
        type: 'extension',
        contactPerson: 'Sarah Partner',
        phone: '+2348023456789',
        email: 'sarah@example.com',
        address: '123 Main Street, Lagos',
        referralCode: 'EXT001',
        commissionBalance: 0
      },
      {
        name: 'Farmers Cooperative',
        type: 'cooperative',
        contactPerson: 'David Cooper',
        phone: '+2348067890123',
        email: 'david@cooperative.com',
        address: '456 Farm Road, Abuja',
        referralCode: 'COOP001',
        commissionBalance: 0
      }
    ]);
    console.log('Created sample partners');

    // Create sample harvests
    const harvests = await Harvest.create([
      {
        farmer: users[0]._id,
        cropType: 'Cassava',
        quantity: 500,
        date: new Date(),
        geoLocation: {
          latitude: 6.5244,
          longitude: 3.3792
        },
        batchId: 'BATCH001',
        qrData: 'https://grochain.com/verify/BATCH001'
      },
      {
        farmer: users[0]._id,
        cropType: 'Yam',
        quantity: 300,
        date: new Date(),
        geoLocation: {
          latitude: 6.5244,
          longitude: 3.3792
        },
        batchId: 'BATCH002',
        qrData: 'https://grochain.com/verify/BATCH002'
      }
    ]);
    console.log('Created sample harvests');

    // Create sample listings
    await Listing.create([
      {
        product: 'Fresh Cassava',
        price: 15000,
        quantity: 500,
        farmer: users[0]._id,
        partner: partners[0]._id,
        status: 'available',
        images: ['https://example.com/cassava1.jpg']
      },
      {
        product: 'Premium Yam',
        price: 25000,
        quantity: 300,
        farmer: users[0]._id,
        partner: partners[1]._id,
        status: 'available',
        images: ['https://example.com/yam1.jpg']
      }
    ]);
    console.log('Created sample listings');

    console.log('Database seeded successfully!');
    console.log('\nSample login credentials:');
    console.log('Farmer: john@example.com / password123');
    console.log('Partner: sarah@example.com / password123');
    console.log('Admin: admin@grochain.com / password123');
    console.log('Buyer: buyer@example.com / password123');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the seed function
seedData();
