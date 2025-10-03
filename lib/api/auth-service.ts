/**
 * Authentication API Service
 * Handles all authentication-related API calls
 */

import { apiConfig } from '@/lib/config';
import { dynamicApiManager } from './dynamic-api-manager';
import { 
  LoginCredentials, 
  RegisterData, 
  AuthResponse, 
  User, 
  TokenData 
} from '@/types/auth';

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: ApiError;
}

class AuthService {
  private baseUrl: string;
  private timeout: number;
  private retryAttempts: number;
  private retryDelay: number;

  constructor() {
    this.baseUrl = apiConfig.baseUrl;
    this.timeout = apiConfig.timeout;
    this.retryAttempts = apiConfig.retryAttempts;
    this.retryDelay = apiConfig.retryDelay;
    
    // Register with dynamic API manager
    this.registerWithDynamicManager();
  }

  /**
   * Register this service with the dynamic API manager
   */
  private registerWithDynamicManager(): void {
    dynamicApiManager.registerService('AuthService', {
      updateBaseUrl: (newUrl: string) => {
        this.baseUrl = newUrl;
        console.log(`🔄 AuthService URL updated to: ${newUrl}`);
      },
      getBaseUrl: () => this.baseUrl
    });
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        // Retry on server errors (5xx) or specific client errors (429, 502, 503, 504)
        if (retryCount < this.retryAttempts && 
            (response.status >= 500 || [429, 502, 503, 504].includes(response.status))) {
          await this.delay(this.retryDelay * (retryCount + 1));
          return this.makeRequest<T>(endpoint, options, retryCount + 1);
        }

        return {
          success: false,
          error: {
            message: data.message || 'Request failed',
            status: response.status,
            code: data.code,
          },
        };
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: {
              message: 'Request timeout',
              status: 408,
              code: 'TIMEOUT',
            },
          };
        }
        
        // Retry on network errors
        if (retryCount < this.retryAttempts) {
          await this.delay(this.retryDelay * (retryCount + 1));
          return this.makeRequest<T>(endpoint, options, retryCount + 1);
        }
        
        return {
          success: false,
          error: {
            message: error.message || 'Network error',
            status: 0,
            code: 'NETWORK_ERROR',
          },
        };
      }

      return {
        success: false,
        error: {
          message: 'Unknown error occurred',
          status: 0,
          code: 'UNKNOWN_ERROR',
        },
      };
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private getAuthHeaders(token?: string): Record<string, string> {
    const headers: Record<string, string> = {};
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Login user with email/NIN and password
   */
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.makeRequest<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  /**
   * Register new user
   */
  async register(userData: RegisterData): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.makeRequest<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  /**
   * Logout user
   */
  async logout(token: string): Promise<ApiResponse> {
    return this.makeRequest('/auth/logout', {
      method: 'POST',
      headers: this.getAuthHeaders(token),
    });
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(refreshToken: string): Promise<ApiResponse<{ token: string; refreshToken: string }>> {
    return this.makeRequest<{ token: string; refreshToken: string }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  /**
   * Forgot password - send reset code
   */
  async forgotPassword(email: string): Promise<ApiResponse> {
    return this.makeRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  /**
   * Reset password with OTP
   */
  async resetPassword(email: string, otp: string, newPassword: string): Promise<ApiResponse> {
    return this.makeRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, otp, newPassword }),
    });
  }

  /**
   * Change password (authenticated user)
   */
  async changePassword(
    currentPassword: string, 
    newPassword: string, 
    token: string
  ): Promise<ApiResponse> {
    return this.makeRequest('/auth/change-password', {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  /**
   * Verify NIN
   */
  async verifyNIN(nin: string): Promise<ApiResponse<{ verified: boolean; user?: User }>> {
    return this.makeRequest<{ verified: boolean; user?: User }>('/auth/nin', {
      method: 'POST',
      body: JSON.stringify({ nin }),
    });
  }

  /**
   * Submit NIN for verification
   */
  async submitNIN(nin: string, token: string): Promise<ApiResponse> {
    return this.makeRequest('/auth/submit-nin', {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify({ nin }),
    });
  }

  /**
   * Get current user profile
   */
  async getProfile(token: string): Promise<ApiResponse<User>> {
    return this.makeRequest<User>('/auth/me', {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });
  }

  /**
   * Update user profile
   */
  async updateProfile(
    updates: Partial<User>, 
    token: string
  ): Promise<ApiResponse<User>> {
    return this.makeRequest<User>('/auth/me', {
      method: 'PUT',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(updates),
    });
  }

  /**
   * Delete user account
   */
  async deleteAccount(token: string): Promise<ApiResponse> {
    return this.makeRequest('/auth/account', {
      method: 'DELETE',
      headers: this.getAuthHeaders(token),
    });
  }

  /**
   * Verify email address
   */
  async verifyEmail(token: string, verificationCode: string): Promise<ApiResponse> {
    return this.makeRequest('/auth/verify-email', {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify({ verificationCode }),
    });
  }

  /**
   * Resend email verification
   */
  async resendEmailVerification(token: string): Promise<ApiResponse> {
    return this.makeRequest('/auth/resend-verification', {
      method: 'POST',
      headers: this.getAuthHeaders(token),
    });
  }

  /**
   * Check if email is available
   */
  async checkEmailAvailability(email: string): Promise<ApiResponse<{ available: boolean }>> {
    return this.makeRequest<{ available: boolean }>('/auth/check-email', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  /**
   * Check if phone number is available
   */
  async checkPhoneAvailability(phone: string): Promise<ApiResponse<{ available: boolean }>> {
    return this.makeRequest<{ available: boolean }>('/auth/check-phone', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  }

  /**
   * Get user's voting history
   */
  async getVotingHistory(token: string): Promise<ApiResponse<{ votes: any[] }>> {
    return this.makeRequest<{ votes: any[] }>('/auth/voting-history', {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });
  }

  /**
   * Get user's election participation
   */
  async getElectionParticipation(token: string): Promise<ApiResponse<{ elections: any[] }>> {
    return this.makeRequest<{ elections: any[] }>('/auth/election-participation', {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
