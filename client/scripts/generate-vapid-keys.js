#!/usr/bin/env node

/**
 * Generate VAPID keys for push notifications
 * Run this script to generate new VAPID keys
 */

const crypto = require('crypto');

function generateVAPIDKeys() {
  console.log('🔑 Generating VAPID keys for push notifications...\n');
  
  // Generate private key
  const privateKey = crypto.generateKeyPairSync('ec', {
    namedCurve: 'P-256',
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  });
  
  // Convert public key to base64url format for VAPID
  const publicKeyBuffer = Buffer.from(privateKey.publicKey, 'utf8');
  const publicKeyBase64 = publicKeyBuffer.toString('base64');
  const publicKeyBase64Url = publicKeyBase64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  
  console.log('✅ VAPID keys generated successfully!\n');
  console.log('📋 Add these to your environment variables:\n');
  console.log('🔑 Frontend (.env.local):');
  console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${publicKeyBase64Url}`);
  console.log('\n🔐 Backend (.env):');
  console.log(`VAPID_PRIVATE_KEY=${privateKey.privateKey.replace(/\n/g, '\\n')}`);
  console.log(`VAPID_PUBLIC_KEY=${publicKeyBase64Url}`);
  console.log('\n📝 Note: The private key should only be in your backend environment!');
  console.log('📝 The public key is safe to expose in the frontend.');
}

if (require.main === module) {
  generateVAPIDKeys();
}

module.exports = { generateVAPIDKeys };
