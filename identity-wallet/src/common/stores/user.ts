import { TIdentity } from '@features/identity';
import { create } from 'zustand';

export type User = {
  user: TIdentity
}

export interface UserStore {
  user: TIdentity | undefined;
  login: (state?: TIdentity) => void;
  logout: () => void;
}

export const useUser = create<UserStore>((set) => ({
  user: undefined,
  login: (user) => {
    return set({ user })
  },
  logout: () => set({ user: undefined }),
}))