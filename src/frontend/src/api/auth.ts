import { apiClient } from './client';

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
  wellness_disclaimer_accepted: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  user_id: string;
  email: string;
  name?: string;
  tier: 'free' | 'basic' | 'pro' | 'proplus';
  wellness_disclaimer_accepted: boolean;
  created_at: string;
  last_login_at?: string;
}

export interface AuthResponse {
  access_token: string;
  expires_in: number;
  user: User;
}

export interface VerifyRequest {
  email: string;
  code: string;
}

export const authApi = {
  register: async (data: RegisterRequest): Promise<User> => {
    const response = await apiClient.post<User>('/v1/auth/register', data);
    return response.data;
  },

  verify: async (data: VerifyRequest): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/v1/auth/verify', data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/v1/auth/login', data);
    // Сохраняем токен
    localStorage.setItem('access_token', response.data.access_token);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/v1/auth/logout');
    localStorage.removeItem('access_token');
  },

  refreshToken: async (): Promise<{ access_token: string; expires_in: number }> => {
    const response = await apiClient.post<{ access_token: string; expires_in: number }>('/v1/auth/refresh');
    localStorage.setItem('access_token', response.data.access_token);
    return response.data;
  },
};






