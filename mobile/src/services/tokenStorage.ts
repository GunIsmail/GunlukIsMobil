import * as SecureStore from 'expo-secure-store';

const ACCESS_KEY = 'gunlukis.access';
const REFRESH_KEY = 'gunlukis.refresh';
const USER_KEY = 'gunlukis.user';

export const tokenStorage = {
  async setTokens(access: string, refresh: string) {
    await SecureStore.setItemAsync(ACCESS_KEY, access);
    await SecureStore.setItemAsync(REFRESH_KEY, refresh);
  },
  async getAccessToken() {
    return SecureStore.getItemAsync(ACCESS_KEY);
  },
  async getRefreshToken() {
    return SecureStore.getItemAsync(REFRESH_KEY);
  },
  async setUser(json: string) {
    await SecureStore.setItemAsync(USER_KEY, json);
  },
  async getUser() {
    return SecureStore.getItemAsync(USER_KEY);
  },
  async clear() {
    await SecureStore.deleteItemAsync(ACCESS_KEY);
    await SecureStore.deleteItemAsync(REFRESH_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
  },
};
