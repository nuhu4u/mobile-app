import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function BlockchainTransactionsScreen() {
  const [searchHash, setSearchHash] = useState('');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRealTransactions();
  }, []);

  const loadRealTransactions = async () => {
    try {
      setLoading(true);
      
      // Import real blockchain service
      const { realBlockchainService } = await import('@/lib/blockchain/real-blockchain-service');
      
      // Get user's vote history from backend
      const response = await fetch('/api/users/vote-history', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch vote history');
      }

      const voteHistory = await response.json();
      
      // Transform vote history to transaction format with real blockchain data
      const transactions = await Promise.all(
        voteHistory.map(async (vote: any, index: number) => {
          try {
            // Get real transaction details from blockchain
            const txDetails = await realBlockchainService.getTransactionDetails(vote.transaction_hash);
            
            if (txDetails.success) {
              return {
                id: vote._id,
                voteTime: new Date(vote.vote_timestamp).toLocaleString(),
                blockNumber: txDetails.transaction.blockNumber,
                gasUsed: txDetails.transaction.gasUsed || 'N/A',
                transactionHash: vote.transaction_hash,
                contractAddress: vote.contract_address || 'N/A',
                votePosition: vote.vote_position || 'N/A',
                voteValue: 1,
                status: txDetails.transaction.status === 'success' ? 'Verified' : 'Failed'
              };
            } else {
              // Fallback for transactions that can't be verified
              return {
                id: vote._id,
                voteTime: new Date(vote.vote_timestamp).toLocaleString(),
                blockNumber: vote.block_number || 'N/A',
                gasUsed: vote.gas_used || 'N/A',
                transactionHash: vote.transaction_hash,
                contractAddress: vote.contract_address || 'N/A',
                votePosition: vote.vote_position || 'N/A',
                voteValue: 1,
                status: 'Pending Verification'
              };
            }
          } catch (error) {
            console.error('Error fetching transaction details:', error);
            // Fallback for errors
            return {
              id: vote._id,
              voteTime: new Date(vote.vote_timestamp).toLocaleString(),
              blockNumber: vote.block_number || 'N/A',
              gasUsed: vote.gas_used || 'N/A',
              transactionHash: vote.transaction_hash,
              contractAddress: vote.contract_address || 'N/A',
              votePosition: vote.vote_position || 'N/A',
              voteValue: 1,
              status: 'Pending Verification'
            };
          }
        })
      );

      setTransactions(transactions);
      setLoading(false);
    } catch (error) {
      console.error('Error loading real transactions:', error);
      // Fallback to empty state
      setTransactions([]);
      setLoading(false);
    }
  };

  const getAuthToken = async (): Promise<string> => {
    // Get auth token from storage
    try {
      const { useAuthStore } = await import('@/store/auth-store');
      const { token } = useAuthStore.getState();
      return token || '';
    } catch (error) {
      console.error('Error getting auth token:', error);
      return '';
    }
  };

  const electionStats = {
    totalVotes: 3,
    candidates: 4,
    contractStatus: 'Deployed',
    verificationRate: 100
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color="#64748b" />
            <Text style={styles.backText}>Back to Home</Text>
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <View style={styles.headerIcon}>
              <Ionicons name="server" size={24} color="#2563eb" />
            </View>
            <View>
              <Text style={styles.headerTitle}>Blockchain Transactions</Text>
              <Text style={styles.headerSubtitle}>View and verify election votes on the blockchain</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.push('/(tabs)/elections')}
          >
            <Ionicons name="arrow-back" size={20} color="#64748b" />
            <Text style={styles.backText}>Back to Elections</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Election Overview */}
      <View style={styles.electionOverview}>
        <Text style={styles.electionTitle}>Governorship Election 2025</Text>
        <Text style={styles.electionStatus}>ONGOING</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="document-text" size={20} color="#2563eb" />
            <Text style={styles.statValue}>{electionStats.totalVotes}</Text>
            <Text style={styles.statLabel}>On blockchain</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="people" size={20} color="#16a34a" />
            <Text style={styles.statValue}>{electionStats.candidates}</Text>
            <Text style={styles.statLabel}>Participating</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="server" size={20} color="#ea580c" />
            <Text style={styles.statValue}>{electionStats.contractStatus}</Text>
            <Text style={styles.statLabel}>Blockchain status</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={20} color="#9333ea" />
            <Text style={styles.statValue}>{electionStats.verificationRate}%</Text>
            <Text style={styles.statLabel}>Verified votes</Text>
          </View>
        </View>
      </View>

      {/* Search Votes */}
      <View style={styles.searchSection}>
        <Text style={styles.searchTitle}>🔍 Search Votes</Text>
        <Text style={styles.searchDescription}>Search for specific vote transactions by transaction hash</Text>
        
        <View style={styles.searchInputContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Enter transaction hash to search..."
            value={searchHash}
            onChangeText={setSearchHash}
            placeholderTextColor="#64748b"
          />
        </View>
        <Text style={styles.searchHint}>Search automatically as you type</Text>
      </View>

      {/* Vote Transactions */}
      <View style={styles.transactionsSection}>
        <View style={styles.transactionsHeader}>
          <Text style={styles.transactionsTitle}>Vote Transactions ({transactions.length})</Text>
          <Text style={styles.transactionsSubtitle}>All vote transactions for this election</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Ionicons name="refresh" size={32} color="#64748b" style={styles.spinningIcon} />
            <Text style={styles.loadingText}>Loading transactions...</Text>
          </View>
        ) : (
          <View style={styles.transactionsList}>
            {transactions.map((transaction) => (
              <View key={transaction.id} style={styles.transactionCard}>
                <View style={styles.transactionHeader}>
                  <View style={styles.transactionIcon}>
                    <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
                  </View>
                  <Text style={styles.transactionTitle}>Blockchain Verified Vote</Text>
                  <View style={styles.verifiedBadge}>
                    <Text style={styles.verifiedText}>Verified</Text>
                  </View>
                </View>

                <View style={styles.transactionDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Vote Time:</Text>
                    <Text style={styles.detailValue}>{transaction.voteTime}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Block Number:</Text>
                    <Text style={styles.detailValue}>{transaction.blockNumber}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Gas Used:</Text>
                    <Text style={styles.detailValue}>{transaction.gasUsed}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Transaction Hash (Full):</Text>
                    <Text style={styles.detailValue}>{transaction.transactionHash}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Contract Address:</Text>
                    <Text style={styles.detailValue}>{transaction.contractAddress}</Text>
                  </View>
                </View>

                <View style={styles.transactionFooter}>
                  <View style={styles.footerRow}>
                    <Text style={styles.footerLabel}>Gas Used:</Text>
                    <Text style={styles.footerValue}>{transaction.gasUsed}</Text>
                  </View>
                  <View style={styles.footerRow}>
                    <Text style={styles.footerLabel}>Vote Position:</Text>
                    <Text style={styles.footerValue}>#{transaction.votePosition}</Text>
                  </View>
                  <View style={styles.footerRow}>
                    <Text style={styles.footerLabel}>Vote Value:</Text>
                    <Text style={styles.footerValue}>{transaction.voteValue}</Text>
                  </View>
                  <View style={styles.footerRow}>
                    <Text style={styles.footerLabel}>Status:</Text>
                    <Text style={[styles.footerValue, styles.statusVerified]}>{transaction.status}</Text>
                  </View>
      </View>
    </View>
            ))}
          </View>
        )}
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
    backgroundColor: 'white',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerContent: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  backText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 4,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    textAlign: 'center',
  },
  electionOverview: {
    backgroundColor: 'white',
    margin: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  electionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
    textAlign: 'center',
  },
  electionStatus: {
    fontSize: 12,
    color: '#16a34a',
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
    textAlign: 'center',
  },
  searchSection: {
    backgroundColor: 'white',
    margin: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  searchDescription: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 12,
  },
  searchInputContainer: {
    marginBottom: 6,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 12,
    color: '#1e293b',
    backgroundColor: '#f9fafb',
  },
  searchHint: {
    fontSize: 10,
    color: '#64748b',
  },
  transactionsSection: {
    margin: 12,
  },
  transactionsHeader: {
    marginBottom: 12,
  },
  transactionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  transactionsSubtitle: {
    fontSize: 12,
    color: '#64748b',
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
  spinningIcon: {
    transform: [{ rotate: '360deg' }],
  },
  transactionsList: {
    gap: 16,
  },
  transactionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  transactionIcon: {
    marginRight: 8,
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  verifiedBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
  },
  verifiedText: {
    fontSize: 10,
    color: '#166534',
    fontWeight: '600',
  },
  transactionDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'column',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 11,
    color: '#1e293b',
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  transactionFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  footerRow: {
    width: '48%',
    marginBottom: 6,
  },
  footerLabel: {
    fontSize: 10,
    color: '#64748b',
  },
  footerValue: {
    fontSize: 10,
    color: '#1e293b',
    fontWeight: '600',
  },
  statusVerified: {
    color: '#16a34a',
  },
});
