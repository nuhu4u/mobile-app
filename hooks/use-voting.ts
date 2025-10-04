/**
 * Voting Hook
 * Custom hook for managing voting functionality
 */

import { useState, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import { Election, Contestant } from '../types/election';

export interface VoteRequest {
  electionId: string;
  candidateId: string;
  position?: number;
  timestamp: number;
  deviceId?: string;
  biometricData?: string;
}

export interface VoteResponse {
  success: boolean;
  message?: string;
  voteId?: string;
  transactionHash?: string;
  blockNumber?: number;
  error?: string;
}

export interface VotingState {
  isVoting: boolean;
  selectedCandidate: Contestant | null;
  voteHistory: VoteResponse[];
  error: string | null;
  lastVoteTime: number | null;
  canVote: boolean;
  remainingTime: number;
}

export interface UseVotingReturn {
  state: VotingState;
  selectCandidate: (candidate: Contestant) => void;
  clearSelection: () => void;
  castVote: (electionId: string, candidateId: string, position?: number) => Promise<VoteResponse>;
  canVoteForElection: (election: Election) => boolean;
  getVoteHistory: () => VoteResponse[];
  clearVoteHistory: () => void;
  validateVote: (election: Election, candidate: Contestant) => { valid: boolean; message?: string };
  getVotingProgress: (election: Election) => { progress: number; totalVotes: number; userVoted: boolean };
}

const initialState: VotingState = {
  isVoting: false,
  selectedCandidate: null,
  voteHistory: [],
  error: null,
  lastVoteTime: null,
  canVote: true,
  remainingTime: 0
};

export function useVoting(): UseVotingReturn {
  const [state, setState] = useState<VotingState>(initialState);
  const voteTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Select candidate
  const selectCandidate = useCallback((candidate: Contestant) => {
    setState(prev => ({
      ...prev,
      selectedCandidate: candidate,
      error: null
    }));
  }, []);

  // Clear selection
  const clearSelection = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedCandidate: null,
      error: null
    }));
  }, []);

  // Validate vote
  const validateVote = useCallback((election: Election, candidate: Contestant) => {
    // Check if election is ongoing
    const now = new Date();
    const startDate = new Date(election.start_date);
    const endDate = new Date(election.end_date);

    if (now < startDate) {
      return { valid: false, message: 'Election has not started yet' };
    }

    if (now > endDate) {
      return { valid: false, message: 'Election has ended' };
    }

    // Check if election is active
    if (election.status !== 'ONGOING') {
      return { valid: false, message: 'Election is not currently active' };
    }

    // Check if candidate exists in election
    const candidateExists = election.contestants.some(c => c.id === candidate.id);
    if (!candidateExists) {
      return { valid: false, message: 'Selected candidate is not valid for this election' };
    }

    // Check if user has already voted (mock implementation)
    const hasVoted = state.voteHistory.some(vote => 
      vote.success && vote.voteId && 
      state.voteHistory.length > 0 // Mock: assume user has voted if there are any votes
    );

    if (hasVoted) {
      return { valid: false, message: 'You have already voted in this election' };
    }

    // Check cooldown period (mock: 5 minutes)
    if (state.lastVoteTime && (Date.now() - state.lastVoteTime) < 5 * 60 * 1000) {
      return { valid: false, message: 'Please wait before voting again' };
    }

    return { valid: true };
  }, [state.voteHistory, state.lastVoteTime]);

  // Check if user can vote for election
  const canVoteForElection = useCallback((election: Election) => {
    const now = new Date();
    const startDate = new Date(election.start_date);
    const endDate = new Date(election.end_date);

    return (
      election.status === 'ONGOING' &&
      now >= startDate &&
      now <= endDate &&
      state.canVote
    );
  }, [state.canVote]);

  // Cast vote
  const castVote = useCallback(async (
    electionId: string, 
    candidateId: string, 
    position?: number
  ): Promise<VoteResponse> => {
    setState(prev => ({ ...prev, isVoting: true, error: null }));

    try {
      // Import real vote submission service
      const { VoteSubmissionService } = await import('@/services/vote-submission.service');
      
      // Get auth token
      const { useAuthStore } = await import('@/store/auth-store');
      const { token, user } = useAuthStore.getState();
      
      if (!token || !user) {
        throw new Error('User not authenticated');
      }

      // Create real vote submission request
      const voteRequest: VoteRequest = {
        electionId,
        candidateId,
        position,
        timestamp: Date.now(),
        deviceId: 'mobile-device',
        biometricData: 'biometric-verified'
      };

      console.log('🗳️ useVoting: Submitting real vote:', voteRequest);

      // Submit vote using real blockchain service
      const submissionService = VoteSubmissionService.getInstance();
      const submissionResult = await submissionService.submitVote({
        electionId,
        candidateId,
        voterId: user.id,
        voterAddress: user.wallet_address || '',
        token: token,
        timestamp: Date.now()
      });

      if (!submissionResult.success) {
        throw new Error(submissionResult.error || 'Vote submission failed');
      }

      // Create vote response with real blockchain data
      const voteResponse: VoteResponse = {
        success: true,
        message: 'Vote cast successfully on blockchain',
        voteId: submissionResult.voteId || `vote_${Date.now()}_${candidateId}`,
        transactionHash: submissionResult.transactionHash!,
        blockNumber: submissionResult.blockNumber!
      };

      console.log('🗳️ useVoting: Vote submitted successfully:', {
        transactionHash: voteResponse.transactionHash,
        blockNumber: voteResponse.blockNumber
      });

      // Update state
      setState(prev => ({
        ...prev,
        isVoting: false,
        voteHistory: [...prev.voteHistory, voteResponse],
        lastVoteTime: Date.now(),
        selectedCandidate: null,
        error: null
      }));

      // Show success alert with real transaction hash
      Alert.alert(
        'Vote Cast Successfully',
        `Your vote has been recorded on the blockchain. Transaction: ${voteResponse.transactionHash.substring(0, 10)}...`,
        [{ text: 'OK' }]
      );

      return voteResponse;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to cast vote';
      
      const errorResponse: VoteResponse = {
        success: false,
        message: errorMessage,
        error: errorMessage
      };

      setState(prev => ({
        ...prev,
        isVoting: false,
        error: errorMessage,
        voteHistory: [...prev.voteHistory, errorResponse]
      }));

      // Show error alert
      Alert.alert(
        'Vote Failed',
        errorMessage,
        [{ text: 'OK' }]
      );

      return errorResponse;
    }
  }, []);

  // Get vote history
  const getVoteHistory = useCallback(() => {
    return state.voteHistory;
  }, [state.voteHistory]);

  // Clear vote history
  const clearVoteHistory = useCallback(() => {
    setState(prev => ({
      ...prev,
      voteHistory: []
    }));
  }, []);

  // Get voting progress
  const getVotingProgress = useCallback((election: Election) => {
    const totalVotes = election.contestants.reduce((sum, candidate) => sum + candidate.votes, 0);
    const userVoted = state.voteHistory.some(vote => 
      vote.success && vote.voteId && 
      state.voteHistory.length > 0
    );

    // Mock progress calculation
    const progress = userVoted ? 100 : 0;

    return {
      progress,
      totalVotes,
      userVoted
    };
  }, [state.voteHistory]);

  return {
    state,
    selectCandidate,
    clearSelection,
    castVote,
    canVoteForElection,
    getVoteHistory,
    clearVoteHistory,
    validateVote,
    getVotingProgress
  };
}

export default useVoting;
