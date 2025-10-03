import { useState, useEffect } from 'react';
import { biometricService, BiometricStatus, BiometricEnrollmentData } from '@/lib/auth/biometric-service';

export interface UseBiometricReturn {
  biometricStatus: BiometricStatus | null;
  loading: boolean;
  error: string | null;
  isEnrolled: boolean;
  enrollBiometric: (fingerprint1?: string, fingerprint2?: string) => Promise<void>;
  verifyBiometric: () => Promise<boolean>;
  verifyBiometricForVoting: () => Promise<any>;
  deleteBiometric: () => Promise<void>;
  refreshStatus: () => Promise<void>;
}

export function useBiometric(): UseBiometricReturn {
  const [biometricStatus, setBiometricStatus] = useState<BiometricStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEnrolled = biometricStatus?.biometric_registered || false;

  // Load biometric status on mount
  useEffect(() => {
    loadBiometricStatus();
  }, []);

  const loadBiometricStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const status = await biometricService.getBiometricStatus();
      setBiometricStatus(status);
    } catch (err: any) {
      console.error('Failed to load biometric status:', err);
      setError(err.message || 'Failed to load biometric status');
    } finally {
      setLoading(false);
    }
  };

  const enrollBiometric = async (fingerprint1?: string, fingerprint2?: string) => {
    try {
      setLoading(true);
      setError(null);

      // Generate mock fingerprint data (in real app, this would come from device sensor)
      const fp1 = fingerprint1 || biometricService.generateMockFingerprintData();
      const fp2 = fingerprint2 || biometricService.generateMockFingerprintData();
      
      // TODO: Get actual user ID from auth store
      const userId = 'mock-user-id';

      const result = await biometricService.registerBiometric(fp1, fp2, userId);
      setBiometricStatus(result);
      
      console.log('✅ Biometric enrollment successful with double capture');
    } catch (err: any) {
      console.error('Failed to enroll biometric:', err);
      
      // Handle specific error cases
      if (err.message && err.message.includes('already registered')) {
        setError('Biometric is already enrolled for this user');
        // Refresh status to show current enrollment
        await refreshStatus();
      } else {
        setError(err.message || 'Failed to enroll biometric');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyBiometric = async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Generate mock fingerprint data for verification
      const fingerprintData = biometricService.generateMockFingerprintData();
      
      const isVerified = await biometricService.verifyBiometric(fingerprintData);
      
      if (isVerified) {
        console.log('✅ Biometric verification successful');
      } else {
        console.log('❌ Biometric verification failed');
      }
      
      return isVerified;
    } catch (err: any) {
      console.error('Failed to verify biometric:', err);
      setError(err.message || 'Failed to verify biometric');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const verifyBiometricForVoting = async (electionId?: string): Promise<any> => {
    try {
      setLoading(true);
      setError(null);

      // Generate mock fingerprint data for verification
      const fingerprintData = biometricService.generateMockFingerprintData();
      const userId = 'mock-user-id'; // TODO: Get from auth store
      
      const verificationData = await biometricService.verifyBiometricForVoting(fingerprintData, userId, electionId);
      
      if (verificationData) {
        console.log('✅ Biometric verification for voting successful');
        return verificationData;
      } else {
        throw new Error('Biometric verification failed');
      }
    } catch (err: any) {
      console.error('Failed to verify biometric for voting:', err);
      setError(err.message || 'Failed to verify biometric for voting');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteBiometric = async () => {
    try {
      setLoading(true);
      setError(null);

      await biometricService.deleteBiometric();
      
      // Update local state
      setBiometricStatus(prev => prev ? {
        ...prev,
        biometric_registered: false,
        biometric_registered_at: null,
        biometric_data: undefined
      } : null);
      
      console.log('✅ Biometric data deleted successfully');
    } catch (err: any) {
      console.error('Failed to delete biometric:', err);
      setError(err.message || 'Failed to delete biometric data');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshStatus = async () => {
    await loadBiometricStatus();
  };

  return {
    biometricStatus,
    loading,
    error,
    isEnrolled,
    enrollBiometric,
    verifyBiometric,
    verifyBiometricForVoting,
    deleteBiometric,
    refreshStatus,
  };
}
