/**
 * Enhanced Biometric Status Component
 * Shows user-device biometric enrollment status and management options
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { enhancedBiometricService, FingerType } from '../../lib/biometric/enhanced-biometric-service';
import EnhancedBiometricEnrollmentModal from './EnhancedBiometricEnrollmentModal';

interface EnhancedBiometricStatusProps {
  compact?: boolean;
  showMobileCTA?: boolean;
  onStatusChange?: (status: any) => void;
}

type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export default function EnhancedBiometricStatus({
  compact = false,
  showMobileCTA = true,
  onStatusChange
}: EnhancedBiometricStatusProps) {
  const [enrollmentStatus, setEnrollmentStatus] = useState<any>(null);
  const [loading, setLoading] = useState<LoadingState>('idle');
  const [enrollmentModalVisible, setEnrollmentModalVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastStatusRef = useRef<any>(null);

  useEffect(() => {
    loadEnrollmentStatus();
    
    // Set a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (loading === 'loading') {
        console.log('🔍 EnhancedBiometricStatus: Loading timeout, setting error state');
        setError('Loading timeout - please check your connection');
        setLoading('error');
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, []);

  // Expose refresh method for parent components
  const refreshStatus = async () => {
    await loadEnrollmentStatus();
  };

  const loadEnrollmentStatus = async () => {
    // Prevent multiple simultaneous calls
    if (loading === 'loading') {
      console.log('🔍 EnhancedBiometricStatus: Already loading, skipping duplicate call');
      return;
    }

    try {
      setLoading('loading');
      setError(null);

      console.log('🔍 EnhancedBiometricStatus: Loading enrollment status...');
      const result = await enhancedBiometricService.getEnrollmentStatus();
      
      console.log('🔍 EnhancedBiometricStatus: Result:', result);
      
      if (result.success) {
        console.log('🔍 EnhancedBiometricStatus: Data:', result.data);
        console.log('🔍 EnhancedBiometricStatus: Enrolled:', result.data?.enrolled);
        console.log('🔍 EnhancedBiometricStatus: Device ID:', result.data?.device_id);
        
        setEnrollmentStatus(result.data);
        setLoading('success');
        
        console.log('🔍 EnhancedBiometricStatus: State updated, enrolled status:', result.data?.enrolled);
        
        // Notify parent component only if status actually changed
        if (onStatusChange && JSON.stringify(result.data) !== JSON.stringify(lastStatusRef.current)) {
          console.log('🔍 EnhancedBiometricStatus: Status changed, notifying parent component');
          lastStatusRef.current = result.data;
          onStatusChange(result.data);
        } else {
          console.log('🔍 EnhancedBiometricStatus: Status unchanged, skipping parent notification');
        }
      } else {
        console.log('❌ EnhancedBiometricStatus: Error result:', result);
        throw new Error(result.error || 'Failed to load enrollment status');
      }
    } catch (error: any) {
      console.error('❌ EnhancedBiometricStatus: Error loading enrollment status:', error);
      setError(error.message || 'Failed to load enrollment status');
      setLoading('error');
    }
  };

  const handleEnrollPress = async () => {
    try {
      // Check biometric availability
      const availability = await enhancedBiometricService.checkBiometricAvailability();
      
      if (!availability.available) {
        Alert.alert(
          'Biometric Not Available',
          'Biometric authentication is not available on this device. Please enable it in your device settings.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Show enrollment modal
      setEnrollmentModalVisible(true);
    } catch (error: any) {
      console.error('❌ Error checking biometric availability:', error);
      Alert.alert(
        'Error',
        'Failed to check biometric availability. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleEnrollmentSuccess = async (result: any) => {
    console.log('✅ EnhancedBiometricStatus: Enrollment successful:', result);
    setEnrollmentModalVisible(false);
    
    // Refresh enrollment status
    console.log('🔄 EnhancedBiometricStatus: Refreshing status after enrollment...');
    await loadEnrollmentStatus();
    
    Alert.alert(
      'Success',
      'Biometric enrollment completed successfully! You can now vote securely.'
    );
  };

  const handleEnrollmentError = (error: string) => {
    console.error('❌ Enhanced biometric enrollment failed:', error);
    setEnrollmentModalVisible(false);
    
    Alert.alert(
      'Enrollment Failed',
      error,
      [{ text: 'OK' }]
    );
  };

  const handleDeleteBiometric = async (fingerType?: FingerType) => {
    const title = fingerType ? `Delete ${fingerType.replace('_', ' ')}?` : 'Delete All Biometrics?';
    const message = fingerType 
      ? `Are you sure you want to delete your ${fingerType.replace('_', ' ')} enrollment?`
      : 'Are you sure you want to delete all your biometric enrollments? This will require re-enrollment to vote.';

    Alert.alert(
      title,
      message,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await enhancedBiometricService.deleteUserBiometric(fingerType);
              
              if (result.success) {
                await loadEnrollmentStatus();
                Alert.alert(
                  'Success',
                  'Biometric enrollment deleted successfully.'
                );
              } else {
                throw new Error(result.error || 'Failed to delete biometric enrollment');
              }
            } catch (error: any) {
              console.error('❌ Error deleting biometric:', error);
              Alert.alert(
                'Error',
                error.message || 'Failed to delete biometric enrollment',
                [{ text: 'OK' }]
              );
            }
          }
        }
      ]
    );
  };

  const handleTestBiometric = async () => {
    try {
      Alert.alert(
        'Test Biometric',
        'This will test your biometric authentication without casting a vote.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Test',
            onPress: async () => {
              try {
                const result = await enhancedBiometricService.verifyUserBiometric();
                
                if (result.success && result.verified) {
                  Alert.alert(
                    'Test Successful',
                    `Biometric verification successful!\nConfidence: ${(result.confidence! * 100).toFixed(1)}%`,
                    [{ text: 'OK' }]
                  );
                } else {
                  Alert.alert(
                    'Test Failed',
                    result.error || 'Biometric verification failed',
                    [{ text: 'OK' }]
                  );
                }
              } catch (error: any) {
                console.error('❌ Error testing biometric:', error);
                Alert.alert(
                  'Test Error',
                  error.message || 'Failed to test biometric',
                  [{ text: 'OK' }]
                );
              }
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('❌ Error in test biometric:', error);
      Alert.alert(
        'Error',
        'Failed to test biometric. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  if (loading === 'loading') {
    console.log('🔍 EnhancedBiometricStatus: Showing loading state');
    return (
      <View style={[styles.container, compact && styles.containerCompact]}>
        <ActivityIndicator size="small" color="#007AFF" />
        <Text style={[styles.loadingText, compact && styles.loadingTextCompact]}>
          Loading biometric status...
        </Text>
      </View>
    );
  }

  if (loading === 'error') {
    return (
      <View style={[styles.container, compact && styles.containerCompact]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={20} color="#FF3B30" />
          <Text style={[styles.errorText, compact && styles.errorTextCompact]}>
            {error || 'Failed to load biometric status'}
          </Text>
        </View>
        <TouchableOpacity style={styles.retryButton} onPress={loadEnrollmentStatus}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isEnrolled = enrollmentStatus?.enrolled === true;
  const enrolledFingers = enrollmentStatus?.finger_types || [];
  const enrollmentCount = enrollmentStatus?.enrollment_count || 0;

  console.log('🔍 EnhancedBiometricStatus: Render check:', {
    compact,
    isEnrolled,
    enrollmentStatus,
    enrolledFingers,
    enrollmentCount
  });

  if (compact) {
    // Compact view for dashboard
    // Don't show anything while loading or if enrolled
    if (loading === 'loading' || isEnrolled) {
      console.log('🔍 EnhancedBiometricStatus: Loading or enrolled, hiding component (compact mode)');
      return null;
    }
    
    // Only show warning if explicitly not enrolled
    if (!isEnrolled && enrollmentStatus !== null) {
      console.log('🔍 EnhancedBiometricStatus: Showing enrollment warning (compact mode)');
      return (
        <View style={styles.containerCompact}>
          <View style={styles.warningContainer}>
            <Ionicons name="warning" size={16} color="#FF9500" />
            <Text style={styles.warningTextCompact}>
              Biometric enrollment required for voting
            </Text>
          </View>
          <TouchableOpacity style={styles.enrollButtonCompact} onPress={handleEnrollPress}>
            <Text style={styles.enrollButtonTextCompact}>Enroll</Text>
          </TouchableOpacity>
        </View>
      );
    }

    console.log('🔍 EnhancedBiometricStatus: Default state, hiding component (compact mode)');
    return null; // Don't show anything by default (compact mode)
  }

  // Full view for profile
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="finger-print" size={24} color="#007AFF" />
        <Text style={styles.headerTitle}>Biometric Authentication</Text>
      </View>

      <View style={styles.content}>
        {isEnrolled ? (
          // Enrolled state
          <View style={styles.enrolledContainer}>
            <View style={styles.successAlert}>
              <Ionicons name="checkmark-circle" size={20} color="#34C759" />
              <Text style={styles.successText}>
                Ready to Vote! Your biometric is registered and you can vote securely.
              </Text>
            </View>

            <View style={styles.statusContainer}>
              <Text style={styles.statusLabel}>Status:</Text>
              <Text style={styles.statusValue}>Authorized to Vote</Text>
            </View>

            <View style={styles.enrollmentInfo}>
              <Text style={styles.enrollmentInfoLabel}>Enrolled Fingers:</Text>
              <Text style={styles.enrollmentInfoValue}>
                {enrollmentCount} finger{enrollmentCount !== 1 ? 's' : ''}
              </Text>
              {enrolledFingers.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.fingerScroll}>
                  {enrolledFingers.map((finger: FingerType) => (
                    <View key={finger} style={styles.fingerTag}>
                      <Text style={styles.fingerTagText}>
                        {finger.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>

            <View style={styles.actions}>
              <TouchableOpacity style={styles.actionButton} onPress={handleEnrollPress}>
                <Ionicons name="add" size={16} color="#007AFF" />
                <Text style={styles.actionButtonText}>Add Finger</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={handleTestBiometric}>
                <Ionicons name="checkmark-circle" size={16} color="#34C759" />
                <Text style={styles.actionButtonText}>Test Biometric</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionButton, styles.deleteButton]} 
                onPress={() => handleDeleteBiometric()}
              >
                <Ionicons name="trash" size={16} color="#FF3B30" />
                <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete All</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          // Not enrolled state
          <View style={styles.notEnrolledContainer}>
            <View style={styles.warningAlert}>
              <Ionicons name="warning" size={20} color="#FF9500" />
              <Text style={styles.warningText}>
                Important: You must register your biometric to vote in elections
              </Text>
            </View>

            <View style={styles.infoAlert}>
              <Ionicons name="information-circle" size={20} color="#007AFF" />
              <Text style={styles.infoText}>
                Biometric enrollment is required for secure voting. Your biometric data is stored securely on this device only.
              </Text>
            </View>

            <View style={styles.statusContainer}>
              <Text style={styles.statusLabel}>Status:</Text>
              <Text style={[styles.statusValue, styles.statusValuePending]}>Pending Registration</Text>
            </View>

            <TouchableOpacity style={styles.enrollButton} onPress={handleEnrollPress}>
              <Ionicons name="finger-print" size={20} color="#fff" />
              <Text style={styles.enrollButtonText}>Register Biometric</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <EnhancedBiometricEnrollmentModal
        visible={enrollmentModalVisible}
        onClose={() => setEnrollmentModalVisible(false)}
        onSuccess={handleEnrollmentSuccess}
        onError={handleEnrollmentError}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8
  },
  containerCompact: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginVertical: 4
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginLeft: 8
  },
  content: {
    flex: 1
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8
  },
  loadingTextCompact: {
    fontSize: 12
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    marginLeft: 8
  },
  errorTextCompact: {
    fontSize: 12
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600'
  },
  enrolledContainer: {
    flex: 1
  },
  notEnrolledContainer: {
    flex: 1
  },
  successAlert: {
    backgroundColor: '#E8F5E8',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  successText: {
    fontSize: 14,
    color: '#34C759',
    marginLeft: 8,
    flex: 1
  },
  warningAlert: {
    backgroundColor: '#FFF4E6',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  warningText: {
    fontSize: 14,
    color: '#FF9500',
    marginLeft: 8,
    flex: 1
  },
  infoAlert: {
    backgroundColor: '#E6F4FE',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  infoText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 8,
    flex: 1
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500'
  },
  statusValue: {
    fontSize: 14,
    color: '#34C759',
    fontWeight: '600',
    marginLeft: 8
  },
  statusValuePending: {
    color: '#FF9500'
  },
  enrollmentInfo: {
    marginBottom: 16
  },
  enrollmentInfoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginBottom: 8
  },
  enrollmentInfoValue: {
    fontSize: 16,
    color: '#000',
    fontWeight: '600'
  },
  fingerScroll: {
    marginTop: 8
  },
  fingerTag: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8
  },
  fingerTagText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500'
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  actionButton: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: '30%'
  },
  actionButtonText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
    marginLeft: 4
  },
  deleteButton: {
    backgroundColor: '#FFEBEE'
  },
  deleteButtonText: {
    color: '#FF3B30'
  },
  enrollButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  enrollButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8
  },
  enrollButtonCompact: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4
  },
  enrollButtonTextCompact: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600'
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  warningTextCompact: {
    fontSize: 12,
    color: '#FF9500',
    marginLeft: 4,
    flex: 1
  }
});
