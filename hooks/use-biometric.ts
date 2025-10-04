import { useState, useEffect } from 'react';
import { biometricService, BiometricStatus } from '@/lib/auth/biometric-service';
import { realBiometricService } from '@/lib/biometric/real-biometric-service';
import { enhancedBiometricService } from '@/lib/biometric/enhanced-biometric-service';

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

  const enrollBiometric = async (_fingerprint1?: string, _fingerprint2?: string) => {
    try {
      setLoading(true);
      setError(null);

      // Use real biometric enrollment instead of mock data
      console.log('⚠️ Deprecated: enrollBiometric with mock data. Use BiometricEnrollmentModal instead.');
      
      // For backward compatibility, just refresh status
      await refreshStatus();
      
      console.log('✅ Biometric enrollment should be done via BiometricEnrollmentModal');
    } catch (err: any) {
      console.error('Failed to enroll biometric:', err);
      setError(err.message || 'Failed to enroll biometric');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyBiometric = async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Use real biometric verification instead of mock data
      console.log('⚠️ Deprecated: verifyBiometric with mock data. Use realBiometricService instead.');
      
      // For backward compatibility, use real biometric service
      const result = await realBiometricService.testBiometricAuthentication();
      
      if (result.success) {
        console.log('✅ Real biometric verification successful');
        return true;
      } else {
        console.log('❌ Real biometric verification failed');
        return false;
      }
    } catch (err: any) {
      console.error('Failed to verify biometric:', err);
      setError(err.message || 'Failed to verify biometric');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const verifyBiometricForVoting = async (_electionId?: string): Promise<any> => {
    try {
      setLoading(true);
      setError(null);

      console.log('🗳️ Starting enhanced biometric verification for voting...');

      // Use enhanced biometric service for voting verification
      const result = await enhancedBiometricService.verifyUserBiometric();
      
      if (result.success && result.verified) {
        console.log('✅ Enhanced biometric verification for voting successful');
        console.log('🔐 Verification data:', {
          verified: result.verified,
          confidence: result.confidence,
          template_hash: result.template_hash?.substring(0, 20) + '...',
          finger_type: result.finger_type,
          verification_timestamp: result.verification_timestamp
        });
        
        // Return in the format expected by voting modal
        return {
          verified: true,
          confidence: result.confidence,
          template_hash: result.template_hash,
          finger_type: result.finger_type,
          verification_timestamp: result.verification_timestamp,
          device_id: 'mobile-device'
        };
      } else {
        throw new Error(result.error || 'Biometric verification failed');
      }
    } catch (err: any) {
      console.error('❌ Failed to verify biometric for voting:', err);
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
        biometric_data: ''
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
