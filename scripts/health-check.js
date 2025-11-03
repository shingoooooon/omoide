#!/usr/bin/env node

/**
 * Health Check Script for Omoide Production Deployment
 * 
 * This script performs basic health checks on the deployed application
 * to ensure all critical functionality is working correctly.
 */

const https = require('https');
const http = require('http');

// Configuration
const DEPLOYMENT_URL = process.env.DEPLOYMENT_URL || 'https://your-domain.vercel.app';
const TIMEOUT = 10000; // 10 seconds

// Health check endpoints
const ENDPOINTS = [
  { path: '/', name: 'Home Page', critical: true },
  { path: '/api/health', name: 'Health API', critical: false },
  { path: '/auth/login', name: 'Login Page', critical: true },
  { path: '/upload', name: 'Upload Page', critical: true },
];

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : http;
    const startTime = Date.now();
    
    const req = client.get(url, { timeout: TIMEOUT }, (res) => {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          responseTime,
          data,
          headers: res.headers
        });
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function checkEndpoint(endpoint) {
  const url = `${DEPLOYMENT_URL}${endpoint.path}`;
  
  try {
    log(`Checking ${endpoint.name}...`, colors.blue);
    const response = await makeRequest(url);
    
    if (response.statusCode >= 200 && response.statusCode < 400) {
      log(`✅ ${endpoint.name}: OK (${response.statusCode}) - ${response.responseTime}ms`, colors.green);
      return { success: true, endpoint, response };
    } else {
      log(`❌ ${endpoint.name}: Failed (${response.statusCode}) - ${response.responseTime}ms`, colors.red);
      return { success: false, endpoint, response, error: `HTTP ${response.statusCode}` };
    }
  } catch (error) {
    log(`❌ ${endpoint.name}: Error - ${error.message}`, colors.red);
    return { success: false, endpoint, error: error.message };
  }
}

async function checkEnvironmentVariables() {
  log('\n🔧 Checking environment configuration...', colors.blue);
  
  const requiredEnvVars = [
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'OPENAI_API_KEY',
    'GOOGLE_CLOUD_PROJECT_ID'
  ];
  
  // This is a basic check - in production, you'd want to make API calls
  // to verify the environment variables are working correctly
  log('ℹ️  Environment variable check requires server-side verification', colors.yellow);
  log('   Please check Vercel dashboard for environment variable status', colors.yellow);
}

async function checkFirebaseConnection() {
  log('\n🔥 Checking Firebase connection...', colors.blue);
  
  try {
    // Try to access a Firebase endpoint (this is a basic check)
    const response = await makeRequest(`${DEPLOYMENT_URL}/api/health`);
    if (response.statusCode === 404) {
      log('ℹ️  Health API endpoint not found - this is expected if not implemented', colors.yellow);
    }
  } catch (error) {
    log('⚠️  Could not verify Firebase connection directly', colors.yellow);
    log('   Please test authentication and database operations manually', colors.yellow);
  }
}

async function checkPerformance() {
  log('\n⚡ Checking performance...', colors.blue);
  
  try {
    const response = await makeRequest(DEPLOYMENT_URL);
    
    if (response.responseTime < 1000) {
      log(`✅ Response time: ${response.responseTime}ms (Good)`, colors.green);
    } else if (response.responseTime < 3000) {
      log(`⚠️  Response time: ${response.responseTime}ms (Acceptable)`, colors.yellow);
    } else {
      log(`❌ Response time: ${response.responseTime}ms (Slow)`, colors.red);
    }
    
    // Check for compression
    if (response.headers['content-encoding']) {
      log(`✅ Compression enabled: ${response.headers['content-encoding']}`, colors.green);
    } else {
      log('⚠️  No compression detected', colors.yellow);
    }
    
  } catch (error) {
    log(`❌ Performance check failed: ${error.message}`, colors.red);
  }
}

async function runHealthCheck() {
  log(`${colors.bold}🏥 Omoide Health Check${colors.reset}`);
  log(`Target: ${DEPLOYMENT_URL}`);
  log(`Time: ${new Date().toISOString()}`);
  log('='.repeat(50));
  
  // Check all endpoints
  const results = [];
  for (const endpoint of ENDPOINTS) {
    const result = await checkEndpoint(endpoint);
    results.push(result);
  }
  
  // Additional checks
  await checkEnvironmentVariables();
  await checkFirebaseConnection();
  await checkPerformance();
  
  // Summary
  log('\n📊 Summary:', colors.bold);
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const critical_failed = results.filter(r => !r.success && r.endpoint.critical).length;
  
  log(`✅ Successful: ${successful}/${results.length}`, colors.green);
  if (failed > 0) {
    log(`❌ Failed: ${failed}/${results.length}`, colors.red);
  }
  
  if (critical_failed > 0) {
    log(`\n🚨 Critical endpoints failed! Deployment may not be working correctly.`, colors.red);
    process.exit(1);
  } else if (failed > 0) {
    log(`\n⚠️  Some non-critical endpoints failed. Please investigate.`, colors.yellow);
    process.exit(0);
  } else {
    log(`\n🎉 All health checks passed! Deployment is healthy.`, colors.green);
    process.exit(0);
  }
}

// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
Omoide Health Check Script

Usage: node health-check.js [options]

Options:
  --help, -h     Show this help message
  --url <url>    Override deployment URL

Environment Variables:
  DEPLOYMENT_URL Set the target URL for health checks

Examples:
  node health-check.js
  node health-check.js --url https://my-app.vercel.app
  DEPLOYMENT_URL=https://my-app.vercel.app node health-check.js
`);
  process.exit(0);
}

// Override URL if provided
const urlIndex = process.argv.indexOf('--url');
if (urlIndex !== -1 && process.argv[urlIndex + 1]) {
  process.env.DEPLOYMENT_URL = process.argv[urlIndex + 1];
}

// Run the health check
runHealthCheck().catch(error => {
  log(`\n💥 Health check failed with error: ${error.message}`, colors.red);
  process.exit(1);
});