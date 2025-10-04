import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { VotingModal } from '@/components/voting/voting-modal';
import { useElectionStore } from '@/store/election-store';
import { useAuthStore } from '@/store/auth-store';

export default function VoteScreen() {
  const { id } = useLocalSearchParams();
  const { fetchElectionById, currentElection } = useElectionStore();
  const { user } = useAuthStore();

  React.useEffect(() => {
    if (id) {
      fetchElectionById(id as string);
    }
  }, [id, fetchElectionById]);

  if (!currentElection || !user) {
    return null; // Will be handled by VotingModal
  }

  return (
    <VotingModal
      isOpen={true}
      onClose={() => {
        // Navigate back when modal closes
        if (typeof window !== 'undefined' && window.history) {
          window.history.back();
        }
      }}
      election={currentElection}
      voterInfo={{
        name: `${user.first_name} ${user.last_name}`,
        voterId: user.user_unique_id || 'Pending',
        blockchainAddress: user.wallet_address || 'Not available',
        email: user.email,
        ninVerified: user.nin_verified,
        pollingUnit: user.geographicData?.pollingUnit || '',
        ward: user.geographicData?.ward || '',
        lga: user.geographicData?.lgaOfResidence || '',
        state: user.geographicData?.stateOfResidence || '',
      }}
      onVoteSuccess={() => {
        // Navigate back to dashboard on success
        // This will be handled by the VotingModal
      }}
    />
  );
}