import { create } from 'zustand';

interface OrgState {
  currentOrg: any | null;
  workspaces: any[];
  setOrg: (org: any) => void;
  setWorkspaces: (workspaces: any[]) => void;
}

export const useOrgStore = create<OrgState>((set) => ({
  currentOrg: null,
  workspaces: [],
  setOrg: (org) => set({ currentOrg: org }),
  setWorkspaces: (workspaces) => set({ workspaces }),
}));
