import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/apiService';

interface UseAnalyticsReturn {
  systemAnalytics: any | null;
  electionAnalytics: any | null;
  loading: boolean;
  error: string | null;
  refreshAnalytics: () => Promise<void>;
  getElectionAnalytics: (electionId: string) => Promise<void>;
}

export const useAnalytics = (): UseAnalyticsReturn => {
  const [systemAnalytics, setSystemAnalytics] = useState<any | null>(null);
  const [electionAnalytics, setElectionAnalytics] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSystemAnalytics = useCallback(async () => {
    try {
      const response = await apiService.getSystemAnalytics();
      if (response.success) {
        setSystemAnalytics(response.data);
      }
    } catch (err) {
      console.error('Error loading system analytics:', err);
    }
  }, []);

  const loadElectionAnalytics = useCallback(async (electionId: string) => {
    try {
      const response = await apiService.getElectionAnalytics(electionId);
      if (response.success) {
        setElectionAnalytics(response.data);
      }
    } catch (err) {
      console.error('Error loading election analytics:', err);
    }
  }, []);

  const refreshAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await loadSystemAnalytics();
    } catch (err) {
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [loadSystemAnalytics]);

  useEffect(() => {
    refreshAnalytics();
  }, [refreshAnalytics]);

  return {
    systemAnalytics,
    electionAnalytics,
    loading,
    error,
    refreshAnalytics,
    getElectionAnalytics: loadElectionAnalytics,
  };
};