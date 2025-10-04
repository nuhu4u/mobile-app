/**
 * Enhanced Biometric Voting Modal
 * Handles biometric verification during voting with user-device binding
 */

import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { enhancedBiometricService } from '../../lib/biometric/enhanced-biometric-service';

interface EnhancedBiometricVotingModalProps {
  visible: boolean;
  electionId: string;
  candidateId: string;
  candidateName: string;
  onClose: () => void;
  onSuccess: (verificationData: any) => void;
  onError: (error: string) => void;
}

type VerificationStep = 'preparing' | 'verifying' | 'success' | 'error';

export default function EnhancedBiometricVotingModal({
  visible,
  electionId,
  candidateId,
  candidateName,
  onClose,
  onSuccess,
  onError
}: EnhancedBiometricVotingModalProps) {
  const [currentStep, setCurrentStep] = useState<VerificationStep>('preparing');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      startVerification();
    }
  }, [visible]);

  const startVerification = async () => {
    try {
      setCurrentStep('preparing');
      setError(null);
      setIsProcessing(true);

      // Check if user is enrolled
      const enrollmentStatus = await enhancedBiometricService.getEnrollmentStatus();
      if (!enrollmentStatus.success || !enrollmentStatus.data?.enrolled) {
        throw new Error('You must enroll your biometric before voting');
      }

      // Start biometric verification
      setCurrentStep('verifying');
      console.log('🔐 EnhancedBiometricVotingModal: Starting biometric verification...');
      const verificationResult = await enhancedBiometricService.verifyUserBiometric();
      console.log('🔐 EnhancedBiometricVotingModal: Verification result:', verificationResult);

      if (!verificationResult.success) {
        console.log('❌ EnhancedBiometricVotingModal: Verification failed:', verificationResult.error);
        throw new Error(verificationResult.error || 'Biometric verification failed');
      }

      if (!verificationResult.verified) {
        console.log('❌ EnhancedBiometricVotingModal: Verification result.verified is false');
        throw new Error('Biometric verification failed. Please try again.');
      }

      // Check confidence threshold (only if confidence is provided)
      const confidence = verificationResult.confidence;
      console.log('🔐 EnhancedBiometricVotingModal: Confidence value:', confidence);
      
      // Skip confidence check if confidence is not provided (backend doesn't always return it)
      if (confidence !== undefined && confidence !== null) {
        if (confidence < 0.85) {
          console.log('❌ EnhancedBiometricVotingModal: Confidence too low:', confidence);
          throw new Error(`Biometric verification confidence too low (${(confidence * 100).toFixed(1)}%). Please try again.`);
        }
        console.log('✅ EnhancedBiometricVotingModal: Confidence check passed:', confidence);
      } else {
        console.log('⚠️ EnhancedBiometricVotingModal: No confidence value provided, skipping confidence check');
      }

      // Verification successful
      setCurrentStep('success');
      
      // Prepare verification data for vote submission
      const verificationData = {
        verified: true,
        confidence: verificationResult.confidence,
        template_hash: verificationResult.template_hash,
        finger_type: verificationResult.finger_type,
        verification_timestamp: verificationResult.verification_timestamp,
        device_id: enhancedBiometricService.getDeviceId()
      };

      // Call success callback
      if (onSuccess) {
        onSuccess(verificationData);
      }

      // Auto-close after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (error: any) {
      console.error('❌ Enhanced biometric verification failed:', error);
      setError(error.message || 'Biometric verification failed');
      setCurrentStep('error');
      
      if (onError) {
        onError(error.message || 'Biometric verification failed');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetry = () => {
    startVerification();
  };

  const handleClose = () => {
    setCurrentStep('preparing');
    setError(null);
    setIsProcessing(false);
    onClose();
  };

  const renderPreparingStep = () => (
    <View style={styles.stepContainer}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.stepTitle}>Preparing Biometric Verification</Text>
      <Text style={styles.stepDescription}>
        Verifying your enrollment status...
      </Text>
    </View>
  );

  const renderVerifyingStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Ionicons name="finger-print" size={80} color="#007AFF" />
      </View>
      
      <Text style={styles.stepTitle}>Biometric Verification Required</Text>
      <Text style={styles.stepDescription}>
        Place your enrolled finger on the sensor to verify your identity for voting.
      </Text>
      
      <View style={styles.voteInfo}>
        <Text style={styles.voteInfoLabel}>Voting for:</Text>
        <Text style={styles.voteInfoValue}>{candidateName}</Text>
      </View>
      
      <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      
      <Text style={styles.processingText}>Processing your biometric verification...</Text>
    </View>
  );

  const renderSuccessStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Ionicons name="checkmark-circle" size={80} color="#34C759" />
      </View>
      
      <Text style={styles.stepTitle}>Verification Successful!</Text>
      <Text style={styles.stepDescription}>
        Your biometric has been verified successfully. Your vote will now be processed.
      </Text>
      
      <View style={styles.successInfo}>
        <Text style={styles.successInfoText}>
          Vote for {candidateName} is being submitted...
        </Text>
      </View>
    </View>
  );

  const renderErrorStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Ionicons name="alert-circle" size={80} color="#FF3B30" />
      </View>
      
      <Text style={styles.stepTitle}>Verification Failed</Text>
      <Text style={styles.stepDescription}>
        {error || 'Biometric verification failed. Your vote cannot be processed.'}
      </Text>
      
      <View style={styles.errorActions}>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
          <Text style={styles.cancelButtonText}>Cancel Vote</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'preparing':
        return renderPreparingStep();
      case 'verifying':
        return renderVerifyingStep();
      case 'success':
        return renderSuccessStep();
      case 'error':
        return renderErrorStep();
      default:
        return renderPreparingStep();
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
          <Text style={styles.headerTitle}>Biometric Verification</Text>
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
              <Text style={styles.cancelButtonText}>Cancel Vote</Text>
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
  voteInfo: {
    backgroundColor: '#F2F2F7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    width: '100%'
  },
  voteInfoLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4
  },
  voteInfoValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
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
