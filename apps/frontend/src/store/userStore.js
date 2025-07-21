import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';

export const useUserStore = create((set) => ({
  user: null,
  isLoaded: false,

  setUser: (user) => set({ user, isLoaded: true }),

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, isLoaded: true });
  },

  restoreSession: () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ user: null, isLoaded: true });
      return;
    }

    try {
      const decoded = jwtDecode(token);
      set({ user: { username: decoded.username, role: decoded.role }, isLoaded: true });
    } catch (err) {
      console.error('Invalid token');
      set({ user: null, isLoaded: true });
    }
  },
}));
