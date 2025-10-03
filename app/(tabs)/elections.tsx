import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, RefreshControl, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function ElectionsScreen() {
  const [elections, setElections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [showElectionDetailsModal, setShowElectionDetailsModal] = useState(false);

  console.log('ElectionsScreen: Component loaded');

  // Mock data - will be replaced with API calls
  useEffect(() => {
    fetchElections();
    // Show modal when first accessing elections page
    setShowElectionDetailsModal(true);
  }, []);

  const fetchElections = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setElections([
        {
          _id: '1',
          title: 'Senatorial Election 2025',
          election_type: 'SENATORIAL',
          status: 'ONGOING',
          total_votes: 1250,
          contestants: [
            { name: 'Adebayo Ogundimu', party: 'APC', votes: 450, partyPicture: null },
            { name: 'Sarah Johnson', party: 'PDP', votes: 380, partyPicture: null },
            { name: 'Michael Adebayo', party: 'LP', votes: 250, partyPicture: null },
            { name: 'Fatima Ibrahim', party: 'NNPP', votes: 170, partyPicture: null }
          ]
        },
        {
          _id: '2',
          title: 'Governorship Election 2025',
          election_type: 'GUBERNATORIAL',
          status: 'ONGOING',
          total_votes: 3200,
          contestants: [
            { name: 'John Doe', party: 'APC', votes: 1200, partyPicture: null },
            { name: 'Jane Smith', party: 'PDP', votes: 1100, partyPicture: null },
            { name: 'Bob Wilson', party: 'LP', votes: 600, partyPicture: null },
            { name: 'Alice Brown', party: 'NNPP', votes: 300, partyPicture: null }
          ]
        }
      ]);
      setLoading(false);
      setLastUpdated(new Date());
    }, 1000);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchElections();
    setRefreshing(false);
  };

  const filteredElections = elections;

  const overallStats = {
    totalElections: elections.length,
    totalVotesCast: elections.reduce((sum, e) => sum + (e.total_votes || 0), 0),
    averageTurnout: 75.2
  };

  return (
    <>
      {/* Election Details Modal */}
      <Modal
        visible={showElectionDetailsModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowElectionDetailsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Election Details</Text>
              <TouchableOpacity 
                style={styles.modalBackButton}
                onPress={() => setShowElectionDetailsModal(false)}
              >
                <Ionicons name="arrow-back" size={20} color="#64748b" />
                <Text style={styles.modalBackText}>Back</Text>
              </TouchableOpacity>
            </View>

            {/* Modal Content */}
            <View style={styles.modalContent}>
              {/* Complete Blockchain Transactions Card */}
              <TouchableOpacity 
                style={styles.modalCard}
                onPress={() => {
                  setShowElectionDetailsModal(false);
                  router.push('/blockchain-transactions');
                }}
              >
                <View style={styles.modalCardIcon}>
                  <Ionicons name="server" size={32} color="#2563eb" />
                </View>
                <Text style={styles.modalCardTitle}>Complete Blockchain Transactions</Text>
                <Text style={styles.modalCardDescription}>
                  View all blockchain transactions and verification details
                </Text>
                <View style={[styles.modalCardButton, styles.modalCardButtonBlue]}>
                  <Ionicons name="server" size={16} color="white" />
                  <Text style={styles.modalCardButtonText}>View Transactions</Text>
                </View>
              </TouchableOpacity>

              {/* Total for Each Election Card */}
              <TouchableOpacity 
                style={styles.modalCard}
                onPress={() => {
                  setShowElectionDetailsModal(false);
                  router.push('/election-totals');
                }}
              >
                <View style={styles.modalCardIcon}>
                  <Ionicons name="bar-chart" size={32} color="#16a34a" />
                </View>
                <Text style={styles.modalCardTitle}>Total for Each Election</Text>
                <Text style={styles.modalCardDescription}>
                  View comprehensive vote counts and election statistics
                </Text>
                <View style={[styles.modalCardButton, styles.modalCardButtonGreen]}>
                  <Ionicons name="bar-chart" size={16} color="white" />
                  <Text style={styles.modalCardButtonText}>View Totals</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#1e293b" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <View style={styles.headerIconContainer}>
                <Ionicons name="trending-up" size={24} color="#16a34a" />
              </View>
          <View>
                <Text style={styles.headerTitle}>Live Elections</Text>
                <Text style={styles.headerSubtitle}>Real-time election results and statistics</Text>
              </View>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={fetchElections}
              disabled={loading}
            >
              <Ionicons 
                name="refresh" 
                size={16} 
                color="#64748b" 
                style={[loading && styles.spinningIcon]} 
              />
              <Text style={styles.refreshText}>
                {loading ? 'Refreshing...' : 'Refresh'}
              </Text>
            </TouchableOpacity>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>Live Updates</Text>
            </View>
            {lastUpdated && (
              <Text style={styles.lastUpdated}>
                Last updated: {lastUpdated.toLocaleTimeString()}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Overall Statistics */}
      <View style={styles.statsContainer}>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statTitle}>Active Elections</Text>
              <Ionicons name="document-text" size={16} color="#2563eb" />
            </View>
            <Text style={styles.statValue}>{overallStats.totalElections}</Text>
            <Text style={styles.statSubtext}>Ongoing nationwide</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statTitle}>Total Candidates</Text>
              <Ionicons name="people" size={16} color="#16a34a" />
            </View>
            <Text style={styles.statValue}>
              {elections.reduce((sum, e) => sum + (e.contestants?.length || 0), 0)}
            </Text>
            <Text style={styles.statSubtext}>Across all elections</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statTitle}>Votes Cast</Text>
              <Ionicons name="bar-chart" size={16} color="#ea580c" />
            </View>
            <Text style={styles.statValue}>
              {overallStats.totalVotesCast.toLocaleString()}
            </Text>
            <Text style={styles.statSubtext}>Across all elections</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statTitle}>Average Turnout</Text>
              <Ionicons name="trending-up" size={16} color="#9333ea" />
            </View>
            <Text style={styles.statValue}>{overallStats.averageTurnout.toFixed(1)}%</Text>
            <Text style={styles.statSubtext}>Participation rate</Text>
          </View>
        </View>
      </View>


      {/* Elections List */}
      <View style={styles.electionsContainer}>
        <Text style={styles.electionsTitle}>
          {filteredElections.length === elections.length ? "All Elections" : "Filtered Elections"} ({filteredElections.length})
        </Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Ionicons name="refresh" size={32} color="#64748b" style={styles.spinningIcon} />
            <Text style={styles.loadingText}>Loading elections...</Text>
          </View>
        ) : filteredElections.length > 0 ? (
          filteredElections.map((election) => (
            <View key={election._id} style={styles.electionCard}>
              <View style={styles.electionHeader}>
                <View style={styles.electionInfo}>
                  <Text style={styles.electionTitle}>{election.title}</Text>
                  <View style={styles.electionMeta}>
                    <Ionicons name="location" size={14} color="#64748b" />
                    <Text style={styles.electionMetaText}>
                      {election.election_type} • {election.status}
                    </Text>
                  </View>
                </View>
                <View style={styles.electionStatus}>
                  <View style={styles.statusBadges}>
                    <View style={[
                      styles.statusBadge,
                      election.status === 'ONGOING' ? styles.statusBadgeActive : styles.statusBadgeInactive
                    ]}>
                      {election.status === 'ONGOING' ? (
                        <>
                          <View style={styles.liveIndicator} />
                          <Text style={styles.statusText}>Live</Text>
                        </>
                      ) : (
                        <>
                          <Ionicons name="time" size={12} color="#64748b" />
                          <Text style={styles.statusText}>{election.status}</Text>
                        </>
                      )}
                    </View>
                  </View>
                  {election.contestants && election.contestants.length > 0 && (
                    <Text style={styles.leadingText}>
                      Leading: <Text style={styles.leadingName}>
                        {[...election.contestants]
                          .sort((a, b) => (b.votes || 0) - (a.votes || 0))[0]?.name || 'No votes yet'}
                      </Text>
                    </Text>
                  )}
                </View>
              </View>

              {/* Results Section */}
              <View style={styles.resultsSection}>
                <Text style={styles.resultsTitle}>Live Results</Text>
                {election.contestants && election.contestants.length > 0 ? (
                  [...election.contestants]
                    .sort((a, b) => (b.votes || 0) - (a.votes || 0))
                    .map((candidate, index) => {
                      const totalVotes = election.total_votes || 0;
                      const candidateVotes = candidate.votes || 0;
                      const percentage = totalVotes > 0 ? Math.round((candidateVotes / totalVotes) * 100) : 0;
                      
                      return (
                        <View key={index} style={styles.candidateRow}>
                          <View style={styles.candidateInfo}>
                            {index === 0 && candidateVotes > 0 && (
                              <View style={styles.leadingBadge}>
                                <Text style={styles.leadingBadgeText}>Leading</Text>
                              </View>
                            )}
                            <View style={styles.candidateAvatar}>
                              <Text style={styles.candidateInitial}>
                                {candidate.name.charAt(0)}
                              </Text>
                            </View>
                            <View style={styles.candidateDetails}>
                              <Text style={styles.candidateName}>{candidate.name}</Text>
                              <Text style={styles.candidateParty}>{candidate.party || 'Independent'}</Text>
                            </View>
                          </View>
                          <View style={styles.candidateStats}>
                            <Text style={styles.candidateVotes}>{candidateVotes.toLocaleString()}</Text>
                            <Text style={styles.candidatePercentage}>{percentage}%</Text>
                            <View style={styles.progressBar}>
                              <View 
                                style={[
                                  styles.progressFill, 
                                  { width: `${percentage}%` }
                                ]} 
        />
      </View>
    </View>
                        </View>
                      );
                    })
                ) : (
                  <Text style={styles.noCandidatesText}>No candidates available</Text>
                )}
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => router.push(`/elections/${election._id}`)}
                >
                  <Ionicons name="eye" size={16} color="white" />
                  <Text style={styles.actionButtonText}>View Details</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.resultsButton]}
                  onPress={() => router.push(`/results/${election._id}`)}
                >
                  <Ionicons name="bar-chart" size={16} color="white" />
                  <Text style={styles.actionButtonText}>View Results</Text>
                </TouchableOpacity>
                {election.status === 'ONGOING' && (
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.voteButton]}
                    onPress={() => router.push(`/vote/${election._id}`)}
                  >
                    <Ionicons name="document-text" size={16} color="white" />
                    <Text style={styles.actionButtonText}>Vote Now</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        ) : (
          <View style={styles.noElectionsContainer}>
            <Ionicons name="document-text" size={48} color="#64748b" />
            <Text style={styles.noElectionsText}>No elections found</Text>
            <Text style={styles.noElectionsSubtext}>
              Try adjusting your filters or check back later
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: 'white',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIconContainer: {
    backgroundColor: '#dcfce7',
    padding: 8,
    borderRadius: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  refreshText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 6,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16a34a',
    marginRight: 6,
  },
  liveText: {
    fontSize: 12,
    color: '#166534',
    fontWeight: '600',
  },
  lastUpdated: {
    fontSize: 10,
    color: '#64748b',
  },
  spinningIcon: {
    transform: [{ rotate: '360deg' }],
  },
  statsContainer: {
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  statSubtext: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  filtersCard: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filtersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginLeft: 8,
  },
  filtersContent: {
    padding: 16,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 12,
  },
  filterGroup: {
    flex: 1,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  selectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  selectText: {
    fontSize: 14,
    color: '#1e293b',
  },
  electionsContainer: {
    padding: 16,
  },
  electionsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 12,
  },
  electionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  electionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  electionInfo: {
    flex: 1,
  },
  electionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  electionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  electionMetaText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 4,
  },
  electionStatus: {
    alignItems: 'flex-end',
  },
  statusBadges: {
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeActive: {
    backgroundColor: '#dcfce7',
  },
  statusBadgeInactive: {
    backgroundColor: '#f3f4f6',
  },
  liveIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16a34a',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#166534',
  },
  leadingText: {
    fontSize: 12,
    color: '#64748b',
  },
  leadingName: {
    fontWeight: '600',
    color: '#1e293b',
  },
  resultsSection: {
    padding: 16,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  candidateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  candidateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  leadingBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 8,
  },
  leadingBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#92400e',
  },
  candidateAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  candidateInitial: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#64748b',
  },
  candidateDetails: {
    flex: 1,
  },
  candidateName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  candidateParty: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  candidateStats: {
    alignItems: 'flex-end',
  },
  candidateVotes: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  candidatePercentage: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  progressBar: {
    width: 60,
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    marginTop: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 2,
  },
  noCandidatesText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    padding: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#64748b',
    borderRadius: 8,
  },
  voteButton: {
    backgroundColor: '#16a34a',
  },
  resultsButton: {
    backgroundColor: '#8B5CF6',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  noElectionsContainer: {
    alignItems: 'center',
    padding: 32,
  },
  noElectionsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 16,
  },
  noElectionsSubtext: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  modalBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
  },
  modalBackText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 4,
  },
  modalContent: {
    padding: 20,
    gap: 16,
  },
  modalCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  modalCardIcon: {
    marginBottom: 16,
  },
  modalCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalCardDescription: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  modalCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
    justifyContent: 'center',
  },
  modalCardButtonBlue: {
    backgroundColor: '#2563eb',
  },
  modalCardButtonGreen: {
    backgroundColor: '#16a34a',
  },
  modalCardButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});