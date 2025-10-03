import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AutoNetworkStatus from '@/components/network/auto-network-status';
import { useAuthStore } from '@/store/auth-store';

export default function HomePage() {
  const { isAuthenticated } = useAuthStore();
  const [elections, setElections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      console.log('🔐 User is authenticated, redirecting to dashboard');
      router.replace('/(tabs)/dashboard');
    }
  }, [isAuthenticated]);

  // Mock data for now - will replace with API calls
  useEffect(() => {
    setTimeout(() => {
      setElections([
        {
          _id: '1',
          title: 'Senatorial Election 2025',
          status: 'ONGOING',
          total_votes: 0,
          contestants: [
            { name: 'Adebayo Ogundimu', votes: 0 },
            { name: 'Sarah Johnson', votes: 0 },
            { name: 'Michael Adebayo', votes: 0 },
            { name: 'Fatima Ibrahim', votes: 0 }
          ]
        },
        {
          _id: '2',
          title: 'Governorship Election 2025',
          status: 'ONGOING',
          total_votes: 3,
          contestants: [
            { name: 'Adebayo Ogundimu', votes: 2 },
            { name: 'Sarah Johnson', votes: 1 },
            { name: 'Michael Adebayo', votes: 0 },
            { name: 'Fatima Ibrahim', votes: 0 }
          ]
        }
      ]);
      setLoading(false);
      setLastUpdated(new Date());
    }, 2000);
  }, []);

  // Filter active elections
  const activeElections = elections.filter(election =>
    election.status === 'ONGOING' || election.status === 'active'
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <Ionicons name="balloon-outline" size={32} color="#60a5fa" />
            <View style={styles.logoTextContainer}>
              <Text style={styles.logoText}>Nigerian E-Voting Portal</Text>
              <Text style={styles.subtitle}>Secure • Transparent • Decentralized</Text>
            </View>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => router.push('/(auth)/login')}
            >
              <View style={styles.buttonContent}>
                <Ionicons name="log-in" size={16} color="#1e293b" />
                <Text style={styles.loginButtonText}>Login</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.registerButton}
              onPress={() => router.push('/(auth)/register')}
            >
              <View style={styles.buttonContent}>
                <Ionicons name="person-add" size={16} color="white" />
                <Text style={styles.registerButtonText}>Register to Vote</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Network Status */}
        <View style={styles.networkStatusContainer}>
          <AutoNetworkStatus showDetails={true} />
        </View>
      </View>

      {/* Hero Section */}
      <View style={styles.heroSection}>
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>
            Your Voice, Your Vote, Your Future
          </Text>
          <Text style={styles.heroSubtitle}>
            Participate in Nigeria's most secure and transparent electronic voting system. Built on blockchain
            technology for maximum integrity.
          </Text>
          <View style={styles.heroButtons}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push('/(auth)/register')}
            >
              <Text style={styles.primaryButtonText}>Get Started</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => {
                // Navigate to elections page
                router.push('/(tabs)/elections');
              }}
            >
              <Text style={styles.secondaryButtonText}>View Live Elections</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Statistics Cards */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Election Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, styles.statCardBlue]}>
            <View style={styles.statHeader}>
              <Text style={styles.statLabel}>Total Registered Voters</Text>
              <Ionicons name="people" size={16} color="#2563eb" />
            </View>
            <Text style={styles.statValue}>84,004,084</Text>
            <Text style={styles.statChange}>+2.1% from last election</Text>
          </View>

          <View style={[styles.statCard, styles.statCardGreen]}>
            <View style={styles.statHeader}>
              <Text style={styles.statLabel}>Total Polling Units</Text>
              <Ionicons name="location" size={16} color="#16a34a" />
            </View>
            <Text style={styles.statValue}>176,846</Text>
            <Text style={styles.statChange}>Across all states</Text>
          </View>

          <View style={[styles.statCard, styles.statCardOrange]}>
            <View style={styles.statHeader}>
              <Text style={styles.statLabel}>Total LGAs</Text>
              <Ionicons name="business" size={16} color="#ea580c" />
            </View>
            <Text style={styles.statValue}>774</Text>
            <Text style={styles.statChange}>Local Government Areas</Text>
          </View>

          <View style={[styles.statCard, styles.statCardPurple]}>
            <View style={styles.statHeader}>
              <Text style={styles.statLabel}>Total States</Text>
              <Ionicons name="globe" size={16} color="#9333ea" />
            </View>
            <Text style={styles.statValue}>36 + FCT</Text>
            <Text style={styles.statChange}>States and Federal Capital Territory</Text>
          </View>
        </View>
      </View>

      {/* Elections Access */}
      <View style={styles.electionsAccessSection}>
        <TouchableOpacity
          style={styles.electionsCard}
          onPress={() => router.push('/(tabs)/elections')}
        >
          <View style={styles.electionsCardContent}>
            <View style={styles.electionsCardHeader}>
              <View style={styles.electionsIconContainer}>
                <Ionicons name="checkmark-circle" size={32} color="#ffffff" />
              </View>
              <View style={styles.electionsCardText}>
                <Text style={styles.electionsCardTitle}>Live Elections</Text>
                <Text style={styles.electionsCardSubtitle}>Participate in ongoing elections</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#16a34a" />
            </View>
            <View style={styles.electionsCardStats}>
              <View style={styles.statItem}>
                <Ionicons name="people" size={16} color="#64748b" />
                <Text style={styles.statText}>Active Elections</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="time" size={16} color="#64748b" />
                <Text style={styles.statText}>Real-time Results</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="shield-checkmark" size={16} color="#64748b" />
                <Text style={styles.statText}>Secure Voting</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Current Elections Status */}
      <View style={styles.electionsStatusSection}>
        <View style={styles.electionsStatusContent}>
          <Text style={styles.sectionTitle}>Current Election Status</Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <Ionicons name="refresh" size={20} color="#64748b" />
              <View style={styles.loadingBadge}>
                <Text style={styles.loadingText}>Loading Election Status...</Text>
              </View>
            </View>
          ) : activeElections.length > 0 ? (
            <View style={styles.liveBadge}>
              <Text style={styles.liveText}>
                LIVE: {activeElections.length} Active Election{activeElections.length > 1 ? 's' : ''}
              </Text>
            </View>
          ) : (
            <View style={styles.noElectionsBadge}>
              <Text style={styles.noElectionsText}>No Active Elections</Text>
            </View>
          )}

          {lastUpdated && !loading && (
            <Text style={styles.lastUpdated}>
              Last updated: {lastUpdated.toLocaleTimeString()}
            </Text>
          )}
        </View>

        {/* Election Cards */}
        {loading ? (
          <View style={styles.loadingElectionCard}>
            <View style={styles.loadingElectionContent}>
              <Ionicons name="refresh" size={32} color="#64748b" />
              <Text style={styles.loadingElectionText}>Loading election information...</Text>
            </View>
          </View>
        ) : activeElections.length > 0 ? (
          <View style={styles.electionsList}>
            {activeElections.map((election, index) => {
              const totalVotes = election.total_votes || election.contestants?.reduce((sum: number, c: any) => sum + (c.votes || 0), 0) || 0;

              return (
                <View key={election._id || index} style={styles.electionCard}>
                  <View style={styles.electionCardHeader}>
                    <View style={styles.electionCardTitleRow}>
                      <Ionicons name="checkmark-circle" size={24} color="#16a34a" />
                      <Text style={styles.electionCardTitle}>{election.title}</Text>
                      <View style={styles.liveBadge}>
                        <Text style={styles.liveText}>LIVE</Text>
                      </View>
                    </View>
                    <Text style={styles.electionStatus}>
                      Currently accepting votes • Status: {election.status}
                    </Text>
                  </View>

                  {/* Election Statistics */}
                  <View style={styles.electionStats}>
                    <View style={styles.electionStatItem}>
                      <View style={styles.electionStatHeader}>
                        <Ionicons name="trending-up" size={20} color="#2563eb" />
                        <Text style={styles.electionStatLabel}>Total Votes</Text>
                      </View>
                      <Text style={styles.electionStatValue}>{totalVotes.toLocaleString()}</Text>
                    </View>

                    <View style={styles.electionStatItem}>
                      <View style={styles.electionStatHeader}>
                        <Ionicons name="people" size={20} color="#16a34a" />
                        <Text style={styles.electionStatLabel}>Leading</Text>
                      </View>
                      <Text style={styles.electionStatValue}>
                        {election.contestants?.[0]?.name || 'Voting yet to commence'}
                      </Text>
                      <Text style={styles.electionStatSubtext}>
                        {election.contestants?.[0]?.votes ? `${election.contestants[0].votes} votes` : 'Election ready for voting'}
                      </Text>
                    </View>

                    <View style={styles.electionStatItem}>
                      <View style={styles.electionStatHeader}>
                        <Ionicons name="time" size={20} color="#9333ea" />
                        <Text style={styles.electionStatLabel}>Candidates</Text>
                      </View>
                      <Text style={styles.electionStatValue}>
                        {election.contestants?.length || 0}
                      </Text>
                    </View>
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.electionActions}>
                    <TouchableOpacity
                      style={styles.electionActionButton}
                      onPress={() => router.push(`/results/${election._id}`)}
                    >
                      <View style={styles.electionActionContent}>
                        <Ionicons name="trending-up" size={16} color="white" />
                        <Text style={styles.electionActionText}>View Live Results</Text>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.electionActionButtonSecondary}
                      onPress={() => router.push('/(auth)/login')}
                    >
                      <View style={styles.electionActionContent}>
                        <Ionicons name="balloon-outline" size={16} color="#1e293b" />
                        <Text style={styles.electionActionSecondaryText}>Vote Now</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.noElectionsCard}>
            <View style={styles.noElectionsContent}>
              <Text style={styles.noElectionsTitle}>Next Scheduled Election</Text>
              <Text style={styles.noElectionsSubtitle}>2027 General Elections</Text>
              <Text style={styles.noElectionsDescription}>
                Registration is currently open for the next general elections. Ensure you're registered to participate
                in Nigeria's democratic process.
              </Text>
              <TouchableOpacity
                style={styles.registerNowButton}
                onPress={() => router.push('/(auth)/register')}
              >
                <Text style={styles.registerNowButtonText}>Register to Vote</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

                  {/* Footer */}
                  <View style={styles.footer}>
                    <View style={styles.footerContent}>
                      <View style={styles.footerBrand}>
                        <View style={styles.footerBrandHeader}>
                          <Ionicons name="balloon-outline" size={20} color="#60a5fa" />
                          <Text style={styles.footerBrandText}>Nigerian E-Voting Portal</Text>
                        </View>
                        <Text style={styles.footerDescription}>
                          Secure, transparent, and decentralized voting system for Nigeria.
                        </Text>
                      </View>

                      <View style={styles.footerLinks}>
                        <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                          <Text style={styles.footerLink}>Register to Vote</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                          <Text style={styles.footerLink}>Voter Login</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => router.push('/(tabs)/elections')}>
                          <Text style={styles.footerLink}>Live Elections</Text>
                        </TouchableOpacity>
                      </View>

                      <View style={styles.footerSecurity}>
                        <View style={styles.footerSecurityItem}>
                          <Ionicons name="lock-closed" size={14} color="#60a5fa" />
                          <Text style={styles.footerSecurityText}>End-to-End Encryption</Text>
                        </View>
                        <View style={styles.footerSecurityItem}>
                          <Ionicons name="cube" size={14} color="#60a5fa" />
                          <Text style={styles.footerSecurityText}>Blockchain Verified</Text>
                        </View>
                        <View style={styles.footerSecurityItem}>
                          <Ionicons name="finger-print" size={14} color="#60a5fa" />
                          <Text style={styles.footerSecurityText}>NIN Authentication</Text>
                        </View>
                      </View>

                      <View style={styles.footerBottom}>
                        <Text style={styles.footerCopyright}>
                          © 2024 Nigerian E-Voting Portal. All rights reserved.
                        </Text>
                      </View>
                    </View>
                  </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#1e293b',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  networkStatusContainer: {
    marginTop: 16,
    paddingHorizontal: 4,
  },
  headerContent: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoTextContainer: {
    marginLeft: 12,
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: '#cbd5e1',
    textAlign: 'center',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
    justifyContent: 'space-between',
  },
  loginButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 8,
    backgroundColor: 'white',
    flex: 1,
    marginRight: 4,
  },
  registerButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#2563eb',
    flex: 1,
    marginLeft: 4,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#1e293b',
    fontWeight: '500',
    marginLeft: 8,
  },
  registerButtonText: {
    color: 'white',
    fontWeight: '500',
    marginLeft: 8,
  },
  heroSection: {
    backgroundColor: '#0f172a',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 30,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#cbd5e1',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  heroButtons: {
    flexDirection: 'column',
    gap: 12,
    width: '100%',
  },
  primaryButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#2563eb',
    width: '100%',
  },
  secondaryButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 8,
    backgroundColor: 'white',
    width: '100%',
  },
  primaryButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 18,
  },
  secondaryButtonText: {
    color: '#0f172a',
    fontWeight: '600',
    fontSize: 18,
  },
  statsSection: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: '#f1f5f9',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  statCard: {
    width: '48%',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statCardBlue: {
    borderLeftColor: '#2563eb',
  },
  statCardGreen: {
    borderLeftColor: '#16a34a',
  },
  statCardOrange: {
    borderLeftColor: '#ea580c',
  },
  statCardPurple: {
    borderLeftColor: '#9333ea',
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  statChange: {
    fontSize: 10,
    color: '#64748b',
  },
  electionsAccessSection: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: '#f8fafc',
  },
  electionsCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  electionsCardContent: {
    padding: 20,
  },
  electionsCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  electionsIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#16a34a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  electionsCardText: {
    flex: 1,
  },
  electionsCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  electionsCardSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  electionsCardStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 6,
    fontWeight: '500',
  },
  electionsStatusSection: {
    paddingVertical: 24,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 16,
  },
  electionsStatusContent: {
    alignItems: 'center',
    marginBottom: 20,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingBadge: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  loadingText: {
    fontSize: 18,
    color: '#475569',
  },
  liveBadge: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  liveText: {
    fontSize: 18,
    color: 'white',
    fontWeight: '600',
  },
  noElectionsBadge: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  noElectionsText: {
    fontSize: 18,
    color: '#475569',
  },
  lastUpdated: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 8,
  },
  loadingElectionCard: {
    backgroundColor: 'white',
    padding: 32,
    borderRadius: 12,
    maxWidth: 500,
    alignSelf: 'center',
  },
  loadingElectionContent: {
    alignItems: 'center',
  },
  loadingElectionText: {
    color: '#64748b',
    marginTop: 16,
  },
  electionsList: {
    gap: 24,
  },
  electionCard: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    marginBottom: 16,
  },
  electionCardHeader: {
    marginBottom: 16,
  },
  electionCardTitleRow: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  electionCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  electionStatus: {
    color: '#16a34a',
  },
  electionStats: {
    flexDirection: 'column',
    marginBottom: 16,
  },
  electionStatItem: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  electionStatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  electionStatLabel: {
    fontWeight: '600',
    color: '#2563eb',
    marginLeft: 8,
  },
  electionStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  electionStatSubtext: {
    fontSize: 14,
    color: '#64748b',
  },
  electionActions: {
    flexDirection: 'column',
    gap: 12,
  },
  electionActionButton: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
  },
  electionActionButtonSecondary: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
  },
  electionActionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  electionActionText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
  electionActionSecondaryText: {
    color: '#1e293b',
    fontWeight: '600',
    marginLeft: 8,
  },
  noElectionsCard: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 12,
    maxWidth: 500,
    alignSelf: 'center',
  },
  noElectionsContent: {
    alignItems: 'center',
  },
  noElectionsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  noElectionsSubtitle: {
    fontSize: 18,
    color: '#64748b',
    marginBottom: 16,
  },
  noElectionsDescription: {
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 16,
  },
  registerNowButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  registerNowButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  footer: {
    backgroundColor: '#1e293b',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  footerContent: {
    alignItems: 'center',
    gap: 16,
  },
  footerBrand: {
    alignItems: 'center',
  },
  footerBrandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  footerBrandText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: 'white',
  },
  footerDescription: {
    color: '#94a3b8',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  footerLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  footerLink: {
    color: '#94a3b8',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  footerSecurity: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  footerSecurityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerSecurityText: {
    color: '#94a3b8',
    fontSize: 10,
  },
  footerBottom: {
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 12,
  },
  footerCopyright: {
    textAlign: 'center',
    fontSize: 10,
    color: '#64748b',
    lineHeight: 14,
  },
});