// Authentication related types
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  name: string; // Computed property: first_name + last_name
  phone_number?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  nin?: string;
  nin_verified?: boolean;
  encrypted_nin?: string;
  hashed_nin?: string;
  aes_encrypted?: string;
  nin_iv?: string;
  user_unique_id?: string;
  wallet_address?: string;
  contract_address?: string;
  profile_picture?: string;
  has_custom_picture?: boolean;
  registration_completed?: boolean;
  is_active: boolean;
  is_verified?: boolean;
  role: UserRole;
  token?: string;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export type UserRole = 'voter';

export interface LoginCredentials {
  emailOrNin: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  // State of Origin
  state_of_origin_id?: string;
  lga_of_origin_id?: string;
  // State of Residence
  state_id?: string;
  lga_id?: string;
  ward_id?: string;
  polling_unit_id?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    token: string;
    refresh_token?: string;
  };
}

export interface TokenData {
  user_id: string;
  email: string;
  role: UserRole;
  exp: number;
  iat: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}
