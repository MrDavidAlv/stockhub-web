import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import { useAuthStore } from 'src/stores/auth.store';

const baseURL = (import.meta.env.VITE_API_URL as string | undefined) ?? '/api';

const api = axios.create({
  baseURL,
  timeout: 15000,
});

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

api.interceptors.request.use((config) => {
  const auth = useAuthStore();
  if (auth.accessToken) {
    config.headers.set('Authorization', `Bearer ${auth.accessToken}`);
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const auth = useAuthStore();
    const original = error.config as RetriableConfig | undefined;

    const is401 = error.response?.status === 401;
    const isAuthEndpoint = original?.url?.includes('/auth/');
    const canRetry = !!original && !original._retry && !isAuthEndpoint && !!auth.refreshToken;

    if (is401 && canRetry) {
      original._retry = true;
      const refreshed = await auth.tryRefresh();
      if (refreshed) {
        return api.request(original as AxiosRequestConfig);
      }
      auth.clear();
    }
    return Promise.reject(error);
  },
);

export default api;
