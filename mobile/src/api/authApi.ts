import { http } from './http';
import type { AuthResponse, UserRole } from '@/types/models';

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
};
