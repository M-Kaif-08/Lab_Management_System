import { create } from 'zustand';
import { StaffUser } from '@lab/contracts';

interface AuthState {
  user: StaffUser | null;
  token: string | null;
  setAuth: (user: StaffUser, token: string) => void;
  logout: () => void;
}

const getStoredUser = (): StaffUser | null => {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  user: getStoredUser(),
  token: localStorage.getItem('token'),
  setAuth: (user, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, token });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null });
  }
}));
