/**
 * Auto Network Status Component
 * Shows current network status and auto-detection information
 */

import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAutoNetworkDetection } from '@/hooks/use-auto-network-detection';

interface AutoNetworkStatusProps {
  showDetails?: boolean;
  onForceScan?: () => void;
}

export const AutoNetworkStatus: React.FC<AutoNetworkStatusProps> = ({
  showDetails = false,
  onForceScan,
}) => {
  const {
    isInitialized,
    isScanning,
    currentSSID,
    lastKnownIP,
    isMonitoring,
    forceScan,
  } = useAutoNetworkDetection();

  const handleForceScan = async () => {
    if (onForceScan) {
      onForceScan();
    }
    await forceScan();
  };

  if (!isInitialized) {
    return (
      <View className="bg-yellow-100 p-3 rounded-lg">
        <Text className="text-yellow-800 text-sm">
          🔄 Initializing network detection...
        </Text>
      </View>
    );
  }

  return (
    <View className="bg-blue-50 p-3 rounded-lg">
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-blue-800 font-medium text-sm">
            🌐 Network Status
          </Text>
          
          {showDetails && (
            <View className="mt-2 space-y-1">
              <Text className="text-blue-700 text-xs">
                WiFi: {currentSSID || 'Unknown'}
              </Text>
              <Text className="text-blue-700 text-xs">
                Backend: {lastKnownIP || 'Not found'}
              </Text>
              <Text className="text-blue-700 text-xs">
                Monitoring: {isMonitoring ? 'Active' : 'Inactive'}
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          onPress={handleForceScan}
          disabled={isScanning}
          className="bg-blue-600 px-3 py-2 rounded-md flex-row items-center"
        >
          {isScanning ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-white text-xs font-medium">
              🔍 Scan
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {isScanning && (
        <View className="mt-2">
          <Text className="text-blue-600 text-xs">
            🔍 Scanning for backend server...
          </Text>
        </View>
      )}
    </View>
  );
};

export default AutoNetworkStatus;
