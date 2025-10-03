/**
 * Test Phone Connection
 * Find the IP that your phone can reach
 */

async function testPhoneConnection() {
  console.log('📱 Testing Phone Connection...');
  console.log('');

  // Test common IPs that phones can reach
  const testIPs = [
    '192.168.18.55',  // Your current IP
    '192.168.18.1',   // Gateway
    '192.168.18.2',   // Alternative gateway
    '192.168.18.100', // Common router
    '192.168.18.254', // Alternative router
    '192.168.1.1',    // Common router IP
    '192.168.0.1',    // Another common router
  ];

  const workingIPs = [];

  for (const ip of testIPs) {
    try {
      console.log(`🔗 Testing ${ip}:3001...`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`http://${ip}:3001/api/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        console.log(`✅ SUCCESS: ${ip}:3001 is reachable`);
        workingIPs.push(ip);
      } else {
        console.log(`❌ FAILED: ${ip}:3001 returned status ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ FAILED: ${ip}:3001 - ${error.message}`);
    }
  }

  console.log('');
  console.log('📋 RESULTS:');
  if (workingIPs.length > 0) {
    console.log('✅ Working IPs:');
    workingIPs.forEach(ip => {
      console.log(`   - http://${ip}:3001/api/health`);
    });
    console.log('');
    console.log('📱 Try these URLs on your phone:');
    workingIPs.forEach(ip => {
      console.log(`   http://${ip}:3001/api/health`);
    });
  } else {
    console.log('❌ No working IPs found');
    console.log('');
    console.log('💡 Solutions:');
    console.log('1. Make sure your phone is on the same WiFi');
    console.log('2. Try using your computer\'s mobile hotspot');
    console.log('3. Check if your router blocks device communication');
  }
}

testPhoneConnection();
