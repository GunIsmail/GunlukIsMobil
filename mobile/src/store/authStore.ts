import { create } from 'zustand';
import { tokenStorage } from '@/services/tokenStorage';
import type { AuthResponse, ProfileInfo } from '@/types/models';

interface AuthState {
  user: AuthResponse | null;
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  signIn: (auth: AuthResponse) => Promise<void>;
  signOut: () => Promise<void>;
  patchProfile: (info: ProfileInfo) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
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
  patchProfile: async (info) => {
    const current = get().user;
    if (!current) return;
    const updated: AuthResponse = { ...current, fullName: info.fullName, email: info.email };
    await tokenStorage.setUser(JSON.stringify(updated));
    set({ user: updated });
  },
}));
