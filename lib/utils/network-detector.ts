/**
 * Network Detection Utility
 * Tries to find the correct backend server IP address
 */

const POSSIBLE_IPS = [
  '192.168.137.1',  // Mobile hotspot IP (PRIORITY)
  '192.168.31.194', // Current WiFi IP
  '192.168.31.178', // Current gateway IP
  '192.168.18.2',   // Alternative gateway
  '192.168.18.100', // Common router IP
  '192.168.18.254', // Alternative router IP
  '10.0.2.2',       // Android emulator host
  'localhost',       // Localhost fallback
  '127.0.0.1',      // Loopback fallback
  '10.145.106.194', // Previous network IP
  '10.145.106.8',   // Previous gateway IP
  '192.168.1.148',  // Previous working network IP
  '192.168.52.2',   // Alternative network IP
  '192.168.56.1',   // Alternative network IP
  '192.168.1.100',  // Common WiFi network
  '192.168.0.100',  // Alternative WiFi network
  '192.168.1.1',    // Router IP
];

const BACKEND_PORT = 3001;

export class NetworkDetector {
  private static cachedIP: string | null = null;
  
  /**
   * Test if a backend server is reachable at the given IP
   */
  static async testConnection(ip: string, port: number = BACKEND_PORT): Promise<boolean> {
    try {
      console.log(`🔗 Testing connection to ${ip}:${port}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout for WiFi
      
      const response = await fetch(`http://${ip}:${port}/api/health`, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        },
        signal: controller.signal,
        mode: 'cors', // Enable CORS
      });
      
      clearTimeout(timeoutId);
      
      const isReachable = response.ok;
      console.log(`🔗 Connection to ${ip}:${port} - ${isReachable ? 'SUCCESS' : 'FAILED'} (Status: ${response.status})`);
      
      return isReachable;
    } catch (error) {
      console.log(`🔗 Connection to ${ip}:${port} - FAILED (${error.message})`);
      return false;
    }
  }
  
  /**
   * Find the correct backend IP by testing multiple possibilities
   */
  static async findBackendIP(): Promise<string | null> {
    // Return cached IP if available
    if (this.cachedIP) {
      console.log(`🔗 Using cached IP: ${this.cachedIP}`);
      const isStillReachable = await this.testConnection(this.cachedIP);
      if (isStillReachable) {
        return this.cachedIP;
      } else {
        console.log(`🔗 Cached IP ${this.cachedIP} no longer reachable, searching again...`);
        this.cachedIP = null;
      }
    }
    
    console.log('🔗 Searching for backend server...');
    
    // Test each possible IP
    for (const ip of POSSIBLE_IPS) {
      const isReachable = await this.testConnection(ip);
      if (isReachable) {
        this.cachedIP = ip;
        console.log(`✅ Found backend server at: ${ip}:${BACKEND_PORT}`);
        return ip;
      }
    }
    
    // If no predefined IPs work, try to scan the current network range
    console.log('🔗 Predefined IPs failed, scanning network range...');
    const networkIP = await this.scanNetworkRange();
    if (networkIP) {
      this.cachedIP = networkIP;
      console.log(`✅ Found backend server via network scan at: ${networkIP}:${BACKEND_PORT}`);
      return networkIP;
    }
    
    console.error('❌ No reachable backend server found');
    return null;
  }

  /**
   * Scan the current network range for backend server
   */
  private static async scanNetworkRange(): Promise<string | null> {
    try {
      // Get current network info (this would need to be implemented based on your platform)
      // For now, we'll scan common ranges
      const commonRanges = [
        '192.168.31', // Current network - scan more thoroughly
        '192.168.137', // Mobile hotspot network
        '192.168.1',  // Common home network
        '192.168.0',  // Alternative home network
        '10.0.0',     // Alternative network
      ];

      for (const range of commonRanges) {
        console.log(`🔗 Scanning network range: ${range}.x`);
        
        // For current network, test more IPs
        const isCurrentNetwork = range === '192.168.31';
        const step = isCurrentNetwork ? 1 : 10; // Test every IP for current network
        
        // Test common IPs in this range
        const testIPs = [];
        for (let i = 1; i <= 254; i += step) {
          testIPs.push(`${range}.${i}`);
        }
        
        // Test in parallel batches
        const batchSize = isCurrentNetwork ? 10 : 5;
        for (let i = 0; i < testIPs.length; i += batchSize) {
          const batch = testIPs.slice(i, i + batchSize);
          const promises = batch.map(ip => this.testConnection(ip));
          const results = await Promise.all(promises);
          
          // Check if any in this batch succeeded
          for (let j = 0; j < results.length; j++) {
            if (results[j]) {
              console.log(`✅ Found backend at: ${batch[j]}`);
              return batch[j];
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ Error during network scan:', error);
    }
    
    return null;
  }
  
  /**
   * Get the complete API base URL
   */
  static async getApiBaseUrl(): Promise<string> {
    const backendIP = await this.findBackendIP();
    
    if (backendIP) {
      return `http://${backendIP}:${BACKEND_PORT}/api`;
    }
    
    // Try multiple fallback URLs
    const fallbackIPs = [
      '192.168.31.194', // Current WiFi IP
      '192.168.31.178', // Gateway
      '10.0.2.2',       // Android emulator
      'localhost',       // Localhost
      '127.0.0.1',      // Loopback
    ];
    
    for (const ip of fallbackIPs) {
      try {
        const isReachable = await this.testConnection(ip);
        if (isReachable) {
          console.log(`✅ Using fallback IP: ${ip}`);
          return `http://${ip}:${BACKEND_PORT}/api`;
        }
      } catch (error) {
        console.log(`❌ Fallback IP ${ip} failed: ${error.message}`);
      }
    }
    
    // Last resort fallback
    console.warn('⚠️ Using last resort fallback API URL');
    return 'http://192.168.31.194:3001/api';
  }
  
  /**
   * Clear cached IP (useful for troubleshooting)
   */
  static clearCache(): void {
    this.cachedIP = null;
    console.log('🔗 Network cache cleared');
  }
}

