import { create } from 'zustand';
import { tokenStorage } from '@/services/tokenStorage';
import type { AuthResponse } from '@/types/models';

interface AuthState {
  user: AuthResponse | null;
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  signIn: (auth: AuthResponse) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isHydrated: false,
  hydrate: async () => {
    const raw = await tokenStorage.getUser();
    set({ user: raw ? (JSON.parse(raw) as AuthResponse) : null, isHydrated: true });
  },
  signIn: async (auth) => {
    await tokenStorage.setTokens(auth.accessToken, auth.refreshToken);
    await tokenStorage.setUser(JSON.stringify(auth));
    set({ user: auth });
  },
  signOut: async () => {
    await tokenStorage.clear();
    set({ user: null });
  },
}));
