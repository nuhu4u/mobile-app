/**
 * Network Test Panel
 * Component for testing and demonstrating auto network detection
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useAutoNetworkDetection } from '@/hooks/use-auto-network-detection';
import { dynamicApiManager } from '@/lib/api/dynamic-api-manager';

export const NetworkTestPanel: React.FC = () => {
  const {
    isInitialized,
    isScanning,
    currentSSID,
    lastKnownIP,
    isMonitoring,
    forceScan,
    config,
  } = useAutoNetworkDetection();

  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handleForceScan = async () => {
    addTestResult('Starting manual scan...');
    const result = await forceScan();
    if (result) {
      addTestResult(`✅ Backend found at: ${result}`);
    } else {
      addTestResult('❌ Backend not found');
    }
  };

  const handleTestApiConnection = async () => {
    try {
      addTestResult('Testing API connection...');
      const currentUrl = dynamicApiManager.getCurrentBaseUrl();
      addTestResult(`Current API URL: ${currentUrl}`);
      
      const response = await fetch(`${currentUrl}/health`);
      if (response.ok) {
        addTestResult('✅ API connection successful');
      } else {
        addTestResult(`❌ API connection failed: ${response.status}`);
      }
    } catch (error) {
      addTestResult(`❌ API connection error: ${error}`);
    }
  };

  const handleClearResults = () => {
    setTestResults([]);
  };

  return (
    <View className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <Text className="text-lg font-bold text-gray-800 mb-4">
        🔧 Network Test Panel
      </Text>

      {/* Status Display */}
      <View className="mb-4 p-3 bg-gray-50 rounded-lg">
        <Text className="font-semibold text-gray-700 mb-2">Current Status:</Text>
        <Text className="text-sm text-gray-600">
          • Initialized: {isInitialized ? '✅' : '❌'}
        </Text>
        <Text className="text-sm text-gray-600">
          • Monitoring: {isMonitoring ? '✅' : '❌'}
        </Text>
        <Text className="text-sm text-gray-600">
          • Scanning: {isScanning ? '🔄' : '⏸️'}
        </Text>
        <Text className="text-sm text-gray-600">
          • WiFi: {currentSSID || 'Unknown'}
        </Text>
        <Text className="text-sm text-gray-600">
          • Backend IP: {lastKnownIP || 'Not found'}
        </Text>
      </View>

      {/* Action Buttons */}
      <View className="mb-4 space-y-2">
        <TouchableOpacity
          onPress={handleForceScan}
          disabled={isScanning}
          className={`p-3 rounded-lg ${isScanning ? 'bg-gray-300' : 'bg-blue-500'}`}
        >
          <Text className={`text-center font-medium ${isScanning ? 'text-gray-600' : 'text-white'}`}>
            {isScanning ? '🔄 Scanning...' : '🔍 Force Scan for Backend'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleTestApiConnection}
          className="p-3 bg-green-500 rounded-lg"
        >
          <Text className="text-center font-medium text-white">
            🧪 Test API Connection
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleClearResults}
          className="p-3 bg-gray-500 rounded-lg"
        >
          <Text className="text-center font-medium text-white">
            🗑️ Clear Results
          </Text>
        </TouchableOpacity>
      </View>

      {/* Test Results */}
      {testResults.length > 0 && (
        <View className="mb-4">
          <Text className="font-semibold text-gray-700 mb-2">Test Results:</Text>
          <ScrollView className="max-h-32 bg-gray-50 p-2 rounded-lg">
            {testResults.map((result, index) => (
              <Text key={index} className="text-xs text-gray-600 mb-1">
                {result}
              </Text>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Configuration Info */}
      <View className="p-3 bg-blue-50 rounded-lg">
        <Text className="font-semibold text-blue-800 mb-2">Configuration:</Text>
        <Text className="text-xs text-blue-700">
          • Auto Detection: {config.enableAutoDetection ? 'Enabled' : 'Disabled'}
        </Text>
        <Text className="text-xs text-blue-700">
          • Scan on WiFi Change: {config.scanOnWifiChange ? 'Yes' : 'No'}
        </Text>
        <Text className="text-xs text-blue-700">
          • Scan on Connection Restore: {config.scanOnConnectionRestore ? 'Yes' : 'No'}
        </Text>
        <Text className="text-xs text-blue-700">
          • Notifications: {config.notificationEnabled ? 'Enabled' : 'Disabled'}
        </Text>
      </View>
    </View>
  );
};

export default NetworkTestPanel;
