import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Badge, Loading, Error, SkeletonList } from '@/components/ui';
import { useElectionStore } from '@/store/election-store';
import { Election, ElectionStatus } from '@/types/election';
import { formatDate, formatDateTime } from '@/lib/utils';
import { getPartyPictureWithFallback } from '@/lib/utils/party-utils';

interface ElectionListProps {
  onElectionPress: (election: Election) => void;
  className?: string;
}

export function ElectionList({ onElectionPress, className }: ElectionListProps) {
  const { 
    elections, 
    isLoading, 
    error, 
    hasMore, 
    fetchElections, 
    refreshElections,
    clearError 
  } = useElectionStore();
  
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchElections();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshElections();
    setRefreshing(false);
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      fetchElections();
    }
  };

  const getStatusColor = (status: ElectionStatus) => {
    switch (status) {
      case 'UPCOMING':
        return 'info';
      case 'ONGOING':
        return 'success';
      case 'COMPLETED':
        return 'default';
      case 'CANCELLED':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: ElectionStatus) => {
    switch (status) {
      case 'UPCOMING':
        return 'time';
      case 'ONGOING':
        return 'play-circle';
      case 'COMPLETED':
        return 'checkmark-circle';
      case 'CANCELLED':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  if (error) {
    return (
      <Error
        message={error}
        onRetry={() => {
          clearError();
          fetchElections();
        }}
        {...(className && { className })}
      />
    );
  }

  if (isLoading && elections.length === 0) {
    return (
      <View {...(className && { className })}>
        <SkeletonList items={5} />
      </View>
    );
  }

  if (elections.length === 0) {
    return (
      <View className={`flex-1 items-center justify-center p-6 ${className}`}>
        <Ionicons name="document-text" size={64} color="#9ca3af" />
        <Text className="text-xl font-semibold text-gray-900 mt-4 mb-2">
          No Elections Available
        </Text>
        <Text className="text-gray-600 text-center">
          There are currently no elections available for voting.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      {...(className && { className })}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
      onScroll={({ nativeEvent }) => {
        const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
        const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
        
        if (isCloseToBottom && hasMore && !isLoading) {
          handleLoadMore();
        }
      }}
      scrollEventThrottle={400}
    >
      <View className="space-y-4 p-4">
        {elections.map((election) => (
          <ElectionCard
            key={election.id}
            election={election}
            onPress={() => onElectionPress(election)}
            statusColor={getStatusColor(election.status)}
            statusIcon={getStatusIcon(election.status)}
          />
        ))}
        
        {isLoading && elections.length > 0 && (
          <View className="py-4">
            <Loading text="Loading more elections..." />
          </View>
        )}
        
        {!hasMore && elections.length > 0 && (
          <View className="py-4">
            <Text className="text-center text-gray-500 text-sm">
              No more elections to load
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

interface ElectionCardProps {
  election: Election;
  onPress: () => void;
  statusColor: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info';
  statusIcon: string;
}

function ElectionCard({ election, onPress, statusColor, statusIcon }: ElectionCardProps) {
  const isUpcoming = election.status === 'UPCOMING';
  const isOngoing = election.status === 'ONGOING';
  const isCompleted = election.status === 'COMPLETED';

  return (
    <Pressable onPress={onPress}>
      <Card className="p-4 active:scale-95 transition-transform">
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-900 mb-1">
              {election.title}
            </Text>
            <Text className="text-sm text-gray-600 mb-2" numberOfLines={2}>
              {election.description}
            </Text>
          </View>
          
          <Badge variant={statusColor} className="ml-2">
            <View className="flex-row items-center">
              <Ionicons 
                name={statusIcon as any} 
                size={12} 
                color="currentColor" 
                style={{ marginRight: 4 }}
              />
              {election.status}
            </View>
          </Badge>
        </View>

        <View className="space-y-2">
          <View className="flex-row items-center">
            <Ionicons name="calendar" size={16} color="#6b7280" />
            <Text className="text-sm text-gray-600 ml-2">
              {formatDate(election.start_date)} - {formatDate(election.end_date)}
            </Text>
          </View>

          <View className="flex-row items-center">
            <Ionicons name="people" size={16} color="#6b7280" />
            <Text className="text-sm text-gray-600 ml-2">
              {election.total_votes || 0} votes cast
            </Text>
          </View>

          {election.contestants && election.contestants.length > 0 && (
            <View className="flex-row items-center">
              <Ionicons name="person" size={16} color="#6b7280" />
              <Text className="text-sm text-gray-600 ml-2">
                {election.contestants.length} candidates
              </Text>
            </View>
          )}

          {election.contestants && election.contestants.length > 0 && (
            <View className="flex-row items-center mt-2">
              <Text className="text-xs text-gray-500">Leading: </Text>
              <Text className="text-xs text-gray-700 font-medium">
                {election.contestants
                  .sort((a: any, b: any) => (b.votes || 0) - (a.votes || 0))[0]?.name || 'No votes yet'}
              </Text>
            </View>
          )}

          {election.electionStats && (
            <View className="flex-row items-center">
              <Ionicons name="trending-up" size={16} color="#6b7280" />
              <Text className="text-sm text-gray-600 ml-2">
                {election.electionStats.electionTurnoutPercentage}% turnout
              </Text>
            </View>
          )}
        </View>

        <View className="flex-row items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <View className="flex-row items-center">
            <Ionicons name="location" size={16} color="#6b7280" />
            <Text className="text-sm text-gray-600 ml-2">
              {election.election_type || 'National'}
            </Text>
          </View>

          <View className="flex-row items-center">
            <Text className="text-sm text-gray-500">
              {isUpcoming && 'Starts '}
              {isOngoing && 'Ends '}
              {isCompleted && 'Ended '}
              {formatDateTime(isUpcoming ? election.start_date : election.end_date)}
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#9ca3af" className="ml-1" />
          </View>
        </View>
      </Card>
    </Pressable>
  );
}
