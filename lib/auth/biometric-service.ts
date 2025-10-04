import { API_CONFIG } from '@/constants/api';
import { EncryptionUtils, EncryptedData } from '@/lib/storage/encryption-utils';
import { useAuthStore } from '@/store/auth-store';

export interface BiometricStatus {
  biometric_registered: boolean;
  biometric_registered_at: string | null;
  biometric_failed_attempts: number;
  last_biometric_used: string | null;
  biometric_data?: string;
  biometric_hash?: string;
  enrollment_verified?: boolean;
  fingerprint_hash?: string;
}

export interface BiometricEnrollmentData {
  fingerprint_data: string;
  fingerprint_data_2: string; // Second fingerprint for verification
  device_id: string;
  user_id: string;
  biometric_hash: string;
  encrypted_data: EncryptedData;
}

export interface BiometricVerificationData {
  fingerprint_data: string;
  biometric_hash: string;
  device_id: string;
  user_id: string;
  timestamp: number;
}

class BiometricService {
  private baseUrl = API_CONFIG.baseUrl;

  /**
   * Get biometric status for the current user
   */
  async getBiometricStatus(): Promise<BiometricStatus> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        console.warn('No authentication token available for biometric status check');
        return {
          biometric_registered: false,
          biometric_registered_at: null,
          biometric_failed_attempts: 0,
          last_biometric_used: null,
        };
      }

      const response = await fetch(`${this.baseUrl}/biometric/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to get biometric status:', error);
      throw new Error('Failed to load biometric status');
    }
  }

  /**
   * Register biometric fingerprint for the current user (with double capture)
   */
  async registerBiometric(fingerprint1: string, fingerprint2: string, userId: string): Promise<BiometricStatus & { fingerprint_hash?: string }> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('Authentication required for biometric registration');
      }

      // Combine both fingerprints for double capture verification
      const combinedFingerprint = fingerprint1 + '|' + fingerprint2;
      
      // Generate biometric hash for verification
      const biometricHash = await EncryptionUtils.generateBiometricHash(
        combinedFingerprint, 
        userId, 
        Date.now()
      );

      // Send data in the format expected by the backend
      const enrollmentData = {
        fingerprintData: combinedFingerprint, // Backend expects 'fingerprintData'
        consent: true, // Backend requires consent
        fingerprint_hash: biometricHash, // Additional hash for verification
        device_id: this.generateDeviceId(),
        user_id: userId,
        enrollment_type: 'double_capture',
        timestamp: Date.now()
      };

      console.log('🔐 Sending biometric enrollment data:', {
        fingerprintData: combinedFingerprint.substring(0, 20) + '...',
        consent: true,
        fingerprint_hash: biometricHash,
        device_id: enrollmentData.device_id,
        user_id: userId
      });

      const response = await fetch(`${this.baseUrl}/biometric/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(enrollmentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Biometric registration failed:', errorData);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Biometric registration successful:', data);
      return data.data || data;
    } catch (error) {
      console.error('Failed to register biometric:', error);
      throw new Error('Failed to register biometric fingerprint');
    }
  }

  /**
   * Verify biometric fingerprint for voting
   */
  async verifyBiometricForVoting(fingerprintData: string, userId: string, electionId?: string): Promise<BiometricVerificationData> {
    try {
      // Generate biometric hash for verification
      const biometricHash = await EncryptionUtils.generateBiometricHash(
        fingerprintData,
        userId,
        Date.now()
      );
      
      // Generate device fingerprint
      const deviceId = await EncryptionUtils.generateDeviceFingerprint();
      
      // Send data in the format expected by the backend
      const verificationRequest = {
        fingerprintData: fingerprintData, // Backend expects 'fingerprintData'
        electionId: electionId || 'unknown', // Backend requires electionId
        fingerprint_hash: biometricHash, // Additional hash for verification
        device_id: deviceId,
        user_id: userId,
        timestamp: Date.now()
      };

      console.log('🔐 Sending biometric verification data:', {
        fingerprintData: fingerprintData.substring(0, 20) + '...',
        electionId: electionId,
        fingerprint_hash: biometricHash,
        device_id: deviceId,
        user_id: userId
      });

      const response = await fetch(`${this.baseUrl}/biometric/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
        body: JSON.stringify(verificationRequest),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Biometric verification failed:', errorData);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Biometric verification successful:', data);
      
      if (data.success && data.data?.verified) {
        return {
          fingerprint_data: fingerprintData,
          biometric_hash: biometricHash,
          device_id: deviceId,
          user_id: userId,
          timestamp: Date.now(),
        };
      } else {
        throw new Error('Biometric verification failed');
      }
    } catch (error) {
      console.error('Failed to verify biometric:', error);
      throw error;
    }
  }

  /**
   * Simple biometric verification (for testing)
   */
  async verifyBiometric(fingerprintData: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/biometric/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
        body: JSON.stringify({ fingerprint_data: fingerprintData }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.verified === true;
    } catch (error) {
      console.error('Failed to verify biometric:', error);
      return false;
    }
  }

  /**
   * Delete biometric data for the current user
   */
  async deleteBiometric(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/biometric/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to delete biometric:', error);
      throw new Error('Failed to delete biometric data');
    }
  }

  /**
   * Get authentication token from storage
   */
  private getAuthToken(): string {
    try {
      const authStore = useAuthStore.getState();
      return authStore.token || '';
    } catch (error) {
      console.warn('Failed to get auth token:', error);
      return '';
    }
  }

  /**
   * Generate device ID for biometric registration
   */
  generateDeviceId(): string {
    // Generate a unique device ID
    return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

}

export const biometricService = new BiometricService();
