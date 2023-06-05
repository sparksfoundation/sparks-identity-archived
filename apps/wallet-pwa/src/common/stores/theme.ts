import { storage } from './indexedDb';
import { createJSONStorage, persist } from 'zustand/middleware';
import { create } from 'zustand';

export enum Themes {
  dark = 'dark',
  light = 'light',
}

export interface ThemeStore {
  theme: Themes;
  setTheme: (theme: string) => void;
  toggleTheme: () => void;
}

export const useTheme = create<ThemeStore>()(
  persist((set, get) => ({
    theme: Themes.dark,
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
  })
);