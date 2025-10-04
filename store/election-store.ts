import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Election, Vote, ElectionFilter, ElectionResults } from '@/types/election';
import { apiConfig } from '@/lib/config';

interface ElectionState {
  // Data
  elections: Election[];
  currentElection: Election | null;
  electionResults: ElectionResults | null;
  userVotes: Vote[];
  filters: ElectionFilter;
  
  // UI State
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
}

interface ElectionStore extends ElectionState {
  // Actions
  fetchElections: (refresh?: boolean) => Promise<void>;
  fetchElectionById: (id: string) => Promise<void>;
  fetchElectionResults: (electionId: string) => Promise<void>;
  castVote: (electionId: string, candidateId: string, position?: number) => Promise<{ success: boolean; message?: string }>;
  fetchUserVotes: () => Promise<void>;
  setFilters: (filters: Partial<ElectionFilter>) => void;
  clearFilters: () => void;
  setCurrentElection: (election: Election | null) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  refreshElections: () => Promise<void>;
}

const initialState: ElectionState = {
  elections: [],
  currentElection: null,
  electionResults: null,
  userVotes: [],
  filters: {} as ElectionFilter,
  isLoading: false,
  error: null,
  lastUpdated: null,
  currentPage: 1,
  totalPages: 1,
  hasMore: false,
};

export const useElectionStore = create<ElectionStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      fetchElections: async (refresh = false) => {
        const { filters, currentPage, isLoading } = get();
        
        if (isLoading) return;
        
        set({ isLoading: true, error: null });
        
        try {
          const queryParams = new URLSearchParams();
          
          if (filters.state) queryParams.append('state', filters.state);
          if (filters.type) queryParams.append('type', filters.type);
          if (filters.status) queryParams.append('status', filters.status);
          if (filters.search) queryParams.append('search', filters.search);
          queryParams.append('page', refresh ? '1' : currentPage.toString());
          queryParams.append('limit', '10');

          const response = await fetch(`${apiConfig.baseUrl}/elections?${queryParams}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          const data = await response.json();

          if (data.success) {
            const newElections = data.data.elections || [];
            const currentElections = refresh ? [] : get().elections;
            
            set({
              elections: refresh ? newElections : [...currentElections, ...newElections],
              currentPage: refresh ? 1 : currentPage + 1,
              totalPages: data.data.pagination?.totalPages || 1,
              hasMore: data.data.pagination?.hasMore || false,
              isLoading: false,
              error: null,
              lastUpdated: new Date().toISOString(),
            });
          } else {
            set({
              isLoading: false,
              error: data.message || 'Failed to fetch elections',
            });
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Network error';
          set({
            isLoading: false,
            error: errorMessage,
          });
        }
      },

      fetchElectionById: async (id: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Import here to avoid circular dependency
          const { useAuthStore } = await import('@/store/auth-store');
          const { token } = useAuthStore.getState();
          
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
          };
          
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }
          
          const response = await fetch(`${apiConfig.baseUrl}/elections/${id}`, {
            method: 'GET',
            headers,
          });

          const data = await response.json();

          if (data.success) {
            set({
              currentElection: data.data,
              isLoading: false,
              error: null,
            });
          } else {
            set({
              currentElection: null,
              isLoading: false,
              error: data.message || 'Failed to fetch election',
            });
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Network error';
          set({
            currentElection: null,
            isLoading: false,
            error: errorMessage,
          });
        }
      },

      fetchElectionResults: async (electionId: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Import here to avoid circular dependency
          const { useAuthStore } = await import('@/store/auth-store');
          const { token } = useAuthStore.getState();
          
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
          };
          
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }
          
          const response = await fetch(`${apiConfig.baseUrl}/elections/${electionId}/results`, {
            method: 'GET',
            headers,
          });

          const data = await response.json();

          if (data.success) {
            set({
              electionResults: data.data,
              isLoading: false,
              error: null,
            });
          } else {
            set({
              electionResults: null,
              isLoading: false,
              error: data.message || 'Failed to fetch results',
            });
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Network error';
          set({
            electionResults: null,
            isLoading: false,
            error: errorMessage,
          });
        }
      },

      castVote: async (electionId: string, candidateId: string, position: number = 1) => {
        // Import here to avoid circular dependency
        const { useAuthStore } = await import('@/store/auth-store');
        const { token } = useAuthStore.getState();
        
        if (!token) {
          set({ error: 'Not authenticated' });
          return { success: false, message: 'Not authenticated' };
        }

        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch(`${apiConfig.baseUrl}/elections/${electionId}/vote`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              candidate_id: candidateId,
              sequential_position: position,
            }),
          });

          const data = await response.json();

          if (data.success) {
            // Add vote to user votes
            const { user } = useAuthStore.getState();
            const newVote: Vote = {
              _id: data.data.vote_id,
              voter_id: user?.id || '',
              election_id: electionId,
              candidate_id: candidateId,
              sequential_position: position,
              vote_timestamp: new Date().toISOString(),
              status: 'success',
              transaction_hash: data.data.transaction_hash,
              block_number: data.data.block_number,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };

            set({
              userVotes: [...get().userVotes, newVote],
              isLoading: false,
              error: null,
            });
            return { success: true };
          } else {
            set({
              isLoading: false,
              error: data.message || 'Failed to cast vote',
            });
            return { success: false, message: data.message || 'Failed to cast vote' };
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Network error';
          set({
            isLoading: false,
            error: errorMessage,
          });
          return { success: false, message: errorMessage };
        }
      },

      fetchUserVotes: async () => {
        // Import here to avoid circular dependency
        const { useAuthStore } = await import('@/store/auth-store');
        const { token } = useAuthStore.getState();
        
        if (!token) {
          set({ error: 'Not authenticated' });
          return;
        }

        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch(`${apiConfig.baseUrl}/votes/user`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          const data = await response.json();

          if (data.success) {
            set({
              userVotes: data.data || [],
              isLoading: false,
              error: null,
            });
          } else {
            set({
              userVotes: [],
              isLoading: false,
              error: data.message || 'Failed to fetch votes',
            });
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Network error';
          set({
            userVotes: [],
            isLoading: false,
            error: errorMessage,
          });
        }
      },

      setFilters: (newFilters: Partial<ElectionFilter>) => {
        set({
          filters: { ...get().filters, ...newFilters },
          currentPage: 1,
        });
      },

      clearFilters: () => {
        set({
          filters: {} as ElectionFilter,
          currentPage: 1,
        });
      },

      setCurrentElection: (election: Election | null) => {
        set({ currentElection: election });
      },

      clearError: () => {
        set({ error: null });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      refreshElections: async () => {
        await get().fetchElections(true);
      },
    }),
    {
      name: 'election-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        elections: state.elections,
        userVotes: state.userVotes,
        filters: state.filters,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
);
