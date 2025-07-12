import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';

export const useUserStore = create((set) => ({
  user: null,
  token: null,

  login: (token) => {
    const decoded = jwtDecode(token);
    set({ token, user: decoded });
    localStorage.setItem('sims_token', token);
  },

  logout: () => {
    set({ user: null, token: null });
    localStorage.removeItem('sims_token');
  },

  restoreSession: () => {
    const token = localStorage.getItem('sims_token');
    if (token) {
      const decoded = jwtDecode(token);
      set({ token, user: decoded });
    }
  }
}));
