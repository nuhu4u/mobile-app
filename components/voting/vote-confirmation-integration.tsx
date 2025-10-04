/**
 * Vote Confirmation Integration Component
 * Integrates confirmation dialog with voting logic and state management
 */

import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { VoteConfirmationDialog } from './vote-confirmation-dialog';
import { useVoteConfirmation } from '../../hooks/use-vote-confirmation';
import { useElectionStore } from '../../store/election-store';
import { Election, Contestant } from '../../types/election';

interface VoteConfirmationIntegrationProps {
  visible: boolean;
  electionId: string | null;
  candidateId: string | null;
  onConfirm: (result: any) => void;
  onCancel: () => void;
  onError?: (error: string) => void;
  className?: string;
}

export function VoteConfirmationIntegration({
  visible,
  electionId,
  candidateId,
  onConfirm,
  onCancel,
  onError,
  className
}: VoteConfirmationIntegrationProps) {
  const { elections } = useElectionStore();
  const {
    state: confirmationState,
    generateVerificationCode,
    verifyBiometric,
    confirmVote,
    resetConfirmation,
    retryConfirmation,
    validateConfirmation
  } = useVoteConfirmation();

  const [election, setElection] = React.useState<Election | null>(null);
  const [candidate, setCandidate] = React.useState<Contestant | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Get election and candidate data
  React.useEffect(() => {
    if (electionId && candidateId) {
      const foundElection = elections.find(e => e.id === electionId);
      const foundCandidate = foundElection?.contestants.find(c => c.id === candidateId);
      
      setElection(foundElection || null);
      setCandidate(foundCandidate || null);
    } else {
      setElection(null);
      setCandidate(null);
    }
  }, [electionId, candidateId, elections]);

  // Generate verification code when dialog opens
  React.useEffect(() => {
    if (visible && election && candidate) {
      generateVerificationCode();
    }
  }, [visible, election, candidate, generateVerificationCode]);

  // Handle confirmation
  const handleConfirm = React.useCallback(async () => {
    if (!election || !candidate) return;

    setIsLoading(true);
    setError(null);

    try {
      // Validate confirmation
      const validation = validateConfirmation(election, candidate);
      if (!validation.valid) {
        setError(validation.message || 'Invalid confirmation');
        onError?.(validation.message || 'Invalid confirmation');
        return;
      }

      // Confirm vote
      const result = await confirmVote(election.id, candidate.id, confirmationState.verificationCode || '');
      
      if (result.success) {
        onConfirm(result);
      } else {
        setError(result.error || 'Confirmation failed');
        onError?.(result.error || 'Confirmation failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Confirmation failed';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [election, candidate, confirmVote, validateConfirmation, confirmationState.verificationCode, onConfirm, onError]);

  // Handle biometric verification
  const handleBiometricVerification = React.useCallback(async () => {
    try {
      // Use real biometric service instead of mock verification
      const { realBiometricService } = await import('@/lib/biometric/real-biometric-service');
      const result = await realBiometricService.verifyBiometricForVoting();
      
      if (result.success) {
        return true;
      } else {
        const errorMessage = result.error || 'Biometric verification failed';
        setError(errorMessage);
        onError?.(errorMessage);
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Biometric verification failed';
      setError(errorMessage);
      onError?.(errorMessage);
      return false;
    }
  }, [onError]);

  // Handle dialog close
  const handleClose = React.useCallback(() => {
    resetConfirmation();
    setError(null);
    onCancel();
  }, [resetConfirmation, onCancel]);

  // Handle retry
  const handleRetry = React.useCallback(() => {
    retryConfirmation();
    setError(null);
  }, [retryConfirmation]);

  // Reset state when dialog closes
  React.useEffect(() => {
    if (!visible) {
      resetConfirmation();
      setError(null);
    }
  }, [visible, resetConfirmation]);

  if (!election || !candidate) {
    return null;
  }

  return React.createElement(View, { style: styles.container },
    React.createElement(VoteConfirmationDialog, {
      visible: visible,
      election: election,
      candidate: candidate,
      onConfirm: handleConfirm,
      onCancel: handleClose,
      isLoading: isLoading || confirmationState.isConfirming,
      error: error || confirmationState.error
    })
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});

export default VoteConfirmationIntegration;
