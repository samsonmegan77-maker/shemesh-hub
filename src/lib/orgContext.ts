import { createContext, useContext } from 'react';

export type OrgRole = 'full_admin' | 'treasurer' | 'expense_admin';

export interface Organisation {
  id: string;
  name: string;
  short_code: 'southdale' | 'bambanani';
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
}

export interface OrgContextValue {
  organisation: Organisation | null;
  role: OrgRole | null;
  user: UserProfile | null;
  setOrganisation: (org: Organisation | null) => void;
  setRole: (role: OrgRole) => void;
  setUser: (user: UserProfile | null) => void;
  canAccessPayroll: boolean;
  canAccessFinance: boolean;
  canCreateExpenses: boolean;
  canManageDepartments: boolean;
}

export const OrgContext = createContext<OrgContextValue>({
  organisation: null,
  role: null,
  user: null,
  setOrganisation: () => {},
  setRole: () => {},
  setUser: () => {},
  canAccessPayroll: false,
  canAccessFinance: false,
  canCreateExpenses: false,
  canManageDepartments: false,
});

export function useOrg() {
  return useContext(OrgContext);
}

export function derivePermissions(role: OrgRole | null) {
  return {
    canAccessPayroll: role === 'full_admin' || role === 'treasurer',
    canAccessFinance: role === 'full_admin' || role === 'treasurer',
    canCreateExpenses:
      role === 'full_admin' || role === 'treasurer' || role === 'expense_admin',
    canManageDepartments:
      role === 'full_admin' || role === 'expense_admin',
  };
}

/** Demo users matching Karren's list — used until Supabase Auth is live */
export const DEMO_USERS: {
  id: string;
  fullName: string;
  email: string;
  roles: { southdale: OrgRole; bambanani: OrgRole };
}[] = [
  {
    id: 'karren',
    fullName: 'Karren MacKenzie',
    email: 'karren.desiree.mckenzie@gmail.com',
    roles: { southdale: 'full_admin', bambanani: 'full_admin' },
  },
  {
    id: 'carol',
    fullName: 'Carol Lai',
    email: 'carol@example.com',
    roles: { southdale: 'treasurer', bambanani: 'treasurer' },
  },
  {
    id: 'mike',
    fullName: 'Michael Ford Ho',
    email: 'pastor.mike@example.com',
    roles: { southdale: 'expense_admin', bambanani: 'expense_admin' },
  },
];
