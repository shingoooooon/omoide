#!/usr/bin/env node

/**
 * Script to deploy Firestore indexes
 * 
 * Usage:
 * 1. Make sure you have Firebase CLI installed: npm install -g firebase-tools
 * 2. Make sure you're logged in: firebase login
 * 3. Run this script: node scripts/deploy-firestore-indexes.js
 */

const { execSync } = require('child_process');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const indexesFile = path.join(projectRoot, 'firestore.indexes.json');

console.log('🔥 Deploying Firestore indexes...');

try {
  // Deploy the indexes
  execSync(`firebase deploy --only firestore:indexes --project omoide-3b1d9`, {
    cwd: projectRoot,
    stdio: 'inherit'
  });
  
  console.log('✅ Firestore indexes deployed successfully!');
  console.log('📝 Note: Index creation may take a few minutes to complete.');
  console.log('🔗 You can monitor progress in the Firebase Console.');
  
} catch (error) {
  console.error('❌ Failed to deploy Firestore indexes:', error.message);
  console.log('\n📋 Manual steps:');
  console.log('1. Go to Firebase Console: https://console.firebase.google.com');
  console.log('2. Select your project: omoide-3b1d9');
  console.log('3. Go to Firestore Database → Indexes');
  console.log('4. Create a composite index with:');
  console.log('   - Collection: storybooks');
  console.log('   - Fields: userId (Ascending), createdAt (Descending)');
  
  process.exit(1);
}