/**
 * Debug Phone Connection
 * This will help us figure out why your phone can't connect
 */

const os = require('os');

function getNetworkInfo() {
  const interfaces = os.networkInterfaces();
  console.log('🔍 Network Debug Information');
  console.log('============================');
  console.log('');
  
  for (const [name, addresses] of Object.entries(interfaces)) {
    if (name === 'Wi-Fi' || name.includes('WiFi') || name.includes('Wireless')) {
      console.log(`📡 WiFi Interface: ${name}`);
      for (const address of addresses) {
        if (address.family === 'IPv4' && !address.internal) {
          console.log(`   IP Address: ${address.address}`);
          console.log(`   Netmask: ${address.netmask}`);
          console.log(`   Gateway: ${address.gateway || 'Not available'}`);
          console.log('');
        }
      }
    }
  }
}

function testBackendAccess() {
  console.log('🔧 Backend Server Test');
  console.log('======================');
  console.log('');
  
  const testIPs = [
    '192.168.18.55',  // Your current IP
    '192.168.18.1',   // Gateway
    'localhost',       // Localhost
    '127.0.0.1',      // Loopback
  ];
  
  console.log('Testing backend access from different IPs:');
  console.log('');
  
  testIPs.forEach(ip => {
    console.log(`📱 For your phone, try this URL in browser:`);
    console.log(`   http://${ip}:3001/api/health`);
    console.log('');
  });
}

function provideSolutions() {
  console.log('🔧 Solutions to Try');
  console.log('===================');
  console.log('');
  
  console.log('1. **Check Router Settings**');
  console.log('   - Some routers block device-to-device communication');
  console.log('   - Look for "AP Isolation" or "Client Isolation" in router settings');
  console.log('   - Disable it if it\'s enabled');
  console.log('');
  
  console.log('2. **Try Different Network**');
  console.log('   - Connect both devices to a different WiFi');
  console.log('   - Or use your phone\'s hotspot');
  console.log('');
  
  console.log('3. **Use Mobile Hotspot**');
  console.log('   - Turn on your computer\'s mobile hotspot');
  console.log('   - Connect your phone to it');
  console.log('   - The hotspot IP is usually 192.168.137.1');
  console.log('');
  
  console.log('4. **Check Phone Settings**');
  console.log('   - Make sure your phone allows local network access');
  console.log('   - Check if there\'s a VPN or proxy enabled');
  console.log('');
  
  console.log('5. **Test with Different Port**');
  console.log('   - Try changing the backend port to 8080');
  console.log('   - Some routers block certain ports');
  console.log('');
}

function main() {
  getNetworkInfo();
  testBackendAccess();
  provideSolutions();
  
  console.log('📱 **IMMEDIATE TEST**');
  console.log('=====================');
  console.log('On your phone, open browser and try:');
  console.log('http://192.168.18.55:3001/api/health');
  console.log('');
  console.log('If this doesn\'t work, your router is blocking device communication.');
  console.log('Try the mobile hotspot solution - it usually works!');
}

main();
