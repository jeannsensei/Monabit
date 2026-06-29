import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const TOKEN_KEY = 'monabit-access-token';
const REFRESH_KEY = 'monabit-refresh-token';
const EXPIRES_KEY = 'monabit-expires-at';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setTokens(access_token: string, refresh_token: string, expires_at: number): void {
  localStorage.setItem(TOKEN_KEY, access_token);
  localStorage.setItem(REFRESH_KEY, refresh_token);
  localStorage.setItem(EXPIRES_KEY, String(expires_at));
}

export function clearTokens(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(EXPIRES_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: Error) => void;
}> = [];

function processQueue(error: Error | null, token?: string) {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else if (token) p.resolve(token);
  });
  failedQueue = [];
}

const client: AxiosInstance = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers = { ...original.headers, Authorization: `Bearer ${token}` };
          return client(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${API_BASE}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        setTokens(data.access_token, data.refresh_token, data.expires_at);
        processQueue(null, data.access_token);

        original.headers = { ...original.headers, Authorization: `Bearer ${data.access_token}` };
        return client(original);
      } catch {
        processQueue(new Error('Refresh failed'));
        clearTokens();
        window.location.href = '/login';
        throw new ApiError(401, 'Session expired');
      } finally {
        isRefreshing = false;
      }
    }

    const message = error.response?.data?.error || error.message || 'Request failed';
    throw new ApiError(error.response?.status || 500, message);
  },
);

export async function apiRequest<T>(path: string, options: AxiosRequestConfig = {}): Promise<T> {
  const response = await client({ url: path, ...options });
  return response.data as T;
}
