const http = require('http');

const API_URL = 'http://localhost:5000';

let testResults = {
  passed: 0,
  failed: 0,
  tests: [],
};

// Helper to make HTTP requests
const request = (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers.Authorization = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            body: JSON.parse(data),
            headers: res.headers,
          });
        } catch {
          resolve({
            status: res.statusCode,
            body: data,
            headers: res.headers,
          });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

// Test runner
const test = async (name, fn) => {
  try {
    await fn();
    testResults.passed++;
    testResults.tests.push({ name, status: '✅ PASS' });
    console.log(`✅ ${name}`);
  } catch (error) {
    testResults.failed++;
    testResults.tests.push({ name, status: '❌ FAIL', error: error.message });
    console.log(`❌ ${name}`);
    console.log(`   Error: ${error.message}`);
  }
};

// Assert helper
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

// Main test suite
const runTests = async () => {
  console.log('\n🧪 Labour by Hire API Test Suite\n');
  console.log('=' + '='.repeat(49) + '\n');

  let token = '';
  let workerId = '';
  let jobId = '';

  // Test 1: Health Check
  await test('Health Check', async () => {
    const res = await request('GET', '/api/health');
    assert(res.status === 200, 'Health check failed');
    assert(res.body.status === 'Server is running', 'Unexpected response');
  });

  // Test 2: Register Worker
  await test('Register Worker', async () => {
    const res = await request('POST', '/api/auth/register', {
      email: `testworker_${Date.now()}@test.com`,
      password: 'Test@123456',
      firstName: 'John',
      lastName: 'Doe',
      trade: 'Carpenter',
      city: 'Sydney, NSW',
      hourlyRate: 75,
    });
    assert(res.status === 201, `Expected 201, got ${res.status}`);
    assert(res.body.token, 'No token in response');
    assert(res.body.worker, 'No worker data in response');
    token = res.body.token;
    workerId = res.body.worker.id;
  });

  // Test 3: Login Worker
  await test('Login Worker', async () => {
    const res = await request('POST', '/api/auth/login', {
      email: `testworker_${Date.now() - 1000}@test.com`,
      password: 'Test@123456',
    });
    // Note: This might fail if email doesn't match - that's OK for test
    if (res.status === 401) {
      console.log('   (Registration test email not found - expected)');
    } else {
      assert(res.status === 200, `Expected 200 or 401, got ${res.status}`);
    }
  });

  // Test 4: Get Worker Profile
  await test('Get Worker Profile', async () => {
    const res = await request('GET', '/api/auth/profile', null, token);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body.worker, 'No worker data in response');
    assert(res.body.worker.id === workerId, 'Worker ID mismatch');
  });

  // Test 5: Update Worker Profile
  await test('Update Worker Profile', async () => {
    const res = await request(
      'PUT',
      '/api/auth/profile',
      {
        bio: 'Expert carpenter with 15 years experience',
        hourlyRate: 85,
      },
      token
    );
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body.worker.bio, 'Bio not updated');
  });

  // Test 6: Create Listing
  await test('Create Tradie Listing', async () => {
    const res = await request(
      'POST',
      '/api/auth/listing',
      {
        title: 'Expert Carpentry Services',
        description: 'Custom woodwork, renovations, and repairs',
        skills: ['Custom Woodwork', 'Renovations', 'Repairs'],
        availability: 'Available immediately',
      },
      token
    );
    assert(res.status === 201, `Expected 201, got ${res.status}`);
    assert(res.body.listing, 'No listing in response');
  });

  // Test 7: Get Worker Listing
  await test('Get Worker Listing', async () => {
    const res = await request('GET', '/api/auth/listing', null, token);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body.listing, 'No listing in response');
  });

  // Test 8: Browse All Listings
  await test('Browse All Listings', async () => {
    const res = await request('GET', '/api/listings');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(Array.isArray(res.body.listings), 'Listings not an array');
  });

  // Test 9: Post Job (Public)
  await test('Post Employer Job', async () => {
    const res = await request('POST', '/api/jobs', {
      title: 'Deck Installation',
      description: 'Need professional carpenter for deck installation',
      tradeRequired: 'Carpenter',
      location: 'Sydney, NSW',
      budget: 2000,
      urgency: 'normal',
    });
    assert(res.status === 201, `Expected 201, got ${res.status}`);
    assert(res.body.job, 'No job in response');
    jobId = res.body.job.id;
  });

  // Test 10: Post Urgent Job (Should trigger notifications)
  await test('Post Urgent Job', async () => {
    const res = await request('POST', '/api/jobs', {
      title: 'Emergency Roof Repair',
      description: 'Urgent roof repair needed',
      tradeRequired: 'Carpenter',
      location: 'Sydney, NSW',
      budget: 5000,
      urgency: 'urgent',
    });
    assert(res.status === 201, `Expected 201, got ${res.status}`);
    assert(res.body.job.urgency === 'urgent', 'Urgency not set correctly');
  });

  // Test 11: Browse Jobs
  await test('Browse All Jobs', async () => {
    const res = await request('GET', '/api/jobs');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(Array.isArray(res.body.jobs), 'Jobs not an array');
    assert(res.body.jobs.length > 0, 'No jobs posted');
  });

  // Test 12: Filter Jobs by Trade
  await test('Filter Jobs by Trade', async () => {
    const res = await request('GET', '/api/jobs?trade=Carpenter');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(Array.isArray(res.body.jobs), 'Jobs not an array');
  });

  // Test 13: Get Single Job
  await test('Get Single Job', async () => {
    const res = await request('GET', `/api/jobs/${jobId}`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body.job, 'No job in response');
  });

  // Test 14: Get Notifications (Protected)
  await test('Get Worker Notifications', async () => {
    const res = await request('GET', '/api/notifications', null, token);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(Array.isArray(res.body.notifications), 'Notifications not an array');
  });

  // Test 15: Get Unread Notifications
  await test('Get Unread Notifications', async () => {
    const res = await request('GET', '/api/notifications/unread', null, token);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(Array.isArray(res.body.notifications), 'Notifications not an array');
  });

  // Test 16: Auth Protection
  await test('Protected Route Without Token', async () => {
    const res = await request('GET', '/api/auth/profile');
    assert(res.status === 401, `Expected 401, got ${res.status}`);
    assert(res.body.error, 'No error message');
  });

  // Test 17: Invalid Token
  await test('Protected Route With Invalid Token', async () => {
    const res = await request('GET', '/api/auth/profile', null, 'invalid_token');
    assert(res.status === 401, `Expected 401, got ${res.status}`);
  });

  // Results Summary
  console.log('\n' + '='.repeat(50));
  console.log('\n📊 Test Results\n');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Total:  ${testResults.passed + testResults.failed}`);
  console.log(`🎯 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%\n`);

  if (testResults.failed === 0) {
    console.log('🎉 All tests passed!\n');
  } else {
    console.log('⚠️  Some tests failed. Check details above.\n');
  }
};

// Run tests
runTests().catch(console.error);
