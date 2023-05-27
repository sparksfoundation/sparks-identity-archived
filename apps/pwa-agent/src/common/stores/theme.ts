import { storage } from './indexedDb';
import { createJSONStorage, persist } from 'zustand/middleware';
import { create } from 'zustand';

export enum Themes {
  dark = 'dark',
  light = 'light',
}

export interface ThemeStore {
  hasHydrated: boolean;
  theme: Themes;
  setHasHydrated: (state: boolean) => void;
  setTheme: (theme: string) => void;
  toggleTheme: () => void;
}

export const useTheme = create<ThemeStore>()(
  persist((set, get) => ({
    theme: Themes.dark,
    hasHydrated: false,
    setHasHydrated: (state) => {
      set({ hasHydrated: state });
    },
    setTheme: (theme: string) => {
      set({ theme } as { theme: Themes });
    },
    toggleTheme: () => {
      set({
        theme: get().theme === Themes.dark ? Themes.light : Themes.dark
      });
    }
  }), {
    name: 'theme',
    version: 1,
    storage: createJSONStorage(() => storage),
    onRehydrateStorage: () => (state) => {
      if (!state) return
      state.setHasHydrated(true)
    }
  })
);