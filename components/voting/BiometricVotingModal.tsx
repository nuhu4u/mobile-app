import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { realBiometricService } from '@/lib/biometric/real-biometric-service';

interface BiometricVotingModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (verificationData: any) => void;
  onError: (error: string) => void;
  electionId?: string;
  candidateName?: string;
}

type VerificationStep = 'preparing' | 'capturing' | 'verifying' | 'success' | 'error';

const { width } = Dimensions.get('window');

export function BiometricVotingModal({ 
  visible, 
  onClose, 
  onSuccess, 
  onError,
  electionId,
  candidateName
}: BiometricVotingModalProps) {
  const [step, setStep] = useState<VerificationStep>('preparing');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [stepMessage, setStepMessage] = useState('');
  
  // Animation for fingerprint icon
  const scaleAnim = new Animated.Value(1);
  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    if (visible) {
      startBiometricVerification();
    } else {
      resetModal();
    }
  }, [visible]);

  const resetModal = () => {
    setStep('preparing');
    setLoading(false);
    setError(null);
    setProgress(0);
    setStepMessage('');
    stopAnimation();
  };

  const startBiometricVerification = async () => {
    try {
      setLoading(true);
      setStep('preparing');
      setStepMessage('Preparing biometric verification...');
      setProgress(10);

      // Check biometric availability
      const availability = await realBiometricService.checkBiometricAvailability();
      
      if (!availability.hasHardware) {
        throw new Error('Device does not support biometric authentication');
      }

      if (!availability.isEnrolled) {
        throw new Error('No biometric data enrolled on device');
      }

      // Start capture
      await startCapture();
    } catch (error: any) {
      handleError(error.message);
    }
  };

  const startCapture = async () => {
    try {
      setStep('capturing');
      setStepMessage('Place your finger on the sensor to verify your identity...');
      setProgress(30);
      
      // Start animation
      animateFingerprintIcon();

      const result = await realBiometricService.verifyBiometricForVoting(electionId);
      
      if (!result.success) {
        throw new Error(result.error || 'Biometric verification failed');
      }

      // Start verification
      await startVerification(result.verificationData);
    } catch (error: any) {
      handleError(error.message);
    }
  };

  const startVerification = async (verificationData: any) => {
    try {
      setStep('verifying');
      setStepMessage('Verifying your identity...');
      setProgress(70);
      
      // Stop animation
      stopAnimation();

      // Simulate verification processing
      setTimeout(() => {
        if (verificationData.biometricVerified) {
          setStep('success');
          setStepMessage('Identity verified successfully!');
          setProgress(100);
          
          // Wait a moment then close with success
          setTimeout(() => {
            onSuccess(verificationData);
            onClose();
          }, 1500);
        } else {
          throw new Error('Biometric verification failed');
        }
      }, 1000);
    } catch (error: any) {
      handleError(error.message);
    }
  };

  const handleError = (errorMessage: string) => {
    setStep('error');
    setError(errorMessage);
    setLoading(false);
    setProgress(0);
    setStepMessage('Verification failed');
    stopAnimation();
    
    // Auto-close after 3 seconds
    setTimeout(() => {
      onError(errorMessage);
      onClose();
    }, 3000);
  };

  const animateFingerprintIcon = () => {
    // Scale animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopAnimation = () => {
    scaleAnim.stopAnimation();
    pulseAnim.stopAnimation();
    scaleAnim.setValue(1);
    pulseAnim.setValue(1);
  };

  const getStepIcon = () => {
    switch (step) {
      case 'preparing':
        return <ActivityIndicator size="large" color="#3b82f6" />;
      case 'capturing':
        return (
          <Animated.View style={{
            transform: [
              { scale: scaleAnim },
              { scale: pulseAnim }
            ]
          }}>
            <Ionicons name="finger-print" size={60} color="#3b82f6" />
          </Animated.View>
        );
      case 'verifying':
        return <ActivityIndicator size="large" color="#f59e0b" />;
      case 'success':
        return <Ionicons name="checkmark-circle" size={60} color="#16a34a" />;
      case 'error':
        return <Ionicons name="close-circle" size={60} color="#dc2626" />;
      default:
        return <Ionicons name="finger-print" size={60} color="#3b82f6" />;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 'preparing':
        return 'Preparing Verification';
      case 'capturing':
        return 'Biometric Capture';
      case 'verifying':
        return 'Verifying Identity';
      case 'success':
        return 'Verification Complete';
      case 'error':
        return 'Verification Failed';
      default:
        return 'Biometric Verification';
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 'preparing':
        return 'Setting up biometric authentication for secure voting...';
      case 'capturing':
        return `Place your finger on the sensor to verify your identity for voting for ${candidateName || 'this candidate'}.`;
      case 'verifying':
        return 'Verifying your biometric data against your enrolled fingerprint...';
      case 'success':
        return 'Your identity has been verified successfully. Proceeding to cast your vote.';
      case 'error':
        return error || 'Biometric verification failed. Please try again.';
      default:
        return 'Verifying your identity for secure voting...';
    }
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
      <Text style={styles.progressText}>{progress}%</Text>
    </View>
  );

  const renderButtons = () => {
    if (step === 'error') {
      return (
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.retryButton} onPress={startBiometricVerification}>
            <Ionicons name="refresh" size={16} color="#3b82f6" />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (step === 'success') {
      return null; // Auto-closes
    }

    return (
      <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.iconContainer}>
            {getStepIcon()}
          </View>
          
          <Text style={styles.title}>{getStepTitle()}</Text>
          <Text style={styles.description}>{getStepDescription()}</Text>
          
          {renderProgressBar()}
          
          <View style={styles.buttonContainer}>
            {renderButtons()}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    width: width * 0.85,
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 30,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
