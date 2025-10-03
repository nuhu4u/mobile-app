import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/auth-store';
import { apiConfig } from '@/lib/config';
import { BiometricStatusComponent } from '@/components/biometric/BiometricStatus';

export default function ProfileScreen() {
  const { user, isAuthenticated, logout, token } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  
  // Profile picture state
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  
  // Error state
  const [error, setError] = useState<string | null>(null);
  
  // NIN display state
  const [showNIN, setShowNIN] = useState(false);
  const [decryptedNIN, setDecryptedNIN] = useState<string | null>(null);
  const [partialNIN, setPartialNIN] = useState<string>('••••••••••••');
  const [loadingNIN, setLoadingNIN] = useState(false);
  
  // Biometric functionality - now handled by BiometricStatusComponent

  // Initialize NIN data
  useEffect(() => {
    if (user?.nin_verified) {
      loadPartialNIN();
    }
  }, [user]);

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      console.log('❌ Profile: Not authenticated, redirecting to login');
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated]);

  // Debug user data
  useEffect(() => {
    if (user) {
      console.log('🔍 Profile: User data received:', {
        id: user.id,
        email: user.email,
        nin_verified: user.nin_verified,
        aes_encrypted: user.aes_encrypted,
        nin_iv: user.nin_iv,
        encrypted_nin: user.encrypted_nin,
        hashed_nin: user.hashed_nin,
        phone_number: user.phone_number,
        gender: user.gender,
        date_of_birth: user.date_of_birth,
        address: user.address,
        wallet_address: user.wallet_address
      });
    }
  }, [user]);

  // Load partial NIN for display
  const loadPartialNIN = async () => {
    if (!user?.nin_verified) {
      console.log('User not NIN verified, skipping partial NIN load');
      return;
    }
    
    try {
      setLoadingNIN(true);
      console.log('Loading partial NIN...');
      console.log('User NIN data:', {
        nin_verified: user.nin_verified,
        aes_encrypted: user.aes_encrypted,
        nin_iv: user.nin_iv
      });
      console.log('Using token for partial NIN:', token ? `${token.substring(0, 20)}...` : 'No token');
      
      // Try to decrypt NIN for partial display
      if (user.aes_encrypted && user.nin_iv) {
        console.log('Calling decrypt API for partial NIN...');
        const response = await fetch(`${apiConfig.baseUrl}/profile/decrypt-nin`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            aes_encrypted: user.aes_encrypted,
            nin_iv: user.nin_iv
          })
        });
        
        console.log('Partial NIN decrypt API response status:', response.status);
        
        if (response.ok) {
          const result = await response.json();
          console.log('Partial NIN decrypt API result:', result);
          if (result.success && result.decryptedNIN && result.decryptedNIN.length === 11) {
            const nin = result.decryptedNIN;
            const partial = `${nin.substring(0, 3)}xxxxxx${nin.substring(nin.length - 2)}`;
            setPartialNIN(partial);
            console.log('Partial NIN set:', partial);
            return;
          }
        } else {
          const errorText = await response.text();
          console.error('Partial NIN decrypt API error:', errorText);
        }
      } else {
        console.log('No encrypted NIN data available for partial NIN');
      }
      
      // Fallback to generic mask
      setPartialNIN('•••••••••••');
      console.log('Using fallback partial NIN');
    } catch (error) {
      console.error('Error loading partial NIN:', error);
      setPartialNIN('•••••••••••');
    } finally {
      setLoadingNIN(false);
    }
  };

  // Handle NIN display
  const handleShowNIN = async () => {
    if (!user?.nin_verified) {
      console.log('User not NIN verified');
      return;
    }
    
    // If already showing, hide it
    if (showNIN) {
      setShowNIN(false);
      return;
    }
    
    try {
      setLoadingNIN(true);
      console.log('Attempting to decrypt NIN...');
      console.log('User data:', {
        nin_verified: user.nin_verified,
        aes_encrypted: user.aes_encrypted,
        nin_iv: user.nin_iv,
        hashed_nin: user.hashed_nin,
        encrypted_nin: user.encrypted_nin
      });
      console.log('Using token:', token ? `${token.substring(0, 20)}...` : 'No token');
      
      // Check if we have encrypted NIN data
      if (user.aes_encrypted && user.nin_iv) {
        console.log('Calling decrypt API...');
        const response = await fetch(`${apiConfig.baseUrl}/profile/decrypt-nin`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            aes_encrypted: user.aes_encrypted,
            nin_iv: user.nin_iv
          })
        });
        
        console.log('Decrypt API response status:', response.status);
        
        if (response.ok) {
          const result = await response.json();
          console.log('Decrypt API result:', result);
          if (result.success && result.decryptedNIN) {
            console.log('✅ Successfully decrypted NIN:', result.decryptedNIN);
            setDecryptedNIN(result.decryptedNIN);
            setShowNIN(true);
            return;
          } else {
            console.log('❌ API returned success but no decrypted NIN');
          }
        } else {
          const errorText = await response.text();
          console.error('❌ Decrypt API error:', errorText);
        }
      } else if (user.encrypted_nin) {
        // Try with encrypted_nin field
        console.log('Trying with encrypted_nin field...');
        const response = await fetch(`${apiConfig.baseUrl}/profile/decrypt-nin`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            encrypted_nin: user.encrypted_nin
          })
        });
        
        console.log('Decrypt API response status:', response.status);
        
        if (response.ok) {
          const result = await response.json();
          console.log('Decrypt API result:', result);
          if (result.success && result.decryptedNIN) {
            console.log('✅ Successfully decrypted NIN with encrypted_nin field:', result.decryptedNIN);
            setDecryptedNIN(result.decryptedNIN);
            setShowNIN(true);
            return;
          } else {
            console.log('❌ API returned success but no decrypted NIN');
          }
        } else {
          const errorText = await response.text();
          console.error('❌ Decrypt API error:', errorText);
        }
      } else {
        console.log('No encrypted NIN data available, using fallback');
      }
      
      // Fallback - show masked NIN if decryption fails
      setDecryptedNIN('•••••••••••');
      setShowNIN(true);
      console.log('NIN decryption failed, showing masked NIN');
    } catch (error) {
      console.error('Error decrypting NIN:', error);
      setDecryptedNIN('•••••••••••');
      setShowNIN(true);
    } finally {
      setLoadingNIN(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setError(null);
    
    // Simulate refresh time
    await new Promise(resolve => setTimeout(resolve, 500));
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            console.log('🔐 Profile: User logging out');
            await logout();
            router.replace('/(auth)/login');
          }
        },
      ]
    );
  };

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Profile editing feature will be available soon!');
  };

  const handleChangePassword = () => {
    Alert.alert('Change Password', 'Password change feature will be available soon!');
  };

  const handleNotifications = () => {
    Alert.alert('Notifications', 'Notification settings will be available soon!');
  };

  const handlePrivacy = () => {
    Alert.alert('Privacy Settings', 'Privacy settings will be available soon!');
  };


  const handleProfilePictureUpload = () => {
    Alert.alert(
      'Profile Picture',
      'Choose an option',
      [
        { text: 'Camera', onPress: () => console.log('Open camera') },
        { text: 'Gallery', onPress: () => console.log('Open gallery') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleProfilePictureDelete = () => {
    Alert.alert(
      'Delete Profile Picture',
      'Are you sure you want to delete your profile picture?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            setProfilePicture(null);
            console.log('Profile picture deleted');
          }
        }
      ]
    );
  };

  // Biometric functions moved to BiometricStatusComponent

  if (!isAuthenticated) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Redirecting to login...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#3b82f6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out" size={24} color="#dc2626" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <TouchableOpacity 
            style={styles.profilePictureContainer}
            onPress={handleProfilePictureUpload}
            activeOpacity={0.7}
          >
            {profilePicture ? (
              <Image source={{ uri: profilePicture }} style={styles.profilePicture} />
            ) : (
              <View style={styles.profileIcon}>
                <Ionicons name="person" size={48} color="#3b82f6" />
              </View>
            )}
            <View style={styles.profilePictureOverlay}>
              <Ionicons 
                name={profilePicture ? "camera" : "add"} 
                size={20} 
                color="white" 
              />
            </View>
            {profilePicture && (
              <TouchableOpacity 
                style={styles.deletePictureButton}
                onPress={handleProfilePictureDelete}
              >
                <Ionicons name="close" size={16} color="#dc2626" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
          
          <Text style={styles.profileName}>
            {user?.first_name} {user?.last_name}
          </Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>
          <View style={styles.verificationBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
            <Text style={styles.verificationText}>Verified Voter</Text>
          </View>
        </View>

        {/* Error Display */}
        {error && (
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle" size={20} color="#dc2626" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => setError(null)}>
              <Ionicons name="close" size={20} color="#dc2626" />
            </TouchableOpacity>
          </View>
        )}

        {/* Biometric Error Display - now handled by BiometricStatusComponent */}

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="person" size={20} color="#64748b" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Full Name</Text>
                <Text style={styles.infoValue}>
                  {user?.first_name} {user?.last_name}
                </Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="mail" size={20} color="#64748b" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{user?.email}</Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="call" size={20} color="#64748b" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>
                  {user?.phone_number || 'Not provided'}
                </Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="card" size={20} color="#64748b" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Voter ID</Text>
                <Text style={styles.infoValue}>
                  {user?.user_unique_id || 'Pending assignment'}
                </Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="calendar" size={20} color="#64748b" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Date of Birth</Text>
                <Text style={styles.infoValue}>
                  {user?.date_of_birth 
                    ? new Date(user.date_of_birth).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : 'Not provided'
                  }
                </Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="location" size={20} color="#64748b" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Address</Text>
                <Text style={styles.infoValue}>
                  {user?.address || 'Not provided'}
                </Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="transgender" size={20} color="#64748b" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Gender</Text>
                <Text style={styles.infoValue}>
                  {user?.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : 'Not provided'}
                </Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="shield-checkmark" size={20} color="#64748b" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>NIN Status</Text>
                <View style={styles.ninContainer}>
                  <Text style={styles.infoValue}>
                    {user?.nin_verified ? 'Verified' : 'Pending'}
                  </Text>
                  {user?.nin_verified && (
                    <TouchableOpacity 
                      style={styles.ninButton}
                      onPress={handleShowNIN}
                      disabled={loadingNIN}
                    >
                      <Text style={styles.ninButtonText}>
                        {loadingNIN ? 'Loading...' : showNIN ? 'Hide NIN' : 'Show NIN'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
            
            {user?.nin_verified && (
              <View style={styles.infoRow}>
                <Ionicons name="card" size={20} color="#64748b" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>NIN Number</Text>
                  <Text style={[styles.infoValue, styles.ninValue]}>
                    {showNIN ? (decryptedNIN || '•••••••••••') : (partialNIN || '•••••••••••')}
                  </Text>
                  {!showNIN && !loadingNIN && (
                    <Text style={styles.ninHint}>
                      Tap "Show NIN" to reveal your NIN number
                    </Text>
                  )}
                  {loadingNIN && (
                    <Text style={styles.ninHint}>
                      Decrypting NIN...
                    </Text>
                  )}
                </View>
              </View>
            )}
            
            <View style={styles.infoRow}>
              <Ionicons name="wallet" size={20} color="#64748b" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Wallet Address</Text>
                <Text style={[styles.infoValue, styles.walletValue]}>
                  {user?.wallet_address || 'Not assigned'}
                </Text>
              </View>
            </View>
            
            {user?.contract_address && (
              <View style={styles.infoRow}>
                <Ionicons name="cube" size={20} color="#64748b" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Contract Address</Text>
                  <Text style={[styles.infoValue, styles.walletValue]}>
                    {user.contract_address}
                  </Text>
                </View>
              </View>
            )}
            
            <View style={styles.infoRow}>
              <Ionicons name="checkmark-circle" size={20} color="#64748b" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Account Status</Text>
                <View style={styles.statusContainer}>
                  <Text style={styles.infoValue}>
                    {user?.is_active ? 'Active' : 'Inactive'}
                  </Text>
                  <View style={[styles.statusBadge, user?.is_active ? styles.statusActive : styles.statusInactive]}>
                    <Text style={[styles.statusText, user?.is_active ? styles.statusTextActive : styles.statusTextInactive]}>
                      {user?.is_active ? 'ACTIVE' : 'INACTIVE'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="calendar" size={20} color="#64748b" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Registration Date</Text>
                <Text style={styles.infoValue}>
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                </Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="person-circle" size={20} color="#64748b" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Role</Text>
                <Text style={styles.infoValue}>
                  {user?.role || 'Voter'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Biometric Security */}
        <View style={styles.section}>
          <BiometricStatusComponent 
            showMobileCTA={true}
            onStatusChange={(status) => {
              console.log('🔐 Profile: Biometric status changed:', status);
            }}
          />
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Actions</Text>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleEditProfile}>
            <Ionicons name="create" size={20} color="#3b82f6" />
            <Text style={styles.actionText}>Edit Profile</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleChangePassword}>
            <Ionicons name="lock-closed" size={20} color="#3b82f6" />
            <Text style={styles.actionText}>Change Password</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleNotifications}>
            <Ionicons name="notifications" size={20} color="#3b82f6" />
            <Text style={styles.actionText}>Notifications</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handlePrivacy}>
            <Ionicons name="shield-checkmark" size={20} color="#3b82f6" />
            <Text style={styles.actionText}>Privacy & Security</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>


        {/* App Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Information</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="information-circle" size={20} color="#64748b" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>App Version</Text>
                <Text style={styles.infoValue}>1.0.0</Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="shield-checkmark" size={20} color="#64748b" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Security Level</Text>
                <Text style={styles.infoValue}>High</Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="cube" size={20} color="#64748b" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Blockchain Network</Text>
                <Text style={styles.infoValue}>Ethereum Testnet</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profilePictureContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePicture: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profilePictureOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  deletePictureButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fecaca',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 12,
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  verificationText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#16a34a',
    fontWeight: '600',
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  errorText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#dc2626',
    fontWeight: '500',
  },
  biometricStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  biometricStatusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  biometricStatusContent: {
    marginLeft: 12,
    flex: 1,
  },
  biometricStatusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  biometricStatusDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  biometricWarningText: {
    fontSize: 12,
    color: '#f59e0b',
    marginTop: 4,
    fontWeight: '500',
  },
  biometricStatusRight: {
    alignItems: 'flex-end',
  },
  biometricStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  biometricStatusBadgeText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#16a34a',
    fontWeight: '600',
  },
  biometricStatusBadgeInactive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  biometricStatusBadgeTextInactive: {
    marginLeft: 4,
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '600',
  },
  biometricActions: {
    paddingTop: 16,
  },
  biometricButtonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
  },
  biometricButtonPrimary: {
    backgroundColor: '#3b82f6',
  },
  biometricButtonSecondary: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  biometricButtonDanger: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  biometricButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  biometricButtonTextSecondary: {
    color: '#3b82f6',
  },
  biometricButtonTextDanger: {
    color: '#dc2626',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  ninContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  ninButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  ninButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  ninValue: {
    fontFamily: 'monospace',
    fontSize: 14,
  },
  ninHint: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    fontStyle: 'italic',
  },
  walletValue: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#64748b',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusActive: {
    backgroundColor: '#dcfce7',
  },
  statusInactive: {
    backgroundColor: '#fef3c7',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  statusTextActive: {
    color: '#16a34a',
  },
  statusTextInactive: {
    color: '#f59e0b',
  },
});