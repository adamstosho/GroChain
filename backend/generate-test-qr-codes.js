const mongoose = require('mongoose');
const QRCodeLib = require('qrcode');
require('dotenv').config();

// Models
const QRCodeModel = require('./models/qrcode.model');
const Harvest = require('./models/harvest.model');

async function generateQRCodesForHarvests() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/grochain', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('🔌 Connected to MongoDB');

    // Get all harvests with status 'listed' or 'approved'
    const harvests = await Harvest.find({
      $or: [
        { status: 'approved' },
        { status: 'listed' }
      ]
    }).limit(3); // Generate QR codes for first 3 harvests

    console.log(`📦 Found ${harvests.length} harvests to generate QR codes for`);

    if (harvests.length === 0) {
      console.log('❌ No harvests found with status "approved" or "listed"');
      return;
    }

    // Generate QR codes for each harvest
    for (const harvest of harvests) {
      try {
        // Check if QR code already exists for this harvest
        const existingQR = await QRCodeModel.findOne({ harvest: harvest._id });
        if (existingQR) {
          console.log(`⏭️  QR code already exists for harvest ${harvest._id}, skipping...`);
          continue;
        }

        console.log(`🎯 Generating QR code for harvest: ${harvest.cropType} - ${harvest.batchId}`);

        // Generate unique code
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
        const qrCodeString = `QR-${harvest.batchId}-${randomString}`;

        // Generate QR code data
        const qrData = {
          batchId: harvest.batchId,
          cropType: harvest.cropType,
          farmerId: harvest.farmer.toString(),
          harvestDate: harvest.date || harvest.harvestDate,
          verificationUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify/${harvest.batchId}`,
          timestamp,
        };

        // Generate QR code image
        const qrImage = await QRCodeLib.toDataURL(JSON.stringify(qrData));

        // Parse location string - handle various formats
        let city = 'Unknown City';
        let state = 'Unknown State';

        if (harvest.location && typeof harvest.location === 'string') {
          const locationStr = harvest.location.trim();

          // Check if it contains comma (format: "City, State")
          if (locationStr.includes(',')) {
            const parts = locationStr.split(',');
            if (parts.length >= 2) {
              city = parts[0].trim();
              state = parts[1].trim();
            } else {
              city = locationStr;
            }
          } else {
            // Handle single location strings like "Lagos", "Abuja", etc.
            city = locationStr;
            state = 'Nigeria'; // Default state for Nigerian cities
          }
        } else if (harvest.location && typeof harvest.location === 'object') {
          city = harvest.location.city || 'Unknown City';
          state = harvest.location.state || 'Unknown State';
        }

        // Create QR code record
        const qrCodeRecord = new QRCodeModel({
          harvest: harvest._id,
          farmer: harvest.farmer,
          code: qrCodeString,
          batchId: harvest.batchId,
          qrImage,
          qrData,
          metadata: {
            cropType: harvest.cropType,
            quantity: harvest.quantity,
            quality: harvest.qualityGrade || 'Standard',
            harvestDate: harvest.date || harvest.harvestDate,
            location: {
              farmName: city + ' Farm',
              city: city,
              state: state,
              coordinates: harvest.location?.coordinates || { lat: 0, lng: 0 }
            }
          }
        });

        await qrCodeRecord.save();

        // Update harvest with QR code reference
        harvest.qrCode = qrImage;
        harvest.qrCodeData = qrData;
        await harvest.save();

        console.log(`✅ QR code generated successfully: ${qrCodeString}`);
        console.log(`   - Batch ID: ${harvest.batchId}`);
        console.log(`   - Crop: ${harvest.cropType}`);
        console.log(`   - Location: ${city}, ${state}`);

      } catch (error) {
        console.error(`❌ Error generating QR code for harvest ${harvest._id}:`, error.message);
      }
    }

    // Count total QR codes after generation
    const totalQRCodes = await QRCodeModel.countDocuments();
    console.log(`\n📊 Total QR codes in database: ${totalQRCodes}`);

    // Show sample QR codes
    const sampleQRCodes = await QRCodeModel.find({}).limit(3).select('code batchId metadata.cropType metadata.location status createdAt');
    console.log('\n📱 Sample QR codes:');
    sampleQRCodes.forEach((qr, index) => {
      console.log(`${index + 1}. ${qr.code} - ${qr.metadata.cropType} - ${qr.metadata.location.city}, ${qr.metadata.location.state} - Status: ${qr.status}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
generateQRCodesForHarvests();
