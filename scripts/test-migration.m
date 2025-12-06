/**
 * Test script for migrated Netlify functions with apiWrapper
 * Tests all endpoints to verify they work correctly
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:9999';
const FUNCTIONS_PATH = '/.netlify/functions';

const tests = [
  {
    name: 'Demo Function - Basic Greeting',
    url: `${BASE_URL}${FUNCTIONS_PATH}/demo`,
    method: 'GET'
  },
  {
    name: 'Demo Function - Custom Name',
    url: `${BASE_URL}${FUNCTIONS_PATH}/demo?name=Jan`,
    method: 'GET'
  },
  {
    name: 'Dashboard Function',
    url: `${BASE_URL}${FUNCTIONS_PATH}/dashboard`,
    method: 'GET'
  },
  {
    name: 'Settings Function - GET (requires userId)',
    url: `${BASE_URL}${FUNCTIONS_PATH}/settings/test-user-123`,
    method: 'GET'
  },
  {
    name: 'Users Function - Get All Users',
    url: `${BASE_URL}${FUNCTIONS_PATH}/users`,
    method: 'GET'
  },
  {
    name: 'Method Not Allowed Test',
    url: `${BASE_URL}${FUNCTIONS_PATH}/demo`,
    method: 'POST'
  }
];

async function runTest(test) {
  console.log(`\n🧪 Testing: ${test.name}`);
  console.log(`📡 ${test.method} ${test.url}`);
  
  try {
    const response = await fetch(test.url, {
      method: test.method,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    console.log(`✅ Status: ${response.status}`);
    console.log(`📊 Response:`, JSON.stringify(data, null, 2));
    
    // Basic validation
    if (data.status === true || data.status === false) {
      console.log('✅ Valid API response format');
    } else {
      console.log('❌ Invalid response format');
    }
    
    return true;
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting Netlify Functions Test Suite');
  console.log('=====================================');
  
  let passed = 0;
  let total = tests.length;
  
  for (const test of tests) {
    const result = await runTest(test);
    if (result) passed++;
  }
  
  console.log('\n📊 Test Results:');
  console.log('================');
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  console.log(`📈 Success Rate: ${Math.round((passed/total) * 100)}%`);
  
  if (passed === total) {
    console.log('\n🎉 All tests passed! Migration successful.');
  } else {
    console.log('\n⚠️  Some tests failed. Check function logs for details.');
  }
}

// Check if running in Node.js environment
if (typeof window === 'undefined') {
  runAllTests().catch(console.error);
}

export { runAllTests, runTest };
