/**
 * Simple Network Connection Test
 * Tests if the backend server is reachable
 */

async function testConnection() {
  console.log('🧪 Testing Backend Connection...');
  console.log('');

  const testIPs = [
    '192.168.18.55',  // Current network IP
    '192.168.18.1',   // Current gateway IP
    'localhost',       // Localhost
    '127.0.0.1',      // Loopback
  ];

  for (const ip of testIPs) {
    try {
      console.log(`🔗 Testing connection to ${ip}:3001`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(`http://${ip}:3001/api/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ SUCCESS: ${ip}:3001 is reachable`);
        console.log(`   Status: ${response.status}`);
        console.log(`   Response: ${JSON.stringify(data, null, 2)}`);
        console.log('');
        return ip;
      } else {
        console.log(`❌ FAILED: ${ip}:3001 returned status ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ FAILED: ${ip}:3001 - ${error.message}`);
    }
    console.log('');
  }

  console.log('❌ No reachable backend server found');
  return null;
}

// Run the test
testConnection().then((workingIP) => {
  if (workingIP) {
    console.log(`🎉 Backend is accessible at: ${workingIP}:3001`);
    console.log('✅ Mobile app should be able to connect to the backend');
  } else {
    console.log('❌ Backend is not accessible from any tested IP');
    console.log('💡 Make sure the backend server is running on port 3001');
  }
});
