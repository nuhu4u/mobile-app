import React from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { ElectionDetails } from '@/components/elections/election-details';

export default function ElectionDetailScreen() {
  const { id } = useLocalSearchParams();

  const handleVotePress = (election: any) => {
    router.push(`/vote/${election.id}`);
  };

  const handleResultsPress = (election: any) => {
    router.push(`/results/${election.id}`);
  };

  return (
    <ElectionDetails
      electionId={id as string}
      onVotePress={handleVotePress}
      onResultsPress={handleResultsPress}
    />
  );
}