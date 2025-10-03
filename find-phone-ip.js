/**
 * Find Phone IP Address Helper
 * This script helps you find the correct IP address for your phone
 */

const os = require('os');

function getNetworkInterfaces() {
  const interfaces = os.networkInterfaces();
  const results = [];
  
  console.log('🔍 Available Network Interfaces:');
  console.log('');
  
  for (const [name, addresses] of Object.entries(interfaces)) {
    console.log(`📡 Interface: ${name}`);
    
    for (const address of addresses) {
      if (address.family === 'IPv4' && !address.internal) {
        console.log(`   IP: ${address.address}`);
        console.log(`   Netmask: ${address.netmask}`);
        console.log(`   Gateway: ${address.gateway || 'Not available'}`);
        console.log('');
        
        results.push({
          interface: name,
          ip: address.address,
          netmask: address.netmask
        });
      }
    }
  }
  
  return results;
}

function generatePhoneTestURLs(computerIPs) {
  console.log('📱 Test URLs for your phone:');
  console.log('');
  
  for (const { ip } of computerIPs) {
    console.log(`🔗 Try this URL on your phone's browser:`);
    console.log(`   http://${ip}:3001/api/health`);
    console.log('');
  }
  
  console.log('📋 Instructions:');
  console.log('1. Make sure your phone is on the SAME WiFi network');
  console.log('2. Open your phone\'s browser');
  console.log('3. Try each URL above');
  console.log('4. The one that works is the correct IP for your mobile app');
  console.log('');
}

function main() {
  console.log('🔧 Phone IP Address Finder');
  console.log('==========================');
  console.log('');
  
  const networkInterfaces = getNetworkInterfaces();
  
  if (networkInterfaces.length === 0) {
    console.log('❌ No network interfaces found');
    return;
  }
  
  generatePhoneTestURLs(networkInterfaces);
  
  console.log('💡 If none of the URLs work:');
  console.log('   - Check if your phone is on the same WiFi');
  console.log('   - Try using your computer\'s mobile hotspot');
  console.log('   - Check if your router blocks device-to-device communication');
}

main();
