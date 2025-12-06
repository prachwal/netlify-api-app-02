#!/usr/bin/env node

/**
 * Test Script for Netlify API Endpoints
 * Tests all endpoints after migration to new system
 */

import http from 'http';
import { URL } from 'url';

class ApiTester {
  constructor(baseUrl = 'http://localhost:8888/.netlify/functions') {
    this.baseUrl = baseUrl;
    this.results = [];
    this.totalTests = 0;
    this.passedTests = 0;
  }

  // HTTP request helper
  async makeRequest(url, options = {}) {
    const startTime = Date.now();
    try {
      const response = await fetch(url, options);
      const data = await response.text();
      const responseTime = Date.now() - startTime;
      
      try {
        const parsed = JSON.parse(data);
        return {
          status: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          data: parsed,
          responseTime,
          success: response.ok
        };
      } catch (e) {
        return {
          status: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          data: data,
          responseTime,
          success: false,
          parseError: e.message
        };
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        error: error.message,
        responseTime,
        success: false
      };
    }
  }

  // Test individual endpoint
  async testEndpoint(name, path, method = 'GET', body = null) {
    this.totalTests++;
    console.log(`\n🔍 Testing: ${name}`);
    console.log(`   ${method} ${path}`);
    console.log(`   Base URL: ${this.baseUrl}`);
    
    try {
      const url = new URL(path, this.baseUrl);
      console.log(`   Full URL: ${url.href}`);
      const options = {
        method,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; API-Tester/1.0)'
        }
      };
      
      if (body) {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(body);
      }
      
      const result = await this.makeRequest(url, options);
      
      result.method = method;
      
      // Validate response structure
      const isValidStructure = this.validateResponseStructure(result);
      
      const testResult = {
        name,
        path,
        method,
        status: result.status,
        responseTime: result.responseTime,
        success: method === 'OPTIONS' ? isValidStructure : (result.success || (result.status === 404 && isValidStructure)) && isValidStructure,
        data: result.data,
        errors: []
      };
      
      if (!result.success) {
        testResult.errors.push(`HTTP ${result.status}`);
      }
      
      if (!isValidStructure) {
        testResult.errors.push('Invalid response structure');
      }
      
      if (result.responseTime > 5000) {
        testResult.errors.push(`Slow response: ${result.responseTime}ms`);
      }
      
      if (testResult.success) {
        this.passedTests++;
        console.log(`   ✅ PASS - ${result.status} (${result.responseTime}ms)`);
      } else {
        console.log(`   ❌ FAIL - ${testResult.errors.join(', ')}`);
      }
      
      this.results.push(testResult);
      return testResult;
      
    } catch (error) {
      console.log(`   ❌ ERROR - ${error.error || error.message}`);
      
      const testResult = {
        name,
        path,
        method,
        status: 0,
        responseTime: error.responseTime || 0,
        success: false,
        data: null,
        errors: [error.error || error.message]
      };
      
      this.results.push(testResult);
      return testResult;
    }
  }

  // Validate API response structure
  validateResponseStructure(result) {
    console.log('Validating response:', JSON.stringify(result.data, null, 2));
    // For OPTIONS requests, 200 or 204 with empty body is acceptable
    if (result.method === 'OPTIONS' && (result.status === 204 || (result.status === 200 && !result.data))) {
      console.log('OPTIONS validation passed');
      return true;
    }

    if (!result.data || typeof result.data !== 'object') {
      console.log('Fail: data not object');
      return false;
    }
    
    // Must have status field
    if (typeof result.data.status !== 'boolean') {
      console.log('Fail: status not boolean');
      return false;
    }
    
    // Must have metadata with timestamp
    if (!result.data.metadata || typeof result.data.metadata.timestamp !== 'string') {
      console.log('Fail: metadata or timestamp invalid');
      return false;
    }
    
    // If status is true, should have data field
    if (result.data.status && !('data' in result.data)) {
      console.log('Fail: no data field when status true');
      return false;
    }
    
    // If status is false, should have error field
    if (!result.data.status && !result.data.error) {
      console.log('Fail: no error field when status false');
      return false;
    }
    
    console.log('Validation passed');
    return true;
  }

  // Run all tests
  async runAllTests() {
    console.log('🚀 Starting API Endpoint Tests');
    console.log('=' .repeat(50));
    
    // Test Demo endpoint
    await this.testEndpoint('Demo - Basic Greeting', 'demo');
    await this.testEndpoint('Demo - Custom Name', 'demo?name=World');
    
    // Test Dashboard endpoint
    await this.testEndpoint('Dashboard - Get Stats', 'dashboard');
    
    // Test Settings endpoints
    await this.testEndpoint('Settings - Get User Settings', 'settings/test-user-123');
    await this.testEndpoint('Settings - Create Settings', 'settings/test-user-456', 'PUT', {
      theme: 'dark',
      language: 'en',
      notifications: true,
      emailUpdates: false
    });
    
    // Test Users endpoints
    await this.testEndpoint('Users - Get All Users', 'users');
    await this.testEndpoint('Users - Get Specific User', 'users/test-user-123');
    
    // Test CORS preflight
    await this.testEndpoint('Settings - CORS Preflight', 'settings/test-user', 'OPTIONS');
    
    // Generate summary
    this.generateSummary();
  }

  // Generate test summary
  generateSummary() {
    console.log('\n' + '=' .repeat(50));
    console.log('📊 TEST SUMMARY');
    console.log('=' .repeat(50));
    
    console.log(`Total Tests: ${this.totalTests}`);
    console.log(`Passed: ${this.passedTests}`);
    console.log(`Failed: ${this.totalTests - this.passedTests}`);
    console.log(`Success Rate: ${((this.passedTests / this.totalTests) * 100).toFixed(1)}%`);
    
    // Performance analysis
    const responseTimes = this.results
      .filter(r => r.success && r.responseTime)
      .map(r => r.responseTime);
    
    if (responseTimes.length > 0) {
      const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const maxResponseTime = Math.max(...responseTimes);
      const minResponseTime = Math.min(...responseTimes);
      
      console.log(`\n⚡ Performance Analysis:`);
      console.log(`   Average Response Time: ${avgResponseTime.toFixed(2)}ms`);
      console.log(`   Fastest Response: ${minResponseTime}ms`);
      console.log(`   Slowest Response: ${maxResponseTime}ms`);
    }
    
    // Failed tests details
    const failedTests = this.results.filter(r => !r.success);
    if (failedTests.length > 0) {
      console.log(`\n❌ Failed Tests:`);
      failedTests.forEach(test => {
        console.log(`   ${test.name}: ${test.errors.join(', ')}`);
      });
    }
    
    // Endpoint health report
    console.log(`\n📈 Endpoint Health Report:`);
    const endpoints = {};
    this.results.forEach(test => {
      const endpoint = test.path.split('?')[0]; // Remove query params
      if (!endpoints[endpoint]) {
        endpoints[endpoint] = { total: 0, passed: 0 };
      }
      endpoints[endpoint].total++;
      if (test.success) {
        endpoints[endpoint].passed++;
      }
    });
    
    Object.entries(endpoints).forEach(([endpoint, stats]) => {
      const health = ((stats.passed / stats.total) * 100).toFixed(1);
      const status = health === '100' ? '🟢' : health >= '80' ? '🟡' : '🔴';
      console.log(`   ${status} ${endpoint}: ${stats.passed}/${stats.total} (${health}%)`);
    });
    
    // Performance recommendations
    console.log(`\n💡 Performance Recommendations:`);
    const slowEndpoints = this.results.filter(r => r.responseTime > 1000);
    if (slowEndpoints.length > 0) {
      console.log(`   - Consider caching for slow endpoints:`);
      slowEndpoints.forEach(test => {
        console.log(`     ${test.name}: ${test.responseTime}ms`);
      });
    }
    
    const errorEndpoints = this.results.filter(r => !r.success);
    if (errorEndpoints.length > 0) {
      console.log(`   - Address failing endpoints:`);
      errorEndpoints.forEach(test => {
        console.log(`     ${test.name}: ${test.errors.join(', ')}`);
      });
    }
    
    // Migration status
    console.log(`\n🔄 Migration Status:`);
    const wrapperFeatures = {
      'Caching': this.results.some(r => r.data?.metadata?.cached !== undefined),
      'Rate Limiting': this.results.some(r => r.data?.metadata?.rateLimitInfo),
      'Retry Logic': this.results.some(r => r.data?.metadata?.retryAttempts),
      'Structured Logging': this.results.some(r => r.data?.metadata?.requestUrl)
    };
    
    Object.entries(wrapperFeatures).forEach(([feature, implemented]) => {
      const status = implemented ? '✅' : '⚠️';
      console.log(`   ${status} ${feature}`);
    });
    
    // Final assessment
    const successRate = (this.passedTests / this.totalTests) * 100;
    if (successRate >= 90) {
      console.log(`\n🎉 Migration Status: EXCELLENT (${successRate.toFixed(1)}% success rate)`);
    } else if (successRate >= 70) {
      console.log(`\n👍 Migration Status: GOOD (${successRate.toFixed(1)}% success rate)`);
    } else {
      console.log(`\n⚠️ Migration Status: NEEDS ATTENTION (${successRate.toFixed(1)}% success rate)`);
    }
  }
}

// Main execution
async function main() {
  const baseUrl = process.env.API_BASE_URL || 'http://localhost:8888/.netlify/functions/';
  const tester = new ApiTester(baseUrl);
  
  try {
    await tester.runAllTests();
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

// Export for use as module
export { ApiTester };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
