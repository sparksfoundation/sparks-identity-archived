import { storage } from './indexedDb';
import { createJSONStorage, persist } from 'zustand/middleware';
import { create } from 'zustand';

export type Member = {
  nonce: string;
  name: string;
  data: string
}

export interface MemberStore {
  members: Member[];
  getMembers: (state: MemberStore) => Member[];
  addMember: (member: Member) => void;
  removeMember: (nonce: string) => void;
}

export const useMembers = create<MemberStore>()(
  persist((set, get) => ({
    members: [],
    getMembers: () => get().members,
    addMember: (member: Member) => {  
      set({ members: [...get().members, member] })
    },
    removeMember: (nonce: string) => {
      set({ members: get().members.filter(m => m.nonce !== nonce) })
    }
  }), {
    name: 'members',
    version: 1,
    storage: createJSONStorage(() => storage),
  })
);