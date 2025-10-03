/**
 * Hook for Auto Network Detection
 * Provides network change detection and automatic API URL updates
 */

import { useState, useEffect, useCallback } from 'react';
import { autoNetworkDetector, NetworkChangeEvent } from '@/lib/network/auto-network-detector';
import { dynamicApiManager } from '@/lib/api/dynamic-api-manager';

export interface UseAutoNetworkDetectionReturn {
  isInitialized: boolean;
  isScanning: boolean;
  currentSSID: string | null;
  lastKnownIP: string | null;
  isMonitoring: boolean;
  config: any;
  initialize: () => Promise<boolean>;
  forceScan: () => Promise<string | null>;
  updateConfig: (config: Partial<any>) => Promise<void>;
  onNetworkChange: (callback: (event: NetworkChangeEvent) => void) => () => void;
}

export function useAutoNetworkDetection(): UseAutoNetworkDetectionReturn {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [currentSSID, setCurrentSSID] = useState<string | null>(null);
  const [lastKnownIP, setLastKnownIP] = useState<string | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [config, setConfig] = useState(autoNetworkDetector.getConfig());

  // Initialize auto network detection
  const initialize = useCallback(async (): Promise<boolean> => {
    try {
      console.log('🚀 Initializing auto network detection...');
      const success = await autoNetworkDetector.initialize();
      setIsInitialized(success);
      
      if (success) {
        // Update state with current status
        const status = autoNetworkDetector.getStatus();
        setIsScanning(status.isScanning);
        setCurrentSSID(status.currentSSID);
        setLastKnownIP(status.lastKnownIP);
        setIsMonitoring(status.isMonitoring);
        
        // Load current config
        setConfig(autoNetworkDetector.getConfig());
      }
      
      return success;
    } catch (error) {
      console.error('❌ Failed to initialize auto network detection:', error);
      return false;
    }
  }, []);

  // Force scan for backend
  const forceScan = useCallback(async (): Promise<string | null> => {
    try {
      setIsScanning(true);
      const discoveredIP = await autoNetworkDetector.forceScan();
      
      if (discoveredIP) {
        setLastKnownIP(discoveredIP);
        // Update all API services with new URL
        await dynamicApiManager.updateAllServices(`http://${discoveredIP}:3001/api`);
      }
      
      return discoveredIP;
    } catch (error) {
      console.error('❌ Error during force scan:', error);
      return null;
    } finally {
      setIsScanning(false);
    }
  }, []);

  // Update configuration
  const updateConfig = useCallback(async (newConfig: Partial<any>): Promise<void> => {
    try {
      await autoNetworkDetector.saveConfig(newConfig);
      setConfig(autoNetworkDetector.getConfig());
    } catch (error) {
      console.error('❌ Error updating config:', error);
    }
  }, []);

  // Add network change listener
  const onNetworkChange = useCallback((callback: (event: NetworkChangeEvent) => void) => {
    autoNetworkDetector.addEventListener('wifi_change', callback);
    autoNetworkDetector.addEventListener('connection_lost', callback);
    autoNetworkDetector.addEventListener('connection_restored', callback);
    autoNetworkDetector.addEventListener('ip_discovered', callback);

    // Return cleanup function
    return () => {
      autoNetworkDetector.removeEventListener('wifi_change', callback);
      autoNetworkDetector.removeEventListener('connection_lost', callback);
      autoNetworkDetector.removeEventListener('connection_restored', callback);
      autoNetworkDetector.removeEventListener('ip_discovered', callback);
    };
  }, []);

  // Set up event listeners for status updates
  useEffect(() => {
    if (!isInitialized) return;

    const handleNetworkChange = (event: NetworkChangeEvent) => {
      console.log('🔄 Network change event:', event);
      
      // Update state based on event type
      switch (event.type) {
        case 'wifi_change':
          setCurrentSSID(event.currentSSID || null);
          break;
        case 'ip_discovered':
          if (event.discoveredIP) {
            setLastKnownIP(event.discoveredIP);
          }
          break;
        case 'connection_lost':
          setIsMonitoring(false);
          break;
        case 'connection_restored':
          setIsMonitoring(true);
          break;
      }
    };

    // Add listeners for all event types
    const cleanup = onNetworkChange(handleNetworkChange);

    return cleanup;
  }, [isInitialized, onNetworkChange]);

  // Auto-initialize on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  return {
    isInitialized,
    isScanning,
    currentSSID,
    lastKnownIP,
    isMonitoring,
    config,
    initialize,
    forceScan,
    updateConfig,
    onNetworkChange,
  };
}
