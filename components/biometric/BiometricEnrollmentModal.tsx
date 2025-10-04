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
import { realBiometricService, BiometricEnrollmentResult } from '@/lib/biometric/real-biometric-service';

interface BiometricEnrollmentModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (result: BiometricEnrollmentResult) => void;
  onError: (error: string) => void;
}

type EnrollmentStep = 'checking' | 'first-capture' | 'second-capture' | 'verifying' | 'processing' | 'success' | 'error';

const { width } = Dimensions.get('window');

export function BiometricEnrollmentModal({ 
  visible, 
  onClose, 
  onSuccess, 
  onError 
}: BiometricEnrollmentModalProps) {
  const [step, setStep] = useState<EnrollmentStep>('checking');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [stepMessage, setStepMessage] = useState('');
  
  // Animation for fingerprint icon
  const scaleAnim = new Animated.Value(1);
  const rotateAnim = new Animated.Value(0);

  useEffect(() => {
    if (visible) {
      startEnrollment();
    } else {
      resetModal();
    }
  }, [visible]);

  const resetModal = () => {
    setStep('checking');
    setLoading(false);
    setError(null);
    setProgress(0);
    setStepMessage('');
  };

  const startEnrollment = async () => {
    try {
      setLoading(true);
      setStep('checking');
      setStepMessage('Checking biometric availability...');
      setProgress(10);

      // Check if device supports biometric
      const availability = await realBiometricService.checkBiometricAvailability();
      
      if (!availability.hasHardware) {
        throw new Error('Device does not support biometric authentication');
      }

      if (!availability.isEnrolled) {
        Alert.alert(
          'Biometric Not Enrolled',
          'Please enroll your fingerprint or face in your device settings before using biometric authentication.',
          [
            { text: 'Cancel', onPress: onClose },
            { text: 'Go to Settings', onPress: () => {
              // In a real app, you might want to open device settings
              onClose();
            }}
          ]
        );
        return;
      }

      // Start first capture
      await startFirstCapture();
    } catch (error: any) {
      handleError(error.message);
    }
  };

  const startFirstCapture = async () => {
    try {
      setStep('first-capture');
      setStepMessage('Place your finger on the sensor for first capture...');
      setProgress(30);
      
      // Animate fingerprint icon
      animateFingerprintIcon();

      const result = await realBiometricService.captureBiometricForEnrollment('first');
      
      if (!result.success) {
        throw new Error(result.error || 'First capture failed');
      }

      // Start second capture
      await startSecondCapture();
    } catch (error: any) {
      handleError(error.message);
    }
  };

  const startSecondCapture = async () => {
    try {
      setStep('second-capture');
      setStepMessage('Place your finger on the sensor for verification...');
      setProgress(60);
      
      // Continue animating fingerprint icon
      animateFingerprintIcon();

      const result = await realBiometricService.captureBiometricForEnrollment('second');
      
      if (!result.success) {
        throw new Error(result.error || 'Second capture failed');
      }

      // Start verification
      await startVerification();
    } catch (error: any) {
      handleError(error.message);
    }
  };

  const startVerification = async () => {
    try {
      setStep('verifying');
      setStepMessage('Verifying both captures match...');
      setProgress(75);
      
      // Stop animation and show verification icon
      stopAnimation();

      // The verification is handled inside completeEnrollment()
      // This step is just for UI feedback
      setTimeout(async () => {
        await processEnrollment();
      }, 1000);
    } catch (error: any) {
      handleError(error.message);
    }
  };

  const processEnrollment = async () => {
    try {
      setStep('processing');
      setStepMessage('Processing biometric enrollment...');
      setProgress(80);
      
      // Stop animation
      stopAnimation();

      const result = await realBiometricService.completeEnrollment();
      
      if (result.success) {
        setStep('success');
        setStepMessage('Biometric enrollment completed successfully!');
        setProgress(100);
        
        // Wait a moment then close
        setTimeout(() => {
          onSuccess(result);
          onClose();
        }, 2000);
      } else {
        throw new Error(result.error || 'Enrollment processing failed');
      }
    } catch (error: any) {
      handleError(error.message);
    }
  };

  const handleError = (errorMessage: string) => {
    setStep('error');
    setError(errorMessage);
    setLoading(false);
    setProgress(0);
    setStepMessage('Enrollment failed');
    stopAnimation();
    
    // Auto-close after 3 seconds
    setTimeout(() => {
      onError(errorMessage);
      onClose();
    }, 3000);
  };

  const animateFingerprintIcon = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  };

  const stopAnimation = () => {
    scaleAnim.stopAnimation();
    rotateAnim.stopAnimation();
    scaleAnim.setValue(1);
    rotateAnim.setValue(0);
  };

  const getStepIcon = () => {
    switch (step) {
      case 'checking':
        return <Ionicons name="search" size={60} color="#3b82f6" />;
      case 'first-capture':
      case 'second-capture':
        return (
          <Animated.View style={{
            transform: [
              { scale: scaleAnim },
              { 
                rotate: rotateAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                })
              }
            ]
          }}>
            <Ionicons name="finger-print" size={60} color="#3b82f6" />
          </Animated.View>
        );
      case 'verifying':
        return <ActivityIndicator size="large" color="#f59e0b" />;
      case 'processing':
        return <ActivityIndicator size="large" color="#3b82f6" />;
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
      case 'checking':
        return 'Checking Device';
      case 'first-capture':
        return 'First Capture';
      case 'second-capture':
        return 'Verification Capture';
      case 'verifying':
        return 'Verifying Captures';
      case 'processing':
        return 'Processing';
      case 'success':
        return 'Success!';
      case 'error':
        return 'Error';
      default:
        return 'Biometric Enrollment';
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 'checking':
        return 'Verifying that your device supports biometric authentication...';
      case 'first-capture':
        return 'Place your finger on the sensor to create your biometric template.';
      case 'second-capture':
        return 'Place your finger on the sensor again to verify your enrollment.';
      case 'verifying':
        return 'Verifying that both captures match...';
      case 'processing':
        return 'Encrypting and storing your biometric data securely...';
      case 'success':
        return 'Your biometric authentication has been successfully enrolled!';
      case 'error':
        return error || 'An error occurred during enrollment.';
      default:
        return 'Setting up biometric authentication...';
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
        <TouchableOpacity style={styles.button} onPress={onClose}>
          <Text style={styles.buttonText}>Close</Text>
        </TouchableOpacity>
      );
    }

    if (step === 'success') {
      return null; // Auto-closes
    }

    if (loading && step !== 'processing') {
      return (
        <TouchableOpacity style={[styles.button, styles.disabledButton]} disabled>
          <ActivityIndicator size="small" color="#ffffff" />
          <Text style={styles.buttonText}>Please wait...</Text>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity style={styles.button} onPress={onClose}>
        <Text style={styles.buttonText}>Cancel</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
