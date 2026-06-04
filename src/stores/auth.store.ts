import { defineStore } from 'pinia';
import axios from 'axios';
import type { TokenPair, UserInfo } from 'src/types';

const ACCESS_KEY = 'stockhub.accessToken';
const REFRESH_KEY = 'stockhub.refreshToken';
const USER_KEY = 'stockhub.user';

const baseURL = (import.meta.env.VITE_API_URL as string | undefined) ?? '/api';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserInfo | null;
}

function readUser(): UserInfo | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserInfo;
  } catch {
    return null;
  }
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    accessToken: localStorage.getItem(ACCESS_KEY),
    refreshToken: localStorage.getItem(REFRESH_KEY),
    user: readUser(),
  }),

  getters: {
    isAuthenticated: (s) => !!s.accessToken,
    isAdmin: (s) => s.user?.rol === 'ADMIN',
  },

  actions: {
    async login(email: string, password: string) {
      const { data } = await axios.post<TokenPair>(`${baseURL}/auth/login`, { email, password });
      this.applyTokens(data);
    },

    async tryRefresh(): Promise<boolean> {
      if (!this.refreshToken) return false;
      try {
        const { data } = await axios.post<TokenPair>(`${baseURL}/auth/refresh`, {
          refreshToken: this.refreshToken,
        });
        this.applyTokens(data);
        return true;
      } catch {
        return false;
      }
    },

    async logout() {
      const token = this.refreshToken;
      this.clear();
      if (token) {
        try {
          await axios.post(`${baseURL}/auth/logout`, { refreshToken: token });
        } catch {
          // silenciado: el cliente ya quedo deslogueado localmente
        }
      }
    },

    applyTokens(data: TokenPair) {
      this.accessToken = data.accessToken;
      this.refreshToken = data.refreshToken;
      this.user = { email: data.email, nombre: data.nombre, rol: data.rol };
      localStorage.setItem(ACCESS_KEY, data.accessToken);
      localStorage.setItem(REFRESH_KEY, data.refreshToken);
      localStorage.setItem(USER_KEY, JSON.stringify(this.user));
    },

    clear() {
      this.accessToken = null;
      this.refreshToken = null;
      this.user = null;
      localStorage.removeItem(ACCESS_KEY);
      localStorage.removeItem(REFRESH_KEY);
      localStorage.removeItem(USER_KEY);
    },
  },
});
