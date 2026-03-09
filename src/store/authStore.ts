import { create } from 'zustand';
import type { UserDto } from '../api/authApi';

interface AuthState {
    user: UserDto | null;
    isAuthenticated: boolean;
    setUser: (user: UserDto | null) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    setUser: (user) => set({ user, isAuthenticated: !!user }),
    logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({ user: null, isAuthenticated: false });
    },
}));
