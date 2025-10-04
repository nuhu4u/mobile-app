import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NetworkDetector } from '@/lib/utils/network-detector';

interface ApiConfigModalProps {
  visible: boolean;
  onClose: () => void;
  onApiUrlChange: (newUrl: string) => void;
}

export const ApiConfigModal: React.FC<ApiConfigModalProps> = ({
  visible,
  onClose,
  onApiUrlChange,
}) => {
  const [customIP, setCustomIP] = useState('');
  const [port, setPort] = useState('3001');
  const [testing, setTesting] = useState(false);
  const [currentApiUrl, setCurrentApiUrl] = useState('');

  useEffect(() => {
    loadCurrentConfig();
  }, [visible]);

  const loadCurrentConfig = async () => {
    try {
      const savedIP = await AsyncStorage.getItem('custom_backend_ip');
      const savedPort = await AsyncStorage.getItem('custom_backend_port');
      
      if (savedIP) setCustomIP(savedIP);
      if (savedPort) setPort(savedPort);
      
      const { apiConfig } = await import('@/lib/config');
      setCurrentApiUrl(apiConfig.baseUrl);
    } catch (error) {
      console.error('Error loading config:', error);
    }
  };

  const testConnection = async (ip: string, testPort: string) => {
    setTesting(true);
    try {
      const isReachable = await NetworkDetector.testConnection(ip, parseInt(testPort));
      
      if (isReachable) {
        Alert.alert(
          'Connection Successful! ✅',
          `Backend server is reachable at ${ip}:${testPort}`,
          [{ text: 'OK' }]
        );
        return true;
      } else {
        Alert.alert(
          'Connection Failed ❌',
          `Cannot reach backend server at ${ip}:${testPort}\n\nPlease check:\n• IP address is correct\n• Backend server is running\n• Port ${testPort} is open`,
          [{ text: 'OK' }]
        );
        return false;
      }
    } catch (error) {
      Alert.alert(
        'Connection Error ❌',
        `Error testing connection: ${error}`,
        [{ text: 'OK' }]
      );
      return false;
    } finally {
      setTesting(false);
    }
  };

  const saveAndApply = async () => {
    if (!customIP.trim()) {
      Alert.alert('Error', 'Please enter an IP address');
      return;
    }

    // Test connection first
    const isConnected = await testConnection(customIP.trim(), port);
    
    if (isConnected) {
      try {
        // Save to AsyncStorage
        await AsyncStorage.setItem('custom_backend_ip', customIP.trim());
        await AsyncStorage.setItem('custom_backend_port', port);
        
        const newApiUrl = `http://${customIP.trim()}:${port}/api`;
        onApiUrlChange(newApiUrl);
        
        Alert.alert(
          'Configuration Saved ✅',
          `API URL updated to: ${newApiUrl}\n\nThe app will now use this backend server.`,
          [
            {
              text: 'OK',
              onPress: onClose,
            },
          ]
        );
      } catch (error) {
        Alert.alert('Error', `Failed to save configuration: ${error}`);
      }
    }
  };

  const autoDetect = async () => {
    setTesting(true);
    try {
      const detectedIP = await NetworkDetector.findBackendIP();
      
      if (detectedIP) {
        setCustomIP(detectedIP);
        Alert.alert(
          'Auto-Detection Successful! 🎯',
          `Found backend server at: ${detectedIP}:${port}`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Auto-Detection Failed 🔍',
          'Could not automatically find the backend server.\n\nPlease enter the IP address manually.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', `Auto-detection failed: ${error}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>API Configuration</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#64748b" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.subtitle}>Backend Server Configuration</Text>
          
          <View style={styles.currentConfig}>
            <Text style={styles.label}>Current API URL:</Text>
            <Text style={styles.currentUrl}>{currentApiUrl}</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Backend IP Address:</Text>
            <TextInput
              style={styles.input}
              value={customIP}
              onChangeText={setCustomIP}
              placeholder="e.g., 192.168.1.100 or 172.20.10.2"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Port:</Text>
            <TextInput
              style={styles.input}
              value={port}
              onChangeText={setPort}
              placeholder="3001"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.button, styles.autoDetectButton]}
              onPress={autoDetect}
              disabled={testing}
            >
              {testing ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="search" size={16} color="white" />
              )}
              <Text style={styles.autoDetectButtonText}>Auto-Detect</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.testButton]}
              onPress={() => testConnection(customIP.trim(), port)}
              disabled={testing || !customIP.trim()}
            >
              {testing ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="wifi" size={16} color="white" />
              )}
              <Text style={styles.testButtonText}>Test Connection</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={saveAndApply}
            disabled={testing || !customIP.trim()}
          >
            <Ionicons name="save" size={16} color="white" />
            <Text style={styles.saveButtonText}>Save & Apply</Text>
          </TouchableOpacity>

          <View style={styles.helpText}>
            <Text style={styles.helpTitle}>💡 Help:</Text>
            <Text style={styles.helpContent}>
              • Make sure your backend server is running on port {port}
              {'\n'}• Use the same network as your mobile device
              {'\n'}• Try &quot;Auto-Detect&quot; to find the server automatically
              {'\n'}• Common IPs: 192.168.1.x, 192.168.0.x, 172.20.10.x
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 20,
  },
  currentConfig: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  currentUrl: {
    fontSize: 14,
    color: '#6b7280',
    fontFamily: 'monospace',
    backgroundColor: '#f1f5f9',
    padding: 8,
    borderRadius: 6,
  },
  inputGroup: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
    color: '#1e293b',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  autoDetectButton: {
    flex: 1,
    backgroundColor: '#7c3aed',
  },
  autoDetectButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  testButton: {
    flex: 1,
    backgroundColor: '#0ea5e9',
  },
  testButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#16a34a',
    marginBottom: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  helpText: {
    backgroundColor: '#fef3c7',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fcd34d',
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 8,
  },
  helpContent: {
    fontSize: 13,
    color: '#92400e',
    lineHeight: 18,
  },
});

