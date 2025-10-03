import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/auth-store';
import { dashboardService, DashboardData, Election as APIElection, Vote } from '@/lib/api/dashboard-service';
import { ApiConfigModal } from '@/components/common/ApiConfigModal';
import { VoteHistoryList } from '@/components/dashboard/vote-history-list';
import { useVoteHistory } from '@/hooks/use-vote-history';
import { VotingModal } from '@/components/voting/voting-modal';

interface VoterInfo {
  name: string;
  voterId: string;
  blockchainAddress: string;
  email: string;
  ninVerified: boolean;
  pollingUnit: string;
  ward: string;
  lga: string;
  state: string;
}

interface Election {
  id: string;
  title: string;
  type: string;
  status: string;
  endTime: string;
  hasVoted: boolean;
  votePosition: number;
  voteTimestamp: string | null;
  contestants: any[];
  leadingCandidate: {
    name: string;
    party: string;
    runningMate: string;
  };
  total_votes: number;
}

interface Stats {
  totalRegisteredVoters: number;
  totalVotesCast: number;
  nonVoters: number;
  turnoutPercentage: number;
}

export default function DashboardScreen() {
  // Auth state
  const { user, isAuthenticated, logout, isLoading: authLoading } = useAuthStore();
  
  // Vote history hook
  const { voteHistory, loading: voteHistoryLoading, error: voteHistoryError, refreshVoteHistory } = useVoteHistory();
  
  // Active tab state
  const [activeTab, setActiveTab] = useState<'elections' | 'results' | 'history'>('elections');
  
  // Voting modal state
  const [showVotingModal, setShowVotingModal] = useState(false);
  const [selectedElection, setSelectedElection] = useState<APIElection | null>(null);
  
  // Data states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Dashboard data
  const [voterInfo, setVoterInfo] = useState<VoterInfo | null>(null);
  const [elections, setElections] = useState<Election[]>([]);
  const [votedElections, setVotedElections] = useState<Election[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [myVotes, setMyVotes] = useState<Vote[]>([]);
  
  // Privacy states
  const [showFullVoterId, setShowFullVoterId] = useState(false);
  const [showFullAddress, setShowFullAddress] = useState(false);
  const [showFullEmail, setShowFullEmail] = useState(false);
  
  // API Configuration modal
  const [showApiConfig, setShowApiConfig] = useState(false);

  // Check authentication and load data
  useEffect(() => {
    console.log('🔐 Dashboard: Checking authentication');
    console.log('🔐 isAuthenticated:', isAuthenticated);
    console.log('🔐 user:', user);
    console.log('🔐 authLoading:', authLoading);
    
    // If still loading auth, wait
    if (authLoading) {
      console.log('⏳ Dashboard - Auth still loading, waiting...');
      return;
    }
    
    if (!isAuthenticated) {
      console.log('❌ Dashboard - Not authenticated, redirecting to login');
      router.replace('/(auth)/login');
      return;
    }
    
    console.log('✅ Dashboard - User authenticated, loading data');
    loadDashboardData();
  }, [isAuthenticated, user, authLoading]);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const interval = setInterval(() => {
      console.log('⏰ Dashboard: Auto-refreshing data...');
      refreshElections();
      refreshStats();
    }, 30000); // 30 seconds
    
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Removed health check - using proper authentication instead

  const loadMockData = async () => {
    console.log('📊 Dashboard: Loading mock data...');
    
    // Mock voter info
    setVoterInfo({
      name: `${user?.first_name} ${user?.last_name}` || 'John Doe',
      voterId: 'VID-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      blockchainAddress: '0x' + Math.random().toString(16).substr(2, 40),
      email: user?.email || 'user@example.com',
      ninVerified: true,
      pollingUnit: 'Polling Unit 001',
      ward: 'Ward 5',
      lga: 'Ikeja',
      state: 'Lagos',
    });
    
    // Mock elections
    const mockElections = [
      {
        id: 'presidential-2027',
        title: 'Presidential Election 2027',
        type: 'Presidential',
        status: 'ONGOING',
        endTime: '2027-02-25 18:00',
        hasVoted: false,
        votePosition: 0,
        voteTimestamp: null,
        contestants: [
          { id: 'candidate-1', name: 'Adebayo Ogundimu', party: 'APC', votes: 1250 },
          { id: 'candidate-2', name: 'Chinedu Okwu', party: 'PDP', votes: 980 },
          { id: 'candidate-3', name: 'Ibrahim Musa', party: 'LP', votes: 750 },
        ],
        leadingCandidate: {
          name: 'Adebayo Ogundimu',
          party: 'APC',
          runningMate: 'Dr. Fatima Abdullahi'
        },
        total_votes: 2980,
      }
    ];
    
    // Mock voted elections for vote history
    const mockVotedElections = [
      {
        id: 'gubernatorial-2026',
        title: 'Governorship Election 2025',
        type: 'Gubernatorial',
        status: 'COMPLETED',
        endTime: '2026-03-18 18:00',
        hasVoted: true,
        votePosition: 1842,
        voteTimestamp: '2026-03-10T14:30:00Z',
        contestants: [
          { id: 'candidate-gov-1', name: 'Adebayo Ogundimu', party: 'All Progressives Congress', votes: 890, running_mate: 'Dr. Fatima Abdullahi' },
          { id: 'candidate-gov-2', name: 'Emeka Okafor', party: 'PDP', votes: 620, running_mate: 'Prof. Sarah Johnson' },
        ],
        leadingCandidate: {
          name: 'Adebayo Ogundimu',
          party: 'All Progressives Congress',
          runningMate: 'Dr. Fatima Abdullahi'
        },
        total_votes: 1510,
      }
    ];
    
    // Mock vote history
    const mockVoteHistory = [
      {
        _id: 'vote-1',
        election_id: 'gubernatorial-2026',
        candidate_id: 'candidate-gov-1',
        vote_position: 1842,
        vote_timestamp: '2026-03-10T14:30:00Z',
        transaction_hash: '0x8d7885e4a3551e60',
        blockchain_block_number: 12345678,
        blockchain_gas_used: '21000',
        created_at: '2026-03-10T14:30:00Z',
      }
    ];
    
    setElections(mockElections);
    setVotedElections(mockVotedElections);
    setMyVotes(mockVoteHistory);
    
    // Mock stats
    setStats({
      totalRegisteredVoters: 84004084,
      totalVotesCast: 45234567,
      nonVoters: 38769517,
      turnoutPercentage: 53.8,
    });
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📊 Dashboard: Loading dashboard data from backend...');
      console.log('📊 Dashboard: API URL:', require('@/lib/config').apiConfig.baseUrl);
      
      // Fetch dashboard data from backend
      const response = await dashboardService.getDashboardData();
      console.log('📊 Dashboard: API Response:', response);
      
      if (response.success && response.data) {
        const data = response.data;
        console.log('📊 Dashboard: Full data object:', JSON.stringify(data, null, 2));
        
        // Debug elections data
        if (data.elections) {
          console.log('📊 Dashboard: Elections count:', data.elections.length);
          data.elections.forEach((election: any, index: number) => {
            console.log(`📊 Dashboard: Election ${index}:`, election.title);
            console.log(`📊 Dashboard: Election ${index} contestants:`, election.contestants);
            console.log(`📊 Dashboard: Election ${index} contestants length:`, election.contestants?.length || 0);
          });
        }
        
        // Set voter info
        if (data.voterInfo) {
          const voterData = {
            name: `${data.voterInfo.first_name} ${data.voterInfo.last_name}`,
            voterId: data.voterInfo.user_unique_id || 'Pending',
            blockchainAddress: data.voterInfo.wallet_address || 'Not available',
            email: data.voterInfo.email,
            ninVerified: data.voterInfo.nin_verified,
            pollingUnit: data.voterInfo.geographicData?.pollingUnit || '',
            ward: data.voterInfo.geographicData?.ward || '',
            lga: data.voterInfo.geographicData?.lgaOfResidence || '',
            state: data.voterInfo.geographicData?.stateOfResidence || '',
          };
          
          setVoterInfo(voterData);
          console.log('✅ Dashboard: Voter info loaded:', voterData);
        }
        
        // Process elections data
        if (data.activeElections) {
          console.log('🗳️ Dashboard: Processing elections data...');
          
          const processedElections = data.activeElections.map((election: APIElection) => {
            // Check if user has voted in this election
            const userVote = data.myVotes?.find((vote: Vote) => 
              vote.election_id === election.id
            );
            
            // Find leading candidate
            const sortedContestants = [...election.contestants].sort((a, b) => b.votes - a.votes);
            const leadingCandidate = sortedContestants[0];
            
            return {
              id: election.id,
              title: election.title,
              type: election.election_type,
              status: election.status,
              endTime: election.end_date,
              startTime: election.start_date,
              hasVoted: !!userVote,
              votePosition: userVote?.vote_position || 0,
              voteTimestamp: userVote?.vote_timestamp || null,
              contestants: election.contestants,
              leadingCandidate: leadingCandidate ? {
                name: leadingCandidate.name,
                party: leadingCandidate.party || 'Independent',
                runningMate: leadingCandidate.running_mate || ''
              } : { name: 'No candidates', party: 'N/A', runningMate: '' },
              total_votes: election.total_votes || 0,
              contract_address: election.contract_address,
            };
          });
          
          // Separate voted and non-voted elections
          const nonVoted = processedElections.filter((e: any) => !e.hasVoted);
          const voted = processedElections.filter((e: any) => e.hasVoted);
          
          setElections(nonVoted);
          setVotedElections(voted);
          
          console.log(`✅ Dashboard: Elections processed - ${nonVoted.length} available, ${voted.length} voted`);
        }
        
        // Set stats
        if (data.stats) {
          setStats(data.stats);
          console.log('✅ Dashboard: Stats loaded:', data.stats);
        }
        
        // Set vote history
        if (data.myVotes) {
          setMyVotes(data.myVotes);
          console.log('✅ Dashboard: Vote history loaded:', data.myVotes.length, 'votes');
          console.log('🗳️ Dashboard: Vote history details:', data.myVotes);
        } else {
          setMyVotes([]);
          console.log('⚠️ Dashboard: No vote history data received');
        }
        
        setSuccess('Dashboard data loaded successfully');
        setTimeout(() => setSuccess(null), 3000);
        
      } else {
        console.log('❌ Dashboard: Backend failed:', response);
        setError(`Backend error: ${response.error || 'Unknown error'}`);
      }
      
    } catch (err: any) {
      console.error('❌ Dashboard: Error loading data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadFallbackData = async () => {
    console.log('📊 Dashboard: Loading fallback data...');
    
    // Fallback voter info
    setVoterInfo({
      name: `${user?.first_name} ${user?.last_name}` || 'John Doe',
      voterId: 'VID-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      blockchainAddress: '0x' + Math.random().toString(16).substr(2, 40),
      email: user?.email || 'user@example.com',
      ninVerified: true,
      pollingUnit: 'Polling Unit 001',
      ward: 'Ward 5',
      lga: 'Ikeja',
      state: 'Lagos',
    });
    
    // Fallback elections
    const fallbackElections = [
      {
        id: 'presidential-2027',
        title: 'Presidential Election 2027',
        type: 'Presidential',
        status: 'ONGOING',
        endTime: '2027-02-25 18:00',
        hasVoted: false,
        votePosition: 0,
        voteTimestamp: null,
        contestants: [
          { id: 'candidate-1', name: 'Adebayo Ogundimu', party: 'APC', votes: 1250 },
          { id: 'candidate-2', name: 'Chinedu Okwu', party: 'PDP', votes: 980 },
          { id: 'candidate-3', name: 'Ibrahim Musa', party: 'LP', votes: 750 },
        ],
        leadingCandidate: {
          name: 'Adebayo Ogundimu',
          party: 'APC',
          runningMate: 'Dr. Fatima Abdullahi'
        },
        total_votes: 2980,
      }
    ];
    
    // Fallback voted elections for testing vote history
    const fallbackVotedElections = [
      {
        id: 'gubernatorial-2026',
        title: 'Lagos State Gubernatorial Election 2026',
        type: 'Gubernatorial',
        status: 'COMPLETED',
        endTime: '2026-03-18 18:00',
        hasVoted: true,
        votePosition: 1842,
        voteTimestamp: '2026-03-10T14:30:00Z',
        contestants: [
          { id: 'candidate-gov-1', name: 'Funmilayo Adeyemi', party: 'APC', votes: 890, running_mate: 'Dr. Kemi Williams' },
          { id: 'candidate-gov-2', name: 'Emeka Okafor', party: 'PDP', votes: 620, running_mate: 'Prof. Sarah Johnson' },
        ],
        leadingCandidate: {
          name: 'Funmilayo Adeyemi',
          party: 'APC',
          runningMate: 'Dr. Kemi Williams'
        },
        total_votes: 1510,
      }
    ];
    
    // Fallback vote history
    const fallbackVoteHistory = [
      {
        _id: 'vote-1',
        election_id: 'gubernatorial-2026',
        candidate_id: 'candidate-gov-1',
        vote_position: 1842,
        vote_timestamp: '2026-03-10T14:30:00Z',
        transaction_hash: '0x' + Math.random().toString(16).substr(2, 40),
        blockchain_block_number: 12345678,
        blockchain_gas_used: '21000',
        created_at: '2026-03-10T14:30:00Z',
      }
    ];
    
    setElections(fallbackElections);
    setVotedElections(fallbackVotedElections);
    setMyVotes(fallbackVoteHistory);
    
    // Fallback stats
    setStats({
      totalRegisteredVoters: 84004084,
      totalVotesCast: 45234567,
      nonVoters: 38769517,
      turnoutPercentage: 53.8,
    });
  };

  const handleRefresh = async () => {
    console.log('🔄 Dashboard: Refreshing data');
    setRefreshing(true);
    
    try {
      // Refresh all dashboard data
      await loadDashboardData();
      
      // Also refresh individual components
      await Promise.all([
        refreshElections(),
        refreshStats(),
      ]);
      
    } catch (error) {
      console.error('🔄 Dashboard: Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const refreshElections = async () => {
    try {
      const response = await dashboardService.refreshElectionData();
      if (response.success && response.data) {
        // Process and update elections
        console.log('🗳️ Dashboard: Elections refreshed');
      }
    } catch (error) {
      console.error('❌ Dashboard: Election refresh failed:', error);
    }
  };

  const refreshStats = async () => {
    try {
      const response = await dashboardService.getElectionStats();
      if (response.success && response.data) {
        setStats(response.data);
        console.log('📈 Dashboard: Stats refreshed');
      }
    } catch (error) {
      console.error('❌ Dashboard: Stats refresh failed:', error);
    }
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
          onPress: () => {
            console.log('🔐 Dashboard: User logging out');
            logout();
            router.replace('/(auth)/login');
          }
        },
      ]
    );
  };

  const formatValue = (value: string, show: boolean, maxLength: number = 8) => {
    if (!value || show) return value;
    return value.length > maxLength ? `${value.substring(0, maxLength)}...` : value;
  };

  const formatAddress = (address: string) => {
    if (!address || showFullAddress) return address;
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const formatEmail = (email: string) => {
    if (!email || showFullEmail) return email;
    const [username, domain] = email.split('@');
    if (!domain || !username) return email;
    const masked = username.length > 2 ? 
      `${username.substring(0, 2)}${'*'.repeat(Math.min(username.length - 2, 3))}` : 
      username;
    return `${masked}@${domain}`;
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Checking authentication...</Text>
          <Text style={styles.loadingSubtext}>Please wait...</Text>
        </View>
      </View>
    );
  }

  // Show loading while loading dashboard data
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading your dashboard...</Text>
          <Text style={styles.loadingSubtext}>Please wait...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.profileIcon}>
            <Ionicons name="person" size={24} color="#3b82f6" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Voter Dashboard</Text>
            <Text style={styles.headerSubtitle}>Welcome back, {voterInfo?.name || user?.first_name}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={[styles.refreshButton, refreshing && styles.refreshingButton]} 
            onPress={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? (
              <ActivityIndicator size="small" color="#3b82f6" />
            ) : (
              <Ionicons name="refresh" size={22} color="#3b82f6" />
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.configButton} 
            onPress={() => setShowApiConfig(true)}
          >
            <Ionicons name="settings" size={20} color="#64748b" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out" size={20} color="#dc2626" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Error Alert */}
      {error && (
        <View style={styles.errorAlert}>
          <Ionicons name="warning" size={20} color="#dc2626" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => setError(null)}>
            <Ionicons name="close" size={20} color="#dc2626" />
          </TouchableOpacity>
        </View>
      )}

      {/* Success Alert */}
      {success && (
        <View style={styles.successAlert}>
          <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
          <Text style={styles.successText}>{success}</Text>
          <TouchableOpacity onPress={() => setSuccess(null)}>
            <Ionicons name="close" size={20} color="#16a34a" />
          </TouchableOpacity>
        </View>
      )}

      {/* Debug Info */}
      {__DEV__ && (
        <View style={styles.debugAlert}>
          <Ionicons name="information-circle" size={20} color="#3b82f6" />
          <Text style={styles.debugText}>
            API: {require('@/lib/config').apiConfig.baseUrl} | 
            Elections: {elections.length} | 
            Voted: {votedElections.length} | 
            Votes: {myVotes.length}
          </Text>
        </View>
      )}

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >

        {/* Voter Information Card */}
        <View style={styles.voterCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="card" size={20} color="#3b82f6" />
            <Text style={styles.cardTitle}>Voter Information</Text>
          </View>
          
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Voter ID</Text>
              <View style={styles.infoValueRow}>
                <Text style={styles.infoValue}>
                  {formatValue(voterInfo?.voterId || '', showFullVoterId, 12)}
                </Text>
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    onPress={() => setShowFullVoterId(!showFullVoterId)}
                    style={styles.actionButton}
                  >
                    <Ionicons 
                      name={showFullVoterId ? "eye-off" : "eye"} 
                      size={16} 
                      color="#64748b" 
                    />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="copy" size={16} color="#64748b" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <View style={styles.infoValueRow}>
                <Text style={styles.infoValue}>
                  {formatEmail(voterInfo?.email || '')}
                </Text>
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    onPress={() => setShowFullEmail(!showFullEmail)}
                    style={styles.actionButton}
                  >
                    <Ionicons 
                      name={showFullEmail ? "eye-off" : "eye"} 
                      size={16} 
                      color="#64748b" 
                    />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="copy" size={16} color="#64748b" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Contract Address</Text>
              <View style={styles.infoValueRow}>
                <Text style={[styles.infoValue, styles.addressText]}>
                  {formatAddress(voterInfo?.blockchainAddress || '')}
                </Text>
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    onPress={() => setShowFullAddress(!showFullAddress)}
                    style={styles.actionButton}
                  >
                    <Ionicons 
                      name={showFullAddress ? "eye-off" : "eye"} 
                      size={16} 
                      color="#64748b" 
                    />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="copy" size={16} color="#64748b" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* View Full Profile Button */}
          <View style={styles.profileButtonContainer}>
            <TouchableOpacity 
              style={styles.profileButton}
              onPress={() => {
                console.log('👤 Dashboard: Navigating to profile page');
                router.push('/profile/page');
              }}
            >
              <Ionicons name="person" size={16} color="#64748b" />
              <Text style={styles.profileButtonText}>View Full Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="shield-checkmark" size={20} color="#64748b" />
            <Text style={styles.cardTitle}>Quick Status</Text>
          </View>
          
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>NIN Verification</Text>
            <View style={[styles.badge, voterInfo?.ninVerified ? styles.verifiedBadge : styles.pendingBadge]}>
              <Text style={[styles.badgeText, voterInfo?.ninVerified ? styles.verifiedText : styles.pendingText]}>
                {voterInfo?.ninVerified ? 'Verified' : 'Pending'}
              </Text>
            </View>
          </View>
          
          <View style={styles.statusDescription}>
            <Text style={styles.statusDescriptionText}>
              {voterInfo?.ninVerified ? 
                '✅ You can participate in all elections' :
                '⚠️ Complete NIN verification to unlock full voting privileges'
              }
            </Text>
          </View>
        </View>

        {/* Vote Position Card */}
        <View style={styles.votePositionCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="location" size={20} color="#64748b" />
            <Text style={styles.cardTitle}>Vote Position</Text>
          </View>
          
          <Text style={styles.votePositionDescription}>
            Track your vote position across all electoral levels
          </Text>
          
          <TouchableOpacity style={styles.votePositionButton}>
            <Ionicons name="location" size={16} color="white" />
            <Text style={styles.votePositionButtonText}>View Vote Position</Text>
          </TouchableOpacity>
        </View>

        {/* Election Statistics Card */}
        <View style={styles.statsCard}>
          <Text style={styles.cardTitle}>Election Statistics</Text>
          
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Voter Turnout</Text>
            <Text style={styles.statValue}>{stats?.turnoutPercentage}%</Text>
          </View>
          
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${stats?.turnoutPercentage || 0}%` }]} />
          </View>
          
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Votes Cast</Text>
            <Text style={styles.statValue}>{stats?.totalVotesCast?.toLocaleString()}</Text>
          </View>
          
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Non-Voters</Text>
            <Text style={styles.statValue}>{stats?.nonVoters?.toLocaleString()}</Text>
          </View>
        </View>

        {/* Mobile-Optimized Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'elections' && styles.activeTab]}
            onPress={() => setActiveTab('elections')}
          >
            <Ionicons 
              name="ballot-box" 
              size={18} 
              color={activeTab === 'elections' ? '#3b82f6' : '#64748b'} 
            />
            <Text style={[styles.tabText, activeTab === 'elections' && styles.activeTabText]}>
              Elections
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'results' && styles.activeTab]}
            onPress={() => setActiveTab('results')}
          >
            <Ionicons 
              name="bar-chart-outline" 
              size={18} 
              color={activeTab === 'results' ? '#3b82f6' : '#64748b'} 
            />
            <Text style={[styles.tabText, activeTab === 'results' && styles.activeTabText]}>
              Results
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'history' && styles.activeTab]}
            onPress={() => setActiveTab('history')}
          >
            <Ionicons 
              name="time-outline" 
              size={18} 
              color={activeTab === 'history' ? '#3b82f6' : '#64748b'} 
            />
            <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
              History
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'elections' && (
          <View style={styles.tabContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Available Elections</Text>
              <Text style={styles.sectionSubtitle}>{elections.length} election{elections.length !== 1 ? 's' : ''} available</Text>
            </View>
            {elections.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="ballot-box" size={48} color="#9ca3af" />
                <Text style={styles.emptyTitle}>No Active Elections</Text>
                <Text style={styles.emptyText}>There are currently no elections available for voting.</Text>
              </View>
            ) : (
              elections.map((election) => (
                <View key={election.id} style={styles.electionCard}>
                  <View style={styles.electionHeader}>
                    <View style={styles.electionInfo}>
                      <Text style={styles.electionTitle}>{election.title}</Text>
                      <Text style={styles.electionSubtitle}>
                        {election.type} • Ends {new Date(election.endTime).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={[styles.badge, styles.pendingBadge]}>
                      <Text style={[styles.badgeText, styles.pendingText]}>Active</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.electionDescription}>
                    Cast your vote for the {election.type.toLowerCase()} election. You can vote for one candidate per election.
                  </Text>
                  
                  <TouchableOpacity 
                    style={styles.voteButton}
                    onPress={() => {
                      console.log('🗳️ Dashboard: Cast vote button pressed for election:', election);
                      console.log('🗳️ Dashboard: Election contestants:', election.contestants);
                      console.log('🗳️ Dashboard: Setting showVotingModal to true');
                      setSelectedElection(election);
                      setShowVotingModal(true);
                      console.log('🗳️ Dashboard: showVotingModal should now be true');
                    }}
                  >
                    <Ionicons name="checkmark-circle" size={18} color="white" />
                    <Text style={styles.voteButtonText}>Cast Your Vote</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'results' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Live Election Results</Text>
            {[...elections, ...votedElections].map((election) => (
              <View key={election.id} style={styles.electionCard}>
                <View style={styles.electionHeader}>
                  <Text style={styles.electionTitle}>{election.title}</Text>
                  <View style={[styles.badge, styles.liveBadge]}>
                    <Text style={[styles.badgeText, styles.liveText]}>Live</Text>
                  </View>
                </View>
                
                <Text style={styles.leadingText}>
                  Leading: {election.leadingCandidate.name}
                  {election.leadingCandidate.runningMate && ` / ${election.leadingCandidate.runningMate}`}
                </Text>
                
                <View style={styles.candidatesContainer}>
                  {election.contestants.map((candidate, index) => {
                    const percentage = election.total_votes > 0 ? 
                      Math.round((candidate.votes / election.total_votes) * 100) : 0;
                    
                    return (
                      <View key={index} style={styles.candidateRow}>
                        <View style={styles.candidateInfo}>
                          <Text style={styles.candidateName}>{candidate.name}</Text>
                          <Text style={styles.candidateParty}>{candidate.party}</Text>
                        </View>
                        <View style={styles.candidateStats}>
                          <Text style={styles.candidatePercentage}>{percentage}%</Text>
                          <Text style={styles.candidateVotes}>{candidate.votes?.toLocaleString()} votes</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
                
                <View style={styles.electionStats}>
                  <Text style={styles.statLabel}>Total Votes Cast: {election.total_votes?.toLocaleString()}</Text>
                  <Text style={styles.statLabel}>Status: {election.status}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'history' && (
          <VoteHistoryList
            voteHistory={myVotes} // Use myVotes from dashboard data
            elections={[...elections, ...votedElections]} // Pass all elections for context
            onViewPosition={(electionId) => {
              console.log('View Position for election:', electionId);
              // Navigate to vote position page
            }}
            onViewResults={(electionId) => {
              console.log('View Results for election:', electionId);
              router.push(`/results/${electionId}`);
            }}
            onExploreBlockchain={(txHash) => {
              console.log('Explore Blockchain for tx:', txHash);
              // Navigate to blockchain explorer
            }}
            onViewTransaction={(txHash) => {
              console.log('View Transaction:', txHash);
              // Navigate to transaction details
            }}
          />
        )}
      </ScrollView>
      
      {/* API Configuration Modal */}
      <ApiConfigModal
        visible={showApiConfig}
        onClose={() => setShowApiConfig(false)}
        onApiUrlChange={(newUrl) => {
          console.log('📊 Dashboard: API URL changed to:', newUrl);
          // Reload dashboard data with new API URL
          loadDashboardData();
        }}
      />
      
      {/* Voting Modal */}
      <VotingModal
        isOpen={showVotingModal}
        onClose={() => setShowVotingModal(false)}
        election={selectedElection}
        voterInfo={voterInfo}
        onVoteSuccess={() => {
          setShowVotingModal(false);
          handleRefresh();
        }}
      />
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
    padding: 20,
  },
  loadingCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    minWidth: 280,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#64748b',
    fontWeight: '500',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 10,
  },
  refreshButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  refreshingButton: {
    backgroundColor: '#e0f2fe',
    borderColor: '#0ea5e9',
  },
  configButton: {
    padding: 8,
    borderRadius: 8,
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
    padding: 12,
    margin: 16,
    borderRadius: 8,
  },
  errorText: {
    flex: 1,
    marginLeft: 8,
    color: '#dc2626',
    fontSize: 14,
  },
  successAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderLeftWidth: 4,
    borderLeftColor: '#16a34a',
    padding: 12,
    margin: 16,
    borderRadius: 8,
  },
  successText: {
    flex: 1,
    marginLeft: 8,
    color: '#16a34a',
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  voterCard: {
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsCard: {
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
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginLeft: 8,
  },
  infoSection: {
    gap: 12,
  },
  infoRow: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  infoValueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  addressText: {
    fontFamily: 'monospace',
    fontSize: 12,
    backgroundColor: '#f1f5f9',
    padding: 8,
    borderRadius: 6,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  actionButton: {
    padding: 6,
    borderRadius: 4,
    backgroundColor: '#f8fafc',
  },
  profileButtonContainer: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    marginTop: 12,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'white',
  },
  profileButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  statusCard: {
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
  statusLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  statusDescription: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    marginTop: 12,
  },
  statusDescriptionText: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 16,
  },
  votePositionCard: {
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
  votePositionDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
    lineHeight: 20,
  },
  votePositionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7c3aed',
    borderRadius: 8,
    padding: 12,
  },
  votePositionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedBadge: {
    backgroundColor: '#dcfce7',
  },
  pendingBadge: {
    backgroundColor: '#fef3c7',
  },
  liveBadge: {
    backgroundColor: '#dcfce7',
  },
  votedBadge: {
    backgroundColor: '#dcfce7',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  verifiedText: {
    color: '#16a34a',
  },
  pendingText: {
    color: '#d97706',
  },
  liveText: {
    color: '#16a34a',
  },
  votedText: {
    color: '#16a34a',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 8,
    marginBottom: 24,
    marginHorizontal: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  activeTab: {
    backgroundColor: '#3b82f6',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  tabText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  activeTabText: {
    color: 'white',
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
  },
  sectionHeader: {
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 15,
    color: '#64748b',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: 'white',
    borderRadius: 12,
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
  },
  electionCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 22,
    marginBottom: 20,
    marginHorizontal: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  electionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  electionInfo: {
    flex: 1,
  },
  electionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 6,
    lineHeight: 26,
  },
  electionSubtitle: {
    fontSize: 15,
    color: '#64748b',
    fontWeight: '500',
  },
  electionDescription: {
    fontSize: 15,
    color: '#64748b',
    marginBottom: 20,
    lineHeight: 22,
    fontWeight: '400',
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 28,
    marginTop: 20,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  voteButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '700',
    marginLeft: 10,
  },
  leadingText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
    fontWeight: '500',
  },
  candidatesContainer: {
    marginBottom: 16,
  },
  candidateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  candidateInfo: {
    flex: 1,
  },
  candidateName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  candidateParty: {
    fontSize: 12,
    color: '#64748b',
  },
  candidateStats: {
    alignItems: 'flex-end',
  },
  candidatePercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  candidateVotes: {
    fontSize: 12,
    color: '#64748b',
  },
  electionStats: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 12,
    gap: 4,
  },
  voteHistoryCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  voteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  voteElectionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginLeft: 8,
  },
  voteDetails: {
    gap: 6,
  },
  voteDetail: {
    fontSize: 14,
    color: '#374151',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: 'white',
    borderRadius: 12,
    marginTop: 16,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 24,
  },
  debugText: {
    marginTop: 8,
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  blockchainInfo: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#dcfce7',
  },
  blockchainTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16a34a',
    marginBottom: 8,
  },
  voteActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#dcfce7',
  },
  voteActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  voteActionText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  debugAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
    padding: 12,
    margin: 16,
    borderRadius: 8,
  },
});
