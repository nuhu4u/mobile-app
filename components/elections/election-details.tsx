/**
 * Election Details Component
 * Comprehensive election detail page with tabs and interactive features
 */

import * as React from 'react';
import { View, Text, ScrollView, Pressable, Alert, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useElectionStore } from '../../store/election-store';
import { useAuthStore } from '../../store/auth-store';
import { Election, Contestant } from '../../types/election';
import { formatDate, formatDateTime } from '../../lib/utils';
import { getPartyPictureWithFallback } from '../../lib/utils/party-utils';

interface ElectionDetailsProps {
  electionId: string;
  onVotePress: (election: Election) => void;
  onResultsPress: (election: Election) => void;
  className?: string;
}

export function ElectionDetails({ 
  electionId, 
  onVotePress, 
  onResultsPress, 
  className 
}: ElectionDetailsProps) {
  const { 
    currentElection, 
    isLoading, 
    error, 
    fetchElectionById, 
    clearError 
  } = useElectionStore();
  
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = React.useState<'overview' | 'candidates' | 'results'>('overview');

  React.useEffect(() => {
    fetchElectionById(electionId);
  }, [electionId, fetchElectionById]);

  const handleVote = () => {
    if (!currentElection) return;
    
    if (currentElection.status !== 'ONGOING') {
      Alert.alert(
        'Voting Not Available',
        'Voting is only available during ongoing elections.',
        [{ text: 'OK' }]
      );
      return;
    }

    onVotePress(currentElection);
  };

  const handleResults = () => {
    if (!currentElection) return;
    onResultsPress(currentElection);
  };

  if (error) {
    return React.createElement(View, { style: styles.errorContainer },
      React.createElement(Ionicons, { name: 'alert-circle', size: 48, color: '#ef4444' }),
      React.createElement(Text, { style: styles.errorTitle }, 'Error Loading Election'),
      React.createElement(Text, { style: styles.errorMessage }, error),
      React.createElement(Pressable, { 
        style: styles.retryButton,
        onPress: () => {
          clearError();
          fetchElectionById(electionId);
        }
      },
        React.createElement(Text, { style: styles.retryButtonText }, 'Retry')
      )
    );
  }

  if (isLoading) {
    return React.createElement(View, { style: styles.loadingContainer },
      React.createElement(ActivityIndicator, { size: 'large', color: '#3b82f6' }),
      React.createElement(Text, { style: styles.loadingText }, 'Loading election details...')
    );
  }

  if (!currentElection) {
    return React.createElement(View, { style: styles.notFoundContainer },
      React.createElement(Ionicons, { name: 'alert-circle', size: 64, color: '#ef4444' }),
      React.createElement(Text, { style: styles.notFoundTitle }, 'Election Not Found'),
      React.createElement(Text, { style: styles.notFoundText }, 'The requested election could not be found.')
    );
  }

  const isUpcoming = currentElection.status === 'UPCOMING';
  const isOngoing = currentElection.status === 'ONGOING';
  const canVote = isOngoing && user;

  return React.createElement(ScrollView, { style: styles.scrollView },
    // Header
    React.createElement(View, { style: styles.header },
      React.createElement(View, { style: styles.headerContent },
        React.createElement(View, { style: styles.headerText },
          React.createElement(Text, { style: styles.title }, currentElection.title),
          React.createElement(Text, { style: styles.description }, currentElection.description)
        ),
        
        React.createElement(View, { 
          style: [styles.statusBadge, 
            isOngoing ? styles.statusActive : 
            isUpcoming ? styles.statusUpcoming : 
            styles.statusCompleted
          ]
        },
          React.createElement(Text, { style: styles.statusText }, currentElection.status)
        )
      ),

      React.createElement(View, { style: styles.headerInfo },
        React.createElement(View, { style: styles.infoItem },
          React.createElement(Ionicons, { name: 'calendar', size: 20, color: 'white' }),
          React.createElement(Text, { style: styles.infoText },
            `${formatDate(currentElection.start_date)} - ${formatDate(currentElection.end_date)}`)
        ),
        
        React.createElement(View, { style: styles.infoItem },
          React.createElement(Ionicons, { name: 'people', size: 20, color: 'white' }),
          React.createElement(Text, { style: styles.infoText }, `${currentElection.total_votes.toLocaleString()} votes`)
        )
      )
    ),

    // Action Buttons
    React.createElement(View, { style: styles.actionButtons },
      React.createElement(View, { style: styles.buttonRow },
        canVote && React.createElement(Pressable, { 
          style: styles.voteButton, 
          onPress: handleVote 
        },
          React.createElement(View, { style: styles.buttonContent },
            React.createElement(Ionicons, { name: 'checkmark-circle', size: 20, color: 'white' }),
            React.createElement(Text, { style: styles.buttonText }, 'Vote Now')
          )
        ),
        
        React.createElement(Pressable, { 
          style: styles.resultsButton, 
          onPress: handleResults 
        },
          React.createElement(View, { style: styles.buttonContent },
            React.createElement(Ionicons, { name: 'bar-chart', size: 20, color: '#3b82f6' }),
            React.createElement(Text, { style: styles.resultsButtonText }, 'View Results')
          )
        )
      )
    ),

    // Tabs
    React.createElement(View, { style: styles.tabs },
      [
        { key: 'overview', label: 'Overview', icon: 'information-circle' },
        { key: 'candidates', label: 'Candidates', icon: 'people' },
        { key: 'results', label: 'Results', icon: 'bar-chart' },
      ].map((tab) => 
        React.createElement(Pressable, {
          key: tab.key,
          onPress: () => setActiveTab(tab.key as any),
          style: [styles.tab, activeTab === tab.key && styles.activeTab]
        },
          React.createElement(View, { style: styles.tabContent },
            React.createElement(Ionicons, { 
              name: tab.icon as any, 
              size: 20, 
              color: activeTab === tab.key ? '#3b82f6' : '#6b7280' 
            }),
            React.createElement(Text, { 
              style: [styles.tabText, activeTab === tab.key && styles.activeTabText]
            }, tab.label)
          )
        )
      )
    ),

    // Tab Content
    React.createElement(View, { style: styles.tabContentContainer },
      activeTab === 'overview' && React.createElement(OverviewTab, { election: currentElection }),
      activeTab === 'candidates' && React.createElement(CandidatesTab, { 
        candidates: currentElection.contestants, 
        electionStatus: currentElection.status 
      }),
      activeTab === 'results' && React.createElement(ResultsTab, { 
        election: currentElection, 
        onResultsPress: handleResults 
      })
    )
  );
}

interface OverviewTabProps {
  election: Election;
}

function OverviewTab({ election }: OverviewTabProps) {
  return React.createElement(View, { style: styles.overviewContainer },
    React.createElement(View, { style: styles.infoCard },
      React.createElement(Text, { style: styles.cardTitle }, 'Election Information'),
      
      React.createElement(View, { style: styles.infoList },
        React.createElement(View, { style: styles.infoRow },
          React.createElement(Text, { style: styles.infoLabel }, 'Type'),
          React.createElement(Text, { style: styles.infoValue }, election.election_type)
        ),
        
        React.createElement(View, { style: styles.infoRow },
          React.createElement(Text, { style: styles.infoLabel }, 'Status'),
          React.createElement(View, { 
            style: [styles.statusBadge, 
              election.status === 'ONGOING' ? styles.statusActive : 
              election.status === 'UPCOMING' ? styles.statusUpcoming : 
              styles.statusCompleted
            ]
          },
            React.createElement(Text, { style: styles.statusText }, election.status)
          )
        ),
        
        React.createElement(View, { style: styles.infoRow },
          React.createElement(Text, { style: styles.infoLabel }, 'Start Date'),
          React.createElement(Text, { style: styles.infoValue }, formatDateTime(election.start_date))
        ),
        
        React.createElement(View, { style: styles.infoRow },
          React.createElement(Text, { style: styles.infoLabel }, 'End Date'),
          React.createElement(Text, { style: styles.infoValue }, formatDateTime(election.end_date))
        ),
        
        React.createElement(View, { style: styles.infoRow },
          React.createElement(Text, { style: styles.infoLabel }, 'Total Votes'),
          React.createElement(Text, { style: styles.infoValue }, election.total_votes.toLocaleString())
        ),
        
        React.createElement(View, { style: styles.infoRow },
          React.createElement(Text, { style: styles.infoLabel }, 'Candidates'),
          React.createElement(Text, { style: styles.infoValue }, election.contestants.length.toString())
        )
      )
    ),

    election.electionStats && React.createElement(View, { style: styles.statsCard },
      React.createElement(Text, { style: styles.cardTitle }, 'Statistics'),
      
      React.createElement(View, { style: styles.infoList },
        React.createElement(View, { style: styles.infoRow },
          React.createElement(Text, { style: styles.infoLabel }, 'Registered Voters'),
          React.createElement(Text, { style: styles.infoValue },
            election.electionStats.totalRegisteredVoters.toLocaleString())
        ),
        
        React.createElement(View, { style: styles.infoRow },
          React.createElement(Text, { style: styles.infoLabel }, 'Votes Cast'),
          React.createElement(Text, { style: styles.infoValue },
            election.electionStats.totalVotesCast.toLocaleString())
        ),
        
        React.createElement(View, { style: styles.infoRow },
          React.createElement(Text, { style: styles.infoLabel }, 'Turnout'),
          React.createElement(Text, { style: styles.infoValue },
            `${election.electionStats.electionTurnoutPercentage}%`)
        )
      )
    )
  );
}

interface CandidatesTabProps {
  candidates: Contestant[];
  electionStatus: string;
}

function CandidatesTab({ candidates }: CandidatesTabProps) {
  if (candidates.length === 0) {
    return React.createElement(View, { style: styles.emptyState },
      React.createElement(Ionicons, { name: 'person', size: 48, color: '#9ca3af' }),
      React.createElement(Text, { style: styles.emptyTitle }, 'No Candidates'),
      React.createElement(Text, { style: styles.emptyText },
        'No candidates have been registered for this election yet.')
    );
  }

  return React.createElement(View, { style: styles.candidatesContainer },
    candidates.map((candidate) => 
      React.createElement(View, { key: candidate.id, style: styles.candidateCard },
          React.createElement(View, { style: styles.candidateContent },
            React.createElement(View, { style: styles.candidateAvatar },
              (() => {
                const partyPicture = getPartyPictureWithFallback(candidate.name, candidate.party);
                return partyPicture ? 
                  React.createElement(Image, { 
                    source: partyPicture, 
                    style: styles.partyLogo 
                  }) :
                  React.createElement(Text, { style: styles.avatarText }, candidate.name.charAt(0));
              })()
            ),
            
            React.createElement(View, { style: styles.candidateInfo },
              React.createElement(Text, { style: styles.candidateName }, candidate.name),
              React.createElement(Text, { style: styles.candidateParty },
                candidate.party || 'Independent'),
              React.createElement(Text, { style: styles.candidatePosition }, candidate.position || 'Candidate')
            ),
          
          React.createElement(View, { style: styles.candidateVotes },
            React.createElement(Text, { style: styles.voteCount }, candidate.votes.toLocaleString()),
            React.createElement(Text, { style: styles.voteLabel }, 'votes')
          )
        )
      )
    )
  );
}

interface ResultsTabProps {
  election: Election;
  onResultsPress: () => void;
}

function ResultsTab({ election, onResultsPress }: ResultsTabProps) {
  const totalVotes = election.contestants?.reduce((sum, candidate) => sum + (candidate.votes || 0), 0) || 0;
  
  return React.createElement(View, { style: styles.resultsContainer },
    React.createElement(View, { style: styles.resultsCard },
      React.createElement(Text, { style: styles.cardTitle }, 'Live Results'),
      
      election.contestants && election.contestants.length > 0 ? React.createElement(View, { style: styles.resultsList },
        election.contestants
          .sort((a, b) => (b.votes || 0) - (a.votes || 0))
          .map((candidate, index) => {
            const percentage = totalVotes > 0 ? ((candidate.votes || 0) / totalVotes) * 100 : 0;
            
            return React.createElement(View, { 
              key: candidate.id || index, 
              style: styles.resultItem 
            },
              React.createElement(View, { style: styles.resultHeader },
                React.createElement(View, { style: styles.resultCandidate },
                  React.createElement(View, { style: styles.rankBadge },
                    React.createElement(Text, { style: styles.rankText }, (index + 1).toString())
                  ),
                  React.createElement(View, { style: styles.candidateDetails },
                    React.createElement(Text, { style: styles.candidateName }, candidate.name),
                    React.createElement(Text, { style: styles.candidateParty }, candidate.party || 'Independent')
                  )
                ),
                
                React.createElement(View, { style: styles.resultStats },
                  React.createElement(Text, { style: styles.voteCount },
                    (candidate.votes || 0).toLocaleString()),
                  React.createElement(Text, { style: styles.percentage },
                    `${percentage.toFixed(1)}%`)
                )
              ),
              
              React.createElement(View, { style: styles.progressBar },
                React.createElement(View, { 
                  style: [styles.progressFill, { width: `${percentage}%` }]
                })
              )
            );
          })
      ) : React.createElement(View, { style: styles.noResultsContainer },
        React.createElement(Ionicons, { name: 'bar-chart', size: 32, color: '#9ca3af' }),
        React.createElement(Text, { style: styles.noResultsText }, 'No results available yet')
      ),
      
      React.createElement(View, { style: styles.separator }),
      
      React.createElement(View, { style: styles.totalVotes },
        React.createElement(Text, { style: styles.totalLabel }, 'Total Votes'),
        React.createElement(Text, { style: styles.totalValue }, totalVotes.toLocaleString())
      )
    ),
    
    React.createElement(Pressable, { 
      style: styles.detailedResultsButton, 
      onPress: onResultsPress 
    },
      React.createElement(View, { style: styles.buttonContent },
        React.createElement(Ionicons, { name: 'bar-chart', size: 20, color: '#3b82f6' }),
        React.createElement(Text, { style: styles.detailedResultsText }, 'View Detailed Results')
      )
    )
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#f9fafb'
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280'
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8
  },
  errorMessage: {
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '500'
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24
  },
  notFoundTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8
  },
  notFoundText: {
    color: '#6b7280',
    textAlign: 'center'
  },
  header: {
    backgroundColor: '#3b82f6',
    padding: 24
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  headerText: {
    flex: 1
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8
  },
  description: {
    color: '#dbeafe',
    fontSize: 16
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1
  },
  statusActive: {
    backgroundColor: '#dcfce7',
    borderColor: '#bbf7d0'
  },
  statusUpcoming: {
    backgroundColor: '#dbeafe',
    borderColor: '#bfdbfe'
  },
  statusCompleted: {
    backgroundColor: '#f3f4f6',
    borderColor: '#d1d5db'
  },
  statusText: {
    color: '#374151',
    fontWeight: '500',
    fontSize: 12
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  infoText: {
    color: 'white',
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '500'
  },
  actionButtons: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12
  },
  voteButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  resultsButton: {
    flex: 1,
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3b82f6',
    alignItems: 'center'
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonText: {
    color: 'white',
    fontWeight: '500',
    marginLeft: 8
  },
  resultsButtonText: {
    color: '#3b82f6',
    fontWeight: '500',
    marginLeft: 8
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 8
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3b82f6'
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  tabText: {
    marginLeft: 8,
    fontWeight: '500',
    color: '#6b7280'
  },
  activeTabText: {
    color: '#3b82f6'
  },
  tabContentContainer: {
    padding: 16
  },
  overviewContainer: {
    gap: 16
  },
  infoCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  statsCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12
  },
  infoList: {
    gap: 12
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  infoLabel: {
    color: '#6b7280'
  },
  infoValue: {
    fontWeight: '500',
    color: '#111827'
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8
  },
  emptyText: {
    color: '#6b7280',
    textAlign: 'center'
  },
  candidatesContainer: {
    gap: 16
  },
  candidateCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  candidateContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16
  },
  candidateAvatar: {
    width: 48,
    height: 48,
    backgroundColor: '#e5e7eb',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280'
  },
  candidateInfo: {
    flex: 1
  },
  candidateName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827'
  },
  candidateParty: {
    fontSize: 14,
    color: '#6b7280'
  },
  candidatePosition: {
    fontSize: 14,
    color: '#9ca3af'
  },
  candidateVotes: {
    alignItems: 'flex-end'
  },
  voteCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827'
  },
  voteLabel: {
    fontSize: 12,
    color: '#9ca3af'
  },
  resultsContainer: {
    gap: 16
  },
  resultsCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  resultsList: {
    gap: 12
  },
  resultItem: {
    gap: 8
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  resultCandidate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  rankBadge: {
    width: 32,
    height: 32,
    backgroundColor: '#e5e7eb',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  rankText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280'
  },
  candidateDetails: {
    gap: 2
  },
  resultStats: {
    alignItems: 'flex-end'
  },
  percentage: {
    fontSize: 14,
    color: '#9ca3af'
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4
  },
  progressFill: {
    height: 8,
    backgroundColor: '#3b82f6',
    borderRadius: 4
  },
  separator: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 16
  },
  totalVotes: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  totalLabel: {
    fontWeight: '600',
    color: '#111827'
  },
  totalValue: {
    fontWeight: 'bold',
    color: '#111827'
  },
  detailedResultsButton: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3b82f6',
    alignItems: 'center'
  },
  detailedResultsText: {
    color: '#3b82f6',
    fontWeight: '500',
    marginLeft: 8
  },
  noResultsContainer: {
    alignItems: 'center',
    padding: 24
  },
  noResultsText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8
  },
  partyLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
  }
});

export default ElectionDetails;