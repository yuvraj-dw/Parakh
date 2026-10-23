import { apiClient, setAuthToken } from './client';
import { AuthRegistrationRole, TokenResponse, UserResponse } from '../types/api';

export const authApi = {
  register: async (
    email: string,
    password: string,
    role: AuthRegistrationRole = 'CONSUMER'
  ): Promise<UserResponse> => {
    return apiClient.post<UserResponse>('/auth/register', { email, password, role });
  },

  login: async (email: string, password: string): Promise<TokenResponse> => {
    const res = await apiClient.post<TokenResponse>('/auth/login', { email, password });
    if (res?.access_token) {
      setAuthToken(res.access_token);
    }
    return res;
  },

  getMe: async (): Promise<UserResponse> => {
    return apiClient.get<UserResponse>('/auth/me');
  },

  logout: () => {
    setAuthToken(null);
  },
};
