import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Image, 
  Animated,
  Dimensions,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/auth-store';
import { useBiometric } from '@/hooks/use-biometric';

const { width, height } = Dimensions.get('window');

interface VotingModalProps {
  isOpen: boolean;
  onClose: () => void;
  election: any;
  voterInfo: any;
  onVoteSuccess?: () => void;
}

// Helper functions for party colors and acronyms
const getPartyColor = (party: string) => {
  if (!party) return '#CCCCCC';
  
  const upperParty = party.toUpperCase();
  if (upperParty.includes('APC') || upperParty.includes('ALL PROGRESSIVES CONGRESS')) {
    return '#FF0000'; // Red
  } else if (upperParty.includes('PDP') || upperParty.includes('PEOPLES DEMOCRATIC PARTY')) {
    return '#00FF00'; // Green
  } else if (upperParty.includes('LP') || upperParty.includes('LABOUR PARTY')) {
    return '#0000FF'; // Blue
  } else if (upperParty.includes('NNPP') || upperParty.includes('NEW NIGERIA PEOPLES PARTY')) {
    return '#FFA500'; // Orange
  }
  return '#CCCCCC'; // Gray
};

const getPartyAcronym = (party: string) => {
  if (!party) return 'Party';
  
  const upperParty = party.toUpperCase();
  if (upperParty.includes('APC') || upperParty.includes('ALL PROGRESSIVES CONGRESS')) {
    return 'APC';
  } else if (upperParty.includes('PDP') || upperParty.includes('PEOPLES DEMOCRATIC PARTY')) {
    return 'PDP';
  } else if (upperParty.includes('LP') || upperParty.includes('LABOUR PARTY')) {
    return 'LP';
  } else if (upperParty.includes('NNPP') || upperParty.includes('NEW NIGERIA PEOPLES PARTY')) {
    return 'NNPP';
  }
  return 'Party';
};

// Simple party logo helper - use local files from public/party-logos/
const getPartyLogo = (candidate: any) => {
  console.log('🎨 getPartyLogo called with candidate:', {
    name: candidate?.name,
    party: candidate?.party,
    partyPicture: candidate?.partyPicture
  });
  
  // Use local files from public/party-logos/ folder
  const partyName = candidate?.party?.toUpperCase() || '';
  
  if (partyName.includes('APC') || partyName.includes('ALL PROGRESSIVES CONGRESS')) {
    console.log('🎨 Using local APC file');
    return require('../../public/party-logos/apc.jpg');
  } else if (partyName.includes('PDP') || partyName.includes('PEOPLES DEMOCRATIC PARTY')) {
    console.log('🎨 Using local PDP file');
    return require('../../public/party-logos/pdp.jpg');
  } else if (partyName.includes('LP') || partyName.includes('LABOUR PARTY')) {
    console.log('🎨 Using local LP file');
    return require('../../public/party-logos/labour-party.jpg');
  } else if (partyName.includes('NNPP') || partyName.includes('NEW NIGERIA PEOPLES PARTY')) {
    console.log('🎨 Using local NNPP file');
    return require('../../public/party-logos/nnpp.jpg');
  }
  
  console.log('🎨 No local file found, returning null');
  return null;
};

export const VotingModal: React.FC<VotingModalProps> = ({
  isOpen,
  onClose,
  election,
  voterInfo,
  onVoteSuccess,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(height));
  const [biometricVerified, setBiometricVerified] = useState(false);
  const { token } = useAuthStore();
  const { verifyBiometricForVoting, isEnrolled } = useBiometric();

  React.useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleVoteSubmission = async () => {
    if (!selectedCandidate || !election) return;
    
    // Check if biometric is enrolled
    if (!isEnrolled) {
      Alert.alert(
        'Biometric Required',
        'You must enroll your biometric fingerprint before voting. Please go to your profile to enroll.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Verify biometric before voting
    try {
      Alert.alert(
        'Biometric Verification',
        'Please verify your identity with your fingerprint to cast your vote.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Verify & Vote', 
            onPress: async () => {
              try {
                const biometricData = await verifyBiometricForVoting(election?.id);
                setBiometricVerified(true);
                await submitVoteWithBiometric(biometricData);
              } catch (error: any) {
                Alert.alert('Verification Failed', error.message || 'Biometric verification failed');
              }
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('Biometric verification error:', error);
      Alert.alert('Error', 'Failed to verify biometric');
    }
  };

  const submitVoteWithBiometric = async (biometricData: any) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.148:3001/api'}/elections/${election.id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          candidate_id: selectedCandidate,
          biometric_hash: biometricData.biometric_hash,
          device_id: biometricData.device_id,
          timestamp: biometricData.timestamp,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to cast vote');
      }

      const result = await response.json();
      
      if (result.success) {
        Alert.alert('Success', 'Your vote has been cast successfully with biometric verification!');
        onVoteSuccess?.();
        onClose();
      } else {
        throw new Error(result.message || 'Vote submission failed');
      }
    } catch (error: any) {
      console.error('Vote submission error:', error);
      Alert.alert('Error', error.message || 'An error occurred while casting your vote');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepIcon = (step: number) => {
    switch (step) {
      case 1: return 'person-circle-outline';
      case 2: return 'document-text-outline';
      case 3: return 'checkmark-circle-outline';
      default: return 'ellipse-outline';
    }
  };

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return 'Voter Verification';
      case 2: return 'Select Candidate';
      case 3: return 'Confirm Vote';
      default: return 'Voting';
    }
  };

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      <Animated.View style={[styles.modal, { transform: [{ translateY: slideAnim }] }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.electionIcon}>
              <Ionicons name="document-text-outline" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.title}>{election?.title || 'Election'}</Text>
              <Text style={styles.subtitle}>{election?.type || 'Voting'}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(currentStep / 3) * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>Step {currentStep} of 3</Text>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Step Header */}
          <View style={styles.stepHeader}>
            <View style={styles.stepIconContainer}>
              <Ionicons name={getStepIcon(currentStep)} size={32} color="#3B82F6" />
            </View>
            <Text style={styles.stepTitle}>{getStepTitle(currentStep)}</Text>
          </View>

          {/* Step 1: Voter Verification */}
          {currentStep === 1 && (
            <View style={styles.stepContent}>
              <View style={styles.verificationCard}>
                <View style={styles.verificationHeader}>
                  <Ionicons name="shield-checkmark" size={24} color="#10B981" />
                  <Text style={styles.verificationTitle}>Identity Verification</Text>
                </View>
                
                <View style={styles.voterInfoGrid}>
                  <View style={styles.infoItem}>
                    <Ionicons name="person" size={16} color="#6B7280" />
                    <Text style={styles.infoLabel}>Name</Text>
                    <Text style={styles.infoValue}>{voterInfo?.name || 'N/A'}</Text>
                  </View>
                  
                  <View style={styles.infoItem}>
                    <Ionicons name="card" size={16} color="#6B7280" />
                    <Text style={styles.infoLabel}>Voter ID</Text>
                    <Text style={styles.infoValue}>{voterInfo?.voterId || 'N/A'}</Text>
                  </View>
                  
                  <View style={styles.infoItem}>
                    <Ionicons name="location" size={16} color="#6B7280" />
                    <Text style={styles.infoLabel}>Polling Unit</Text>
                    <Text style={styles.infoValue}>{voterInfo?.pollingUnit || 'N/A'}</Text>
                  </View>
                  
                  <View style={styles.infoItem}>
                    <Ionicons name="business" size={16} color="#6B7280" />
                    <Text style={styles.infoLabel}>Ward</Text>
                    <Text style={styles.infoValue}>{voterInfo?.ward || 'N/A'}</Text>
                  </View>
                  
                  <View style={styles.infoItem}>
                    <Ionicons name="map" size={16} color="#6B7280" />
                    <Text style={styles.infoLabel}>LGA</Text>
                    <Text style={styles.infoValue}>{voterInfo?.lga || 'N/A'}</Text>
                  </View>
                  
                  <View style={styles.infoItem}>
                    <Ionicons name="flag" size={16} color="#6B7280" />
                    <Text style={styles.infoLabel}>State</Text>
                    <Text style={styles.infoValue}>{voterInfo?.state || 'N/A'}</Text>
                  </View>
                </View>
              </View>
              
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={() => setCurrentStep(2)}
              >
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>Proceed to Ballot</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Step 2: Candidate Selection */}
          {currentStep === 2 && (
            <View style={styles.stepContent}>
              <View style={styles.ballotHeader}>
                <Text style={styles.ballotTitle}>OFFICIAL BALLOT PAPER</Text>
                <Text style={styles.ballotSubtitle}>FEDERAL REPUBLIC OF NIGERIA</Text>
                <Text style={styles.ballotAuthority}>INDEPENDENT NATIONAL ELECTORAL COMMISSION (INEC)</Text>
              </View>
              
              <Text style={styles.instructions}>
                Select ONE candidate by tapping their card. Your choice will be highlighted.
              </Text>
              
              <View style={styles.candidatesContainer}>
              {election?.contestants?.map((candidate: any, index: number) => {
                console.log('🎨 Rendering candidate:', {
                  index,
                  name: candidate.name,
                  party: candidate.party,
                  partyPicture: candidate.partyPicture,
                  hasPartyPicture: !!candidate.partyPicture
                });
                return (
                  <TouchableOpacity
                    key={candidate.id}
                    style={[
                      styles.candidateCard,
                      selectedCandidate === candidate.id && styles.selectedCandidateCard
                    ]}
                    onPress={() => setSelectedCandidate(candidate.id)}
                  >
                    {/* Party Logo at the top */}
                    <View style={styles.partyLogoTop}>
                      {getPartyLogo(candidate) ? (
                        <Image 
                          source={getPartyLogo(candidate)}
                          style={styles.partyLogoLarge}
                          onLoad={() => console.log('✅ Party logo loaded successfully for:', candidate.name)}
                          onError={(error) => {
                            console.log('❌ Party logo failed to load for:', candidate.name, 'Error:', error.nativeEvent.error);
                          }}
                        />
                      ) : (
                        <View style={[styles.partyLogoLarge, { 
                          backgroundColor: getPartyColor(candidate.party), 
                          justifyContent: 'center', 
                          alignItems: 'center' 
                        }]}>
                          <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                            {getPartyAcronym(candidate.party)}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Candidate Header with number and selection */}
                    <View style={styles.candidateHeader}>
                      <View style={styles.candidateNumber}>
                        <Text style={styles.candidateNumberText}>{index + 1}</Text>
                      </View>
                      <View style={styles.candidateCheckbox}>
                        {selectedCandidate === candidate.id && (
                          <Ionicons name="checkmark" size={20} color="#10B981" />
                        )}
                      </View>
                    </View>
                    
                    {/* Candidate Details */}
                    <View style={styles.candidateDetails}>
                      <Text style={styles.candidateName}>{candidate.name}</Text>
                      <Text style={styles.candidateParty}>{candidate.party}</Text>
                      <Text style={styles.candidateQualification}>
                        {candidate.qualification}
                      </Text>
                      <Text style={styles.runningMate}>
                        Running Mate: {candidate.running_mate}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
              </View>
              
              <View style={styles.selectionButtonRow}>
                <TouchableOpacity 
                  style={styles.backButton}
                  onPress={() => setCurrentStep(1)}
                >
                  <Ionicons name="arrow-back" size={20} color="#6B7280" />
                  <Text style={styles.backButtonText}>Back to Verification</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.proceedButton, !selectedCandidate && styles.disabledButton]}
                  onPress={() => setCurrentStep(3)}
                  disabled={!selectedCandidate}
                >
                  <Text style={styles.proceedButtonText}>
                    {selectedCandidate ? 'Proceed to Confirmation' : 'Select a Candidate First'}
                  </Text>
                  <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Step 3: Vote Confirmation */}
          {currentStep === 3 && (
            <View style={styles.stepContent}>
              <View style={styles.warningCard}>
                <Ionicons name="warning" size={24} color="#F59E0B" />
                <Text style={styles.warningText}>
                  Please review your selection carefully. Once submitted, your vote cannot be changed.
                </Text>
              </View>
              
              {selectedCandidate && (
                <View style={styles.confirmationCard}>
                  <Text style={styles.confirmationTitle}>Your Selection</Text>
                  <View style={styles.selectedCandidateInfo}>
                    {getPartyLogo(election?.contestants?.find((c: any) => c.id === selectedCandidate)) ? (
                      <Image 
                        source={getPartyLogo(
                          election?.contestants?.find((c: any) => c.id === selectedCandidate)
                        )}
                        style={styles.confirmationPartyLogo}
                        onLoad={() => console.log('✅ Confirmation party logo loaded successfully')}
                        onError={(error) => console.log('❌ Confirmation party logo failed to load. Error:', error.nativeEvent.error)}
                      />
                    ) : (
                      <View style={[styles.confirmationPartyLogo, { 
                        backgroundColor: getPartyColor(
                          election?.contestants?.find((c: any) => c.id === selectedCandidate)?.party
                        ), 
                        justifyContent: 'center', 
                        alignItems: 'center' 
                      }]}>
                        <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
                          {getPartyAcronym(
                            election?.contestants?.find((c: any) => c.id === selectedCandidate)?.party
                          )}
                        </Text>
                      </View>
                    )}
                    <View style={styles.confirmationDetails}>
                      <Text style={styles.confirmationCandidateName}>
                        {election?.contestants?.find((c: any) => c.id === selectedCandidate)?.name}
                      </Text>
                      <Text style={styles.confirmationCandidateParty}>
                        {election?.contestants?.find((c: any) => c.id === selectedCandidate)?.party}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
              
              <View style={styles.confirmationButtonRow}>
                <TouchableOpacity 
                  style={styles.backButton}
                  onPress={() => setCurrentStep(2)}
                >
                  <Ionicons name="arrow-back" size={20} color="#6B7280" />
                  <Text style={styles.backButtonText}>Back to Selection</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.confirmVoteButton, isSubmitting && styles.disabledButton]}
                  onPress={handleVoteSubmission}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                  )}
                  <Text style={styles.confirmVoteButtonText}>
                    {isSubmitting ? 'Submitting Vote...' : 'Confirm & Cast Vote'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: width * 0.98,
    height: height * 0.92,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 24,
  },
  header: {
    backgroundColor: '#3B82F6',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  electionIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
    lineHeight: 28,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  progressContainer: {
    padding: 24,
    backgroundColor: '#F8FAFC',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '700',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: 28,
  },
  stepIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    lineHeight: 26,
  },
  stepContent: {
    flex: 1,
  },
  verificationCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  verificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  verificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  voterInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 18,
    paddingHorizontal: 28,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    marginHorizontal: 10,
  },
  secondaryButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginRight: 12,
  },
  secondaryButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 24,
  },
  selectionButtonRow: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 12,
  },
  confirmationButtonRow: {
    flexDirection: 'column',
    marginTop: 24,
    gap: 12,
  },
  ballotHeader: {
    backgroundColor: '#F0FDF4',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  ballotTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#16A34A',
    marginBottom: 4,
  },
  ballotSubtitle: {
    fontSize: 12,
    color: '#16A34A',
    marginBottom: 2,
  },
  ballotAuthority: {
    fontSize: 10,
    color: '#16A34A',
  },
  instructions: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  candidatesContainer: {
    marginBottom: 20,
  },
  candidateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  selectedCandidateCard: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  partyLogoTop: {
    alignItems: 'center',
    marginBottom: 16,
  },
  partyLogoLarge: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#F3F4F6',
    borderWidth: 3,
    borderColor: '#000000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  candidateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  candidateNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  candidateNumberText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  candidateCheckbox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  candidateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  partyLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#000000', // Add border to make it visible
  },
  partyLogoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  partyLogoText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  candidateDetails: {
    alignItems: 'center',
    textAlign: 'center',
  },
  candidateName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 6,
    textAlign: 'center',
    lineHeight: 24,
  },
  candidateParty: {
    fontSize: 15,
    color: '#2563EB',
    marginBottom: 6,
    textAlign: 'center',
    fontWeight: '600',
  },
  candidateQualification: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 6,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 18,
  },
  runningMate: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 18,
  },
  warningCard: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  warningText: {
    fontSize: 14,
    color: '#92400E',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  confirmationCard: {
    backgroundColor: '#F0FDF4',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  confirmationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#16A34A',
    marginBottom: 16,
    textAlign: 'center',
  },
  selectedCandidateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confirmationPartyLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: '#F3F4F6',
  },
  confirmationPartyLogoPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmationPartyLogoText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  confirmationDetails: {
    flex: 1,
  },
  confirmationCandidateName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  confirmationCandidateParty: {
    fontSize: 16,
    color: '#2563EB',
  },
  submitButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginLeft: 12,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  backButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButtonText: {
    color: '#6B7280',
    fontSize: 17,
    fontWeight: '700',
    marginLeft: 10,
  },
  proceedButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 2,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  proceedButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    marginRight: 10,
    textAlign: 'center',
  },
  confirmVoteButton: {
    backgroundColor: '#10B981',
    paddingVertical: 20,
    paddingHorizontal: 28,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 3,
    borderColor: '#059669',
  },
  confirmVoteButtonText: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: 'bold',
    marginLeft: 10,
    textAlign: 'center',
  },
});

export default VotingModal;