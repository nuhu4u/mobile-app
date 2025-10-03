import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  StyleSheet,
  RefreshControl 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { useElectionStore } from '@/store/election-store';
import { useAuthStore } from '@/store/auth-store';

export default function ResultsScreen() {
  const { id } = useLocalSearchParams();
  const { currentElection, isLoading, error, fetchElectionById, clearError } = useElectionStore();
  const { isAuthenticated } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (id) {
      fetchElectionById(id as string);
    }
  }, [id, fetchElectionById]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated]);

  const handleRefresh = async () => {
    setRefreshing(true);
    if (id) {
      await fetchElectionById(id as string);
    }
    setRefreshing(false);
  };

  const handleBack = () => {
    router.back();
  };

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color="#64748b" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#ef4444" />
          <Text style={styles.errorTitle}>Error Loading Results</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => {
            clearError();
            if (id) fetchElectionById(id as string);
          }}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color="#64748b" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading election results...</Text>
        </View>
      </View>
    );
  }

  if (!currentElection) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color="#64748b" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="document-text" size={48} color="#6b7280" />
          <Text style={styles.errorTitle}>Election Not Found</Text>
          <Text style={styles.errorMessage}>The requested election could not be found.</Text>
        </View>
      </View>
    );
  }

  const totalVotes = currentElection.contestants?.reduce((sum, candidate) => sum + (candidate.votes || 0), 0) || 0;
  const sortedCandidates = [...(currentElection.contestants || [])].sort((a, b) => (b.votes || 0) - (a.votes || 0));

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#64748b" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Ionicons name="bar-chart" size={24} color="#3b82f6" />
          <Text style={styles.headerTitle}>Election Results</Text>
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <Ionicons name="refresh" size={20} color="#64748b" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Election Info Card */}
        <View style={styles.electionCard}>
          <View style={styles.electionHeader}>
            <Text style={styles.electionTitle}>{currentElection.title}</Text>
            <View style={[styles.statusBadge, 
              currentElection.status === 'ONGOING' ? styles.ongoingBadge : 
              currentElection.status === 'COMPLETED' ? styles.completedBadge : 
              styles.upcomingBadge
            ]}>
              <Text style={[styles.statusText, 
                currentElection.status === 'ONGOING' ? styles.ongoingText : 
                currentElection.status === 'COMPLETED' ? styles.completedText : 
                styles.upcomingText
              ]}>
                {currentElection.status}
              </Text>
            </View>
          </View>
          
          <View style={styles.electionStats}>
            <View style={styles.statItem}>
              <Ionicons name="people" size={20} color="#2563eb" />
              <Text style={styles.statLabel}>Total Votes</Text>
              <Text style={styles.statValue}>{totalVotes.toLocaleString()}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="person" size={20} color="#16a34a" />
              <Text style={styles.statLabel}>Candidates</Text>
              <Text style={styles.statValue}>{currentElection.contestants?.length || 0}</Text>
            </View>
          </View>
        </View>

        {/* Results Section */}
        <View style={styles.resultsCard}>
          <Text style={styles.resultsTitle}>Live Results</Text>
          
          {sortedCandidates.length > 0 ? (
            sortedCandidates.map((candidate, index) => {
              const percentage = totalVotes > 0 ? Math.round(((candidate.votes || 0) / totalVotes) * 100) : 0;
              const isLeading = index === 0 && (candidate.votes || 0) > 0;
              
              return (
                <View key={candidate.id || index} style={styles.candidateRow}>
                  <View style={styles.candidateInfo}>
                    <View style={styles.rankContainer}>
                      <View style={[styles.rankBadge, isLeading && styles.leadingRankBadge]}>
                        <Text style={[styles.rankText, isLeading && styles.leadingRankText]}>
                          {index + 1}
                        </Text>
                      </View>
                      {isLeading && (
                        <View style={styles.leadingBadge}>
                          <Text style={styles.leadingText}>Leading</Text>
                        </View>
                      )}
                    </View>
                    
                    <View style={styles.candidateDetails}>
                      <Text style={styles.candidateName}>{candidate.name}</Text>
                      <Text style={styles.candidateParty}>{candidate.party || 'Independent'}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.candidateStats}>
                    <Text style={styles.candidateVotes}>{(candidate.votes || 0).toLocaleString()}</Text>
                    <Text style={styles.candidatePercentage}>{percentage}%</Text>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: `${percentage}%` }]} />
                    </View>
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.noResultsContainer}>
              <Ionicons name="bar-chart" size={48} color="#9ca3af" />
              <Text style={styles.noResultsText}>No results available yet</Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push(`/elections/${id}`)}
          >
            <Ionicons name="eye" size={20} color="white" />
            <Text style={styles.actionButtonText}>View Election Details</Text>
          </TouchableOpacity>
          
          {currentElection.status === 'ONGOING' && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.voteButton]}
              onPress={() => router.push(`/vote/${id}`)}
            >
              <Ionicons name="checkmark-circle" size={20} color="white" />
              <Text style={styles.actionButtonText}>Vote Now</Text>
            </TouchableOpacity>
          )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 16,
    color: '#64748b',
    marginLeft: 4,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginLeft: 8,
  },
  refreshButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  electionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  electionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  electionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  ongoingBadge: {
    backgroundColor: '#dcfce7',
  },
  completedBadge: {
    backgroundColor: '#dbeafe',
  },
  upcomingBadge: {
    backgroundColor: '#fef3c7',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  ongoingText: {
    color: '#16a34a',
  },
  completedText: {
    color: '#2563eb',
  },
  upcomingText: {
    color: '#d97706',
  },
  electionStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 2,
  },
  resultsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
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
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  leadingRankBadge: {
    backgroundColor: '#10b981',
  },
  rankText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#64748b',
  },
  leadingRankText: {
    color: 'white',
  },
  leadingBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  leadingText: {
    fontSize: 10,
    color: '#16a34a',
    fontWeight: '600',
  },
  candidateDetails: {
    flex: 1,
  },
  candidateName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  candidateParty: {
    fontSize: 14,
    color: '#64748b',
  },
  candidateStats: {
    alignItems: 'flex-end',
    minWidth: 80,
  },
  candidateVotes: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 2,
  },
  candidatePercentage: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  progressBar: {
    width: 60,
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 2,
  },
  noResultsContainer: {
    alignItems: 'center',
    padding: 32,
  },
  noResultsText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 12,
  },
  actionButtons: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  voteButton: {
    backgroundColor: '#10b981',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});