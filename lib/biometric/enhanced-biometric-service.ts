/**
 * Enhanced Biometric Service
 * Handles user-device biometric binding, multi-finger support, and voting protection
 */

import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../../store/auth-store';
import { apiConfig } from '../config';

// Constants
const BIOMETRIC_KEY = 'biometric_enrollment';
const ENROLLMENT_STATUS_KEY = 'biometric_enrollment_status';
const DEVICE_ID_KEY = 'device_id';
const DEVICE_INFO_KEY = 'device_info';

// Default finger type for enrollment
export type FingerType = 'right_thumb';

// Interfaces
interface BiometricTemplate {
  template_hash: string;
  encrypted_template: string;
  finger_type: FingerType;
  enrollment_date: Date;
}

interface EnrollmentResult {
  success: boolean;
  data?: {
    user_id: string;
    device_id: string;
    finger_type: FingerType;
    biometric_registered: boolean;
    biometric_status: string;
  };
  error?: string;
}

interface VerificationResult {
  success: boolean;
  verified?: boolean;
  confidence?: number;
  template_hash?: string;
  finger_type?: FingerType;
  verification_timestamp?: Date;
  error?: string;
}

interface EnrollmentStatus {
  enrolled: boolean;
  device_id: string;
  finger_types: FingerType[];
  enrollment_count: number;
  enrollments: Array<{
    finger_type: FingerType;
    enrollment_date: Date;
    is_active: boolean;
  }>;
}

class EnhancedBiometricService {
  private deviceId: string | null = null;
  private initializationPromise: Promise<void> | null = null;

  constructor() {
    this.initializationPromise = this.initializeDeviceId();
  }

  /**
   * Get the current device ID
   */
  getDeviceId(): string {
    return this.deviceId || 'unknown-device';
  }

  /**
   * Initialize device ID for user-device binding
   */
  private async initializeDeviceId(): Promise<void> {
    try {
      let deviceId = await SecureStore.getItemAsync(DEVICE_ID_KEY);
      console.log('📱 EnhancedBiometricService: Retrieved device ID from storage:', deviceId);
      
      if (!deviceId) {
        // Generate unique device ID
        deviceId = this.generateDeviceId();
        await SecureStore.setItemAsync(DEVICE_ID_KEY, deviceId);
        console.log('📱 EnhancedBiometricService: Generated new device ID:', deviceId);
      }
      
      this.deviceId = deviceId;
      console.log('📱 EnhancedBiometricService: Device ID initialized:', deviceId);
    } catch (error) {
      console.error('❌ EnhancedBiometricService: Error initializing device ID:', error);
    }
  }

  /**
   * Generate unique device ID
   */
  private generateDeviceId(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 15);
    return `device_${timestamp}_${random}`;
  }

  /**
   * Get device information for API calls
   */
  private async getDeviceInfo(): Promise<any> {
    try {
      const deviceInfo = await SecureStore.getItemAsync(DEVICE_INFO_KEY);
      return deviceInfo ? JSON.parse(deviceInfo) : {};
    } catch (error) {
      console.error('❌ Error getting device info:', error);
      return {};
    }
  }

  /**
   * Set device information
   */
  private async setDeviceInfo(info: any): Promise<void> {
    try {
      await SecureStore.setItemAsync(DEVICE_INFO_KEY, JSON.stringify(info));
    } catch (error) {
      console.error('❌ Error setting device info:', error);
    }
  }

  /**
   * Check if biometric authentication is available on device
   */
  async checkBiometricAvailability(): Promise<{
    available: boolean;
    enrolled: boolean;
    types: LocalAuthentication.AuthenticationType[];
    error?: string;
  }> {
    try {
      console.log('🔍 Checking biometric availability...');
      
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      console.log('📱 Biometric hardware available:', hasHardware);
      console.log('👆 Biometric enrolled:', enrolled);
      console.log('🔐 Supported types:', supportedTypes);
      
      return {
        available: hasHardware && enrolled,
        enrolled,
        types: supportedTypes
      };
    } catch (error: any) {
      console.error('❌ Error checking biometric availability:', error);
      return {
        available: false,
        enrolled: false,
        types: [],
        error: error.message || 'Failed to check biometric availability'
      };
    }
  }

  /**
   * Get user's enrollment status on current device
   */
  async getEnrollmentStatus(): Promise<{
    success: boolean;
    data?: EnrollmentStatus;
    error?: string;
  }> {
    try {
      // Wait for device ID initialization to complete
      if (this.initializationPromise) {
        await this.initializationPromise;
      }
      
      console.log('🔍 EnhancedBiometricService: Getting enrollment status...');
      console.log('🔍 EnhancedBiometricService: Device ID:', this.deviceId);
      
      const user = useAuthStore.getState().user;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const token = useAuthStore.getState().token;
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${apiConfig.baseUrl}/enhanced-biometric/user-status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'device-id': this.deviceId || 'unknown'
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to get enrollment status');
      }

      console.log('✅ EnhancedBiometricService: Enrollment status retrieved:', result.data);
      return {
        success: true,
        data: result.data
      };
    } catch (error: any) {
      console.error('❌ EnhancedBiometricService: Error getting enrollment status:', error);
      return {
        success: false,
        error: error.message || 'Failed to get enrollment status'
      };
    }
  }

  /**
   * Capture biometric template for enrollment
   */
  private async captureBiometricTemplate(fingerType: FingerType): Promise<{
    success: boolean;
    template?: BiometricTemplate;
    error?: string;
  }> {
    try {
      console.log(`👆 Capturing biometric template for ${fingerType}...`);
      
      // Check availability first
      const availability = await this.checkBiometricAvailability();
      if (!availability.available) {
        throw new Error('Biometric authentication not available on this device');
      }

      // Prompt for biometric authentication
      const authResult = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Place your right thumb on the sensor',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false
      });

      if (!authResult.success) {
        throw new Error(authResult.error || 'Biometric authentication failed');
      }

      // Generate template from authentication result
      const templateHash = this.generateTemplateHash(authResult, fingerType);
      const encryptedTemplate = this.encryptTemplate(authResult, fingerType);

      const template: BiometricTemplate = {
        template_hash: templateHash,
        encrypted_template: encryptedTemplate,
        finger_type: fingerType,
        enrollment_date: new Date()
      };

      console.log(`✅ Biometric template captured for ${fingerType}`);
      return {
        success: true,
        template
      };
    } catch (error: any) {
      console.error(`❌ Error capturing biometric template for ${fingerType}:`, error);
      return {
        success: false,
        error: error.message || `Failed to capture biometric template for ${fingerType}`
      };
    }
  }

  /**
   * Generate template hash from authentication result
   */
  private generateTemplateHash(authResult: LocalAuthentication.LocalAuthenticationResult, fingerType: FingerType): string {
    const data = {
      success: authResult.success,
      error: authResult.error,
      warning: authResult.warning,
      finger_type: fingerType,
      timestamp: Date.now(),
      device_id: this.deviceId
    };
    
    // Simple hash generation (in real implementation, this would use cryptographic hashing)
    const hashInput = JSON.stringify(data);
    return this.hashString(hashInput);
  }

  /**
   * Encrypt template data
   */
  private encryptTemplate(authResult: LocalAuthentication.LocalAuthenticationResult, fingerType: FingerType): string {
    const data = {
      auth_result: authResult,
      finger_type: fingerType,
      timestamp: Date.now(),
      device_id: this.deviceId
    };
    
    // Simple encryption (in real implementation, this would use proper encryption)
    return btoa(JSON.stringify(data));
  }

  /**
   * Hash string using simple algorithm
   */
  private hashString(input: string): string {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }

  /**
   * Enroll user biometric on current device
   */
  async enrollUserBiometric(fingerType: FingerType): Promise<EnrollmentResult> {
    try {
      // Wait for device ID initialization to complete
      if (this.initializationPromise) {
        await this.initializationPromise;
      }
      
      console.log(`🔐 EnhancedBiometricService: Enrolling biometric for ${fingerType}...`);
      console.log(`🔐 EnhancedBiometricService: Using device ID: ${this.deviceId}`);
      
      // Capture biometric template
      const captureResult = await this.captureBiometricTemplate(fingerType);
      if (!captureResult.success || !captureResult.template) {
        throw new Error(captureResult.error || 'Failed to capture biometric template');
      }

      const user = useAuthStore.getState().user;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const token = useAuthStore.getState().token;
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Send enrollment request to backend
      console.log(`🔐 EnhancedBiometricService: Sending enrollment request with device ID: ${this.deviceId}`);
      const response = await fetch(`${apiConfig.baseUrl}/enhanced-biometric/enroll-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'device-id': this.deviceId || 'unknown'
        },
        body: JSON.stringify({
          template_hash: captureResult.template.template_hash,
          encrypted_template: captureResult.template.encrypted_template,
          finger_type: fingerType
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to enroll biometric');
      }

      console.log(`✅ Biometric enrolled successfully for ${fingerType}`);
      return {
        success: true,
        data: result.data
      };
    } catch (error: any) {
      console.error(`❌ Error enrolling biometric for ${fingerType}:`, error);
      return {
        success: false,
        error: error.message || `Failed to enroll biometric for ${fingerType}`
      };
    }
  }

  /**
   * Verify user biometric for voting
   */
  async verifyUserBiometric(): Promise<VerificationResult> {
    try {
      console.log('🔐 Verifying biometric for voting...');
      
      // Check availability first
      const availability = await this.checkBiometricAvailability();
      if (!availability.available) {
        throw new Error('Biometric authentication not available on this device');
      }

      // Get enrollment status
      const enrollmentStatus = await this.getEnrollmentStatus();
      if (!enrollmentStatus.success || !enrollmentStatus.data?.enrolled) {
        throw new Error(`User not enrolled on this device (${this.deviceId || 'unknown'}). Please enroll your biometric on this device first.`);
      }

      // Prompt for biometric authentication
      const authResult = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Place your enrolled finger on the sensor to verify your identity',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false
      });

      if (!authResult.success) {
        throw new Error(authResult.error || 'Biometric authentication failed');
      }

      // Generate verification template
      const verificationTemplate = this.generateTemplateHash(authResult, 'verification');

      const user = useAuthStore.getState().user;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const token = useAuthStore.getState().token;
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Send verification request to backend
      const response = await fetch(`${apiConfig.baseUrl}/enhanced-biometric/verify-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'device-id': this.deviceId || 'unknown'
        },
        body: JSON.stringify({
          template_hash: verificationTemplate
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Biometric verification failed');
      }

      console.log('✅ Biometric verification successful');
      console.log('🔍 Verification result:', result);
      
      // Backend returns { success: true, data: { verified, confidence, ... } }
      const verificationData = result.data || result;
      
      return {
        success: true,
        verified: verificationData.verified,
        confidence: verificationData.confidence,
        template_hash: verificationData.template_hash,
        finger_type: verificationData.finger_type,
        verification_timestamp: new Date(verificationData.verification_timestamp)
      };
    } catch (error: any) {
      console.error('❌ Error verifying biometric:', error);
      return {
        success: false,
        error: error.message || 'Biometric verification failed'
      };
    }
  }

  /**
   * Delete user's biometric enrollment on current device
   */
  async deleteUserBiometric(fingerType?: FingerType): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      console.log(`🗑️ Deleting biometric enrollment for ${fingerType || 'all'}...`);
      
      const user = useAuthStore.getState().user;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const token = useAuthStore.getState().token;
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Send deletion request to backend
      const response = await fetch(`${apiConfig.baseUrl}/enhanced-biometric/delete-user`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'device-id': this.deviceId || 'unknown'
        },
        body: JSON.stringify({
          finger_type: fingerType
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete biometric enrollment');
      }

      console.log(`✅ Biometric enrollment deleted for ${fingerType || 'all'}`);
      return {
        success: true,
        data: result.data
      };
    } catch (error: any) {
      console.error(`❌ Error deleting biometric enrollment for ${fingerType || 'all'}:`, error);
      return {
        success: false,
        error: error.message || `Failed to delete biometric enrollment for ${fingerType || 'all'}`
      };
    }
  }

  /**
   * Check if user is enrolled on current device
   */
  async isBiometricEnrolled(): Promise<boolean> {
    try {
      const enrollmentStatus = await this.getEnrollmentStatus();
      return enrollmentStatus.success && enrollmentStatus.data?.enrolled === true;
    } catch (error) {
      console.error('❌ Error checking enrollment status:', error);
      return false;
    }
  }

  /**
   * Get device ID
   */
  getDeviceId(): string | null {
    return this.deviceId;
  }

  /**
   * Clear all biometric data from device
   */
  async clearBiometricData(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(BIOMETRIC_KEY);
      await SecureStore.deleteItemAsync(ENROLLMENT_STATUS_KEY);
      await SecureStore.deleteItemAsync(DEVICE_INFO_KEY);
      console.log('✅ Biometric data cleared from device');
    } catch (error) {
      console.error('❌ Error clearing biometric data:', error);
    }
  }
}

// Export singleton instance
export const enhancedBiometricService = new EnhancedBiometricService();
export default enhancedBiometricService;
