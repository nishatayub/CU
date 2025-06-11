#!/usr/bin/env node
/**
 * Test GitHub Save Functionality
 * This script tests if the GitHub save is working correctly
 */

const axios = require('axios');

const BACKEND_URL = 'http://localhost:8080';

async function testGitHubSave() {
  console.log('🧪 Testing GitHub Save Functionality...\n');

  try {
    // Test 1: Check if GitHub status endpoint works
    console.log('1️⃣ Testing GitHub status endpoint...');
    const statusResponse = await axios.get(`${BACKEND_URL}/api/github/status`, {
      headers: {
        Authorization: 'Bearer invalid-token'
      }
    });
    console.log('❌ This should have failed with invalid token');
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Status endpoint working - correctly rejected invalid token');
    } else {
      console.log('❌ Unexpected error:', error.message);
    }
  }

  try {
    // Test 2: Check OAuth URL generation
    console.log('\n2️⃣ Testing OAuth URL generation...');
    const oauthResponse = await axios.get(`${BACKEND_URL}/api/github/oauth-url`, {
      params: {
        username: 'testuser',
        roomId: 'test123'
      }
    });
    
    if (oauthResponse.data.success && oauthResponse.data.oauthUrl) {
      console.log('✅ OAuth URL generation working');
      console.log('🔗 Generated URL:', oauthResponse.data.oauthUrl.substring(0, 100) + '...');
    } else {
      console.log('❌ OAuth URL generation failed');
    }
  } catch (error) {
    console.log('❌ OAuth URL test failed:', error.message);
  }

  // Test 3: Check if server can handle save request (will fail due to no auth)
  console.log('\n3️⃣ Testing save room endpoint (should fail gracefully)...');
  try {
    const saveResponse = await axios.post(`${BACKEND_URL}/api/github/save-room`, {
      roomId: 'test123',
      files: {
        'test.js': 'console.log("Hello from test!");'
      }
    });
    console.log('❌ This should have failed with no auth');
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Save endpoint working - correctly rejected request without token');
    } else {
      console.log('❌ Unexpected error:', error.message);
    }
  }

  console.log('\n🎯 **Next Steps for User:**');
  console.log('1. Make sure you have GitHub connected in the app');
  console.log('2. Try clicking the GitHub save button');
  console.log('3. Check browser console for debug logs');
  console.log('4. If save succeeds, check: https://github.com/nishatayub/codeunity-rooms');
}

// Run the test
testGitHubSave().catch(console.error);
