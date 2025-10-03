import { create } from 'zustand';
import { User, AuthState, LoginCredentials, RegisterData, AuthResponse } from '@/types/auth';
import { authService } from '@/lib/api/auth-service';
import { AuthCleanup } from '@/lib/utils/auth-cleanup';

interface AuthStore extends AuthState {
  // Actions
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (data: RegisterData) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  updateUser: (user: Partial<User>) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>()((set, get) => ({
  // Initial state - always starts unauthenticated
  isAuthenticated: false,
  user: null,
  token: null,
  isLoading: false,
  error: null,

  // Actions
  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await authService.login(credentials);

      if (response.success && response.data) {
        set({
          isAuthenticated: true,
          user: response.data.user,
          token: response.data.token,
          isLoading: false,
          error: null,
        });
        return {
          success: response.success,
          message: response.message || 'Login successful',
          data: response.data
        };
      } else {
        const errorMessage = response.error?.message || 'Login failed';
        set({
          isAuthenticated: false,
          user: null,
          token: null,
          isLoading: false,
          error: errorMessage,
        });
        return {
          success: false,
          message: errorMessage,
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      set({
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
        error: errorMessage,
      });
      return {
        success: false,
        message: errorMessage,
      };
    }
  },

  register: async (data: RegisterData) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await authService.register(data);

      if (response.success && response.data) {
        set({
          isAuthenticated: true,
          user: response.data.user,
          token: response.data.token,
          isLoading: false,
          error: null,
        });
        return {
          success: response.success,
          message: response.message || 'Registration successful',
          data: response.data
        };
      } else {
        const errorMessage = response.error?.message || 'Registration failed';
        set({
          isAuthenticated: false,
          user: null,
          token: null,
          isLoading: false,
          error: errorMessage,
        });
        return {
          success: false,
          message: errorMessage,
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      set({
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
        error: errorMessage,
      });
      return {
        success: false,
        message: errorMessage,
      };
    }
  },

  logout: async () => {
    try {
      // Clear all stored authentication data
      await AuthCleanup.clearAllAuthData();
      
      // Reset auth store state
      set({
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
        error: null,
      });
      
      console.log('🔐 Logout completed - all auth data cleared');
    } catch (error) {
      console.error('❌ Error during logout:', error);
      // Still reset the store even if cleanup fails
      set({
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
        error: null,
      });
    }
  },

  refreshToken: async () => {
    const { token } = get();
    if (!token) return false;

    try {
      const response = await authService.refreshToken(token);

      if (response.success && response.data) {
        set({
          token: response.data.token,
          refreshToken: response.data.refreshToken,
        });
        return true;
      } else {
        set({
          isAuthenticated: false,
          user: null,
          token: null,
        });
        return false;
      }
    } catch (error) {
      set({
        isAuthenticated: false,
        user: null,
        token: null,
      });
      return false;
    }
  },

  updateUser: (userData: Partial<User>) => {
    const { user } = get();
    if (user) {
      set({
        user: { ...user, ...userData },
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
}));
