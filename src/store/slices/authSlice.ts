import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialState: AuthState = {
  user:            null,
  token:           null,
  isAuthenticated: false,
  isLoading:       true, // true on startup while we check localStorage
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user            = action.payload.user;
      state.token           = action.payload.token;
      state.isAuthenticated = true;
      state.isLoading       = false;

      localStorage.setItem('auth_token', action.payload.token);
      localStorage.setItem('auth_user', JSON.stringify(action.payload.user));

      document.cookie = `auth_token=${action.payload.token}; path=/; max-age=${60 * 60 * 24 * 30}`;
    },

    logout: (state) => {
      state.user            = null;
      state.token           = null;
      state.isAuthenticated = false;
      state.isLoading       = false;

      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');

      document.cookie = 'auth_token=; path=/; max-age=0';
    },

    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },

    initializeAuth: (state) => {
      if (typeof window === 'undefined') {
        state.isLoading = false;
        return;
      }

      const token = localStorage.getItem('auth_token');
      const user  = localStorage.getItem('auth_user');

      if (token && user) {
        try {
          state.token           = token;
          state.user            = JSON.parse(user);
          state.isAuthenticated = true;
        } catch {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
        }
      }

      state.isLoading = false;
    },
  },
});

export const { setCredentials, logout, setUser, initializeAuth } = authSlice.actions;
export default authSlice.reducer;