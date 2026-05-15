import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { config } from '@/config';
import { tokenStorage } from '@/services/tokenStorage';
import type { AuthResponse } from '@/types/models';

export const http = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: 15000,
});

let isRefreshing = false;
let pendingRequests: Array<(token: string | null) => void> = [];

http.interceptors.request.use(async (cfg) => {
  const token = await tokenStorage.getAccessToken();
  if (token) {
    cfg.headers = cfg.headers ?? {};
    cfg.headers.Authorization = `Bearer ${token}`;
  }
  return cfg;
});

let onUnauthorized: () => void = () => {};
export const setUnauthorizedHandler = (handler: () => void) => {
  onUnauthorized = handler;
};

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as AxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status !== 401 || original?._retry) {
      return Promise.reject(error);
    }

    const refreshToken = await tokenStorage.getRefreshToken();
    const accessToken = await tokenStorage.getAccessToken();
    if (!refreshToken || !accessToken) {
      onUnauthorized();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingRequests.push((newToken) => {
          if (!newToken) {
            reject(error);
            return;
          }
          original.headers = original.headers ?? {};
          (original.headers as Record<string, string>).Authorization = `Bearer ${newToken}`;
          original._retry = true;
          resolve(http(original));
        });
      });
    }

    isRefreshing = true;
    try {
      const { data } = await axios.post<AuthResponse>(`${config.apiBaseUrl}/api/auth/refresh`, {
        accessToken,
        refreshToken,
      });
      await tokenStorage.setTokens(data.accessToken, data.refreshToken);
      await tokenStorage.setUser(JSON.stringify(data));
      pendingRequests.forEach((cb) => cb(data.accessToken));
      pendingRequests = [];
      original.headers = original.headers ?? {};
      (original.headers as Record<string, string>).Authorization = `Bearer ${data.accessToken}`;
      original._retry = true;
      return http(original);
    } catch (refreshError) {
      pendingRequests.forEach((cb) => cb(null));
      pendingRequests = [];
      await tokenStorage.clear();
      onUnauthorized();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export const extractError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; details?: string[] } | undefined;
    if (data?.message) {
      return data.details && data.details.length > 0
        ? `${data.message} ${data.details.join(', ')}`
        : data.message;
    }
    return error.message;
  }
  return 'Unexpected error.';
};
