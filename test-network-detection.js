/**
 * Test Network Detection
 * Run this to test if the network detection system can find your backend
 */

const { NetworkDetector } = require('./lib/utils/network-detector');

async function testNetworkDetection() {
  console.log('🧪 Testing Network Detection System...');
  console.log('');

  try {
    // Test current IP
    console.log('🔗 Testing current network IP: 192.168.18.55');
    const currentIP = await NetworkDetector.testConnection('192.168.18.55', 3001);
    console.log(`   Result: ${currentIP ? '✅ REACHABLE' : '❌ NOT REACHABLE'}`);
    console.log('');

    // Test gateway IP
    console.log('🔗 Testing gateway IP: 192.168.18.1');
    const gatewayIP = await NetworkDetector.testConnection('192.168.18.1', 3001);
    console.log(`   Result: ${gatewayIP ? '✅ REACHABLE' : '❌ NOT REACHABLE'}`);
    console.log('');

    // Try to find backend automatically
    console.log('🔍 Auto-detecting backend server...');
    const foundIP = await NetworkDetector.findBackendIP();
    
    if (foundIP) {
      console.log(`✅ Backend found at: ${foundIP}:3001`);
      
      // Test API endpoint
      const apiUrl = `http://${foundIP}:3001/api/health`;
      console.log(`🔗 Testing API endpoint: ${apiUrl}`);
      
      try {
        const response = await fetch(apiUrl);
        if (response.ok) {
          const data = await response.json();
          console.log('✅ API endpoint working!');
          console.log('📊 Response:', data);
        } else {
          console.log(`❌ API endpoint returned status: ${response.status}`);
        }
      } catch (error) {
        console.log(`❌ API endpoint error: ${error.message}`);
      }
    } else {
      console.log('❌ No backend server found');
      console.log('');
      console.log('💡 Make sure your backend server is running:');
      console.log('   cd E-Voting_WebApp\\backend_Vercel');
      console.log('   cmd /c "npm run dev"');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }

  console.log('');
  console.log('🧪 Network Detection Test Complete');
}

// Run the test
testNetworkDetection();
