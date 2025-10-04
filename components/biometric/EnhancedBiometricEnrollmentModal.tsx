/**
 * Enhanced Biometric Enrollment Modal
 * Handles multi-finger enrollment with user-device binding
 */

import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { enhancedBiometricService } from '../../lib/biometric/enhanced-biometric-service';

const { width } = Dimensions.get('window');

interface EnhancedBiometricEnrollmentModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (result: any) => void;
  onError: (error: string) => void;
}

type EnrollmentStep = 'checking' | 'capturing' | 'verifying' | 'processing' | 'success' | 'error';

export default function EnhancedBiometricEnrollmentModal({
  visible,
  onClose,
  onSuccess,
  onError
}: EnhancedBiometricEnrollmentModalProps) {
  const [currentStep, setCurrentStep] = useState<EnrollmentStep>('checking');
  const [availability, setAvailability] = useState<any>(null);
  const [enrollmentStatus, setEnrollmentStatus] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      initializeEnrollment();
    }
  }, [visible]);

  useEffect(() => {
    if (currentStep === 'capturing') {
      startEnrollment();
    }
  }, [currentStep]);

  const initializeEnrollment = async () => {
    try {
      setCurrentStep('checking');
      setError(null);
      setIsProcessing(true);

      // Check biometric availability
      const availabilityResult = await enhancedBiometricService.checkBiometricAvailability();
      setAvailability(availabilityResult);

      if (!availabilityResult.available) {
        throw new Error(availabilityResult.error || 'Biometric authentication not available on this device');
      }

      // Get current enrollment status
      const statusResult = await enhancedBiometricService.getEnrollmentStatus();
      setEnrollmentStatus(statusResult.data);

      setCurrentStep('capturing');
    } catch (error: any) {
      setError(error.message || 'Failed to initialize enrollment');
      setCurrentStep('error');
    } finally {
      setIsProcessing(false);
    }
  };

  const startEnrollment = async () => {
    try {
      setCurrentStep('capturing');
      setError(null);
      setIsProcessing(true);

      // Enroll biometric with default finger type
      const result = await enhancedBiometricService.enrollUserBiometric('right_thumb');

      if (!result.success) {
        throw new Error(result.error || 'Biometric enrollment failed');
      }

      setCurrentStep('success');
      
      // Call success callback
      if (onSuccess) {
        onSuccess(result);
      }

      // Auto-close after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (error: any) {
      setError(error.message || 'Biometric enrollment failed');
      setCurrentStep('error');
      
      if (onError) {
        onError(error.message || 'Biometric enrollment failed');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetry = () => {
    startEnrollment();
  };

  const handleClose = () => {
    setCurrentStep('checking');
    setError(null);
    setIsProcessing(false);
    onClose();
  };


  const renderCheckingStep = () => (
    <View style={styles.stepContainer}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.stepTitle}>Checking Biometric Availability</Text>
      <Text style={styles.stepDescription}>
        Verifying that your device supports biometric authentication...
      </Text>
    </View>
  );


  const renderCapturingStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Ionicons name="finger-print" size={80} color="#007AFF" />
      </View>
      
      <Text style={styles.stepTitle}>Capturing Biometric</Text>
      <Text style={styles.stepDescription}>
        Place your right thumb on the sensor and hold it steady.
      </Text>
      
      <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      
      <Text style={styles.processingText}>Processing your biometric data...</Text>
    </View>
  );

  const renderSuccessStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Ionicons name="checkmark-circle" size={80} color="#34C759" />
      </View>
      
      <Text style={styles.stepTitle}>Enrollment Successful!</Text>
      <Text style={styles.stepDescription}>
        Your biometric has been successfully enrolled on this device.
      </Text>
      
      <View style={styles.successInfo}>
        <Text style={styles.successInfoText}>
          You can now use biometric authentication to vote securely.
        </Text>
      </View>
    </View>
  );

  const renderErrorStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Ionicons name="alert-circle" size={80} color="#FF3B30" />
      </View>
      
      <Text style={styles.stepTitle}>Enrollment Failed</Text>
      <Text style={styles.stepDescription}>
        {error || 'An unexpected error occurred during enrollment.'}
      </Text>
      
      <View style={styles.errorActions}>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'checking':
        return renderCheckingStep();
      case 'capturing':
        return renderCapturingStep();
      case 'success':
        return renderSuccessStep();
      case 'error':
        return renderErrorStep();
      default:
        return renderCheckingStep();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Biometric Enrollment</Text>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {renderCurrentStep()}
        </View>

        {currentStep !== 'success' && currentStep !== 'error' && (
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000'
  },
  closeButton: {
    padding: 8
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  iconContainer: {
    marginBottom: 20
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    marginBottom: 12
  },
  stepDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30
  },
  fingerList: {
    width: '100%',
    maxHeight: 300
  },
  fingerItem: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16
  },
  fingerItemEnrolled: {
    backgroundColor: '#E8F5E8',
    borderWidth: 1,
    borderColor: '#34C759'
  },
  fingerItemContent: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  fingerItemText: {
    fontSize: 16,
    color: '#000',
    marginLeft: 12,
    flex: 1
  },
  fingerItemTextEnrolled: {
    color: '#34C759'
  },
  enrollmentInfo: {
    backgroundColor: '#E8F5E8',
    padding: 12,
    borderRadius: 8,
    marginTop: 20
  },
  enrollmentInfoText: {
    fontSize: 14,
    color: '#34C759',
    textAlign: 'center'
  },
  loader: {
    marginVertical: 20
  },
  processingText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center'
  },
  successInfo: {
    backgroundColor: '#E8F5E8',
    padding: 16,
    borderRadius: 12,
    marginTop: 20
  },
  successInfoText: {
    fontSize: 16,
    color: '#34C759',
    textAlign: 'center'
  },
  errorActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    width: '100%'
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 8
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center'
  },
  cancelButton: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center'
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA'
  }
});
