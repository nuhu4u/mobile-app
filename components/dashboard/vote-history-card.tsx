import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Vote } from '@/lib/api/dashboard-service';
import { Election } from '@/types/election';
import { getPartyPictureWithFallback, getPartyNameWithFallback } from '@/lib/utils/party-utils';

interface VoteHistoryCardProps {
  vote: Vote;
  election: Election;
  onViewPosition: (electionId: string) => void;
  onViewResults: (electionId: string) => void;
  onExploreBlockchain: (txHash: string) => void;
  onViewTransaction: (txHash: string) => void;
}

export const VoteHistoryCard: React.FC<VoteHistoryCardProps> = ({
  vote,
  election,
  onViewPosition,
  onViewResults,
  onExploreBlockchain,
  onViewTransaction,
}) => {
  // Find the voted candidate from election contestants
  const votedCandidate = election.contestants?.find((candidate: any) => {
    // Try multiple matching strategies like in web app
    const candidateIdStr = candidate.id?.toString();
    const voteCandidateIdStr = vote.candidate_id?.toString();
    
    const match1 = candidateIdStr === voteCandidateIdStr;
    const match2 = candidate.mongoId === vote.candidate_id;
    const match3 = candidateIdStr === vote.candidate_id;
    const match4 = candidate.id === vote.candidate_id;
    
    return match1 || match2 || match3 || match4;
  });

  const finalCandidate = votedCandidate || {
    name: 'Unknown Candidate',
    party: 'Unknown Party',
    running_mate: null
  };

  const formattedVoteTimestamp = vote.vote_timestamp
    ? new Date(vote.vote_timestamp).toLocaleString()
    : vote.created_at
      ? new Date(vote.created_at).toLocaleString()
      : 'Unknown time';

  // Debug vote position data
  console.log('🔍 Vote Position Debug for vote:', vote._id);
  console.log('  vote.vote_position:', vote.vote_position);
  console.log('  vote.sequential_position:', (vote as any).sequential_position);
  console.log('  vote object keys:', Object.keys(vote));

  const partyPicture = getPartyPictureWithFallback(finalCandidate.name, finalCandidate.party);
  const partyName = getPartyNameWithFallback(finalCandidate.name, finalCandidate.party);
  
  // Calculate candidate's vote percentage
  const totalElectionVotes = election.contestants?.reduce((sum: number, candidate: any) => sum + (candidate.votes || candidate.vote_count || 0), 0) || 0;
  const candidateVotes = votedCandidate?.votes || votedCandidate?.vote_count || 0;
  const votePercentage = totalElectionVotes > 0 ? ((candidateVotes / totalElectionVotes) * 100).toFixed(1) : '0.0';
  
  console.log(`📊 Vote History - Candidate: ${finalCandidate.name}, votes: ${candidateVotes}, totalElectionVotes: ${totalElectionVotes}, percentage: ${votePercentage}%`);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="checkmark-circle" size={20} color="#10B981" />
          <Text style={styles.electionTitle}>{election.title}</Text>
        </View>
        <View style={styles.votedBadge}>
          <Text style={styles.votedText}>Voted</Text>
        </View>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Candidate:</Text>
          <Text style={styles.detailValue}>{finalCandidate?.name || 'Unknown Candidate'}</Text>
        </View>
        
        <View style={styles.partyRow}>
          <Text style={styles.detailLabel}>Party:</Text>
          <View style={styles.partyContainer}>
            {partyPicture ? (
              <Image 
                source={partyPicture} 
                style={styles.partyLogo}
                onError={() => {
                  console.log('❌ Party logo failed to load for:', finalCandidate.name);
                }}
              />
            ) : (
              <View style={[styles.partyLogo, { backgroundColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ fontSize: 8, color: '#64748b' }}>Party</Text>
              </View>
            )}
            <Text style={styles.partyName}>{partyName}</Text>
          </View>
        </View>
        
        {finalCandidate?.running_mate && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Running Mate:</Text>
            <Text style={styles.detailValue}>{finalCandidate.running_mate}</Text>
          </View>
        )}
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Voted on:</Text>
          <Text style={styles.detailValue}>{formattedVoteTimestamp}</Text>
        </View>
        
        {votedCandidate && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Candidate Performance:</Text>
            <View style={styles.performanceContainer}>
              <Text style={styles.performanceVotes}>{candidateVotes.toLocaleString()} votes</Text>
              <Text style={styles.performancePercentage}>({votePercentage}%)</Text>
            </View>
          </View>
        )}
        
        {(() => {
          // Try multiple possible position fields
          const position = vote.vote_position || 
                          (vote as any).sequential_position || 
                          (vote as any).position || 
                          (vote as any).votePosition;
          
          if (position !== undefined && position !== null) {
            return (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Vote Position:</Text>
                <View style={styles.positionBadge}>
                  <Text style={styles.positionText}>#{position}</Text>
                </View>
              </View>
            );
          }
          return null;
        })()}

        {/* Blockchain Transaction Data */}
        {vote.transaction_hash && (
          <View style={styles.blockchainSection}>
            <Text style={styles.blockchainTitle}>Blockchain Verification</Text>
            <View style={styles.transactionRow}>
              <Text style={styles.detailLabel}>Transaction:</Text>
              <View style={styles.transactionContainer}>
                <Text style={styles.transactionHash}>
                  {vote.transaction_hash.substring(0, 10)}...{vote.transaction_hash.substring(vote.transaction_hash.length - 8)}
                </Text>
                <TouchableOpacity onPress={() => onViewTransaction(vote.transaction_hash!)}>
                  <Ionicons name="eye-outline" size={16} color="#2563eb" style={styles.viewIcon} />
                </TouchableOpacity>
              </View>
            </View>
            
            {vote.blockchain_block_number && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Block:</Text>
                <Text style={styles.detailValue}>#{vote.blockchain_block_number}</Text>
              </View>
            )}
            
            {vote.blockchain_gas_used && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Gas Used:</Text>
                <Text style={styles.detailValue}>{parseInt(vote.blockchain_gas_used).toLocaleString()}</Text>
              </View>
            )}
          </View>
        )}
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={() => onViewPosition(election.id)}>
          <Ionicons name="locate-outline" size={16} color="#374151" />
          <Text style={styles.actionButtonText}>View Position</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={() => onViewResults(election.id)}>
          <Ionicons name="eye-outline" size={16} color="#374151" />
          <Text style={styles.actionButtonText}>View Results</Text>
        </TouchableOpacity>
        
        {vote.transaction_hash && (
          <TouchableOpacity style={styles.actionButton} onPress={() => onExploreBlockchain(vote.transaction_hash!)}>
            <Ionicons name="hash-outline" size={16} color="#374151" />
            <Text style={styles.actionButtonText}>Explore Blockchain</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F0FDF4', // Light green background like web app
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#DCFCE7',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  electionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginLeft: 8,
  },
  votedBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  votedText: {
    color: '#16A34A',
    fontSize: 12,
    fontWeight: '600',
  },
  detailsContainer: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#1E293B',
    flexShrink: 1,
    textAlign: 'right',
  },
  partyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  partyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  partyLogo: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 6,
  },
  partyName: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '500',
  },
  positionBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  positionText: {
    fontSize: 14,
    color: '#1E293B',
    fontFamily: 'monospace',
  },
  blockchainSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#DCFCE7',
  },
  blockchainTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16A34A',
    marginBottom: 8,
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  transactionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionHash: {
    fontSize: 14,
    color: '#2563EB',
    fontFamily: 'monospace',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  viewIcon: {
    marginLeft: 8,
  },
  actionButtons: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
    minWidth: 140,
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 6,
    fontWeight: '500',
  },
  performanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  performanceVotes: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '600',
    marginRight: 4,
  },
  performancePercentage: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '500',
  },
});

export default VoteHistoryCard;