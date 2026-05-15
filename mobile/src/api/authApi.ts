import { http } from './http';
import type { AuthResponse, ProfileInfo, UserRole } from '@/types/models';

export const authApi = {
  async register(payload: {
    fullName: string;
    email: string;
    phoneNumber: string;
    password: string;
    role: UserRole;
  }): Promise<AuthResponse> {
    const { data } = await http.post<AuthResponse>('/api/auth/register', payload);
    return data;
  },
  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await http.post<AuthResponse>('/api/auth/login', { email, password });
    return data;
  },
  async getProfile(): Promise<ProfileInfo> {
    const { data } = await http.get<ProfileInfo>('/api/auth/me');
    return data;
  },
  async updateProfile(payload: {
    fullName: string;
    email: string;
    phoneNumber: string;
  }): Promise<ProfileInfo> {
    const { data } = await http.put<ProfileInfo>('/api/auth/me', payload);
    return data;
  },
};
