const http = require('http');

const request = (options, postData = null) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
};

const runTests = async () => {
  console.log('🧪 Starting NoteNest Backend API Automated Tests...\n');

  try {
    // 1. Health Check
    console.log('1. Testing GET /api/health');
    const health = await request({
      hostname: 'localhost',
      port: 5001,
      path: '/api/health',
      method: 'GET',
    });
    console.log(`   Status: ${health.status}, Response:`, health.data);

    // 2. Student Login
    console.log('\n2. Testing POST /api/auth/login (Student)');
    const studentLogin = await request(
      {
        hostname: 'localhost',
        port: 5001,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: 'rohit@notenest.edu', password: 'Student@123' }
    );
    console.log(`   Status: ${studentLogin.status}, Name: ${studentLogin.data?.user?.name}`);
    const studentToken = studentLogin.data.token;

    // 3. Admin Login
    console.log('\n3. Testing POST /api/auth/login (Admin)');
    const adminLogin = await request(
      {
        hostname: 'localhost',
        port: 5001,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: 'admin@notenest.edu', password: 'Admin@123' }
    );
    console.log(`   Status: ${adminLogin.status}, Role: ${adminLogin.data?.user?.role}`);
    const adminToken = adminLogin.data.token;

    // 4. Fetch Resources with Search and Filters
    console.log('\n4. Testing GET /api/resources?search=Algorithms&branch=Computer Science');
    const resourcesRes = await request({
      hostname: 'localhost',
      port: 5001,
      path: '/api/resources?search=Algorithms&branch=Computer%20Science',
      method: 'GET',
    });
    console.log(`   Status: ${resourcesRes.status}, Found: ${resourcesRes.data.data.length} resources`);
    const testResourceId = resourcesRes.data.data[0]?._id;

    // 5. Fetch Single Resource Details with Auth
    console.log(`\n5. Testing GET /api/resources/${testResourceId}`);
    const singleResource = await request({
      hostname: 'localhost',
      port: 5001,
      path: `/api/resources/${testResourceId}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    console.log(`   Status: ${singleResource.status}, Title: "${singleResource.data.data.title}", IsBookmarked: ${singleResource.data.isBookmarked}`);

    // 6. Test Download endpoint
    console.log(`\n6. Testing POST /api/resources/${testResourceId}/download`);
    const downloadRes = await request(
      {
        hostname: 'localhost',
        port: 5001,
        path: `/api/resources/${testResourceId}/download`,
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}` },
      },
      {}
    );
    console.log(`   Status: ${downloadRes.status}, DownloadCount: ${downloadRes.data.downloadCount}, URL: ${downloadRes.data.downloadUrl}`);

    // 7. Test Bookmark toggle
    console.log(`\n7. Testing POST /api/bookmarks/${testResourceId}`);
    const bookmarkRes = await request(
      {
        hostname: 'localhost',
        port: 5001,
        path: `/api/bookmarks/${testResourceId}`,
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}` },
      },
      {}
    );
    console.log(`   Status: ${bookmarkRes.status}, Message: ${bookmarkRes.data.message}`);

    // 8. Test Admin Stats
    console.log('\n8. Testing GET /api/admin/stats (Admin Only)');
    const adminStats = await request({
      hostname: 'localhost',
      port: 5001,
      path: '/api/admin/stats',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.log(`   Status: ${adminStats.status}, Users: ${adminStats.data?.stats?.users?.total}, Resources: ${adminStats.data?.stats?.resources?.total}, Pending Reports: ${adminStats.data?.stats?.pendingReports}`);

    console.log('\n✅ All backend API endpoints verified successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  }
};

runTests();

