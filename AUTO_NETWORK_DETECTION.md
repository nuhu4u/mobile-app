# Auto Network Detection System

## Overview

The Auto Network Detection System automatically detects when you switch WiFi networks and seamlessly updates your app's backend connection without any manual intervention. This ensures your mobile app continues to work when you move between different WiFi networks that are on the same network range.

## How It Works

### 1. Network Change Detection
- **WiFi Monitoring**: Continuously monitors WiFi network changes using React Native's NetInfo
- **SSID Tracking**: Tracks current WiFi network name (SSID) and detects when it changes
- **Connection Status**: Monitors overall network connectivity status

### 2. Automatic Backend Discovery
- **IP Scanning**: When a network change is detected, automatically scans for your backend server
- **Multiple IP Testing**: Tests common IP addresses on the current network range
- **Health Check**: Verifies backend server is reachable by calling `/api/health` endpoint

### 3. Dynamic API URL Updates
- **Service Registration**: All API services register with the dynamic API manager
- **Automatic Updates**: When a new backend IP is found, all services are updated automatically
- **Seamless Switching**: No app restart or manual configuration required

## Key Components

### 1. AutoNetworkDetector (`lib/network/auto-network-detector.ts`)
- Main service that handles network change detection
- Manages WiFi change events and triggers backend scanning
- Provides event system for other components to listen to network changes

### 2. DynamicApiManager (`lib/api/dynamic-api-manager.ts`)
- Manages dynamic API URL updates across all services
- Registers and updates all API services when network changes
- Provides centralized API URL management

### 3. Network Detection Hook (`hooks/use-auto-network-detection.ts`)
- React hook for using auto network detection in components
- Provides real-time network status and configuration options
- Handles automatic initialization and event listening

### 4. Network Status Component (`components/network/auto-network-status.tsx`)
- UI component showing current network status
- Displays current WiFi network and backend IP
- Provides manual scan button for testing

## Configuration

The system can be configured through the `AutoNetworkConfig` interface:

```typescript
interface AutoNetworkConfig {
  enableAutoDetection: boolean;      // Enable/disable auto detection
  scanOnWifiChange: boolean;        // Scan when WiFi network changes
  scanOnConnectionRestore: boolean; // Scan when connection is restored
  notificationEnabled: boolean;     // Show notifications to user
  scanTimeout: number;              // Timeout for backend scanning
  retryAttempts: number;           // Number of retry attempts
}
```

## Usage

### Basic Usage
The system is automatically initialized when the app starts. No additional setup required.

### Using the Hook
```typescript
import { useAutoNetworkDetection } from '@/hooks/use-auto-network-detection';

function MyComponent() {
  const {
    isInitialized,
    isScanning,
    currentSSID,
    lastKnownIP,
    forceScan
  } = useAutoNetworkDetection();

  // Use the network status in your component
}
```

### Manual Scanning
```typescript
// Force a scan for backend server
const discoveredIP = await forceScan();
if (discoveredIP) {
  console.log(`Backend found at: ${discoveredIP}`);
}
```

### Listening to Network Events
```typescript
const { onNetworkChange } = useAutoNetworkDetection();

useEffect(() => {
  const cleanup = onNetworkChange((event) => {
    switch (event.type) {
      case 'wifi_change':
        console.log(`WiFi changed to: ${event.currentSSID}`);
        break;
      case 'ip_discovered':
        console.log(`Backend discovered at: ${event.discoveredIP}`);
        break;
    }
  });

  return cleanup;
}, [onNetworkChange]);
```

## Supported Network Ranges

The system automatically scans these common IP ranges:

- `192.168.1.x` - Most common home WiFi networks
- `192.168.0.x` - Alternative home WiFi networks
- `192.168.52.x` - Some corporate networks
- `192.168.56.x` - Virtual machine networks
- `10.0.2.x` - Android emulator networks
- `10.0.0.x` - Some corporate networks

## Events

The system emits these events:

- **`wifi_change`**: WiFi network changed
- **`connection_lost`**: Network connection lost
- **`connection_restored`**: Network connection restored
- **`ip_discovered`**: Backend server IP discovered

## Testing

Use the Network Test Panel component to test the system:

```typescript
import NetworkTestPanel from '@/components/network/network-test-panel';

// Add to your component
<NetworkTestPanel />
```

The test panel provides:
- Real-time network status
- Manual scan functionality
- API connection testing
- Configuration display
- Test result logging

## Troubleshooting

### Backend Not Found
1. Ensure your backend server is running
2. Check that the server is accessible on the current network
3. Verify the server responds to `/api/health` endpoint
4. Try manual scan using the test panel

### Network Detection Not Working
1. Check that NetInfo permissions are granted
2. Verify auto detection is enabled in configuration
3. Check console logs for error messages
4. Ensure the app has network access permissions

### API Services Not Updating
1. Verify services are registered with DynamicApiManager
2. Check that services implement the ApiService interface
3. Look for error messages in console logs

## Benefits

1. **Seamless Experience**: No manual configuration when switching networks
2. **Automatic Discovery**: Finds backend server automatically
3. **Real-time Updates**: Updates all services instantly
4. **User-Friendly**: Shows network status and provides manual controls
5. **Robust**: Handles network failures and reconnections gracefully
6. **Configurable**: Can be customized for different environments

## Security Considerations

- Only scans common private network ranges
- Uses health check endpoint for verification
- No sensitive data is transmitted during scanning
- All network operations are logged for debugging

## Future Enhancements

- Support for custom IP ranges
- Network quality assessment
- Automatic port detection
- Enhanced error handling and recovery
- Network performance monitoring
