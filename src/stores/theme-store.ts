import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  theme: 'minimal' | 'dark' | 'gradient' | 'terminal';
  setTheme: (theme: 'minimal' | 'dark' | 'gradient' | 'terminal') => void;
}

const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'minimal',
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'theme-store' }
  )
);

export default useThemeStore;