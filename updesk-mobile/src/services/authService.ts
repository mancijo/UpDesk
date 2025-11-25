import api from '../api/axios';
import { User, ApiResponse } from '../types';

export const authService = {
  login: async (email: string, password: string): Promise<ApiResponse<User>> => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
      localStorage.removeItem('@UpDesk:token');
    } catch (error) {
      throw error;
    }
  },

  refreshToken: async (): Promise<ApiResponse<{ token: string }>> => {
    try {
      const response = await api.post('/auth/refresh-token');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};