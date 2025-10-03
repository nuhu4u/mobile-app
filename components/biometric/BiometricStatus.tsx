import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/auth-store';
import { apiConfig } from '@/lib/config';

interface BiometricStatusProps {
  showMobileCTA?: boolean;
  onStatusChange?: (status: any) => void;
  compact?: boolean; // For dashboard vs profile display
  showOnlyIfNotEnrolled?: boolean; // For dashboard - only show if not enrolled
}

interface BiometricStatus {
  biometric_registered: boolean;
  biometric_status: 'pending' | 'registered' | 'locked' | 'disabled';
  biometric_registered_at: string | null;
  biometric_consent: boolean;
  biometric_failed_attempts: number;
}

export function BiometricStatusComponent({ 
  showMobileCTA = true, 
  onStatusChange,
  compact = false,
  showOnlyIfNotEnrolled = false
}: BiometricStatusProps) {
  const { user, token } = useAuthStore();
  const [status, setStatus] = useState<BiometricStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBiometricStatus();
  }, []);

  const loadBiometricStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔐 BiometricStatus: Loading biometric status...');
      console.log('🔐 BiometricStatus: User:', user?.id);
      console.log('🔐 BiometricStatus: Token:', token ? `${token.substring(0, 20)}...` : 'No token');
      
      const response = await fetch(`${apiConfig.baseUrl}/biometric/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('🔐 BiometricStatus: API response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('🔐 BiometricStatus: API result:', result);
        
        if (result.success && result.data) {
          setStatus(result.data);
          onStatusChange?.(result.data);
        } else {
          throw new Error(result.message || 'Failed to get biometric status');
        }
      } else {
        const errorText = await response.text();
        console.error('🔐 BiometricStatus: API error:', errorText);
        
        if (response.status === 401) {
          throw new Error('Authentication required. Please log in to view biometric status.');
        } else if (response.status === 403) {
          throw new Error('Access denied. You do not have permission to view biometric status.');
        } else {
          throw new Error(`HTTP ${response.status}: Failed to get biometric status`);
        }
      }
    } catch (err: any) {
      console.error('🔐 BiometricStatus: Error loading status:', err);
      setError(err.message || 'Unable to load biometric status');
      
      // Set fallback status for display purposes
      setStatus({
        biometric_registered: false,
        biometric_status: 'pending',
        biometric_registered_at: null,
        biometric_consent: false,
        biometric_failed_attempts: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    if (loading) return 'time-outline';
    if (error) return 'warning';
    if (status?.biometric_registered) return 'checkmark-circle';
    return 'finger-print';
  };

  const getStatusColor = () => {
    if (loading) return '#64748b';
    if (error) return '#dc2626';
    if (status?.biometric_registered) return '#16a34a';
    return '#d97706';
  };

  const getStatusText = () => {
    if (loading) return 'Loading...';
    if (error) return 'Error loading status';
    if (status?.biometric_registered) return 'Authorized to Vote';
    return 'Pending Registration';
  };

  const getStatusDescription = () => {
    if (loading) return 'Checking biometric status...';
    if (error) return 'Unable to load biometric status';
    if (status?.biometric_registered) {
      return `Registered on ${status.biometric_registered_at ? new Date(status.biometric_registered_at).toLocaleDateString() : 'Unknown date'}`;
    }
    return 'Biometric fingerprint required for voting';
  };

  const handleEnrollPress = () => {
    if (compact) {
      // For dashboard - just show info
      Alert.alert(
        'Biometric Registration',
        'Biometric enrollment is only available on the mobile app for security reasons. You are already using the mobile app - enrollment is available in your profile settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Go to Profile', onPress: () => {
            // Navigate to profile where enrollment can be done
            console.log('Navigate to profile for biometric enrollment');
          }}
        ]
      );
    } else {
      // For profile - show enrollment options
      Alert.alert(
        'Biometric Enrollment',
        'Register your fingerprint for secure voting. This will encrypt and store your biometric data securely.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Enroll Now', onPress: () => {
            console.log('Start biometric enrollment process');
            // TODO: Implement actual biometric enrollment
            Alert.alert('Coming Soon', 'Biometric enrollment feature will be available soon.');
          }}
        ]
      );
    }
  };

  // If showOnlyIfNotEnrolled is true and user is enrolled, don't render
  if (showOnlyIfNotEnrolled && status?.biometric_registered && !loading) {
    return null;
  }

  if (loading) {
    return (
      <View style={[styles.container, compact && styles.compactContainer]}>
        <View style={styles.headerContainer}>
          <View style={styles.iconContainer}>
            <Ionicons name="finger-print" size={compact ? 20 : 24} color="#3b82f6" />
          </View>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, compact && styles.compactTitle]}>Biometric Security</Text>
            <Text style={[styles.subtitle, compact && styles.compactSubtitle]}>Loading...</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading biometric status...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, compact && styles.compactContainer]}>
      {/* Warning Message for Not Enrolled */}
      {!status?.biometric_registered && (
        <View style={styles.warningAlert}>
          <Ionicons name="warning" size={16} color="#d97706" />
          <Text style={styles.warningText}>
            <Text style={styles.warningBold}>Important:</Text> You must register your biometric to vote in elections
          </Text>
        </View>
      )}

      <View style={styles.headerContainer}>
        <View style={styles.iconContainer}>
          <Ionicons name={getStatusIcon()} size={compact ? 20 : 24} color={getStatusColor()} />
        </View>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, compact && styles.compactTitle]}>Biometric Security</Text>
          <Text style={[styles.subtitle, compact && styles.compactSubtitle]}>
            Your biometric authentication status for secure voting
          </Text>
        </View>
      </View>

      {/* Status Display */}
      <View style={styles.statusContainer}>
        <View style={styles.statusInfo}>
          <Text style={styles.statusText}>{getStatusText()}</Text>
          <View style={[
            styles.badge, 
            status?.biometric_registered ? styles.registeredBadge : styles.pendingBadge
          ]}>
            <Text style={[
              styles.badgeText,
              status?.biometric_registered ? styles.registeredText : styles.pendingText
            ]}>
              {status?.biometric_registered ? "Registered" : "Not Registered"}
            </Text>
          </View>
        </View>
        <Text style={styles.statusDescription}>{getStatusDescription()}</Text>
      </View>

      {/* Action Buttons */}
      {!status?.biometric_registered && showMobileCTA && (
        <View style={styles.actionContainer}>
          <View style={styles.mobileAlert}>
            <Ionicons name="phone-portrait" size={16} color="#3b82f6" />
            <Text style={styles.mobileText}>
              <Text style={styles.mobileBold}>Register on Mobile:</Text> Biometric enrollment is available in your profile settings.
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.enrollButton}
            onPress={handleEnrollPress}
          >
            <Ionicons name="download" size={16} color="white" />
            <Text style={styles.enrollButtonText}>Register Biometric</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Success Message for Enrolled */}
      {status?.biometric_registered && (
        <View>
          <View style={styles.successAlert}>
            <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
            <Text style={styles.successText}>
              <Text style={styles.successBold}>Ready to Vote!</Text> Your biometric is registered and you can vote securely.
            </Text>
          </View>
          
          {/* Actions for enrolled users in profile */}
          {!compact && (
            <View style={styles.enrolledActions}>
              <TouchableOpacity 
                style={styles.testButton}
                onPress={() => {
                  Alert.alert('Biometric Test', 'Testing biometric verification...', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Test', onPress: () => {
                      Alert.alert('Coming Soon', 'Biometric test feature will be available soon.');
                    }}
                  ]);
                }}
              >
                <Ionicons name="checkmark" size={16} color="#3b82f6" />
                <Text style={styles.testButtonText}>Test Biometric</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => {
                  Alert.alert(
                    'Delete Biometric',
                    'Are you sure you want to delete your biometric registration? You will need to re-enroll to vote.',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Delete', style: 'destructive', onPress: () => {
                        Alert.alert('Coming Soon', 'Biometric deletion feature will be available soon.');
                      }}
                    ]
                  );
                }}
              >
                <Ionicons name="trash" size={16} color="#dc2626" />
                <Text style={styles.deleteButtonText}>Delete Biometric</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Error Message */}
      {error && (
        <View style={styles.errorAlert}>
          <Ionicons name="warning" size={16} color="#dc2626" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={loadBiometricStatus}
          >
            <Ionicons name="refresh" size={16} color="#dc2626" />
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  compactContainer: {
    padding: 14,
    marginBottom: 12,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 2,
  },
  compactTitle: {
    fontSize: 14,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
  },
  compactSubtitle: {
    fontSize: 12,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 8,
    color: '#64748b',
    fontSize: 14,
  },
  statusContainer: {
    marginBottom: 16,
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  statusDescription: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  registeredBadge: {
    backgroundColor: '#dcfce7',
  },
  pendingBadge: {
    backgroundColor: '#fef3c7',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  registeredText: {
    color: '#16a34a',
  },
  pendingText: {
    color: '#d97706',
  },
  warningAlert: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fef3c7',
    borderLeftWidth: 4,
    borderLeftColor: '#d97706',
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
  },
  warningText: {
    flex: 1,
    marginLeft: 8,
    color: '#92400e',
    fontSize: 13,
    lineHeight: 18,
  },
  warningBold: {
    fontWeight: '600',
  },
  mobileAlert: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#eff6ff',
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
  },
  mobileText: {
    flex: 1,
    marginLeft: 8,
    color: '#1e40af',
    fontSize: 13,
    lineHeight: 18,
  },
  mobileBold: {
    fontWeight: '600',
  },
  successAlert: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f0fdf4',
    borderLeftWidth: 4,
    borderLeftColor: '#16a34a',
    padding: 12,
    borderRadius: 8,
  },
  successText: {
    flex: 1,
    marginLeft: 8,
    color: '#166534',
    fontSize: 13,
    lineHeight: 18,
  },
  successBold: {
    fontWeight: '600',
  },
  errorAlert: {
    backgroundColor: '#fef2f2',
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
    padding: 12,
    borderRadius: 8,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 13,
    marginBottom: 8,
    lineHeight: 18,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  retryText: {
    marginLeft: 4,
    color: '#dc2626',
    fontSize: 12,
    fontWeight: '600',
  },
  actionContainer: {
    marginTop: 8,
  },
  enrollButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  enrollButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  enrolledActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  testButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  testButtonText: {
    color: '#3b82f6',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#dc2626',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  deleteButtonText: {
    color: '#dc2626',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
});
