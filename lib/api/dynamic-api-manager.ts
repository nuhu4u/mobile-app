/**
 * Dynamic API Manager
 * Manages dynamic API URL updates across all services
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { NetworkDetector } from '@/lib/utils/network-detector';

export interface ApiService {
  updateBaseUrl: (newUrl: string) => void;
  getBaseUrl: () => string;
}

class DynamicApiManager {
  private static instance: DynamicApiManager;
  private services: Map<string, ApiService> = new Map();
  private currentBaseUrl: string = '';
  private isUpdating: boolean = false;

  private constructor() {
    this.loadCurrentUrl();
  }

  static getInstance(): DynamicApiManager {
    if (!DynamicApiManager.instance) {
      DynamicApiManager.instance = new DynamicApiManager();
    }
    return DynamicApiManager.instance;
  }

  /**
   * Register an API service for dynamic URL updates
   */
  registerService(serviceName: string, service: ApiService): void {
    this.services.set(serviceName, service);
    console.log(`📝 Registered API service: ${serviceName}`);
  }

  /**
   * Unregister an API service
   */
  unregisterService(serviceName: string): void {
    this.services.delete(serviceName);
    console.log(`📝 Unregistered API service: ${serviceName}`);
  }

  /**
   * Update API URL for all registered services
   */
  async updateAllServices(newBaseUrl: string): Promise<boolean> {
    if (this.isUpdating) {
      console.log('⏳ API URL update already in progress');
      return false;
    }

    if (this.currentBaseUrl === newBaseUrl) {
      console.log('✅ API URL is already up to date');
      return true;
    }

    this.isUpdating = true;
    console.log(`🔄 Updating API URL from ${this.currentBaseUrl} to ${newBaseUrl}`);

    try {
      // Update all registered services
      for (const [serviceName, service] of this.services) {
        try {
          service.updateBaseUrl(newBaseUrl);
          console.log(`✅ Updated ${serviceName} with new URL`);
        } catch (error) {
          console.error(`❌ Failed to update ${serviceName}:`, error);
        }
      }

      // Update current URL
      this.currentBaseUrl = newBaseUrl;

      // Save to storage
      await AsyncStorage.setItem('api_base_url', newBaseUrl);

      console.log('✅ All API services updated successfully');
      return true;
    } catch (error) {
      console.error('❌ Error updating API services:', error);
      return false;
    } finally {
      this.isUpdating = false;
    }
  }

  /**
   * Get current base URL
   */
  getCurrentBaseUrl(): string {
    return this.currentBaseUrl;
  }

  /**
   * Load current URL from storage
   */
  private async loadCurrentUrl(): Promise<void> {
    try {
      const savedUrl = await AsyncStorage.getItem('api_base_url');
      if (savedUrl) {
        this.currentBaseUrl = savedUrl;
        console.log(`📱 Loaded API URL from storage: ${savedUrl}`);
      } else {
        // Try to discover URL
        const discoveredUrl = await this.discoverApiUrl();
        if (discoveredUrl) {
          this.currentBaseUrl = discoveredUrl;
        }
      }
    } catch (error) {
      console.error('Error loading current URL:', error);
    }
  }

  /**
   * Discover API URL using NetworkDetector
   */
  private async discoverApiUrl(): Promise<string | null> {
    try {
      const backendIP = await NetworkDetector.findBackendIP();
      if (backendIP) {
        return `http://${backendIP}:3001/api`;
      }
    } catch (error) {
      console.error('Error discovering API URL:', error);
    }
    return null;
  }

  /**
   * Get list of registered services
   */
  getRegisteredServices(): string[] {
    return Array.from(this.services.keys());
  }

  /**
   * Check if a service is registered
   */
  isServiceRegistered(serviceName: string): boolean {
    return this.services.has(serviceName);
  }

  /**
   * Get service by name
   */
  getService(serviceName: string): ApiService | undefined {
    return this.services.get(serviceName);
  }

  /**
   * Force refresh all services with current URL
   */
  async refreshAllServices(): Promise<boolean> {
    if (!this.currentBaseUrl) {
      console.log('❌ No current URL to refresh with');
      return false;
    }

    return await this.updateAllServices(this.currentBaseUrl);
  }

  /**
   * Clear all registered services
   */
  clearServices(): void {
    this.services.clear();
    console.log('🧹 Cleared all registered API services');
  }
}

// Export singleton instance
export const dynamicApiManager = DynamicApiManager.getInstance();
export default dynamicApiManager;
