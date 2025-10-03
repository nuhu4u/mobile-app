/**
 * Auto Network Detection Service
 * Automatically detects network changes and updates API URLs
 */

import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { NetworkDetector } from '@/lib/utils/network-detector';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface NetworkChangeEvent {
  type: 'wifi_change' | 'connection_lost' | 'connection_restored' | 'ip_discovered';
  previousSSID?: string;
  currentSSID?: string;
  discoveredIP?: string;
  timestamp: number;
}

export interface AutoNetworkConfig {
  enableAutoDetection: boolean;
  scanOnWifiChange: boolean;
  scanOnConnectionRestore: boolean;
  notificationEnabled: boolean;
  scanTimeout: number;
  retryAttempts: number;
}

class AutoNetworkDetector {
  private static instance: AutoNetworkDetector;
  private config: AutoNetworkConfig;
  private isMonitoring: boolean = false;
  private unsubscribe: (() => void) | null = null;
  private currentSSID: string | null = null;
  private lastKnownIP: string | null = null;
  private eventListeners: Map<string, ((event: NetworkChangeEvent) => void)[]> = new Map();
  private isScanning: boolean = false;

  private constructor() {
    this.config = {
      enableAutoDetection: true,
      scanOnWifiChange: true,
      scanOnConnectionRestore: true,
      notificationEnabled: true,
      scanTimeout: 10000, // 10 seconds
      retryAttempts: 3,
    };
  }

  static getInstance(): AutoNetworkDetector {
    if (!AutoNetworkDetector.instance) {
      AutoNetworkDetector.instance = new AutoNetworkDetector();
    }
    return AutoNetworkDetector.instance;
  }

  /**
   * Initialize auto network detection
   */
  async initialize(): Promise<boolean> {
    try {
      if (this.isMonitoring) {
        console.log('Auto network detection already initialized');
        return true;
      }

      // Load saved configuration
      await this.loadConfig();
      
      // Load last known IP
      this.lastKnownIP = await AsyncStorage.getItem('last_known_backend_ip');

      // Start monitoring
      this.startMonitoring();

      this.isMonitoring = true;
      console.log('✅ Auto network detection initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize auto network detection:', error);
      return false;
    }
  }

  /**
   * Start monitoring network changes
   */
  private startMonitoring(): void {
    this.unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      this.handleNetworkChange(state);
    });
  }

  /**
   * Handle network state changes
   */
  private async handleNetworkChange(state: NetInfoState): Promise<void> {
    const previousSSID = this.currentSSID;
    const currentSSID = this.getSSIDFromState(state);
    const isConnected = state.isConnected && state.isInternetReachable;
    const isWifi = state.type === 'wifi';

    // Update current SSID
    this.currentSSID = currentSSID;

    console.log('🔄 Network change detected:', {
      previousSSID,
      currentSSID,
      isConnected,
      isWifi,
      type: state.type
    });

    // Handle different network change scenarios
    if (!isConnected) {
      this.emitEvent({
        type: 'connection_lost',
        previousSSID,
        currentSSID: currentSSID || undefined,
        timestamp: Date.now()
      });
      return;
    }

    if (isConnected && previousSSID === null) {
      // Connection restored
      this.emitEvent({
        type: 'connection_restored',
        currentSSID: currentSSID || undefined,
        timestamp: Date.now()
      });

      if (this.config.scanOnConnectionRestore && isWifi) {
        await this.scanForBackend();
      }
      return;
    }

    if (isWifi && previousSSID && previousSSID !== currentSSID) {
      // WiFi network changed
      this.emitEvent({
        type: 'wifi_change',
        previousSSID,
        currentSSID: currentSSID || undefined,
        timestamp: Date.now()
      });

      if (this.config.scanOnWifiChange) {
        await this.scanForBackend();
      }
    }
  }

  /**
   * Extract SSID from network state
   */
  private getSSIDFromState(state: NetInfoState): string | null {
    if (state.type === 'wifi' && state.details && 'ssid' in state.details) {
      return state.details.ssid as string;
    }
    return null;
  }

  /**
   * Scan for backend server and update API URL
   */
  async scanForBackend(): Promise<string | null> {
    if (this.isScanning) {
      console.log('⏳ Backend scan already in progress');
      return null;
    }

    this.isScanning = true;
    console.log('🔍 Scanning for backend server...');

    try {
      // Try the last known IP first
      if (this.lastKnownIP) {
        console.log(`🔍 Trying last known IP: ${this.lastKnownIP}`);
        const isReachable = await NetworkDetector.testConnection(this.lastKnownIP);
        if (isReachable) {
          console.log(`✅ Backend found at last known IP: ${this.lastKnownIP}`);
          await this.updateApiUrl(this.lastKnownIP);
          this.emitEvent({
            type: 'ip_discovered',
            discoveredIP: this.lastKnownIP,
            timestamp: Date.now()
          });
          return this.lastKnownIP;
        }
      }

      // Scan for new IP
      const discoveredIP = await NetworkDetector.findBackendIP();
      if (discoveredIP) {
        console.log(`✅ Backend discovered at: ${discoveredIP}`);
        await this.updateApiUrl(discoveredIP);
        this.lastKnownIP = discoveredIP;
        await AsyncStorage.setItem('last_known_backend_ip', discoveredIP);
        
        this.emitEvent({
          type: 'ip_discovered',
          discoveredIP,
          timestamp: Date.now()
        });
        return discoveredIP;
      } else {
        console.log('❌ Backend server not found on current network');
        this.showNotification('Backend server not found', 'Please check your network connection or server status');
        return null;
      }
    } catch (error) {
      console.error('❌ Error scanning for backend:', error);
      return null;
    } finally {
      this.isScanning = false;
    }
  }

  /**
   * Update API URL across all services
   */
  private async updateApiUrl(newIP: string): Promise<void> {
    try {
      const newApiUrl = `http://${newIP}:3001/api`;
      
      // Update configuration
      await AsyncStorage.setItem('custom_backend_ip', newIP);
      await AsyncStorage.setItem('custom_backend_port', '3001');
      await AsyncStorage.setItem('api_base_url', newApiUrl);

      // Clear network detector cache to force new discovery
      NetworkDetector.clearCache();

      console.log(`✅ API URL updated to: ${newApiUrl}`);
      
      // Show notification
      this.showNotification(
        'Network Updated', 
        `Connected to backend at ${newIP}`
      );
    } catch (error) {
      console.error('❌ Error updating API URL:', error);
    }
  }

  /**
   * Show notification to user
   */
  private showNotification(title: string, message: string): void {
    if (!this.config.notificationEnabled) return;

    // Import Alert dynamically to avoid issues
    import('react-native').then(({ Alert }) => {
      Alert.alert(title, message, [{ text: 'OK' }]);
    });
  }

  /**
   * Load configuration from storage
   */
  private async loadConfig(): Promise<void> {
    try {
      const savedConfig = await AsyncStorage.getItem('auto_network_config');
      if (savedConfig) {
        this.config = { ...this.config, ...JSON.parse(savedConfig) };
      }
    } catch (error) {
      console.error('Error loading auto network config:', error);
    }
  }

  /**
   * Save configuration to storage
   */
  async saveConfig(config: Partial<AutoNetworkConfig>): Promise<void> {
    this.config = { ...this.config, ...config };
    await AsyncStorage.setItem('auto_network_config', JSON.stringify(this.config));
  }

  /**
   * Add event listener
   */
  addEventListener(eventType: string, listener: (event: NetworkChangeEvent) => void): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(listener);
  }

  /**
   * Remove event listener
   */
  removeEventListener(eventType: string, listener: (event: NetworkChangeEvent) => void): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit event to listeners
   */
  private emitEvent(event: NetworkChangeEvent): void {
    const listeners = this.eventListeners.get(event.type) || [];
    listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in event listener:', error);
      }
    });
  }

  /**
   * Get current configuration
   */
  getConfig(): AutoNetworkConfig {
    return { ...this.config };
  }

  /**
   * Get current status
   */
  getStatus(): {
    isMonitoring: boolean;
    isScanning: boolean;
    currentSSID: string | null;
    lastKnownIP: string | null;
  } {
    return {
      isMonitoring: this.isMonitoring,
      isScanning: this.isScanning,
      currentSSID: this.currentSSID,
      lastKnownIP: this.lastKnownIP,
    };
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.isMonitoring = false;
    console.log('🛑 Auto network detection stopped');
  }

  /**
   * Force scan for backend
   */
  async forceScan(): Promise<string | null> {
    console.log('🔄 Force scanning for backend...');
    return await this.scanForBackend();
  }
}

// Export singleton instance
export const autoNetworkDetector = AutoNetworkDetector.getInstance();
export default autoNetworkDetector;
