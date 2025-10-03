/**
 * Authentication Cleanup Utility
 * Ensures all authentication data is cleared from storage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export class AuthCleanup {
  /**
   * Clear all authentication-related data from storage
   */
  static async clearAllAuthData(): Promise<void> {
    try {
      console.log('🧹 Clearing all authentication data...');
      
      // List of all possible auth-related storage keys
      const authKeys = [
        'auth-storage',           // Zustand persist storage
        'auth_token',             // Direct token storage
        'refresh_token',          // Refresh token storage
        'user_data',              // User data storage
        'biometric_enabled',      // Biometric settings
        'biometric_data',         // Biometric data
        'offline_data',           // Offline data that might contain auth
        'session_data',           // Session data
        'login_credentials',      // Cached credentials
        'remember_me',            // Remember me settings
      ];

      // Clear all auth-related keys
      await AsyncStorage.multiRemove(authKeys);
      
      // Also clear any keys that might contain auth data
      const allKeys = await AsyncStorage.getAllKeys();
      const authRelatedKeys = allKeys.filter(key => 
        key.includes('auth') || 
        key.includes('token') || 
        key.includes('user') || 
        key.includes('login') ||
        key.includes('session') ||
        key.includes('biometric')
      );
      
      if (authRelatedKeys.length > 0) {
        await AsyncStorage.multiRemove(authRelatedKeys);
        console.log(`🧹 Cleared additional auth keys: ${authRelatedKeys.join(', ')}`);
      }
      
      console.log('✅ All authentication data cleared successfully');
    } catch (error) {
      console.error('❌ Error clearing authentication data:', error);
      throw error;
    }
  }

  /**
   * Check if any authentication data exists in storage
   */
  static async hasStoredAuthData(): Promise<boolean> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const authKeys = allKeys.filter(key => 
        key.includes('auth') || 
        key.includes('token') || 
        key.includes('user') || 
        key.includes('login') ||
        key.includes('session') ||
        key.includes('biometric')
      );
      
      return authKeys.length > 0;
    } catch (error) {
      console.error('❌ Error checking stored auth data:', error);
      return false;
    }
  }

  /**
   * Force logout and clear all data
   */
  static async forceLogout(): Promise<void> {
    await this.clearAllAuthData();
    console.log('🔐 Force logout completed - all auth data cleared');
  }
}

