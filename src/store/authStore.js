import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      
      setAuth: (user, accessToken, refreshToken) => {
        console.log('🔐 [AuthStore] Setting auth for user:', user?.username);
        
        const transformedUser = user ? {
          ...user,
          _id: user.id || user._id,
          id: undefined
        } : null;
        

        set({ 
          user: transformedUser, 
          accessToken, 
          refreshToken 
        });
        

        if (accessToken) localStorage.setItem('accessToken', accessToken);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      },
      
      // setUser: (user) => set({ user }),
      setUser: (updatedUser) => set({ user: updatedUser }),

      
      
      logout: () => {
        console.log('🔐 [AuthStore] Logging out');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({ user: null, accessToken: null, refreshToken: null });
      },
    }),
    {
      name: 'auth-storage',

      getStorage: () => localStorage, // Use localStorage
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken
      }),
    }
  )
);

if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('auth-storage');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      console.log('📦 [AuthStore] Loaded from storage:', {
        hasUser: !!parsed.state?.user,
        hasToken: !!parsed.state?.accessToken
      });


      if (!parsed.state?.accessToken) {
        const backupToken = localStorage.getItem('accessToken');
        if (backupToken) {
          parsed.state.accessToken = backupToken;
          localStorage.setItem('auth-storage', JSON.stringify(parsed));
        }
      }
    } catch (e) {
      console.error('Error parsing auth storage', e);
    }
  }
}
