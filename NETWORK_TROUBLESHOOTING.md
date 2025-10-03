# Network Troubleshooting Guide

## Issue: Mobile App Functions Not Loading Due to Network Change (WiFi)

### Problem Description
The mobile application functions are not loading because the network has changed from a previous configuration to WiFi, and the app is trying to connect to outdated IP addresses that are no longer accessible.

### Root Cause
The mobile app and backend were configured with hardcoded IP addresses from a previous network configuration:
- **Previous Network**: `10.145.106.x` range (cable/ethernet)
- **Current Network**: `192.168.18.x` range (WiFi)
- **Backend Server**: Running on `192.168.18.55:3001` ✅
- **Connection Type**: WiFi (not cable)

### Solution Applied

#### 1. Updated Network Detection Configuration
**File**: `lib/utils/network-detector.ts`
- Added current network IP `192.168.18.55` to the top of the `POSSIBLE_IPS` array
- Added current gateway IP `192.168.18.1` 
- Updated network scanning ranges to include `192.168.18.x`
- Updated fallback API URL to use current network IP

#### 2. Updated API Configuration
**Files**: 
- `constants/api.ts`
- `lib/config.ts`

Changed default API URLs from:
```typescript
// OLD
baseUrl: 'http://192.168.1.148:3001/api'
// or
baseUrl: 'http://10.145.106.194:3001/api'
```

To:
```typescript
// NEW
baseUrl: 'http://192.168.18.55:3001/api'
```

#### 3. Updated Backend Server Configuration
**File**: `E-Voting_WebApp/backend_Vercel/server.js`
- Added WiFi network IPs to CORS configuration:
  ```javascript
  origin: [
    'http://192.168.18.55:3000',  // Current WiFi IP
    'http://192.168.18.55:8081',  // Current WiFi IP for Expo
    'exp://192.168.18.55:8081',   // Current WiFi IP for Expo
    // ... other origins
  ]
  ```
- Updated server logging to show WiFi accessibility
- Server already configured to listen on `0.0.0.0` (all interfaces) ✅

#### 4. Verified WiFi Connectivity
- Confirmed backend server is running on port 3001 ✅
- Tested API health endpoint from WiFi network - working perfectly ✅
- Verified server is accessible from `192.168.18.55:3001` ✅
- Backend responds with status 200 and proper JSON response ✅

### Current WiFi Network Status
- **Connection Type**: WiFi (not cable/ethernet)
- **Current IP**: `192.168.18.55`
- **Gateway**: `192.168.18.1`
- **Network Range**: `192.168.18.x`
- **Backend Port**: `3001`
- **Backend Status**: ✅ Running and accessible
- **API Health Endpoint**: ✅ Responding correctly
- **CORS Configuration**: ✅ Updated for WiFi access

### Auto Network Detection Features

The mobile app includes an auto network detection system that should automatically handle network changes:

#### Features:
1. **WiFi Change Detection**: Monitors WiFi network changes using React Native's NetInfo
2. **Automatic Backend Discovery**: Scans for backend server when network changes
3. **Dynamic API URL Updates**: Updates all API services when new backend is found
4. **Fallback Mechanisms**: Multiple fallback IPs and network ranges

#### How It Works:
1. App initializes auto network detection on startup
2. Monitors network state changes
3. When WiFi changes, automatically scans for backend server
4. Updates all registered API services with new URL
5. Shows network status in UI

### WiFi-Specific Configuration

#### Mobile App WiFi Settings
The mobile app is now configured to work with WiFi networks:
- **Primary WiFi IP**: `192.168.18.55:3001`
- **WiFi Gateway**: `192.168.18.1:3001`
- **Network Detection**: Automatically scans `192.168.18.x` range
- **Fallback URLs**: Updated to use current WiFi IP

#### Backend WiFi Settings
The backend server is configured for WiFi access:
- **Server Binding**: `0.0.0.0:3001` (accessible from all network interfaces)
- **CORS Origins**: Includes WiFi IPs for mobile app access
- **WiFi Logging**: Shows WiFi accessibility in server logs

### Testing the WiFi Fix

#### 1. Test Backend Connection from WiFi
```bash
# Run the connection test
cd E-Voting_MobileApp/voting-app
node test-connection.js
```

#### 2. Test Network Detection for WiFi
```bash
# Run the network detection test
node test-network-detection.js
```

#### 3. Manual WiFi API Test
```bash
# Test API endpoint directly from WiFi network
curl http://192.168.18.55:3001/api/health
```

#### 4. Test from Mobile Device
- Ensure mobile device is connected to same WiFi network
- Check network status component in mobile app
- Use "Scan" button to force network detection

### WiFi Troubleshooting Steps

#### If Mobile App Shows "Something Went Wrong" on Phone:

1. **Test Backend Access from Phone**
   - Open your phone's browser
   - Go to: `http://192.168.18.55:3001/api/health`
   - If this doesn't work, your phone can't reach the backend

2. **Check WiFi Connection**
   - Ensure both computer and mobile device are on same WiFi network
   - Verify WiFi network name (SSID) matches exactly
   - Check WiFi signal strength on mobile device
   - Your phone should get an IP like `192.168.18.x` (same range as computer)

3. **Check Network Status Component**
   - Look for the network status indicator in the app
   - It should show current WiFi SSID and backend IP
   - Use the "Scan" button to force a network scan
   - Should display: `WiFi: [Your WiFi Name]` and `Backend: 192.168.18.55`

4. **Verify WiFi Network Configuration**
   - Check current WiFi IP: `ipconfig` (should show 192.168.18.55)
   - Ensure mobile device gets IP in same range (192.168.18.x)
   - Test WiFi connectivity: `ping 192.168.18.1` (gateway)

5. **Clear App Cache and Restart**
   - Clear AsyncStorage data
   - Restart the mobile app
   - Let auto detection reinitialize with WiFi settings

6. **Manual Network Scan**
   - Use the Network Test Panel component in mobile app
   - Force a manual scan for backend
   - Check test results for WiFi connectivity

7. **Check Backend Server WiFi Access**
   - Ensure backend is running: `netstat -an | findstr :3001`
   - Test health endpoint from WiFi: `curl http://192.168.18.55:3001/api/health`
   - Check server logs for CORS errors
   - Verify server shows "Server accessible from WiFi at: http://192.168.18.55:3001"

8. **WiFi-Specific Issues**
   - Check if WiFi router blocks device-to-device communication
   - Ensure mobile device can access other devices on same network
   - Try connecting mobile device to computer's hotspot for testing
   - Check if firewall is blocking port 3001 on WiFi network

### Network Configuration Files

#### Primary Configuration:
- `lib/utils/network-detector.ts` - Main network detection logic
- `lib/network/auto-network-detector.ts` - Auto detection service
- `lib/api/dynamic-api-manager.ts` - Dynamic API URL management

#### API Configuration:
- `constants/api.ts` - API constants and endpoints
- `lib/config.ts` - App configuration including API URLs

#### Test Files:
- `test-connection.js` - Simple connection test
- `test-network-detection.js` - Network detection test
- `components/network/network-test-panel.tsx` - UI test component

### Future Network Changes

When the network changes again:

1. **Automatic Detection**: The auto network detection should handle it automatically
2. **Manual Update**: If automatic detection fails, update the IP addresses in:
   - `lib/utils/network-detector.ts` (POSSIBLE_IPS array)
   - `constants/api.ts` (API_CONFIG.baseUrl)
   - `lib/config.ts` (config.apiUrl)

3. **Test**: Run the test scripts to verify connectivity

### Monitoring Network Status

The app includes several ways to monitor network status:

1. **AutoNetworkStatus Component**: Shows current network status
2. **NetworkTestPanel Component**: Provides testing and debugging tools
3. **Console Logs**: Detailed logging of network detection activities
4. **AsyncStorage**: Stores last known backend IP for quick recovery

### Best Practices

1. **Always test after network changes**
2. **Keep multiple fallback IPs in configuration**
3. **Monitor console logs for network detection events**
4. **Use the network test panel for debugging**
5. **Keep backend server accessible on current network**

### Summary of WiFi Fix

✅ **Mobile App Updated**:
- Network detection configured for WiFi (`192.168.18.x` range)
- API URLs updated to use WiFi IP (`192.168.18.55:3001`)
- Auto network detection will handle future WiFi changes

✅ **Backend Server Updated**:
- CORS configuration includes WiFi IPs
- Server accessible from WiFi network
- Logging shows WiFi accessibility

✅ **Testing Completed**:
- Backend health endpoint working on WiFi ✅
- Network detection scripts updated ✅
- Connection test confirms WiFi accessibility ✅

### Support

If issues persist:
1. Check console logs for error messages
2. Use the Network Test Panel in the app
3. Verify both devices are on same WiFi network
4. Test WiFi connectivity: `ping 192.168.18.1`
5. Check if WiFi router blocks device communication
6. Ensure mobile device can access other devices on network
