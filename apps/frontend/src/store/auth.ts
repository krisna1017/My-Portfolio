import { create } from 'zustand';
import type { AdminUser } from '@/lib/api';

interface AuthState {
  user: AdminUser | null;
  setUser: (user: AdminUser | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}));
