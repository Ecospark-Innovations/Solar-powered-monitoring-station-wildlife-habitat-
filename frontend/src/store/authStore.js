import create from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });

          if (!response.ok) throw new Error('Login failed');

          const data = await response.json();
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            loading: false
          });
          return true;
        } catch (error) {
          set({ error: error.message, loading: false });
          return false;
        }
      },

      register: async (userData) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
          });

          if (!response.ok) throw new Error('Registration failed');

          const data = await response.json();
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            loading: false
          });
          return true;
        } catch (error) {
          set({ error: error.message, loading: false });
          return false;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false
        });
      }
    }),
    {
      name: 'auth-store',
      getStorage: () => localStorage
    }
  )
);
